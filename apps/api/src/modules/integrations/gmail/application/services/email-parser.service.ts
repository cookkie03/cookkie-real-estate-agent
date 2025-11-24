/**
 * Email Parser Service (Application Layer)
 *
 * AI-powered email parsing to extract property requirements and intent.
 */

import { Injectable, Logger } from '@nestjs/common';
import { EmailMessage, EmailParsedData } from '../../domain/entities/email-message.entity';

@Injectable()
export class EmailParserService {
  private readonly logger = new Logger(EmailParserService.name);

  /**
   * Parse email content to extract structured data
   */
  async parseEmail(email: EmailMessage): Promise<EmailParsedData> {
    this.logger.log(`Parsing email: ${email.subject}`);

    const text = email.textContent.toLowerCase();
    const subject = email.subject.toLowerCase();
    const combined = `${subject} ${text}`;

    const parsedData: EmailParsedData = {
      intent: this.detectIntent(combined),
      urgency: this.detectUrgency(combined),
      sentiment: this.detectSentiment(combined),
      propertyRequirements: this.extractPropertyRequirements(combined, text),
      suggestedActions: [],
      extractedPhoneNumbers: this.extractPhoneNumbers(text),
      extractedDates: this.extractDates(text),
    };

    // Generate suggested actions
    parsedData.suggestedActions = this.generateSuggestedActions(parsedData);

    this.logger.log(`✅ Email parsed: intent=${parsedData.intent}, urgency=${parsedData.urgency}`);

    return parsedData;
  }

  /**
   * Detect email intent
   */
  private detectIntent(text: string): EmailParsedData['intent'] {
    // Viewing request keywords
    if (
      text.includes('visita') ||
      text.includes('vedere') ||
      text.includes('viewing') ||
      text.includes('visitare') ||
      text.includes('appuntamento') ||
      text.includes('quando posso')
    ) {
      return 'viewing_request';
    }

    // Property inquiry keywords
    if (
      text.includes('cerco') ||
      text.includes('cercare') ||
      text.includes('interessato') ||
      text.includes('appartamento') ||
      text.includes('casa') ||
      text.includes('immobile') ||
      text.includes('property') ||
      text.includes('disponibile') ||
      text.includes('vendita') ||
      text.includes('affitto')
    ) {
      return 'property_inquiry';
    }

    // Complaint keywords
    if (
      text.includes('reclamo') ||
      text.includes('problema') ||
      text.includes('complaint') ||
      text.includes('insoddisfatto') ||
      text.includes('deluso') ||
      text.includes('non va bene')
    ) {
      return 'complaint';
    }

    // Feedback keywords
    if (
      text.includes('feedback') ||
      text.includes('recensione') ||
      text.includes('opinione') ||
      text.includes('consiglio') ||
      text.includes('suggerimento')
    ) {
      return 'feedback';
    }

    return 'general_question';
  }

  /**
   * Detect urgency level
   */
  private detectUrgency(text: string): 'low' | 'medium' | 'high' {
    // High urgency keywords
    const highUrgencyKeywords = [
      'urgente',
      'subito',
      'immediately',
      'urgent',
      'asap',
      'entro oggi',
      'entro domani',
      'quanto prima',
      'il prima possibile',
    ];

    if (highUrgencyKeywords.some((keyword) => text.includes(keyword))) {
      return 'high';
    }

    // Low urgency keywords
    const lowUrgencyKeywords = [
      'quando possibile',
      'no rush',
      'senza fretta',
      'non urgente',
      'nei prossimi giorni',
      'prossima settimana',
    ];

    if (lowUrgencyKeywords.some((keyword) => text.includes(keyword))) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Detect sentiment
   */
  private detectSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    // Positive keywords
    const positiveKeywords = [
      'grazie',
      'perfetto',
      'ottimo',
      'eccellente',
      'bene',
      'fantastico',
      'great',
      'excellent',
      'perfect',
      'thank',
      'soddisfatto',
      'contento',
    ];

    const positiveCount = positiveKeywords.filter((keyword) =>
      text.includes(keyword),
    ).length;

    // Negative keywords
    const negativeKeywords = [
      'problema',
      'male',
      'pessimo',
      'terribile',
      'deluso',
      'disappointed',
      'bad',
      'terrible',
      'awful',
      'horrible',
      'insoddisfatto',
      'non va bene',
      'non funziona',
    ];

    const negativeCount = negativeKeywords.filter((keyword) =>
      text.includes(keyword),
    ).length;

    if (positiveCount > negativeCount && positiveCount >= 1) {
      return 'positive';
    }

    if (negativeCount > positiveCount && negativeCount >= 1) {
      return 'negative';
    }

    return 'neutral';
  }

