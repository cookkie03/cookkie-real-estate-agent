"""
Scraping Management API
Endpoints for managing web scraping jobs
"""

import asyncio
import sys
import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, Dict, List
from datetime import datetime
import logging
import uuid
import time

# Add scraping module to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../scraping'))

from app.schemas.scraping_schemas import (
    ScrapingJobCreate,
    ScrapingJobStatus,
    ScrapingJobResult,
    ScrapingStatsResponse,
    PropertyListResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# Job repository for database persistence
from database.scraping_job_repository import ScrapingJobRepository
job_repo = ScrapingJobRepository()


def run_scraping_job_sync(job_id: str, job_data: ScrapingJobCreate):
    """
    Run scraping job synchronously (called in background)

    Args:
        job_id: Unique job ID
        job_data: Job configuration
    """
    start_time = time.time()

    try:
        # Update job status to running
        job_repo.update_job_status(
            job_id=job_id,
            status="running",
            started_at=datetime.utcnow()
        )

        # Import scraper
        if job_data.portal == "immobiliare_it":
            from portals.immobiliare_it import ImmobiliareItScraper
            scraper_class = ImmobiliareItScraper
        else:
            raise ValueError(f"Unknown portal: {job_data.portal}")

        # Run scraper
        result = asyncio.run(_run_scraper_async(
            scraper_class=scraper_class,
            job_data=job_data,
        ))

        # Calculate duration
        duration = int(time.time() - start_time)

        # Update job with results
        job_repo.update_job_status(
            job_id=job_id,
            status="completed",
            completed_at=datetime.utcnow(),
            listings_found=result["listings_count"],
            listings_saved=result["saved_count"],
            duration=duration
        )

        logger.info(f"Job {job_id} completed: {result['listings_count']} listings found in {duration}s")

    except Exception as e:
        logger.error(f"Job {job_id} failed: {e}", exc_info=True)

        # Calculate duration even on failure
        duration = int(time.time() - start_time)

        job_repo.update_job_status(
            job_id=job_id,
            status="failed",
            completed_at=datetime.utcnow(),
            errors=[str(e)],
            duration=duration
        )


async def _run_scraper_async(
    scraper_class,
    job_data: ScrapingJobCreate,
) -> Dict:
    """
    Run scraper and save to database

    Args:
        scraper_class: Scraper class to instantiate
        job_data: Job configuration

    Returns:
        Result dict with counts and listings
    """
    start_time = time.time()

    # Initialize scraper
    profile_name = job_data.profile_name or f"{job_data.portal}_{job_data.location}"

    async with scraper_class(profile_name=profile_name) as scraper:
        # Scrape
        listings = await scraper.scrape_search(
            location=job_data.location,
            contract_type=job_data.contract_type,
            property_type=job_data.property_type,
            price_min=job_data.price_min,
            price_max=job_data.price_max,
            rooms_min=job_data.rooms_min,
            sqm_min=job_data.sqm_min,
            max_pages=job_data.max_pages,
        )

        # Save to database
        from database.scraping_repository import ScrapingRepository
        repo = ScrapingRepository()

        counts = repo.save_properties_batch(listings, scraper.portal_name)

    execution_time = time.time() - start_time

    return {
        "status": "success",
        "portal": job_data.portal,
        "location": job_data.location,
        "listings_count": len(listings),
        "saved_count": counts["saved"],
        "skipped_count": counts["skipped"],
        "error_count": counts["errors"],
        "listings": listings,
        "execution_time": execution_time,
    }


@router.post("/jobs", response_model=ScrapingJobStatus)
async def create_scraping_job(
    job_data: ScrapingJobCreate,
    background_tasks: BackgroundTasks,
):
    """
    Create and start a scraping job

    The job runs in the background. Use GET /jobs/{job_id} to check status.
    """
    try:
        # Generate job ID
        job_id = str(uuid.uuid4())

        # Create job in database
        job = job_repo.create_job(
            job_id=job_id,
            portal=job_data.portal,
            location=job_data.location,
            contract_type=job_data.contract_type,
            property_type=job_data.property_type,
            price_min=job_data.price_min,
            price_max=job_data.price_max,
            sqm_min=job_data.sqm_min,
            sqm_max=job_data.sqm_max,
            rooms_min=job_data.rooms_min,
            rooms_max=job_data.rooms_max,
            max_pages=job_data.max_pages,
        )

        # Start job in background
        background_tasks.add_task(run_scraping_job_sync, job_id, job_data)

        logger.info(f"Created scraping job {job_id}: {job_data.portal} - {job_data.location}")

        return ScrapingJobStatus(**job_repo.to_dict(job))

    except Exception as e:
        logger.error(f"Error creating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs/{job_id}", response_model=ScrapingJobStatus)
async def get_job_status(job_id: str):
    """
    Get scraping job status

    Returns current status and results if completed.
    """
    job = job_repo.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return ScrapingJobStatus(**job_repo.to_dict(job))


@router.get("/jobs/{job_id}/result", response_model=ScrapingJobResult)
async def get_job_result(job_id: str):
    """
    Get scraping job results

    Only available for completed jobs.

    Note: Full results are stored in Property table, not in job.
    This endpoint returns job metadata only.
    """
    job = job_repo.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Job not completed yet (status: {job.status})"
        )

    # Return basic job result info
    # Full property data can be fetched via /properties endpoint
    return ScrapingJobResult(
        status="success",
        portal=job.portal,
        location=job.location,
        listings_count=job.listingsFound or 0,
        saved_count=job.listingsSaved or 0,
        skipped_count=0,  # Not tracked separately
        error_count=0,
        listings=[],  # Properties stored in separate table
        execution_time=job.duration or 0,
    )


