"""
Repository for scraping data persistence
Handles saving scraped property data to database
"""

import hashlib
import json
import logging
from typing import Dict, Optional, List
from datetime import datetime
import uuid

# Database imports
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../'))
from database.python.database import get_db_context
from database.python.models import Property, Contact, Building


logger = logging.getLogger(__name__)


class ScrapingRepository:
    """
    Handles saving scraped data to database

    Features:
    - Deduplication by content hash
    - Automatic code generation
    - Location parsing
    - Type mapping
    - Error handling
    """

    def __init__(self):
        logger.info("ScrapingRepository initialized")

    def save_property(self, data: Dict, source: str) -> Optional[str]:
        """
        Save scraped property to database

        Args:
            data: Property data dictionary from scraper
            source: Source portal name (e.g., "immobiliare_it")

        Returns:
            Property ID if saved, None if error or duplicate
        """
        try:
            with get_db_context() as db:
                # Generate code
                code = self._generate_property_code(source)

                # Check for duplicates by URL
                source_url = data.get("source_url")
                if source_url:
                    existing = db.query(Property).filter(
                        Property.sourceUrl == source_url
                    ).first()

                    if existing:
                        logger.info(f"Property already exists: {source_url}")
                        return existing.id

                # Check for duplicates by content hash
                content_hash = self._compute_content_hash(data)
                existing_by_hash = db.query(Property).filter(
                    Property.internalNotes == f"hash:{content_hash}"
                ).first()

                if existing_by_hash:
                    logger.info(f"Property with same content already exists: {code}")
                    return existing_by_hash.id

                # Map to Property model
                property_data = self._map_to_property_model(data, source, code, content_hash)

                # Create Property
                property_obj = Property(**property_data)
                db.add(property_obj)
                db.commit()
                db.refresh(property_obj)

                logger.info(f"Saved property: {code} from {source}")
                return property_obj.id

        except Exception as e:
            logger.error(f"Error saving property: {e}", exc_info=True)
            return None

    def save_properties_batch(
        self,
        properties: List[Dict],
        source: str
    ) -> Dict[str, int]:
        """
        Save multiple properties in batch

        Args:
            properties: List of property dictionaries
            source: Source portal name

        Returns:
            Dict with counts: {"saved": X, "skipped": Y, "errors": Z}
        """
        counts = {"saved": 0, "skipped": 0, "errors": 0}

        for prop_data in properties:
            try:
                property_id = self.save_property(prop_data, source)

                if property_id:
                    counts["saved"] += 1
                else:
                    counts["skipped"] += 1

            except Exception as e:
                logger.error(f"Error in batch save: {e}")
                counts["errors"] += 1

        logger.info(f"Batch save complete: {counts}")
        return counts

    def _generate_property_code(self, source: str) -> str:
        """Generate unique property code"""
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_suffix = str(uuid.uuid4())[:8]
        return f"{source.upper()}-{timestamp}-{random_suffix}"

    def _compute_content_hash(self, data: Dict) -> str:
        """
        Compute content hash for deduplication

        Uses key fields: title, location, price, sqm
        """
        key_data = {
            "title": str(data.get("title", "")).lower().strip(),
            "location": str(data.get("location", "")).lower().strip(),
            "price": data.get("price"),
            "sqm": data.get("sqm"),
        }

        content = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _map_to_property_model(
        self,
        data: Dict,
        source: str,
        code: str,
        content_hash: str
    ) -> Dict:
        """
        Map scraped data to Property model fields

        Args:
            data: Scraped property data
            source: Source portal
            code: Generated property code
            content_hash: Content hash for dedup

        Returns:
            Dict with Property model fields
        """
        # Parse location
        location_parts = self._parse_location(data.get("location", ""))

        # Determine contract type
        contract_type = self._map_contract_type(data, source)

        # Determine property type
        property_type = self._map_property_type(data)

        # Generate latitude/longitude (placeholder if not available)
        lat = data.get("latitude", 0.0)
        lon = data.get("longitude", 0.0)

        # If no coords, try to generate from city (placeholder)
        if lat == 0.0 and lon == 0.0:
            lat, lon = self._estimate_coordinates(location_parts.get("city"))

        return {
            "id": str(uuid.uuid4()),
            "code": code,
            "source": source,
            "sourceUrl": data.get("source_url"),
            "importDate": datetime.utcnow(),
            "verified": False,
            "status": "draft",  # Requires manual verification

            # Location
            "street": location_parts.get("street", "Via sconosciuta"),
            "city": location_parts.get("city", "Sconosciuta"),
            "province": location_parts.get("province", ""),
            "zone": location_parts.get("zone"),
            "latitude": lat,
            "longitude": lon,

            # Type
            "contractType": contract_type,
            "propertyType": property_type,

            # Dimensions
            "sqmCommercial": float(data["sqm"]) if data.get("sqm") else None,
            "rooms": int(data["rooms"]) if data.get("rooms") else None,
            "bathrooms": int(data["bathrooms"]) if data.get("bathrooms") else None,

            # Price
            "priceSale": float(data["price"]) if contract_type == "sale" and data.get("price") else None,
            "priceRentMonthly": float(data["price"]) if contract_type == "rent" and data.get("price") else None,

            # Marketing
            "title": data.get("title"),
            "description": data.get("description"),

            # Features (from data if available)
            "hasElevator": data.get("hasElevator", False) if isinstance(data.get("hasElevator"), bool) else False,
            "hasParking": data.get("hasParking", False) if isinstance(data.get("hasParking"), bool) else False,
            "hasGarden": data.get("hasGarden", False) if isinstance(data.get("hasGarden"), bool) else False,
            "hasTerrace": data.get("hasTerrace", False) if isinstance(data.get("hasTerrace"), bool) else False,
            "hasGarage": data.get("hasGarage", False) if isinstance(data.get("hasGarage"), bool) else False,

            # Other
            "condition": data.get("condition"),
            "energyClass": data.get("energyClass"),
            "floor": data.get("floor"),

            # Internal notes with hash for dedup
            "internalNotes": f"hash:{content_hash}\nScraped at: {datetime.utcnow().isoformat()}\nSource: {source}",

            # Timestamps
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

    def _parse_location(self, location_str: str) -> Dict[str, Optional[str]]:
        """
        Parse location string into components

        Examples:
        - "Roma, Prati" → city: Roma, zone: Prati
        - "Milano, Zona Brera, Via Fiori Chiari" → city: Milano, zone: Brera, street: Via Fiori Chiari
        """
        if not location_str:
            return {"city": None, "zone": None, "street": None, "province": None}

        parts = [p.strip() for p in location_str.split(",")]

        city = parts[0] if len(parts) > 0 else None
        zone = parts[1] if len(parts) > 1 else None
        street = parts[2] if len(parts) > 2 else None

        # Extract province if present (usually 2 letters in parentheses)
        province = None
        if city:
            import re
            match = re.search(r'\(([A-Z]{2})\)', city)
            if match:
                province = match.group(1)
                city = re.sub(r'\s*\([A-Z]{2}\)', '', city).strip()

        return {
            "city": city,
            "zone": zone,
            "street": street,
            "province": province,
        }

    def _map_contract_type(self, data: Dict, source: str) -> str:
        """Map contract type to model enum"""

        # Check if explicitly provided
        if "contractType" in data:
            contract = data["contractType"].lower()
            if "vendita" in contract or "sale" in contract:
                return "sale"
            elif "affitto" in contract or "rent" in contract:
                return "rent"

        # Infer from source URL
        source_url = data.get("source_url", "").lower()
        if "vendita" in source_url or "sale" in source_url:
            return "sale"
        elif "affitto" in source_url or "rent" in source_url:
            return "rent"

        # Default
        return "sale"

    def _map_property_type(self, data: Dict) -> str:
        """Map property type to model enum"""

        # Check if explicitly provided
        if "propertyType" in data:
            prop_type = data["propertyType"].lower()
        else:
            # Infer from title or description
            title = (data.get("title") or "").lower()
            desc = (data.get("description") or "").lower()
            prop_type = f"{title} {desc}"

        # Map to standard types
        if "appartamento" in prop_type or "apartment" in prop_type:
            return "apartment"
        elif "villa" in prop_type:
            return "villa"
        elif "casa" in prop_type or "house" in prop_type:
            return "house"
        elif "ufficio" in prop_type or "office" in prop_type:
            return "office"
        elif "negozio" in prop_type or "commercial" in prop_type:
            return "commercial"
        else:
            return "other"

    def _estimate_coordinates(self, city: Optional[str]) -> tuple:
        """
        Estimate coordinates from city name
        (Placeholder - in production use geocoding API)

        Args:
            city: City name

        Returns:
            (latitude, longitude) tuple
        """
        # Placeholder coordinates for major Italian cities
        city_coords = {
            "roma": (41.9028, 12.4964),
            "milano": (45.4642, 9.1900),
            "napoli": (40.8518, 14.2681),
            "torino": (45.0703, 7.6869),
            "firenze": (43.7696, 11.2558),
            "bologna": (44.4949, 11.3426),
            "venezia": (45.4408, 12.3155),
            "verona": (45.4384, 10.9916),
            "genova": (44.4056, 8.9463),
            "palermo": (38.1157, 13.3615),
        }

        if city:
            city_lower = city.lower()
            for known_city, coords in city_coords.items():
                if known_city in city_lower:
                    return coords

        # Default (center of Italy)
        return (42.5, 12.5)


# Example usage
if __name__ == "__main__":
    repo = ScrapingRepository()

    # Sample data
    sample_data = {
        "source_url": "https://www.immobiliare.it/annunci/12345",
        "title": "Bellissimo appartamento in centro",
        "location": "Roma, Prati",
        "price": 350000,
        "sqm": 85,
        "rooms": 3,
        "bathrooms": 2,
        "hasElevator": True,
        "description": "Appartamento luminoso in posizione centrale",
    }

    property_id = repo.save_property(sample_data, "immobiliare_it")
    print(f"Saved property: {property_id}")
