import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  selectedProduct = signal<Product | null>(null);

  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
  }

  clearSelectedProduct(): void {
    this.selectedProduct.set(null);
  }
}
