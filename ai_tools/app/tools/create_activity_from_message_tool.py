"""
Create Activity From Message Tool
Automatically creates activities based on analyzed messages
"""

from datapizza.tools import tool
from app.database import SessionLocal
from database.python.models import Activity, MessageLog
import json
from datetime import datetime
from typing import Optional

@tool
def create_activity_from_message_tool(
    message_log_id: str,
    activity_type: str = "call",
    title: Optional[str] = None
) -> str:
    """
    Create an Activity based on an analyzed message.
    Useful when a message requires follow-up action.

    Args:
        message_log_id: ID of the MessageLog
        activity_type: Type of activity to create (call, email, meeting, whatsapp_message, etc.)
        title: Optional custom title for the activity

    Returns:
        JSON string with created activity details
    """
    db = SessionLocal()
    try:
        # Get message
        message = db.query(MessageLog).filter(MessageLog.id == message_log_id).first()
        if not message:
            return json.dumps({"error": "Message not found"}, ensure_ascii=False)

        # Build activity title
        if not title:
            if message.provider == 'gmail':
                title = f"Rispondere a email da {message.fromName or message.fromEmail}"
            elif message.provider == 'whatsapp':
                title = f"Rispondere a WhatsApp da {message.fromName or message.fromPhone}"
            else:
                title = f"Rispondere a messaggio da {message.fromName or 'contatto'}"

        # Build description from message
        description = f"Messaggio {message.provider} ricevuto il {message.sentAt.strftime('%d/%m/%Y alle %H:%M')}\n\n"

        if message.subject:
            description += f"Oggetto: {message.subject}\n\n"

        description += "Contenuto:\n"
        description += message.body[:500]  # First 500 characters
        if len(message.body) > 500:
            description += "..."

        # Determine priority from AI analysis
        priority = 'normal'
        if message.aiPriority == 'urgent':
            priority = 'urgent'
        elif message.aiPriority == 'high':
            priority = 'high'

        # Prepare details object
        details = {
            'sourceMessageId': message.id,
            'sourceProvider': message.provider,
            'aiCategory': message.aiCategory,
            'aiSentiment': message.aiSentiment,
        }

        # Create activity
        activity = Activity(
            contactId=message.contactId,
            activityType=activity_type,
            status='scheduled',
            priority=priority,
            title=title,
            description=description,
            dueDate=datetime.utcnow(),  # Due today
            details=details
        )

        db.add(activity)
        db.commit()
        db.refresh(activity)

        # Update message log
        message.activityCreated = True
        message.activityId = activity.id
        db.commit()

        return json.dumps({
            "success": True,
            "activityId": activity.id,
            "activityType": activity_type,
            "title": title,
            "priority": priority,
        }, ensure_ascii=False)

    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)}, ensure_ascii=False)
    finally:
        db.close()
