// ============================================================
// ScamGuard — Call Manager (Supabase)
// Tracks active calls + persists completed call history
// ============================================================

import supabase from "./db.js";

/**
 * Start tracking a new call.
 */
export async function startCall(callSid, callerNumber, calledNumber, userName = "Unknown", userChatId = null) {
  const { data, error } = await supabase
    .from("calls")
    .insert({
      call_sid: callSid,
      caller_number: callerNumber,
      called_number: calledNumber,
      user_name: userName,
      user_chat_id: userChatId,
      status: "active",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("[CallManager] startCall failed:", error.message);
    throw error;
  }

  console.log(`[CallManager] Call started: ${callSid} from ${callerNumber}`);
  return data;
}

/**
 * Update risk assessment for an active call (called after each PRD-1 analysis).
 */
export async function updateCallRisk(callSid, updates) {
  const {
    riskLevel,
    score,
    campaignId,
    campaignName,
    scamType,
    verdict,
    alertsSent,
    highestAlertSent,
    flags,
    entities,
    transcriptLength,
  } = updates;

  const updateData = {};
  if (riskLevel !== undefined) updateData.current_risk_level = riskLevel;
  if (score !== undefined) updateData.current_score = score;
  if (campaignId !== undefined) updateData.campaign_id = campaignId;
  if (campaignName !== undefined) updateData.campaign_name = campaignName;
  if (scamType !== undefined) updateData.scam_type = scamType;
  if (verdict !== undefined) updateData.verdict = verdict;
  if (alertsSent !== undefined) updateData.alerts_sent = alertsSent;
  if (highestAlertSent !== undefined) updateData.highest_alert_sent = highestAlertSent;
  if (flags !== undefined) updateData.flags = flags;
  if (entities !== undefined) updateData.entities = entities;
  if (transcriptLength !== undefined) updateData.transcript_length = transcriptLength;

  const { data, error } = await supabase
    .from("calls")
    .update(updateData)
    .eq("call_sid", callSid)
    .select()
    .single();

  if (error) {
    console.error("[CallManager] updateCallRisk failed:", error.message);
    return null;
  }

  return data;
}

/**
 * End a call — move to "completed" status with final metrics.
 */
export async function endCall(callSid) {
  const now = new Date();

  // First get the call to compute duration
  const { data: call } = await supabase
    .from("calls")
    .select("started_at")
    .eq("call_sid", callSid)
    .single();

  const durationSeconds = call
    ? Math.round((now - new Date(call.started_at)) / 1000)
    : 0;

  const { data, error } = await supabase
    .from("calls")
    .update({
      status: "completed",
      ended_at: now.toISOString(),
      duration_seconds: durationSeconds,
    })
    .eq("call_sid", callSid)
    .select()
    .single();

  if (error) {
    console.error("[CallManager] endCall failed:", error.message);
    return null;
  }

  console.log(`[CallManager] Call ended: ${callSid} (${durationSeconds}s)`);
  return data;
}

/**
 * Get all currently active calls.
 * Response format matches PRD §7.1 GET /api/v1/calls/active
 */
export async function getActiveCalls() {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("status", "active")
    .order("started_at", { ascending: false });

  if (error) {
    console.error("[CallManager] getActiveCalls failed:", error.message);
    return [];
  }

  return data.map(formatCallForApi);
}

/**
 * Get completed call history with optional filters.
 * Response format matches PRD §7.2 GET /api/v1/calls/history
 */
export async function getCallHistory({ limit = 50, from, scamType } = {}) {
  let query = supabase
    .from("calls")
    .select("*")
    .eq("status", "completed")
    .order("ended_at", { ascending: false })
    .limit(limit);

  if (from) {
    query = query.gte("ended_at", from);
  }
  if (scamType) {
    query = query.eq("scam_type", scamType);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[CallManager] getCallHistory failed:", error.message);
    return { calls: [], total: 0 };
  }

  return {
    calls: data.map(formatHistoryForApi),
    total: data.length,
  };
}

/**
 * Get a specific call by call_sid (used internally).
 */
export async function getCallBySid(callSid) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("call_sid", callSid)
    .maybeSingle();

  if (error) {
    console.error("[CallManager] getCallBySid failed:", error.message);
    return null;
  }

  return data;
}

// ── Format helpers ──────────────────────────────────────────

function formatCallForApi(call) {
  return {
    call_sid: call.call_sid,
    caller_number: call.caller_number,
    called_number: call.called_number,
    user_name: call.user_name,
    started_at: call.started_at,
    transcript_length: call.transcript_length || 0,
    current_risk_level: call.current_risk_level,
    current_score: parseFloat(call.current_score) || 0,
    alerts_sent: call.alerts_sent || 0,
    campaign_name: call.campaign_name || null,
    scam_type: call.scam_type || null,
  };
}

function formatHistoryForApi(call) {
  return {
    call_sid: call.call_sid,
    caller_number: call.caller_number,
    verdict: call.verdict,
    final_risk_level: call.current_risk_level,
    scam_type: call.scam_type || null,
    campaign_id: call.campaign_id || null,
    campaign_name: call.campaign_name || null,
    duration_seconds: call.duration_seconds || 0,
    telegram_alerts_sent: call.alerts_sent || 0,
    ended_at: call.ended_at,
  };
}
