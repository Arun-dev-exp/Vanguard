"""
Project Vanguard — Fraud Classifier (Real ML + Ensemble)
Architecture:
  1. HuggingFace zero-shot (facebook/bart-large-mnli) via InferenceClient — catches ANY scam
  2. Feature-based scoring — always available, no dependencies
  3. vaibhav07112004/fraud-detection-models pkl ensemble — optional, loads if sklearn available

All three vote. If only feature-scoring is available, it still works reliably.
"""

from __future__ import annotations
import os
import re
from pathlib import Path
from ..config import get_logger
from .social_media_scanner import search_for_scam

logger = get_logger("vanguard_bot.nlp.classifier")

# ── HuggingFace client (lazy) ─────────────────────────────────
_hf_client = None
_pkl_models: dict | None = None
_MODELS_DIR = Path(__file__).resolve().parent.parent.parent.parent / "models"
_HF_REPO = "vaibhav07112004/fraud-detection-models"


def _get_hf_client():
    global _hf_client
    if _hf_client is not None:
        return _hf_client
    try:
        from huggingface_hub import InferenceClient
        token = os.getenv("HF_API_TOKEN", None)
        _hf_client = InferenceClient(token=token) if token else InferenceClient()
        logger.info("HF InferenceClient ready")
        return _hf_client
    except Exception as exc:
        logger.error("HF client init failed: %s", exc)
        return None


def _hf_zero_shot(text: str, labels: list[str]) -> dict | None:
    client = _get_hf_client()
    if not client:
        return None
    try:
        result = client.zero_shot_classification(
            text, labels, model="facebook/bart-large-mnli",
        )
        # API returns list of ZeroShotClassificationOutputElement(label=, score=)
        if isinstance(result, list) and result:
            parsed_labels = []
            parsed_scores = []
            for item in result:
                if hasattr(item, "label") and hasattr(item, "score"):
                    parsed_labels.append(item.label)
                    parsed_scores.append(item.score)
                elif isinstance(item, dict):
                    parsed_labels.append(item.get("label", ""))
                    parsed_scores.append(item.get("score", 0))
            if parsed_labels:
                return {"labels": parsed_labels, "scores": parsed_scores}
        # Fallback: older dict format
        if isinstance(result, dict) and "labels" in result:
            return result
        if hasattr(result, "labels") and hasattr(result, "scores"):
            return {"labels": list(result.labels), "scores": list(result.scores)}
        logger.warning("Unexpected HF result: %s", type(result))
        return None
    except Exception as exc:
        logger.warning("HF zero-shot failed: %s", exc)
        return None


# ── PKL models (optional — requires sklearn) ──────────────────

def _load_pkl_models() -> dict:
    global _pkl_models
    if _pkl_models is not None:
        return _pkl_models
    _pkl_models = {}
    try:
        import pickle
        import numpy  # noqa: F401
        from huggingface_hub import hf_hub_download
    except ImportError:
        logger.info("sklearn/numpy not installed — pkl models skipped")
        return _pkl_models

    model_files = {
        "phishing": "phishing_detection_model.pkl",
        "social_engineering": "social_engineering_model.pkl",
        "investment": "investment_fraud_model.pkl",
        "ecommerce": "ecommerce_fraud_model.pkl",
        "bec": "bec_fraud_model.pkl",
        "employment": "employment_fraud_model.pkl",
        "app": "app_fraud_model.pkl",
    }

    _MODELS_DIR.mkdir(parents=True, exist_ok=True)

    for name, filename in model_files.items():
        local_path = _MODELS_DIR / filename
        if not local_path.exists():
            try:
                local_path_str = hf_hub_download(
                    repo_id=_HF_REPO, filename=filename,
                    local_dir=str(_MODELS_DIR),
                )
                local_path = Path(local_path_str)
            except Exception as exc:
                logger.debug("Could not download %s: %s", filename, exc)
                continue
        try:
            with open(local_path, "rb") as f:
                _pkl_models[name] = pickle.load(f)
            logger.info("Loaded pkl model: %s", filename)
        except Exception as exc:
            logger.debug("Failed to load %s: %s", filename, exc)

    logger.info("PKL models loaded: %d", len(_pkl_models))
    return _pkl_models


# ── Feature extraction ────────────────────────────────────────

