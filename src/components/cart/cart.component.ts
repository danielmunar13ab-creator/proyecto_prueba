import { Component, ChangeDetectionStrategy, output, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CartService } from '../../services/cart.service';

type PaymentMethod = 'efectivo' | 'nequi' | 'qr';
type DeliveryOption = 'store' | 'delivery' | 'dine-in';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  imports: [CommonModule, CurrencyPipe],
})
export class CartComponent {
  closeCart = output<void>();
  cartService = inject(CartService);

  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.totalPrice;
  
  selectedPaymentMethod = signal<PaymentMethod | null>(null);
  qrCodeUrl = signal<string | null>(null);
  processingOrder = signal(false);
  orderPlaced = signal(false);
  
  deliveryOption = signal<DeliveryOption>('dine-in');
  deliveryAddress = signal('');
  deliveryCustomerName = signal('');
  deliveryPhoneNumber = signal('');
  deliveryFee = computed(() => this.deliveryOption() === 'delivery' ? 5000 : 0);
  finalTotal = computed(() => this.subtotal() + this.deliveryFee());

  selectPaymentMethod(method: PaymentMethod) {
    this.selectedPaymentMethod.set(method);
    this.qrCodeUrl.set(null);
    if (method === 'qr' && this.finalTotal() > 0) {
      this.generateQrCode();
    }
  }
  
  setDeliveryOption(option: DeliveryOption) {
    this.deliveryOption.set(option);
  }

  onAddressChange(event: Event) {
    this.deliveryAddress.set((event.target as HTMLInputElement).value);
  }

  onCustomerNameChange(event: Event) {
    this.deliveryCustomerName.set((event.target as HTMLInputElement).value);
  }

  onPhoneNumberChange(event: Event) {
    this.deliveryPhoneNumber.set((event.target as HTMLInputElement).value);
  }

  generateQrCode() {
    const paymentInfo = `pago:GoFood,valor:${this.finalTotal()},ref:${Date.now()}`;
    const encodedData = encodeURIComponent(paymentInfo);
    this.qrCodeUrl.set(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`);
  }

  placeOrder() {
    if (!this.selectedPaymentMethod()) {
      alert('Por favor, seleccione un método de pago.');
      return;
    }
    if (this.deliveryOption() === 'delivery' && (this.deliveryAddress().trim() === '' || this.deliveryCustomerName().trim() === '' || this.deliveryPhoneNumber().trim() === '')) {
      alert('Por favor, complete todos los campos de entrega: nombre, teléfono y dirección.');
      return;
    }

    this.processingOrder.set(true);
    setTimeout(() => {
      this.processingOrder.set(false);
      this.orderPlaced.set(true);
      this.cartService.clearCart();
    }, 2000);
  }
  
  startNewOrder() {
    this.orderPlaced.set(false);
    this.deliveryOption.set('dine-in');
    this.deliveryAddress.set('');
    this.deliveryCustomerName.set('');
    this.deliveryPhoneNumber.set('');
    this.selectedPaymentMethod.set(null);
    this.closeCart.emit();
  }

  updateQuantity(productId: number, newQuantity: number) {
    this.cartService.updateQuantity(productId, newQuantity);
  }

  removeItem(productId: number) {
    this.cartService.removeFromCart(productId);
  }
}