/**
 * CRM Immobiliare AI Toolkit
 *
 * AI agents and tools for intelligent CRM operations.
 * Provides TypeScript-native AI capabilities with Gemini integration.
 *
 * @packageDocumentation
 */

// Core
export * from './core/agent-base';
export * from './core/orchestrator';

// Types
export * from './types';

// Agents
export * from './agents/gemini-agent';
export * from './agents/crm-assistant';

// Tools
export * from './tools/property-search.tool';
export * from './tools/client-search.tool';
export * from './tools/message-analyzer.tool';

// Re-export for convenience
export { AIOrchestrator, createOrchestrator, getOrchestrator } from './core/orchestrator';
export { BaseAgent } from './core/agent-base';
export { GeminiAgent } from './agents/gemini-agent';
export { CRMAssistantAgent } from './agents/crm-assistant';
export { PropertySearchTool } from './tools/property-search.tool';
export { ClientSearchTool } from './tools/client-search.tool';
export { MessageAnalyzerTool } from './tools/message-analyzer.tool';