def _extract_features(text: str, entities: dict) -> dict:
    tl = text.lower()
    words = set(tl.split())

    urgency = {"urgent", "immediately", "now", "hurry", "asap", "quick",
               "fast", "deadline", "expire", "limited", "last", "chance",
               "right now", "within", "hours", "minutes"}
    threats = {"block", "suspend", "cancel", "close", "terminate", "disconnect",
               "arrest", "legal", "police", "frozen", "deactivate", "banned",
               "cut", "seize", "confiscate", "shutdown"}
    actions = {"click", "tap", "call", "visit", "send", "transfer", "pay",
               "share", "provide", "enter", "submit", "download", "install",
               "contact", "reply", "forward", "deposit", "return", "refund"}
    lures = {"free", "win", "won", "prize", "gift", "reward", "bonus",
             "cashback", "congratulations", "selected", "chosen", "lucky",
             "offer", "discount", "guaranteed", "double", "triple", "profit"}
    creds = {"otp", "password", "pin", "cvv", "code", "verify", "kyc",
             "aadhar", "aadhaar", "pan", "ssn", "identity", "credentials"}
    finance = {"account", "bank", "credit", "debit", "loan", "emi", "amount",
               "rupees", "payment", "transaction", "bill", "fee", "due",
               "overdue", "unpaid", "outstanding", "balance", "wallet"}
    authority = {"officer", "executive", "department", "manager", "inspector",
                 "authority", "government", "ministry", "rbi", "reserve"}
    impersonal = {"dear customer", "valued customer", "dear user", "dear sir",
                  "dear madam", "dear account holder", "respected customer"}

    u = len(words & urgency)
    t = len(words & threats)
    a = len(words & actions)
    l = len(words & lures)
    c = len(words & creds)
    f = len(words & finance)
    au = len(words & authority)
    imp = sum(1 for g in impersonal if g in tl)

    return {
        "urgency": u, "threats": t, "actions": a, "lures": l,
        "creds": c, "finance": f, "authority": au, "impersonal": imp,
        "has_url": 1 if entities.get("urls") else 0,
        "has_suspicious_url": 1 if entities.get("has_suspicious_url") else 0,
        "has_upi": 1 if entities.get("upi_ids") else 0,
        "has_phone": 1 if entities.get("phone_numbers") else 0,
        "has_amount": 1 if entities.get("amounts") else 0,
        "has_bank": 1 if entities.get("bank_mentions") else 0,
        "entity_count": entities.get("entity_count", 0),
    }


# ── Main classifier ──────────────────────────────────────────

def classify_fraud(text: str, entities: dict | None = None) -> dict:
    """Ensemble fraud classification:
    1. HF zero-shot ML (primary)
    2. Feature scoring (always available)
    3. PKL models (optional)
    """
    entities = entities or {}
    features = _extract_features(text, entities)

    # Run all classifiers
    zs = _classify_zero_shot(text)
    feat = _classify_features(features, text)
    pkl = _classify_pkl(features)

    # Social Media check (if no UPI)
    sm_result = None
    if not entities.get("upi_ids"):
        sm_result = search_for_scam(text, entities)

    # Ensemble vote
    return _ensemble(zs, feat, pkl, sm_result, text, entities)


def _classify_zero_shot(text: str) -> dict | None:
    labels = [
        "This is a scam, fraud, or phishing message",
        "This is a legitimate, safe, normal message",
    ]
    result = _hf_zero_shot(text, labels)
    if not result:
        return None

    scores = dict(zip(result["labels"], result["scores"]))
    scam_score = scores.get(labels[0], 0)
    is_scam = scam_score > 0.5
    confidence = round(scam_score * 100)

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
            "utility bill or disconnection scam",
            "tech support or customer care scam",
            "cryptocurrency scam",
            "impersonation of friend or family",
            "romance or dating scam",
            "insurance fraud",
        ]
        tr = _hf_zero_shot(text, type_labels)
        if tr:
            scam_type = tr["labels"][0]

    return {"is_scam": is_scam, "confidence": confidence, "scam_type": scam_type, "method": "AI"}


def _classify_features(features: dict, text: str) -> dict:
    score = 0
    score += features["urgency"] * 12
    score += features["threats"] * 15
    score += features["actions"] * 8
    score += features["lures"] * 12
    score += features["creds"] * 20
    score += features["finance"] * 5
    score += features["authority"] * 10
    score += features["impersonal"] * 12
    score += features["has_suspicious_url"] * 25
    score += features["has_url"] * 8
    score += features["has_upi"] * 15
    score += features["has_phone"] * 5
    score += features["has_amount"] * 8
    score += features["has_bank"] * 6

    confidence = min(max(score, 0), 100)
    is_scam = confidence >= 20
    scam_type = _infer_type(text) if is_scam else "None"

    return {"is_scam": is_scam, "confidence": confidence, "scam_type": scam_type, "method": "features"}


def _classify_pkl(features: dict) -> dict | None:
    models = _load_pkl_models()
    if not models:
        return None
    try:
        import numpy as np
        fv = [
            features["urgency"], features["threats"], features["actions"],
            features["lures"], features["creds"], features["finance"],
            features["authority"], features["impersonal"],
            features["has_url"], features["has_suspicious_url"],
            features["has_upi"], features["has_phone"],
            features["has_amount"], features["has_bank"],
            features["entity_count"],
        ]
        X = np.array([fv])
        fraud_votes = 0
        total = 0
        for name, model in models.items():
            try:
                pred = model.predict(X)
                if pred[0] == 1:
                    fraud_votes += 1
                total += 1
            except Exception:
                continue
        if total == 0:
            return None
        is_scam = fraud_votes > total / 2
        confidence = round((max(fraud_votes, total - fraud_votes) / total) * 100)
        return {"is_scam": is_scam, "confidence": confidence, "scam_type": "Suspicious message", "method": "pkl-ensemble"}
    except Exception as exc:
        logger.warning("PKL classify failed: %s", exc)
        return None


