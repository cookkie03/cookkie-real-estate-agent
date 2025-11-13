/**
 * Base Agent Class
 *
 * Abstract base class for all AI agents.
 * Provides common functionality for agent execution, tool calling, and context management.
 */

import {
  AgentConfig,
  AgentMessage,
  AgentResponse,
  AgentExecutionOptions,
  Tool,
  ToolCall,
  ToolResult,
  ConversationContext,
} from '../types';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected tools: Map<string, Tool>;
  protected conversationHistory: Map<string, AgentMessage[]>;

  constructor(config: AgentConfig) {
    this.config = config;
    this.tools = new Map();
    this.conversationHistory = new Map();
  }

  /**
   * Register a tool for this agent to use
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Register multiple tools
   */
  registerTools(tools: Tool[]): void {
    tools.forEach((tool) => this.registerTool(tool));
  }

  /**
   * Get all registered tools
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Execute agent with a message
   */
  async execute(
    message: string,
    context: Partial<ConversationContext>,
    options: AgentExecutionOptions = {},
  ): Promise<AgentResponse> {
    const sessionId = context.sessionId || this.generateSessionId();
    const userId = context.userId || 'anonymous';

    // Initialize conversation history if needed
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    // Add user message to history
    const userMessage: AgentMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    const history = this.conversationHistory.get(sessionId)!;
    history.push(userMessage);

    // Execute agent logic (implemented by subclasses)
    const response = await this.executeInternal(
      message,
      { ...context, sessionId, userId },
      options,
    );

    // Add assistant response to history
    const assistantMessage: AgentMessage = {
      role: 'assistant',
      content: response.content,
      toolCalls: response.toolCalls,
      timestamp: new Date(),
    };
    history.push(assistantMessage);

    // Limit history size (keep last 50 messages)
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    return response;
  }

  /**
   * Internal execution logic - to be implemented by subclasses
   */
  protected abstract executeInternal(
    message: string,
    context: ConversationContext,
    options: AgentExecutionOptions,
  ): Promise<AgentResponse>;

  /**
   * Execute a tool call
   */
  protected async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    const tool = this.tools.get(toolCall.name);

    if (!tool) {
      return {
        id: toolCall.id,
        name: toolCall.name,
        result: null,
        error: `Tool '${toolCall.name}' not found`,
      };
    }

    try {
      // Validate input against schema
      const validatedInput = tool.schema.parse(toolCall.arguments);

      // Execute tool
      const result = await tool.execute(validatedInput);

      return {
        id: toolCall.id,
        name: toolCall.name,
        result,
      };
    } catch (error) {
      return {
        id: toolCall.id,
        name: toolCall.name,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute multiple tool calls in parallel
   */
  protected async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    return Promise.all(toolCalls.map((tc) => this.executeTool(tc)));
  }

  /**
   * Get conversation history for a session
   */
  getConversationHistory(sessionId: string): AgentMessage[] {
    return this.conversationHistory.get(sessionId) || [];
  }

  /**
   * Clear conversation history for a session
   */
  clearConversationHistory(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  /**
   * Clear all conversation histories
   */
  clearAllConversations(): void {
    this.conversationHistory.clear();
  }

  /**
   * Generate a unique session ID
   */
  protected generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Format messages for LLM context
   */
  protected formatMessagesForContext(
    messages: AgentMessage[],
  ): Array<{ role: string; content: string }> {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   */
  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
