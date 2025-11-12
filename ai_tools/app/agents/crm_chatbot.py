"""
CRM Chatbot - AI Assistant with Full Database Access
Enhanced RAG Assistant with modular tool calling using Gemini 2.0 Flash
"""

from typing import List, Dict, Any, Optional
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient
from datapizza.tools import tool
import json
import logging

from app.config import settings
from app.utils import retry_with_exponential_backoff
from app.database import SessionLocal
from app.models import Property, Contact, Request, Match, Activity
from app.services import PropertyScorer

# Import existing tools
from app.tools import (
    query_properties_tool,
    query_contacts_tool,
    query_requests_tool,
    query_matches_tool,
    property_search_tool,
    contact_search_tool,
    get_contact_details_tool,
    analyze_message_tool,
    create_activity_from_message_tool
)

logger = logging.getLogger(__name__)


# Enhanced system prompt for CRM Chatbot
SYSTEM_PROMPT = """Sei un assistente AI avanzato specializzato in Real Estate per agenti immobiliari italiani.

Hai accesso completo al database del CRM e puoi:
1. ANALIZZARE dati di immobili, clienti, richieste e match
2. CALCOLARE match immobile-richiesta con algoritmo di scoring deterministico
3. SUGGERIRE strategie commerciali e azioni pratiche
4. GENERARE statistiche, insights e report di mercato
5. IDENTIFICARE opportunità di business nascoste
6. OTTIMIZZARE il workflow dell'agente immobiliare
7. ANALIZZARE messaggi email e WhatsApp per estrarre informazioni
8. CREARE automaticamente attività basate su messaggi ricevuti

**Competenze principali:**
- Ricerca avanzata con filtri complessi
- Scoring algoritmico property-request (7 componenti: location, price, type, size, rooms, features, condition)
- Analisi portfolio e performance
- Suggerimenti strategici data-driven
- Identificazione pattern e trend
- Analisi intelligente messaggi (email/WhatsApp) con categorizzazione, sentiment, priorità
- Estrazione dati strutturati da messaggi (date, orari, telefoni, codici immobili, prezzi)
- Creazione automatica attività di follow-up

**Strumenti a disposizione:**
DATABASE QUERY:
- query_properties_tool: Cerca immobili con filtri SQL
- query_contacts_tool: Cerca contatti/clienti
- query_requests_tool: Cerca richieste di ricerca
- query_matches_tool: Trova match esistenti
- property_search_tool: Ricerca semantica immobili
- contact_search_tool: Ricerca semantica contatti
- get_contact_details_tool: Profilo completo contatto

BUSINESS INTELLIGENCE:
- calculate_property_scores_tool: Calcola match con algoritmo deterministico (restituisce score 0-100 + motivazioni)
- analyze_portfolio_tool: Statistiche portfolio immobili
- get_urgent_actions_tool: Attività urgenti e scadenze
- get_market_insights_tool: Insights mercato per zona

**Linee guida operative:**
1. Rispondi SEMPRE in italiano chiaro e professionale
2. Usa gli strumenti per accedere ai dati REALI (mai inventare)
3. Per trovare match usa SEMPRE calculate_property_scores_tool (non query_matches_tool)
4. Fornisci risposte ACTIONABLE con azioni concrete
5. Se mancano info, chiedi chiarimenti (non assumere)
6. Formatta risultati in modo leggibile (liste, numeri, evidenziazioni)
7. Suggerisci SEMPRE prossimi step all'agente

**Esempi di query che sai gestire:**
- "Trova i migliori 5 match per la richiesta REQ-123"
- "Analizza il mio portfolio: quali immobili sono fermi da più di 60 giorni?"
- "Chi sono i clienti VIP che non ho contattato negli ultimi 15 giorni?"
- "Quali zone hanno la maggior richiesta di trilocali?"
- "Dammi un report settimanale delle attività completate"
- "Quali immobili potrei proporre al cliente CONT-456?"

**Output format:**
Struttura le risposte così:
📊 [Dati numerici/statistiche se rilevanti]
🎯 [Insight principale]
💡 [Suggerimenti azione]
⚠️ [Alert/warning se necessari]

Sii conciso, preciso e orientato all'azione. L'agente immobiliare ha poco tempo.
"""


