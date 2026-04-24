"""
Project Vanguard — NLP Analyzer (Orchestrator)
Pipeline: detect language → ALWAYS translate to English → extract entities
→ classify on English text → build explanation → translate response back.
"""

from __future__ import annotations
from ..config import get_logger
from .language_detector import detect_language
from .translator import translate_to_english, translate_from_english
from .entity_extractor import extract_entities
from .fraud_classifier import classify_fraud
from .link_analyzer import analyze_link
import asyncio

logger = get_logger("vanguard_bot.nlp.analyzer")


async def analyze_message(text: str, user_lang: str | None = None) -> dict:
    """Run the full NLP fraud analysis pipeline.

    1. Detect language of input
    2. Translate to English (always)
    3. Extract entities from both original + English text
    4. Classify fraud on the ENGLISH text only
    5. Build explanation in English
    6. Translate explanation to user's language

    Returns structured analysis result.
    """
    logger.info("=" * 50)
    logger.info("Analyzing: %s", text[:100])

    # ── Step 1: Detect language ────────────────────────────────
    lang_info = detect_language(text)
    detected_lang = lang_info["detected_lang"]
    response_lang = user_lang or detected_lang

    # ── Step 2: ALWAYS translate to English ────────────────────
    if detected_lang != "en":
        english_text = translate_to_english(text, detected_lang)
        logger.info("Translated to English: %s", english_text[:120])
    else:
        english_text = text

    # ── Step 3: Extract entities from BOTH texts ───────────────
    entities_orig = extract_entities(text)
    if english_text != text:
        entities_en = extract_entities(english_text)
        entities = _merge_entities(entities_orig, entities_en)
    else:
        entities = entities_orig

    # ── Step 3.5: Deception Decoder (Link Analysis) ────────────
    link_results = []
    if entities.get("urls"):
        tasks = [analyze_link(url) for url in entities["urls"]]
        link_results = await asyncio.gather(*tasks)

    # ── Step 4: Classify fraud on ENGLISH text ONLY ────────────
    classification = classify_fraud(english_text, entities)

    # ── Step 4.5: Merge Link Analysis Results ──────────────────
    for lr in link_results:
        if lr["is_scam"]:
            classification["is_scam"] = True
            classification["confidence"] = max(90, classification["confidence"])
            classification["scam_type"] = "Malicious Link / Phishing"
        
        if lr["reasons"]:
            # Keep unique reasons
            for r in lr["reasons"]:
                if r not in classification["reasons"]:
                    classification["reasons"].append(r)

    # ── Step 5: Build English explanation ──────────────────────
    explanation_en = _build_explanation(classification, entities)

    # ── Step 6: Translate explanation to user's language ────────
    if response_lang != "en":
        explanation = translate_from_english(explanation_en, response_lang)
    else:
        explanation = explanation_en

    result = {
        "is_scam": classification["is_scam"],
        "scam_type": classification["scam_type"],
        "confidence": classification["confidence"],
        "detected_lang": detected_lang,
        "lang_name": lang_info["lang_name"],
        "is_mixed": lang_info["is_mixed"],
        "english_text": english_text,
        "entities": entities,
        "reasons": classification["reasons"],
        "explanation": explanation,
        "explanation_en": explanation_en,
        "method": classification["method"],
    }

    logger.info(
        "Result: is_scam=%s type=%s conf=%d lang=%s",
        result["is_scam"], result["scam_type"],
        result["confidence"], detected_lang,
    )
    return result


def _merge_entities(a: dict, b: dict) -> dict:
    return {
        "upi_ids": list(set(a.get("upi_ids", []) + b.get("upi_ids", []))),
        "urls": list(set(a.get("urls", []) + b.get("urls", []))),
        "phone_numbers": list(set(a.get("phone_numbers", []) + b.get("phone_numbers", []))),
        "amounts": list(set(a.get("amounts", []) + b.get("amounts", []))),
        "bank_mentions": list(set(a.get("bank_mentions", []) + b.get("bank_mentions", []))),
        "has_suspicious_url": a.get("has_suspicious_url", False) or b.get("has_suspicious_url", False),
        "entity_count": max(a.get("entity_count", 0), b.get("entity_count", 0)),
    }


def _build_explanation(classification: dict, entities: dict) -> str:
    if not classification["is_scam"]:
        return "This message appears safe. No significant fraud indicators were detected. Stay cautious with unsolicited messages."

    parts = []
    stype = classification["scam_type"]
    conf = classification["confidence"]

    if conf >= 75:
        parts.append(f"HIGH RISK: This message is very likely a {stype}.")
    elif conf >= 40:
        parts.append(f"MEDIUM RISK: This message shows signs of {stype}.")
    else:
        parts.append(f"LOW RISK: This message has some suspicious indicators.")

    for reason in classification.get("reasons", [])[:4]:
        parts.append(f"- {reason}")

    parts.append("Do NOT click links, share OTPs, or transfer money to unknown accounts.")
    return "\n".join(parts)
