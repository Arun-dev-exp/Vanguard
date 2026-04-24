// ============================================================
// ScamGuard — Main Server
// Fastify app with Twilio media stream, Deepgram STT,
// PRD-1/PRD-2 analysis pipeline, and WebSocket broadcasting
// ============================================================

import Fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyFormBody from "@fastify/formbody";
import fastifyWebSocket from "@fastify/websocket";

import config from "./config.js";
import { initBot, sendTelegramAlert } from "./telegram.js";
import { analyzeTranscript } from "./analyzer.js";
import { mapRiskLevel, getAlertSeverity, hasUpiIds, shouldReportCaller } from "./risk-mapper.js";
import { createDeepgramStream } from "./deepgram.js";
import { startCall, updateCallRisk, endCall, getCallBySid } from "./call-manager.js";
import { findUserByPhone } from "./user-store.js";
import {
  addClient,
  broadcastCallStarted,
  broadcastRiskEscalated,
  broadcastCallEnded,
} from "./ws-broadcaster.js";

// ── Route modules ───────────────────────────────────────────
import healthRoutes from "../routes/health.js";
import callRoutes from "../routes/calls.js";
import incomingCallRoutes from "../routes/incoming-call.js";

// ── Build the server ────────────────────────────────────────
const fastify = Fastify({
  logger: {
    level: config.nodeEnv === "production" ? "info" : "debug",
    transport:
      config.nodeEnv !== "production"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
  },
});

async function buildServer() {
  // ── Plugins ─────────────────────────────────────────────
  await fastify.register(fastifyCors, {
    origin: true, // Allow all origins (PRD-3 needs access)
  });
  await fastify.register(fastifyFormBody);
  await fastify.register(fastifyWebSocket);

  // ── REST Routes ─────────────────────────────────────────
  await fastify.register(healthRoutes);
  await fastify.register(callRoutes);
  await fastify.register(incomingCallRoutes);

  // ── WebSocket: PRD-3 SOC Dashboard connection ───────────
  // PRD §7.3: ws://host/ws/calls
  fastify.get("/ws/calls", { websocket: true }, (socket, req) => {
    addClient(socket);
  });

  // ── WebSocket: Twilio Media Stream ──────────────────────
  // Receives real-time audio from Twilio, pipes to Deepgram,
  // runs the full analysis pipeline
  fastify.get("/media-stream", { websocket: true }, (socket, req) => {
    handleMediaStream(socket);
  });

  return fastify;
}

// ============================================================
// Twilio Media Stream Handler
// This is the core orchestration — where all the PRD-4 magic happens
// ============================================================

