"""
Project Vanguard — Telegram Bot Handlers
All user-facing interactions: /start, /help, /lang, and message analysis.
Uses the real NLP engine — no mock data.
"""

from __future__ import annotations

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes

from .config import get_logger
from .languages import SUPPORTED_LANGUAGES, get_user_language, set_user_language, t
from .nlp.analyzer import analyze_message as nlp_analyze

logger = get_logger("vanguard_bot.handlers")


# ── Format the analysis result ─────────────────────────────────

def _format_result(data: dict, uid: int) -> str:
    """Build a rich Telegram response from the NLP analysis result."""
    is_scam = data.get("is_scam", False)
    scam_type = data.get("scam_type", "Unknown")
    confidence = data.get("confidence", 0)
    entities = data.get("entities", {})
    reasons = data.get("reasons", [])
    explanation = data.get("explanation", "")
    detected_lang = data.get("detected_lang", "en")
    lang_name = data.get("lang_name", "English")
    english_text = data.get("english_text", "")
    method = data.get("method", "ml")

    verdict = t(uid, "scam_yes") if is_scam else t(uid, "scam_no")

    lines = [
        t(uid, "fraud_title"),
        "",
        f"{t(uid, 'scam_label')} {verdict}",
        f"{t(uid, 'type_label')} {scam_type}",
        f"{t(uid, 'confidence_label')} {confidence}%",
    ]

    # Show translated text if original was non-English
    if detected_lang != "en" and english_text:
        lines.append("")
        lines.append(f"🔄 *Translated:* _{english_text[:200]}_")

    # Entities section
    upi_ids = entities.get("upi_ids", [])
    urls = entities.get("urls", [])
    phones = entities.get("phone_numbers", [])
    amounts = entities.get("amounts", [])
    banks = entities.get("bank_mentions", [])

    if upi_ids or urls or amounts or phones or banks:
        lines.append("")
        lines.append("🔍 *Entities Detected:*")
        if upi_ids:
            lines.append(f"  {t(uid, 'upi_label')} `{upi_ids[0]}`")
        if urls:
            lines.append(f"  {t(uid, 'url_label')} `{urls[0]}`")
        if phones:
            lines.append(f"  📱 `{phones[0]}`")
        if amounts:
            lines.append(f"  💰 {amounts[0]}")
        if banks:
            lines.append(f"  🏦 {', '.join(banks[:3])}")

    # Reasons
    if reasons and is_scam:
        lines.append("")
        lines.append("⚠️ *Why this is suspicious:*")
        for reason in reasons[:5]:
            lines.append(f"  • {reason}")

    # Advice
    lines.append("")
    if is_scam:
        lines.append(t(uid, "advice_danger"))
    else:
        lines.append(t(uid, "advice_safe"))

    # Explanation (translated to user language)
    if explanation and is_scam:
        lines.append("")
        lines.append(f"📝 _{explanation}_")

    # Footer
    lines.append("")
    lines.append(f"🌐 {lang_name} | 🤖 {method.upper()}")

    return "\n".join(lines)


# ── Command handlers ──────────────────────────────────────────

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    uid = update.effective_user.id
    await update.message.reply_text(t(uid, "welcome"), parse_mode="Markdown")
    logger.info("User %s started the bot", uid)


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    uid = update.effective_user.id
    await update.message.reply_text(t(uid, "help"), parse_mode="Markdown")


async def lang_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    uid = update.effective_user.id
    buttons = []
    row = []
    for code, label in SUPPORTED_LANGUAGES.items():
        current = get_user_language(uid)
        display = f"✓ {label}" if code == current else label
        row.append(InlineKeyboardButton(display, callback_data=f"lang:{code}"))
        if len(row) == 2:
            buttons.append(row)
            row = []
    if row:
        buttons.append(row)

    await update.message.reply_text(
        t(uid, "lang_prompt"),
        reply_markup=InlineKeyboardMarkup(buttons),
        parse_mode="Markdown",
    )


async def lang_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()
    if not query.data.startswith("lang:"):
        return
    lang_code = query.data.split(":", 1)[1]
    uid = query.from_user.id
    set_user_language(uid, lang_code)
    logger.info("User %s → language %s", uid, lang_code)
    await query.edit_message_text(t(uid, "lang_set"), parse_mode="Markdown")


# ── Message handler ───────────────────────────────────────────

async def analyze_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Analyze any text message for fraud using the real NLP engine."""
    user_text = update.message.text
    uid = update.effective_user.id
    user_lang = get_user_language(uid)
    logger.info("Message from %s: %s", uid, user_text[:120])

    await update.message.chat.send_action("typing")

    try:
        result = await nlp_analyze(user_text, user_lang=user_lang)
        logger.info(
            "Result: scam=%s type=%s conf=%d method=%s",
            result["is_scam"], result["scam_type"],
            result["confidence"], result["method"],
        )
    except Exception as exc:
        logger.error("Analysis failed: %s", exc)
        await update.message.reply_text(t(uid, "api_error"))
        return

    reply = _format_result(result, uid)
    await update.message.reply_text(reply, parse_mode="Markdown")
