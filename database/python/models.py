"""
==============================================
SQLAlchemy Models - Mirror of Prisma Schema
CRM Immobiliare Database Models for Python
==============================================

This file mirrors the Prisma schema for Python access to the database.
Keep in sync with database/prisma/schema.prisma

Database: PostgreSQL
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


# ============================================================================
# 1. USER & AUTHENTICATION
# ============================================================================
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)  # bcrypt hashed
    name = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(String, primary_key=True)
    userId = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    fullName = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    agencyName = Column(String)
    agencyVat = Column(String)
    agencyAddress = Column(String)
    settings = Column(Text, default='{"commissionPercent":3.0}')
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")


# ============================================================================
# 2. CONTACTS
# ============================================================================
class Contact(Base):
    __tablename__ = "contacts"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    entityType = Column(String, default="person")

    # Anagrafica
    fullName = Column(String, nullable=False)
    firstName = Column(String)
    lastName = Column(String)
    companyName = Column(String)

    # Contatti
    primaryPhone = Column(String)
    secondaryPhone = Column(String)
    primaryEmail = Column(String)
    secondaryEmail = Column(String)

    # Indirizzo
    street = Column(String)
    civic = Column(String)
    city = Column(String)
    province = Column(String)
    zip = Column(String)
    country = Column(String, default="Italia")
    latitude = Column(Float)
    longitude = Column(Float)

    # Dati Fiscali
    taxCode = Column(String)
    vatNumber = Column(String)
    birthDate = Column(DateTime)
    nationality = Column(String)

    # Privacy (GDPR)
    privacyFirstContact = Column(Boolean, default=False)
    privacyFirstContactDate = Column(DateTime)
    privacyExtended = Column(Boolean, default=False)
    privacyExtendedDate = Column(DateTime)
    privacyMarketing = Column(Boolean, default=False)

    # Profilazione
    source = Column(String)
    leadScore = Column(Integer)
    importance = Column(String, default="normal")

    # Budget
    budgetMin = Column(Float)
    budgetMax = Column(Float)

    # Status
    status = Column(String, default="active")
    lastContactDate = Column(DateTime)
    notes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owned_properties = relationship("Property", back_populates="owner", foreign_keys="[Property.ownerContactId]")
    requests = relationship("Request", back_populates="contact")
    activities = relationship("Activity", back_populates="contact")
    matches = relationship("Match", back_populates="contact")

    __table_args__ = (
        Index('idx_contact_code', 'code'),
        Index('idx_contact_fullName', 'fullName'),
        Index('idx_contact_city', 'city'),
        Index('idx_contact_status', 'status'),
    )


# ============================================================================
# 3. BUILDINGS
# ============================================================================
class Building(Base):
    __tablename__ = "buildings"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)

    # Indirizzo
    street = Column(String, nullable=False)
    civic = Column(String, nullable=False)
    city = Column(String, nullable=False)
    province = Column(String, nullable=False)
    zip = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)

    # Info Edificio
    yearBuilt = Column(Integer)
    totalFloors = Column(Integer)
    totalUnits = Column(Integer)
    hasElevator = Column(Boolean, default=False)
    condition = Column(String)

    # Censimento
    lastSurveyDate = Column(DateTime)
    nextSurveyDue = Column(DateTime)
    unitsSurveyed = Column(Integer, default=0)
    unitsInterested = Column(Integer, default=0)

    notes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    properties = relationship("Property", back_populates="building")
    activities = relationship("Activity", back_populates="building")


# ============================================================================
# 4. PROPERTIES
# ============================================================================
class Property(Base):
    __tablename__ = "properties"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)

    # Relations
    ownerContactId = Column(String, ForeignKey("contacts.id"))
    buildingId = Column(String, ForeignKey("buildings.id"))

    # Status
    status = Column(String, default="draft")
    visibility = Column(String, default="public")

    # Fonte
    source = Column(String, nullable=False)
    sourceUrl = Column(String)
    importDate = Column(DateTime)
    verified = Column(Boolean, default=False)

    # Indirizzo
    street = Column(String, nullable=False)
    civic = Column(String)
    internal = Column(String)
    floor = Column(String)
    city = Column(String, nullable=False)
    province = Column(String, nullable=False)
    zone = Column(String)
    zip = Column(String)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Tipo
    contractType = Column(String, nullable=False)
    propertyType = Column(String, nullable=False)
    propertyCategory = Column(String)

    # Dimensioni
    sqmCommercial = Column(Float)
    sqmLivable = Column(Float)
    rooms = Column(Integer)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)

    # Features
    hasElevator = Column(Boolean, default=False)
    hasParking = Column(Boolean, default=False)
    hasGarage = Column(Boolean, default=False)
    hasGarden = Column(Boolean, default=False)
    hasTerrace = Column(Boolean, default=False)

    # Caratteristiche
    condition = Column(String)
    heatingType = Column(String)
    energyClass = Column(String)
    yearBuilt = Column(Integer)

    # Prezzi
    priceSale = Column(Float)
    priceRentMonthly = Column(Float)

    # Marketing
    title = Column(String)
    description = Column(Text)

    # Statistiche
    viewsCount = Column(Integer, default=0)
    inquiriesCount = Column(Integer, default=0)
    visitsCount = Column(Integer, default=0)

    notes = Column(Text)
    internalNotes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("Contact", back_populates="owned_properties", foreign_keys=[ownerContactId])
    building = relationship("Building", back_populates="properties")
    matches = relationship("Match", back_populates="property")
    activities = relationship("Activity", back_populates="property")

    __table_args__ = (
        Index('idx_property_code', 'code'),
        Index('idx_property_status', 'status'),
        Index('idx_property_city', 'city'),
        Index('idx_property_contractType', 'contractType'),
        Index('idx_property_priceSale', 'priceSale'),
    )


# ============================================================================
# 5. REQUESTS
# ============================================================================
class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False)

    # Relations
    contactId = Column(String, ForeignKey("contacts.id"), nullable=False)

    # Tipo & Stato
    requestType = Column(String, default="search_buy")
    status = Column(String, default="active")
    urgency = Column(String, default="medium")

    # Criteri
    contractType = Column(String)
    searchCities = Column(Text)  # JSON array
    searchZones = Column(Text)   # JSON array
    propertyTypes = Column(Text) # JSON array

    # Budget
    priceMin = Column(Float)
    priceMax = Column(Float)

    # Dimensioni
    sqmMin = Column(Float)
    sqmMax = Column(Float)
    roomsMin = Column(Integer)
    roomsMax = Column(Integer)

    # Features Richieste
    requiresElevator = Column(Boolean, default=False)
    requiresParking = Column(Boolean, default=False)
    requiresGarden = Column(Boolean, default=False)

    notes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expiresAt = Column(DateTime)

    # Relationships
    contact = relationship("Contact", back_populates="requests")
    matches = relationship("Match", back_populates="request")
    activities = relationship("Activity", back_populates="request")

    __table_args__ = (
        Index('idx_request_code', 'code'),
        Index('idx_request_status', 'status'),
        Index('idx_request_contactId', 'contactId'),
    )


# ============================================================================
# 6. MATCHES
# ============================================================================
class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True)

    # Relations
    requestId = Column(String, ForeignKey("requests.id"), nullable=False)
    propertyId = Column(String, ForeignKey("properties.id"), nullable=False)
    contactId = Column(String, ForeignKey("contacts.id"))

    # Scoring
    scoreTotal = Column(Integer, nullable=False)
    scoreLocation = Column(Integer)
    scorePrice = Column(Integer)
    scoreSize = Column(Integer)
    scoreFeatures = Column(Integer)

    # Stato
    status = Column(String, default="suggested")

    # Feedback
    clientReaction = Column(String)
    rejectionReason = Column(String)
    clientNotes = Column(Text)

    # Azioni
    sentDate = Column(DateTime)
    viewedDate = Column(DateTime)
    visitedDate = Column(DateTime)

    agentNotes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    request = relationship("Request", back_populates="matches")
    property = relationship("Property", back_populates="matches")
    contact = relationship("Contact", back_populates="matches")

    __table_args__ = (
        Index('idx_match_requestId', 'requestId'),
        Index('idx_match_propertyId', 'propertyId'),
        Index('idx_match_scoreTotal', 'scoreTotal'),
        Index('idx_match_status', 'status'),
    )


# ============================================================================
# 7. ACTIVITIES
# ============================================================================
class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True)

    # Polymorphic Relations
    contactId = Column(String, ForeignKey("contacts.id"))
    propertyId = Column(String, ForeignKey("properties.id"))
    requestId = Column(String, ForeignKey("requests.id"))
    buildingId = Column(String, ForeignKey("buildings.id"))

    # Tipo & Stato
    activityType = Column(String, nullable=False)
    status = Column(String, default="scheduled")
    priority = Column(String, default="normal")

    # Temporizzazione
    scheduledAt = Column(DateTime)
    completedAt = Column(DateTime)
    dueDate = Column(DateTime)

    # Contenuto
    title = Column(String, nullable=False)
    description = Column(Text)
    outcome = Column(Text)
    details = Column(Text, default="{}")

    notes = Column(Text)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    contact = relationship("Contact", back_populates="activities")
    property = relationship("Property", back_populates="activities")
    request = relationship("Request", back_populates="activities")
    building = relationship("Building", back_populates="activities")

    __table_args__ = (
        Index('idx_activity_contactId', 'contactId'),
        Index('idx_activity_propertyId', 'propertyId'),
        Index('idx_activity_activityType', 'activityType'),
        Index('idx_activity_status', 'status'),
        Index('idx_activity_scheduledAt', 'scheduledAt'),
    )


# ============================================================================
# 8. CUSTOM FIELD DEFINITION
# ============================================================================
class CustomFieldDefinition(Base):
    __tablename__ = "custom_field_definitions"

    id = Column(String, primary_key=True)

    # Metadata
    name = Column(String, nullable=False)
    label = Column(String, nullable=False)
    entityType = Column(String, nullable=False)

    # Type & Validation
    fieldType = Column(String, default="text", nullable=False)
    required = Column(Boolean, default=False)

    # Validation Rules (JSON)
    validationRules = Column(Text)  # JSON string

    # Options (for select/multiselect)
    options = Column(Text)  # JSON string

    # UI Positioning
    section = Column(String)
    displayOrder = Column(Integer, default=0)

    # Metadata
    isActive = Column(Boolean, default=True)

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    values = relationship("CustomFieldValue", back_populates="field", cascade="all, delete-orphan")

    __table_args__ = (
        Index('idx_custom_field_def_entity_name', 'entityType', 'name', unique=True),
        Index('idx_custom_field_def_entity_active', 'entityType', 'isActive'),
    )


# ============================================================================
# 9. CUSTOM FIELD VALUE
# ============================================================================
class CustomFieldValue(Base):
    __tablename__ = "custom_field_values"

    id = Column(String, primary_key=True)

    # Field Reference
    fieldId = Column(String, ForeignKey("custom_field_definitions.id", ondelete="CASCADE"), nullable=False)

    # Polymorphic Entity Reference
    entityType = Column(String, nullable=False)
    entityId = Column(String, nullable=False)

    # Value Storage (type-specific)
    valueText = Column(String)
    valueNumber = Column(Float)
    valueBoolean = Column(Boolean)
    valueDate = Column(DateTime)
    valueJson = Column(Text)  # JSON string

    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    field = relationship("CustomFieldDefinition", back_populates="values")

    __table_args__ = (
        Index('idx_custom_field_value_unique', 'fieldId', 'entityType', 'entityId', unique=True),
        Index('idx_custom_field_value_entity', 'entityType', 'entityId'),
        Index('idx_custom_field_value_field', 'fieldId'),
    )


# Export all models
__all__ = [
    'Base',
    'User',
    'UserProfile',
    'Contact',
    'Building',
    'Property',
    'Request',
    'Match',
    'Activity',
    'CustomFieldDefinition',
    'CustomFieldValue',
]
