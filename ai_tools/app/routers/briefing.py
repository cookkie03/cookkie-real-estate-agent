"""
Briefing Router
Endpoints for daily briefing generation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from app.agents.briefing_agent import generate_daily_briefing

logger = logging.getLogger(__name__)

router = APIRouter()


class BriefingResponse(BaseModel):
    """Daily briefing response"""
    success: bool
    date: Optional[str] = None
    briefing: Optional[str] = None
    generated_at: Optional[str] = None
    error: Optional[str] = None


@router.get("/daily", response_model=BriefingResponse)
async def get_daily_briefing():
    """
    Generate daily briefing for the real estate agent.

    Analyzes:
    - Today's scheduled activities
    - Overdue tasks
    - High-score matches to present
    - Urgent client requests
    - Portfolio statistics

    Returns a structured, actionable briefing in Italian.

    **Example Response:**
    ```json
    {
      "success": true,
      "date": "Lunedì 17 Ottobre 2025",
      "briefing": "📅 Panoramica Giornata...",
      "generated_at": "2025-10-17T08:00:00"
    }
    ```
    """
    try:
        logger.info("Generating daily briefing...")

        result = generate_daily_briefing()

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Briefing generation failed")
            )

        return BriefingResponse(
            success=True,
            date=result.get("date"),
            briefing=result.get("briefing"),
            generated_at=result.get("generated_at")
        )

    except Exception as e:
        logger.error(f"Briefing generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def briefing_status():
    """Check briefing agent status"""
    return {
        "status": "ready",
        "agent": "briefing_agent",
        "capabilities": [
            "Daily activity summary",
            "Priority identification",
            "Opportunity detection",
            "Performance metrics",
            "Actionable insights"
        ]
    }
