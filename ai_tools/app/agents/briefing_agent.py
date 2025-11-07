"""
Daily Briefing Agent
Generates personalized daily briefing for the real estate agent
"""

from typing import Dict, Any
from datetime import datetime, timedelta
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient
from datapizza.tools import tool
import json

from app.config import settings
from app.utils import retry_with_exponential_backoff
from app.database import SessionLocal
from app.models import Activity, Match, Request, Property


SYSTEM_PROMPT = """Sei un assistente AI che genera briefing giornalieri per un agente immobiliare.

Il tuo compito è analizzare le attività, scadenze, opportunità e priorità della giornata
per fornire un briefing chiaro, actionable e motivante.

**Struttura del briefing:**

1. **📅 Panoramica Giornata**
   - Riassunto ad alto livello
   - Metriche chiave (appuntamenti, scadenze, opportunità)

2. **🎯 Priorità Oggi**
   - Top 3-5 azioni più importanti
   - Ordinato per urgenza e impatto

3. **📞 Appuntamenti e Follow-up**
   - Visite programmate
   - Chiamate da fare
   - Follow-up in scadenza

4. **💰 Opportunità da Cogliere**
   - Nuovi match ad alto score
   - Clienti VIP da contattare
   - Immobili che stanno per scadere

5. **⚠️ Alert e Scadenze**
   - Scadenze incarichi
   - Richieste urgenti senza risposta
   - Problematiche da risolvere

6. **📊 Metriche Performance**
   - Immobili attivi
   - Match generati
   - Attività completate

**Stile:**
- Conciso e scannable
- Usa emoji per rendere più leggibile
- Tono professionale ma motivante
- Focus su azioni concrete
- In italiano

Genera un briefing che faccia iniziare la giornata con chiarezza e focus.
"""


@tool
def get_today_activities_tool() -> str:
    """Get activities scheduled for today"""
    db = SessionLocal()
    try:
        today = datetime.now().date()
        tomorrow = today + timedelta(days=1)

        activities = db.query(Activity).filter(
            Activity.scheduledAt >= datetime.combine(today, datetime.min.time()),
            Activity.scheduledAt < datetime.combine(tomorrow, datetime.min.time()),
            Activity.status.in_(["scheduled", "in_progress"])
        ).all()

        results = [
            {
                "id": act.id,
                "title": act.title,
                "type": act.activityType,
                "scheduledAt": act.scheduledAt.isoformat() if act.scheduledAt else None,
                "priority": act.priority,
                "contactId": act.contactId,
                "propertyId": act.propertyId,
            }
            for act in activities
        ]

        return json.dumps({"success": True, "count": len(results), "activities": results}, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_overdue_activities_tool() -> str:
    """Get overdue activities"""
    db = SessionLocal()
    try:
        now = datetime.now()

        activities = db.query(Activity).filter(
            Activity.dueDate < now,
            Activity.status != "completed"
        ).all()

        results = [
            {
                "id": act.id,
                "title": act.title,
                "type": act.activityType,
                "dueDate": act.dueDate.isoformat() if act.dueDate else None,
                "priority": act.priority,
            }
            for act in activities
        ]

        return json.dumps({"success": True, "count": len(results), "activities": results}, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_high_score_matches_tool(min_score: int = 80) -> str:
    """Get recent high-score matches"""
    db = SessionLocal()
    try:
        matches = db.query(Match).filter(
            Match.scoreTotal >= min_score,
            Match.status == "suggested"
        ).order_by(Match.scoreTotal.desc()).limit(10).all()

        results = [
            {
                "id": match.id,
                "requestId": match.requestId,
                "propertyId": match.propertyId,
                "score": match.scoreTotal,
                "status": match.status,
            }
            for match in matches
        ]

        return json.dumps({"success": True, "count": len(results), "matches": results}, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_urgent_requests_tool() -> str:
    """Get urgent requests"""
    db = SessionLocal()
    try:
        requests = db.query(Request).filter(
            Request.status == "active",
            Request.urgency == "high"
        ).all()

        results = [
            {
                "id": req.id,
                "code": req.code,
                "contactId": req.contactId,
                "contractType": req.contractType,
                "urgency": req.urgency,
            }
            for req in requests
        ]

        return json.dumps({"success": True, "count": len(results), "requests": results}, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_properties_stats_tool() -> str:
    """Get properties statistics"""
    db = SessionLocal()
    try:
        total = db.query(Property).count()
        available = db.query(Property).filter(Property.status == "available").count()
        in_option = db.query(Property).filter(Property.status == "option").count()

        return json.dumps({
            "success": True,
            "stats": {
                "total": total,
                "available": available,
                "in_option": in_option,
            }
        }, ensure_ascii=False)
    finally:
        db.close()


def create_briefing_agent() -> Agent:
    """Create Daily Briefing Agent"""
    client = GoogleClient(
        api_key=settings.google_api_key,
        model=settings.google_model,
        temperature=0.7,
    )

    agent = Agent(
        name="briefing_agent",
        client=client,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            get_today_activities_tool,
            get_overdue_activities_tool,
            get_high_score_matches_tool,
            get_urgent_requests_tool,
            get_properties_stats_tool,
        ],
    )

    return agent


def generate_daily_briefing() -> Dict[str, Any]:
    """
    Generate daily briefing for the real estate agent.

    Returns:
        Dictionary with briefing content
    """
    agent = create_briefing_agent()

    today = datetime.now().strftime("%A %d %B %Y")

    prompt = f"""Genera il briefing giornaliero per oggi: {today}

Usa gli strumenti disponibili per raccogliere:
- Attività di oggi
- Attività in ritardo
- Match ad alto score
- Richieste urgenti
- Statistiche immobili

Poi genera un briefing strutturato e motivante seguendo il formato indicato.
"""

    # Create retry-wrapped execution function
    @retry_with_exponential_backoff()
    def _run_with_retry():
        return agent.run(prompt)

    try:
        # Run agent with automatic retry on failures
        response = _run_with_retry()

        return {
            "success": True,
            "date": today,
            "briefing": response.text,
            "generated_at": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Briefing Agent failed after retries: {str(e)}"
        }
