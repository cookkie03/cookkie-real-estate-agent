"""
Chat Router
Endpoints for RAG Assistant chat functionality
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from app.agents.rag_assistant import run_rag_assistant

logger = logging.getLogger(__name__)

router = APIRouter()


class Message(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Chat request payload"""
    messages: List[Message] = Field(..., description="Conversation messages")


class ChatResponse(BaseModel):
    """Chat response payload"""
    success: bool
    content: Optional[str] = None
    role: Optional[str] = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with RAG Assistant Agent.

    Send a conversation and get AI-powered response with database access.

    **Example:**
    ```json
    {
      "messages": [
        {"role": "user", "content": "Mostrami appartamenti a Corbetta sotto 200k"}
      ]
    }
    ```
    """
    try:
        logger.info(f"Chat request with {len(request.messages)} messages")

        # Convert Pydantic models to dicts
        messages_dict = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Run RAG assistant
        result = run_rag_assistant(messages_dict)

        if not result.get("success"):
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Unknown error occurred")
            )

        return ChatResponse(
            success=True,
            content=result.get("content"),
            role=result.get("role"),
            metadata=result.get("metadata")
        )

    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def chat_status():
    """Check chat agent status"""
    return {
        "status": "ready",
        "agent": "rag_assistant",
        "capabilities": [
            "Property search",
            "Contact search",
            "Request analysis",
            "Match queries",
            "Database insights"
        ]
    }
