# @crm-immobiliare/ai-toolkit

AI agents and tools for CRM Immobiliare - TypeScript/Gemini-powered intelligent automation.

## Features

- **🤖 Intelligent Agents**: Specialized AI agents for CRM operations
- **🔧 Extensible Tools**: Modular tools for property search, client management, message analysis
- **🎯 Type-Safe**: Full TypeScript support with Zod schemas
- **🚀 Easy Integration**: Simple API for embedding AI into your application
- **📊 Context-Aware**: Maintains conversation history and context
- **⚡ High Performance**: Optimized for real-time CRM operations

## Installation

```bash
pnpm add @crm-immobiliare/ai-toolkit
```

## Quick Start

### 1. Create an Orchestrator

```typescript
import { createOrchestrator, CRMAssistantAgent, PropertySearchTool } from '@crm-immobiliare/ai-toolkit';

// Initialize orchestrator
const orchestrator = createOrchestrator({
  defaultAgent: 'crm-assistant',
  enableLogging: true,
});

// Create and register CRM assistant
const crmAssistant = new CRMAssistantAgent({
  apiKey: process.env.GEMINI_API_KEY!,
  name: 'CRM Assistant',
  description: 'AI assistant for CRM operations',
});

orchestrator.registerAgent('crm-assistant', crmAssistant);
```

### 2. Register Tools

```typescript
import { PropertySearchTool, ClientSearchTool } from '@crm-immobiliare/ai-toolkit';

// Create property search tool
const propertyTool = new PropertySearchTool();
propertyTool.setDataFetcher(async (params) => {
  // Your database query logic
  return await prisma.property.findMany({
    where: {
      city: params.city,
      contractType: params.contractType,
      priceSale: {
        gte: params.budgetMin,
        lte: params.budgetMax,
      },
    },
    take: params.limit,
  });
});

// Register tools
orchestrator.registerTool(propertyTool);
```

### 3. Execute Agent

```typescript
const response = await orchestrator.execute(
  'Sto cercando un appartamento a Milano, budget 300-400k€',
  {
    sessionId: 'user-123',
    userId: 'agent-456',
  }
);

console.log(response.content);
```

## Architecture

```
@crm-immobiliare/ai-toolkit/
├── core/
│   ├── agent-base.ts       # Base class for all agents
│   └── orchestrator.ts     # Central coordinator
├── agents/
│   ├── gemini-agent.ts     # Gemini AI implementation
│   └── crm-assistant.ts    # CRM-specific assistant
├── tools/
│   ├── property-search.tool.ts   # Property search
│   ├── client-search.tool.ts     # Client search
│   └── message-analyzer.tool.ts  # Message analysis
└── types/
    └── index.ts            # TypeScript definitions
```

## Available Agents

### CRMAssistantAgent

General-purpose assistant for CRM operations.

```typescript
const assistant = new CRMAssistantAgent({
  apiKey: process.env.GEMINI_API_KEY!,
  temperature: 0.7,
  maxTokens: 2048,
});
```

**Use cases:**
- Property recommendations
- Client inquiries
- General CRM questions
- Task automation

### GeminiAgent (Base)

Extend this to create custom agents.

```typescript
import { GeminiAgent } from '@crm-immobiliare/ai-toolkit';

class CustomAgent extends GeminiAgent {
  constructor(config) {
    super({
      ...config,
      systemPrompt: 'Your custom system prompt',
    });
  }
}
```

## Available Tools

### PropertySearchTool

Search properties based on criteria.

```typescript
const tool = new PropertySearchTool();
tool.setDataFetcher(async (params) => {
  // Your implementation
});

const results = await tool.execute({
  city: 'Milano',
  contractType: 'sale',
  budgetMin: 300000,
  budgetMax: 400000,
  rooms: 3,
});
```

### ClientSearchTool

Search clients/contacts.

```typescript
const tool = new ClientSearchTool();
tool.setDataFetcher(async (params) => {
  // Your implementation
});

const results = await tool.execute({
  status: 'active',
  contractType: 'sale',
  budgetMin: 300000,
});
```

### MessageAnalyzerTool

Analyze messages to extract intent and entities.

```typescript
const tool = new MessageAnalyzerTool();
tool.setAnalyzer(async (message) => {
  // Your AI analysis implementation
  // Falls back to regex-based analysis if not set
});

const analysis = await tool.execute({
  message: 'Cerco un trilocale a Milano, budget 350k',
});

console.log(analysis.intent); // 'property_inquiry'
console.log(analysis.entities); // { propertyTypes: ['trilocale'], locations: ['milano'], budget: { min: 350000 } }
```

