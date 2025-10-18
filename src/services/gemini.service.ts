import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey = signal<string | null>(null);
  
  isConfigured = signal(false);

  constructor() {
    const storedApiKey = typeof localStorage !== 'undefined' ? localStorage.getItem('gemini-api-key') : null;
    if (storedApiKey) {
      this.apiKey.set(storedApiKey);
      this.initialize(storedApiKey);
    }
  }

  private initialize(apiKey: string): boolean {
    try {
      this.ai = new GoogleGenAI({ apiKey });
      this.isConfigured.set(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize GoogleGenAI. The API key might be invalid.', error);
      this.isConfigured.set(false);
      this.ai = null;
      return false;
    }
  }

  setApiKey(apiKey: string): boolean {
    if (this.initialize(apiKey)) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gemini-api-key', apiKey);
      }
      this.apiKey.set(apiKey);
      return true;
    }
    return false;
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.isConfigured() || !this.ai) {
      return 'El servicio de IA no está configurado. Por favor, proporciona una clave de API válida.';
    }

    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Lo siento, hubo un problema al contactar a nuestro chef IA. Por favor, intenta de nuevo más tarde.';
    }
  }
}
