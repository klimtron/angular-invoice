import { PipeTransform, Pipe } from '@angular/core';
import { MATCH_DIGITS_AND_DECIMAL } from './models';

@Pipe({ name: 'removeNonDigitsAndDecimal' })
export class ReplacePipe implements PipeTransform {
  MATCH_NON_DIGITS = /[^0-9]+/g;
  transform(value: string) {
    console.log('rep', value?.toString().replace(RegExp(/[^0-9]+/g), ''));
  }
}
