/**
 * AI Orchestrator
 *
 * Central coordinator for all AI agents and tools.
 * Provides a unified interface for AI operations across the CRM.
 */

import { BaseAgent } from './agent-base';
import {
  AgentExecutionOptions,
  AgentResponse,
  ConversationContext,
  Tool,
} from '../types';

export interface OrchestratorConfig {
  defaultAgent?: string;
  enableLogging?: boolean;
  maxConcurrentRequests?: number;
}

export class AIOrchestrator {
  private agents: Map<string, BaseAgent>;
  private tools: Map<string, Tool>;
  private config: OrchestratorConfig;
  private requestQueue: Promise<any>[];

  constructor(config: OrchestratorConfig = {}) {
    this.agents = new Map();
    this.tools = new Map();
    this.config = {
      enableLogging: true,
      maxConcurrentRequests: 10,
      ...config,
    };
    this.requestQueue = [];
  }

  /**
   * Register an agent
   */
  registerAgent(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
    if (this.config.enableLogging) {
      console.log(`[Orchestrator] Registered agent: ${name}`);
    }
  }

  /**
   * Register a tool globally (available to all agents)
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);

    // Register tool with all existing agents
    this.agents.forEach((agent) => {
      agent.registerTool(tool);
    });

    if (this.config.enableLogging) {
      console.log(`[Orchestrator] Registered tool: ${tool.name}`);
    }
  }

  /**
   * Register multiple tools
   */
  registerTools(tools: Tool[]): void {
    tools.forEach((tool) => this.registerTool(tool));
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Map<string, BaseAgent> {
    return new Map(this.agents);
  }

  /**
   * Execute a specific agent
   */
  async executeAgent(
    agentName: string,
    message: string,
    context: Partial<ConversationContext> = {},
    options: AgentExecutionOptions = {},
  ): Promise<AgentResponse> {
    const agent = this.agents.get(agentName);

    if (!agent) {
      throw new Error(`Agent '${agentName}' not found`);
    }

    // Enforce concurrent request limit
    if (this.requestQueue.length >= this.config.maxConcurrentRequests!) {
      await this.requestQueue[0]; // Wait for oldest request
    }

    if (this.config.enableLogging) {
      console.log(`[Orchestrator] Executing agent: ${agentName}`);
      console.log(`[Orchestrator] Message: ${message.substring(0, 100)}...`);
    }

    const requestPromise = agent.execute(message, context, options);
    this.requestQueue.push(requestPromise);

    try {
      const response = await requestPromise;

      if (this.config.enableLogging) {
        console.log(
          `[Orchestrator] Response: ${response.content.substring(0, 100)}...`,
        );
      }

      return response;
    } finally {
      // Remove from queue
      const index = this.requestQueue.indexOf(requestPromise);
      if (index > -1) {
        this.requestQueue.splice(index, 1);
      }
    }
  }

  /**
   * Execute default agent
   */
  async execute(
    message: string,
    context: Partial<ConversationContext> = {},
    options: AgentExecutionOptions = {},
  ): Promise<AgentResponse> {
    const defaultAgent = this.config.defaultAgent;

    if (!defaultAgent) {
      throw new Error('No default agent configured');
    }

    return this.executeAgent(defaultAgent, message, context, options);
  }

  /**
   * Route a message to the most appropriate agent
   * This is a simple implementation - can be enhanced with ML-based routing
   */
  async routeAndExecute(
    message: string,
    context: Partial<ConversationContext> = {},
    options: AgentExecutionOptions = {},
  ): Promise<{ agent: string; response: AgentResponse }> {
    const agentName = this.determineAgent(message, context);
    const response = await this.executeAgent(agentName, message, context, options);

    return { agent: agentName, response };
  }

  /**
   * Determine which agent should handle the message
   * Simple keyword-based routing for now
   */
  private determineAgent(
    message: string,
    context: Partial<ConversationContext>,
  ): string {
    const lowerMessage = message.toLowerCase();

    // Scraping keywords
    if (
      lowerMessage.includes('scraping') ||
      lowerMessage.includes('import') ||
      lowerMessage.includes('immobiliare.it') ||
      lowerMessage.includes('casa.it')
    ) {
      return 'scraping-agent';
    }

    // Property search keywords
    if (
      lowerMessage.includes('property') ||
      lowerMessage.includes('immobile') ||
      lowerMessage.includes('appartamento') ||
      lowerMessage.includes('casa') ||
      lowerMessage.includes('villa')
    ) {
      return 'property-agent';
    }

    // Client/contact keywords
    if (
      lowerMessage.includes('client') ||
      lowerMessage.includes('contact') ||
      lowerMessage.includes('cliente')
    ) {
      return 'client-agent';
    }

    // Analytics keywords
    if (
      lowerMessage.includes('report') ||
      lowerMessage.includes('analytics') ||
      lowerMessage.includes('statistics') ||
      lowerMessage.includes('statistiche')
    ) {
      return 'analytics-agent';
    }

    // Default to general assistant
    return this.config.defaultAgent || 'general-assistant';
  }

  /**
   * Clear all conversation histories across all agents
   */
  clearAllConversations(): void {
    this.agents.forEach((agent) => {
      agent.clearAllConversations();
    });

    if (this.config.enableLogging) {
      console.log('[Orchestrator] Cleared all conversation histories');
    }
  }

  /**
   * Get statistics about the orchestrator
   */
  getStatistics(): {
    totalAgents: number;
    totalTools: number;
    activeRequests: number;
    agents: string[];
    tools: string[];
  } {
    return {
      totalAgents: this.agents.size,
      totalTools: this.tools.size,
      activeRequests: this.requestQueue.length,
      agents: Array.from(this.agents.keys()),
      tools: Array.from(this.tools.keys()),
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    agents: Record<string, 'available' | 'unavailable'>;
    tools: Record<string, 'available' | 'unavailable'>;
  }> {
    const agentStatus: Record<string, 'available' | 'unavailable'> = {};
    const toolStatus: Record<string, 'available' | 'unavailable'> = {};

    // Check agents
    this.agents.forEach((agent, name) => {
      agentStatus[name] = agent ? 'available' : 'unavailable';
    });

    // Check tools
    this.tools.forEach((tool, name) => {
      toolStatus[name] = tool ? 'available' : 'unavailable';
    });

    const totalComponents = this.agents.size + this.tools.size;
    const availableComponents =
      Object.values(agentStatus).filter((s) => s === 'available').length +
      Object.values(toolStatus).filter((s) => s === 'available').length;

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (availableComponents === totalComponents) {
      status = 'healthy';
    } else if (availableComponents > totalComponents / 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      agents: agentStatus,
      tools: toolStatus,
    };
  }
}

/**
 * Create a singleton instance for global use
 */
let orchestratorInstance: AIOrchestrator | null = null;

export function createOrchestrator(
  config: OrchestratorConfig = {},
): AIOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AIOrchestrator(config);
  }
  return orchestratorInstance;
}

export function getOrchestrator(): AIOrchestrator {
  if (!orchestratorInstance) {
    throw new Error('Orchestrator not initialized. Call createOrchestrator() first.');
  }
  return orchestratorInstance;
}
