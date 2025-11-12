"""
Chat Router
Endpoints for RAG Assistant chat functionality
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import logging

from app.agents.crm_chatbot import run_crm_chatbot
from app.services import generate_suggested_queries

logger = logging.getLogger(__name__)

router = APIRouter()


class Message(BaseModel):
    """Chat message model"""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")


class ChatRequest(BaseModel):
    """Chat request payload"""
    messages: List[Message] = Field(..., description="Conversation messages")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context (page, filters, etc.)")


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

        # Run CRM Chatbot
        result = run_crm_chatbot(messages_dict, context=request.context)

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


@router.get("/suggested-queries")
async def get_suggested_queries(
    current_page: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None
):
    """
    Get contextual suggested queries for the chatbot.

    Args:
        current_page: Current page path (e.g., "/requests", "/properties")
        entity_type: Optional entity type (property, contact, request)
        entity_id: Optional entity ID for specific queries

    Returns:
        List of suggested query strings

    **Example:**
    GET /ai/chat/suggested-queries?current_page=/requests
    """
    try:
        context = {}
        if current_page:
            context["current_page"] = current_page

        queries = generate_suggested_queries(context)

        return {
            "success": True,
            "queries": queries,
            "context": context
        }

    except Exception as e:
        logger.error(f"Error generating suggested queries: {e}")
        return {
            "success": False,
            "error": str(e),
            "queries": [
                "Come sta andando il mio portfolio?",
                "Quali sono le opportunità di oggi?",
                "Mostrami i migliori match disponibili"
            ]
        }


@router.get("/status")
async def chat_status():
    """Check chat agent status"""
    return {
        "status": "ready",
        "agent": "crm_chatbot",
        "model": "gemini-2.5-flash",
        "tools_count": 11,
        "capabilities": [
            "Property search (database + semantic)",
            "Contact search and profiling",
            "Request analysis",
            "Match calculation (deterministic scoring)",
            "Portfolio analysis",
            "Market insights",
            "Urgent actions tracking",
            "Business intelligence"
        ]
    }
