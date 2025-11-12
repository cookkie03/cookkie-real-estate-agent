"""
Message Analyzer Tool
Analyzes incoming messages (email/WhatsApp) and extracts structured data
"""

from datapizza.tools import tool
from app.database import SessionLocal
from database.python.models import MessageLog, Contact, Property, Request
import json
import re
from datetime import datetime
from typing import Optional

@tool
def analyze_message_tool(message_log_id: str) -> str:
    """
    Analyze an incoming message (email or WhatsApp) and extract:
    - Category (property_inquiry, appointment_request, general, etc.)
    - Sentiment (positive, neutral, negative)
    - Priority (low, normal, high, urgent)
    - Extracted data (property references, dates, phone numbers, etc.)
    - Suggested actions

    Args:
        message_log_id: ID of the MessageLog to analyze

    Returns:
        JSON string with analysis results
    """
    db = SessionLocal()
    try:
        # Get message
        message = db.query(MessageLog).filter(MessageLog.id == message_log_id).first()
        if not message:
            return json.dumps({"error": "Message not found"}, ensure_ascii=False)

        # Extract information
        body_lower = message.body.lower()
        subject_lower = (message.subject or "").lower()
        text = f"{subject_lower} {body_lower}"

        # Determine category
        category = determine_category(text)

        # Determine sentiment
        sentiment = determine_sentiment(body_lower)

        # Determine priority
        priority = determine_priority(body_lower, category)

        # Extract structured data
        extracted_data = extract_data(message.body, message.subject or "")

        # Match with existing entities
        matched_contact = message.contactId
        matched_property = find_mentioned_property(db, body_lower, extracted_data)
        matched_request = find_mentioned_request(db, message.contactId, extracted_data)

        # Generate summary
        summary = generate_summary(message, category, extracted_data)

        # Determine actions
        suggested_actions = determine_actions(category, extracted_data, matched_contact)

        # Update message log with analysis
        message.aiCategory = category
        message.aiSentiment = sentiment
        message.aiPriority = priority
        message.aiExtractedData = extracted_data
        message.aiSummary = summary
        message.isProcessed = True
        message.processedAt = datetime.utcnow()

        if matched_property:
            message.propertyMentioned = matched_property
        if matched_request:
            message.requestMentioned = matched_request

        db.commit()

        return json.dumps({
            "success": True,
            "messageId": message_log_id,
            "analysis": {
                "category": category,
                "sentiment": sentiment,
                "priority": priority,
                "summary": summary,
                "extractedData": extracted_data,
                "matchedContact": matched_contact,
                "matchedProperty": matched_property,
                "matchedRequest": matched_request,
                "suggestedActions": suggested_actions,
            }
        }, ensure_ascii=False)

    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)}, ensure_ascii=False)
    finally:
        db.close()


def determine_category(text: str) -> str:
    """Determine message category based on keywords"""

    # Property inquiry
    if any(word in text for word in [
        'immobile', 'appartamento', 'casa', 'villa', 'interessato',
        'disponibile', 'prezzo', 'visitare', 'vedere', 'metri quadri'
    ]):
        return "property_inquiry"

    # Appointment request
    if any(word in text for word in [
        'appuntamento', 'visita', 'vedere', 'incontrare', 'quando',
        'disponibilità', 'lunedì', 'martedì', 'mercoledì', 'giovedì',
        'venerdì', 'sabato', 'domenica', 'domani', 'oggi'
    ]):
        return "appointment_request"

    # Document request
    if any(word in text for word in [
        'documento', 'contratto', 'planimetria', 'ape', 'catastale',
        'allegato', 'pdf', 'file'
    ]):
        return "document_request"

    # Offer/negotiation
    if any(word in text for word in [
        'offerta', 'proposta', 'trattativa', 'sconto', 'ribasso',
        'negoziare', 'prezzo finale'
    ]):
        return "offer_negotiation"

    # Complaint
    if any(word in text for word in [
        'problema', 'lamentela', 'reclamo', 'insoddisfatto',
        'deluso', 'male', 'pessimo'
    ]):
        return "complaint"

    return "general"


def determine_sentiment(body: str) -> str:
    """Determine sentiment from text"""
    positive_words = [
        'grazie', 'ottimo', 'perfetto', 'interessante', 'bello',
        'magnifico', 'eccellente', 'fantastico', 'buono', 'gentile'
    ]
    negative_words = [
        'problema', 'male', 'brutto', 'caro', 'delusione',
        'pessimo', 'terribile', 'orribile', 'cattivo', 'no'
    ]

    pos_count = sum(1 for word in positive_words if word in body)
    neg_count = sum(1 for word in negative_words if word in body)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    return "neutral"


