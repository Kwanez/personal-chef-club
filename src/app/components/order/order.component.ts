import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { GoogleSheetsService } from '../../services/google-sheets.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  isSubmitting = false;
  formErrors: string[] = [];

  constructor(
    private fb: FormBuilder,
    private googleSheetsService: GoogleSheetsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private viewportScroller: ViewportScroller
  ) {
    this.orderForm = this.fb.group({
      personalInfo: this.fb.group({
        lastName: ['', [Validators.required]],
        firstName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]]
      }),
      address: this.fb.group({
        street: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
        city: ['', [Validators.required]]
      }),
      preferences: this.fb.group({
        budget: ['', [Validators.required]],
        deliveroo: [false],
        ubereats: [false],
        justeat: [false],
        otherDelivery: [false],
        restaurantFrequency: ['', [Validators.required]],
        favoriteFood: [[], [Validators.required]],
        discovery: ['', [Validators.required]],
        dietaryRestrictions: [[]],
        allergies: [''],
        cookingPreferences: [''],
        spiceLevel: ['']
      }),
      menuSelection: this.fb.group({
        monday: [false],
        tuesday: [false],
        wednesday: [false],
        thursday: [false],
        friday: [false],
        saturday: [false],
        sunday: [false]
      }),
      comments: ['']
    });
  }

  ngOnInit(): void {
    // Le formulaire est initialisé vide
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

  getFormValidationErrors(): string[] {
    const errors: string[] = [];
    const form = this.orderForm;

    // Validation des informations personnelles
    const personalInfo = form.get('personalInfo');
    if (personalInfo?.get('lastName')?.errors?.['required']) {
      errors.push('Last name is required');
    }
    if (personalInfo?.get('firstName')?.errors?.['required']) {
      errors.push('First name is required');
    }
    if (personalInfo?.get('email')?.errors?.['required']) {
      errors.push('Email is required');
    }
    if (personalInfo?.get('email')?.errors?.['email']) {
      errors.push('Email is not valid');
    }
    if (personalInfo?.get('phone')?.errors?.['required']) {
      errors.push('Phone number is required');
    }
    if (personalInfo?.get('phone')?.errors?.['pattern']) {
      errors.push('Phone number format is not valid');
    }

    // Validation de l'adresse
    const address = form.get('address');
    if (address?.get('street')?.errors?.['required']) {
      errors.push('Address is required');
    }
    if (address?.get('postalCode')?.errors?.['required']) {
      errors.push('Postal code is required');
    }
    if (address?.get('postalCode')?.errors?.['pattern']) {
      errors.push('Postal code must contain 5 digits');
    }
    if (address?.get('city')?.errors?.['required']) {
      errors.push('City is required');
    }

    // Validation des préférences
    const preferences = form.get('preferences');
    if (preferences?.get('budget')?.errors?.['required']) {
      errors.push('Budget is required');
    }
    if (preferences?.get('restaurantFrequency')?.errors?.['required']) {
      errors.push('Restaurant frequency is required');
    }
    if (preferences?.get('favoriteFood')?.errors?.['required']) {
      errors.push('Please select at least one preferred food type');
    }
    if (preferences?.get('discovery')?.errors?.['required']) {
      errors.push('Please indicate how you heard about our service');
    }

    // Validation de la sélection des menus
    const menuSelection = form.get('menuSelection');
    const hasSelectedDay = Object.values(menuSelection?.value || {}).some((value: unknown) => value === true);
    if (!hasSelectedDay) {
      errors.push('Please select at least one delivery day');
    }

    return errors;
  }

  onSubmit(): void {
    this.formErrors = this.getFormValidationErrors();
    
    if (this.formErrors.length > 0) {
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
        const joursSelectionnes = Object.entries(formData.menuSelection)
          .filter(([_, value]) => value)
          .map(([jour]) => jour)
          .join(', ');

        const rowData = [
          new Date().toLocaleString('fr-FR'),
          // Informations personnelles
          formData.personalInfo.lastName,
          formData.personalInfo.firstName,
          formData.personalInfo.email,
          formData.personalInfo.phone,
          // Adresse
          formData.address.street,
          formData.address.postalCode,
          formData.address.city,
          // Préférences
          formData.preferences.budget,
          formData.preferences.deliveroo ? 'Oui' : 'Non',
          formData.preferences.ubereats ? 'Oui' : 'Non',
          formData.preferences.justeat ? 'Oui' : 'Non',
          formData.preferences.otherDelivery ? 'Oui' : 'Non',
          formData.preferences.restaurantFrequency,
          formData.preferences.favoriteFood.join(', '),
          formData.preferences.discovery,
          formData.preferences.dietaryRestrictions?.join(', ') || '',
          formData.preferences.allergies || '',
          formData.preferences.cookingPreferences || '',
          formData.preferences.spiceLevel || '',
          // Sélection des menus
          joursSelectionnes,
          // Commentaires
          formData.comments
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
                personalInfo: {
                  lastName: '',
                  firstName: '',
                  email: '',
                  phone: ''
                },
                address: {
                  street: '',
                  postalCode: '',
                  city: ''
                },
                preferences: {
                  budget: '',
                  deliveroo: false,
                  ubereats: false,
                  justeat: false,
                  otherDelivery: false,
                  restaurantFrequency: '',
                  favoriteFood: [],
                  discovery: '',
                  dietaryRestrictions: [],
                  allergies: '',
                  cookingPreferences: '',
                  spiceLevel: ''
                },
                menuSelection: {
                  monday: false,
                  tuesday: false,
                  wednesday: false,
                  thursday: false,
                  friday: false,
                  saturday: false,
                  sunday: false
                },
                comments: ''
              });
              Swal.fire({
                title: 'Success!',
                text: 'Your order has been successfully registered.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#002395',
                customClass: {
                  confirmButton: 'swal2-confirm-button'
                }
              }).then(() => {
                this.router.navigate(['/']).then(() => {
                  this.viewportScroller.scrollToPosition([0, 0]);
                });
              });
            },
            error: (error) => {
              console.error('Error during registration:', error);
              Swal.fire({
                title: 'Error',
                text: 'An error occurred while registering your order. Please try again.',
                icon: 'error',
                confirmButtonText: 'Close',
                confirmButtonColor: '#b8621b'
              });
            }
          });
      } catch (error) {
        this.isSubmitting = false;
        this.cdr.detectChanges();
        console.error('Error while preparing data:', error);
        Swal.fire({
          title: 'Error',
          text: 'An error occurred while preparing your order. Please try again.',
          icon: 'error',
          confirmButtonText: 'Close',
          confirmButtonColor: '#b8621b'
        });
      }
    }
  }

  get favoriteFoodControl(): FormControl {
    return this.orderForm.get('preferences.favoriteFood') as FormControl;
  }
} 