## Custom Tools

Create custom tools by implementing the `Tool` interface:

```typescript
import { Tool } from '@crm-immobiliare/ai-toolkit';
import { z } from 'zod';

const MyToolSchema = z.object({
  param1: z.string(),
  param2: z.number(),
});

class MyCustomTool implements Tool {
  name = 'my_tool';
  description = 'Description of what my tool does';
  schema = MyToolSchema;

  async execute(input) {
    // Your implementation
    return result;
  }
}
```

## Configuration

### Agent Configuration

```typescript
interface AgentConfig {
  name: string;
  description: string;
  model?: string;              // Default: 'gemini-1.5-pro'
  temperature?: number;        // Default: 0.7
  maxTokens?: number;          // Default: 2048
  systemPrompt?: string;       // Custom system instructions
}
```

### Orchestrator Configuration

```typescript
interface OrchestratorConfig {
  defaultAgent?: string;           // Default agent name
  enableLogging?: boolean;         // Enable console logs (default: true)
  maxConcurrentRequests?: number;  // Max parallel requests (default: 10)
}
```

## Conversation Management

The toolkit automatically manages conversation history per session:

```typescript
// Execute with session
const response = await orchestrator.execute(message, {
  sessionId: 'session-123',
  userId: 'user-456',
});

// Get conversation history
const agent = orchestrator.getAgent('crm-assistant');
const history = agent.getConversationHistory('session-123');

// Clear history
agent.clearConversationHistory('session-123');
```

## Health Monitoring

```typescript
const health = await orchestrator.healthCheck();

console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
console.log(health.agents);  // Status of each agent
console.log(health.tools);   // Status of each tool
```

## Statistics

```typescript
const stats = orchestrator.getStatistics();

console.log(stats.totalAgents);      // Number of registered agents
console.log(stats.totalTools);       // Number of registered tools
console.log(stats.activeRequests);   // Currently running requests
console.log(stats.agents);           // List of agent names
console.log(stats.tools);            // List of tool names
```

## Integration with NestJS

```typescript
import { Injectable } from '@nestjs/common';
import { createOrchestrator, CRMAssistantAgent } from '@crm-immobiliare/ai-toolkit';

@Injectable()
export class AIService {
  private orchestrator;

  constructor(private prisma: PrismaService) {
    this.orchestrator = createOrchestrator();
    this.setupAgents();
    this.setupTools();
  }

  private setupAgents() {
    const assistant = new CRMAssistantAgent({
      apiKey: process.env.GEMINI_API_KEY!,
    });
    this.orchestrator.registerAgent('crm-assistant', assistant);
  }

  private setupTools() {
    const propertyTool = new PropertySearchTool();
    propertyTool.setDataFetcher((params) => this.searchProperties(params));
    this.orchestrator.registerTool(propertyTool);
  }

  async chat(message: string, sessionId: string, userId: string) {
    return this.orchestrator.execute(message, { sessionId, userId });
  }
}
```

## TypeScript Support

Full TypeScript support with type inference:

```typescript
import type { AgentResponse, PropertySearchResult, Tool } from '@crm-immobiliare/ai-toolkit';

const response: AgentResponse = await orchestrator.execute('...');
const properties: PropertySearchResult[] = await propertyTool.execute({ city: 'Milano' });
```

## Error Handling

All tools and agents throw descriptive errors:

```typescript
try {
  const response = await orchestrator.execute(message);
} catch (error) {
  if (error instanceof Error) {
    console.error('AI Error:', error.message);
  }
}
```

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your-google-ai-api-key

# Optional
AI_MODEL=gemini-1.5-pro
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048
```

## Future Enhancements

- [ ] Datapizza AI integration
- [ ] Additional specialized agents (scraping, analytics, etc.)
- [ ] More tools (activity creation, calendar sync, etc.)
- [ ] Streaming responses
- [ ] Multi-modal support (images, documents)
- [ ] Fine-tuned models for real estate domain
- [ ] Caching and performance optimizations

## Related Packages

- `@crm-immobiliare/shared-types` - Shared TypeScript types
- `@crm-immobiliare/database` - Prisma client
- `@crm-immobiliare/utils` - Utility functions

## License

PRIVATE - CRM Immobiliare Team
