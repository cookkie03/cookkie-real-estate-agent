"""
Pydantic schemas for scraping API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ScrapingJobCreate(BaseModel):
    """Request body for creating a scraping job"""

    portal: str = Field(..., description="Portal name (immobiliare_it, casa_it, etc)")
    location: str = Field(..., description="City/location to scrape")
    contract_type: str = Field(default="vendita", description="Contract type (vendita/affitto)")
    property_type: Optional[str] = Field(None, description="Property type filter")
    price_min: Optional[float] = Field(None, description="Minimum price")
    price_max: Optional[float] = Field(None, description="Maximum price")
    rooms_min: Optional[int] = Field(None, description="Minimum rooms")
    sqm_min: Optional[float] = Field(None, description="Minimum square meters")
    max_pages: int = Field(default=3, description="Maximum pages to scrape", ge=1, le=10)
    profile_name: Optional[str] = Field(None, description="Browser profile name for session persistence")

    class Config:
        json_schema_extra = {
            "example": {
                "portal": "immobiliare_it",
                "location": "roma",
                "contract_type": "vendita",
                "property_type": "appartamento",
                "price_max": 500000,
                "rooms_min": 2,
                "max_pages": 3
            }
        }


class ScrapingJobStatus(BaseModel):
    """Response for scraping job status"""

    job_id: str
    status: str  # queued, running, completed, failed
    portal: str
    location: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    listings_found: Optional[int] = None
    listings_saved: Optional[int] = None
    error: Optional[str] = None


class ScrapingJobResult(BaseModel):
    """Response for scraping job result"""

    status: str
    portal: str
    location: str
    listings_count: int
    saved_count: int
    skipped_count: int
    error_count: int
    listings: List[Dict[str, Any]]
    execution_time: float  # seconds


class ScrapingStatsResponse(BaseModel):
    """Response for scraping statistics"""

    total_jobs: int
    successful_jobs: int
    failed_jobs: int
    total_listings_scraped: int
    total_properties_saved: int
    portals: Dict[str, int]  # portal name -> count


class PropertyListResponse(BaseModel):
    """Response for property list"""

    count: int
    properties: List[Dict[str, Any]]
    page: int
    page_size: int
    total_pages: int
