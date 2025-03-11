import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GoogleSheetsService } from '../../services/google-sheets.service';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  orderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private googleSheetsService: GoogleSheetsService
  ) {
    this.orderForm = this.fb.group({
      nom: ['Dupont', [Validators.required]],
      prenom: ['Jean', [Validators.required]],
      email: ['jean.dupont@example.com', [Validators.required, Validators.email]],
      telephone: ['06 12 34 56 78', [Validators.required]],
      adresse: ['123 rue de la Paix', [Validators.required]],
      codePostal: ['75001', [Validators.required]],
      ville: ['Paris', [Validators.required]],
      commentaires: ['Pas d\'allergies particulières'],
      menus: this.fb.group({
        lundi: [true],
        mardi: [true],
        mercredi: [false],
        jeudi: [true],
        vendredi: [false]
      })
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.saveToGoogleSheets();
    }
  }

  private saveToGoogleSheets() {
    try {
      const formData = this.orderForm.value;
      const joursSelectionnes = Object.entries(formData.menus)
        .filter(([_, value]) => value)
        .map(([jour]) => jour)
        .join(', ');

      const rowData = [
        new Date().toLocaleString('fr-FR'),
        formData.nom,
        formData.prenom,
        formData.email,
        formData.telephone,
        formData.adresse,
        formData.codePostal,
        formData.ville,
        joursSelectionnes,
        formData.commentaires
      ];

      this.googleSheetsService.appendRow(rowData).subscribe({
        next: () => {
          this.orderForm.reset();
          alert('Votre commande a été enregistrée avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de l\'enregistrement:', error);
          alert('Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez réessayer.');
        }
      });
    } catch (error) {
      console.error('Erreur lors de la préparation des données:', error);
      alert('Une erreur est survenue lors de la préparation de votre commande. Veuillez réessayer.');
    }
  }
} 