import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  orderForm: FormGroup;
  private readonly EXCEL_FILE = 'commandes.xlsx';

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      codePostal: ['', [Validators.required]],
      ville: ['', [Validators.required]],
      commentaires: [''],
      menus: this.fb.group({
        lundi: [false],
        mardi: [false],
        mercredi: [false],
        jeudi: [false],
        vendredi: [false]
      })
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.saveToExcel();
    }
  }

  private saveToExcel() {
    try {
      // Récupérer les données existantes ou créer un nouveau tableau
      let existingData: any[] = [];
      try {
        const existingWorkbook = XLSX.readFile(this.EXCEL_FILE);
        existingData = XLSX.utils.sheet_to_json(existingWorkbook.Sheets[existingWorkbook.SheetNames[0]]);
      } catch (error) {
        console.log('Création d\'un nouveau fichier Excel');
      }

      // Préparer les données de la nouvelle commande
      const formData = this.orderForm.value;
      const joursSelectionnes = Object.entries(formData.menus)
        .filter(([_, value]) => value)
        .map(([jour]) => jour)
        .join(', ');

      const newOrder = {
        date_commande: new Date().toLocaleString('fr-FR'),
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse,
        code_postal: formData.codePostal,
        ville: formData.ville,
        jours_selectionnes: joursSelectionnes,
        commentaires: formData.commentaires
      };

      // Ajouter la nouvelle commande aux données existantes
      existingData.push(newOrder);

      // Créer un nouveau workbook
      const worksheet = XLSX.utils.json_to_sheet(existingData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Commandes');

      // Sauvegarder le fichier
      XLSX.writeFile(workbook, this.EXCEL_FILE);

      // Réinitialiser le formulaire et afficher un message de succès
      this.orderForm.reset();
      alert('Votre commande a été enregistrée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez réessayer.');
    }
  }
} 