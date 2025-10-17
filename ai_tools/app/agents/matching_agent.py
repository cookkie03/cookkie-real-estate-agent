"""
AI-Powered Matching Agent
Enhances property-request matching with semantic AI analysis
"""

from typing import Dict, Any, List
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient
from datapizza.tools import tool
import json

from app.config import settings
from app.database import SessionLocal
from app.models import Property, Request, Match


SYSTEM_PROMPT = """Sei un AI specializzato nel matching immobiliare.

Il tuo compito è analizzare richieste di clienti e immobili per trovare i migliori abbinamenti,
considerando sia criteri oggettivi (prezzo, dimensioni, posizione) che preferenze nascoste
(stile di vita, priorità implicite, contesto familiare).

**Approccio:**
1. Analizza la richiesta del cliente identificando:
   - Requisiti espliciti (prezzo, locali, zona)
   - Preferenze implicite (famiglia, stile di vita, lavoro)
   - Priorità (cosa è veramente importante vs opzionale)

2. Valuta ogni immobile considerando:
   - Match criteri oggettivi (score algoritmo deterministico)
   - Match semantico (quanto l'immobile soddisfa le esigenze reali)
   - Punti di forza da evidenziare
   - Potenziali obiezioni da anticipare

3. Genera motivi del match in linguaggio naturale che aiutino
   l'agente a presentare l'immobile in modo convincente.

**Output:**
Fornisci per ogni match:
- Score finale (0-100)
- Motivi principali (3-5 bullet points in italiano)
- Punti di forza da evidenziare
- Eventuali punti deboli e come mitigarli
- Suggerimento su come presentare l'immobile al cliente

Sii conciso, pratico e orientato all'azione.
"""


@tool
def get_request_details_tool(request_id: str) -> str:
    """Get detailed request information"""
    db = SessionLocal()
    try:
        req = db.query(Request).filter(Request.id == request_id).first()
        if not req:
            return json.dumps({"success": False, "error": "Request not found"})

        return json.dumps({
            "success": True,
            "request": {
                "id": req.id,
                "contractType": req.contractType,
                "priceMin": req.priceMin,
                "priceMax": req.priceMax,
                "cities": json.loads(req.searchCities) if req.searchCities else [],
                "propertyTypes": json.loads(req.propertyTypes) if req.propertyTypes else [],
                "sqmMin": req.sqmMin,
                "roomsMin": req.roomsMin,
                "bedroomsMin": req.bedroomsMin,
                "requiresElevator": req.requiresElevator,
                "requiresParking": req.requiresParking,
                "requiresGarden": req.requiresGarden,
                "notes": req.notes,
            }
        }, ensure_ascii=False)
    finally:
        db.close()


@tool
def get_property_details_tool(property_id: str) -> str:
    """Get detailed property information"""
    db = SessionLocal()
    try:
        prop = db.query(Property).filter(Property.id == property_id).first()
        if not prop:
            return json.dumps({"success": False, "error": "Property not found"})

        return json.dumps({
            "success": True,
            "property": {
                "id": prop.id,
                "title": prop.title,
                "address": f"{prop.street}, {prop.city}",
                "propertyType": prop.propertyType,
                "contractType": prop.contractType,
                "price": prop.priceSale if prop.contractType == "sale" else prop.priceRentMonthly,
                "sqm": prop.sqmCommercial,
                "rooms": prop.rooms,
                "bedrooms": prop.bedrooms,
                "floor": prop.floor,
                "hasElevator": prop.hasElevator,
                "hasParking": prop.hasParking or prop.hasGarage,
                "hasGarden": prop.hasGarden,
                "hasTerrace": prop.hasTerrace,
                "energyClass": prop.energyClass,
                "condition": prop.condition,
                "description": prop.description,
                "highlights": prop.highlights,
            }
        }, ensure_ascii=False)
    finally:
        db.close()


def create_matching_agent() -> Agent:
    """Create AI Matching Agent"""
    client = GoogleClient(
        api_key=settings.google_api_key,
        model=settings.google_model,
        temperature=0.5,  # Lower temperature for more consistent analysis
    )

    agent = Agent(
        name="matching_agent",
        client=client,
        system_prompt=SYSTEM_PROMPT,
        tools=[get_request_details_tool, get_property_details_tool],
    )

    return agent


def enhance_match(
    request_id: str,
    property_id: str,
    algorithmic_score: int
) -> Dict[str, Any]:
    """
    Enhance a match with AI semantic analysis.

    Args:
        request_id: Request ID
        property_id: Property ID
        algorithmic_score: Score from deterministic algorithm (0-100)

    Returns:
        Enhanced match with AI-generated reasons and insights
    """
    agent = create_matching_agent()

    prompt = f"""Analizza questo match immobiliare:

Request ID: {request_id}
Property ID: {property_id}
Score Algoritmo: {algorithmic_score}/100

Usa i tools per ottenere i dettagli della richiesta e dell'immobile,
poi fornisci:
1. Analisi del match (perché funziona o non funziona)
2. 3-5 motivi principali in italiano (bullet points)
3. Punti di forza da evidenziare
4. Eventuali criticità e come gestirle
5. Suggerimento per presentazione al cliente

Rispondi in formato strutturato e conciso.
"""

    try:
        response = agent.run(prompt)

        return {
            "success": True,
            "algorithmicScore": algorithmic_score,
            "aiAnalysis": response.text,
            "finalScore": algorithmic_score,  # Could adjust based on AI analysis
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "algorithmicScore": algorithmic_score,
        }