  /**
   * Extract property requirements from text
   */
  private extractPropertyRequirements(
    combined: string,
    fullText: string,
  ): EmailParsedData['propertyRequirements'] {
    const requirements: EmailParsedData['propertyRequirements'] = {};

    // Extract city
    const italianCities = [
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
      'bari',
      'palermo',
      'catania',
    ];

    for (const city of italianCities) {
      if (combined.includes(city)) {
        requirements.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }

    // Extract contract type
    if (combined.includes('affitto') || combined.includes('rent')) {
      requirements.contractType = 'rent';
    } else if (combined.includes('vendita') || combined.includes('sale') || combined.includes('acquist')) {
      requirements.contractType = 'sale';
    }

    // Extract property type
    const propertyTypes = [
      { keywords: ['appartamento', 'apartment'], type: 'Appartamento' },
      { keywords: ['villa'], type: 'Villa' },
      { keywords: ['attico'], type: 'Attico' },
      { keywords: ['casa', 'house'], type: 'Casa' },
      { keywords: ['loft'], type: 'Loft' },
      { keywords: ['monolocale', 'studio'], type: 'Monolocale' },
      { keywords: ['bilocale'], type: 'Bilocale' },
      { keywords: ['trilocale'], type: 'Trilocale' },
    ];

    for (const pt of propertyTypes) {
      if (pt.keywords.some((keyword) => combined.includes(keyword))) {
        requirements.propertyType = pt.type;
        break;
      }
    }

    // Extract budget
    const budgetRegex = /(\d{3,6})\s*(?:euro|€|eur|k)/gi;
    const budgetMatches = fullText.match(budgetRegex);

    if (budgetMatches && budgetMatches.length > 0) {
      const amounts = budgetMatches
        .map((m) => {
          const num = parseInt(m.replace(/[^\d]/g, ''), 10);
          // Convert k to thousands
          if (m.toLowerCase().includes('k')) {
            return num * 1000;
          }
          return num;
        })
        .sort((a, b) => a - b);

      requirements.budgetMin = amounts[0];
      requirements.budgetMax = amounts[amounts.length - 1];
    }

    // Extract surface
    const surfaceRegex = /(\d+)\s*m[²2q]/gi;
    const surfaceMatches = fullText.match(surfaceRegex);

    if (surfaceMatches && surfaceMatches.length > 0) {
      const surfaces = surfaceMatches
        .map((m) => parseInt(m.replace(/\D/g, ''), 10))
        .sort((a, b) => a - b);

      requirements.surfaceMin = surfaces[0];
      requirements.surfaceMax = surfaces[surfaces.length - 1];
    }

    // Extract rooms
    const roomsRegex = /(\d+)\s*(?:camere|locali|rooms|stanze)/i;
    const roomsMatch = fullText.match(roomsRegex);

    if (roomsMatch) {
      requirements.rooms = parseInt(roomsMatch[1], 10);
    }

    // Extract features
    const features: string[] = [];
    const featureKeywords = [
      'garage',
      'posto auto',
      'parking',
      'giardino',
      'garden',
      'terrazzo',
      'terrace',
      'balcone',
      'balcony',
      'ascensore',
      'elevator',
      'piscina',
      'pool',
      'cantina',
      'aria condizionata',
      'riscaldamento',
    ];

    for (const feature of featureKeywords) {
      if (combined.includes(feature)) {
        features.push(feature);
      }
    }

    if (features.length > 0) {
      requirements.features = features;
    }

    return requirements;
  }

  /**
   * Extract phone numbers from text
   */
  private extractPhoneNumbers(text: string): string[] {
    const phoneRegex = /(?:\+39\s?)?(?:\d{2,4}[\s\-]?){2,4}\d{3,4}/g;
    const matches = text.match(phoneRegex) || [];

    return matches.map((m) => m.replace(/\s/g, ''));
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): Date[] {
    const dates: Date[] = [];

    // Simple date patterns (DD/MM/YYYY or DD-MM-YYYY)
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g;
    let match;

    while ((match = dateRegex.exec(text)) !== null) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
      let year = parseInt(match[3], 10);

      // Handle 2-digit years
      if (year < 100) {
        year += 2000;
      }

      if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
        dates.push(new Date(year, month, day));
      }
    }

    return dates;
  }

  /**
   * Generate suggested actions based on parsed data
   */
  private generateSuggestedActions(parsedData: EmailParsedData): string[] {
    const actions: string[] = [];

    switch (parsedData.intent) {
      case 'viewing_request':
        actions.push('Schedule property viewing');
        actions.push('Send availability calendar');
        actions.push('Confirm viewing appointment');
        break;

      case 'property_inquiry':
        actions.push('Search matching properties');
        actions.push('Send property recommendations');
        actions.push('Create client profile');
        break;

      case 'complaint':
        actions.push('Create support ticket');
        actions.push('Escalate to manager');
        actions.push('Send apology response');
        break;

      case 'feedback':
        actions.push('Thank for feedback');
        actions.push('Log feedback');
        break;

      case 'general_question':
        actions.push('Provide information');
        actions.push('Send relevant resources');
        break;
    }

    // Add urgency-based actions
    if (parsedData.urgency === 'high') {
      actions.unshift('Respond within 1 hour');
      actions.push('Set follow-up reminder');
    }

    // Add sentiment-based actions
    if (parsedData.sentiment === 'negative') {
      actions.unshift('Priority response required');
    }

    return actions;
  }

  /**
   * Batch parse multiple emails
   */
  async parseEmailBatch(emails: EmailMessage[]): Promise<Map<string, EmailParsedData>> {
    const results = new Map<string, EmailParsedData>();

    for (const email of emails) {
      try {
        const parsedData = await this.parseEmail(email);
        results.set(email.id, parsedData);
      } catch (error) {
        this.logger.error(`Error parsing email ${email.id}:`, error);
      }
    }

    this.logger.log(`✅ Parsed ${results.size}/${emails.length} emails`);

    return results;
  }
}
