import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ReservationsComponent } from './components/reservations/reservations.component';
import { NosotrosComponent } from './components/nosotros/nosotros.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'GoFood - Inicio' },
  { path: 'reservations', component: ReservationsComponent, title: 'GoFood - Reservas' },
  { path: 'nosotros', component: NosotrosComponent, title: 'GoFood - Nosotros' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
