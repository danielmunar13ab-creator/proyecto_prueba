import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  imports: [CommonModule, RouterLink],
})
export class HeaderComponent {
  toggleCart = output<void>();
  showLogin = output<void>();

  cartService = inject(CartService);
  authService = inject(AuthService);

  cartItemCount = this.cartService.totalItems;
  currentUser = this.authService.currentUser;

  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  closeMenu() {
    this.isMobileMenuOpen.set(false);
  }

  onLoginClicked() {
    this.showLogin.emit();
    this.closeMenu();
  }

  onLogoutClicked() {
    this.authService.logout();
    this.closeMenu();
  }
}