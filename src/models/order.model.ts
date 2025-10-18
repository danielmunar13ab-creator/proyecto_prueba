import { CartItem } from './cart.model';

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'listo_para_servir' | 'en_camino' | 'entregado' | 'completado' | 'cancelado' | 'pagado';
export type OrderType = 'dine-in' | 'delivery' | 'store';

export interface Order {
  id: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  type: OrderType;
  createdAt: Date;
  completedAt?: Date;
  // Dine-in specific
  tableId?: number;
  waiterId?: number;
  waiterName?: string;
  // Delivery/Store specific
  customerName?: string;
  address?: string;
  phone?: string;
  deliveryPersonId?: number;
  // Cashier specific
  cashierId?: number;
}