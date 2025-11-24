# System Flows

## User Flows

### 1. Property Management Flow

```mermaid
graph TD
    A[Agent Opens Property List] --> B{Filters Properties}
    B --> C[Views Property Cards]
    C --> D{Action?}
    D -->|View Details| E[Open Property Sheet]
    D -->|Edit| F[Edit Property Form]
    D -->|Add Photos| G[Upload Photos to MinIO]
    D -->|Calculate Urgency| H[Run Urgency Algorithm]
    E --> I[View on Map]
    F --> J[Save to Database]
    G --> J
    H --> J
```

### 2. Client Matching Flow

```mermaid
graph TD
    A[Agent Creates Client Request] --> B[Define Search Criteria]
    B --> C[Save Request to DB]
    C --> D[Trigger Matching Algorithm]
    D --> E[Calculate Scores for All Properties]
    E --> F[Rank by Total Score]
    F --> G[Display Match Results]
    G --> H{Agent Action}
    H -->|Send to Client| I[Create Email/WhatsApp]
    H -->|Schedule Visit| J[Create Calendar Event]
    H -->|Reject Match| K[Update Match Status]
```

### 3. AI Assistant Flow

```mermaid
graph TD
    A[User Types Query] --> B[Send via WebSocket]
    B --> C[AI Orchestrator Receives]
    C --> D{Identify Intent}
    D -->|Database Query| E[Database Agent]
    D -->|Email Task| F[Email Agent]
    D -->|Scraping Task| G[Scraping Agent]
    E --> H[Execute Tool]
    F --> H
    G --> H
    H --> I[Aggregate Results]
    I --> J[Generate Response]
    J --> K[Send via WebSocket]
    K --> L[Display in Chat]
```

### 4. Web Scraping Flow

```mermaid
graph TD
    A[Agent Starts Scraping Job] --> B[Select Portal & Criteria]
    B --> C[Create Scraping Job Record]
    C --> D[Queue Job in BullMQ]
    D --> E[Worker Picks Up Job]
    E --> F[Launch Playwright Browser]
    F --> G[Navigate to Portal]
    G --> H{Login Required?}
    H -->|Yes| I[Restore Session from DB]
    H -->|No| J[Start Scraping]
    I --> J
    J --> K[Extract Property Data]
    K --> L[Parse & Validate]
    L --> M[Check for Duplicates]
    M --> N[Save to Database]
    N --> O{More Pages?}
    O -->|Yes| J
    O -->|No| P[Mark Job Complete]
    P --> Q[Send WebSocket Update]
```

### 5. Google Calendar Sync Flow

```mermaid
graph TD
    A[Agent Creates Activity] --> B[Save Activity to DB]
    B --> C{Google Sync Enabled?}
    C -->|Yes| D[Call Google Calendar API]
    C -->|No| E[End]
    D --> F[Create Calendar Event]
    F --> G[Store googleEventId]
    G --> H[Schedule Sync Worker]
    H --> I[Periodic Sync Check]
    I --> J{Event Updated in Google?}
    J -->|Yes| K[Update Activity in DB]
    J -->|No| L[No Action]
    K --> E
    L --> E
```

### 6. Email Integration Flow

```mermaid
graph TD
    A[Gmail Webhook Triggered] --> B[Fetch New Emails]
    B --> C[Parse Email Content]
    C --> D[AI Analysis]
    D --> E{Extract Data}
    E -->|Property Reference| F[Link to Property]
    E -->|Contact Info| G[Match or Create Contact]
    E -->|Appointment Request| H[Create Activity]
    F --> I[Save MessageLog]
    G --> I
    H --> I
    I --> J[Update Contact Last Email Date]
    J --> K[Create Activity Record]
```

## Technical Flows

### 1. Authentication Flow (Future)

```mermaid
sequenceDiagram
    User->>Frontend: Login with Google
    Frontend->>Google: OAuth Request
    Google->>Frontend: Authorization Code
    Frontend->>Backend: Exchange Code
    Backend->>Google: Validate Token
    Google->>Backend: User Info
    Backend->>Database: Find/Create User
    Backend->>Frontend: JWT Token
    Frontend->>Frontend: Store in Cookie
    Frontend->>Backend: API Requests (with JWT)
    Backend->>Backend: Validate JWT
    Backend->>Frontend: Protected Data
```

### 2. Real-time Updates Flow

```mermaid
sequenceDiagram
    Frontend->>Backend: WebSocket Connect
    Backend->>Frontend: Connection Established
    User->>Backend: Create Property
    Backend->>Database: Insert Property
    Database->>Backend: Success
    Backend->>Frontend: WebSocket Event (property.created)
    Frontend->>Frontend: Update UI
    Frontend->>User: Show Notification
```

### 3. File Upload Flow

```mermaid
sequenceDiagram
    User->>Frontend: Select Photos
    Frontend->>Frontend: Validate (size, format)
    Frontend->>Backend: Upload Request
    Backend->>Backend: Generate Unique Filename
    Backend->>MinIO: Upload to Bucket
    MinIO->>Backend: File URL
    Backend->>Database: Save URL in Property
    Database->>Backend: Success
    Backend->>Frontend: Upload Complete
    Frontend->>User: Display Thumbnail
```

## Background Job Flows

### 1. Urgency Calculation Job

```
Trigger: Daily cron job (midnight)
↓
Fetch all active properties
↓
For each property:
  Calculate days on market
  Check last activity date
  Check property status
  Calculate urgency score (0-5)
  Update property.urgencyScore
↓
Update building.avgUrgency (aggregated)
↓
Send notification for urgent properties (score >= 4)
```

### 2. Calendar Sync Job

```
Trigger: Every 5 minutes
↓
Fetch IntegrationAuth records (provider=google_calendar)
↓
For each active integration:
  Fetch lastSyncToken
  Call Google Calendar API (incremental sync)
  Process new/updated/deleted events
  Create/Update/Delete Activity records
  Update lastSyncToken
  Update lastSyncAt
↓
Handle errors (retry with backoff)
```

### 3. Email Processing Job

```
Trigger: On new email received (webhook)
↓
Create MessageProcessing record (status=pending)
↓
Worker picks up job
↓
Parse email content (body, attachments, metadata)
↓
AI Analysis:
  Extract entities (contact, property, dates)
  Classify email category
  Determine sentiment
  Extract priority
↓
Match to existing Contact (or create)
↓
Create Activity if needed
↓
Update MessageLog with AI analysis
↓
Mark MessageProcessing as completed
```

## Error Handling Flows

### Retry Strategy

```
Job fails
↓
Check attempts < maxAttempts
↓
Calculate backoff delay (exponential)
  - Attempt 1: 2 seconds
  - Attempt 2: 4 seconds
  - Attempt 3: 8 seconds
↓
Update nextRetryAt
↓
Worker picks up job again
↓
If still fails after maxAttempts:
  Mark as failed
  Log error
  Send admin notification
```
