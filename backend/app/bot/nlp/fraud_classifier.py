"""
Project Vanguard — Fraud Classifier (Real ML)
Uses HuggingFace InferenceClient for zero-shot classification.
The model understands semantics — catches ANY type of scam.
"""

from __future__ import annotations
import os
from ..config import get_logger

logger = get_logger("vanguard_bot.nlp.classifier")

# ── HuggingFace client (lazy-loaded) ──────────────────────────
_client = None
_MODEL = "facebook/bart-large-mnli"


def _get_client():
    """Initialize HuggingFace InferenceClient (free, works without token)."""
    global _client
    if _client is not None:
        return _client
    try:
        from huggingface_hub import InferenceClient
        token = os.getenv("HF_API_TOKEN", None)
        _client = InferenceClient(token=token) if token else InferenceClient()
        logger.info("HuggingFace InferenceClient initialized")
        return _client
    except Exception as exc:
        logger.error("Failed to init HF client: %s", exc)
        return None


def _hf_zero_shot(text: str, labels: list[str]) -> dict | None:
    """Zero-shot classification using huggingface_hub InferenceClient."""
    client = _get_client()
    if not client:
        return None
    try:
        result = client.zero_shot_classification(
            text,
            labels,
            model=_MODEL,
        )
        # Result format: ZeroShotClassificationOutput with .labels and .scores
        if hasattr(result, "labels") and hasattr(result, "scores"):
            return {"labels": list(result.labels), "scores": list(result.scores)}
        # Sometimes returns dict
        if isinstance(result, dict) and "labels" in result:
            return result
        # List format
        if isinstance(result, list) and len(result) > 0:
            return result[0] if isinstance(result[0], dict) else {"labels": [], "scores": []}
        logger.warning("Unexpected HF result format: %s", type(result))
        return None
    except Exception as exc:
        logger.warning("HF zero-shot failed: %s", exc)
        return None


def classify_fraud(text: str, entities: dict | None = None) -> dict:
    """Classify English text using real ML zero-shot classification.

    Catches ANY scam type — the model understands language meaning.

    Returns:
        {
            "is_scam": True,
            "scam_type": "utility bill scam",
            "confidence": 87,
            "method": "AI",
            "reasons": [...],
        }
    """
    entities = entities or {}

    # ── Primary: ML classification ────────────────────────────
    ml_result = _classify_ml(text, entities)
    if ml_result:
        return ml_result

    # ── Fallback: entity + heuristic ──────────────────────────
    logger.info("ML unavailable — using fallback")
    return _classify_fallback(text, entities)


def _classify_ml(text: str, entities: dict) -> dict | None:
    """Real ML zero-shot classification."""

    # Step 1: Is it fraud or safe?
    binary_labels = [
        "This is a scam, fraud, or phishing message",
        "This is a legitimate, safe, normal message",
    ]

    result = _hf_zero_shot(text, binary_labels)
    if not result:
        return None

    label_scores = dict(zip(result["labels"], result["scores"]))
    scam_score = label_scores.get(binary_labels[0], 0)
    safe_score = label_scores.get(binary_labels[1], 0)

    is_scam = scam_score > safe_score
    confidence = round(scam_score * 100) if is_scam else round(safe_score * 100)

    # Step 2: If scam, identify specific type
    scam_type = "Suspicious message"
    if is_scam:
        type_labels = [
            "KYC or account verification scam",
            "lottery, prize, or reward scam",
            "investment or trading fraud",
            "job offer or earning scam",
            "loan or credit card scam",
            "OTP or password phishing",
            "bank or government impersonation",
            "accidental money transfer scam",
            "delivery or courier fee scam",
            "vehicle challan or traffic fine scam",
            "utility bill or electricity disconnection scam",
            "tech support or customer care scam",
            "romance or dating scam",
            "insurance fraud",
            "tax refund scam",
            "cryptocurrency or bitcoin scam",
            "SIM swap or mobile fraud",
            "social media phishing",
            "rental or property scam",
            "impersonation of friend or family",
        ]
        type_result = _hf_zero_shot(text, type_labels)
        if type_result:
            scam_type = type_result["labels"][0]
            type_conf = round(type_result["scores"][0] * 100)
            if type_conf > confidence:
                confidence = type_conf

    reasons = _build_reasons(text, entities)

    logger.info("AI: is_scam=%s type=%s conf=%d", is_scam, scam_type, confidence)
    return {
        "is_scam": is_scam,
        "scam_type": scam_type if is_scam else "None",
        "confidence": confidence,
        "method": "AI",
        "reasons": reasons,
    }


