/**
 * Message Analyzer Tool
 *
 * Analyzes messages/emails from clients to extract intent, entities, and suggested actions.
 * Uses AI to understand client needs and automate CRM workflows.
 */

import { z } from 'zod';
import { Tool, MessageAnalysisResult } from '../types';

/**
 * Input schema for message analysis
 */
export const MessageAnalyzerInputSchema = z.object({
  message: z.string().describe('The message text to analyze'),
  context: z
    .object({
      senderName: z.string().optional(),
      senderEmail: z.string().optional(),
      subject: z.string().optional(),
      previousMessages: z.array(z.string()).optional(),
    })
    .optional()
    .describe('Optional context about the message'),
});

export type MessageAnalyzerInput = z.infer<typeof MessageAnalyzerInputSchema>;

/**
 * Message Analyzer Tool implementation
 */
export class MessageAnalyzerTool
  implements Tool<MessageAnalyzerInput, MessageAnalysisResult>
{
  name = 'message_analyzer';
  description =
    'Analyze messages or emails from clients to extract intent, property preferences, budget, urgency, and suggest next actions.';
  schema = MessageAnalyzerInputSchema;

  private analyzer?: (
    message: string,
    context?: any,
  ) => Promise<MessageAnalysisResult>;

  /**
   * Configure analyzer (inject AI service)
   */
  setAnalyzer(
    analyzer: (message: string, context?: any) => Promise<MessageAnalysisResult>,
  ): void {
    this.analyzer = analyzer;
  }

  /**
   * Execute message analysis
   */
  async execute(
    input: MessageAnalyzerInput,
  ): Promise<MessageAnalysisResult> {
    if (!this.analyzer) {
      // Fallback to basic regex-based analysis if no AI analyzer configured
      return this.basicAnalysis(input.message);
    }

    try {
      const result = await this.analyzer(input.message, input.context);

      // Log analysis for debugging
      console.log(`[MessageAnalyzerTool] Analyzed message`, {
        intent: result.intent,
        sentiment: result.sentiment,
        urgency: result.urgency,
      });

      return result;
    } catch (error) {
      console.error('[MessageAnalyzerTool] Analysis failed:', error);
      // Fallback to basic analysis on error
      return this.basicAnalysis(input.message);
    }
  }

  /**
   * Basic message analysis using regex patterns (fallback)
   */
  private basicAnalysis(message: string): MessageAnalysisResult {
    const lowerMessage = message.toLowerCase();

    // Detect intent
    let intent: MessageAnalysisResult['intent'] = 'other';

    if (
      lowerMessage.includes('visita') ||
      lowerMessage.includes('vedere') ||
      lowerMessage.includes('viewing') ||
      lowerMessage.includes('see the property')
    ) {
      intent = 'viewing_request';
    } else if (
      lowerMessage.includes('appartamento') ||
      lowerMessage.includes('casa') ||
      lowerMessage.includes('immobile') ||
      lowerMessage.includes('property')
    ) {
      intent = 'property_inquiry';
    } else if (
      lowerMessage.includes('reclamo') ||
      lowerMessage.includes('problema') ||
      lowerMessage.includes('complaint')
    ) {
      intent = 'complaint';
    } else if (
      lowerMessage.includes('?') ||
      lowerMessage.includes('informazioni') ||
      lowerMessage.includes('info')
    ) {
      intent = 'general_question';
    }

    // Detect sentiment
    let sentiment: MessageAnalysisResult['sentiment'] = 'neutral';

    if (
      lowerMessage.includes('perfetto') ||
      lowerMessage.includes('ottimo') ||
      lowerMessage.includes('grazie') ||
      lowerMessage.includes('excellent') ||
      lowerMessage.includes('perfect')
    ) {
      sentiment = 'positive';
    } else if (
      lowerMessage.includes('problema') ||
      lowerMessage.includes('deluso') ||
      lowerMessage.includes('disappointed') ||
      lowerMessage.includes('bad')
    ) {
      sentiment = 'negative';
    }

    // Detect urgency
    let urgency: MessageAnalysisResult['urgency'] = 'medium';

    if (
      lowerMessage.includes('urgente') ||
      lowerMessage.includes('subito') ||
      lowerMessage.includes('immediately') ||
      lowerMessage.includes('urgent') ||
      lowerMessage.includes('asap')
    ) {
      urgency = 'high';
    } else if (
      lowerMessage.includes('quando possibile') ||
      lowerMessage.includes('no rush') ||
      lowerMessage.includes('senza fretta')
    ) {
      urgency = 'low';
    }

    // Extract entities (basic)
    const entities: MessageAnalysisResult['entities'] = {};

    // Extract property types
    const propertyTypePatterns = [
      'appartamento',
      'casa',
      'villa',
      'attico',
      'monolocale',
      'bilocale',
      'trilocale',
    ];
    entities.propertyTypes = propertyTypePatterns.filter((type) =>
      lowerMessage.includes(type),
    );

    // Extract budget (simple regex)
    const budgetMatch = lowerMessage.match(/(\d{3,6})\s*(?:euro|€|eur)/gi);
    if (budgetMatch && budgetMatch.length > 0) {
      const amounts = budgetMatch
        .map((m) => parseInt(m.replace(/[^\d]/g, ''), 10))
        .sort((a, b) => a - b);
      entities.budget = {
        min: amounts[0],
        max: amounts[amounts.length - 1],
      };
    }

    // Extract rooms
    const roomsMatch = lowerMessage.match(/(\d+)\s*(?:camere|rooms|stanze)/i);
    if (roomsMatch) {
      entities.rooms = parseInt(roomsMatch[1], 10);
    }

    // Extract locations (basic Italian cities)
    const cities = [
      'milano',
      'roma',
      'torino',
      'firenze',
      'bologna',
      'napoli',
      'venezia',
      'genova',
      'verona',
      'padova',
    ];
    entities.locations = cities.filter((city) => lowerMessage.includes(city));

    // Suggested actions
    const suggestedActions: string[] = [];

    if (intent === 'viewing_request') {
      suggestedActions.push('Schedule property viewing');
      suggestedActions.push('Send availability calendar');
    } else if (intent === 'property_inquiry') {
      suggestedActions.push('Search matching properties');
      suggestedActions.push('Send property recommendations');
    } else if (intent === 'complaint') {
      suggestedActions.push('Create support ticket');
      suggestedActions.push('Escalate to manager');
    }

    if (urgency === 'high') {
      suggestedActions.unshift('Respond within 1 hour');
    }

    return {
      intent,
      entities,
      sentiment,
      urgency,
      suggestedActions,
    };
  }

  /**
   * Format analysis result for LLM consumption
   */
  formatResult(result: MessageAnalysisResult): string {
    let formatted = 'Message Analysis:\n\n';

    formatted += `Intent: ${result.intent}\n`;
    formatted += `Sentiment: ${result.sentiment}\n`;
    formatted += `Urgency: ${result.urgency}\n\n`;

    if (Object.keys(result.entities).length > 0) {
      formatted += 'Extracted Information:\n';

      if (result.entities.propertyTypes && result.entities.propertyTypes.length > 0) {
        formatted += `- Property types: ${result.entities.propertyTypes.join(', ')}\n`;
      }

      if (result.entities.locations && result.entities.locations.length > 0) {
        formatted += `- Locations: ${result.entities.locations.join(', ')}\n`;
      }

      if (result.entities.budget) {
        formatted += `- Budget: €${result.entities.budget.min?.toLocaleString()} - €${result.entities.budget.max?.toLocaleString()}\n`;
      }

      if (result.entities.surface) {
        formatted += `- Surface: ${result.entities.surface.min}m² - ${result.entities.surface.max}m²\n`;
      }

      if (result.entities.rooms) {
        formatted += `- Rooms: ${result.entities.rooms}\n`;
      }

      if (result.entities.features && result.entities.features.length > 0) {
        formatted += `- Features: ${result.entities.features.join(', ')}\n`;
      }

      formatted += '\n';
    }

    if (result.suggestedActions && result.suggestedActions.length > 0) {
      formatted += 'Suggested Actions:\n';
      result.suggestedActions.forEach((action, i) => {
        formatted += `${i + 1}. ${action}\n`;
      });
    }

    return formatted;
  }
}
