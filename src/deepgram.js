// ============================================================
// ScamGuard — Deepgram Streaming STT Client
// Creates and manages live transcription sessions
// Config: nova-2 model, en-IN language (per PRD §12)
// ============================================================

import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import config from "./config.js";

let deepgramClient = null;

/**
 * Get or create the Deepgram client singleton.
 */
function getClient() {
  if (!deepgramClient) {
    deepgramClient = createClient(config.deepgramApiKey);
  }
  return deepgramClient;
}

/**
 * Create a new Deepgram live transcription stream.
 *
 * @param {function} onTranscript - Called with (text, isFinal) on each transcription result
 * @param {function} onError - Called on transcription error
 * @returns {{ send: function, close: function }}
 */
export function createDeepgramStream(onTranscript, onError = console.error) {
  const client = getClient();

  const connection = client.listen.live({
    model: "nova-2",
    language: "en-IN",
    smart_format: true,
    encoding: "mulaw",
    sample_rate: 8000,
    channels: 1,
    interim_results: true,
    utterance_end_ms: 1000,
    vad_events: true,
  });

  connection.on(LiveTranscriptionEvents.Open, () => {
    console.log("[Deepgram] Connection opened");
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data) => {
    const transcript = data.channel?.alternatives?.[0]?.transcript;
    if (transcript && transcript.trim().length > 0) {
      const isFinal = data.is_final || false;
      onTranscript(transcript.trim(), isFinal);
    }
  });

  connection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error("[Deepgram] Error:", err);
    onError(err);
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    console.log("[Deepgram] Connection closed");
  });

  return {
    /**
     * Send raw audio data (mulaw 8kHz) to Deepgram.
     * @param {Buffer} audioBuffer - Raw audio bytes
     */
    send(audioBuffer) {
      try {
        if (connection.getReadyState() === 1) {
          connection.send(audioBuffer);
        }
      } catch (err) {
        console.error("[Deepgram] Send error:", err.message);
      }
    },

    /**
     * Close the transcription stream.
     */
    close() {
      try {
        connection.requestClose();
      } catch (err) {
        console.error("[Deepgram] Close error:", err.message);
      }
    },
  };
}
