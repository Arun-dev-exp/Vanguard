import asyncio
import datetime
from urllib.parse import urlparse
import aiohttp
from bs4 import BeautifulSoup
import whois
import tldextract
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor

from ..config import get_logger

logger = get_logger("vanguard_bot.nlp.link_analyzer")

# Cache for whois lookups to prevent slow repeat queries
_whois_cache = {}
_executor = ThreadPoolExecutor(max_workers=5)

SAFE_DOMAINS = {
    "youtube.com", "google.com", "facebook.com", "twitter.com", "instagram.com",
    "linkedin.com", "amazon.in", "amazon.com", "flipkart.com", "hdfcbank.com",
    "onlinesbi.sbi", "icicibank.com", "axisbank.com"
}

def _get_whois_age(domain: str) -> int | None:
    """Synchronous whois lookup (runs in executor). Returns domain age in days."""
    if domain in _whois_cache:
        return _whois_cache[domain]
    
    try:
        w = whois.whois(domain)
        creation_date = w.creation_date
        if type(creation_date) is list:
            creation_date = creation_date[0]
        
        if creation_date:
            now = datetime.datetime.now(datetime.timezone.utc)
            if creation_date.tzinfo is None:
                creation_date = creation_date.replace(tzinfo=datetime.timezone.utc)
            age = (now - creation_date).days
            _whois_cache[domain] = age
            return age
    except Exception as e:
        logger.warning(f"WHOIS lookup failed for {domain}: {e}")
    
    _whois_cache[domain] = None
    return None

async def _fetch_url_lite(url: str) -> dict:
    """Follows redirects and fetches HTML title (Fast Path)."""
    try:
        timeout = aiohttp.ClientTimeout(total=5)
        # Using a browser user-agent to avoid immediate bot-blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        async with aiohttp.ClientSession(timeout=timeout, headers=headers) as session:
            async with session.get(url, allow_redirects=True) as response:
                final_url = str(response.url)
                # Some servers might not return text/html
                if "text/html" not in response.headers.get("Content-Type", ""):
                    return {"final_url": final_url, "title": "", "text": ""}
                    
                html = await response.text()
                
                soup = BeautifulSoup(html, 'html.parser')
                title = soup.title.string if soup.title else ""
                
                # Extract some visible text for keywords
                text = " ".join(soup.stripped_strings)[:1000]
                
                return {
                    "final_url": final_url,
                    "title": title.strip() if title else "",
                    "text": text.lower()
                }
    except Exception as e:
        logger.warning(f"Lite fetch failed for {url}: {e}")
        return {"final_url": url, "title": "", "text": ""}

def _check_impersonation(domain: str, title: str, text: str) -> bool:
    """Heuristic visual impersonation check."""
    if not title and not text:
        return False
        
    title_lower = title.lower()
    
    banks = ["hdfc", "sbi", "icici", "axis", "kotak", "state bank", "rbi"]
    services = ["kyc", "pan", "aadhar", "income tax", "login portal", "netbanking"]
    
    # If title claims to be a bank, but domain doesn't contain the bank name
    for bank in banks:
        if bank in title_lower or bank in text[:200]:
            if bank not in domain.lower() and domain not in SAFE_DOMAINS:
                return True
                
    for service in services:
        if service in title_lower:
            if not any(x in domain.lower() for x in ["gov", "india", "tax", "bank"]):
                return True
                
    return False

async def analyze_link(url: str) -> dict:
    """Analyze a single link using the Fast Path architecture."""
    # Ensure URL has scheme
    if not url.startswith('http'):
        url = 'http://' + url
        
    logger.info(f"Analyzing link: {url}")
    
    # 1. Fast Path Fetch (Expansion + HTML parsing)
    page_data = await _fetch_url_lite(url)
    final_url = page_data["final_url"]
    
    ext = tldextract.extract(final_url)
    domain = f"{ext.domain}.{ext.suffix}"
    
    if not ext.suffix:
        # Invalid domain
        return {"is_scam": False, "reasons": []}
        
    if domain in SAFE_DOMAINS:
        logger.info(f"Safe domain bypassed: {domain}")
        return {"is_scam": False, "reasons": []}
        
    # 2. Domain Age Check (Concurrent)
    loop = asyncio.get_running_loop()
    age_days = await loop.run_in_executor(_executor, _get_whois_age, domain)
    
    # 3. Detect visual impersonation
    is_impersonation = _check_impersonation(domain, page_data["title"], page_data["text"])
    
    is_scam = False
    reasons = []
    
    if final_url != url:
        reasons.append(f"URL hides behind a redirect to `{domain}`")
        
    if age_days is not None and age_days < 30:
        is_scam = True
        reasons.append(f"Domain `{domain}` was registered very recently ({age_days} days ago) - highly suspicious.")
        
    if is_impersonation:
        is_scam = True
        reasons.append(f"Visual impersonation detected: Page claims to be an official service but domain is `{domain}`.")
        
    logger.info(f"Link analysis for {url}: is_scam={is_scam}, domain={domain}, age={age_days}")
    
    return {
        "is_scam": is_scam,
        "domain": domain,
        "final_url": final_url,
        "age_days": age_days,
        "reasons": reasons
    }
