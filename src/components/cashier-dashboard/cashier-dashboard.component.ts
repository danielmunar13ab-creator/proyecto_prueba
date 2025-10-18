import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Order, OrderType } from '../../models/order.model';
import { TableService } from '../../services/table.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cashier-dashboard',
  standalone: true,
  templateUrl: './cashier-dashboard.component.html',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CashierDashboardComponent {
  private orderService = inject(OrderService);
  private tableService = inject(TableService);
  private authService = inject(AuthService);

  private allOrders = this.orderService.orders;
  private currentUser = this.authService.currentUser;

  pendingOrders = computed(() => 
    this.allOrders().filter(o => o.status === 'listo_para_servir')
  );

  dailyCompletedByCashier = computed(() => {
    const cashierId = this.currentUser()?.id;
    if (!cashierId) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.allOrders().filter(order => 
      order.cashierId === cashierId && 
      order.completedAt && 
      new Date(order.completedAt) >= today
    ).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  });

  dailyTotal = computed(() => {
    return this.dailyCompletedByCashier().reduce((acc, order) => acc + order.total, 0);
  });

  completeOrder(orderId: number) {
    const order = this.allOrders().find(o => o.id === orderId);
    if (order) {
      this.orderService.updateOrderStatus(order.id, 'completado', { cashierId: this.currentUser()?.id });
      if (order.type === 'dine-in' && order.tableId) {
          this.tableService.updateTableStatus(order.tableId, 'disponible');
      }
    }
  }

  getOrderTypeLabel(type: OrderType, tableId?: number): string {
    switch(type) {
      case 'dine-in': return `Mesa #${tableId}`;
      case 'delivery': return 'Domicilio';
      case 'store': return 'Recoger';
      default: return 'N/A';
    }
  }
}