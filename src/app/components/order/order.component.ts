import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent {
  orderForm: FormGroup;
  isSubmitting = false;
  formErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private googleSheetsService: GoogleSheetsService,
    private cdr: ChangeDetectorRef
  ) {
    this.orderForm = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, this.phoneNumberValidator()]],
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

  phoneNumberValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const phoneNumber = control.value;
      
      if (!phoneNumber) {
        return null;
      }

      // Cette regex accepte les formats suivants :
      // +1234567890 - Format international avec +
      // 001234567890 - Format international avec 00
      // 1234567890 - Format local
      // Elle accepte aussi les espaces, tirets et parenthèses
      const phoneRegex = /^(?:(?:\+|00)(?:[1-9]\d{0,3})|0)\s*(?:[.-]?\s*\d){6,14}$/;

      if (!phoneRegex.test(phoneNumber.replace(/[\s()\-]/g, ''))) {
        return { invalidPhone: true };
      }

      return null;
    };
  }

  private getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const controls = this.orderForm.controls;

    if (controls['nom'].errors?.['required']) {
      errors.push('Le nom est requis');
    }
    if (controls['prenom'].errors?.['required']) {
      errors.push('Le prénom est requis');
    }
    if (controls['email'].errors?.['required']) {
      errors.push('L\'email est requis');
    } else if (controls['email'].errors?.['email']) {
      errors.push('L\'email n\'est pas valide');
    }
    if (controls['telephone'].errors?.['required']) {
      errors.push('Le téléphone est requis');
    } else if (controls['telephone'].errors?.['invalidPhone']) {
      errors.push('Le format du numéro de téléphone n\'est pas valide');
    }
    if (controls['adresse'].errors?.['required']) {
      errors.push('L\'adresse est requise');
    }
    if (controls['codePostal'].errors?.['required']) {
      errors.push('Le code postal est requis');
    }
    if (controls['ville'].errors?.['required']) {
      errors.push('La ville est requise');
    }

    return errors;
  }

  onSubmit(): void {
    this.formErrors = this.getFormValidationErrors();
    
    if (this.formErrors.length > 0) {
      // Scroll jusqu'aux erreurs avec une animation douce
      setTimeout(() => {
        const errorsSummary = document.querySelector('.form-errors-summary');
        if (errorsSummary) {
          errorsSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }
    
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      this.cdr.detectChanges();
      
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

        this.googleSheetsService.appendRow(rowData)
          .pipe(
            finalize(() => {
              this.isSubmitting = false;
              this.cdr.detectChanges();
            })
          )
          .subscribe({
            next: () => {
              this.orderForm.reset({
                nom: '',
                prenom: '',
                email: '',
                telephone: '',
                adresse: '',
                codePostal: '',
                ville: '',
                commentaires: '',
                menus: {
                  lundi: false,
                  mardi: false,
                  mercredi: false,
                  jeudi: false,
                  vendredi: false
                }
              });
              Swal.fire({
                title: 'Commande validée !',
                text: 'Votre commande a été enregistrée avec succès.',
                icon: 'success',
                confirmButtonText: 'Fermer',
                confirmButtonColor: '#b8621b'
              });
            },
            error: (error) => {
              console.error('Erreur lors de l\'enregistrement:', error);
              Swal.fire({
                title: 'Erreur',
                text: 'Une erreur est survenue lors de l\'enregistrement de votre commande. Veuillez réessayer.',
                icon: 'error',
                confirmButtonText: 'Fermer',
                confirmButtonColor: '#b8621b'
              });
            }
          });
      } catch (error) {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Erreur lors de la préparation des données:', error);
        Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la préparation de votre commande. Veuillez réessayer.',
          icon: 'error',
          confirmButtonText: 'Fermer',
          confirmButtonColor: '#b8621b'
        });
      }
    }
  }
} 