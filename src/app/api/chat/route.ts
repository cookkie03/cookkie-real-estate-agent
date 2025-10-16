import { NextRequest } from 'next/server';
import {
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { jsonResponse, errorResponse } from '@/lib/api/helpers';

const MODEL_NAME = 'gemini-1.0-pro';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return errorResponse('Nessun messaggio fornito', 400);
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return errorResponse('Chiave API di Google non configurata', 500);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Logica semplificata per il debug: usa solo l'ultimo messaggio
    const lastMessage = messages[messages.length - 1];
    const prompt = lastMessage.content;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return jsonResponse({ content: text });

  } catch (error) {
    console.error('Errore nella chiamata API di Google (Logica Semplificata):', error);
    return errorResponse('Errore interno del server durante la comunicazione con l\'AI.', 500);
  }
}