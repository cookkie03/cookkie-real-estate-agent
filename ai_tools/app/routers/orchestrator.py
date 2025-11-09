"""
AI Orchestrator API
FastAPI endpoints for natural language web scraping orchestration
"""

import asyncio
import os
import sys
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import logging
import json
import uuid

# Add ai_agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from ai_agents.orchestrator import OrchestratorAgent

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for request/response
class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    prompt: str = Field(..., description="User's request in natural language")
    context: Optional[Dict[str, Any]] = Field(None, description="Optional context")


class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    conversation_id: str = Field(..., description="Unique conversation ID")
    summary: str = Field(..., description="AI-generated summary")
    highlights: List[str] = Field(default_factory=list, description="Key highlights")
    suggestions: List[str] = Field(default_factory=list, description="Suggested actions")
    detailed_results: List[Dict] = Field(default_factory=list, description="Detailed task results")
    execution_time: float = Field(..., description="Execution time in seconds")
    tasks_completed: int = Field(..., description="Number of tasks completed")


class ConversationHistoryResponse(BaseModel):
    """Response model for conversation history"""
    conversations: List[Dict[str, Any]]
    total: int
    page: int
    page_size: int


# Initialize orchestrator (singleton)
_orchestrator: Optional[OrchestratorAgent] = None


