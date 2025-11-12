"""
==============================================
AI Orchestrator Agent - Main Intelligence
CRM Immobiliare AI-Driven Web Scraping
==============================================

The orchestrator is the brain of the system. It:
- Interprets natural language requests
- Plans task sequences autonomously
- Coordinates browser and extraction agents
- Learns from feedback and improves over time
"""

from typing import Dict, List, Any, Optional
import asyncio
import json
import logging
from datetime import datetime
from enum import Enum
from dataclasses import dataclass

logger = logging.getLogger(__name__)


class TaskType(Enum):
    """Types of tasks the orchestrator can execute"""
    SEARCH = "search"
    EXTRACT = "extract"
    NAVIGATE = "navigate"
    LOGIN = "login"
    COMPARE = "compare"
    MONITOR = "monitor"


@dataclass
class Task:
    """A single task in the execution plan"""
    type: TaskType
    description: str
    parameters: Dict[str, Any]
    source: Optional[str] = None
    priority: int = 0
    dependencies: Optional[List[str]] = None


class OrchestratorAgent:
    """
    Main orchestrator agent that interprets natural language
    and coordinates all system components

    Examples of requests it can handle:
    - "Trova tutti gli appartamenti a Milano sotto 300k"
    - "Controlla se ci sono nuovi annunci da stamattina"
    - "Confronta i prezzi tra Immobiliare.it e Casa.it"
    """

    def __init__(self, google_api_key: str):
        """
        Initialize orchestrator agent

        Args:
            google_api_key: Google AI API key for Gemini
        """
        self.google_api_key = google_api_key
        self.context_memory = {}
        self.active_sessions = {}

        # Initialize AI client
        self._init_ai_client()

    def _init_ai_client(self):
        """Initialize Gemini AI client"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.google_api_key)

            # Use Gemini 2.5 Flash for optimal performance
            self.ai_model = genai.GenerativeModel('gemini-2.5-flash')

            logger.info("AI client initialized successfully (Gemini 2.5 Flash)")

        except Exception as e:
            logger.error(f"Failed to initialize AI client: {e}")
            raise

    async def process_request(self, user_prompt: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Process a natural language request from user

        Args:
            user_prompt: User's request in natural language
            context: Optional context (previous conversation, user preferences, etc.)

        Returns:
            Dict with:
                - summary: AI-generated summary of results
                - detailed_results: List of task results
                - suggestions: Suggested follow-up actions
                - execution_time: Total execution time

        Example:
            >>> orchestrator = OrchestratorAgent(api_key="...")
            >>> result = await orchestrator.process_request(
            ...     "Trova appartamenti a Milano sotto 300k"
            ... )
            >>> print(result['summary'])
            "Ho trovato 42 appartamenti a Milano sotto 300k euro..."
        """

        start_time = datetime.utcnow()

        logger.info(f"Processing user request: {user_prompt}")

        try:
            # Step 1: Understand intent and plan tasks
            plan = await self._understand_and_plan(user_prompt, context)

            # Step 2: Execute plan
            results = await self._execute_plan(plan)

            # Step 3: Generate aggregated response
            response = await self._generate_response(results, user_prompt)

            # Step 4: Save conversation to database
            await self._save_conversation(user_prompt, plan, results, response)

            # Calculate execution time
            execution_time = (datetime.utcnow() - start_time).total_seconds()

            return {
                **response,
                'execution_time': execution_time,
                'tasks_completed': len(results)
            }

        except Exception as e:
            logger.error(f"Error processing request: {e}", exc_info=True)
            return {
                'summary': f"Si è verificato un errore: {str(e)}",
                'detailed_results': [],
                'suggestions': [],
                'error': str(e)
            }

    async def _understand_and_plan(self, prompt: str, context: Optional[Dict] = None) -> List[Task]:
        """
        Use AI to understand user intent and create execution plan

        Args:
            prompt: User's request
            context: Optional context

        Returns:
            List of Task objects to execute
        """

        # Get available sources
        available_sources = await self._get_available_sources()

        # Build planning prompt for AI
        planning_prompt = f"""
Sei un assistente AI per un CRM immobiliare italiano. Analizza questa richiesta dell'utente e crea un piano di esecuzione dettagliato.

RICHIESTA UTENTE: {prompt}

FONTI DISPONIBILI:
{json.dumps(available_sources, indent=2, ensure_ascii=False)}

CONTESTO:
{json.dumps(context or {}, indent=2, ensure_ascii=False)}

CAPACITÀ:
- Posso navigare autonomamente su siti web
- Posso estrarre dati da qualsiasi pagina
- Posso confrontare dati tra diverse fonti
- Posso mantenere sessioni persistenti per login

Genera un piano di esecuzione in formato JSON con questa struttura:

{{
    "intent": "breve descrizione dell'intento (max 50 caratteri)",
    "tasks": [
        {{
            "type": "search|extract|navigate|login|compare",
            "description": "descrizione task",
            "source": "nome_fonte (immobiliare_it, casa_it, etc.) o null",
            "parameters": {{
                "location": "città o zona",
                "contract_type": "sale|rent",
                "property_type": "apartment|villa|house etc.",
                "price_min": numero o null,
                "price_max": numero o null,
                "sqm_min": numero o null,
                "rooms_min": numero o null,
                "max_pages": numero (default 3)
            }},
            "priority": numero (0-10),
            "dependencies": ["id_task1", "id_task2"] oppure []
        }}
    ],
    "explanation": "spiegazione del piano in italiano (max 200 caratteri)"
}}

REGOLE:
1. Se la richiesta menziona una città specifica, usala come location
2. Se non specifica prezzo max, usa valori ragionevoli (es. 500000 per appartamenti)
3. Usa sempre max_pages: 3 a meno che l'utente chieda esplicitamente di più
4. Per "nuovi annunci" usa contract_type: "sale" come default
5. Per confronti tra portali, crea un task per ogni portale
6. Priorità: task con dipendenze hanno priorità più bassa

Restituisci SOLO il JSON, senza markdown o altri testi.
"""

        try:
            # Call AI
            response = self.ai_model.generate_content(planning_prompt)
            response_text = response.text.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = "\n".join(lines[1:-1])

            # Parse JSON
            plan_data = json.loads(response_text)

            # Convert to Task objects
            tasks = []
            for i, task_data in enumerate(plan_data['tasks']):
                task = Task(
                    type=TaskType[task_data['type'].upper()],
                    description=task_data['description'],
                    parameters=task_data['parameters'],
                    source=task_data.get('source'),
                    priority=task_data.get('priority', 0),
                    dependencies=task_data.get('dependencies')
                )
                tasks.append(task)

            logger.info(f"Plan generated: {plan_data['explanation']}")
            logger.info(f"Tasks planned: {len(tasks)}")

            return tasks

        except Exception as e:
            logger.error(f"Failed to generate plan: {e}", exc_info=True)

            # Fallback: create simple search task
            logger.warning("Using fallback plan: single search task")
            return [
                Task(
                    type=TaskType.SEARCH,
                    description="Ricerca immobili",
                    parameters={
                        "location": "milano",
                        "contract_type": "sale",
                        "max_pages": 3
                    },
                    source="immobiliare_it"
                )
            ]

    async def _execute_plan(self, tasks: List[Task]) -> List[Dict]:
        """
        Execute the planned tasks in order

        Args:
            tasks: List of tasks to execute

        Returns:
            List of results for each task
        """

        results = []
        completed_tasks = set()

        for task in tasks:
            # Wait for dependencies
            if task.dependencies:
                await self._wait_for_dependencies(task.dependencies, completed_tasks)

            # Execute task based on type
            try:
                if task.type == TaskType.SEARCH:
                    result = await self._execute_search(task)

                elif task.type == TaskType.EXTRACT:
                    result = await self._execute_extraction(task)

                elif task.type == TaskType.NAVIGATE:
                    result = await self._execute_navigation(task)

                elif task.type == TaskType.LOGIN:
                    result = await self._handle_login(task)

                elif task.type == TaskType.COMPARE:
                    result = await self._compare_data(task)

                else:
                    result = {"error": f"Task type {task.type} not implemented"}

                results.append({
                    'task': task.description,
                    'type': task.type.value,
                    'result': result,
                    'success': 'error' not in result
                })

                completed_tasks.add(task.description)

                # Update context memory
                self.context_memory[task.description] = result

            except Exception as e:
                logger.error(f"Task failed: {task.description} - {e}", exc_info=True)
                results.append({
                    'task': task.description,
                    'type': task.type.value,
                    'result': {'error': str(e)},
                    'success': False
                })

        return results

    async def _execute_search(self, task: Task) -> Dict:
        """
        Execute a search task using the scraping system

        Args:
            task: Search task

        Returns:
            Dict with search results
        """

        logger.info(f"Executing search: {task.description}")

        # Import scraper dynamically
        source = task.source or "immobiliare_it"

        try:
            if source == "immobiliare_it":
                import sys
                import os
                sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../scraping'))
                from portals.immobiliare_it import ImmobiliareItScraper
                scraper_class = ImmobiliareItScraper
            else:
                return {"error": f"Unknown source: {source}"}

            # Run scraper
            params = task.parameters
            async with scraper_class(profile_name=f"orchestrator_{source}") as scraper:
                listings = await scraper.scrape_search(
                    location=params.get('location', 'milano'),
                    contract_type=params.get('contract_type', 'vendita'),
                    property_type=params.get('property_type'),
                    price_min=params.get('price_min'),
                    price_max=params.get('price_max'),
                    sqm_min=params.get('sqm_min'),
                    rooms_min=params.get('rooms_min'),
                    max_pages=params.get('max_pages', 3),
                )

                return {
                    'source': source,
                    'query': params,
                    'listings': listings,
                    'count': len(listings)
                }

        except Exception as e:
            logger.error(f"Search failed: {e}", exc_info=True)
            return {'error': str(e)}

    async def _execute_extraction(self, task: Task) -> Dict:
        """Execute data extraction task"""
        logger.info(f"Executing extraction: {task.description}")
        # TODO: Implement extraction logic
        return {"status": "not_implemented"}

    async def _execute_navigation(self, task: Task) -> Dict:
        """Execute navigation task"""
        logger.info(f"Executing navigation: {task.description}")
        # TODO: Implement navigation logic
        return {"status": "not_implemented"}

    async def _handle_login(self, task: Task) -> Dict:
        """Handle login task"""
        logger.info(f"Executing login: {task.description}")
        # TODO: Implement login logic
        return {"status": "not_implemented"}

    async def _compare_data(self, task: Task) -> Dict:
        """Compare data from different sources"""
        logger.info(f"Executing comparison: {task.description}")
        # TODO: Implement comparison logic
        return {"status": "not_implemented"}

    async def _wait_for_dependencies(self, dependencies: List[str], completed: set):
        """Wait for dependent tasks to complete"""
        # TODO: Implement async wait for dependencies
        pass

    async def _generate_response(self, results: List[Dict], original_prompt: str) -> Dict:
        """
        Generate aggregated response using AI

        Args:
            results: List of task results
            original_prompt: Original user prompt

        Returns:
            Dict with summary, results, and suggestions
        """

        summary_prompt = f"""
L'utente ha chiesto: "{original_prompt}"

Risultati delle operazioni:
{json.dumps(results, indent=2, ensure_ascii=False)}

Genera una risposta chiara e utile in italiano che:
1. Riassuma i risultati principali (max 200 caratteri)
2. Evidenzi informazioni importanti
3. Suggerisca eventuali azioni successive

Formato JSON:
{{
    "summary": "riepilogo risultati",
    "highlights": ["punto 1", "punto 2", "punto 3"],
    "suggestions": ["azione 1", "azione 2"]
}}

Restituisci SOLO il JSON.
"""

        try:
            response = self.ai_model.generate_content(summary_prompt)
            response_text = response.text.strip()

            # Remove markdown if present
            if response_text.startswith("```"):
                lines = response_text.split("\n")
                response_text = "\n".join(lines[1:-1])

            result = json.loads(response_text)

            return {
                'summary': result.get('summary', 'Operazione completata'),
                'highlights': result.get('highlights', []),
                'suggestions': result.get('suggestions', []),
                'detailed_results': results
            }

        except Exception as e:
            logger.error(f"Failed to generate response: {e}", exc_info=True)

            # Fallback response
            total_listings = sum(r.get('result', {}).get('count', 0) for r in results if r.get('success'))
            return {
                'summary': f"Operazione completata. Trovati {total_listings} risultati.",
                'highlights': [],
                'suggestions': [],
                'detailed_results': results
            }

    async def _save_conversation(self, prompt: str, plan: List[Task], results: List[Dict], response: Dict):
        """
        Save conversation to database for learning

        Args:
            prompt: User prompt
            plan: Execution plan
            results: Task results
            response: Generated response
        """

        try:
            import sys
            import os
            from pathlib import Path

            # Add database module to path
            sys.path.insert(0, str(Path(__file__).parent.parent.parent / "database" / "python"))

            from database import get_db_context
            from models import AgentConversation, AgentTask
            import uuid

            with get_db_context() as db:
                # Create conversation
                conversation = AgentConversation(
                    id=str(uuid.uuid4()),
                    userPrompt=prompt,
                    agentPlan=json.dumps([
                        {
                            'type': t.type.value,
                            'description': t.description,
                            'source': t.source,
                            'parameters': t.parameters
                        } for t in plan
                    ]),
                    results=json.dumps(results),
                    summary=response.get('summary'),
                    status="completed",
                    completedAt=datetime.utcnow(),
                    sourcesUsed=json.dumps(list(set(
                        t.source for t in plan if t.source
                    )))
                )

                db.add(conversation)

                # Create tasks
                for i, task in enumerate(plan):
                    task_record = AgentTask(
                        id=str(uuid.uuid4()),
                        conversationId=conversation.id,
                        taskType=task.type.value,
                        description=task.description,
                        parameters=json.dumps(task.parameters),
                        sourceName=task.source,
                        status="completed" if i < len(results) else "skipped",
                        result=json.dumps(results[i]) if i < len(results) else None
                    )
                    db.add(task_record)

                db.commit()

                logger.info(f"Conversation saved: {conversation.id}")

        except Exception as e:
            logger.error(f"Failed to save conversation: {e}", exc_info=True)

    async def _get_available_sources(self) -> List[Dict]:
        """Get list of available sources"""
        # For now, return hardcoded sources
        # TODO: Query from database (ScrapingSource table)
        return [
            {
                "name": "immobiliare_it",
                "baseUrl": "https://www.immobiliare.it",
                "type": "portal",
                "requiresAuth": False
            },
            # Future sources:
            # "casa_it", "idealista_it", etc.
        ]


# Export main class
__all__ = ['OrchestratorAgent', 'Task', 'TaskType']
