"""
Project Vanguard — Entity Extractor
Extracts fraud-relevant entities using regex: UPI IDs, URLs, phone numbers,
bank names, and amounts from text.
"""

from __future__ import annotations
import re
from ..config import get_logger

logger = get_logger("vanguard_bot.nlp.entities")

# ── Regex patterns ─────────────────────────────────────────────
_UPI_PATTERN = re.compile(r"[a-zA-Z0-9._\-]+@[a-zA-Z]{2,}", re.IGNORECASE)
_URL_PATTERN = re.compile(
    r"(?:https?://|www\.)[^\s<>\"']+|"
    r"(?:bit\.ly|tinyurl\.com|goo\.gl|t\.co|is\.gd|rb\.gy|cutt\.ly|shorturl\.at)[/\w\-._~:/?#\[\]@!$&'()*+,;=%]*",
    re.IGNORECASE,
)
_PHONE_PATTERN = re.compile(r"(?:\+91[\s\-]?)?(?:\d[\s\-]?){10}")
_AMOUNT_PATTERN = re.compile(
    r"(?:Rs\.?|₹|INR)\s*[\d,]+(?:\.\d{1,2})?|"
    r"[\d,]+(?:\.\d{1,2})?\s*(?:rupees?|rs\.?|₹)",
    re.IGNORECASE,
)

_BANK_NAMES = [
    "SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB", "BOB", "Bank of Baroda",
    "Canara", "Union Bank", "IDBI", "Yes Bank", "IndusInd", "Federal Bank",
    "RBI", "Reserve Bank", "PayTM", "PhonePe", "Google Pay", "GPay",
    "BHIM", "Bajaj", "Airtel Payments", "Amazon Pay", "Cred", "Mobikwik",
]
_BANK_PATTERN = re.compile(
    r"\b(?:" + "|".join(re.escape(b) for b in _BANK_NAMES) + r")\b",
    re.IGNORECASE,
)

# ── Shortened / suspicious URL domains ─────────────────────────
_SUSPICIOUS_DOMAINS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "rb.gy",
    "cutt.ly", "shorturl.at", "tiny.cc", "ow.ly", "buff.ly",
}


def extract_entities(text: str) -> dict:
    """Extract all fraud-relevant entities from text.

    Returns:
        {
            "upi_ids": ["fraud@ybl"],
            "urls": ["bit.ly/fake"],
            "phone_numbers": ["+91-9876543210"],
            "amounts": ["Rs.500"],
            "bank_mentions": ["SBI", "PayTM"],
            "has_suspicious_url": True,
            "entity_count": 5,
        }
    """
    upi_ids = list(set(_UPI_PATTERN.findall(text)))
    urls = list(set(_URL_PATTERN.findall(text)))
    phones = list(set(_clean_phones(_PHONE_PATTERN.findall(text))))
    amounts = list(set(_AMOUNT_PATTERN.findall(text)))
    banks = list(set(_BANK_PATTERN.findall(text)))

    # Filter out common email-like false positives from UPI
    upi_ids = [u for u in upi_ids if not _is_email_domain(u)]

    # Check for suspicious URLs
    has_suspicious = any(
        any(d in url.lower() for d in _SUSPICIOUS_DOMAINS) for url in urls
    )

    result = {
        "upi_ids": upi_ids,
        "urls": urls,
        "phone_numbers": phones,
        "amounts": amounts,
        "bank_mentions": banks,
        "has_suspicious_url": has_suspicious,
        "entity_count": len(upi_ids) + len(urls) + len(phones) + len(amounts) + len(banks),
    }

    logger.info("Extracted entities: UPI=%d URLs=%d Phones=%d Amounts=%d Banks=%d",
                len(upi_ids), len(urls), len(phones), len(amounts), len(banks))
    return result


def _clean_phones(raw: list[str]) -> list[str]:
    return [re.sub(r"[\s\-]", "", p) for p in raw if len(re.sub(r"\D", "", p)) >= 10]


def _is_email_domain(upi: str) -> bool:
    domain = upi.split("@")[1].lower() if "@" in upi else ""
    return domain in {"gmail", "yahoo", "outlook", "hotmail", "email", "mail", "protonmail"}
