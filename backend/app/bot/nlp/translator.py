"""
Project Vanguard — Translation Module
Translates text between languages using deep-translator (Google Translate).
"""

from __future__ import annotations
from deep_translator import GoogleTranslator
from ..config import get_logger

logger = get_logger("vanguard_bot.nlp.translator")

# deep-translator language codes for Indian languages
_LANG_MAP = {
    "en": "english", "hi": "hindi", "ta": "tamil", "te": "telugu",
    "bn": "bengali", "mr": "marathi", "kn": "kannada", "gu": "gujarati",
    "ml": "malayalam", "pa": "punjabi", "ur": "urdu",
}


def translate_to_english(text: str, source_lang: str) -> str:
    """Translate text from source language to English. Returns original if already English or on error."""
    if source_lang == "en" or not text.strip():
        return text
    try:
        src = _LANG_MAP.get(source_lang, source_lang)
        result = GoogleTranslator(source=src, target="english").translate(text)
        logger.info("Translated %s→en: %s → %s", source_lang, text[:60], result[:60] if result else "")
        return result or text
    except Exception as exc:
        logger.warning("Translation to English failed: %s", exc)
        return text


def translate_from_english(text: str, target_lang: str) -> str:
    """Translate text from English to target language. Returns original if target is English or on error."""
    if target_lang == "en" or not text.strip():
        return text
    try:
        tgt = _LANG_MAP.get(target_lang, target_lang)
        result = GoogleTranslator(source="english", target=tgt).translate(text)
        logger.info("Translated en→%s: %s → %s", target_lang, text[:60], result[:60] if result else "")
        return result or text
    except Exception as exc:
        logger.warning("Translation from English failed: %s", exc)
        return text
