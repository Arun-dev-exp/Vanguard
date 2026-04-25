"""
Project Vanguard — Social Media Scanner
Checks Reddit (r/cybersecurity) and X (Twitter) for user-reported scams.
"""

from __future__ import annotations
import urllib.parse
from ..config import get_logger, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT, TWITTER_BEARER_TOKEN

logger = get_logger("vanguard_bot.nlp.social_media")

_reddit_client = None
_twitter_client = None


def _get_reddit_client():
    global _reddit_client
    if _reddit_client is not None:
        return _reddit_client
    
    if not REDDIT_CLIENT_ID or not REDDIT_CLIENT_SECRET:
        logger.warning("Reddit API keys not configured.")
        return None
        
    try:
        import praw
        _reddit_client = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            user_agent=REDDIT_USER_AGENT,
            read_only=True
        )
        logger.info("Reddit client initialized.")
        return _reddit_client
    except Exception as exc:
        logger.error("Failed to initialize Reddit client: %s", exc)
        return None


def _get_twitter_client():
    global _twitter_client
    if _twitter_client is not None:
        return _twitter_client
    
    if not TWITTER_BEARER_TOKEN:
        logger.warning("Twitter Bearer Token not configured.")
        return None
        
    try:
        import tweepy
        _twitter_client = tweepy.Client(bearer_token=TWITTER_BEARER_TOKEN)
        logger.info("Twitter client initialized.")
        return _twitter_client
    except Exception as exc:
        logger.error("Failed to initialize Twitter client: %s", exc)
        return None


def _extract_queries(text: str, entities: dict) -> list[str]:
    """Generate search queries from the message."""
    queries = []
    
    # Prioritize exact identifiers
    if entities.get("urls"):
        for url in entities["urls"]:
            # Clean url for search
            parsed = urllib.parse.urlparse(url if "://" in url else f"http://{url}")
            queries.append(parsed.netloc)
            
    if entities.get("phone_numbers"):
        queries.extend(entities["phone_numbers"])
        
    # If no hard identifiers, use text snippets (longest words)
    if not queries:
        words = [w for w in text.split() if len(w) > 4]
        # Take the top 3-4 distinct long words as a phrase
        if len(words) >= 3:
            phrase = " ".join(words[:4])
            queries.append(f'"{phrase}"')
        elif words:
            queries.append(" ".join(words))
            
    return list(set(queries))


def search_for_scam(text: str, entities: dict) -> dict:
    """
    Search Reddit and X for reports matching the text/entities.
    Focuses on cybersecurity related reports.
    """
    queries = _extract_queries(text, entities)
    if not queries:
        return {"has_reports": False, "sources": []}
        
    reddit = _get_reddit_client()
    twitter = _get_twitter_client()
    
    has_reports = False
    sources = []
    
    for query in queries[:2]:  # Limit to 2 queries to avoid long latency/rate limits
        logger.info("Searching social media for: %s", query)
        
        # --- Reddit Search ---
        if reddit:
            try:
                # User specifically requested searching reddit related to "cybersecurity"
                subreddit = reddit.subreddit("cybersecurity")
                # Search for the query within the last year
                results = subreddit.search(query, time_filter="year", limit=3)
                for submission in results:
                    has_reports = True
                    sources.append(f"Reddit (r/cybersecurity): {submission.title}")
                    break # Just need one solid hit per query
            except Exception as exc:
                logger.warning("Reddit search failed for query '%s': %s", query, exc)
                
        # --- Twitter Search ---
        if twitter:
            try:
                # Search for query + 'scam' or 'fraud'
                t_query = f"{query} (scam OR fraud) -is:retweet lang:en"
                response = twitter.search_recent_tweets(query=t_query, max_results=10)
                if response.data:
                    has_reports = True
                    # Just append a generic source indication
                    sources.append(f"X/Twitter: Users are actively warning about this.")
            except Exception as exc:
                logger.warning("Twitter search failed for query '%s': %s", query, exc)
                
        if has_reports:
            break
            
    return {
        "has_reports": has_reports,
        "sources": sources
    }
