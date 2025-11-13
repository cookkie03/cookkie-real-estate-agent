/**
 * AI Toolkit Types
 *
 * Core types and interfaces for AI agents and tools.
 */

/**
 * Agent configuration
 */
export interface AgentConfig {
  name: string;
  description: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * Tool interface - all tools must implement this
 */
export interface Tool<TInput = any, TOutput = any> {
  name: string;
  description: string;
  schema: any; // Zod schema for input validation
  execute(input: TInput): Promise<TOutput>;
}

/**
 * Agent message
 */
export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp?: Date;
}

/**
 * Tool call from agent
 */
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  id: string;
  name: string;
  result: any;
  error?: string;
}

/**
 * Agent response
 */
export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Conversation context
 */
export interface ConversationContext {
  sessionId: string;
  userId: string;
  messages: AgentMessage[];
  metadata?: Record<string, any>;
}

/**
 * Agent execution options
 */
export interface AgentExecutionOptions {
  maxIterations?: number;
  timeout?: number;
  streamResponse?: boolean;
  includeToolResults?: boolean;
}

/**
 * Python AI Service API types (for backward compatibility)
 */
export interface PythonAIServiceConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

export interface PythonAgentRequest {
  agent: string;
  message: string;
  context?: Record<string, any>;
  sessionId?: string;
}

export interface PythonAgentResponse {
  response: string;
  toolCalls?: any[];
  metadata?: Record<string, any>;
}

/**
 * CRM-specific types
 */
export interface PropertySearchParams {
  city?: string;
  zone?: string;
  contractType?: 'sale' | 'rent';
  propertyType?: string;
  budgetMin?: number;
  budgetMax?: number;
  surfaceMin?: number;
  surfaceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  features?: string[];
  limit?: number;
}

export interface ClientSearchParams {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'archived' | 'blacklist';
  contractType?: 'sale' | 'rent';
  budgetMin?: number;
  budgetMax?: number;
  limit?: number;
}

export interface MessageAnalysisResult {
  intent: 'property_inquiry' | 'viewing_request' | 'general_question' | 'complaint' | 'other';
  entities: {
    propertyTypes?: string[];
    locations?: string[];
    budget?: { min?: number; max?: number };
    surface?: { min?: number; max?: number };
    rooms?: number;
    features?: string[];
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  suggestedActions?: string[];
}

export interface ActivityCreationParams {
  type: 'call' | 'email' | 'whatsapp' | 'viewing' | 'meeting' | 'task';
  title: string;
  description?: string;
  contactId?: string;
  propertyId?: string;
  dueDate?: Date;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'completed' | 'cancelled';
}

/**
 * Datapizza AI types (future implementation)
 */
export interface DatapizzaConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
}

export interface DatapizzaAgentConfig extends AgentConfig {
  datapizza: DatapizzaConfig;
  tools?: Tool[];
}
