from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import logging

# Import the existing NLP engine
from app.bot.nlp.analyzer import analyze_message

app = FastAPI(
    title="Project Vanguard - AI Fraud Intelligence API",
    description="PRD-1 API for analyzing messages and transcripts.",
    version="1.0.0"
)

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vanguard.api")

class AnalyzeRequest(BaseModel):
    message: str = Field(..., max_length=2000)
    source: str = Field("sms", description="Source of the message (sms, call, whatsapp)")
    metadata: Optional[Dict[str, Any]] = None

class EntitySchema(BaseModel):
    upi_ids: list[str] = []
    urls: list[str] = []
    phone_numbers: list[str] = []
    amounts: list[str] = []
    bank_mentions: list[str] = []

class AnalyzeResponse(BaseModel):
    request_id: str
    verdict: str
    risk_score: float
    scam_type: Optional[str]
    entities: EntitySchema
    flags: Dict[str, bool]
    campaign: Optional[Dict[str, Any]] = None
    analyzed_at: str
    explanation: Optional[str] = None

@app.post("/api/v1/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(payload: AnalyzeRequest):
    logger.info(f"Received request from {payload.source} with {len(payload.message)} chars.")
    
    if len(payload.message) > 2000:
        raise HTTPException(status_code=400, detail="Message exceeds 2000 character limit")

    try:
        # Call the existing NLP orchestrator
        nlp_result = analyze_message(payload.message)
        
        # Map bot's NLP result to PRD-1 Schema
        is_scam = nlp_result.get("is_scam", False)
        verdict = "FRAUD" if is_scam else "SAFE"
        
        # Confidence is 0-100 in bot, Risk score is 0.0-1.0 in PRD
        risk_score = float(nlp_result.get("confidence", 0)) / 100.0
        
        # Map entities
        bot_entities = nlp_result.get("entities", {})
        entities = EntitySchema(
            upi_ids=bot_entities.get("upi_ids", []),
            urls=bot_entities.get("urls", []),
            phone_numbers=bot_entities.get("phone_numbers", []),
            amounts=bot_entities.get("amounts", []),
            bank_mentions=bot_entities.get("bank_mentions", [])
        )
        
        # Map reasons to boolean flags
        reasons = nlp_result.get("reasons", [])
        flags = {}
        for reason in reasons:
            # Create a slug-like key from the reason
            key = reason.lower().replace(" ", "_").replace("/", "_")
            flags[key] = True
            
        return AnalyzeResponse(
            request_id=f"req_{uuid.uuid4().hex[:8]}",
            verdict=verdict,
            risk_score=risk_score,
            scam_type=nlp_result.get("scam_type"),
            entities=entities,
            flags=flags,
            campaign=None, # Campaign DB logic not implemented yet
            analyzed_at=datetime.now(timezone.utc).isoformat(),
            explanation=nlp_result.get("explanation_en")
        )

    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during analysis")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "vanguard-ai-engine"}