def _ensemble(zs: dict | None, feat: dict, pkl: dict | None, sm_result: dict | None, text: str, entities: dict) -> dict:
    results = [r for r in [zs, feat, pkl] if r is not None]

    scam_votes = sum(1 for r in results if r["is_scam"])
    is_scam = scam_votes > len(results) / 2

    # Social media override
    if sm_result and sm_result.get("has_reports"):
        is_scam = True
        confidence = 90
        scam_type = "Social Media Reported Scam"
        method = "social-media-reports"
        
        reasons = _build_reasons(text, entities)
        reasons.extend(sm_result.get("sources", []))
        
        logger.info("Ensemble overriden by Social Media Reports: %s", sm_result["sources"])
        return {
            "is_scam": is_scam,
            "scam_type": scam_type,
            "confidence": confidence,
            "method": method,
            "reasons": reasons,
        }

    # Trust AI if it's confident
    if zs and zs["is_scam"] and zs["confidence"] >= 55:
        is_scam = True
    if zs and not zs["is_scam"] and zs["confidence"] >= 80 and feat["confidence"] < 40:
        is_scam = False

    agreeing = [r for r in results if r["is_scam"] == is_scam]
    confidence = max((r["confidence"] for r in agreeing), default=50)

    # Scam type: prefer AI type
    scam_type = "None"
    if is_scam:
        if zs and zs["is_scam"] and zs["scam_type"] != "Suspicious message":
            scam_type = zs["scam_type"]
        elif feat["is_scam"] and feat["scam_type"] != "None":
            scam_type = feat["scam_type"]
        else:
            scam_type = _infer_type(text)

    methods = [r["method"] for r in agreeing]
    method = methods[0] if methods else "features"

    reasons = _build_reasons(text, entities)

    logger.info("Ensemble: scam=%s type=%s conf=%d method=%s votes=%d/%d",
                is_scam, scam_type, confidence, method, scam_votes, len(results))

    return {
        "is_scam": is_scam,
        "scam_type": scam_type,
        "confidence": confidence,
        "method": method,
        "reasons": reasons,
    }


def _infer_type(text: str) -> str:
    tl = text.lower()
    mapping = [
        (["kyc", "verify", "aadhar", "pan", "identity", "aadhaar"], "KYC verification scam"),
        (["won", "prize", "lottery", "winner", "reward", "lucky draw"], "Lottery or prize scam"),
        (["invest", "trading", "profit", "return", "double", "guaranteed"], "Investment fraud"),
        (["job", "hiring", "salary", "work from home", "earn", "income"], "Job offer scam"),
        (["loan", "emi", "credit", "pre-approved", "processing fee"], "Loan scam"),
        (["otp", "password", "pin", "cvv", "code"], "OTP phishing"),
        (["dear customer", "valued customer", "bank", "rbi"], "Bank impersonation"),
        (["mistake", "accidental", "error", "wrong", "refund", "return"], "Accidental money transfer scam"),
        (["delivery", "courier", "parcel", "customs", "package"], "Delivery scam"),
        (["challan", "fine", "traffic", "vehicle", "penalty"], "Vehicle challan scam"),
        (["electricity", "bill", "disconnect", "power", "meter", "gas", "water"], "Utility bill scam"),
        (["support", "customer care", "helpdesk", "technician"], "Tech support scam"),
        (["bitcoin", "crypto", "blockchain", "token", "mining"], "Cryptocurrency scam"),
        (["insurance", "policy", "claim", "premium", "nominee"], "Insurance fraud"),
        (["click", "link", "url", "website", "update"], "Phishing"),
    ]
    for keywords, stype in mapping:
        if any(k in tl for k in keywords):
            return stype
    return "Suspicious message"


def _build_reasons(text: str, entities: dict) -> list[str]:
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

    checks = [
        (("return", "send back", "refund", "give back"), "Asks to send/return money"),
        (("mistake", "error", "wrong", "accidental"), "Claims accidental transaction"),
        (("urgent", "immediately", "act now", "hurry"), "Uses urgency language"),
        (("click", "tap", "visit", "link"), "Asks to click a link"),
        (("otp", "password", "pin", "code", "cvv"), "Requests sensitive credentials"),
        (("block", "suspend", "disconnect", "cut", "cancel", "terminate"), "Threatens service disruption"),
        (("bill", "due", "payment", "overdue", "unpaid"), "Claims unpaid bill/dues"),
        (("dear customer", "valued customer"), "Uses generic impersonal greeting"),
        (("officer", "executive", "department", "authority"), "Claims official authority"),
        (("won", "prize", "lottery", "reward", "gift"), "Claims you won a prize"),
        (("invest", "guaranteed", "double", "profit"), "Promises guaranteed returns"),
        (("loan", "emi", "processing fee"), "Unsolicited loan offer"),
        (("electricity", "power", "disconnect", "meter"), "Threatens utility disconnection"),
        (("challan", "fine", "traffic", "vehicle"), "Claims unpaid fine/challan"),
    ]

    for keywords, reason in checks:
        if any(k in tl for k in keywords):
            reasons.append(reason)

    return reasons
