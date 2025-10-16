"""
Database Query Tools
Custom tools for querying the CRM database
"""

import json
from typing import Optional, List
from datapizza.tools import tool
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Property, Contact, Request, Match


@tool
def query_properties_tool(
    city: Optional[str] = None,
    price_max: Optional[float] = None,
    property_type: Optional[str] = None,
    contract_type: Optional[str] = None,
    status: Optional[str] = "available",
    rooms_min: Optional[int] = None,
    limit: int = 10
) -> str:
    """
    Query properties from the database with optional filters.

    Args:
        city: Filter by city name (e.g., "Corbetta")
        price_max: Maximum price (sale or rent based on contract_type)
        property_type: Property type (e.g., "apartment", "villa")
        contract_type: Contract type ("sale" or "rent")
        status: Property status (default: "available")
        rooms_min: Minimum number of rooms
        limit: Maximum number of results (default: 10)

    Returns:
        JSON string with property results
    """
    db: Session = SessionLocal()
    try:
        query = db.query(Property)

        # Apply filters
        if status:
            query = query.filter(Property.status == status)
        if city:
            query = query.filter(Property.city.ilike(f"%{city}%"))
        if contract_type:
            query = query.filter(Property.contractType == contract_type)
        if property_type:
            query = query.filter(Property.propertyType == property_type)
        if price_max:
            if contract_type == "sale":
                query = query.filter(Property.priceSale <= price_max)
            elif contract_type == "rent":
                query = query.filter(Property.priceRentMonthly <= price_max)
        if rooms_min:
            query = query.filter(Property.rooms >= rooms_min)

        # Execute query with limit
        properties = query.limit(limit).all()

        # Format results
        results = []
        for prop in properties:
            results.append({
                "id": prop.id,
                "code": prop.code,
                "title": prop.title or f"{prop.propertyType} in {prop.city}",
                "address": f"{prop.street} {prop.civic or ''}, {prop.city}",
                "city": prop.city,
                "zone": prop.zone,
                "propertyType": prop.propertyType,
                "contractType": prop.contractType,
                "price": prop.priceSale if prop.contractType == "sale" else prop.priceRentMonthly,
                "sqm": prop.sqmCommercial,
                "rooms": prop.rooms,
                "bedrooms": prop.bedrooms,
                "bathrooms": prop.bathrooms,
                "floor": prop.floor,
                "energyClass": prop.energyClass,
                "condition": prop.condition,
                "hasElevator": prop.hasElevator,
                "hasParking": prop.hasParking or prop.hasGarage,
                "description": prop.description,
            })

        return json.dumps({
            "success": True,
            "count": len(results),
            "properties": results
        }, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()


@tool
def query_contacts_tool(
    search_term: Optional[str] = None,
    city: Optional[str] = None,
    status: str = "active",
    importance: Optional[str] = None,
    has_budget: bool = False,
    limit: int = 10
) -> str:
    """
    Query contacts/clients from the database.

    Args:
        search_term: Search in name, email, phone
        city: Filter by city
        status: Contact status (default: "active")
        importance: Importance level ("low", "normal", "high", "vip")
        has_budget: Only contacts with budget defined
        limit: Maximum number of results (default: 10)

    Returns:
        JSON string with contact results
    """
    db: Session = SessionLocal()
    try:
        query = db.query(Contact)

        # Apply filters
        if status:
            query = query.filter(Contact.status == status)
        if search_term:
            query = query.filter(
                (Contact.fullName.ilike(f"%{search_term}%")) |
                (Contact.primaryEmail.ilike(f"%{search_term}%")) |
                (Contact.primaryPhone.ilike(f"%{search_term}%"))
            )
        if city:
            query = query.filter(Contact.city.ilike(f"%{city}%"))
        if importance:
            query = query.filter(Contact.importance == importance)
        if has_budget:
            query = query.filter(Contact.budgetMin.isnot(None))

        # Execute query
        contacts = query.limit(limit).all()

        # Format results
        results = []
        for contact in contacts:
            results.append({
                "id": contact.id,
                "code": contact.code,
                "fullName": contact.fullName,
                "email": contact.primaryEmail,
                "phone": contact.primaryPhone,
                "city": contact.city,
                "status": contact.status,
                "importance": contact.importance,
                "budgetMin": contact.budgetMin,
                "budgetMax": contact.budgetMax,
                "source": contact.source,
                "notes": contact.notes,
            })

        return json.dumps({
            "success": True,
            "count": len(results),
            "contacts": results
        }, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()


@tool
def query_requests_tool(
    contact_id: Optional[str] = None,
    status: str = "active",
    contract_type: Optional[str] = None,
    urgency: Optional[str] = None,
    limit: int = 10
) -> str:
    """
    Query search requests from clients.

    Args:
        contact_id: Filter by specific contact ID
        status: Request status (default: "active")
        contract_type: "sale" or "rent"
        urgency: Urgency level ("low", "medium", "high")
        limit: Maximum number of results (default: 10)

    Returns:
        JSON string with request results
    """
    db: Session = SessionLocal()
    try:
        query = db.query(Request)

        # Apply filters
        if status:
            query = query.filter(Request.status == status)
        if contact_id:
            query = query.filter(Request.contactId == contact_id)
        if contract_type:
            query = query.filter(Request.contractType == contract_type)
        if urgency:
            query = query.filter(Request.urgency == urgency)

        # Execute query
        requests = query.limit(limit).all()

        # Format results
        results = []
        for req in requests:
            # Parse JSON fields
            search_cities = json.loads(req.searchCities) if req.searchCities else []
            property_types = json.loads(req.propertyTypes) if req.propertyTypes else []

            results.append({
                "id": req.id,
                "code": req.code,
                "contactId": req.contactId,
                "requestType": req.requestType,
                "status": req.status,
                "urgency": req.urgency,
                "contractType": req.contractType,
                "searchCities": search_cities,
                "propertyTypes": property_types,
                "priceMin": req.priceMin,
                "priceMax": req.priceMax,
                "sqmMin": req.sqmMin,
                "roomsMin": req.roomsMin,
                "bedroomsMin": req.bedroomsMin,
                "requiresElevator": req.requiresElevator,
                "requiresParking": req.requiresParking,
                "requiresGarden": req.requiresGarden,
                "notes": req.notes,
            })

        return json.dumps({
            "success": True,
            "count": len(results),
            "requests": results
        }, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()


@tool
def query_matches_tool(
    request_id: Optional[str] = None,
    property_id: Optional[str] = None,
    status: Optional[str] = None,
    min_score: int = 0,
    limit: int = 10
) -> str:
    """
    Query matches between properties and requests.

    Args:
        request_id: Filter by request ID
        property_id: Filter by property ID
        status: Match status (e.g., "suggested", "sent", "interested")
        min_score: Minimum match score (0-100)
        limit: Maximum number of results (default: 10)

    Returns:
        JSON string with match results
    """
    db: Session = SessionLocal()
    try:
        query = db.query(Match)

        # Apply filters
        if request_id:
            query = query.filter(Match.requestId == request_id)
        if property_id:
            query = query.filter(Match.propertyId == property_id)
        if status:
            query = query.filter(Match.status == status)
        if min_score:
            query = query.filter(Match.scoreTotal >= min_score)

        # Order by score descending
        query = query.order_by(Match.scoreTotal.desc())

        # Execute query
        matches = query.limit(limit).all()

        # Format results
        results = []
        for match in matches:
            results.append({
                "id": match.id,
                "requestId": match.requestId,
                "propertyId": match.propertyId,
                "scoreTotal": match.scoreTotal,
                "scoreLocation": match.scoreLocation,
                "scorePrice": match.scorePrice,
                "scoreSize": match.scoreSize,
                "scoreFeatures": match.scoreFeatures,
                "status": match.status,
                "clientReaction": match.clientReaction,
                "agentNotes": match.agentNotes,
            })

        return json.dumps({
            "success": True,
            "count": len(results),
            "matches": results
        }, ensure_ascii=False)

    except Exception as e:
        return json.dumps({
            "success": False,
            "error": str(e)
        })
    finally:
        db.close()
