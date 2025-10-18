import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-ai-search',
  standalone: true,
  templateUrl: './ai-search.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiSearchComponent {
  private geminiService = inject(GeminiService);
  private productService = inject(ProductService);

  query = signal('');
  recommendation = signal('');
  loading = signal(false);
  error = signal('');
  
  isConfigured = this.geminiService.isConfigured;
  apiKeyInput = signal('');
  apiKeyError = signal('');

  private allProducts = this.productService.getProducts();

  onQueryChange(event: Event) {
    this.query.set((event.target as HTMLInputElement).value);
  }
  
  onApiKeyChange(event: Event) {
    this.apiKeyInput.set((event.target as HTMLInputElement).value);
    this.apiKeyError.set('');
  }
  
  setApiKey() {
    if (!this.apiKeyInput().trim()) {
      this.apiKeyError.set('Por favor, ingresa una clave de API.');
      return;
    }
    const success = this.geminiService.setApiKey(this.apiKeyInput());
    if (!success) {
      this.apiKeyError.set('La clave de API no parece ser válida. Por favor, verifícala.');
    } else {
      this.apiKeyError.set('');
    }
  }

  async getRecommendation() {
    if (!this.query().trim()) {
      return;
    }
    
    if (!this.isConfigured()) {
      this.error.set('El Asistente IA no está configurado. Ingresa una clave de API para continuar.');
      return;
    }
    
    this.loading.set(true);
    this.recommendation.set('');
    this.error.set('');

    const productsForPrompt = this.allProducts().map(({ name, description, category, price }) => ({ name, description, category, price }));
    
    const prompt = `Eres un amigable asistente de comida para un restaurante de comida rápida llamado GoFood. Basado en la solicitud del usuario y el menú disponible, proporciona una recomendación de comida útil y atractiva. La solicitud del usuario es: "${this.query()}". Aquí está nuestro menú en formato JSON: ${JSON.stringify(productsForPrompt)}. Por favor, responde en un párrafo corto y amigable en español. No solo listes los artículos, sino describe por qué son una buena opción según la solicitud del usuario. Menciona uno o dos artículos específicos del menú en tu respuesta. Si el usuario pregunta algo que no tiene que ver con comida o el menú, responde amablemente que solo puedes dar recomendaciones de comida de GoFood.`;

    try {
      const result = await this.geminiService.generateText(prompt);
      this.recommendation.set(result);
    } catch (err) {
      this.error.set('Hubo un problema al obtener la recomendación. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }
}
