"""
Property Scoring Algorithm
Deterministic algorithm for calculating property-request match scores
"""

from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import json
import logging

from app.models import Property, Request

logger = logging.getLogger(__name__)


@dataclass
class ScoringWeights:
    """Configurable weights for score calculation"""
    location_match: float = 0.25
    price_range: float = 0.20
    property_type: float = 0.15
    size_match: float = 0.15
    rooms_match: float = 0.10
    features_match: float = 0.10
    condition_match: float = 0.05


class PropertyScorer:
    """Deterministic algorithm for property-request match scoring"""

    def __init__(self, weights: Optional[ScoringWeights] = None):
        self.weights = weights or ScoringWeights()

    def calculate_match_score(
        self,
        property: Property,
        request: Request
    ) -> Dict:
        """
        Calculate match score between property and request

        Returns:
            {
                "total_score": 0-100,
                "components": {
                    "location": score,
                    "price": score,
                    ...
                },
                "match_reasons": ["Prezzo nel budget", "Zona richiesta", ...],
                "mismatch_reasons": ["Manca garage", ...]
            }
        """
        components = {}
        reasons_match = []
        reasons_mismatch = []

        # 1. Location matching (città, zona)
        location_score, loc_reasons = self._calculate_location_score(property, request)
        components["location"] = location_score
        reasons_match.extend(loc_reasons["match"])
        reasons_mismatch.extend(loc_reasons["mismatch"])

        # 2. Price range matching
        price_score, price_reasons = self._calculate_price_score(property, request)
        components["price"] = price_score
        reasons_match.extend(price_reasons["match"])
        reasons_mismatch.extend(price_reasons["mismatch"])

        # 3. Property type matching
        type_score, type_reasons = self._calculate_type_score(property, request)
        components["property_type"] = type_score
        reasons_match.extend(type_reasons["match"])
        reasons_mismatch.extend(type_reasons["mismatch"])

        # 4. Size matching (mq)
        size_score, size_reasons = self._calculate_size_score(property, request)
        components["size"] = size_score
        reasons_match.extend(size_reasons["match"])
        reasons_mismatch.extend(size_reasons["mismatch"])

        # 5. Rooms matching
        rooms_score, rooms_reasons = self._calculate_rooms_score(property, request)
        components["rooms"] = rooms_score
        reasons_match.extend(rooms_reasons["match"])
        reasons_mismatch.extend(rooms_reasons["mismatch"])

        # 6. Features matching (garage, giardino, terrazzo, etc.)
        features_score, features_reasons = self._calculate_features_score(property, request)
        components["features"] = features_score
        reasons_match.extend(features_reasons["match"])
        reasons_mismatch.extend(features_reasons["mismatch"])

        # 7. Condition matching
        condition_score, condition_reasons = self._calculate_condition_score(property, request)
        components["condition"] = condition_score
        reasons_match.extend(condition_reasons["match"])
        reasons_mismatch.extend(condition_reasons["mismatch"])

        # Calculate weighted total score
        total_score = (
            location_score * self.weights.location_match +
            price_score * self.weights.price_range +
            type_score * self.weights.property_type +
            size_score * self.weights.size_match +
            rooms_score * self.weights.rooms_match +
            features_score * self.weights.features_match +
            condition_score * self.weights.condition_match
        )

        return {
            "total_score": round(total_score, 2),
            "components": components,
            "match_reasons": reasons_match,
            "mismatch_reasons": reasons_mismatch,
            "weights_used": {
                "location": self.weights.location_match,
                "price": self.weights.price_range,
                "type": self.weights.property_type,
                "size": self.weights.size_match,
                "rooms": self.weights.rooms_match,
                "features": self.weights.features_match,
                "condition": self.weights.condition_match,
            }
        }

    def _calculate_location_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate location match score"""
        score = 0.0
        reasons = {"match": [], "mismatch": []}

        # Parse cities from request (JSON array)
        try:
            search_cities = json.loads(request.searchCities) if request.searchCities else []
        except:
            search_cities = []

        # Parse zones from request (JSON array)
        try:
            search_zones = json.loads(request.searchZones) if request.searchZones else []
        except:
            search_zones = []

        # Check city match
        if property.city in search_cities:
            score += 60
            reasons["match"].append(f"Città richiesta: {property.city}")
        else:
            reasons["mismatch"].append(f"Città {property.city} non nelle preferenze")

        # Check zone match
        if property.zone and search_zones:
            if property.zone in search_zones:
                score += 40
                reasons["match"].append(f"Zona preferita: {property.zone}")
            else:
                reasons["mismatch"].append(f"Zona {property.zone} non richiesta")
        elif property.zone and not search_zones:
            # Zone not specified = neutral
            score += 20

        return min(score, 100), reasons

    def _calculate_price_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate price match score"""
        score = 0.0
        reasons = {"match": [], "mismatch": []}

        # Get property price based on contract type
        prop_price = (
            property.priceSale
            if request.contractType == "sale"
            else property.priceRentMonthly
        )

        if not prop_price:
            return 0, {"match": [], "mismatch": ["Prezzo immobile non disponibile"]}

        # Check if price is within budget
        if request.priceMax:
            if prop_price <= request.priceMax:
                # Calculate how well it fits the budget
                if request.priceMin and prop_price >= request.priceMin:
                    # Perfect fit in range
                    score = 100
                    reasons["match"].append(
                        f"Prezzo ideale: €{int(prop_price):,} (budget: €{int(request.priceMin):,}-€{int(request.priceMax):,})"
                    )
                else:
                    # Below min or no min specified
                    percentage = (prop_price / request.priceMax) * 100
                    score = min(100, 70 + (percentage / 100 * 30))
                    reasons["match"].append(
                        f"Prezzo nel budget: €{int(prop_price):,} (max: €{int(request.priceMax):,})"
                    )
            else:
                # Over budget
                over_percentage = ((prop_price - request.priceMax) / request.priceMax) * 100
                if over_percentage <= 10:
                    # Slightly over (10%) - still acceptable
                    score = 50
                    reasons["mismatch"].append(
                        f"Prezzo leggermente alto: €{int(prop_price):,} (max: €{int(request.priceMax):,})"
                    )
                else:
                    score = max(0, 50 - (over_percentage * 2))
                    reasons["mismatch"].append(
                        f"Fuori budget: €{int(prop_price):,} (max: €{int(request.priceMax):,})"
                    )
        else:
            # No max price specified
            score = 50
            reasons["match"].append(f"Prezzo: €{int(prop_price):,}")

        return min(score, 100), reasons

    def _calculate_type_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate property type match score"""
        score = 0.0
        reasons = {"match": [], "mismatch": []}

        # Parse property types from request (JSON array)
        try:
            requested_types = json.loads(request.propertyTypes) if request.propertyTypes else []
        except:
            requested_types = []

        if not requested_types:
            # No preference specified
            score = 50
            reasons["match"].append(f"Tipologia: {property.propertyType}")
        elif property.propertyType in requested_types:
            score = 100
            reasons["match"].append(f"Tipologia richiesta: {property.propertyType}")
        else:
            score = 20
            reasons["mismatch"].append(
                f"Tipologia {property.propertyType} non tra le preferenze"
            )

        return score, reasons

    def _calculate_size_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate size match score"""
        score = 0.0
        reasons = {"match": [], "mismatch": []}

        if not property.sqmCommercial:
            return 50, {"match": ["Superficie non specificata"], "mismatch": []}

        prop_sqm = property.sqmCommercial

        # Check sqm range
        if request.sqmMin and request.sqmMax:
            if request.sqmMin <= prop_sqm <= request.sqmMax:
                score = 100
                reasons["match"].append(
                    f"Superficie ideale: {int(prop_sqm)}mq (richiesti: {int(request.sqmMin)}-{int(request.sqmMax)}mq)"
                )
            elif prop_sqm < request.sqmMin:
                diff_percentage = ((request.sqmMin - prop_sqm) / request.sqmMin) * 100
                score = max(0, 100 - diff_percentage * 2)
                reasons["mismatch"].append(
                    f"Superficie ridotta: {int(prop_sqm)}mq (min: {int(request.sqmMin)}mq)"
                )
            else:  # prop_sqm > request.sqmMax
                diff_percentage = ((prop_sqm - request.sqmMax) / request.sqmMax) * 100
                if diff_percentage <= 15:
                    score = 80
                    reasons["match"].append(
                        f"Superficie generosa: {int(prop_sqm)}mq (max: {int(request.sqmMax)}mq)"
                    )
                else:
                    score = max(0, 80 - diff_percentage)
                    reasons["mismatch"].append(
                        f"Superficie eccessiva: {int(prop_sqm)}mq (max: {int(request.sqmMax)}mq)"
                    )
        elif request.sqmMin:
            if prop_sqm >= request.sqmMin:
                score = 100
                reasons["match"].append(
                    f"Superficie adeguata: {int(prop_sqm)}mq (min: {int(request.sqmMin)}mq)"
                )
            else:
                diff_percentage = ((request.sqmMin - prop_sqm) / request.sqmMin) * 100
                score = max(0, 100 - diff_percentage * 2)
                reasons["mismatch"].append(
                    f"Superficie insufficiente: {int(prop_sqm)}mq (min: {int(request.sqmMin)}mq)"
                )
        else:
            score = 50
            reasons["match"].append(f"Superficie: {int(prop_sqm)}mq")

        return min(score, 100), reasons

    def _calculate_rooms_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate rooms match score"""
        score = 0.0
        reasons = {"match": [], "mismatch": []}

        # Rooms
        if request.roomsMin and property.rooms:
            if property.rooms >= request.roomsMin:
                if request.roomsMax and property.rooms <= request.roomsMax:
                    score = 100
                    reasons["match"].append(
                        f"Numero locali perfetto: {property.rooms}"
                    )
                else:
                    score = 80
                    reasons["match"].append(
                        f"Abbastanza locali: {property.rooms} (min: {request.roomsMin})"
                    )
            else:
                score = max(0, (property.rooms / request.roomsMin) * 100)
                reasons["mismatch"].append(
                    f"Pochi locali: {property.rooms} (min: {request.roomsMin})"
                )
        elif property.rooms:
            score = 50
            reasons["match"].append(f"Locali: {property.rooms}")
        else:
            score = 50
            reasons["match"].append("Numero locali non specificato")

        # Bedrooms (bonus)
        if request.bedroomsMin and property.bedrooms:
            if property.bedrooms >= request.bedroomsMin:
                reasons["match"].append(f"Camere sufficienti: {property.bedrooms}")
            else:
                reasons["mismatch"].append(
                    f"Poche camere: {property.bedrooms} (min: {request.bedroomsMin})"
                )

        return min(score, 100), reasons

    def _calculate_features_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate features match score"""
        score = 100.0  # Start at 100, subtract for missing required features
        reasons = {"match": [], "mismatch": []}

        required_features = []

        # Check each required feature
        if request.requiresElevator:
            required_features.append("ascensore")
            if property.hasElevator:
                reasons["match"].append("Ha ascensore (richiesto)")
            else:
                score -= 25
                reasons["mismatch"].append("Manca ascensore (richiesto)")

        if request.requiresParking:
            required_features.append("posto auto")
            if property.hasParking or property.hasGarage:
                reasons["match"].append("Ha posto auto/garage (richiesto)")
            else:
                score -= 25
                reasons["mismatch"].append("Manca posto auto (richiesto)")

        if request.requiresGarden:
            required_features.append("giardino")
            if property.hasGarden:
                reasons["match"].append("Ha giardino (richiesto)")
            else:
                score -= 25
                reasons["mismatch"].append("Manca giardino (richiesto)")

        if request.requiresTerrace:
            required_features.append("terrazzo")
            if property.hasTerrace:
                reasons["match"].append("Ha terrazzo (richiesto)")
            else:
                score -= 25
                reasons["mismatch"].append("Manca terrazzo (richiesto)")

        # Bonus features (not required but nice to have)
        bonus_features = []
        if property.hasBalcony:
            bonus_features.append("balcone")
        if property.hasCellar:
            bonus_features.append("cantina")
        if property.hasAlarm:
            bonus_features.append("allarme")
        if property.furnished:
            bonus_features.append("arredato")

        if bonus_features:
            reasons["match"].append(f"Bonus: {', '.join(bonus_features)}")

        # If no required features, give neutral score
        if not required_features:
            score = 70
            if bonus_features:
                reasons["match"].append(f"Caratteristiche extra: {', '.join(bonus_features)}")

        return max(0, min(score, 100)), reasons

    def _calculate_condition_score(
        self,
        property: Property,
        request: Request
    ) -> Tuple[float, Dict[str, List[str]]]:
        """Calculate condition match score"""
        score = 50.0  # Neutral by default
        reasons = {"match": [], "mismatch": []}

        if property.condition:
            condition_scores = {
                "nuovo": 100,
                "ottimo": 90,
                "buono": 70,
                "abitabile": 50,
                "da ristrutturare": 30
            }

            score = condition_scores.get(property.condition.lower(), 50)
            reasons["match"].append(f"Condizioni: {property.condition}")

            # Add energy class info if available
            if property.energyClass:
                reasons["match"].append(f"Classe energetica: {property.energyClass}")

        return score, reasons

    def get_sorted_matches(
        self,
        request: Request,
        properties: List[Property],
        min_score: float = 0
    ) -> List[Dict]:
        """
        Return properties sorted by match score

        Args:
            request: Request to match against
            properties: List of properties to score
            min_score: Minimum score threshold (0-100)

        Returns:
            List of dicts with property and score_data, sorted by score (descending)
        """
        matches = []

        for property in properties:
            # Skip if wrong contract type
            if request.contractType and property.contractType != request.contractType:
                continue

            score_data = self.calculate_match_score(property, request)

            if score_data["total_score"] >= min_score:
                matches.append({
                    "property": property,
                    "score_data": score_data
                })

        # Sort by score descending
        matches.sort(key=lambda x: x["score_data"]["total_score"], reverse=True)

        logger.info(
            f"Scored {len(properties)} properties for request {request.id}: "
            f"{len(matches)} matches above threshold {min_score}"
        )

        return matches
