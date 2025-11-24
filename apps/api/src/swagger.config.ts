/**
 * Swagger/OpenAPI Configuration
 *
 * Configuration for API documentation.
 */

import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('CRM Immobiliare API')
  .setDescription(
    `
    # CRM Immobiliare - AI-Powered Real Estate CRM API

    Complete REST API for real estate agents with AI-powered matching and integrations.

    ## Features

    ### Core Modules
    - **Auth**: JWT + Google OAuth authentication
    - **Properties**: Property CRUD with filtering and search
    - **Clients**: Client management and profiling
    - **Matching**: AI-powered property-client matching with 7-component scoring

    ### Integrations
    - **Scraping**: Web scraping from 3 portals (Immobiliare.it, Casa.it, Idealista.it)
    - **Gmail**: OAuth + AI email parsing
    - **WhatsApp**: Business API integration
    - **Calendar**: Google Calendar sync for viewings

    ### Nice-to-Have
    - **Analytics**: Dashboards, KPIs, and reports
    - **Tasks**: Activity tracking with reminders

    ## Authentication

    Most endpoints require JWT authentication. Include the token in the Authorization header:

    \`\`\`
    Authorization: Bearer YOUR_JWT_TOKEN
    \`\`\`

    ## Rate Limiting

    - 100 requests per minute for authenticated users
    - 20 requests per minute for unauthenticated users

    ## Error Handling

    All errors follow this format:

    \`\`\`json
    {
      "statusCode": 400,
      "message": "Error message here",
      "error": "Bad Request"
    }
    \`\`\`

    ## WebSocket Events

    Real-time updates are available via WebSocket at \`/crm\` namespace.

    Subscribe to events:
    - \`property:created\`
    - \`match:notification\`
    - \`task:reminder\`
    - \`scraping:progress\`
    - \`analytics:updated\`

    ## Support

    For issues and questions:
    - GitHub: https://github.com/cookkie03/cookkie-real-estate-agent
    - Documentation: /docs/README.md
  `,
  )
  .setVersion('4.0.0')
  .setContact(
    'Development Team',
    'https://github.com/cookkie03/cookkie-real-estate-agent',
    'support@crm-immobiliare.com',
  )
  .setLicense(
    'MIT',
    'https://github.com/cookkie03/cookkie-real-estate-agent/blob/main/LICENSE',
  )
  .addServer('http://localhost:3001', 'Development Server')
  .addServer('https://api.crm-immobiliare.com', 'Production Server')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    },
    'JWT-auth',
  )
  .addOAuth2(
    {
      type: 'oauth2',
      flows: {
        authorizationCode: {
          authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token',
          scopes: {
            'openid': 'OpenID Connect',
            'profile': 'User profile',
            'email': 'User email',
          },
        },
      },
    },
    'Google-OAuth',
  )
  .addTag('auth', 'Authentication endpoints (JWT + Google OAuth)')
  .addTag('properties', 'Property management CRUD operations')
  .addTag('clients', 'Client management and profiling')
  .addTag('matching', 'AI-powered property-client matching')
  .addTag('scraping', 'Web scraping from real estate portals')
  .addTag('gmail', 'Gmail integration (OAuth + AI parsing)')
  .addTag('whatsapp', 'WhatsApp Business API integration')
  .addTag('calendar', 'Google Calendar sync for viewings')
  .addTag('analytics', 'Analytics dashboards, KPIs, and reports')
  .addTag('tasks', 'Task management and activity tracking')
  .build();

/**
 * Swagger options
 */
export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai',
    },
  },
  customSiteTitle: 'CRM Immobiliare API Docs',
  customfavIcon: '/favicon.ico',
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #2563eb }
  `,
};
