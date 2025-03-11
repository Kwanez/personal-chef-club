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
      nom: 'Suprême de Volaille aux Herbes',
      description: 'Poulet fermier cuit sous vide, accompagné de légumes de saison et sauce aux herbes fraîches',
      prix: 18.50,
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop',
      jourDeLaSemaine: 'Lundi',
      ingredients: ['Poulet fermier', 'Herbes fraîches', 'Légumes de saison', 'Pommes de terre'],
      allergenes: ['Lactose']
    },
    {
      id: 2,
      nom: 'Pavé de Saumon à l\'Asiatique',
      description: 'Saumon frais mariné sauce soja-gingembre, riz basmati et légumes croquants',
      prix: 22.00,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop',
      jourDeLaSemaine: 'Mardi',
      ingredients: ['Saumon frais', 'Sauce soja', 'Gingembre', 'Riz basmati', 'Légumes asiatiques'],
      allergenes: ['Poisson', 'Soja']
    }
  ]);
} 