def get_orchestrator() -> OrchestratorAgent:
    """Get or create orchestrator instance"""
    global _orchestrator

    if _orchestrator is None:
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            raise ValueError("GOOGLE_API_KEY environment variable not set")

        _orchestrator = OrchestratorAgent(google_api_key=google_api_key)
        logger.info("Orchestrator initialized")

    return _orchestrator


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a natural language request

    Examples of requests:
    - "Trova appartamenti a Milano sotto 300k"
    - "Cerca ville con piscina vicino a Roma"
    - "Confronta prezzi tra Immobiliare.it e Casa.it"
    - "Mostrami nuovi annunci di oggi"

    The orchestrator will:
    1. Understand the intent
    2. Plan the execution
    3. Execute tasks autonomously
    4. Return aggregated results

    Returns:
        ChatResponse with summary, results, and suggestions
    """

    try:
        orchestrator = get_orchestrator()

        # Process request
        result = await orchestrator.process_request(
            user_prompt=request.prompt,
            context=request.context
        )

        # Generate conversation ID
        conversation_id = str(uuid.uuid4())

        return ChatResponse(
            conversation_id=conversation_id,
            summary=result.get('summary', 'Operazione completata'),
            highlights=result.get('highlights', []),
            suggestions=result.get('suggestions', []),
            detailed_results=result.get('detailed_results', []),
            execution_time=result.get('execution_time', 0),
            tasks_completed=result.get('tasks_completed', 0)
        )

    except Exception as e:
        logger.error(f"Chat request failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.websocket("/chat/stream")
async def chat_stream(websocket: WebSocket):
    """
    WebSocket endpoint for streaming chat responses

    Provides real-time updates during execution:
    - Task planning
    - Task execution progress
    - Intermediate results
    - Final summary

    Message types:
    - status: Current status update
    - task_start: A task has started
    - task_complete: A task has completed
    - result: Final result
    - error: Error occurred
    """

    await websocket.accept()
    logger.info("WebSocket connection established")

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            prompt = data.get('prompt')
            if not prompt:
                await websocket.send_json({
                    'type': 'error',
                    'message': 'Prompt is required'
                })
                continue

            try:
                # Send planning status
                await websocket.send_json({
                    'type': 'status',
                    'message': 'Sto analizzando la tua richiesta...'
                })

                orchestrator = get_orchestrator()

                # Process request with progress updates
                result = await _process_with_updates(
                    orchestrator,
                    prompt,
                    data.get('context'),
                    websocket
                )

                # Send final result
                await websocket.send_json({
                    'type': 'result',
                    'data': result
                })

            except Exception as e:
                logger.error(f"Error processing request: {e}", exc_info=True)
                await websocket.send_json({
                    'type': 'error',
                    'message': str(e)
                })

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")

    except Exception as e:
        logger.error(f"WebSocket error: {e}", exc_info=True)


async def _process_with_updates(
    orchestrator: OrchestratorAgent,
    prompt: str,
    context: Optional[Dict],
    websocket: WebSocket
) -> Dict:
    """
    Process request and send updates via WebSocket

    Args:
        orchestrator: Orchestrator instance
        prompt: User prompt
        context: Optional context
        websocket: WebSocket connection

    Returns:
        Final result dict
    """

    # Send planning update
    await websocket.send_json({
        'type': 'status',
        'message': 'Sto creando il piano di esecuzione...'
    })

    # Note: We'll need to modify OrchestratorAgent to support progress callbacks
    # For now, just process normally
    result = await orchestrator.process_request(prompt, context)

    # Send updates for each task result
    for i, task_result in enumerate(result.get('detailed_results', [])):
        await websocket.send_json({
            'type': 'task_complete',
            'task_number': i + 1,
            'task': task_result.get('task'),
            'success': task_result.get('success'),
            'count': task_result.get('result', {}).get('count', 0)
        })

        # Small delay for UX
        await asyncio.sleep(0.5)

    return result


@router.get("/conversations", response_model=ConversationHistoryResponse)
async def get_conversation_history(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None
):
    """
    Get conversation history

    Args:
        page: Page number (1-indexed)
        page_size: Number of conversations per page
        status: Filter by status (pending, running, completed, failed)

    Returns:
        List of conversations with pagination
    """

    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../database/python'))
        from database import get_db_context
        from models import AgentConversation
        from sqlalchemy import desc

        with get_db_context() as db:
            query = db.query(AgentConversation)

            # Filter by status
            if status:
                query = query.filter(AgentConversation.status == status)

            # Count total
            total = query.count()

            # Paginate
            offset = (page - 1) * page_size
            conversations = query.order_by(
                desc(AgentConversation.createdAt)
            ).offset(offset).limit(page_size).all()

            # Convert to dicts
            conversations_list = []
            for conv in conversations:
                conversations_list.append({
                    'id': conv.id,
                    'user_prompt': conv.userPrompt,
                    'summary': conv.summary,
                    'status': conv.status,
                    'created_at': conv.createdAt.isoformat() if conv.createdAt else None,
                    'completed_at': conv.completedAt.isoformat() if conv.completedAt else None,
                    'execution_time': conv.executionTime,
                    'sources_used': json.loads(conv.sourcesUsed) if conv.sourcesUsed else []
                })

            return ConversationHistoryResponse(
                conversations=conversations_list,
                total=total,
                page=page,
                page_size=page_size
            )

    except Exception as e:
        logger.error(f"Error fetching conversation history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}")
async def get_conversation_details(conversation_id: str):
    """
    Get detailed information about a specific conversation

    Includes:
    - User prompt
    - Generated plan
    - All tasks with results
    - Final summary
    - Timing information
    """

    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../database/python'))
        from database import get_db_context
        from models import AgentConversation, AgentTask

        with get_db_context() as db:
            # Get conversation
            conversation = db.query(AgentConversation).filter(
                AgentConversation.id == conversation_id
            ).first()

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            # Get tasks
            tasks = db.query(AgentTask).filter(
                AgentTask.conversationId == conversation_id
            ).order_by(AgentTask.createdAt).all()

            return {
                'id': conversation.id,
                'user_prompt': conversation.userPrompt,
                'agent_plan': json.loads(conversation.agentPlan) if conversation.agentPlan else None,
                'summary': conversation.summary,
                'status': conversation.status,
                'created_at': conversation.createdAt.isoformat() if conversation.createdAt else None,
                'started_at': conversation.startedAt.isoformat() if conversation.startedAt else None,
                'completed_at': conversation.completedAt.isoformat() if conversation.completedAt else None,
                'execution_time': conversation.executionTime,
                'sources_used': json.loads(conversation.sourcesUsed) if conversation.sourcesUsed else [],
                'tasks': [
                    {
                        'id': task.id,
                        'type': task.taskType,
                        'description': task.description,
                        'source': task.sourceName,
                        'status': task.status,
                        'started_at': task.startedAt.isoformat() if task.startedAt else None,
                        'completed_at': task.completedAt.isoformat() if task.completedAt else None,
                        'duration': task.duration,
                        'result': json.loads(task.result) if task.result else None,
                        'error': task.error
                    }
                    for task in tasks
                ],
                'results': json.loads(conversation.results) if conversation.results else None
            }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching conversation details: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def test_orchestrator():
    """
    Test endpoint to verify orchestrator is working

    Executes a simple test request and returns the result
    """

    try:
        orchestrator = get_orchestrator()

        result = await orchestrator.process_request(
            user_prompt="Trova 3 appartamenti a Milano per test",
            context={'test_mode': True}
        )

        return {
            'status': 'success',
            'orchestrator_ready': True,
            'test_result': result
        }

    except Exception as e:
        logger.error(f"Test failed: {e}", exc_info=True)
        return {
            'status': 'error',
            'orchestrator_ready': False,
            'error': str(e)
        }


# Export router
__all__ = ['router']
