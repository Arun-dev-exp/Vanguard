"""
Project Vanguard — Telegram Bot Entry Point
Run with:  python app/bot/telegram_bot.py
"""

from __future__ import annotations

import sys
from pathlib import Path

# Ensure the package is importable when running this file directly
_pkg_root = Path(__file__).resolve().parent.parent.parent  # backend/
if str(_pkg_root) not in sys.path:
    sys.path.insert(0, str(_pkg_root))

from telegram.ext import (
    ApplicationBuilder,
    CallbackQueryHandler,
    CommandHandler,
    MessageHandler,
    filters,
)

from app.bot.config import TELEGRAM_BOT_TOKEN, validate, get_logger
from app.bot.handlers import (
    start_command,
    help_command,
    lang_command,
    lang_callback,
    analyze_message,
)

logger = get_logger("vanguard_bot")


def main() -> None:
    """Build and start the Telegram bot (polling mode)."""
    validate()

    logger.info("=" * 50)
    logger.info("  Project Vanguard — Fraud Detection Bot")
    logger.info("=" * 50)
    logger.info("Engine     : HuggingFace ML (zero-shot)")
    logger.info("Translate  : Google Translate (all Indian languages)")
    logger.info("Languages  : 11 supported")
    logger.info("Starting polling…")

    app = ApplicationBuilder().token(TELEGRAM_BOT_TOKEN).build()

    # Register handlers
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("lang", lang_command))
    app.add_handler(CallbackQueryHandler(lang_callback, pattern=r"^lang:"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, analyze_message))

    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
