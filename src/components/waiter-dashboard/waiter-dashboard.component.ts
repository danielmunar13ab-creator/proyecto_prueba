import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { TableService } from '../../services/table.service';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Table } from '../../models/table.model';
import { Product } from '../../models/product.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-waiter-dashboard',
  standalone: true,
  templateUrl: './waiter-dashboard.component.html',
  imports: [CommonModule, CurrencyPipe],
})
export class WaiterDashboardComponent {
  private tableService = inject(TableService);
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  tables = this.tableService.tables;
  products = this.productService.getProducts();
  currentUser = this.authService.currentUser;

  selectedTable = signal<Table | null>(null);

  // Use cart service for the current order being built
  cartItems = this.cartService.cartItems;
  totalPrice = this.cartService.totalPrice;

  private allOrders = this.orderService.orders;
  currentOrderForTable = computed(() => {
    const table = this.selectedTable();
    if (!table) return null;
    return this.allOrders().find(o => o.tableId === table.id && o.status !== 'completado' && o.status !== 'cancelado');
  });

  selectTable(table: Table) {
    this.selectedTable.set(table);
    this.cartService.clearCart();
  }

  deselectTable() {
    this.selectedTable.set(null);
    this.cartService.clearCart();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  placeOrderForTable(tableId: number) {
    if (this.cartItems().length === 0) return;
    const waiter = this.currentUser();

    this.orderService.createOrder(this.cartItems(), this.totalPrice(), 'dine-in', { 
      tableId,
      waiterId: waiter?.id,
      waiterName: waiter?.name,
    });
    this.tableService.updateTableStatus(tableId, 'ocupada');
    this.cartService.clearCart();
    // Keep the table selected to see the new order appear.
  }
}