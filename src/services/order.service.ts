import { Injectable, signal } from '@angular/core';
import { Order, OrderStatus, OrderType } from '../models/order.model';
import { CartItem } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private _orders = signal<Order[]>([
    // Existing Dine-in/Store orders
    { 
      id: 1, 
      items: [{ product: { id: 1, name: 'Hamburguesa Clásica', price: 25000, category: 'hamburguesas', description: '', longDescription: '', imageUrl: '' }, quantity: 2 }],
      total: 50000,
      status: 'en_preparacion',
      type: 'dine-in',
      createdAt: new Date('2024-05-21T19:10:00'),
      tableId: 3,
      waiterId: 3,
      waiterName: 'Mesero User'
    },
    { 
      id: 3, 
      items: [{ product: { id: 5, name: 'Papas a la Francesa', price: 8000, category: 'acompañamientos', description: '', longDescription: '', imageUrl: '' }, quantity: 1 }],
      total: 8000,
      status: 'listo_para_servir',
      type: 'store',
      createdAt: new Date('2024-05-21T19:25:00'),
      customerName: 'Cliente Recoge'
    },
    { 
      id: 4, 
      items: [{ product: { id: 11, name: 'Wrap de Pollo César', price: 22000, category: 'wraps', description: '', longDescription: '', imageUrl: '' }, quantity: 1 }],
      total: 22000,
      status: 'completado',
      type: 'dine-in',
      createdAt: new Date('2024-05-20T14:00:00'),
      completedAt: new Date('2024-05-20T14:30:00'),
      tableId: 1,
      waiterId: 6,
      waiterName: 'Mesero Dos',
      cashierId: 2
    },
    // --- NEW DELIVERY EXAMPLES ---
    { 
      id: 2, // Original delivery order, now ready to be picked up
      items: [{ product: { id: 3, name: 'Pizza Margherita', price: 30000, category: 'pizzas', description: '', longDescription: '', imageUrl: '' }, quantity: 1 }, { product: { id: 7, name: 'Gaseosa', price: 5000, category: 'bebidas', description: '', longDescription: '', imageUrl: '' }, quantity: 2 }],
      total: 40000,
      status: 'listo_para_servir', 
      type: 'delivery',
      createdAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
      customerName: 'Ana Gómez',
      address: 'Carrera 15 # 80-20',
      phone: '3112223344'
    },
    { 
      id: 5, // A delivery already in transit by our test delivery person
      items: [{ product: { id: 4, name: 'Pizza Pepperoni', price: 32000, category: 'pizzas', description: '', longDescription: '', imageUrl: '' }, quantity: 2 }],
      total: 64000,
      status: 'en_camino',
      type: 'delivery',
      createdAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
      customerName: 'Luis Fernández',
      address: 'Avenida Siempre Viva 742',
      phone: '3109876543',
      deliveryPersonId: 4 // Assigned to Domiciliario User
    },
    { 
      id: 6, // A delivery completed today by our test delivery person
      items: [{ product: { id: 2, name: 'Hamburguesa Doble Bacon', price: 35000, category: 'hamburguesas', description: '', longDescription: '', imageUrl: '' }, quantity: 1 }],
      total: 35000,
      status: 'completado',
      type: 'delivery',
      createdAt: new Date(Date.now() - 180 * 60000), // 3 hours ago
      completedAt: new Date(Date.now() - 150 * 60000), // Completed 2.5 hours ago
      customerName: 'Maria Rodriguez',
      address: 'Calle 100 # 7-50',
      phone: '3205556677',
      deliveryPersonId: 4, // Assigned to Domiciliario User
      cashierId: 2
    },
     // --- MORE MOCK DATA for Sales ---
    { id: 7, total: 45000, status: 'completado', createdAt: new Date('2024-05-20T12:30:00'), completedAt: new Date(), type: 'dine-in', waiterId: 3, cashierId: 2, items:[] },
    { id: 8, total: 78000, status: 'completado', createdAt: new Date('2024-05-19T20:00:00'), completedAt: new Date(), type: 'dine-in', waiterId: 6, cashierId: 2, items:[] },
    { id: 9, total: 32000, status: 'completado', createdAt: new Date('2024-05-15T13:00:00'), completedAt: new Date(), type: 'delivery', deliveryPersonId: 4, cashierId: 2, items:[] },
    { id: 10, total: 61000, status: 'completado', createdAt: new Date('2024-04-28T19:45:00'), completedAt: new Date(), type: 'dine-in', waiterId: 3, cashierId: 2, items:[] },
    { id: 11, total: 29000, status: 'completado', createdAt: new Date('2024-04-10T18:00:00'), completedAt: new Date(), type: 'dine-in', waiterId: 3, cashierId: 2, items:[] },
  ]);

  private nextId = signal(12);

  get orders() {
    return this._orders.asReadonly();
  }

  createOrder(
    items: CartItem[], 
    total: number, 
    type: OrderType,
    details: Partial<Order>
  ) {
    const newOrder: Order = {
      id: this.nextId(),
      items: [...items],
      total,
      status: 'pendiente',
      type,
      createdAt: new Date(),
      ...details,
    };
    this._orders.update(orders => [...orders, newOrder]);
    this.nextId.update(id => id + 1);
  }

  updateOrderStatus(orderId: number, status: OrderStatus, details?: { cashierId?: number, deliveryPersonId?: number }) {
    this._orders.update(orders =>
      orders.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status, ...details };
          if (status === 'completado') {
            updatedOrder.completedAt = new Date();
          }
          return updatedOrder;
        }
        return order;
      })
    );
  }
}