import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Mock users database
  private mockUsers = signal<(User & { password_hardcoded: string })[]>([
    { id: 1, name: 'Admin User', email: 'admin@gofood.com', role: 'administrador', password_hardcoded: 'admin123' },
    { id: 2, name: 'Cajero User', email: 'cajero@gofood.com', role: 'cajero', password_hardcoded: 'cajero123' },
    { id: 3, name: 'Mesero User', email: 'mesero@gofood.com', role: 'mesero', password_hardcoded: 'mesero123' },
    { id: 4, name: 'Domiciliario User', email: 'domiciliario@gofood.com', role: 'domiciliario', password_hardcoded: 'domiciliario123' },
    { id: 5, name: 'Cocinero User', email: 'cocinero@gofood.com', role: 'cocinero', password_hardcoded: 'cocinero123' },
    { id: 6, name: 'Mesero Dos', email: 'mesero2@gofood.com', role: 'mesero', password_hardcoded: 'mesero123' },
  ]);

  currentUser = signal<User | null>(null);
  isLoggedIn = computed(() => !!this.currentUser());

  getUsers(): User[] {
     return this.mockUsers().map(u => {
      const { password_hardcoded, ...user } = u;
      return user;
    });
  }
  
  deleteUser(userId: number) {
    this.mockUsers.update(users => users.filter(u => u.id !== userId));
  }

  login(email: string, password_hardcoded: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.mockUsers().find(u => u.email === email && u.password_hardcoded === password_hardcoded);
        if (user) {
          const { password_hardcoded, ...userWithoutPassword } = user;
          this.currentUser.set(userWithoutPassword);
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Credenciales incorrectas'));
        }
      }, 1000);
    });
  }

  logout() {
    this.currentUser.set(null);
  }
}