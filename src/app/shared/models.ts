﻿export interface Option {
  value: number;
  displayName: string;
}

export enum VatRatesEnum {
  NA = 'ZW',
  FIVE = '5%',
  EIGHT = '8%',
  SEVENTEEN = '17%',
  TWENTYTHREE = '23%',
}

export enum RowFieldTypes {
  VAT_RATE = 'vatRate',
  NET_AMOUNT = 'netAmount',
  VAT_AMOUNT = 'vatAmount',
  GROSS_AMOUNT = 'grossAmount',
}

export enum CurrencySymbolEnum {
  PLN = 'PLN',
  USD = 'USD',
  EUR = 'EUR',
}

export const VAT_RATES: Option[] = [
  {
    value: 0,
    displayName: VatRatesEnum.NA,
  },
  {
    value: 0.05,
    displayName: VatRatesEnum.FIVE,
  },
  {
    value: 0.08,
    displayName: VatRatesEnum.EIGHT,
  },
  {
    value: 0.17,
    displayName: VatRatesEnum.SEVENTEEN,
  },
  {
    value: 0.23,
    displayName: VatRatesEnum.TWENTYTHREE,
  },
];

export const MATCH_NON_DIGITS = /[^0-9]+/g;
export const MATCH_SPACES = /\s/g;
export const MATCH_DIGITS = /[0-9]/g;
export const MATCH_DIGITS_AND_DECIMAL = /^[1-9]\d*(\.\d+)?$/g;
export const MATCH_NON_DIGITS_AND_DOT = /[^.0-9]+/g;

export const NIP_EXAMPLE = '1181784140';
