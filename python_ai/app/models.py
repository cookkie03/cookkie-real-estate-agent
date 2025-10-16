"""
SQLAlchemy Models
Mirror of Prisma schema for Python database access
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text,
    ForeignKey, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Contact(Base):
    """Contacts table - mirror of Prisma Contact model"""
    __tablename__ = "contacts"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False, index=True)

    # Entity Type
    entityType = Column(String, default="person")

    # Anagrafica
    fullName = Column(String, nullable=False, index=True)
    firstName = Column(String)
    lastName = Column(String)
    companyName = Column(String)

    # Contatti
    primaryPhone = Column(String, index=True)
    secondaryPhone = Column(String)
    primaryEmail = Column(String, index=True)
    secondaryEmail = Column(String)

    # Indirizzo
    street = Column(String)
    civic = Column(String)
    city = Column(String, index=True)
    province = Column(String)
    zip = Column(String)
    country = Column(String, default="Italia")
    latitude = Column(Float)
    longitude = Column(Float)

    # Budget
    budgetMin = Column(Float)
    budgetMax = Column(Float)

    # Status
    status = Column(String, default="active", index=True)
    source = Column(String, index=True)
    importance = Column(String, default="normal", index=True)
    lastContactDate = Column(DateTime)

    # Note
    notes = Column(Text)

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())

    # Relationships
    ownedProperties = relationship("Property", back_populates="owner")
    requests = relationship("Request", back_populates="contact")


class Property(Base):
    """Properties table - mirror of Prisma Property model"""
    __tablename__ = "properties"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False, index=True)

    # Relations
    ownerContactId = Column(String, ForeignKey("contacts.id"), index=True)
    buildingId = Column(String, ForeignKey("buildings.id"), index=True)

    # Status
    status = Column(String, default="draft", index=True)
    visibility = Column(String, default="public")

    # Fonte
    source = Column(String, nullable=False)
    sourceUrl = Column(String)
    verified = Column(Boolean, default=False)

    # Indirizzo
    street = Column(String, nullable=False)
    civic = Column(String)
    internal = Column(String)
    floor = Column(String)
    city = Column(String, nullable=False, index=True)
    province = Column(String, nullable=False)
    zone = Column(String, index=True)
    zip = Column(String)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Tipo Immobile
    contractType = Column(String, nullable=False, index=True)
    propertyType = Column(String, nullable=False, index=True)
    propertyCategory = Column(String)

    # Dimensioni
    sqmCommercial = Column(Float, index=True)
    sqmLivable = Column(Float)
    sqmGarden = Column(Float)
    sqmTerrace = Column(Float)
    sqmBalcony = Column(Float)

    rooms = Column(Integer, index=True)
    bedrooms = Column(Integer, index=True)
    bathrooms = Column(Integer)

    # Features Booleane
    hasElevator = Column(Boolean, default=False)
    hasParking = Column(Boolean, default=False)
    hasGarage = Column(Boolean, default=False)
    hasGarden = Column(Boolean, default=False)
    hasTerrace = Column(Boolean, default=False)
    hasBalcony = Column(Boolean, default=False)
    hasCellar = Column(Boolean, default=False)
    hasAlarm = Column(Boolean, default=False)
    furnished = Column(Boolean, default=False)

    # Caratteristiche
    condition = Column(String)
    heatingType = Column(String)
    energyClass = Column(String)
    orientation = Column(String)
    yearBuilt = Column(Integer)
    yearRenovated = Column(Integer)

    # Prezzi
    priceSale = Column(Float, index=True)
    priceRentMonthly = Column(Float, index=True)
    priceMinAcceptable = Column(Float)

    # Marketing
    title = Column(String)
    description = Column(Text)
    highlights = Column(Text)  # JSON string

    # Note
    notes = Column(Text)
    internalNotes = Column(Text)

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())

    # Relationships
    owner = relationship("Contact", back_populates="ownedProperties")
    building = relationship("Building", back_populates="properties")
    matches = relationship("Match", back_populates="property")


class Building(Base):
    """Buildings table - mirror of Prisma Building model"""
    __tablename__ = "buildings"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False, index=True)

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

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())

    # Relationships
    properties = relationship("Property", back_populates="building")


class Request(Base):
    """Requests table - mirror of Prisma Request model"""
    __tablename__ = "requests"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True, nullable=False, index=True)

    # Relations
    contactId = Column(String, ForeignKey("contacts.id"), nullable=False, index=True)

    # Tipo & Stato
    requestType = Column(String, default="search_buy", index=True)
    status = Column(String, default="active", index=True)
    urgency = Column(String, default="medium")

    # Criteri Base
    contractType = Column(String, index=True)

    # Location (JSON strings)
    searchCities = Column(Text)  # JSON array
    searchZones = Column(Text)   # JSON array
    searchRadiusKm = Column(Float)
    centerLatitude = Column(Float)
    centerLongitude = Column(Float)

    # Tipologie (JSON string)
    propertyTypes = Column(Text)  # JSON array

    # Budget
    priceMin = Column(Float)
    priceMax = Column(Float)

    # Dimensioni
    sqmMin = Column(Float)
    sqmMax = Column(Float)
    roomsMin = Column(Integer)
    roomsMax = Column(Integer)
    bedroomsMin = Column(Integer)
    bathroomsMin = Column(Integer)

    # Features Richieste
    requiresElevator = Column(Boolean, default=False)
    requiresParking = Column(Boolean, default=False)
    requiresGarden = Column(Boolean, default=False)
    requiresTerrace = Column(Boolean, default=False)

    # Note
    notes = Column(Text)

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())

    # Relationships
    contact = relationship("Contact", back_populates="requests")
    matches = relationship("Match", back_populates="request")


class Match(Base):
    """Matches table - mirror of Prisma Match model"""
    __tablename__ = "matches"

    id = Column(String, primary_key=True)

    # Relations
    requestId = Column(String, ForeignKey("requests.id"), nullable=False, index=True)
    propertyId = Column(String, ForeignKey("properties.id"), nullable=False, index=True)
    contactId = Column(String, ForeignKey("contacts.id"), index=True)

    # Scoring
    scoreTotal = Column(Integer, nullable=False, index=True)
    scoreLocation = Column(Integer)
    scorePrice = Column(Integer)
    scoreSize = Column(Integer)
    scoreFeatures = Column(Integer)

    # Stato
    status = Column(String, default="suggested", index=True)

    # Feedback
    clientReaction = Column(String)
    rejectionReason = Column(String)
    clientNotes = Column(Text)

    # Note Agente
    agentNotes = Column(Text)

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())

    # Relationships
    request = relationship("Request", back_populates="matches")
    property = relationship("Property", back_populates="matches")


class Activity(Base):
    """Activities table - mirror of Prisma Activity model"""
    __tablename__ = "activities"

    id = Column(String, primary_key=True)

    # Polymorphic Relations
    contactId = Column(String, ForeignKey("contacts.id"), index=True)
    propertyId = Column(String, ForeignKey("properties.id"), index=True)
    requestId = Column(String, ForeignKey("requests.id"), index=True)
    buildingId = Column(String, ForeignKey("buildings.id"), index=True)

    # Tipo & Stato
    activityType = Column(String, nullable=False, index=True)
    status = Column(String, default="scheduled", index=True)
    priority = Column(String, default="normal", index=True)

    # Temporizzazione
    scheduledAt = Column(DateTime, index=True)
    completedAt = Column(DateTime, index=True)
    dueDate = Column(DateTime, index=True)

    # Contenuto
    title = Column(String, nullable=False)
    description = Column(Text)
    outcome = Column(Text)

    # Dettagli (JSON string)
    details = Column(Text, default="{}")

    # Note
    notes = Column(Text)

    # Timestamps
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, onupdate=func.now())


# Indexes (already defined inline, but listed here for reference)
"""
Indexes defined:
- contacts: code, fullName, primaryPhone, primaryEmail, city, status, source, importance
- properties: code, ownerContactId, buildingId, status, contractType, propertyType, city, zone, priceSale, priceRentMonthly, sqmCommercial, rooms, bedrooms
- buildings: code, city+street+civic (composite via tuple)
- requests: code, contactId, status, requestType, contractType
- matches: requestId, propertyId, scoreTotal, status
- activities: contactId, propertyId, requestId, buildingId, activityType, status, scheduledAt, completedAt, dueDate, priority
"""
