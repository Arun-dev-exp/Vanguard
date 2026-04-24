"""
Project Vanguard — Telegram Bot Configuration
Loads all settings from environment variables. Never hardcode secrets.
"""

import os
import logging
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

# ---------------------------------------------------------------------------
# Load .env — walks up from this file's directory to find the nearest .env
# ---------------------------------------------------------------------------
def _find_and_load_env() -> None:
    """Search upward from this file for a .env and load it."""
    if load_dotenv is None:
        return
    current = Path(__file__).resolve().parent
    for _ in range(6):  # walk up at most 6 levels
        env_path = current / ".env"
        if env_path.is_file():
            load_dotenv(env_path)
            return
        current = current.parent

_find_and_load_env()

# ---------------------------------------------------------------------------
# Configuration values
# ---------------------------------------------------------------------------
TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
API_BASE_URL: str = os.getenv("API_BASE_URL", "http://localhost:8000").rstrip("/")

# Derived
ANALYZE_ENDPOINT: str = f"{API_BASE_URL}/analyze"

# Logging
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
def validate() -> None:
    """Raise early if critical config is missing."""
    if not TELEGRAM_BOT_TOKEN:
        raise RuntimeError(
            "TELEGRAM_BOT_TOKEN is not set. "
            "Export it as an environment variable or add it to your .env file."
        )

# ---------------------------------------------------------------------------
# Logger factory
# ---------------------------------------------------------------------------
def get_logger(name: str = "vanguard_bot") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        fmt = logging.Formatter(
            "[%(asctime)s] %(levelname)-8s %(name)s — %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(fmt)
        logger.addHandler(handler)
    logger.setLevel(getattr(logging, LOG_LEVEL, logging.INFO))
    return logger
