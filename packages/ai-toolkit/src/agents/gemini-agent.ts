/**
 * Gemini Agent
 *
 * Agent implementation using Google Gemini AI.
 * Serves as the base for specialized CRM agents.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { BaseAgent } from '../core/agent-base';
import {
  AgentConfig,
  AgentResponse,
  AgentExecutionOptions,
  ConversationContext,
  ToolCall,
} from '../types';

export interface GeminiAgentConfig extends AgentConfig {
  apiKey: string;
  model?: string;
}

export class GeminiAgent extends BaseAgent {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor(config: GeminiAgentConfig) {
    super({
      model: 'gemini-1.5-pro',
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    });

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-1.5-pro',
    });
  }

  /**
   * Execute agent with Gemini
   */
  protected async executeInternal(
    message: string,
    context: ConversationContext,
    options: AgentExecutionOptions,
  ): Promise<AgentResponse> {
    try {
      // Build conversation history
      const history = this.getConversationHistory(context.sessionId);
      const messages = this.formatMessagesForGemini(history, message);

      // Add system prompt if configured
      let systemPrompt = this.config.systemPrompt || '';

      // Add tool descriptions if tools are available
      if (this.tools.size > 0) {
        systemPrompt += this.generateToolsPrompt();
      }

      // Create chat session
      const chat = this.model.startChat({
        history: messages.slice(0, -1), // All except current message
        generationConfig: {
          temperature: this.config.temperature,
          maxOutputTokens: this.config.maxTokens,
        },
      });

      // Send message with system context
      const fullMessage = systemPrompt
        ? `${systemPrompt}\n\nUser: ${message}`
        : message;

      const result = await chat.sendMessage(fullMessage);
      const response = result.response;
      const text = response.text();

      // Parse potential tool calls from response
      const toolCalls = this.parseToolCalls(text);

      // If tool calls detected, execute them
      if (toolCalls.length > 0) {
        const toolResults = await this.executeTools(toolCalls);

        // Create response with tool results
        return {
          content: text,
          toolCalls,
          finishReason: 'tool_calls',
          usage: {
            promptTokens: 0, // Gemini doesn't provide token counts directly
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      }

      return {
        content: text,
        finishReason: 'stop',
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error) {
      console.error('[GeminiAgent] Execution error:', error);
      return {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        finishReason: 'error',
      };
    }
  }

  /**
   * Format messages for Gemini chat history
   */
  private formatMessagesForGemini(
    history: any[],
    currentMessage: string,
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    const formatted = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add current message
    formatted.push({
      role: 'user',
      parts: [{ text: currentMessage }],
    });

    return formatted;
  }

  /**
   * Generate tool descriptions prompt
   */
  private generateToolsPrompt(): string {
    const tools = this.getTools();

    if (tools.length === 0) {
      return '';
    }

    let prompt = '\n\nYou have access to the following tools:\n\n';

    tools.forEach((tool) => {
      prompt += `- **${tool.name}**: ${tool.description}\n`;
    });

    prompt += '\nTo use a tool, respond with: TOOL_CALL: {tool_name} {json_arguments}\n';

    return prompt;
  }

  /**
   * Parse tool calls from LLM response
   * Format: TOOL_CALL: tool_name {"arg1": "value1", "arg2": "value2"}
   */
  private parseToolCalls(text: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    const toolCallRegex = /TOOL_CALL:\s*(\w+)\s*({[^}]+})/g;

    let match;
    while ((match = toolCallRegex.exec(text)) !== null) {
      const [, toolName, argsJson] = match;

      try {
        const args = JSON.parse(argsJson);
        toolCalls.push({
          id: `tool_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          name: toolName,
          arguments: args,
        });
      } catch (error) {
        console.error(`[GeminiAgent] Failed to parse tool arguments:`, error);
      }
    }

    return toolCalls;
  }
}
