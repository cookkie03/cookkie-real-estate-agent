# Piano di Integrazione Google Calendar, Gmail e WhatsApp

## 📋 Panoramica

Questo documento descrive il piano dettagliato per l'integrazione di:
- **Google Calendar**: sincronizzazione appuntamenti e attività
- **Gmail**: invio/ricezione email e archiviazione messaggi
- **WhatsApp**: invio/ricezione messaggi tramite WhatsApp Business API

### Obiettivi del Sistema

1. **Lettura Automatica**: Il sistema legge automaticamente email, eventi calendario e messaggi WhatsApp
2. **Smistamento Intelligente**: Un agente AI analizza i contenuti e li categorizza
3. **Salvataggio Database**: Tutte le informazioni vengono salvate nel CRM
4. **Tracciamento Appuntamenti**: Verifica automatica degli appuntamenti già presi
5. **Estrazione Dati**: Estrae informazioni rilevanti (contatti, proprietà, richieste) dai messaggi

---

## 🏗️ Architettura Proposta

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVIZI ESTERNI                          │
│  ┌───────────┐    ┌────────────┐    ┌──────────────┐       │
│  │  Google   │    │   Gmail    │    │  WhatsApp    │       │
│  │ Calendar  │    │   API      │    │ Business API │       │
│  │   API     │    │            │    │  (Twilio)    │       │
│  └─────┬─────┘    └─────┬──────┘    └──────┬───────┘       │
│        │                │                  │                │
│        │ OAuth2         │ OAuth2           │ API Key        │
└────────┼────────────────┼──────────────────┼────────────────┘
         │                │                  │
         ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│               NEXT.JS API ROUTES (Middleware)                │
│  /api/integrations/                                          │
│    ├── google-calendar/                                      │
│    │   ├── auth (OAuth flow)                                 │
│    │   ├── sync (sincronizzazione eventi)                    │
│    │   ├── create (crea evento)                              │
│    │   └── update (aggiorna evento)                          │
│    ├── gmail/                                                │
│    │   ├── auth (OAuth flow)                                 │
│    │   ├── fetch (scarica email)                             │
│    │   ├── send (invia email)                                │
│    │   └── webhook (notifiche push)                          │
│    └── whatsapp/                                             │
│        ├── send (invia messaggio)                            │
│        └── webhook (messaggi in arrivo)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  AGENTE DI SMISTAMENTO                       │
│                    (Python AI Backend)                       │
│                                                              │
│  Funzioni:                                                   │
│  1. Analizza contenuto messaggi/email/eventi                │
│  2. Identifica entità (contatti, proprietà, appuntamenti)   │
│  3. Categorizza tipo di messaggio                           │
│  4. Estrae informazioni strutturate                          │
│  5. Determina azioni da intraprendere                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                     │
│                                                              │
│  Nuove Tabelle:                                              │
│  ├── IntegrationAuth (credenziali OAuth)                    │
│  ├── MessageLog (log di tutti i messaggi)                   │
│  ├── CalendarSync (stato sincronizzazione)                  │
│  └── MessageProcessing (coda elaborazione)                  │
│                                                              │
│  Tabelle Esistenti Aggiornate:                               │
│  ├── Activity (link a eventi Google Calendar)               │
│  └── Contact (link a thread email/WhatsApp)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Sprint 1: Modifiche al Database

### 1.1 Nuovo Modello: IntegrationAuth

Gestisce le credenziali OAuth2 per i servizi esterni.

```prisma
// database/prisma/schema.prisma

model IntegrationAuth {
  id       String @id @default(cuid())

  // Provider info
  provider String  // "google_calendar", "gmail", "whatsapp"
  isActive Boolean @default(true)

  // OAuth2 tokens
  accessToken  String   @db.Text
  refreshToken String?  @db.Text
  tokenType    String?  @default("Bearer")
  expiresAt    DateTime?

  // Scopes
  scope String?  // Requested scopes

  // Account info
  email         String? // Email dell'account Google
  accountId     String? // ID account esterno
  accountName   String? // Nome visualizzato

  // Sync settings
  syncEnabled   Boolean  @default(true)
  syncInterval  Int      @default(300) // secondi
  lastSyncAt    DateTime?
  nextSyncAt    DateTime?

  // Error handling
  lastError     String?
  errorCount    Int      @default(0)
  lastErrorAt   DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, email])
  @@index([provider, isActive])
  @@index([nextSyncAt])
  @@map("integration_auth")
}
```

### 1.2 Nuovo Modello: MessageLog

Registra tutti i messaggi email e WhatsApp.

```prisma
model MessageLog {
  id String @id @default(cuid())

  // Provider info
  provider   String   // "gmail", "whatsapp"
  messageId  String   // ID esterno del messaggio
  threadId   String?  // ID thread/conversazione

  // Contact relation
  contactId String?
  contact   Contact? @relation(fields: [contactId], references: [id], onDelete: SetNull)

  // Direction
  direction String   // "inbound", "outbound"
  status    String   @default("received") // received, sent, failed, delivered, read

  // Content
  subject     String?     @db.Text
  body        String      @db.Text
  bodyHtml    String?     @db.Text
  snippet     String?     // Preview del contenuto (primi 200 caratteri)

  // Metadata
  fromEmail   String?
  fromPhone   String?
  fromName    String?
  toEmail     String?
  toPhone     String?
  toName      String?
  cc          Json?       // Array di email in CC
  bcc         Json?       // Array di email in BCC

  // Attachments
  hasAttachments  Boolean @default(false)
  attachments     Json?   // Array di: { name, mimeType, size, url }

  // Timing
  sentAt      DateTime
  receivedAt  DateTime?
  readAt      DateTime?

  // Processing
  isProcessed      Boolean   @default(false)
  processedAt      DateTime?
  processingError  String?

  // AI Analysis
  aiCategory      String?   // "property_inquiry", "appointment_request", "general", etc.
  aiSentiment     String?   // "positive", "neutral", "negative"
  aiPriority      String?   // "low", "normal", "high", "urgent"
  aiExtractedData Json?     // Dati estratti dall'AI
  aiSummary       String?   @db.Text

  // Relations created
  activityCreated  Boolean @default(false)
  activityId       String?
  propertyMentioned String? // ID proprietà menzionata
  requestMentioned  String? // ID richiesta menzionata

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([provider, messageId])
  @@index([contactId])
  @@index([provider, direction])
  @@index([sentAt])
  @@index([isProcessed])
  @@index([aiCategory])
  @@index([aiPriority])
  @@index([threadId])
  @@map("message_logs")
}
```

