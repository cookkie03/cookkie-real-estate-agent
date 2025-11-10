# ==============================================================================
# AUTO-GENERATED SQLAlchemy Models from Prisma Schema
# ==============================================================================
# ⚠️  DO NOT EDIT MANUALLY!
#
# Generated on: 2025-11-10T21:33:43.523Z
# Source: database/prisma/schema.prisma
# Generator: scripts/generate-sqlalchemy-models.ts
#
# To regenerate: npm run generate:sqlalchemy
# ==============================================================================

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, DECIMAL, BigInteger
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
from typing import Optional
import enum

# ==============================================================================
# ENUMS
# ==============================================================================

class ContactStatus(str, enum.Enum):
    """ContactStatus enum"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    BLACKLIST = "blacklist"

class PropertyStatus(str, enum.Enum):
    """PropertyStatus enum"""
    DRAFT = "draft"
    AVAILABLE = "available"
    OPTION = "option"
    SOLD = "sold"
    RENTED = "rented"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"

class RequestStatus(str, enum.Enum):
    """RequestStatus enum"""
    ACTIVE = "active"
    PAUSED = "paused"
    SATISFIED = "satisfied"
    CANCELLED = "cancelled"

class MatchStatus(str, enum.Enum):
    """MatchStatus enum"""
    SUGGESTED = "suggested"
    SENT = "sent"
    VIEWED = "viewed"
    VISITED = "visited"
    INTERESTED = "interested"
    REJECTED = "rejected"
    CLOSED = "closed"

class ActivityStatus(str, enum.Enum):
    """ActivityStatus enum"""
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"

# ==============================================================================
# MODELS
# ==============================================================================

class UserProfile(Base):
    """UserProfile model"""
    __tablename__ = "user_profile"

    id = Column(String, primary_key=True)
    fullName = Column(String)
    email = Column(String, unique=True)
    phone = Column(String, nullable=True)  # Optional
    agencyName = Column(String, nullable=True)  # Optional
    agencyVat = Column(String, nullable=True)  # Optional
    agencyAddress = Column(String, nullable=True)  # Optional
    settings = Column(JSON, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    def __repr__(self):
        return f"<UserProfile(id={self.id})>"

class Contact(Base):
    """Contact model"""
    __tablename__ = "contacts"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    entityType = Column(String)
    fullName = Column(String)
    firstName = Column(String, nullable=True)  # Optional
    lastName = Column(String, nullable=True)  # Optional
    companyName = Column(String, nullable=True)  # Optional
    primaryPhone = Column(String, nullable=True)  # Optional
    secondaryPhone = Column(String, nullable=True)  # Optional
    primaryEmail = Column(String, nullable=True)  # Optional
    secondaryEmail = Column(String, nullable=True)  # Optional
    street = Column(String, nullable=True)  # Optional
    civic = Column(String, nullable=True)  # Optional
    city = Column(String, nullable=True)  # Optional
    province = Column(String, nullable=True)  # Optional
    zip = Column(String, nullable=True)  # Optional
    country = Column(String, nullable=True)  # Optional
    latitude = Column(Float, nullable=True)  # Optional
    longitude = Column(Float, nullable=True)  # Optional
    taxCode = Column(String, nullable=True, unique=True)  # Optional
    vatNumber = Column(String, nullable=True, unique=True)  # Optional
    birthDate = Column(DateTime, nullable=True)  # Optional
    nationality = Column(String, nullable=True)  # Optional
    privacyFirstContact = Column(Boolean)
    privacyFirstContactDate = Column(DateTime, nullable=True)  # Optional
    privacyExtended = Column(Boolean)
    privacyExtendedDate = Column(DateTime, nullable=True)  # Optional
    privacyMarketing = Column(Boolean)
    source = Column(String, nullable=True)  # Optional
    leadScore = Column(Integer, nullable=True)  # Optional
    importance = Column(String)
    budgetMin = Column(Numeric, nullable=True)  # Optional
    budgetMax = Column(Numeric, nullable=True)  # Optional
    status = Column(ContactStatus)
    lastContactDate = Column(DateTime, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    ownedProperties = relationship("Property")  # TODO: Configure relationship
    requests = relationship("Request")  # TODO: Configure relationship
    matches = relationship("Match")  # TODO: Configure relationship
    activities = relationship("Activity")  # TODO: Configure relationship
    tags = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Contact(id={self.id})>"

class Building(Base):
    """Building model"""
    __tablename__ = "buildings"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    street = Column(String)
    civic = Column(String)
    city = Column(String)
    province = Column(String)
    zip = Column(String, nullable=True)  # Optional
    latitude = Column(Float)
    longitude = Column(Float)
    cadastralSheet = Column(String, nullable=True)  # Optional
    cadastralParticle = Column(String, nullable=True)  # Optional
    cadastralZone = Column(String, nullable=True)  # Optional
    yearBuilt = Column(Integer, nullable=True)  # Optional
    totalFloors = Column(Integer, nullable=True)  # Optional
    totalUnits = Column(Integer, nullable=True)  # Optional
    hasElevator = Column(Boolean)
    condition = Column(String, nullable=True)  # Optional
    activeUnits = Column(Integer)
    soldUnits = Column(Integer)
    avgUrgency = Column(Float, nullable=True)  # Optional
    lastSurveyDate = Column(DateTime, nullable=True)  # Optional
    nextSurveyDue = Column(DateTime, nullable=True)  # Optional
    unitsSurveyed = Column(Integer)
    unitsInterested = Column(Integer)
    administratorName = Column(String, nullable=True)  # Optional
    administratorPhone = Column(String, nullable=True)  # Optional
    administratorEmail = Column(String, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    properties = relationship("Property")  # TODO: Configure relationship
    activities = relationship("Activity")  # TODO: Configure relationship
    tags = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Building(id={self.id})>"

class Property(Base):
    """Property model"""
    __tablename__ = "properties"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    ownerContactId = Column(String, nullable=True)  # Optional
    buildingId = Column(String, nullable=True)  # Optional
    status = Column(PropertyStatus)
    visibility = Column(String)
    source = Column(String)
    sourceUrl = Column(String, nullable=True)  # Optional
    importDate = Column(DateTime, nullable=True)  # Optional
    verified = Column(Boolean)
    street = Column(String)
    civic = Column(String, nullable=True)  # Optional
    internal = Column(String, nullable=True)  # Optional
    floor = Column(String, nullable=True)  # Optional
    city = Column(String)
    province = Column(String)
    zone = Column(String, nullable=True)  # Optional
    zip = Column(String, nullable=True)  # Optional
    latitude = Column(Float)
    longitude = Column(Float)
    contractType = Column(String)
    propertyType = Column(String)
    propertyCategory = Column(String, nullable=True)  # Optional
    sqmCommercial = Column(Float, nullable=True)  # Optional
    sqmLivable = Column(Float, nullable=True)  # Optional
    rooms = Column(Integer, nullable=True)  # Optional
    bedrooms = Column(Integer, nullable=True)  # Optional
    bathrooms = Column(Integer, nullable=True)  # Optional
    hasElevator = Column(Boolean)
    hasParking = Column(Boolean)
    hasGarage = Column(Boolean)
    hasGarden = Column(Boolean)
    hasTerrace = Column(Boolean)
    hasBalcony = Column(Boolean)
    hasCellar = Column(Boolean)
    hasAttic = Column(Boolean)
    hasSwimmingPool = Column(Boolean)
    hasFireplace = Column(Boolean)
    hasAlarm = Column(Boolean)
    hasAirConditioning = Column(Boolean)
    condition = Column(String, nullable=True)  # Optional
    heatingType = Column(String, nullable=True)  # Optional
    energyClass = Column(String, nullable=True)  # Optional
    yearBuilt = Column(Integer, nullable=True)  # Optional
    yearRenovated = Column(Integer, nullable=True)  # Optional
    priceSale = Column(Numeric, nullable=True)  # Optional
    priceRentMonthly = Column(Numeric, nullable=True)  # Optional
    priceMinAcceptable = Column(Numeric, nullable=True)  # Optional
    condominiumFees = Column(Numeric, nullable=True)  # Optional
    estimatedValue = Column(Numeric, nullable=True)  # Optional
    estimatedDaysToSell = Column(Integer, nullable=True)  # Optional
    estimatedRentMonthly = Column(Numeric, nullable=True)  # Optional
    mandateType = Column(String, nullable=True)  # Optional
    mandateStartDate = Column(DateTime, nullable=True)  # Optional
    mandateEndDate = Column(DateTime, nullable=True)  # Optional
    mandateNumber = Column(String, nullable=True)  # Optional
    needsInternalVisit = Column(Boolean)
    needsPhotos = Column(Boolean)
    needsValuation = Column(Boolean)
    ownerToContact = Column(Boolean)
    title = Column(String, nullable=True)  # Optional
    description = Column(String, nullable=True)  # Optional
    photosCount = Column(Integer)
    hasProfessionalPhotos = Column(Boolean)
    hasVirtualTour = Column(Boolean)
    has3DModel = Column(Boolean)
    hasFloorPlan = Column(Boolean)
    viewsCount = Column(Integer)
    inquiriesCount = Column(Integer)
    visitsCount = Column(Integer)
    daysOnMarket = Column(Integer)
    urgencyScore = Column(Integer)
    lastActivityAt = Column(DateTime, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    internalNotes = Column(String, nullable=True)  # Optional
    soldDate = Column(DateTime, nullable=True)  # Optional
    rentedDate = Column(DateTime, nullable=True)  # Optional
    soldPrice = Column(Numeric, nullable=True)  # Optional
    rentedPrice = Column(Numeric, nullable=True)  # Optional
    closedBy = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)
    publishedAt = Column(DateTime, nullable=True)  # Optional
    archivedAt = Column(DateTime, nullable=True)  # Optional

    # Relationships
    owner = relationship("Contact")  # TODO: Configure relationship
    building = relationship("Building")  # TODO: Configure relationship
    matches = relationship("Match")  # TODO: Configure relationship
    activities = relationship("Activity")  # TODO: Configure relationship
    tags = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Property(id={self.id})>"

class Request(Base):
    """Request model"""
    __tablename__ = "requests"

    id = Column(String, primary_key=True)
    code = Column(String, unique=True)
    contactId = Column(String)
    requestType = Column(String)
    status = Column(RequestStatus)
    urgency = Column(String)
    contractType = Column(String, nullable=True)  # Optional
    searchCities = Column(JSON, nullable=True)  # Optional
    searchZones = Column(JSON, nullable=True)  # Optional
    propertyTypes = Column(JSON, nullable=True)  # Optional
    searchRadiusKm = Column(Float, nullable=True)  # Optional
    centerLatitude = Column(Float, nullable=True)  # Optional
    centerLongitude = Column(Float, nullable=True)  # Optional
    priceMin = Column(Numeric, nullable=True)  # Optional
    priceMax = Column(Numeric, nullable=True)  # Optional
    sqmMin = Column(Float, nullable=True)  # Optional
    sqmMax = Column(Float, nullable=True)  # Optional
    roomsMin = Column(Integer, nullable=True)  # Optional
    roomsMax = Column(Integer, nullable=True)  # Optional
    bedroomsMin = Column(Integer, nullable=True)  # Optional
    bedroomsMax = Column(Integer, nullable=True)  # Optional
    bathroomsMin = Column(Integer, nullable=True)  # Optional
    requiresElevator = Column(Boolean)
    requiresParking = Column(Boolean)
    requiresGarage = Column(Boolean)
    requiresGarden = Column(Boolean)
    requiresTerrace = Column(Boolean)
    requiresBalcony = Column(Boolean)
    excludeGroundFloor = Column(Boolean)
    excludeTopFloorNoElevator = Column(Boolean)
    excludeBasement = Column(Boolean)
    excludeNorthFacing = Column(Boolean)
    minCondition = Column(String, nullable=True)  # Optional
    minEnergyClass = Column(String, nullable=True)  # Optional
    maxYearBuilt = Column(Integer, nullable=True)  # Optional
    moveDate = Column(DateTime, nullable=True)  # Optional
    expiresAt = Column(DateTime, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    satisfiedByMatchId = Column(String, nullable=True)  # Optional
    satisfiedDate = Column(DateTime, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    contact = relationship("Contact")  # TODO: Configure relationship
    matches = relationship("Match")  # TODO: Configure relationship
    activities = relationship("Activity")  # TODO: Configure relationship
    tags = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Request(id={self.id})>"

class Match(Base):
    """Match model"""
    __tablename__ = "matches"

    id = Column(String, primary_key=True)
    requestId = Column(String)
    propertyId = Column(String)
    contactId = Column(String, nullable=True)  # Optional
    scoreTotal = Column(Integer)
    scoreLocation = Column(Integer, nullable=True)  # Optional
    scorePrice = Column(Integer, nullable=True)  # Optional
    scoreSize = Column(Integer, nullable=True)  # Optional
    scoreFeatures = Column(Integer, nullable=True)  # Optional
    scoreCondition = Column(Integer, nullable=True)  # Optional
    status = Column(MatchStatus)
    clientReaction = Column(String, nullable=True)  # Optional
    rejectionReason = Column(String, nullable=True)  # Optional
    clientNotes = Column(String, nullable=True)  # Optional
    sentDate = Column(DateTime, nullable=True)  # Optional
    viewedDate = Column(DateTime, nullable=True)  # Optional
    visitedDate = Column(DateTime, nullable=True)  # Optional
    agentNotes = Column(String, nullable=True)  # Optional
    closedDate = Column(DateTime, nullable=True)  # Optional
    closedReason = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    request = relationship("Request")  # TODO: Configure relationship
    property = relationship("Property")  # TODO: Configure relationship
    contact = relationship("Contact")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Match(id={self.id})>"

class Activity(Base):
    """Activity model"""
    __tablename__ = "activities"

    id = Column(String, primary_key=True)
    contactId = Column(String, nullable=True)  # Optional
    propertyId = Column(String, nullable=True)  # Optional
    requestId = Column(String, nullable=True)  # Optional
    buildingId = Column(String, nullable=True)  # Optional
    activityType = Column(String)
    status = Column(ActivityStatus)
    priority = Column(String)
    scheduledAt = Column(DateTime, nullable=True)  # Optional
    completedAt = Column(DateTime, nullable=True)  # Optional
    dueDate = Column(DateTime, nullable=True)  # Optional
    duration = Column(Integer, nullable=True)  # Optional
    title = Column(String)
    description = Column(String, nullable=True)  # Optional
    outcome = Column(String, nullable=True)  # Optional
    details = Column(JSON, nullable=True)  # Optional
    locationAddress = Column(String, nullable=True)  # Optional
    locationCity = Column(String, nullable=True)  # Optional
    locationNotes = Column(String, nullable=True)  # Optional
    reminderSent = Column(Boolean)
    reminderDate = Column(DateTime, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    contact = relationship("Contact")  # TODO: Configure relationship
    property = relationship("Property")  # TODO: Configure relationship
    request = relationship("Request")  # TODO: Configure relationship
    building = relationship("Building")  # TODO: Configure relationship
    tags = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Activity(id={self.id})>"

class Tag(Base):
    """Tag model"""
    __tablename__ = "tags"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True)
    category = Column(String, nullable=True)  # Optional
    color = Column(String, nullable=True)  # Optional
    usageCount = Column(Integer)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    entities = relationship("EntityTag")  # TODO: Configure relationship

    def __repr__(self):
        return f"<Tag(id={self.id})>"

class EntityTag(Base):
    """EntityTag model"""
    __tablename__ = "entity_tags"

    id = Column(String, primary_key=True)
    tagId = Column(String)
    contactId = Column(String, nullable=True)  # Optional
    propertyId = Column(String, nullable=True)  # Optional
    requestId = Column(String, nullable=True)  # Optional
    buildingId = Column(String, nullable=True)  # Optional
    activityId = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tag = relationship("Tag")  # TODO: Configure relationship
    contact = relationship("Contact")  # TODO: Configure relationship
    property = relationship("Property")  # TODO: Configure relationship
    request = relationship("Request")  # TODO: Configure relationship
    building = relationship("Building")  # TODO: Configure relationship
    activity = relationship("Activity")  # TODO: Configure relationship

    def __repr__(self):
        return f"<EntityTag(id={self.id})>"

class AuditLog(Base):
    """AuditLog model"""
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True)
    entityType = Column(String)
    entityId = Column(String)
    action = Column(String)
    oldValues = Column(JSON, nullable=True)  # Optional
    newValues = Column(JSON, nullable=True)  # Optional
    userId = Column(String, nullable=True)  # Optional
    ipAddress = Column(String, nullable=True)  # Optional
    userAgent = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AuditLog(id={self.id})>"

class CustomFieldDefinition(Base):
    """CustomFieldDefinition model"""
    __tablename__ = "custom_field_definitions"

    id = Column(String, primary_key=True)
    name = Column(String)
    label = Column(String)
    entityType = Column(String)
    fieldType = Column(String)
    required = Column(Boolean)
    validationRules = Column(JSON, nullable=True)  # Optional
    options = Column(JSON, nullable=True)  # Optional
    section = Column(String, nullable=True)  # Optional
    displayOrder = Column(Integer)
    isActive = Column(Boolean)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    values = relationship("CustomFieldValue")  # TODO: Configure relationship

    def __repr__(self):
        return f"<CustomFieldDefinition(id={self.id})>"

class CustomFieldValue(Base):
    """CustomFieldValue model"""
    __tablename__ = "custom_field_values"

    id = Column(String, primary_key=True)
    fieldId = Column(String)
    entityType = Column(String)
    entityId = Column(String)
    valueText = Column(String, nullable=True)  # Optional
    valueNumber = Column(Float, nullable=True)  # Optional
    valueBoolean = Column(Boolean, nullable=True)  # Optional
    valueDate = Column(DateTime, nullable=True)  # Optional
    valueJson = Column(JSON, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    field = relationship("CustomFieldDefinition")  # TODO: Configure relationship

    def __repr__(self):
        return f"<CustomFieldValue(id={self.id})>"

class ScrapingJob(Base):
    """ScrapingJob model"""
    __tablename__ = "scraping_jobs"

    id = Column(String, primary_key=True)
    portal = Column(String)
    location = Column(String, nullable=True)  # Optional
    contractType = Column(String, nullable=True)  # Optional
    propertyType = Column(String, nullable=True)  # Optional
    priceMin = Column(Numeric, nullable=True)  # Optional
    priceMax = Column(Numeric, nullable=True)  # Optional
    sqmMin = Column(Float, nullable=True)  # Optional
    sqmMax = Column(Float, nullable=True)  # Optional
    roomsMin = Column(Integer, nullable=True)  # Optional
    roomsMax = Column(Integer, nullable=True)  # Optional
    maxPages = Column(Integer)
    status = Column(String)
    listingsFound = Column(Integer)
    listingsSaved = Column(Integer)
    errors = Column(JSON, nullable=True)  # Optional
    startedAt = Column(DateTime, nullable=True)  # Optional
    completedAt = Column(DateTime, nullable=True)  # Optional
    duration = Column(Integer, nullable=True)  # Optional
    createdBy = Column(String)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    def __repr__(self):
        return f"<ScrapingJob(id={self.id})>"

class ScrapingSession(Base):
    """ScrapingSession model"""
    __tablename__ = "scraping_sessions"

    id = Column(String, primary_key=True)
    portal = Column(String, unique=True)
    userAgent = Column(String)
    cookies = Column(JSON)
    localStorage = Column(JSON, nullable=True)  # Optional
    sessionStorage = Column(JSON, nullable=True)  # Optional
    viewportWidth = Column(Integer)
    viewportHeight = Column(Integer)
    isAuthenticated = Column(Boolean)
    username = Column(String, nullable=True)  # Optional
    proxyUrl = Column(String, nullable=True)  # Optional
    proxyUsername = Column(String, nullable=True)  # Optional
    useCount = Column(Integer)
    successCount = Column(Integer)
    failureCount = Column(Integer)
    lastUsedAt = Column(DateTime, default=datetime.utcnow)
    lastSuccess = Column(DateTime, nullable=True)  # Optional
    isValid = Column(Boolean)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    def __repr__(self):
        return f"<ScrapingSession(id={self.id})>"

class AgentConversation(Base):
    """AgentConversation model"""
    __tablename__ = "agent_conversations"

    id = Column(String, primary_key=True)
    userPrompt = Column(String)
    agentPlan = Column(JSON, nullable=True)  # Optional
    results = Column(JSON, nullable=True)  # Optional
    summary = Column(String, nullable=True)  # Optional
    status = Column(String)
    startedAt = Column(DateTime, default=datetime.utcnow)
    completedAt = Column(DateTime, nullable=True)  # Optional
    executionTime = Column(Integer, nullable=True)  # Optional
    sourcesUsed = Column(JSON, nullable=True)  # Optional
    userFeedback = Column(String, nullable=True)  # Optional
    confidence = Column(Float, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    tasks = relationship("AgentTask")  # TODO: Configure relationship

    def __repr__(self):
        return f"<AgentConversation(id={self.id})>"

class AgentTask(Base):
    """AgentTask model"""
    __tablename__ = "agent_tasks"

    id = Column(String, primary_key=True)
    conversationId = Column(String)
    taskType = Column(String)
    description = Column(String)
    parameters = Column(JSON)
    sourceName = Column(String, nullable=True)  # Optional
    status = Column(String)
    result = Column(JSON, nullable=True)  # Optional
    error = Column(String, nullable=True)  # Optional
    startedAt = Column(DateTime, nullable=True)  # Optional
    completedAt = Column(DateTime, nullable=True)  # Optional
    duration = Column(Integer, nullable=True)  # Optional
    dependsOn = Column(JSON, nullable=True)  # Optional
    priority = Column(Integer)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    # Relationships
    conversation = relationship("AgentConversation")  # TODO: Configure relationship

    def __repr__(self):
        return f"<AgentTask(id={self.id})>"

class AgentMemory(Base):
    """AgentMemory model"""
    __tablename__ = "agent_memories"

    id = Column(String, primary_key=True)
    memoryType = Column(String)
    key = Column(String, unique=True)
    value = Column(JSON)
    scope = Column(String, nullable=True)  # Optional
    context = Column(JSON, nullable=True)  # Optional
    confidence = Column(Float)
    usageCount = Column(Integer)
    lastUsed = Column(DateTime, nullable=True)  # Optional
    successCount = Column(Integer)
    failureCount = Column(Integer)
    source = Column(String, nullable=True)  # Optional
    description = Column(String, nullable=True)  # Optional
    isActive = Column(Boolean)
    expiresAt = Column(DateTime, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    def __repr__(self):
        return f"<AgentMemory(id={self.id})>"

class ScrapingSource(Base):
    """ScrapingSource model"""
    __tablename__ = "scraping_sources"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True)
    baseUrl = Column(String)
    sourceType = Column(String)
    isActive = Column(Boolean)
    requiresAuth = Column(Boolean)
    aiKnowledge = Column(JSON, nullable=True)  # Optional
    lastLearning = Column(DateTime, nullable=True)  # Optional
    credentials = Column(JSON, nullable=True)  # Optional
    successRate = Column(Float)
    avgResponseTime = Column(Integer)
    totalJobs = Column(Integer)
    successfulJobs = Column(Integer)
    failedJobs = Column(Integer)
    rateLimit = Column(Float, nullable=True)  # Optional
    lastRequestAt = Column(DateTime, nullable=True)  # Optional
    description = Column(String, nullable=True)  # Optional
    notes = Column(String, nullable=True)  # Optional
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime)

    def __repr__(self):
        return f"<ScrapingSource(id={self.id})>"
