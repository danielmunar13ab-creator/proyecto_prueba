import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  templateUrl: './product-card.component.html',
  imports: [CommonModule, CurrencyPipe],
})
export class ProductCardComponent {
  product = input.required<Product>();
  productClicked = output<Product>();

  cartService = inject(CartService);

  addToCart(event: Event, product: Product) {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  viewDetails() {
    this.productClicked.emit(this.product());
  }
}