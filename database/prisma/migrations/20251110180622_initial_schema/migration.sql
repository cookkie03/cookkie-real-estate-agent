-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "agencyName" TEXT,
    "agencyVat" TEXT,
    "agencyAddress" TEXT,
    "settings" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "entityType" TEXT NOT NULL DEFAULT 'person',
    "fullName" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    "primaryPhone" TEXT,
    "secondaryPhone" TEXT,
    "primaryEmail" TEXT,
    "secondaryEmail" TEXT,
    "street" TEXT,
    "civic" TEXT,
    "city" TEXT,
    "province" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'Italia',
    "latitude" REAL,
    "longitude" REAL,
    "taxCode" TEXT,
    "vatNumber" TEXT,
    "birthDate" DATETIME,
    "nationality" TEXT,
    "privacyFirstContact" BOOLEAN NOT NULL DEFAULT false,
    "privacyFirstContactDate" DATETIME,
    "privacyExtended" BOOLEAN NOT NULL DEFAULT false,
    "privacyExtendedDate" DATETIME,
    "privacyMarketing" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "leadScore" INTEGER,
    "importance" TEXT NOT NULL DEFAULT 'normal',
    "budgetMin" DECIMAL,
    "budgetMax" DECIMAL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastContactDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "civic" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "zip" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "cadastralSheet" TEXT,
    "cadastralParticle" TEXT,
    "cadastralZone" TEXT,
    "yearBuilt" INTEGER,
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "activeUnits" INTEGER NOT NULL DEFAULT 0,
    "soldUnits" INTEGER NOT NULL DEFAULT 0,
    "avgUrgency" REAL,
    "lastSurveyDate" DATETIME,
    "nextSurveyDue" DATETIME,
    "unitsSurveyed" INTEGER NOT NULL DEFAULT 0,
    "unitsInterested" INTEGER NOT NULL DEFAULT 0,
    "administratorName" TEXT,
    "administratorPhone" TEXT,
    "administratorEmail" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "ownerContactId" TEXT,
    "buildingId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "source" TEXT NOT NULL DEFAULT 'direct_mandate',
    "sourceUrl" TEXT,
    "importDate" DATETIME,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "street" TEXT NOT NULL,
    "civic" TEXT,
    "internal" TEXT,
    "floor" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "zone" TEXT,
    "zip" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "contractType" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "propertyCategory" TEXT,
    "sqmCommercial" REAL,
    "sqmLivable" REAL,
    "rooms" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "hasGarage" BOOLEAN NOT NULL DEFAULT false,
    "hasGarden" BOOLEAN NOT NULL DEFAULT false,
    "hasTerrace" BOOLEAN NOT NULL DEFAULT false,
    "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
    "hasCellar" BOOLEAN NOT NULL DEFAULT false,
    "hasAttic" BOOLEAN NOT NULL DEFAULT false,
    "hasSwimmingPool" BOOLEAN NOT NULL DEFAULT false,
    "hasFireplace" BOOLEAN NOT NULL DEFAULT false,
    "hasAlarm" BOOLEAN NOT NULL DEFAULT false,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "heatingType" TEXT,
    "energyClass" TEXT,
    "yearBuilt" INTEGER,
    "yearRenovated" INTEGER,
    "priceSale" DECIMAL,
    "priceRentMonthly" DECIMAL,
    "priceMinAcceptable" DECIMAL,
    "condominiumFees" DECIMAL,
    "estimatedValue" DECIMAL,
    "estimatedDaysToSell" INTEGER,
    "estimatedRentMonthly" DECIMAL,
    "mandateType" TEXT,
    "mandateStartDate" DATETIME,
    "mandateEndDate" DATETIME,
    "mandateNumber" TEXT,
    "needsInternalVisit" BOOLEAN NOT NULL DEFAULT false,
    "needsPhotos" BOOLEAN NOT NULL DEFAULT false,
    "needsValuation" BOOLEAN NOT NULL DEFAULT false,
    "ownerToContact" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT,
    "description" TEXT,
    "photosCount" INTEGER NOT NULL DEFAULT 0,
    "hasProfessionalPhotos" BOOLEAN NOT NULL DEFAULT false,
    "hasVirtualTour" BOOLEAN NOT NULL DEFAULT false,
    "has3DModel" BOOLEAN NOT NULL DEFAULT false,
    "hasFloorPlan" BOOLEAN NOT NULL DEFAULT false,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "inquiriesCount" INTEGER NOT NULL DEFAULT 0,
    "visitsCount" INTEGER NOT NULL DEFAULT 0,
    "daysOnMarket" INTEGER NOT NULL DEFAULT 0,
    "urgencyScore" INTEGER NOT NULL DEFAULT 0,
    "lastActivityAt" DATETIME,
    "notes" TEXT,
    "internalNotes" TEXT,
    "soldDate" DATETIME,
    "rentedDate" DATETIME,
    "soldPrice" DECIMAL,
    "rentedPrice" DECIMAL,
    "closedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "publishedAt" DATETIME,
    "archivedAt" DATETIME,
    CONSTRAINT "properties_ownerContactId_fkey" FOREIGN KEY ("ownerContactId") REFERENCES "contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "properties_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "requestType" TEXT NOT NULL DEFAULT 'search_buy',
    "status" TEXT NOT NULL DEFAULT 'active',
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "contractType" TEXT,
    "searchCities" JSONB,
    "searchZones" JSONB,
    "propertyTypes" JSONB,
    "searchRadiusKm" REAL,
    "centerLatitude" REAL,
    "centerLongitude" REAL,
    "priceMin" DECIMAL,
    "priceMax" DECIMAL,
    "sqmMin" REAL,
    "sqmMax" REAL,
    "roomsMin" INTEGER,
    "roomsMax" INTEGER,
    "bedroomsMin" INTEGER,
    "bedroomsMax" INTEGER,
    "bathroomsMin" INTEGER,
    "requiresElevator" BOOLEAN NOT NULL DEFAULT false,
    "requiresParking" BOOLEAN NOT NULL DEFAULT false,
    "requiresGarage" BOOLEAN NOT NULL DEFAULT false,
    "requiresGarden" BOOLEAN NOT NULL DEFAULT false,
    "requiresTerrace" BOOLEAN NOT NULL DEFAULT false,
    "requiresBalcony" BOOLEAN NOT NULL DEFAULT false,
    "excludeGroundFloor" BOOLEAN NOT NULL DEFAULT false,
    "excludeTopFloorNoElevator" BOOLEAN NOT NULL DEFAULT false,
    "excludeBasement" BOOLEAN NOT NULL DEFAULT false,
    "excludeNorthFacing" BOOLEAN NOT NULL DEFAULT false,
    "minCondition" TEXT,
    "minEnergyClass" TEXT,
    "maxYearBuilt" INTEGER,
    "moveDate" DATETIME,
    "expiresAt" DATETIME,
    "notes" TEXT,
    "satisfiedByMatchId" TEXT,
    "satisfiedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "requests_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "contactId" TEXT,
    "scoreTotal" INTEGER NOT NULL,
    "scoreLocation" INTEGER,
    "scorePrice" INTEGER,
    "scoreSize" INTEGER,
    "scoreFeatures" INTEGER,
    "scoreCondition" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "clientReaction" TEXT,
    "rejectionReason" TEXT,
    "clientNotes" TEXT,
    "sentDate" DATETIME,
    "viewedDate" DATETIME,
    "visitedDate" DATETIME,
    "agentNotes" TEXT,
    "closedDate" DATETIME,
    "closedReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "matches_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matches_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "matches_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contactId" TEXT,
    "propertyId" TEXT,
    "requestId" TEXT,
    "buildingId" TEXT,
    "activityType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "scheduledAt" DATETIME,
    "completedAt" DATETIME,
    "dueDate" DATETIME,
    "duration" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "outcome" TEXT,
    "details" JSONB,
    "locationAddress" TEXT,
    "locationCity" TEXT,
    "locationNotes" TEXT,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "reminderDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "activities_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "activities_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "color" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "entity_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tagId" TEXT NOT NULL,
    "contactId" TEXT,
    "propertyId" TEXT,
    "requestId" TEXT,
    "buildingId" TEXT,
    "activityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "entity_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_tags_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_tags_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_tags_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "requests" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_tags_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "entity_tags_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT DEFAULT 'system',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "custom_field_definitions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "validationRules" JSONB,
    "options" JSONB,
    "section" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "custom_field_values" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fieldId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "valueText" TEXT,
    "valueNumber" REAL,
    "valueBoolean" BOOLEAN,
    "valueDate" DATETIME,
    "valueJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "custom_field_values_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "custom_field_definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "scraping_jobs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portal" TEXT NOT NULL,
    "location" TEXT,
    "contractType" TEXT,
    "propertyType" TEXT,
    "priceMin" DECIMAL,
    "priceMax" DECIMAL,
    "sqmMin" REAL,
    "sqmMax" REAL,
    "roomsMin" INTEGER,
    "roomsMax" INTEGER,
    "maxPages" INTEGER NOT NULL DEFAULT 5,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "listingsFound" INTEGER NOT NULL DEFAULT 0,
    "listingsSaved" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "createdBy" TEXT NOT NULL DEFAULT 'user',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scraping_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portal" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "cookies" JSONB NOT NULL,
    "localStorage" JSONB,
    "sessionStorage" JSONB,
    "viewportWidth" INTEGER NOT NULL DEFAULT 1920,
    "viewportHeight" INTEGER NOT NULL DEFAULT 1080,
    "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT,
    "proxyUrl" TEXT,
    "proxyUsername" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSuccess" DATETIME,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userPrompt" TEXT NOT NULL,
    "agentPlan" JSONB,
    "results" JSONB,
    "summary" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "executionTime" INTEGER,
    "sourcesUsed" JSONB,
    "userFeedback" TEXT,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "sourceName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "result" JSONB,
    "error" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "dependsOn" JSONB,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "agent_tasks_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "agent_conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "memoryType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "scope" TEXT,
    "context" JSONB,
    "confidence" REAL NOT NULL DEFAULT 0.5,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" DATETIME,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "scraping_sources" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL DEFAULT 'portal',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "requiresAuth" BOOLEAN NOT NULL DEFAULT false,
    "aiKnowledge" JSONB,
    "lastLearning" DATETIME,
    "credentials" JSONB,
    "successRate" REAL NOT NULL DEFAULT 0.0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "successfulJobs" INTEGER NOT NULL DEFAULT 0,
    "failedJobs" INTEGER NOT NULL DEFAULT 0,
    "rateLimit" REAL,
    "lastRequestAt" DATETIME,
    "description" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_email_key" ON "user_profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_code_key" ON "contacts"("code");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_taxCode_key" ON "contacts"("taxCode");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_vatNumber_key" ON "contacts"("vatNumber");

