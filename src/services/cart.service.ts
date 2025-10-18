import { Injectable, signal, computed } from '@angular/core';
import { CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  totalItems = computed(() => 
    this.cartItems().reduce((acc, item) => acc + item.quantity, 0)
  );

  totalPrice = computed(() => 
    this.cartItems().reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  );

  addToCart(product: Product) {
    this.cartItems.update(items => {
      const existingItem = items.find(item => item.product.id === product.id);
      if (existingItem) {
        return items.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...items, { product, quantity: 1 }];
      }
    });
  }

  removeFromCart(productId: number) {
    this.cartItems.update(items => items.filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    this.cartItems.update(items => 
      items.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0)
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }
}