def _classify_fallback(text: str, entities: dict) -> dict:
    """Fallback when ML API is unavailable."""
    tl = text.lower()
    score = 0
    reasons = []

    # Entity signals
    if entities.get("upi_ids"):
        score += 20
        reasons.append(f"Contains UPI ID: {entities['upi_ids'][0]}")
    if entities.get("has_suspicious_url"):
        score += 25
        reasons.append("Contains shortened/suspicious URL")
    elif entities.get("urls"):
        score += 12
        reasons.append("Contains URL link")
    if entities.get("amounts"):
        score += 12
        reasons.append(f"Mentions money: {entities['amounts'][0]}")
    if entities.get("bank_mentions"):
        score += 10
        reasons.append(f"References: {', '.join(entities['bank_mentions'][:2])}")
    if entities.get("phone_numbers"):
        score += 8
        reasons.append("Contains phone number")

    # Heuristic signals
    if any(w in tl for w in ("urgent", "immediately", "act now", "hurry", "right now", "asap")):
        score += 15
        reasons.append("Uses urgency/pressure language")
    if any(w in tl for w in ("block", "suspend", "close", "disconnect", "cut off", "cancel", "terminate", "frozen")):
        score += 15
        reasons.append("Threatens service disruption")
    if any(w in tl for w in ("click", "tap", "visit", "link", "download")):
        score += 12
        reasons.append("Asks to click/visit a link")
    if any(w in tl for w in ("share", "send", "transfer", "pay", "deposit", "return", "refund")):
        score += 12
        reasons.append("Requests money/information")
    if any(w in tl for w in ("won", "winner", "prize", "lottery", "reward", "gift", "free", "bonus")):
        score += 12
        reasons.append("Uses lure/bait language")
    if any(w in tl for w in ("otp", "password", "pin", "code", "cvv")):
        score += 18
        reasons.append("Requests sensitive credentials")
    if any(w in tl for w in ("dear customer", "valued customer", "dear user")):
        score += 10
        reasons.append("Uses generic impersonal greeting")
    if any(w in tl for w in ("verify", "update", "kyc", "aadhar", "pan")):
        score += 10
        reasons.append("Requests identity verification")
    if any(w in tl for w in ("bill", "due", "payment", "overdue", "unpaid", "outstanding")):
        score += 10
        reasons.append("Claims unpaid bill/dues")
    if any(w in tl for w in ("officer", "executive", "representative", "department")):
        score += 8
        reasons.append("Claims to be an official")
    if any(w in tl for w in ("mistake", "error", "wrong", "accidental")):
        score += 12
        reasons.append("Claims accidental transaction")
    if any(w in tl for w in ("contact", "call", "whatsapp", "message")):
        score += 6
        reasons.append("Directs to contact someone")

    confidence = min(score, 100)
    is_scam = confidence >= 20

    if not reasons:
        reasons.append("No significant fraud indicators detected")

    logger.info("Fallback: is_scam=%s conf=%d", is_scam, confidence)
    return {
        "is_scam": is_scam,
        "scam_type": "Suspicious message" if is_scam else "None",
        "confidence": confidence,
        "method": "fallback",
        "reasons": reasons,
    }


def _build_reasons(text: str, entities: dict) -> list[str]:
    """Build reasons from entities and text content."""
    reasons = []
    tl = text.lower()

    if entities.get("upi_ids"):
        reasons.append(f"Contains UPI ID: {entities['upi_ids'][0]}")
    if entities.get("has_suspicious_url"):
        reasons.append("Contains shortened/suspicious URL")
    elif entities.get("urls"):
        reasons.append("Contains URL link")
    if entities.get("amounts"):
        reasons.append(f"Mentions money: {entities['amounts'][0]}")
    if entities.get("bank_mentions"):
        reasons.append(f"References: {', '.join(entities['bank_mentions'][:2])}")
    if entities.get("phone_numbers"):
        reasons.append("Contains phone number")
    if any(w in tl for w in ("return", "send back", "refund", "give back", "transfer")):
        reasons.append("Asks to send/return money")
    if any(w in tl for w in ("mistake", "error", "wrong", "accidental")):
        reasons.append("Claims accidental transaction")
    if any(w in tl for w in ("urgent", "immediately", "act now", "hurry")):
        reasons.append("Uses urgency to pressure action")
    if any(w in tl for w in ("click", "tap", "visit", "link")):
        reasons.append("Asks to click a link")
    if any(w in tl for w in ("otp", "password", "pin", "code", "cvv")):
        reasons.append("Requests sensitive credentials")
    if any(w in tl for w in ("block", "suspend", "disconnect", "cut off", "cancel")):
        reasons.append("Threatens service disruption")
    if any(w in tl for w in ("bill", "due", "payment", "overdue", "unpaid")):
        reasons.append("Claims unpaid bill/dues")
    if any(w in tl for w in ("dear customer", "valued customer")):
        reasons.append("Uses generic impersonal greeting")
    if any(w in tl for w in ("officer", "executive", "department")):
        reasons.append("Claims official authority")

    return reasons