-- CreateIndex
CREATE INDEX "contacts_code_idx" ON "contacts"("code");

-- CreateIndex
CREATE INDEX "contacts_fullName_idx" ON "contacts"("fullName");

-- CreateIndex
CREATE INDEX "contacts_city_idx" ON "contacts"("city");

-- CreateIndex
CREATE INDEX "contacts_status_idx" ON "contacts"("status");

-- CreateIndex
CREATE INDEX "contacts_source_idx" ON "contacts"("source");

-- CreateIndex
CREATE INDEX "contacts_importance_idx" ON "contacts"("importance");

-- CreateIndex
CREATE INDEX "contacts_status_lastContactDate_idx" ON "contacts"("status", "lastContactDate");

-- CreateIndex
CREATE INDEX "contacts_city_status_idx" ON "contacts"("city", "status");

-- CreateIndex
CREATE INDEX "contacts_importance_status_idx" ON "contacts"("importance", "status");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_code_key" ON "buildings"("code");

-- CreateIndex
CREATE INDEX "buildings_code_idx" ON "buildings"("code");

-- CreateIndex
CREATE INDEX "buildings_city_street_civic_idx" ON "buildings"("city", "street", "civic");

-- CreateIndex
CREATE INDEX "buildings_nextSurveyDue_idx" ON "buildings"("nextSurveyDue");