### 1.3 Nuovo Modello: CalendarSync

Traccia lo stato di sincronizzazione con Google Calendar.

```prisma
model CalendarSync {
  id String @id @default(cuid())

  // Calendar info
  calendarId   String  // ID calendario Google
  calendarName String?
  isPrimary    Boolean @default(false)

  // Sync settings
  isActive       Boolean @default(true)
  syncDirection  String  @default("bidirectional") // "pull", "push", "bidirectional"

  // Sync state
  lastSyncToken String?  // Token per sync incrementale
  lastSyncAt    DateTime?
  nextSyncAt    DateTime?

  // Statistics
  eventsSynced  Int @default(0)
  eventsCreated Int @default(0)
  eventsUpdated Int @default(0)
  eventsDeleted Int @default(0)

  // Error handling
  lastError   String?
  errorCount  Int      @default(0)
  lastErrorAt DateTime?

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([calendarId])
  @@index([isActive])
  @@index([nextSyncAt])
  @@map("calendar_sync")
}
```

### 1.4 Nuovo Modello: MessageProcessing

Coda per l'elaborazione asincrona dei messaggi.

```prisma
model MessageProcessing {
  id String @id @default(cuid())

  // Reference
  messageLogId String

  // Processing state
  status   String @default("pending") // pending, processing, completed, failed
  priority Int    @default(0) // 0=normal, 1=high, 2=urgent

  // Retry logic
  attempts      Int      @default(0)
  maxAttempts   Int      @default(3)
  lastAttemptAt DateTime?
  nextRetryAt   DateTime?

  // Processing details
  processorType String? // "message_analyzer", "contact_matcher", "appointment_extractor"
  result        Json?
  error         String?

  // Timestamps
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?
  updatedAt   DateTime @updatedAt

  @@index([status, priority])
  @@index([nextRetryAt])
  @@index([messageLogId])
  @@map("message_processing")
}
```

### 1.5 Modifiche ai Modelli Esistenti

#### Activity
Aggiungere campi per collegamento con Google Calendar:

```prisma
model Activity {
  // ... campi esistenti ...

  // Google Calendar Integration
  googleEventId    String? // ID evento su Google Calendar
  googleCalendarId String? // ID calendario Google
  googleEventUrl   String? // Link all'evento
  syncedToGoogle   Boolean @default(false)
  lastSyncedAt     DateTime?

  // ... resto del modello ...

  @@index([googleEventId])
}
```

#### Contact
Aggiungere campi per tracking comunicazioni:

```prisma
model Contact {
  // ... campi esistenti ...

  // Communication tracking
  lastEmailDate     DateTime?
  lastWhatsAppDate  DateTime?
  emailThreadId     String? // ID thread Gmail principale
  whatsappThreadId  String? // ID chat WhatsApp

  // Message logs relation
  messages MessageLog[]

  // ... resto del modello ...

  @@index([lastEmailDate])
  @@index([lastWhatsAppDate])
}
```

---

## 🔐 Sprint 2: Autenticazione Google OAuth2

### 2.1 Configurazione Credenziali Google

**File**: `.env`

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback

# Google Calendar API
GOOGLE_CALENDAR_SCOPES=https://www.googleapis.com/auth/calendar,https://www.googleapis.com/auth/calendar.events