@router.get("/jobs", response_model=List[ScrapingJobStatus])
async def list_jobs(
    status: Optional[str] = None,
    portal: Optional[str] = None,
    limit: int = 50,
):
    """
    List scraping jobs

    Filter by status or portal.
    """
    jobs = job_repo.list_jobs(status=status, portal=portal, limit=limit)

    return [ScrapingJobStatus(**job_repo.to_dict(job)) for job in jobs]


@router.delete("/jobs/{job_id}")
async def cancel_job(job_id: str):
    """
    Cancel/delete a job

    Running jobs cannot be cancelled (not implemented).
    """
    job = job_repo.get_job(job_id)

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if job.status == "running":
        # TODO: Implement actual cancellation of running jobs
        logger.warning(f"Cannot cancel running job {job_id} (not implemented)")
        return {
            "job_id": job_id,
            "status": "cancellation_not_implemented",
            "message": "Job is running, cannot cancel yet"
        }

    # Delete job from database
    deleted = job_repo.delete_job(job_id)

    return {
        "job_id": job_id,
        "status": "deleted" if deleted else "not_found"
    }


@router.get("/stats", response_model=ScrapingStatsResponse)
async def get_scraping_stats():
    """
    Get scraping statistics

    Returns aggregated statistics about scraping jobs and saved properties.
    """
    stats = job_repo.get_stats()

    return ScrapingStatsResponse(**stats)


@router.get("/properties", response_model=PropertyListResponse)
async def list_scraped_properties(
    source: Optional[str] = None,
    city: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    """
    List scraped properties from database

    Filter by source portal or city.
    """
    try:
        from database.python.database import get_db_context
        from database.python.models import Property

        with get_db_context() as db:
            query = db.query(Property)

            # Filter
            if source:
                query = query.filter(Property.source == source)

            if city:
                query = query.filter(Property.city.ilike(f"%{city}%"))

            # Count total
            total_count = query.count()

            # Paginate
            offset = (page - 1) * page_size
            properties = query.offset(offset).limit(page_size).all()

            # Convert to dicts
            properties_list = []
            for prop in properties:
                properties_list.append({
                    "id": prop.id,
                    "code": prop.code,
                    "source": prop.source,
                    "source_url": prop.sourceUrl,
                    "title": prop.title,
                    "city": prop.city,
                    "zone": prop.zone,
                    "price_sale": prop.priceSale,
                    "price_rent": prop.priceRentMonthly,
                    "sqm": prop.sqmCommercial,
                    "rooms": prop.rooms,
                    "bathrooms": prop.bathrooms,
                    "contract_type": prop.contractType,
                    "property_type": prop.propertyType,
                    "created_at": prop.createdAt.isoformat() if prop.createdAt else None,
                })

            total_pages = (total_count + page_size - 1) // page_size

            return PropertyListResponse(
                count=total_count,
                properties=properties_list,
                page=page,
                page_size=page_size,
                total_pages=total_pages,
            )

    except Exception as e:
        logger.error(f"Error listing properties: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def test_scraper(portal: str = "immobiliare_it", max_pages: int = 1):
    """
    Test scraper without saving to database

    Quick test endpoint for development.
    """
    try:
        if portal == "immobiliare_it":
            from portals.immobiliare_it import ImmobiliareItScraper
            scraper_class = ImmobiliareItScraper
        else:
            raise ValueError(f"Unknown portal: {portal}")

        # Run scraper
        async with scraper_class(profile_name="test") as scraper:
            listings = await scraper.scrape_search(
                location="roma",
                contract_type="vendita",
                max_pages=max_pages,
            )

        return {
            "status": "success",
            "portal": portal,
            "listings_count": len(listings),
            "sample_listings": listings[:3],  # Return first 3 for preview
        }

    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