-- CreateIndex
CREATE INDEX "buildings_latitude_longitude_idx" ON "buildings"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "buildings_city_cadastralZone_idx" ON "buildings"("city", "cadastralZone");

-- CreateIndex
CREATE INDEX "buildings_avgUrgency_idx" ON "buildings"("avgUrgency");

-- CreateIndex
CREATE UNIQUE INDEX "properties_code_key" ON "properties"("code");

-- CreateIndex
CREATE INDEX "properties_code_idx" ON "properties"("code");

-- CreateIndex
CREATE INDEX "properties_ownerContactId_idx" ON "properties"("ownerContactId");

-- CreateIndex
CREATE INDEX "properties_buildingId_idx" ON "properties"("buildingId");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_contractType_idx" ON "properties"("contractType");

-- CreateIndex
CREATE INDEX "properties_propertyType_idx" ON "properties"("propertyType");

-- CreateIndex
CREATE INDEX "properties_city_idx" ON "properties"("city");

-- CreateIndex
CREATE INDEX "properties_zone_idx" ON "properties"("zone");

-- CreateIndex
CREATE INDEX "properties_priceSale_idx" ON "properties"("priceSale");

-- CreateIndex
CREATE INDEX "properties_priceRentMonthly_idx" ON "properties"("priceRentMonthly");

