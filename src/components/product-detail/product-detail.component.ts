import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  templateUrl: './product-detail.component.html',
  imports: [CommonModule, CurrencyPipe],
})
export class ProductDetailComponent {
  product = input.required<Product>();
  closeDetail = output<void>();
  
  cartService = inject(CartService);

  addToCart() {
    this.cartService.addToCart(this.product());
    this.closeDetail.emit();
  }
}