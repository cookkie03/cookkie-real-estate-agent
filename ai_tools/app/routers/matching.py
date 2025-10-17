"""
Matching Router
Endpoints for AI-powered property-request matching
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging

from app.agents.matching_agent import enhance_match

logger = logging.getLogger(__name__)

router = APIRouter()


class MatchEnhanceRequest(BaseModel):
    """Match enhancement request"""
    request_id: str = Field(..., description="Request ID")
    property_id: str = Field(..., description="Property ID")
    algorithmic_score: int = Field(..., ge=0, le=100, description="Score from deterministic algorithm (0-100)")


class MatchEnhanceResponse(BaseModel):
    """Match enhancement response"""
    success: bool
    algorithmicScore: Optional[int] = None
    finalScore: Optional[int] = None
    aiAnalysis: Optional[str] = None
    error: Optional[str] = None


@router.post("/enhance", response_model=MatchEnhanceResponse)
async def enhance_match_endpoint(request: MatchEnhanceRequest):
    """
    Enhance a property-request match with AI semantic analysis.

    Takes an existing algorithmic match score and enriches it with
    AI-powered semantic analysis, generating:
    - Match reasoning in natural language
    - Key selling points
    - Potential objections and how to handle them
    - Presentation suggestions

    **Example:**
    ```json
    {
      "request_id": "req_123",
      "property_id": "prop_456",
      "algorithmic_score": 85
    }
    ```
    """
    try:
        logger.info(f"Match enhancement: Request {request.request_id} + Property {request.property_id}")

        result = enhance_match(
            request_id=request.request_id,
            property_id=request.property_id,
            algorithmic_score=request.algorithmic_score
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Match enhancement failed")
            )

        return MatchEnhanceResponse(
            success=True,
            algorithmicScore=result.get("algorithmicScore"),
            finalScore=result.get("finalScore"),
            aiAnalysis=result.get("aiAnalysis")
        )

    except Exception as e:
        logger.error(f"Match enhancement error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def matching_status():
    """Check matching agent status"""
    return {
        "status": "ready",
        "agent": "matching_agent",
        "capabilities": [
            "Semantic match analysis",
            "Match reasoning generation",
            "Selling points identification",
            "Objection handling suggestions"
        ]
    }