# Gmail API
GMAIL_SCOPES=https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/gmail.modify
```

### 2.2 Installare Dipendenze

```bash
# Frontend (Next.js)
cd frontend
npm install googleapis @google-cloud/local-auth google-auth-library
```

### 2.3 Endpoint OAuth Flow - Avvio Autenticazione

**File**: `frontend/src/app/api/integrations/google/auth/route.ts`

```typescript
/**
 * Google OAuth2 - Start Authentication Flow
 * GET /api/integrations/google/auth?service=calendar|gmail
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service'); // "calendar" or "gmail"

    if (!service || !['calendar', 'gmail'].includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service. Must be "calendar" or "gmail"' },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Determine scopes based on service
    const scopes = service === 'calendar'
      ? process.env.GOOGLE_CALENDAR_SCOPES?.split(',')
      : process.env.GMAIL_SCOPES?.split(',');

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: service, // Pass service type via state parameter
      prompt: 'consent', // Force consent to get refresh token
    });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
```

### 2.4 Endpoint OAuth Callback

**File**: `frontend/src/app/api/integrations/google/callback/route.ts`

```typescript
/**
 * Google OAuth2 - Callback Handler
 * GET /api/integrations/google/callback?code=...&state=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // "calendar" or "gmail"

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=missing_code', request.url)
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Calculate token expiration
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Save to database
    const provider = state === 'calendar' ? 'google_calendar' : 'gmail';

    await prisma.integrationAuth.upsert({
      where: {
        provider_email: {
          provider,
          email: userInfo.email || '',
        },
      },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        scope: tokens.scope,
        isActive: true,
        lastError: null,
        errorCount: 0,
        accountId: userInfo.id,
        accountName: userInfo.name || undefined,
        updatedAt: new Date(),
      },
      create: {
        provider,
        email: userInfo.email || '',
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || undefined,
        expiresAt,
        scope: tokens.scope,
        isActive: true,
        accountId: userInfo.id,
        accountName: userInfo.name || undefined,
      },
    });

    // Redirect to settings with success message
    return NextResponse.redirect(
      new URL(`/settings/integrations?success=${provider}_connected`, request.url)
    );
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL('/settings/integrations?error=auth_failed', request.url)
    );
  }
}
```

### 2.5 Utility: Refresh Token

**File**: `frontend/src/lib/google-auth.ts`

```typescript
import { google } from 'googleapis';
import { prisma } from './db';

export async function getGoogleAuthClient(provider: 'google_calendar' | 'gmail') {
  const auth = await prisma.integrationAuth.findFirst({
    where: { provider, isActive: true },
  });

  if (!auth) {
    throw new Error(`No active ${provider} integration found`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken || undefined,
    expiry_date: auth.expiresAt?.getTime(),
  });

  // Auto-refresh token
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.integrationAuth.update({
        where: { id: auth.id },
        data: {
          accessToken: tokens.access_token || auth.accessToken,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
      });
    } else {
      await prisma.integrationAuth.update({
        where: { id: auth.id },
        data: {
          accessToken: tokens.access_token || auth.accessToken,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
        },
      });
    }
  });

  return oauth2Client;
}
```

---

## 📅 Sprint 3: Integrazione Google Calendar

### 3.1 Sincronizzazione Eventi (Pull da Google)

**File**: `frontend/src/app/api/integrations/google-calendar/sync/route.ts`

```typescript
/**
 * Google Calendar Sync - Pull events from Google
 * POST /api/integrations/google-calendar/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getGoogleAuthClient('google_calendar');
    const calendar = google.calendar({ version: 'v3', auth });

    // Get primary calendar ID
    const { data: calendarList } = await calendar.calendarList.list();
    const primaryCalendar = calendarList.items?.find(cal => cal.primary);

    if (!primaryCalendar?.id) {
      return NextResponse.json(
        { error: 'No primary calendar found' },
        { status: 404 }
      );
    }

    // Get sync state
    let syncState = await prisma.calendarSync.findUnique({
      where: { calendarId: primaryCalendar.id },
    });

    // Fetch events (incremental if we have a syncToken)
    const params: any = {
      calendarId: primaryCalendar.id,
      timeMin: new Date().toISOString(), // Events from now onwards
      maxResults: 100,
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (syncState?.lastSyncToken) {
      params.syncToken = syncState.lastSyncToken;
      delete params.timeMin;
    }

    const { data: eventsData } = await calendar.events.list(params);
    const events = eventsData.items || [];

    let created = 0;
    let updated = 0;

    // Process each event
    for (const event of events) {
      if (!event.id || event.status === 'cancelled') continue;

      // Check if activity exists
      const existingActivity = await prisma.activity.findFirst({
        where: { googleEventId: event.id },
      });

      const activityData = {
        title: event.summary || 'Evento senza titolo',
        description: event.description || undefined,
        activityType: 'meeting',
        status: event.status === 'confirmed' ? 'scheduled' : 'cancelled',
        scheduledAt: event.start?.dateTime
          ? new Date(event.start.dateTime)
          : event.start?.date
          ? new Date(event.start.date)
          : undefined,
        duration: calculateDuration(event.start, event.end),
        locationAddress: event.location || undefined,
        googleEventId: event.id,
        googleCalendarId: primaryCalendar.id,
        googleEventUrl: event.htmlLink || undefined,
        syncedToGoogle: true,
        lastSyncedAt: new Date(),
      };

      if (existingActivity) {
        await prisma.activity.update({
          where: { id: existingActivity.id },
          data: activityData,
        });
        updated++;
      } else {
        await prisma.activity.create({
          data: activityData as any,
        });
        created++;
      }
    }

    // Update sync state
    await prisma.calendarSync.upsert({
      where: { calendarId: primaryCalendar.id },
      update: {
        lastSyncToken: eventsData.nextSyncToken || undefined,
        lastSyncAt: new Date(),
        nextSyncAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        eventsSynced: (syncState?.eventsSynced || 0) + events.length,
        eventsCreated: (syncState?.eventsCreated || 0) + created,
        eventsUpdated: (syncState?.eventsUpdated || 0) + updated,
        lastError: null,
        errorCount: 0,
      },
      create: {
        calendarId: primaryCalendar.id,
        calendarName: primaryCalendar.summary || 'Primary Calendar',
        isPrimary: true,
        lastSyncToken: eventsData.nextSyncToken || undefined,
        lastSyncAt: new Date(),
        nextSyncAt: new Date(Date.now() + 5 * 60 * 1000),
        eventsSynced: events.length,
        eventsCreated: created,
        eventsUpdated: updated,
      },
    });

    return NextResponse.json({
      success: true,
      eventsProcessed: events.length,
      created,
      updated,
    });
  } catch (error: any) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    );
  }
}

function calculateDuration(start: any, end: any): number | undefined {
  if (!start?.dateTime || !end?.dateTime) return undefined;
  const startTime = new Date(start.dateTime).getTime();
  const endTime = new Date(end.dateTime).getTime();
  return Math.round((endTime - startTime) / 60000); // minutes
}
```

### 3.2 Creazione Evento su Google Calendar

**File**: `frontend/src/app/api/integrations/google-calendar/create/route.ts`

```typescript
/**
 * Create Google Calendar Event
 * POST /api/integrations/google-calendar/create
 * Body: { activityId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const { activityId } = await request.json();

    if (!activityId) {
      return NextResponse.json(
        { error: 'activityId is required' },
        { status: 400 }
      );
    }

    // Get activity
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: {
        contact: true,
        property: true,
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity not found' },
        { status: 404 }
      );
    }

    // Check if already synced
    if (activity.googleEventId) {
      return NextResponse.json({
        success: true,
        eventId: activity.googleEventId,
        message: 'Event already exists on Google Calendar',
      });
    }

    const auth = await getGoogleAuthClient('google_calendar');
    const calendar = google.calendar({ version: 'v3', auth });

    // Get primary calendar
    const { data: calendarList } = await calendar.calendarList.list();
    const primaryCalendar = calendarList.items?.find(cal => cal.primary);

    if (!primaryCalendar?.id) {
      return NextResponse.json(
        { error: 'No primary calendar found' },
        { status: 404 }
      );
    }

    // Build event
    const startTime = activity.scheduledAt || new Date();
    const endTime = new Date(
      startTime.getTime() + (activity.duration || 60) * 60000
    );

    const event = {
      summary: activity.title,
      description: buildEventDescription(activity),
      location: activity.locationAddress || undefined,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/Rome',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Rome',
      },
      attendees: activity.contact?.primaryEmail
        ? [{ email: activity.contact.primaryEmail }]
        : undefined,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    // Create event
    const { data: createdEvent } = await calendar.events.insert({
      calendarId: primaryCalendar.id,
      requestBody: event,
    });

    // Update activity
    await prisma.activity.update({
      where: { id: activityId },
      data: {
        googleEventId: createdEvent.id,
        googleCalendarId: primaryCalendar.id,
        googleEventUrl: createdEvent.htmlLink || undefined,
        syncedToGoogle: true,
        lastSyncedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      eventId: createdEvent.id,
      eventUrl: createdEvent.htmlLink,
    });
  } catch (error: any) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

function buildEventDescription(activity: any): string {
  let description = activity.description || '';

  if (activity.contact) {
    description += `\n\n📞 Contatto: ${activity.contact.fullName}`;
    if (activity.contact.primaryPhone) {
      description += `\nTel: ${activity.contact.primaryPhone}`;
    }
    if (activity.contact.primaryEmail) {
      description += `\nEmail: ${activity.contact.primaryEmail}`;
    }
  }

  if (activity.property) {
    description += `\n\n🏠 Immobile: ${activity.property.code}`;
    description += `\n${activity.property.street}, ${activity.property.city}`;
  }

  return description;
}
```

---

## 📧 Sprint 4: Integrazione Gmail

### 4.1 Fetch Email (Lettura Inbox)

**File**: `frontend/src/app/api/integrations/gmail/fetch/route.ts`

```typescript
/**
 * Gmail - Fetch new emails
 * POST /api/integrations/gmail/fetch
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await getGoogleAuthClient('gmail');
    const gmail = google.gmail({ version: 'v1', auth });

    // Get auth record for last fetch timestamp
    const authRecord = await prisma.integrationAuth.findFirst({
      where: { provider: 'gmail', isActive: true },
    });

    // Calculate query date (fetch emails from last 7 days or last sync)
    const after = authRecord?.lastSyncAt
      ? Math.floor(authRecord.lastSyncAt.getTime() / 1000)
      : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);

    // Fetch unread messages
    const { data: listData } = await gmail.users.messages.list({
      userId: 'me',
      q: `is:unread after:${after}`,
      maxResults: 50,
    });

    const messages = listData.messages || [];
    let processed = 0;

    for (const message of messages) {
      if (!message.id) continue;

      // Check if already processed
      const existing = await prisma.messageLog.findUnique({
        where: {
          provider_messageId: {
            provider: 'gmail',
            messageId: message.id,
          },
        },
      });

      if (existing) continue;

      // Fetch full message details
      const { data: fullMessage } = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      // Parse headers
      const headers = fullMessage.payload?.headers || [];
      const from = headers.find(h => h.name === 'From')?.value || '';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value;

      // Extract body
      const body = extractBody(fullMessage.payload);
      const snippet = fullMessage.snippet || '';

      // Try to match contact by email
      const fromEmail = extractEmail(from);
      const contact = fromEmail
        ? await prisma.contact.findFirst({
            where: {
              OR: [
                { primaryEmail: { contains: fromEmail, mode: 'insensitive' } },
                { secondaryEmail: { contains: fromEmail, mode: 'insensitive' } },
              ],
            },
          })
        : null;

      // Create message log
      await prisma.messageLog.create({
        data: {
          provider: 'gmail',
          messageId: message.id,
          threadId: message.threadId,
          contactId: contact?.id,
          direction: 'inbound',
          status: 'received',
          subject,
          body,
          snippet,
          fromEmail,
          fromName: extractName(from),
          toEmail: extractEmail(to),
          sentAt: date ? new Date(date) : new Date(),
          receivedAt: new Date(),
          hasAttachments: hasAttachments(fullMessage.payload),
        },
      });

      processed++;
    }

    // Update last sync
    if (authRecord) {
      await prisma.integrationAuth.update({
        where: { id: authRecord.id },
        data: {
          lastSyncAt: new Date(),
          nextSyncAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
        },
      });
    }

    return NextResponse.json({
      success: true,
      messagesFound: messages.length,
      messagesProcessed: processed,
    });
  } catch (error: any) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Fetch failed' },
      { status: 500 }
    );
  }
}

function extractBody(payload: any): string {
  if (!payload) return '';

  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
    // Fallback to HTML
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }
  }

  return '';
}

function extractEmail(str: string): string {
  const match = str.match(/<(.+?)>/);
  return match ? match[1] : str;
}

function extractName(str: string): string {
  const match = str.match(/^(.+?)\s*</);
  return match ? match[1].replace(/"/g, '').trim() : '';
}

function hasAttachments(payload: any): boolean {
  if (!payload?.parts) return false;
  return payload.parts.some((part: any) =>
    part.filename && part.body?.attachmentId
  );
}
```

### 4.2 Invio Email

**File**: `frontend/src/app/api/integrations/gmail/send/route.ts`

```typescript
/**
 * Gmail - Send email
 * POST /api/integrations/gmail/send
 * Body: { to: string, subject: string, body: string, contactId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';
import { getGoogleAuthClient } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, contactId } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'to, subject, and body are required' },
        { status: 400 }
      );
    }

    const auth = await getGoogleAuthClient('gmail');
    const gmail = google.gmail({ version: 'v1', auth });

    // Build email message
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const { data: sentMessage } = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    // Log message
    await prisma.messageLog.create({
      data: {
        provider: 'gmail',
        messageId: sentMessage.id || '',
        threadId: sentMessage.threadId,
        contactId: contactId || undefined,
        direction: 'outbound',
        status: 'sent',
        subject,
        body,
        snippet: body.substring(0, 200),
        toEmail: to,
        sentAt: new Date(),
      },
    });

    // Update contact
    if (contactId) {
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          lastContactDate: new Date(),
          lastEmailDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: sentMessage.id,
      threadId: sentMessage.threadId,
    });
  } catch (error: any) {
    console.error('Gmail send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
```

---

## 💬 Sprint 5: Integrazione WhatsApp (Twilio)

### 5.1 Configurazione Twilio

**File**: `.env`

```bash
# Twilio WhatsApp
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886  # Twilio sandbox or your number
TWILIO_WEBHOOK_URL=https://yourdomain.com/api/integrations/whatsapp/webhook
```

### 5.2 Installare SDK

```bash
cd frontend
npm install twilio
```

### 5.3 Invio Messaggio WhatsApp

**File**: `frontend/src/app/api/integrations/whatsapp/send/route.ts`

```typescript
/**
 * WhatsApp - Send message
 * POST /api/integrations/whatsapp/send
 * Body: { to: string, message: string, contactId?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { Twilio } from 'twilio';
import { prisma } from '@/lib/db';

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { to, message, contactId } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'to and message are required' },
        { status: 400 }
      );
    }

    // Ensure phone number has whatsapp: prefix
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`;

    // Send message via Twilio
    const twilioMessage = await client.messages.create({
      from: formattedFrom,
      to: formattedTo,
      body: message,
    });

    // Log message
    await prisma.messageLog.create({
      data: {
        provider: 'whatsapp',
        messageId: twilioMessage.sid,
        contactId: contactId || undefined,
        direction: 'outbound',
        status: twilioMessage.status || 'sent',
        body: message,
        snippet: message.substring(0, 200),
        toPhone: to.replace('whatsapp:', ''),
        sentAt: new Date(),
      },
    });

    // Update contact
    if (contactId) {
      await prisma.contact.update({
        where: { id: contactId },
        data: {
          lastContactDate: new Date(),
          lastWhatsAppDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
      status: twilioMessage.status,
    });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
```

### 5.4 Webhook Messaggi in Arrivo

**File**: `frontend/src/app/api/integrations/whatsapp/webhook/route.ts`

```typescript
/**
 * WhatsApp - Webhook for incoming messages
 * POST /api/integrations/whatsapp/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Parse Twilio webhook payload (form-urlencoded)
    const formData = await request.formData();
    const data: any = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia,
      ProfileName,
    } = data;

    if (!MessageSid || !From || !Body) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Extract phone number
    const fromPhone = From.replace('whatsapp:', '');

    // Try to find contact by phone
    const contact = await prisma.contact.findFirst({
      where: {
        OR: [
          { primaryPhone: { contains: fromPhone } },
          { secondaryPhone: { contains: fromPhone } },
        ],
      },
    });

    // Log incoming message
    const messageLog = await prisma.messageLog.create({
      data: {
        provider: 'whatsapp',
        messageId: MessageSid,
        contactId: contact?.id,
        direction: 'inbound',
        status: 'received',
        body: Body,
        snippet: Body.substring(0, 200),
        fromPhone,
        fromName: ProfileName || undefined,
        toPhone: To.replace('whatsapp:', ''),
        sentAt: new Date(),
        receivedAt: new Date(),
        hasAttachments: parseInt(NumMedia || '0') > 0,
      },
    });

    // Create processing task
    await prisma.messageProcessing.create({
      data: {
        messageLogId: messageLog.id,
        status: 'pending',
        priority: 1, // High priority for incoming messages
        processorType: 'message_analyzer',
      },
    });

    // Update contact if found
    if (contact) {
      await prisma.contact.update({
        where: { id: contact.id },
        data: {
          lastContactDate: new Date(),
          lastWhatsAppDate: new Date(),
        },
      });
    }

    // Respond to Twilio (200 OK to acknowledge receipt)
    return new Response('Message received', { status: 200 });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return new Response('Internal error', { status: 500 });
  }
}

// Handle Twilio webhook validation (GET request)
export async function GET(request: NextRequest) {
  return new Response('WhatsApp webhook endpoint active', { status: 200 });
}
```

---

## 🤖 Sprint 6: Agente di Smistamento (AI Backend)

### 6.1 Tool per Analisi Messaggi

**File**: `ai_tools/app/tools/message_analyzer_tool.py`

```python
"""
Message Analyzer Tool
Analyzes incoming messages and extracts structured data
"""

from datapizza.tools import tool
from app.database import SessionLocal
from database.python.models import MessageLog, Contact, Property, Request, Activity
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

        # Determine category
        category = determine_category(body_lower, message.subject or "")

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

def determine_category(body: str, subject: str) -> str:
    """Determine message category"""
    text = f"{subject} {body}".lower()

    # Property inquiry
    if any(word in text for word in ['immobile', 'appartamento', 'casa', 'villa', 'interessato', 'disponibile', 'prezzo', 'visitare']):
        return "property_inquiry"

    # Appointment request
    if any(word in text for word in ['appuntamento', 'visita', 'vedere', 'incontrare', 'quando', 'disponibilità']):
        return "appointment_request"

    # Document request
    if any(word in text for word in ['documento', 'contratto', 'planimetria', 'ape', 'catastale']):
        return "document_request"

    # Offer/negotiation
    if any(word in text for word in ['offerta', 'proposta', 'trattativa', 'sconto', 'ribasso']):
        return "offer_negotiation"

    # Complaint
    if any(word in text for word in ['problema', 'lamentela', 'reclamo', 'insoddisfatto']):
        return "complaint"

    return "general"

def determine_sentiment(body: str) -> str:
    """Determine sentiment"""
    positive_words = ['grazie', 'ottimo', 'perfetto', 'interessante', 'bello', 'magnifico']
    negative_words = ['problema', 'male', 'brutto', 'caro', 'delusione', 'pessimo']

    pos_count = sum(1 for word in positive_words if word in body)
    neg_count = sum(1 for word in negative_words if word in body)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    return "neutral"

def determine_priority(body: str, category: str) -> str:
    """Determine priority level"""
    urgent_keywords = ['urgente', 'subito', 'immediatamente', 'oggi', 'domani']

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
    phones = re.findall(r'[\+]?[\d]{2,3}[\s\-]?[\d]{3}[\s\-]?[\d]{3}[\s\-]?[\d]{2,4}', body)
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

    # Extract cities
    italian_cities = ['milano', 'roma', 'torino', 'napoli', 'genova', 'bologna', 'firenze', 'venezia']
    cities = [city for city in italian_cities if city in body.lower()]
    if cities:
        data['cities'] = cities

    # Extract price mentions
    prices = re.findall(r'€\s?[\d.,]+|[\d.,]+\s?euro', body, re.IGNORECASE)
    if prices:
        data['prices'] = prices

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

    # TODO: More sophisticated property matching (address, description, etc.)
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
```

### 6.2 Tool per Creazione Automatica Attività

**File**: `ai_tools/app/tools/create_activity_from_message_tool.py`

```python
"""
Create Activity From Message Tool
Automatically creates activities based on analyzed messages
"""

from datapizza.tools import tool
from app.database import SessionLocal
from database.python.models import Activity, MessageLog
import json
from datetime import datetime

@tool
def create_activity_from_message_tool(
    message_log_id: str,
    activity_type: str = "call",
    title: Optional[str] = None
) -> str:
    """
    Create an Activity based on an analyzed message.

    Args:
        message_log_id: ID of the MessageLog
        activity_type: Type of activity (call, email, meeting, etc.)
        title: Optional custom title

    Returns:
        JSON string with created activity details
    """
    db = SessionLocal()
    try:
        # Get message
        message = db.query(MessageLog).filter(MessageLog.id == message_log_id).first()
        if not message:
            return json.dumps({"error": "Message not found"}, ensure_ascii=False)

        # Build activity data
        if not title:
            title = f"Rispondere a {message.fromName or message.fromEmail or message.fromPhone}"

        description = f"Messaggio ricevuto il {message.sentAt.strftime('%d/%m/%Y %H:%M')}\n\n"
        description += message.body[:500]  # Primi 500 caratteri
        if len(message.body) > 500:
            description += "..."

        # Create activity
        activity = Activity(
            contactId=message.contactId,
            activityType=activity_type,
            status='scheduled',
            priority='high' if message.aiPriority == 'urgent' else 'normal',
            title=title,
            description=description,
            dueDate=datetime.utcnow(),  # Due today
            details={
                'sourceMessageId': message.id,
                'sourceProvider': message.provider,
            }
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
        }, ensure_ascii=False)

    except Exception as e:
        db.rollback()
        return json.dumps({"error": str(e)}, ensure_ascii=False)
    finally:
        db.close()
```

### 6.3 Aggiornare CRM Chatbot

**File**: `ai_tools/app/agents/crm_chatbot.py`

Aggiungere i nuovi tools:

```python
from app.tools.message_analyzer_tool import analyze_message_tool
from app.tools.create_activity_from_message_tool import create_activity_from_message_tool
from app.tools.gmail_tools import send_email_tool, fetch_emails_tool
from app.tools.whatsapp_tools import send_whatsapp_tool
from app.tools.calendar_tools import create_calendar_event_tool, sync_calendar_tool

# Add to agent tools list
tools = [
    # ... existing tools ...
    analyze_message_tool,
    create_activity_from_message_tool,
    send_email_tool,
    fetch_emails_tool,
    send_whatsapp_tool,
    create_calendar_event_tool,
    sync_calendar_tool,
]
```

### 6.4 Worker per Elaborazione Messaggi

**File**: `ai_tools/app/workers/message_processor.py`

```python
"""
Message Processing Worker
Processes messages in the queue asynchronously
"""

import asyncio
import logging
from datetime import datetime, timedelta
from app.database import SessionLocal
from database.python.models import MessageProcessing, MessageLog
from app.tools.message_analyzer_tool import analyze_message_tool
from app.tools.create_activity_from_message_tool import create_activity_from_message_tool

logger = logging.getLogger(__name__)

async def process_message_queue():
    """
    Continuously process messages in the queue
    """
    while True:
        try:
            db = SessionLocal()

            # Find pending messages
            pending = db.query(MessageProcessing).filter(
                MessageProcessing.status == 'pending',
                MessageProcessing.attempts < MessageProcessing.maxAttempts,
            ).order_by(
                MessageProcessing.priority.desc(),
                MessageProcessing.createdAt.asc()
            ).limit(10).all()

            for task in pending:
                try:
                    # Mark as processing
                    task.status = 'processing'
                    task.startedAt = datetime.utcnow()
                    task.attempts += 1
                    task.lastAttemptAt = datetime.utcnow()
                    db.commit()

                    logger.info(f"Processing message {task.messageLogId}")

                    # Analyze message
                    result = analyze_message_tool(task.messageLogId)

                    # Check if activity should be created
                    analysis = json.loads(result)
                    if analysis.get('success'):
                        suggested_actions = analysis['analysis'].get('suggestedActions', [])

                        for action in suggested_actions:
                            if action['type'] == 'create_activity':
                                create_activity_from_message_tool(
                                    message_log_id=task.messageLogId,
                                    activity_type=action.get('activityType', 'call'),
                                    title=action.get('title')
                                )

                    # Mark as completed
                    task.status = 'completed'
                    task.completedAt = datetime.utcnow()
                    task.result = result
                    db.commit()

                    logger.info(f"Successfully processed message {task.messageLogId}")

                except Exception as e:
                    logger.error(f"Error processing message {task.messageLogId}: {str(e)}")

                    # Mark as failed or retry
                    if task.attempts >= task.maxAttempts:
                        task.status = 'failed'
                        task.error = str(e)
                    else:
                        task.status = 'pending'
                        task.nextRetryAt = datetime.utcnow() + timedelta(minutes=5)

                    db.commit()

            db.close()

            # Wait before next iteration
            await asyncio.sleep(30)  # Check every 30 seconds

        except Exception as e:
            logger.error(f"Queue processor error: {str(e)}")
            await asyncio.sleep(60)

if __name__ == "__main__":
    asyncio.run(process_message_queue())
```

---

## 🔄 Sprint 7: Automazione e Scheduling

### 7.1 Cron Job per Sincronizzazione Periodica

**File**: `scripts/sync_integrations.sh`

```bash
#!/bin/bash

# Sync Google Calendar
echo "Syncing Google Calendar..."
curl -X POST http://localhost:3000/api/integrations/google-calendar/sync

# Fetch Gmail
echo "Fetching Gmail..."
curl -X POST http://localhost:3000/api/integrations/gmail/fetch

echo "Sync completed at $(date)"
```

### 7.2 Docker Compose - Aggiungere Worker

**File**: `docker-compose.yml`

```yaml
services:
  # ... existing services ...

  message-processor:
    build:
      context: ./ai_tools
      dockerfile: Dockerfile
    command: python -m app.workers.message_processor
    volumes:
      - ./ai_tools:/app
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/crm
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
    depends_on:
      - db
    restart: unless-stopped
```

### 7.3 Systemd Timer (Alternativa a Cron)

**File**: `/etc/systemd/system/crm-sync.timer`

```ini
[Unit]
Description=CRM Integrations Sync Timer
Requires=crm-sync.service

[Timer]
OnBootSec=5min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
```

**File**: `/etc/systemd/system/crm-sync.service`

```ini
[Unit]
Description=CRM Integrations Sync Service

[Service]
Type=oneshot
ExecStart=/usr/local/bin/crm-sync.sh
User=crm
```

---

## 🧪 Sprint 8: Testing

### 8.1 Test Integrazione Google Calendar

```bash
# Test OAuth flow
curl http://localhost:3000/api/integrations/google/auth?service=calendar

# Test sync
curl -X POST http://localhost:3000/api/integrations/google-calendar/sync

# Test create event
curl -X POST http://localhost:3000/api/integrations/google-calendar/create \
  -H "Content-Type: application/json" \
  -d '{"activityId": "test-activity-id"}'
```

### 8.2 Test Integrazione Gmail

```bash
# Test OAuth flow
curl http://localhost:3000/api/integrations/google/auth?service=gmail

# Test fetch
curl -X POST http://localhost:3000/api/integrations/gmail/fetch

# Test send
curl -X POST http://localhost:3000/api/integrations/gmail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "body": "Test email",
    "contactId": "contact-id"
  }'
```

### 8.3 Test Integrazione WhatsApp

```bash
# Test send
curl -X POST http://localhost:3000/api/integrations/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+393331234567",
    "message": "Ciao, test WhatsApp",
    "contactId": "contact-id"
  }'

# Test webhook (simulate Twilio)
curl -X POST http://localhost:3000/api/integrations/whatsapp/webhook \
  -d "MessageSid=test123" \
  -d "From=whatsapp:+393331234567" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Ciao, sono interessato"
```

---

## 📝 Sprint 9: UI per Gestione Integrazioni

### 9.1 Pagina Impostazioni

**File**: `frontend/src/app/settings/integrations/page.tsx`

```typescript
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function IntegrationsPage() {
  const handleConnectGoogle = async (service: 'calendar' | 'gmail') => {
    const res = await fetch(`/api/integrations/google/auth?service=${service}`);
    const data = await res.json();
    if (data.authUrl) {
      window.location.href = data.authUrl;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Integrazioni</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Google Calendar</h2>
        <p className="text-gray-600 mb-4">
          Sincronizza i tuoi appuntamenti con Google Calendar
        </p>
        <Button onClick={() => handleConnectGoogle('calendar')}>
          Connetti Google Calendar
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Gmail</h2>
        <p className="text-gray-600 mb-4">
          Invia e ricevi email direttamente dal CRM
        </p>
        <Button onClick={() => handleConnectGoogle('gmail')}>
          Connetti Gmail
        </Button>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">WhatsApp</h2>
        <p className="text-gray-600 mb-4">
          Invia messaggi WhatsApp ai tuoi contatti
        </p>
        <Button>
          Configura WhatsApp
        </Button>
      </Card>
    </div>
  );
}
```

---

## 📊 Riepilogo Sprint e Timeline

| Sprint | Descrizione | Durata Stimata | Priorità |
|--------|-------------|----------------|----------|
| **1** | Modifiche Database | 1 giorno | Alta |
| **2** | Autenticazione Google OAuth2 | 2 giorni | Alta |
| **3** | Integrazione Google Calendar | 2 giorni | Alta |
| **4** | Integrazione Gmail | 2 giorni | Alta |
| **5** | Integrazione WhatsApp | 2 giorni | Media |
| **6** | Agente di Smistamento AI | 3 giorni | Alta |
| **7** | Automazione e Scheduling | 1 giorno | Media |
| **8** | Testing | 2 giorni | Alta |
| **9** | UI Gestione Integrazioni | 1 giorno | Bassa |

**Durata Totale Stimata**: 16 giorni lavorativi (circa 3-4 settimane)

---

## ✅ Checklist Implementazione

### Database
- [ ] Aggiungere modello `IntegrationAuth`
- [ ] Aggiungere modello `MessageLog`
- [ ] Aggiungere modello `CalendarSync`
- [ ] Aggiungere modello `MessageProcessing`
- [ ] Modificare modello `Activity` (campi Google Calendar)
- [ ] Modificare modello `Contact` (campi comunicazione)
- [ ] Eseguire migrations: `npx prisma migrate dev`
- [ ] Generare Prisma Client: `npx prisma generate`
- [ ] Aggiornare modelli SQLAlchemy in `database/python/models.py`

### Google OAuth2
- [ ] Creare progetto Google Cloud Console
- [ ] Abilitare Google Calendar API
- [ ] Abilitare Gmail API
- [ ] Creare credenziali OAuth2
- [ ] Configurare `.env` con client ID e secret
- [ ] Implementare endpoint `/api/integrations/google/auth`
- [ ] Implementare endpoint `/api/integrations/google/callback`
- [ ] Implementare utility `getGoogleAuthClient()`

### Google Calendar
- [ ] Implementare endpoint `/api/integrations/google-calendar/sync`
- [ ] Implementare endpoint `/api/integrations/google-calendar/create`
- [ ] Implementare endpoint `/api/integrations/google-calendar/update`
- [ ] Creare Python tool `create_calendar_event_tool`
- [ ] Creare Python tool `sync_calendar_tool`
- [ ] Testare sincronizzazione bidirezionale

### Gmail
- [ ] Implementare endpoint `/api/integrations/gmail/fetch`
- [ ] Implementare endpoint `/api/integrations/gmail/send`
- [ ] Implementare webhook Gmail (Gmail Push Notifications)
- [ ] Creare Python tool `send_email_tool`
- [ ] Creare Python tool `fetch_emails_tool`
- [ ] Testare invio e ricezione email

### WhatsApp
- [ ] Registrare account Twilio
- [ ] Configurare WhatsApp Business API
- [ ] Configurare webhook URL
- [ ] Implementare endpoint `/api/integrations/whatsapp/send`
- [ ] Implementare endpoint `/api/integrations/whatsapp/webhook`
- [ ] Creare Python tool `send_whatsapp_tool`
- [ ] Testare invio e ricezione messaggi

### Agente AI
- [ ] Creare tool `analyze_message_tool`
- [ ] Creare tool `create_activity_from_message_tool`
- [ ] Aggiornare CRM Chatbot con nuovi tools
- [ ] Implementare worker `message_processor.py`
- [ ] Testare analisi automatica messaggi
- [ ] Testare creazione automatica attività

### Automazione
- [ ] Creare script `sync_integrations.sh`
- [ ] Configurare cron job per sincronizzazione periodica
- [ ] Aggiungere service Docker per message processor
- [ ] Testare sincronizzazione automatica
- [ ] Monitorare errori e retry logic

### UI
- [ ] Creare pagina `/settings/integrations`
- [ ] Aggiungere pulsanti connessione servizi
- [ ] Mostrare stato connessioni
- [ ] Mostrare log messaggi
- [ ] Aggiungere filtri e ricerca messaggi

### Testing
- [ ] Test unitari per ogni endpoint
- [ ] Test integrazione OAuth flow completo
- [ ] Test sincronizzazione Google Calendar
- [ ] Test invio/ricezione Gmail
- [ ] Test invio/ricezione WhatsApp
- [ ] Test analisi messaggi AI
- [ ] Test worker asincrono
- [ ] Test load (100+ messaggi)

### Deployment
- [ ] Configurare variabili ambiente produzione
- [ ] Configurare webhook URLs pubblici
- [ ] Deploy backend e frontend
- [ ] Configurare SSL per webhook
- [ ] Verificare permissions OAuth
- [ ] Monitoraggio e logging

---

## 🔒 Considerazioni Sicurezza

1. **Crittografia Token**
   - Usare libreria di encryption per `accessToken` e `refreshToken`
   - Non loggare mai token in chiaro

2. **Webhook Validation**
   - Validare signature Twilio per webhook WhatsApp
   - Verificare origine richieste Gmail webhook

3. **Rate Limiting**
   - Implementare rate limiting per API calls
   - Rispettare limiti Google API (quota)

4. **GDPR Compliance**
   - Salvare solo messaggi necessari
   - Implementare cancellazione messaggi dopo X giorni
   - Rispettare privacy contatti

5. **Error Handling**
   - Non esporre dettagli errori in produzione
   - Loggare errori sensibili solo server-side

---

## 📚 Risorse

- [Google Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)
- [Gmail API Docs](https://developers.google.com/gmail/api/guides)
- [Twilio WhatsApp API Docs](https://www.twilio.com/docs/whatsapp)
- [Prisma Docs](https://www.prisma.io/docs)
- [DataPizza AI Docs](https://datapizza.tech/docs)

---

**Piano creato il**: 2025-11-10
**Autore**: Claude (AI Assistant)
**Versione**: 1.0
