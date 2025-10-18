import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CartComponent } from './components/cart/cart.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { LoginComponent } from './components/login/login.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { UiService } from './services/ui.service';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CashierDashboardComponent } from './components/cashier-dashboard/cashier-dashboard.component';
import { WaiterDashboardComponent } from './components/waiter-dashboard/waiter-dashboard.component';
import { DeliveryDashboardComponent } from './components/delivery-dashboard/delivery-dashboard.component';
import { CookDashboardComponent } from './components/cook-dashboard/cook-dashboard.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [
    CommonModule, 
    RouterOutlet,
    HeaderComponent, 
    CartComponent, 
    ReservationsComponent, 
    LoginComponent,
    ProductDetailComponent,
    FooterComponent,
    AdminDashboardComponent,
    CashierDashboardComponent,
    WaiterDashboardComponent,
    DeliveryDashboardComponent,
    CookDashboardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  isCartVisible = signal(false);
  isLoginVisible = signal(false);
  selectedProduct = this.uiService.selectedProduct;

  currentUser = this.authService.currentUser;

  handleToggleCart() {
    this.isCartVisible.update(visible => !visible);
  }

  handleShowLogin() {
    this.isLoginVisible.set(true);
  }

  handleCloseLogin() {
    this.isLoginVisible.set(false);
  }

  handleCloseDetail() {
    this.uiService.clearSelectedProduct();
  }
}