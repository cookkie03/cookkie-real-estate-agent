"""
Contact Search Tool
Advanced contact/client search
"""

import json
from typing import Optional
from datapizza.tools import tool
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import SessionLocal
from app.models import Contact, Request


@tool
def contact_search_tool(
    search_query: str,
    include_requests: bool = True,
    max_results: int = 5
) -> str:
    """
    Search contacts/clients with natural language query.
    Can search by name, email, phone, city, or other attributes.

    Args:
        search_query: Search term (name, email, phone, city...)
        include_requests: Include contact's requests in results
        max_results: Maximum number of results (default: 5)

    Returns:
        JSON string with contact results
    """
    db: Session = SessionLocal()
    try:
        # Build search query
        search_term = f"%{search_query}%"

        query = db.query(Contact).filter(
            or_(
                Contact.fullName.ilike(search_term),
                Contact.firstName.ilike(search_term),
                Contact.lastName.ilike(search_term),
                Contact.primaryEmail.ilike(search_term),
                Contact.primaryPhone.ilike(search_term),
                Contact.city.ilike(search_term),
                Contact.code.ilike(search_term)
            )
        )

        # Execute query
        contacts = query.limit(max_results).all()

        # Format results
        results = []
        for contact in contacts:
            contact_data = {
                "id": contact.id,
                "code": contact.code,
                "fullName": contact.fullName,
                "email": contact.primaryEmail,
                "phone": contact.primaryPhone,
                "city": contact.city,
                "status": contact.status,
                "importance": contact.importance,
                "source": contact.source,
                "budget": {
                    "min": contact.budgetMin,
                    "max": contact.budgetMax
                } if contact.budgetMin else None,
                "notes": contact.notes,
            }

            # Include requests if requested
            if include_requests:
                requests = db.query(Request).filter(
                    Request.contactId == contact.id,
                    Request.status == "active"
                ).all()

                contact_data["requests"] = [
                    {
                        "id": req.id,
                        "code": req.code,
                        "requestType": req.requestType,
                        "contractType": req.contractType,
                        "priceRange": f"{req.priceMin}-{req.priceMax}" if req.priceMin and req.priceMax else None,
                        "urgency": req.urgency,
                    }
                    for req in requests
                ]

            results.append(contact_data)

        return json.dumps({
            "success": True,
            "query": search_query,
            "count": len(results),
            "results": results
        }, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()


@tool
def get_contact_details_tool(contact_id: str) -> str:
    """
    Get detailed information about a specific contact including
    their properties, requests, and recent activities.

    Args:
        contact_id: Contact ID

    Returns:
        JSON string with detailed contact information
    """
    db: Session = SessionLocal()
    try:
        contact = db.query(Contact).filter(Contact.id == contact_id).first()

        if not contact:
            return json.dumps({
                "success": False,
                "error": "Contact not found"
            })

        # Get contact's requests
        requests = db.query(Request).filter(
            Request.contactId == contact_id
        ).all()

        result = {
            "success": True,
            "contact": {
                "id": contact.id,
                "code": contact.code,
                "fullName": contact.fullName,
                "entityType": contact.entityType,
                "email": contact.primaryEmail,
                "phone": contact.primaryPhone,
                "address": {
                    "street": contact.street,
                    "city": contact.city,
                    "province": contact.province,
                    "zip": contact.zip,
                },
                "status": contact.status,
                "importance": contact.importance,
                "source": contact.source,
                "budget": {
                    "min": contact.budgetMin,
                    "max": contact.budgetMax
                } if contact.budgetMin else None,
                "notes": contact.notes,
                "lastContactDate": contact.lastContactDate.isoformat() if contact.lastContactDate else None,
            },
            "requests": [
                {
                    "id": req.id,
                    "code": req.code,
                    "type": req.requestType,
                    "status": req.status,
                    "contractType": req.contractType,
                    "priceRange": {
                        "min": req.priceMin,
                        "max": req.priceMax
                    },
                    "cities": json.loads(req.searchCities) if req.searchCities else [],
                    "propertyTypes": json.loads(req.propertyTypes) if req.propertyTypes else [],
                    "urgency": req.urgency,
                }
                for req in requests
            ],
            "statistics": {
                "totalRequests": len(requests),
                "activeRequests": len([r for r in requests if r.status == "active"]),
            }
        }

        return json.dumps(result, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()
