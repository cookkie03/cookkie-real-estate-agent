"""
Scoring Router
Endpoints for property-request match scoring
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging

from app.services import PropertyScorer, ScoringWeights
from app.database import SessionLocal
from app.models import Property, Request

logger = logging.getLogger(__name__)

router = APIRouter()


class ScoringRequest(BaseModel):
    """Request for calculating matches"""
    request_id: str = Field(..., description="Request ID to find matches for")
    min_score: float = Field(default=60, ge=0, le=100, description="Minimum score threshold (0-100)")
    limit: int = Field(default=10, ge=1, le=50, description="Maximum number of matches to return")
    weights: Optional[Dict[str, float]] = Field(
        default=None,
        description="Optional custom weights for scoring components"
    )


class PropertyScore(BaseModel):
    """Property with score data"""
    property_id: str
    property_code: str
    property_title: str
    property_city: str
    property_zone: Optional[str]
    property_price: float
    total_score: float
    components: Dict[str, float]
    match_reasons: List[str]
    mismatch_reasons: List[str]


class ScoringResponse(BaseModel):
    """Response with scored matches"""
    success: bool
    request_id: str
    matches_count: int
    matches: List[PropertyScore]
    scoring_info: Dict[str, Any]


@router.post("/calculate", response_model=ScoringResponse)
async def calculate_matches(request: ScoringRequest):
    """
    Calculate property-request matches using deterministic scoring algorithm

    Returns properties sorted by match score with detailed reasoning.

    **Example:**
    ```json
    {
      "request_id": "req_123",
      "min_score": 70,
      "limit": 10
    }
    ```
    """
    db = SessionLocal()

    try:
        # Get request from database
        db_request = db.query(Request).filter(Request.id == request.request_id).first()

        if not db_request:
            raise HTTPException(status_code=404, detail=f"Request {request.request_id} not found")

        # Get all available properties with same contract type
        properties_query = db.query(Property).filter(
            Property.status == "available",
            Property.contractType == db_request.contractType
        )

        properties = properties_query.all()

        if not properties:
            return ScoringResponse(
                success=True,
                request_id=request.request_id,
                matches_count=0,
                matches=[],
                scoring_info={
                    "message": "No properties available for this contract type",
                    "contract_type": db_request.contractType
                }
            )

        # Initialize scorer with custom weights if provided
        if request.weights:
            try:
                scorer = PropertyScorer(
                    weights=ScoringWeights(**request.weights)
                )
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid weights configuration: {str(e)}"
                )
        else:
            scorer = PropertyScorer()

        # Calculate scores
        matches = scorer.get_sorted_matches(
            request=db_request,
            properties=properties,
            min_score=request.min_score
        )

        # Limit results
        matches = matches[:request.limit]

        # Format response
        formatted_matches = []
        for match in matches:
            prop = match["property"]
            score_data = match["score_data"]

            # Determine price based on contract type
            price = (
                prop.priceSale
                if prop.contractType == "sale"
                else prop.priceRentMonthly
            )

            formatted_matches.append(
                PropertyScore(
                    property_id=prop.id,
                    property_code=prop.code,
                    property_title=prop.title or f"{prop.propertyType} in {prop.city}",
                    property_city=prop.city,
                    property_zone=prop.zone,
                    property_price=price or 0,
                    total_score=score_data["total_score"],
                    components=score_data["components"],
                    match_reasons=score_data["match_reasons"],
                    mismatch_reasons=score_data["mismatch_reasons"]
                )
            )

        logger.info(
            f"Calculated matches for request {request.request_id}: "
            f"{len(formatted_matches)} matches (min_score: {request.min_score})"
        )

        return ScoringResponse(
            success=True,
            request_id=request.request_id,
            matches_count=len(formatted_matches),
            matches=formatted_matches,
            scoring_info={
                "total_properties_evaluated": len(properties),
                "matches_above_threshold": len(matches),
                "min_score_threshold": request.min_score,
                "weights_used": scorer.weights.__dict__
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@router.get("/calculate", response_model=ScoringResponse)
async def calculate_matches_get(
    request_id: str = Query(..., description="Request ID"),
    min_score: float = Query(default=60, ge=0, le=100, description="Minimum score"),
    limit: int = Query(default=10, ge=1, le=50, description="Max results")
):
    """
    GET version of calculate endpoint for easier testing

    Example: GET /api/scoring/calculate?request_id=req_123&min_score=70&limit=5
    """
    return await calculate_matches(
        ScoringRequest(
            request_id=request_id,
            min_score=min_score,
            limit=limit
        )
    )


@router.get("/weights")
async def get_default_weights():
    """Get default scoring weights"""
    return {
        "success": True,
        "weights": ScoringWeights().__dict__,
        "description": {
            "location_match": "Weight for city/zone matching",
            "price_range": "Weight for price within budget",
            "property_type": "Weight for property type match",
            "size_match": "Weight for square meters match",
            "rooms_match": "Weight for rooms/bedrooms match",
            "features_match": "Weight for required features",
            "condition_match": "Weight for property condition"
        }
    }


@router.get("/status")
async def scoring_status():
    """Check scoring service status"""
    return {
        "status": "ready",
        "service": "deterministic_scoring",
        "version": "1.0.0",
        "algorithm": "multi-component weighted scoring",
        "components": [
            "location", "price", "property_type",
            "size", "rooms", "features", "condition"
        ]
    }
