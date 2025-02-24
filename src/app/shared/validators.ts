import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MATCH_NON_DIGITS, MATCH_DIGITS_AND_DECIMAL } from './models';

export function nipNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const NipNumberError = control.value && !isValidNip(control.value);
    return NipNumberError ? { NipNumber: true } : null;
  };
}

function isValidNip(nip: string) {
  if (typeof nip !== 'string') return false;

  nip = nip.replace(/[\ \-]/gi, '');

  let weight = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  let controlNumber = parseInt(nip.substring(9, 10));
  let weightCount = weight.length;
  for (let i = 0; i < weightCount; i++) {
    sum += parseInt(nip.substr(i, 1)) * weight[i];
  }

  return sum % 11 === controlNumber;
}
