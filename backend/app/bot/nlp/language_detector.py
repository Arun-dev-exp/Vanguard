"""
Project Vanguard — Language Detection Module
Detects input language using langdetect. Supports Indian languages + English.
"""

from __future__ import annotations
from langdetect import detect_langs, LangDetectException
from ..config import get_logger

logger = get_logger("vanguard_bot.nlp.langdetect")

SUPPORTED_LANGS = {
    "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "gu": "Gujarati",
    "ml": "Malayalam", "pa": "Punjabi", "ur": "Urdu",
}

_HINGLISH_MARKERS = {
    "hai", "hain", "kya", "nahi", "aap", "karo", "bhai", "yaar",
    "paisa", "paise", "rupay", "bhej", "bhejo", "abhi", "jaldi",
}


def detect_language(text: str) -> dict:
    """Detect language → {detected_lang, lang_name, confidence, is_mixed, all_langs}."""
    if not text or not text.strip():
        return {"detected_lang": "en", "lang_name": "English", "confidence": 1.0, "is_mixed": False, "all_langs": [("en", 1.0)]}
    try:
        probs = detect_langs(text)
        all_langs = [(str(p.lang), round(p.prob, 4)) for p in probs]
        lang, conf = all_langs[0]
        words = set(text.lower().split())
        is_mixed = lang == "en" and len(words & _HINGLISH_MARKERS) >= 2
        if is_mixed:
            lang = "hi"
        if lang not in SUPPORTED_LANGS:
            lang = "en"
        name = SUPPORTED_LANGS.get(lang, "English")
        logger.info("Detected: %s (%s) conf=%.2f mixed=%s", lang, name, conf, is_mixed)
        return {"detected_lang": lang, "lang_name": name, "confidence": conf, "is_mixed": is_mixed, "all_langs": all_langs}
    except LangDetectException as exc:
        logger.warning("Language detection failed: %s", exc)
        return {"detected_lang": "en", "lang_name": "English", "confidence": 1.0, "is_mixed": False, "all_langs": [("en", 1.0)]}
