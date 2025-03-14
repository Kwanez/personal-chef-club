import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Menu } from '../../models/menu.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  menus = signal<Menu[]>([
    {
      id: 1,
      nom: 'Supreme Chicken with Herbs',
      description: 'Farm chicken cooked sous vide, served with seasonal vegetables and fresh herb sauce',
      prix: 18.50,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
      jourDeLaSemaine: 'Monday',
      ingredients: ['Farm chicken', 'Fresh herbs', 'Seasonal vegetables', 'Potatoes'],
      allergenes: ['Lactose']
    },
    {
      id: 2,
      nom: 'Salmon Steak Asian Style',
      description: 'Fresh salmon marinated in soy-ginger sauce, served with basmati rice and crunchy vegetables',
      prix: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop',
      jourDeLaSemaine: 'Tuesday',
      ingredients: ['Fresh salmon', 'Soy sauce', 'Ginger', 'Basmati rice', 'Asian vegetables'],
      allergenes: ['Fish', 'Soy']
    }
  ]);
} 