def determine_priority(body: str, category: str) -> str:
    """Determine priority level"""
    urgent_keywords = [
        'urgente', 'subito', 'immediatamente', 'oggi',
        'domani', 'asap', 'importante'
    ]

    if any(word in body.lower() for word in urgent_keywords):
        return "urgent"

    if category in ['complaint', 'offer_negotiation']:
        return "high"

    if category in ['appointment_request', 'property_inquiry']:
        return "normal"

    return "low"


def extract_data(body: str, subject: str) -> dict:
    """Extract structured data from message"""
    data = {}

    # Extract phone numbers
    phones = re.findall(
        r'[\+]?[\d]{2,3}[\s\-]?[\d]{3}[\s\-]?[\d]{3}[\s\-]?[\d]{2,4}',
        body
    )
    if phones:
        data['phones'] = phones

    # Extract dates
    date_patterns = [
        r'\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}',  # DD/MM/YYYY
        r'\d{1,2}\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)',
    ]
    dates = []
    for pattern in date_patterns:
        dates.extend(re.findall(pattern, body, re.IGNORECASE))
    if dates:
        data['dates'] = dates

    # Extract times
    times = re.findall(r'\d{1,2}[:\.]\d{2}', body)
    if times:
        data['times'] = times

    # Extract property codes
    prop_codes = re.findall(r'PROP-\d{4}-\d{4}', body)
    if prop_codes:
        data['propertyCodes'] = prop_codes

    # Extract cities (common Italian cities)
    italian_cities = [
        'milano', 'roma', 'torino', 'napoli', 'genova',
        'bologna', 'firenze', 'venezia', 'palermo', 'bari'
    ]
    cities = [city for city in italian_cities if city in body.lower()]
    if cities:
        data['cities'] = cities

    # Extract price mentions
    prices = re.findall(r'€\s?[\d.,]+|[\d.,]+\s?euro', body, re.IGNORECASE)
    if prices:
        data['prices'] = prices

    # Extract square meters
    sqm = re.findall(r'(\d+)\s*(mq|m2|metri\s+quadri)', body, re.IGNORECASE)
    if sqm:
        data['squareMeters'] = [int(m[0]) for m in sqm]

    return data


def find_mentioned_property(db, body: str, extracted_data: dict) -> Optional[str]:
    """Find property mentioned in message"""
    # Check for property code
    if 'propertyCodes' in extracted_data:
        prop = db.query(Property).filter(
            Property.code.in_(extracted_data['propertyCodes'])
        ).first()
        if prop:
            return prop.id

    # Could add more sophisticated matching here
    return None


def find_mentioned_request(db, contact_id: Optional[str], extracted_data: dict) -> Optional[str]:
    """Find request mentioned in message"""
    if not contact_id:
        return None

    # Find active request for this contact
    request = db.query(Request).filter(
        Request.contactId == contact_id,
        Request.status == 'active'
    ).first()

    return request.id if request else None


def generate_summary(message, category: str, extracted_data: dict) -> str:
    """Generate human-readable summary"""
    summaries = {
        "property_inquiry": "Richiesta informazioni su un immobile",
        "appointment_request": "Richiesta appuntamento per visita",
        "document_request": "Richiesta documenti",
        "offer_negotiation": "Proposta di trattativa",
        "complaint": "Segnalazione problema",
        "general": "Messaggio generico",
    }

    summary = summaries.get(category, "Messaggio ricevuto")

    if message.fromName:
        summary += f" da {message.fromName}"

    if extracted_data.get('propertyCodes'):
        summary += f" riguardo immobile {extracted_data['propertyCodes'][0]}"

    return summary


def determine_actions(category: str, extracted_data: dict, contact_id: Optional[str]) -> list:
    """Determine suggested actions"""
    actions = []

    if category == "appointment_request":
        actions.append({
            "type": "create_activity",
            "title": "Fissare appuntamento",
            "activityType": "meeting",
        })

    if category == "property_inquiry" and not contact_id:
        actions.append({
            "type": "create_contact",
            "title": "Creare nuovo contatto",
        })

    if category == "complaint":
        actions.append({
            "type": "notify_agent",
            "title": "Notificare agente immediatamente",
        })

    if extracted_data.get('propertyCodes'):
        actions.append({
            "type": "link_property",
            "propertyCode": extracted_data['propertyCodes'][0],
        })

    return actions
