"""
Suggested Queries Generator
Generates contextual suggested questions for the chatbot
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging

from app.database import SessionLocal
from app.models import Activity, Request, Property, Match

logger = logging.getLogger(__name__)


class SuggestedQueriesGenerator:
    """Generate contextual suggested queries based on user context and data"""

    def __init__(self):
        self.db = SessionLocal()

    def __del__(self):
        if hasattr(self, 'db'):
            self.db.close()

    def generate_daily_queries(self, user_context: Optional[Dict] = None) -> List[str]:
        """
        Generate personalized daily queries based on context and data.

        Args:
            user_context: Optional context dict with current page, filters, etc.

        Returns:
            List of suggested query strings (max 5)
        """
        queries = []

        try:
            # Context-based queries
            if user_context:
                page = user_context.get("current_page", "")

                if "requests" in page.lower():
                    queries.extend(self._get_request_queries())
                elif "properties" in page.lower():
                    queries.extend(self._get_property_queries())
                elif "contacts" in page.lower():
                    queries.extend(self._get_contact_queries())
                elif "activities" in page.lower() or "dashboard" in page.lower():
                    queries.extend(self._get_activity_queries())

            # Data-driven queries (always useful)
            queries.extend(self._get_data_driven_queries())

            # Remove duplicates and limit to 5
            unique_queries = list(dict.fromkeys(queries))  # Preserves order
            return unique_queries[:5]

        except Exception as e:
            logger.error(f"Error generating queries: {e}")
            return self._get_fallback_queries()

    def _get_request_queries(self) -> List[str]:
        """Queries specific to requests page"""
        return [
            "Quali sono le richieste più urgenti senza match?",
            "Mostrami le richieste attive con budget sopra i 500k",
            "Quali richieste hanno ricevuto nuovi match nelle ultime 24 ore?"
        ]

    def _get_property_queries(self) -> List[str]:
        """Queries specific to properties page"""
        return [
            "Quali immobili sono disponibili da più di 60 giorni?",
            "Analizza il mio portfolio per zona",
            "Quali immobili hanno il miglior potenziale di vendita?"
        ]

    def _get_contact_queries(self) -> List[str]:
        """Queries specific to contacts page"""
        return [
            "Chi sono i clienti VIP che non ho contattato negli ultimi 15 giorni?",
            "Quali contatti hanno richieste attive ma nessun match recente?",
            "Mostrami i clienti con budget sopra i 300k"
        ]

    def _get_activity_queries(self) -> List[str]:
        """Queries specific to activities/dashboard"""
        queries = []

        # Check for pending activities
        try:
            pending_count = self.db.query(Activity).filter(
                Activity.status.in_(["scheduled", "in_progress"])
            ).count()

            if pending_count > 0:
                queries.append(f"Quali sono le mie {pending_count} attività in programma questa settimana?")

            # Check for overdue
            overdue_count = self.db.query(Activity).filter(
                Activity.status != "completed",
                Activity.dueDate < datetime.now()
            ).count()

            if overdue_count > 0:
                queries.append(f"Ho {overdue_count} attività in ritardo, quali sono le priorità?")
            else:
                queries.append("Quali attività dovrei programmare per questa settimana?")

        except Exception as e:
            logger.error(f"Error getting activity queries: {e}")

        return queries

    def _get_data_driven_queries(self) -> List[str]:
        """Generate queries based on actual data patterns"""
        queries = []

        try:
            # Check for high-score matches
            high_score_matches = self.db.query(Match).filter(
                Match.scoreTotal >= 80,
                Match.status == "suggested"
            ).count()

            if high_score_matches > 0:
                queries.append(f"Mostrami i {min(high_score_matches, 10)} migliori match con score sopra 80")

            # Check for urgent requests
            urgent_requests = self.db.query(Request).filter(
                Request.status == "active",
                Request.urgency == "high"
            ).count()

            if urgent_requests > 0:
                queries.append(f"Quali sono le {urgent_requests} richieste urgenti e come posso aiutarle?")

            # Check for stale properties
            stale_threshold = datetime.now() - timedelta(days=60)
            stale_properties = self.db.query(Property).filter(
                Property.status == "available",
                Property.createdAt < stale_threshold
            ).count()

            if stale_properties > 0:
                queries.append(f"Ho {stale_properties} immobili fermi da oltre 60 giorni, come valorizzarli?")

            # Market insights
            active_properties = self.db.query(Property).filter(
                Property.status == "available"
            ).count()

            active_requests = self.db.query(Request).filter(
                Request.status == "active"
            ).count()

            if active_properties > 0 and active_requests > 0:
                ratio = active_properties / active_requests
                if ratio > 2:
                    queries.append("Ho più offerta che domanda, quali strategie di marketing suggerisci?")
                elif ratio < 0.5:
                    queries.append("Ho più domanda che offerta, quali immobili dovrei cercare?")

        except Exception as e:
            logger.error(f"Error generating data-driven queries: {e}")

        return queries

    def _get_fallback_queries(self) -> List[str]:
        """Fallback queries if data access fails"""
        return [
            "Come sta andando il mio portfolio questo mese?",
            "Quali sono le zone con più richiesta?",
            "Mostrami un'analisi del mercato immobiliare",
            "Quali opportunità di business posso cogliere oggi?",
            "Dammi consigli per ottimizzare il mio lavoro"
        ]

    def get_contextual_queries(
        self,
        entity_type: str,
        entity_id: Optional[str] = None
    ) -> List[str]:
        """
        Get queries specific to a particular entity.

        Args:
            entity_type: Type of entity (property, contact, request)
            entity_id: Optional entity ID for specific queries

        Returns:
            List of contextual queries
        """
        queries = []

        if entity_type == "property" and entity_id:
            queries = [
                f"Quali clienti potrebbero essere interessati all'immobile {entity_id}?",
                f"Dammi un'analisi di mercato per l'immobile {entity_id}",
                f"Come posso valorizzare al meglio l'immobile {entity_id}?"
            ]

        elif entity_type == "contact" and entity_id:
            queries = [
                f"Quali immobili posso proporre al cliente {entity_id}?",
                f"Dammi un profilo completo del cliente {entity_id}",
                f"Quando dovrei ricontattare il cliente {entity_id}?"
            ]

        elif entity_type == "request" and entity_id:
            queries = [
                f"Calcola i migliori match per la richiesta {entity_id}",
                f"Quali immobili soddisfano perfettamente la richiesta {entity_id}?",
                f"Come posso soddisfare al meglio la richiesta {entity_id}?"
            ]

        return queries


def generate_suggested_queries(context: Optional[Dict] = None) -> List[str]:
    """
    Utility function to generate suggested queries.

    Args:
        context: Optional context dictionary

    Returns:
        List of suggested query strings
    """
    generator = SuggestedQueriesGenerator()
    return generator.generate_daily_queries(context)


# Example usage
if __name__ == "__main__":
    import json

    # Test with different contexts
    contexts = [
        {"current_page": "/requests"},
        {"current_page": "/properties"},
        {"current_page": "/dashboard"},
        None  # No context
    ]

    for ctx in contexts:
        print(f"\nContext: {ctx}")
        queries = generate_suggested_queries(ctx)
        print(json.dumps(queries, indent=2, ensure_ascii=False))