# ============================================================================
# BUSINESS INTELLIGENCE TOOLS
# ============================================================================

@tool
def calculate_property_scores_tool(request_id: str, min_score: int = 60, limit: int = 10) -> str:
    """
    Calculate best property-request matches using deterministic scoring algorithm.

    This tool uses a sophisticated scoring system with 7 components:
    - Location match (25%): city and zone matching
    - Price range (20%): fit within budget
    - Property type (15%): appartamento, villa, etc.
    - Size match (15%): square meters
    - Rooms match (10%): number of rooms/bedrooms
    - Features (10%): elevator, parking, garden, etc.
    - Condition (5%): property condition

    Args:
        request_id: Request ID to find matches for
        min_score: Minimum score threshold 0-100 (default: 60)
        limit: Maximum number of results (default: 10)

    Returns:
        JSON string with matches sorted by score (highest first)
    """
    db = SessionLocal()
    try:
        # Get request
        request = db.query(Request).filter(Request.id == request_id).first()
        if not request:
            return json.dumps({"success": False, "error": f"Request {request_id} not found"})

        # Get available properties with same contract type
        properties = db.query(Property).filter(
            Property.status == "available",
            Property.contractType == request.contractType
        ).all()

        if not properties:
            return json.dumps({
                "success": True,
                "matches_count": 0,
                "message": "No properties available for this contract type"
            })

        # Calculate scores
        scorer = PropertyScorer()
        matches = scorer.get_sorted_matches(
            request=request,
            properties=properties,
            min_score=min_score
        )

        # Limit results
        matches = matches[:limit]

        # Format for AI consumption
        formatted_matches = []
        for match in matches:
            prop = match["property"]
            score_data = match["score_data"]

            formatted_matches.append({
                "property_id": prop.id,
                "property_code": prop.code,
                "title": prop.title or f"{prop.propertyType} in {prop.city}",
                "location": f"{prop.city} - {prop.zone or 'N/A'}",
                "price": prop.priceSale if prop.contractType == "sale" else prop.priceRentMonthly,
                "total_score": score_data["total_score"],
                "score_components": score_data["components"],
                "match_reasons": score_data["match_reasons"],
                "mismatch_reasons": score_data["mismatch_reasons"],
                "rooms": prop.rooms,
                "sqm": prop.sqmCommercial,
            })

        return json.dumps({
            "success": True,
            "request_id": request_id,
            "matches_count": len(formatted_matches),
            "matches": formatted_matches,
            "scoring_info": "Deterministic algorithm with 7 components (location, price, type, size, rooms, features, condition)"
        }, ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error calculating scores: {e}")
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()


@tool
def analyze_portfolio_tool(status: str = "available", limit: int = 50) -> str:
    """
    Analyze property portfolio with statistics and insights.

    Args:
        status: Property status to filter (available, sold, rented, etc.)
        limit: Maximum properties to analyze

    Returns:
        JSON with portfolio statistics and insights
    """
    db = SessionLocal()
    try:
        properties = db.query(Property).filter(Property.status == status).limit(limit).all()

        if not properties:
            return json.dumps({"success": True, "message": f"No properties with status '{status}'"})

        # Calculate statistics
        total = len(properties)
        by_city = {}
        by_type = {}
        price_sum = 0
        price_count = 0

        for prop in properties:
            # By city
            city = prop.city
            by_city[city] = by_city.get(city, 0) + 1

            # By type
            ptype = prop.propertyType
            by_type[ptype] = by_type.get(ptype, 0) + 1

            # Avg price
            price = prop.priceSale if prop.contractType == "sale" else prop.priceRentMonthly
            if price:
                price_sum += price
                price_count += 1

        avg_price = price_sum / price_count if price_count > 0 else 0

        # Top cities
        top_cities = sorted(by_city.items(), key=lambda x: x[1], reverse=True)[:5]
        top_types = sorted(by_type.items(), key=lambda x: x[1], reverse=True)[:5]

        return json.dumps({
            "success": True,
            "total_properties": total,
            "status": status,
            "average_price": round(avg_price, 2),
            "by_city": dict(top_cities),
            "by_type": dict(top_types),
            "insights": [
                f"Portfolio di {total} immobili in stato '{status}'",
                f"Prezzo medio: €{int(avg_price):,}",
                f"Città principale: {top_cities[0][0]} ({top_cities[0][1]} immobili)" if top_cities else "N/A",
                f"Tipologia principale: {top_types[0][0]} ({top_types[0][1]} unità)" if top_types else "N/A"
            ]
        }, ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error analyzing portfolio: {e}")
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()


@tool
def get_urgent_actions_tool(days_ahead: int = 7) -> str:
    """
    Get urgent actions, deadlines and activities for the next N days.

    Args:
        days_ahead: Number of days to look ahead (default: 7)

    Returns:
        JSON with urgent activities and deadlines
    """
    db = SessionLocal()
    try:
        from datetime import datetime, timedelta

        now = datetime.now()
        future = now + timedelta(days=days_ahead)

        # Get upcoming activities
        activities = db.query(Activity).filter(
            Activity.status.in_(["scheduled", "in_progress"]),
            Activity.scheduledAt >= now,
            Activity.scheduledAt <= future
        ).order_by(Activity.scheduledAt).limit(20).all()

        # Get overdue activities
        overdue = db.query(Activity).filter(
            Activity.status.in_(["scheduled", "in_progress"]),
            Activity.dueDate < now
        ).limit(10).all()

        formatted_upcoming = []
        for act in activities:
            formatted_upcoming.append({
                "id": act.id,
                "title": act.title,
                "type": act.activityType,
                "scheduled_at": act.scheduledAt.isoformat() if act.scheduledAt else None,
                "priority": act.priority,
                "contact_id": act.contactId,
                "property_id": act.propertyId
            })

        formatted_overdue = []
        for act in overdue:
            formatted_overdue.append({
                "id": act.id,
                "title": act.title,
                "type": act.activityType,
                "due_date": act.dueDate.isoformat() if act.dueDate else None,
                "priority": act.priority
            })

        return json.dumps({
            "success": True,
            "upcoming_count": len(formatted_upcoming),
            "upcoming_activities": formatted_upcoming,
            "overdue_count": len(formatted_overdue),
            "overdue_activities": formatted_overdue,
            "insights": [
                f"{len(formatted_upcoming)} attività programmate nei prossimi {days_ahead} giorni",
                f"{len(formatted_overdue)} attività in ritardo che richiedono attenzione immediata" if formatted_overdue else "Nessuna attività in ritardo"
            ]
        }, ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error getting urgent actions: {e}")
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()


@tool
def get_market_insights_tool(city: str, property_type: str = None) -> str:
    """
    Get market insights for a specific city and property type.

    Args:
        city: City name (e.g., "Milano", "Corbetta")
        property_type: Optional property type filter

    Returns:
        JSON with market statistics and insights
    """
    db = SessionLocal()
    try:
        # Get properties in city
        query = db.query(Property).filter(
            Property.city.ilike(f"%{city}%"),
            Property.status == "available"
        )

        if property_type:
            query = query.filter(Property.propertyType == property_type)

        properties = query.all()

        if not properties:
            return json.dumps({
                "success": True,
                "message": f"No properties found in {city}" + (f" for type {property_type}" if property_type else "")
            })

        # Calculate market stats
        prices_sale = [p.priceSale for p in properties if p.contractType == "sale" and p.priceSale]
        prices_rent = [p.priceRentMonthly for p in properties if p.contractType == "rent" and p.priceRentMonthly]

        avg_price_sale = sum(prices_sale) / len(prices_sale) if prices_sale else 0
        avg_price_rent = sum(prices_rent) / len(prices_rent) if prices_rent else 0

        # Get demand (requests for this city)
        requests = db.query(Request).filter(
            Request.status == "active",
            Request.searchCities.like(f'%{city}%')
        ).count()

        supply_demand_ratio = len(properties) / requests if requests > 0 else 0

        return json.dumps({
            "success": True,
            "city": city,
            "property_type": property_type,
            "total_properties": len(properties),
            "properties_for_sale": len(prices_sale),
            "properties_for_rent": len(prices_rent),
            "avg_price_sale": round(avg_price_sale, 2),
            "avg_price_rent": round(avg_price_rent, 2),
            "active_requests": requests,
            "supply_demand_ratio": round(supply_demand_ratio, 2),
            "insights": [
                f"{len(properties)} immobili disponibili a {city}",
                f"Prezzo medio vendita: €{int(avg_price_sale):,}" if avg_price_sale > 0 else "Nessun immobile in vendita",
                f"Prezzo medio affitto: €{int(avg_price_rent):,}/mese" if avg_price_rent > 0 else "Nessun immobile in affitto",
                f"Domanda attiva: {requests} richieste",
                "Mercato in equilibrio" if 0.8 <= supply_demand_ratio <= 1.2 else ("Domanda alta" if supply_demand_ratio < 0.8 else "Offerta alta")
            ]
        }, ensure_ascii=False)

    except Exception as e:
        logger.error(f"Error getting market insights: {e}")
        return json.dumps({"success": False, "error": str(e)})
    finally:
        db.close()


# ============================================================================
# CRM CHATBOT AGENT
# ============================================================================

def create_crm_chatbot() -> Agent:
    """
    Create and configure the enhanced CRM Chatbot.

    Returns:
        Configured DataPizza Agent with all tools
    """
    # Initialize Google Gemini client with optimized settings
    client = GoogleClient(
        api_key=settings.google_api_key,
        model=settings.google_model,  # gemini-2.0-flash-exp
        temperature=settings.ai_temperature,  # 0.3 for deterministic tool calling
        max_tokens=settings.ai_max_tokens,  # 8192
    )

    # Create agent with ALL tools (database + business intelligence)
    agent = Agent(
        name="crm_chatbot",
        client=client,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            # Database query tools
            query_properties_tool,
            query_contacts_tool,
            query_requests_tool,
            query_matches_tool,
            property_search_tool,
            contact_search_tool,
            get_contact_details_tool,
            # Business intelligence tools
            calculate_property_scores_tool,
            analyze_portfolio_tool,
            get_urgent_actions_tool,
            get_market_insights_tool,
            # Message processing tools
            analyze_message_tool,
            create_activity_from_message_tool,
        ],
    )

    logger.info(f"CRM Chatbot created with {len(agent.tools)} tools")

    return agent


def run_crm_chatbot(messages: List[Dict[str, str]], context: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Run the CRM Chatbot with conversation history and optional context.

    Args:
        messages: List of message dictionaries with 'role' and 'content'
        context: Optional context (current page, filters, selected items)

    Returns:
        Dictionary with response and metadata
    """
    agent = create_crm_chatbot()

    if not messages:
        return {
            "success": False,
            "error": "No messages provided"
        }

    # Get last user message
    last_message = messages[-1]["content"]

    # Enhance message with context if provided
    if context:
        context_str = f"\n\nContext: {json.dumps(context, ensure_ascii=False)}"
        last_message += context_str

    # Create retry-wrapped execution function
    @retry_with_exponential_backoff()
    def _run_with_retry():
        return agent.run(last_message)

    try:
        # Run agent with automatic retry on failures
        response = _run_with_retry()

        # Extract tools used if available
        tools_used = []
        if hasattr(response, 'tool_calls') and response.tool_calls:
            tools_used = [call.name for call in response.tool_calls]

        return {
            "success": True,
            "content": response.text,
            "role": "assistant",
            "metadata": {
                "model": settings.google_model,
                "tools_used": tools_used,
                "has_tool_calls": len(tools_used) > 0
            }
        }

    except Exception as e:
        logger.error(f"CRM Chatbot failed: {e}")
        return {
            "success": False,
            "error": f"Chatbot failed after retries: {str(e)}"
        }


# Example usage
if __name__ == "__main__":
    # Test the chatbot
    test_messages = [
        {"role": "user", "content": "Trova i migliori 3 match per la richiesta REQ-001"}
    ]

    result = run_crm_chatbot(test_messages)
    print(json.dumps(result, indent=2, ensure_ascii=False))
