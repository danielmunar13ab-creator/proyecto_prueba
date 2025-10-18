import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { OrderType } from '../../models/order.model';

@Component({
  selector: 'app-cook-dashboard',
  standalone: true,
  templateUrl: './cook-dashboard.component.html',
  imports: [CommonModule, DatePipe],
})
export class CookDashboardComponent {
  private orderService = inject(OrderService);

  private allOrders = this.orderService.orders;

  pendingOrders = computed(() =>
    this.allOrders().filter(o => o.status === 'pendiente').sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  );
  
  inPreparationOrders = computed(() =>
    this.allOrders().filter(o => o.status === 'en_preparacion').sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  );
  
  startPreparation(orderId: number) {
    this.orderService.updateOrderStatus(orderId, 'en_preparacion');
  }

  finishOrder(orderId: number) {
    this.orderService.updateOrderStatus(orderId, 'listo_para_servir');
  }

  // FIX: Use OrderType for the 'type' parameter instead of a generic string for better type safety.
  getOrderTypeLabel(type: OrderType, tableId?: number): string {
    switch(type) {
      case 'dine-in': return `Mesa #${tableId}`;
      case 'delivery': return 'Domicilio';
      case 'store': return 'Recoger';
      default: return 'N/A';
    }
  }
}
