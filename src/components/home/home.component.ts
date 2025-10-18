import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CategoryFilterComponent } from '../category-filter/category-filter.component';
import { ProductCardComponent } from '../product-card/product-card.component';
import { AiSearchComponent } from '../ai-search/ai-search.component';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [CommonModule, CategoryFilterComponent, ProductCardComponent, AiSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private productService = inject(ProductService);
  private uiService = inject(UiService);
  
  products = this.productService.getProducts();
  categories = this.productService.categories;

  selectedCategory = signal<string | null>(null);

  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    let filtered = this.products();

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    
    return filtered;
  });

  onCategorySelected(category: string | null) {
    this.selectedCategory.set(category);
  }

  onProductClicked(product: Product) {
    this.uiService.selectProduct(product);
  }
}