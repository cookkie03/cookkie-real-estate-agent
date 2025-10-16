"""
RAG Assistant Agent
Intelligent assistant with database access via RAG and tools
"""

from typing import List, Dict, Any
from datapizza.agents import Agent
from datapizza.clients.google import GoogleClient

from app.config import settings
from app.tools import (
    query_properties_tool,
    query_contacts_tool,
    query_requests_tool,
    query_matches_tool,
    property_search_tool,
    contact_search_tool,
    get_contact_details_tool
)


SYSTEM_PROMPT = """Sei un assistente AI specializzato in Real Estate (settore immobiliare italiano).

Il tuo ruolo è aiutare l'agente immobiliare a gestire il CRM rispondendo a domande su:
- Immobili disponibili (proprietà in vendita o affitto)
- Clienti e le loro richieste
- Match tra immobili e richieste clienti
- Statistiche e insights sul portafoglio

**Competenze:**
- Ricerca immobili con filtri complessi
- Analisi richieste clienti
- Suggerimenti per match immobili-clienti
- Generazione insights e statistiche

**Strumenti a disposizione:**
- query_properties_tool: Cerca immobili con filtri (città, prezzo, tipo, ecc.)
- property_search_tool: Ricerca semantica immobili (linguaggio naturale)
- query_contacts_tool: Cerca contatti/clienti
- contact_search_tool: Ricerca semantica contatti
- get_contact_details_tool: Dettagli completi di un contatto
- query_requests_tool: Cerca richieste di ricerca immobili
- query_matches_tool: Trova match property-request esistenti

**Linee guida:**
1. Rispondi sempre in italiano in modo chiaro e professionale
2. Usa gli strumenti quando necessario per accedere ai dati
3. Fornisci risposte strutturate e actionable
4. Se non hai abbastanza informazioni, chiedi chiarimenti
5. Suggerisci azioni concrete all'agente immobiliare
6. Formatta i risultati in modo leggibile (usa elenchi, tabelle se utile)

**Esempi di query supportate:**
- "Mostrami tutti gli appartamenti disponibili a Corbetta sotto i 200.000€"
- "Chi sono i clienti VIP che cercano casa?"
- "Trova immobili con giardino e parcheggio a Milano"
- "Quali richieste attive ho per trilocali?"
- "Dammi statistiche sugli immobili in vendita"

Rispondi sempre con informazioni utili e pratiche per l'agente immobiliare.
"""


def create_rag_assistant_agent() -> Agent:
    """
    Create and configure the RAG Assistant Agent.

    Returns:
        Configured DataPizza Agent instance
    """
    # Initialize Google Gemini client
    client = GoogleClient(
        api_key=settings.google_api_key,
        model=settings.google_model,
        temperature=settings.ai_temperature,
        max_tokens=settings.ai_max_tokens,
    )

    # Create agent with all database tools
    agent = Agent(
        name="rag_assistant",
        client=client,
        system_prompt=SYSTEM_PROMPT,
        tools=[
            query_properties_tool,
            property_search_tool,
            query_contacts_tool,
            contact_search_tool,
            get_contact_details_tool,
            query_requests_tool,
            query_matches_tool,
        ],
    )

    return agent


def run_rag_assistant(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Run the RAG Assistant Agent with a conversation.

    Args:
        messages: List of message dictionaries with 'role' and 'content'
                 Example: [{"role": "user", "content": "Mostra immobili a Corbetta"}]

    Returns:
        Dictionary with response and metadata
    """
    agent = create_rag_assistant_agent()

    # Extract the last user message
    if not messages:
        return {
            "success": False,
            "error": "No messages provided"
        }

    last_message = messages[-1]["content"]

    try:
        # Run agent
        response = agent.run(last_message)

        return {
            "success": True,
            "content": response.text,
            "role": "assistant",
            "metadata": {
                "model": settings.google_model,
                "tools_used": hasattr(response, 'tool_calls') and len(response.tool_calls) > 0 if hasattr(response, 'tool_calls') else False
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# Example usage
if __name__ == "__main__":
    # Test the agent
    test_messages = [
        {"role": "user", "content": "Mostrami tutti gli appartamenti disponibili a Corbetta"}
    ]

    result = run_rag_assistant(test_messages)
    print(result)