-- CreateIndex
CREATE INDEX "properties_sqmCommercial_idx" ON "properties"("sqmCommercial");

-- CreateIndex
CREATE INDEX "properties_rooms_idx" ON "properties"("rooms");

-- CreateIndex
CREATE INDEX "properties_bedrooms_idx" ON "properties"("bedrooms");

-- CreateIndex
CREATE INDEX "properties_status_contractType_idx" ON "properties"("status", "contractType");

-- CreateIndex
CREATE INDEX "properties_needsInternalVisit_idx" ON "properties"("needsInternalVisit");

-- CreateIndex
CREATE INDEX "properties_mandateEndDate_idx" ON "properties"("mandateEndDate");

-- CreateIndex
CREATE INDEX "properties_urgencyScore_idx" ON "properties"("urgencyScore");

-- CreateIndex
CREATE INDEX "properties_lastActivityAt_idx" ON "properties"("lastActivityAt");

-- CreateIndex
CREATE INDEX "properties_latitude_longitude_idx" ON "properties"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "properties_status_contractType_city_idx" ON "properties"("status", "contractType", "city");

-- CreateIndex
CREATE INDEX "properties_contractType_propertyType_city_idx" ON "properties"("contractType", "propertyType", "city");

-- CreateIndex
CREATE INDEX "properties_city_zone_status_idx" ON "properties"("city", "zone", "status");

-- CreateIndex
CREATE INDEX "properties_status_urgencyScore_idx" ON "properties"("status", "urgencyScore");

-- CreateIndex
CREATE UNIQUE INDEX "requests_code_key" ON "requests"("code");

-- CreateIndex
CREATE INDEX "requests_code_idx" ON "requests"("code");

-- CreateIndex
CREATE INDEX "requests_contactId_idx" ON "requests"("contactId");

-- CreateIndex
CREATE INDEX "requests_status_idx" ON "requests"("status");

-- CreateIndex
CREATE INDEX "requests_requestType_idx" ON "requests"("requestType");

-- CreateIndex
CREATE INDEX "requests_urgency_idx" ON "requests"("urgency");

-- CreateIndex
CREATE INDEX "requests_expiresAt_idx" ON "requests"("expiresAt");

-- CreateIndex
CREATE INDEX "requests_contactId_status_idx" ON "requests"("contactId", "status");

-- CreateIndex
CREATE INDEX "requests_status_urgency_idx" ON "requests"("status", "urgency");

-- CreateIndex
CREATE INDEX "requests_requestType_status_idx" ON "requests"("requestType", "status");

-- CreateIndex
CREATE INDEX "matches_requestId_idx" ON "matches"("requestId");

-- CreateIndex
CREATE INDEX "matches_propertyId_idx" ON "matches"("propertyId");

-- CreateIndex
CREATE INDEX "matches_contactId_idx" ON "matches"("contactId");

-- CreateIndex
CREATE INDEX "matches_scoreTotal_idx" ON "matches"("scoreTotal");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_sentDate_idx" ON "matches"("sentDate");

-- CreateIndex
CREATE INDEX "matches_requestId_status_idx" ON "matches"("requestId", "status");

-- CreateIndex
CREATE INDEX "matches_propertyId_status_idx" ON "matches"("propertyId", "status");

-- CreateIndex
CREATE INDEX "matches_contactId_status_idx" ON "matches"("contactId", "status");

-- CreateIndex
CREATE INDEX "matches_status_scoreTotal_idx" ON "matches"("status", "scoreTotal");

-- CreateIndex
CREATE INDEX "activities_contactId_idx" ON "activities"("contactId");

-- CreateIndex
CREATE INDEX "activities_propertyId_idx" ON "activities"("propertyId");

-- CreateIndex
CREATE INDEX "activities_requestId_idx" ON "activities"("requestId");

-- CreateIndex
CREATE INDEX "activities_buildingId_idx" ON "activities"("buildingId");

-- CreateIndex
CREATE INDEX "activities_activityType_idx" ON "activities"("activityType");

-- CreateIndex
CREATE INDEX "activities_status_idx" ON "activities"("status");

-- CreateIndex
CREATE INDEX "activities_scheduledAt_idx" ON "activities"("scheduledAt");

-- CreateIndex
CREATE INDEX "activities_dueDate_idx" ON "activities"("dueDate");

-- CreateIndex
CREATE INDEX "activities_contactId_status_idx" ON "activities"("contactId", "status");

-- CreateIndex
CREATE INDEX "activities_contactId_activityType_idx" ON "activities"("contactId", "activityType");

