"""
RAG Assistant Agent - Using Google Generative AI directly
Intelligent assistant with database access via function calling
"""

from typing import List, Dict, Any, Callable
import google.generativeai as genai
import json

from app.config import settings
from app.tools import (
    database_tool,
    property_tool,
    contact_tool,
    match_tool,
    request_tool,
    activity_tool,
)


SYSTEM_INSTRUCTION = """Sei un assistente AI specializzato in Real Estate (settore immobiliare italiano).

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
- query_properties: Cerca immobili con filtri (città, prezzo, tipo, ecc.)
- query_contacts: Cerca contatti/clienti
- query_requests: Cerca richieste di ricerca immobili
- query_matches: Trova match property-request esistenti
- query_activities: Cerca attività

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


# Function declarations for Gemini function calling
FUNCTION_DECLARATIONS = [
    {
        "name": "query_properties",
        "description": "Query properties/immobili from database with filters. Returns a list of properties matching the criteria.",
        "parameters": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "object",
                    "description": "Filters to apply",
                    "properties": {
                        "city": {"type": "string", "description": "City name (e.g., Milano, Roma)"},
                        "status": {"type": "string", "description": "Property status (available, sold, rented, etc.)"},
                        "contractType": {"type": "string", "description": "Contract type (sale, rent)"},
                        "propertyType": {"type": "string", "description": "Property type (apartment, villa, etc.)"},
                        "priceMin": {"type": "number", "description": "Minimum price"},
                        "priceMax": {"type": "number", "description": "Maximum price"},
                        "roomsMin": {"type": "integer", "description": "Minimum number of rooms"},
                        "bedroomsMin": {"type": "integer", "description": "Minimum number of bedrooms"},
                    }
                },
                "limit": {"type": "integer", "description": "Maximum number of results (default: 10)"}
            }
        }
    },
    {
        "name": "query_contacts",
        "description": "Query contacts/clients from database with filters. Returns a list of contacts.",
        "parameters": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "object",
                    "description": "Filters to apply",
                    "properties": {
                        "status": {"type": "string", "description": "Contact status (active, inactive, etc.)"},
                        "importance": {"type": "string", "description": "Importance level (vip, high, normal, low)"},
                        "city": {"type": "string", "description": "City name"},
                        "source": {"type": "string", "description": "Lead source"},
                    }
                },
                "limit": {"type": "integer", "description": "Maximum number of results (default: 10)"}
            }
        }
    },
    {
        "name": "query_requests",
        "description": "Query client search requests from database. Returns a list of requests.",
        "parameters": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "object",
                    "description": "Filters to apply",
                    "properties": {
                        "status": {"type": "string", "description": "Request status (active, paused, satisfied, etc.)"},
                        "urgency": {"type": "string", "description": "Urgency level (high, medium, low)"},
                        "contractType": {"type": "string", "description": "Contract type (sale, rent)"},
                    }
                },
                "limit": {"type": "integer", "description": "Maximum number of results (default: 10)"}
            }
        }
    },
    {
        "name": "query_matches",
        "description": "Query property-request matches from database. Returns a list of matches with scores.",
        "parameters": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "object",
                    "description": "Filters to apply",
                    "properties": {
                        "status": {"type": "string", "description": "Match status (suggested, sent, viewed, etc.)"},
                        "minScore": {"type": "integer", "description": "Minimum match score (0-100)"},
                        "requestId": {"type": "string", "description": "Filter by request ID"},
                        "propertyId": {"type": "string", "description": "Filter by property ID"},
                    }
                },
                "limit": {"type": "integer", "description": "Maximum number of results (default: 10)"}
            }
        }
    },
    {
        "name": "query_activities",
        "description": "Query activities (calls, visits, meetings) from database. Returns a list of activities.",
        "parameters": {
            "type": "object",
            "properties": {
                "filters": {
                    "type": "object",
                    "description": "Filters to apply",
                    "properties": {
                        "status": {"type": "string", "description": "Activity status (scheduled, completed, cancelled)"},
                        "activityType": {"type": "string", "description": "Activity type (call, visit, meeting, etc.)"},
                        "priority": {"type": "string", "description": "Priority (urgent, high, normal, low)"},
                    }
                },
                "limit": {"type": "integer", "description": "Maximum number of results (default: 10)"}
            }
        }
    },
]


# Tool function mapping
TOOL_FUNCTIONS = {
    "query_properties": property_tool.query_properties,
    "query_contacts": contact_tool.query_contacts,
    "query_requests": request_tool.query_requests,
    "query_matches": match_tool.query_matches,
    "query_activities": activity_tool.query_activities,
}


class RAGAssistant:
    """RAG Assistant using Google Generative AI"""

    def __init__(self):
        """Initialize the RAG Assistant"""
        # Configure Gemini
        genai.configure(api_key=settings.google_api_key)

        # Create model with function calling
        self.model = genai.GenerativeModel(
            model_name=settings.google_model,
            system_instruction=SYSTEM_INSTRUCTION,
            tools=FUNCTION_DECLARATIONS,
            generation_config={
                "temperature": settings.ai_temperature,
                "max_output_tokens": settings.ai_max_tokens,
            }
        )

        self.chat = None

    def _execute_function(self, function_name: str, args: Dict[str, Any]) -> Any:
        """Execute a function call"""
        if function_name not in TOOL_FUNCTIONS:
            return {"error": f"Unknown function: {function_name}"}

        try:
            result = TOOL_FUNCTIONS[function_name](**args)
            return result
        except Exception as e:
            return {"error": str(e)}

    def run(self, messages: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Run the RAG Assistant with a conversation.

        Args:
            messages: List of message dictionaries with 'role' and 'content'
                     Example: [{"role": "user", "content": "Mostra immobili a Corbetta"}]

        Returns:
            Dictionary with response and metadata
        """
        if not messages:
            return {
                "success": False,
                "error": "No messages provided"
            }

        # Start new chat session if needed
        if self.chat is None:
            self.chat = self.model.start_chat(history=[])

        # Get last user message
        last_message = messages[-1]["content"]

        try:
            # Send message
            response = self.chat.send_message(last_message)

            # Handle function calls
            while response.candidates[0].content.parts[0].function_call:
                function_call = response.candidates[0].content.parts[0].function_call

                # Execute function
                function_name = function_call.name
                function_args = {}
                for key, value in function_call.args.items():
                    function_args[key] = value

                function_result = self._execute_function(function_name, function_args)

                # Send function result back
                response = self.chat.send_message(
                    genai.protos.Content(
                        parts=[genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=function_name,
                                response={"result": function_result}
                            )
                        )]
                    )
                )

            # Return final response
            return {
                "success": True,
                "content": response.text,
                "role": "assistant",
                "metadata": {
                    "model": settings.google_model,
                    "finish_reason": str(response.candidates[0].finish_reason) if response.candidates else None,
                }
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


# Global assistant instance
_assistant = None


def get_rag_assistant() -> RAGAssistant:
    """Get or create RAG Assistant instance"""
    global _assistant
    if _assistant is None:
        _assistant = RAGAssistant()
    return _assistant


def run_rag_assistant(messages: List[Dict[str, str]]) -> Dict[str, Any]:
    """
    Run the RAG Assistant Agent with a conversation.

    Args:
        messages: List of message dictionaries with 'role' and 'content'
                 Example: [{"role": "user", "content": "Mostra immobili a Corbetta"}]

    Returns:
        Dictionary with response and metadata
    """
    assistant = get_rag_assistant()
    return assistant.run(messages)


# Example usage
if __name__ == "__main__":
    # Test the agent
    test_messages = [
        {"role": "user", "content": "Mostrami tutti gli appartamenti disponibili a Corbetta"}
    ]

    result = run_rag_assistant(test_messages)
    print(json.dumps(result, indent=2, ensure_ascii=False))
