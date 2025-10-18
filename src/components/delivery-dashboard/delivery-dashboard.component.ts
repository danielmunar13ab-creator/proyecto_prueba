import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-delivery-dashboard',
  standalone: true,
  templateUrl: './delivery-dashboard.component.html',
  imports: [CommonModule, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryDashboardComponent {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);

  private allOrders = this.orderService.orders;
  private currentUser = this.authService.currentUser;

  // Orders ready for delivery, not yet assigned to anyone
  ordersToPickup = computed(() =>
    this.allOrders().filter(o => 
      o.type === 'delivery' && 
      o.status === 'listo_para_servir' &&
      !o.deliveryPersonId
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  );
  
  // Orders currently in transit by the logged-in delivery person
  ordersInTransit = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return [];
    return this.allOrders().filter(o => 
      o.type === 'delivery' && 
      o.status === 'en_camino' &&
      o.deliveryPersonId === userId
    ).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  });

  // Orders completed today by the logged-in delivery person
  completedDeliveriesToday = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.allOrders().filter(o => 
      o.deliveryPersonId === userId &&
      o.status === 'completado' &&
      o.completedAt &&
      new Date(o.completedAt) >= today
    ).sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0));
  });

  startDelivery(orderId: number) {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    this.orderService.updateOrderStatus(orderId, 'en_camino', { deliveryPersonId: userId });
  }

  completeDelivery(orderId: number) {
     this.orderService.updateOrderStatus(orderId, 'completado');
  }

  getGoogleMapsUrl(address: string): string {
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  }
}