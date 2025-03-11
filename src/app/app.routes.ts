import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { OrderComponent } from './components/order/order.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'commander', component: OrderComponent },
  { path: '**', redirectTo: '' }
];
