"""
Property Search Tool
Advanced property search with semantic understanding
"""

import json
from typing import Optional, Dict, Any
from datapizza.tools import tool
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.database import SessionLocal
from app.models import Property


@tool
def property_search_tool(
    search_query: str,
    max_results: int = 5
) -> str:
    """
    Advanced property search with natural language understanding.
    Interprets search queries like "appartamento con giardino a Corbetta sotto 200k".

    Args:
        search_query: Natural language search query
        max_results: Maximum number of results (default: 5)

    Returns:
        JSON string with property results and search insights
    """
    db: Session = SessionLocal()
    try:
        # Parse search query (simplified keyword extraction)
        # In a full implementation, this would use NLP or the AI agent
        filters = _parse_search_query(search_query.lower())

        # Build query
        query = db.query(Property).filter(Property.status == "available")

        # Apply extracted filters
        if filters.get("city"):
            query = query.filter(Property.city.ilike(f"%{filters['city']}%"))

        if filters.get("property_type"):
            query = query.filter(Property.propertyType == filters["property_type"])

        if filters.get("max_price"):
            query = query.filter(
                or_(
                    Property.priceSale <= filters["max_price"],
                    Property.priceRentMonthly <= filters["max_price"]
                )
            )

        if filters.get("min_rooms"):
            query = query.filter(Property.rooms >= filters["min_rooms"])

        if filters.get("has_garden"):
            query = query.filter(Property.hasGarden == True)

        if filters.get("has_parking"):
            query = query.filter(
                or_(Property.hasParking == True, Property.hasGarage == True)
            )

        if filters.get("has_terrace"):
            query = query.filter(Property.hasTerrace == True)

        if filters.get("has_elevator"):
            query = query.filter(Property.hasElevator == True)

        # Execute query
        properties = query.limit(max_results).all()

        # Format results
        results = []
        for prop in properties:
            results.append({
                "id": prop.id,
                "code": prop.code,
                "title": prop.title or f"{prop.propertyType} in {prop.city}",
                "address": f"{prop.street}, {prop.city}",
                "propertyType": prop.propertyType,
                "contractType": prop.contractType,
                "price": prop.priceSale if prop.contractType == "sale" else prop.priceRentMonthly,
                "sqm": prop.sqmCommercial,
                "rooms": prop.rooms,
                "features": {
                    "hasGarden": prop.hasGarden,
                    "hasParking": prop.hasParking or prop.hasGarage,
                    "hasTerrace": prop.hasTerrace,
                    "hasElevator": prop.hasElevator,
                },
                "energyClass": prop.energyClass,
                "condition": prop.condition,
                "description": prop.description[:200] if prop.description else None,
            })

        return json.dumps({
            "success": True,
            "query": search_query,
            "filters_applied": filters,
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


def _parse_search_query(query: str) -> Dict[str, Any]:
    """
    Parse natural language search query to extract filters.
    This is a simplified version - in production, use NLP or AI.

    Args:
        query: Search query string (lowercased)

    Returns:
        Dictionary of extracted filters
    """
    filters = {}

    # Cities
    cities = ["corbetta", "magenta", "milano", "roma", "torino"]
    for city in cities:
        if city in query:
            filters["city"] = city.capitalize()

    # Property types
    if "appartamento" in query or "apartment" in query:
        filters["property_type"] = "apartment"
    elif "villa" in query:
        filters["property_type"] = "villa"
    elif "attico" in query or "penthouse" in query:
        filters["property_type"] = "penthouse"
    elif "garage" in query or "box" in query:
        filters["property_type"] = "garage"

    # Price
    # Look for patterns like "200k", "200000", "sotto 200k", "max 300k"
    import re
    price_pattern = r'(\d+)\s*k'
    price_match = re.search(price_pattern, query)
    if price_match:
        price_k = int(price_match.group(1))
        filters["max_price"] = price_k * 1000

    # Rooms
    if "bilocale" in query or "2 locali" in query:
        filters["min_rooms"] = 2
    elif "trilocale" in query or "3 locali" in query:
        filters["min_rooms"] = 3
    elif "quadrilocale" in query or "4 locali" in query:
        filters["min_rooms"] = 4

    # Features
    if "giardino" in query or "garden" in query:
        filters["has_garden"] = True
    if "parcheggio" in query or "garage" in query or "box" in query:
        filters["has_parking"] = True
    if "terrazzo" in query or "terrace" in query:
        filters["has_terrace"] = True
    if "ascensore" in query or "elevator" in query:
        filters["has_elevator"] = True

    return filters
