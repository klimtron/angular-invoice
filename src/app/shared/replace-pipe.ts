import { PipeTransform, Pipe } from '@angular/core';
import { MATCH_NON_DIGITS_AND_DOT } from './models';

@Pipe({ name: 'removeNonDigitsAndDecimal' })
export class ReplacePipe implements PipeTransform {
  transform(value: string) {
    return value?.toString().replace(RegExp(MATCH_NON_DIGITS_AND_DOT), '');
  }
}