-- CreateIndex
CREATE INDEX "activities_status_scheduledAt_idx" ON "activities"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "activities_activityType_scheduledAt_idx" ON "activities"("activityType", "scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_name_idx" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_category_idx" ON "tags"("category");

-- CreateIndex
CREATE INDEX "entity_tags_tagId_idx" ON "entity_tags"("tagId");

-- CreateIndex
CREATE INDEX "entity_tags_contactId_idx" ON "entity_tags"("contactId");

-- CreateIndex
CREATE INDEX "entity_tags_propertyId_idx" ON "entity_tags"("propertyId");

-- CreateIndex
CREATE INDEX "entity_tags_requestId_idx" ON "entity_tags"("requestId");

-- CreateIndex
CREATE INDEX "entity_tags_buildingId_idx" ON "entity_tags"("buildingId");

-- CreateIndex
CREATE INDEX "entity_tags_activityId_idx" ON "entity_tags"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tagId_contactId_key" ON "entity_tags"("tagId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tagId_propertyId_key" ON "entity_tags"("tagId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tagId_requestId_key" ON "entity_tags"("tagId", "requestId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tagId_buildingId_key" ON "entity_tags"("tagId", "buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "entity_tags_tagId_activityId_key" ON "entity_tags"("tagId", "activityId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "custom_field_definitions_entityType_isActive_idx" ON "custom_field_definitions"("entityType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_definitions_entityType_name_key" ON "custom_field_definitions"("entityType", "name");

-- CreateIndex
CREATE INDEX "custom_field_values_entityType_entityId_idx" ON "custom_field_values"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "custom_field_values_fieldId_idx" ON "custom_field_values"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_values_fieldId_entityType_entityId_key" ON "custom_field_values"("fieldId", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "scraping_jobs_status_idx" ON "scraping_jobs"("status");

-- CreateIndex
CREATE INDEX "scraping_jobs_portal_idx" ON "scraping_jobs"("portal");

-- CreateIndex
CREATE INDEX "scraping_jobs_createdAt_idx" ON "scraping_jobs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "scraping_sessions_portal_key" ON "scraping_sessions"("portal");

-- CreateIndex
CREATE INDEX "scraping_sessions_portal_idx" ON "scraping_sessions"("portal");

-- CreateIndex
CREATE INDEX "scraping_sessions_isAuthenticated_idx" ON "scraping_sessions"("isAuthenticated");

-- CreateIndex
CREATE INDEX "scraping_sessions_lastUsedAt_idx" ON "scraping_sessions"("lastUsedAt");

-- CreateIndex
CREATE INDEX "agent_conversations_status_idx" ON "agent_conversations"("status");

-- CreateIndex
CREATE INDEX "agent_conversations_startedAt_idx" ON "agent_conversations"("startedAt");

-- CreateIndex
CREATE INDEX "agent_conversations_createdAt_idx" ON "agent_conversations"("createdAt");

-- CreateIndex
CREATE INDEX "agent_tasks_conversationId_idx" ON "agent_tasks"("conversationId");

-- CreateIndex
CREATE INDEX "agent_tasks_status_idx" ON "agent_tasks"("status");

-- CreateIndex
CREATE INDEX "agent_tasks_taskType_idx" ON "agent_tasks"("taskType");

-- CreateIndex
CREATE INDEX "agent_tasks_startedAt_idx" ON "agent_tasks"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "agent_memories_key_key" ON "agent_memories"("key");

-- CreateIndex
CREATE INDEX "agent_memories_memoryType_idx" ON "agent_memories"("memoryType");

-- CreateIndex
CREATE INDEX "agent_memories_scope_idx" ON "agent_memories"("scope");

-- CreateIndex
CREATE INDEX "agent_memories_confidence_idx" ON "agent_memories"("confidence");

-- CreateIndex
CREATE INDEX "agent_memories_usageCount_idx" ON "agent_memories"("usageCount");

-- CreateIndex
CREATE INDEX "agent_memories_lastUsed_idx" ON "agent_memories"("lastUsed");

-- CreateIndex
CREATE UNIQUE INDEX "scraping_sources_name_key" ON "scraping_sources"("name");

-- CreateIndex
CREATE INDEX "scraping_sources_name_idx" ON "scraping_sources"("name");

-- CreateIndex
CREATE INDEX "scraping_sources_sourceType_idx" ON "scraping_sources"("sourceType");

-- CreateIndex
CREATE INDEX "scraping_sources_isActive_idx" ON "scraping_sources"("isActive");
