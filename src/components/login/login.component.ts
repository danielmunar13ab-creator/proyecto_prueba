import { Component, ChangeDetectionStrategy, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginComponent {
  closeLogin = output<void>();
  authService = inject(AuthService);
  private fb: FormBuilder = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['admin@gofood.com', [Validators.required, Validators.email]],
    password: ['admin123', Validators.required],
  });

  loginState = signal<'idle' | 'loading' | 'error'>('idle');
  errorMessage = signal('');

  async onLogin() {
    if (this.loginForm.invalid) {
      return;
    }
    this.loginState.set('loading');
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email!, password!);
      this.loginState.set('idle');
      this.closeLogin.emit();
    } catch (error: any) {
      this.loginState.set('error');
      this.errorMessage.set(error.message);
    }
  }
}