function handleMediaStream(socket) {
  let callSid = null;
  let callerNumber = "";
  let calledNumber = "";
  let streamSid = null;

  // Transcript buffer
  let transcriptBuffer = "";
  let wordCount = 0;
  let highestAlertSent = 0;
  let alertsSent = 0;

  // Deepgram stream (created on first audio chunk)
  let dgStream = null;

  socket.on("message", async (message) => {
    try {
      const msg = JSON.parse(message.toString());

      switch (msg.event) {
        case "start": {
          // Twilio sends metadata when stream starts
          streamSid = msg.start.streamSid;
          callSid = msg.start.customParameters?.callSid || msg.start.callSid || `call_${Date.now()}`;
          callerNumber = msg.start.customParameters?.callerNumber || "";
          calledNumber = msg.start.customParameters?.calledNumber || "";

          console.log(`[MediaStream] Call started: ${callSid} from ${callerNumber}`);

          // Look up the user receiving this call
          const user = await findUserByPhone(calledNumber);

          // Track the call in Supabase
          await startCall(
            callSid,
            callerNumber,
            calledNumber,
            user?.name || "Unknown",
            user?.chat_id || null
          );

          // Broadcast to PRD-3
          broadcastCallStarted(callSid, callerNumber, calledNumber);

          // Start Deepgram transcription stream
          dgStream = createDeepgramStream(
            (text, isFinal) => {
              if (isFinal) {
                transcriptBuffer += " " + text;
                wordCount += text.split(/\s+/).length;

                // Trigger analysis every ~40 words (per PRD §4)
                if (wordCount >= config.transcriptChunkSize) {
                  runAnalysisPipeline(
                    callSid,
                    callerNumber,
                    calledNumber,
                    transcriptBuffer.trim(),
                    user
                  );
                  wordCount = 0;
                }
              }
            },
            (err) => {
              console.error(`[MediaStream] Deepgram error for ${callSid}:`, err);
            }
          );

          break;
        }

        case "media": {
          // Forward audio to Deepgram
          if (dgStream && msg.media?.payload) {
            const audioBuffer = Buffer.from(msg.media.payload, "base64");
            dgStream.send(audioBuffer);
          }
          break;
        }

        case "stop": {
          console.log(`[MediaStream] Call ended: ${callSid}`);
          await handleCallEnd(callSid);
          break;
        }
      }
    } catch (err) {
      console.error("[MediaStream] Message handling error:", err);
    }
  });

  socket.on("close", async () => {
    console.log(`[MediaStream] Socket closed for call: ${callSid}`);
    if (dgStream) dgStream.close();
    if (callSid) await handleCallEnd(callSid);
  });

  socket.on("error", (err) => {
    console.error(`[MediaStream] Socket error for call ${callSid}:`, err.message);
  });

  // ── Analysis Pipeline ───────────────────────────────────
  // Called every ~40 words of finalized transcript
  async function runAnalysisPipeline(sid, caller, called, transcript, user) {
    try {
      // Step 1: PRD-1 analysis
      const prd1Result = await analyzeTranscript(transcript, caller);

      if (prd1Result._fallback) {
        // PRD-1 is down — update transcript length but skip analysis
        await updateCallRisk(sid, {
          transcriptLength: transcript.length,
        });
        return;
      }

      // Step 2: If UPI IDs found, check via PRD-2 (PRD §5.2 Step A)
      if (hasUpiIds(prd1Result)) {
        const upi = prd1Result.entities.upi_ids[0];
        try {
          const payCheck = await fetch(
            `${config.prd2BaseUrl}/api/v1/payment/check`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                upi_id: upi,
                amount: 0,
                user_id: user?.chat_id?.toString() || "unknown",
              }),
              signal: AbortSignal.timeout(5000),
            }
          );
          const payData = await payCheck.json();
          prd1Result._riskLevel = payData.risk_level;
          prd1Result._compositeScore = payData.composite_score;
        } catch (err) {
          console.warn("[Pipeline] PRD-2 payment/check failed:", err.message);
          // Continue without PRD-2 override
        }
      }

      // Step 3: Map risk level (PRD §5.2 Step B)
      const { riskLevel, score } = mapRiskLevel(prd1Result);

      // Step 4: Determine alert severity and send Telegram alert
      const { severity, tier } = getAlertSeverity(riskLevel, score, highestAlertSent);

      if (severity && user?.chat_id) {
        highestAlertSent = tier;
        alertsSent++;
        await sendTelegramAlert(user.chat_id, severity, prd1Result, caller);
      }

      // Step 5: Report caller to PRD-2 entity registry if FRAUD (PRD §5.2 Step C)
      if (shouldReportCaller(prd1Result) && caller) {
        reportCallerToRegistry(caller, prd1Result).catch((err) => {
          console.warn("[Pipeline] PRD-2 report failed (non-blocking):", err.message);
        });
      }

      // Step 6: Update call record in Supabase
      await updateCallRisk(sid, {
        riskLevel,
        score,
        campaignId: prd1Result.campaign?.campaign_id || null,
        campaignName: prd1Result.campaign?.campaign_name || null,
        scamType: prd1Result.scam_type,
        verdict: prd1Result.verdict,
        alertsSent,
        highestAlertSent,
        flags: prd1Result.flags,
        entities: prd1Result.entities,
        transcriptLength: transcript.length,
      });

      // Step 7: Broadcast risk escalation to PRD-3 (if severity changed)
      if (severity) {
        broadcastRiskEscalated(
          sid,
          riskLevel,
          score,
          prd1Result.campaign?.campaign_name || null,
          alertsSent
        );
      }
    } catch (err) {
      console.error(`[Pipeline] Analysis failed for ${sid}:`, err);
    }
  }

  // ── Handle call end ─────────────────────────────────────
  async function handleCallEnd(sid) {
    if (!sid) return;

    try {
      // Close Deepgram stream
      if (dgStream) {
        dgStream.close();
        dgStream = null;
      }

      // Run final analysis on remaining transcript
      if (transcriptBuffer.trim().length > 0) {
        const user = await findUserByPhone(calledNumber);
        await runAnalysisPipeline(
          sid,
          callerNumber,
          calledNumber,
          transcriptBuffer.trim(),
          user
        );
      }

      // End the call in Supabase
      const completedCall = await endCall(sid);

      // Broadcast to PRD-3
      if (completedCall) {
        broadcastCallEnded(
          sid,
          completedCall.duration_seconds || 0,
          completedCall.current_risk_level || "LOW",
          completedCall.alerts_sent || 0
        );
      }
    } catch (err) {
      console.error(`[MediaStream] handleCallEnd error for ${sid}:`, err);
    }
  }
}

// ============================================================
// Report caller phone number to PRD-2 entity registry
// PRD §5.2 Step C — gracefully degrades if PHONE type not supported
// ============================================================

async function reportCallerToRegistry(callerNumber, prd1Result) {
  const response = await fetch(
    `${config.prd2BaseUrl}/api/v1/action/report`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity_value: callerNumber,
        entity_type: "PHONE",
        reason: `Linked to ${prd1Result.campaign?.campaign_name || prd1Result.scam_type || "scam"} via live call`,
        reported_by: "scamguard_call_monitor",
      }),
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.warn(
      `[Registry] PRD-2 report returned ${response.status}: ${text}`
    );
  } else {
    console.log(`[Registry] Reported caller ${callerNumber} to PRD-2`);
  }
}

// ============================================================
// Start the server
// ============================================================

async function main() {
  try {
    const app = await buildServer();

    // Initialize Telegram bot
    initBot();

    // Start listening
    await app.listen({ port: config.port, host: config.host });

    console.log(`\n🛡️  ScamGuard server running on http://${config.host}:${config.port}`);
    console.log(`   📡  WebSocket:  ws://${config.host}:${config.port}/ws/calls`);
    console.log(`   🏥  Health:     http://${config.host}:${config.port}/health`);
    console.log(`   📞  Twilio:     POST /incoming-call`);
    console.log(`   📊  Active:     GET /api/v1/calls/active`);
    console.log(`   📜  History:    GET /api/v1/calls/history\n`);
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n⏹️  ${signal} received — shutting down gracefully...`);
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

main();

export { buildServer };
