// ============================================================
// ScamGuard — Telegram Bot + Enriched Alerts
// Handles user registration (/start) and mid-call alerts
// See PRD §5.3
// ============================================================

import TelegramBot from "node-telegram-bot-api";
import config from "./config.js";
import { registerUser, findUserByChatId } from "./user-store.js";

let bot = null;

/**
 * Initialize the Telegram bot.
 * Sets up /start command for user registration.
 */
export function initBot() {
  if (config.nodeEnv === "test") return;

  bot = new TelegramBot(config.telegramBotToken, { polling: true });

  // ── /start — User registration ────────────────────────────
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || "User";

    await bot.sendMessage(
      chatId,
      `👋 Welcome to *ScamGuard*, ${name}!\n\n` +
        `I monitor your phone calls in real time and alert you if I detect a scam.\n\n` +
        `To get started, share your phone number using the button below.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          keyboard: [[{ text: "📱 Share Phone Number", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
  });

  // ── Phone number shared via contact ───────────────────────
  bot.on("contact", async (msg) => {
    const chatId = msg.chat.id;
    const contact = msg.contact;

    if (contact.user_id !== msg.from.id) {
      await bot.sendMessage(chatId, "⚠️ Please share your *own* phone number.", {
        parse_mode: "Markdown",
      });
      return;
    }

    try {
      const phone = contact.phone_number.startsWith("+")
        ? contact.phone_number
        : "+" + contact.phone_number;

      await registerUser(phone, chatId, msg.from.first_name || "User");

      await bot.sendMessage(
        chatId,
        `✅ *Registration complete!*\n\n` +
          `📞 Phone: \`${phone}\`\n` +
          `🛡️ ScamGuard is now monitoring your calls.\n\n` +
          `You'll receive real-time alerts here if we detect suspicious activity during a call.`,
        { parse_mode: "Markdown" }
      );
    } catch (err) {
      console.error("[Telegram] Registration error:", err.message);
      await bot.sendMessage(
        chatId,
        "❌ Registration failed. Please try again later."
      );
    }
  });

  // ── /status — Check registration ──────────────────────────
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    const user = await findUserByChatId(chatId);

    if (user) {
      await bot.sendMessage(
        chatId,
        `🛡️ *ScamGuard Status*\n\n` +
          `✅ Registered: ${user.name}\n` +
          `📞 Phone: \`${user.phone_number}\`\n` +
          `📅 Since: ${new Date(user.created_at).toLocaleDateString()}`,
        { parse_mode: "Markdown" }
      );
    } else {
      await bot.sendMessage(
        chatId,
        "⚠️ You are not registered. Send /start to begin."
      );
    }
  });

  console.log("[Telegram] Bot initialized and polling for messages");
  return bot;
}

/**
 * Send an enriched alert to a user's Telegram chat.
 *
 * Alert fields include (per PRD §5.3):
 * - Campaign name + report count
 * - PRD-2 composite score
 * - Dynamic flags from PRD-1
 * - UPI IDs found + PRD-2 block status
 *
 * @param {number} chatId - Telegram chat ID
 * @param {"warning"|"high"|"danger"} severity - Alert severity
 * @param {object} prd1Result - PRD-1 analysis result
 * @param {string} callerNumber - Caller's phone number
 */
export async function sendTelegramAlert(chatId, severity, prd1Result, callerNumber) {
  if (!bot) {
    console.warn("[Telegram] Bot not initialized — alert skipped");
    return;
  }

  const message = buildAlertMessage(severity, prd1Result, callerNumber);

  try {
    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
    console.log(`[Telegram] ${severity.toUpperCase()} alert sent to chatId ${chatId}`);
  } catch (err) {
    console.error("[Telegram] Failed to send alert:", err.message);
  }
}

/**
 * Build the formatted alert message based on severity.
 */
function buildAlertMessage(severity, result, callerNumber) {
  const score = result._compositeScore || result.risk_score || 0;
  const scorePercent = (score * 100).toFixed(0);

  // Header based on severity
  const headers = {
    warning: "🟡 *WARNING — Suspicious Call Detected*",
    high: "🟠 *HIGH ALERT — Strong Scam Indicators*",
    danger: "🔴 *DANGER — Almost Certainly a Scam!*",
  };

  // Action based on severity
  const actions = {
    warning: "⚡ *Stay alert.* Do not share personal information.",
    high: "🚫 *Do NOT share any personal or financial info!*",
    danger: "📵 *HANG UP IMMEDIATELY!* This is almost certainly a scam.",
  };

  let msg = `${headers[severity]}\n\n`;
  msg += `📞 Caller: \`${callerNumber}\`\n`;
  msg += `⚠️ Risk Score: *${scorePercent}%*\n`;

  // Campaign info (from PRD-1)
  if (result.campaign) {
    msg += `\n🏷️ *Campaign:* ${result.campaign.campaign_name || "Unknown"}`;
    if (result.campaign.report_count) {
      msg += ` (${result.campaign.report_count} reports)`;
    }
    msg += "\n";
  }

  // Scam type
  if (result.scam_type) {
    msg += `🎯 *Scam Type:* ${result.scam_type}\n`;
  }

  // Flags
  if (result.flags && Object.keys(result.flags).length > 0) {
    const flagList = Object.entries(result.flags)
      .filter(([, v]) => v === true)
      .map(([k]) => `• ${formatFlag(k)}`);

    if (flagList.length > 0) {
      msg += `\n🚩 *Red Flags:*\n${flagList.join("\n")}\n`;
    }
  }

  // UPI IDs found on call
  if (result.entities?.upi_ids?.length > 0) {
    msg += `\n💳 *UPI IDs mentioned on call:*\n`;
    for (const upi of result.entities.upi_ids) {
      msg += `• \`${upi}\``;
      if (result._riskLevel === "HIGH") {
        msg += " ⛔ BLOCKED";
      }
      msg += "\n";
    }
  }

  msg += `\n${actions[severity]}`;

  return msg;
}

/**
 * Format a flag key into human-readable text.
 * e.g., "urgency_pressure" → "Urgency / Pressure"
 */
function formatFlag(key) {
  return key
    .replace(/_/g, " / ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export { bot };
