import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ValidationMessageService {

  public minLengthPassword = 6;

  validationMessages = {
    'email': {
      'required': this.required('Email'),
      'incorrectMailFormat': this.incorrectFormat('Email')
    },
    'nom': {
      'required': this.required('Nom')
    },
    'prenom': {
      'required': this.required('Prenom')
    },
    'numApp': {
      'required': this.required('Numéro appartement')
    },
    'password': {
      'required': this.required('Password'),
      'minlength': this.minLength('Password', this.minLengthPassword)
    },
    'confirmPassword': {
      'required': this.required('Confirm Password'),
      'notMatch': this.match('Confirm Password', 'Password')
    },
    'nomSujet': {
      'required': this.required('Nom du Sujet'),
    }
  };

  onValueChanged(currentForm: FormGroup, formErrors: any) {
    if (!currentForm) {
      return;
    }
    for (const field in formErrors) {
      if (formErrors.hasOwnProperty(field)) {
        // clear previous error messageService (if any)
        formErrors[field] = '';
        const control = currentForm.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              formErrors[field] += messages[key] + '\n';
            }
          }
        }
      }
    }
  }

  private minLength(field, minLength): string {
    return `The ${field} must be at least ${minLength} characters long.`;
  }

  private maxLength(field: string, maxLength: number): string {
    return `The ${field} cannot be more than ${maxLength} characters long.`;
  }

  private maxValue(field: string, maxValue: number) {
    return `The ${field} cannot be more than ${maxValue}.`;
  }

  private required(field: string): string {
    return `The ${field} is required.`;
  }

  private match(field1: string, field2: string) {
    return `${field1} doesn\'t match ${field2}.`;
  }

  private incorrectFormat(field: string) {
    return `The ${field} format is not correct.`
  }
}
