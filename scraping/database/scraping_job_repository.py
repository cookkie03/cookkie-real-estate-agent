"""
==============================================
Scraping Job Repository
Database operations for scraping jobs
==============================================

Replaces in-memory job storage with persistent database storage.
"""

from typing import Optional, List, Dict
from datetime import datetime
import json
import sys
import os
from pathlib import Path

# Add database module to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "database" / "python"))

from database import get_db_context
from models import ScrapingJob
from sqlalchemy import desc


class ScrapingJobRepository:
    """Repository for scraping job database operations"""

    def create_job(
        self,
        job_id: str,
        portal: str,
        location: Optional[str] = None,
        contract_type: Optional[str] = None,
        property_type: Optional[str] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        sqm_min: Optional[float] = None,
        sqm_max: Optional[float] = None,
        rooms_min: Optional[int] = None,
        rooms_max: Optional[int] = None,
        max_pages: int = 5,
        created_by: str = "user",
    ) -> ScrapingJob:
        """
        Create a new scraping job

        Args:
            job_id: Unique job identifier
            portal: Portal name (immobiliare_it, casa_it, etc.)
            location: City or zone to search
            contract_type: sale, rent
            property_type: apartment, villa, etc.
            price_min: Minimum price filter
            price_max: Maximum price filter
            sqm_min: Minimum square meters
            sqm_max: Maximum square meters
            rooms_min: Minimum rooms
            rooms_max: Maximum rooms
            max_pages: Maximum pages to scrape
            created_by: User identifier

        Returns:
            Created ScrapingJob instance
        """
        with get_db_context() as db:
            job = ScrapingJob(
                id=job_id,
                portal=portal,
                location=location,
                contractType=contract_type,
                propertyType=property_type,
                priceMin=price_min,
                priceMax=price_max,
                sqmMin=sqm_min,
                sqmMax=sqm_max,
                roomsMin=rooms_min,
                roomsMax=rooms_max,
                maxPages=max_pages,
                status="queued",
                createdBy=created_by,
            )

            db.add(job)
            db.commit()
            db.refresh(job)

            return job

    def get_job(self, job_id: str) -> Optional[ScrapingJob]:
        """
        Get a job by ID

        Args:
            job_id: Job identifier

        Returns:
            ScrapingJob instance or None if not found
        """
        with get_db_context() as db:
            return db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()

    def update_job_status(
        self,
        job_id: str,
        status: str,
        started_at: Optional[datetime] = None,
        completed_at: Optional[datetime] = None,
        listings_found: Optional[int] = None,
        listings_saved: Optional[int] = None,
        errors: Optional[List[str]] = None,
        duration: Optional[int] = None,
    ) -> Optional[ScrapingJob]:
        """
        Update job status and results

        Args:
            job_id: Job identifier
            status: New status (queued, running, completed, failed, cancelled)
            started_at: When job started
            completed_at: When job completed
            listings_found: Number of listings found
            listings_saved: Number of listings saved
            errors: List of error messages
            duration: Execution duration in seconds

        Returns:
            Updated ScrapingJob instance or None if not found
        """
        with get_db_context() as db:
            job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()

            if not job:
                return None

            job.status = status

            if started_at:
                job.startedAt = started_at

            if completed_at:
                job.completedAt = completed_at

            if listings_found is not None:
                job.listingsFound = listings_found

            if listings_saved is not None:
                job.listingsSaved = listings_saved

            if errors is not None:
                job.errors = json.dumps(errors)

            if duration is not None:
                job.duration = duration

            db.commit()
            db.refresh(job)

            return job

    def list_jobs(
        self,
        status: Optional[str] = None,
        portal: Optional[str] = None,
        limit: int = 50,
    ) -> List[ScrapingJob]:
        """
        List scraping jobs with filters

        Args:
            status: Filter by status
            portal: Filter by portal
            limit: Maximum number of jobs to return

        Returns:
            List of ScrapingJob instances
        """
        with get_db_context() as db:
            query = db.query(ScrapingJob)

            # Apply filters
            if status:
                query = query.filter(ScrapingJob.status == status)

            if portal:
                query = query.filter(ScrapingJob.portal == portal)

            # Sort by created_at desc
            query = query.order_by(desc(ScrapingJob.createdAt))

            # Limit
            query = query.limit(limit)

            return query.all()

    def delete_job(self, job_id: str) -> bool:
        """
        Delete a job

        Args:
            job_id: Job identifier

        Returns:
            True if deleted, False if not found
        """
        with get_db_context() as db:
            job = db.query(ScrapingJob).filter(ScrapingJob.id == job_id).first()

            if not job:
                return False

            db.delete(job)
            db.commit()

            return True

    def get_stats(self) -> Dict:
        """
        Get aggregated statistics about scraping jobs

        Returns:
            Dict with statistics
        """
        with get_db_context() as db:
            all_jobs = db.query(ScrapingJob).all()

            total_jobs = len(all_jobs)
            successful_jobs = len([j for j in all_jobs if j.status == "completed"])
            failed_jobs = len([j for j in all_jobs if j.status == "failed"])

            total_listings_scraped = sum(j.listingsFound or 0 for j in all_jobs)
            total_properties_saved = sum(j.listingsSaved or 0 for j in all_jobs)

            # Count by portal
            portals = {}
            for job in all_jobs:
                portal = job.portal
                portals[portal] = portals.get(portal, 0) + 1

            return {
                "total_jobs": total_jobs,
                "successful_jobs": successful_jobs,
                "failed_jobs": failed_jobs,
                "total_listings_scraped": total_listings_scraped,
                "total_properties_saved": total_properties_saved,
                "portals": portals,
            }

    def to_dict(self, job: ScrapingJob) -> Dict:
        """
        Convert ScrapingJob instance to dict for API response

        Args:
            job: ScrapingJob instance

        Returns:
            Dict representation
        """
        return {
            "job_id": job.id,
            "status": job.status,
            "portal": job.portal,
            "location": job.location,
            "created_at": job.createdAt,
            "started_at": job.startedAt,
            "completed_at": job.completedAt,
            "listings_found": job.listingsFound,
            "listings_saved": job.listingsSaved,
            "error": json.loads(job.errors) if job.errors else None,
        }
