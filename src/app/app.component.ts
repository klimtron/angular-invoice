import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import {
  VAT_RATES,
  CurrencySymbolEnum,
  RowFieldTypes,
  DIGIT_REGEX,
} from './shared/models';
import { nipNumberValidator } from './shared/validators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  netAmountSum: number = 0;
  vatAmountSum: number = 0;
  grossAmountSum: number = 0;
  VAT_RATES = VAT_RATES;
  RowFieldTypes = RowFieldTypes;
  CurrencySymbolEnum = CurrencySymbolEnum;
  CurrencySymbolEnumKeys: string[] = [];
  DIGIT_REGEX = DIGIT_REGEX;
  customValidatorMessages: { [key: string]: string } = {};

  invoiceForm: FormGroup = new FormGroup({
    // nip: new FormControl(
    //   { value: '', disabled: false },
    //   Validators.required,
    //   nipNumberValidator()
    // ),
    nipNumber: new FormControl<number | null>(null, [
      Validators.required,
      nipNumberValidator(),
    ]),
    currency: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
    amountRows: new FormArray([
      new FormGroup({
        vatRate: new FormControl(
          { value: '', disabled: false },
          Validators.required
        ),
        netAmount: new FormControl(
          { value: '', disabled: true },
          Validators.required
        ),
        vatAmount: new FormControl(
          { value: '', disabled: true },
          Validators.required
        ),
        grossAmount: new FormControl(
          { value: '', disabled: true },
          Validators.required
        ),
      }),
    ]),
    invoiceIssueDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
    invoiceDeliverDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
    invoicePaymentDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
  });

  ngOnInit(): void {
    this.CurrencySymbolEnumKeys = Object.keys(this.CurrencySymbolEnum);
  }

  // get nip() {
  //   return this.invoiceForm.get('nip');
  // }

  addInvoiceRow() {
    const newInvoiceRow = new FormGroup({
      vatRate: new FormControl(
        { value: '', disabled: false },
        Validators.required
      ),
      netAmount: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      vatAmount: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
      grossAmount: new FormControl(
        { value: '', disabled: true },
        Validators.required
      ),
    });
    this.invoiceAmountRows.push(newInvoiceRow);
  }

  deleteInvoiceRow(i: number) {
    this.invoiceAmountRows.removeAt(i);
  }

  get invoiceAmountRows() {
    return this.invoiceForm.get('amountRows') as FormArray;
  }

  onRowChanges(fieldType: RowFieldTypes, row: AbstractControl) {
    if (fieldType === RowFieldTypes.VAT_RATE) {
      this.enableRowAmounts(row);
      this.updateVatRateOrNetAmount(row);
    }
    if (fieldType === RowFieldTypes.NET_AMOUNT) {
      this.updateVatRateOrNetAmount(row);
    } else if (fieldType === RowFieldTypes.GROSS_AMOUNT) {
      this.updateGrossAmount(row);
    } else if (fieldType === RowFieldTypes.VAT_AMOUNT) {
      this.updateVatAmount(row);
    }

    this.netAmountSum = this.invoiceAmountRows.controls
      .map((item) => item.get('netAmount')?.value)
      .reduce((acc, item) => acc + Number(item), 0);
    this.vatAmountSum = this.invoiceAmountRows.controls
      .map((item) => item.get('vatAmount')?.value)
      .reduce((acc, item) => acc + Number(item), 0);
    this.grossAmountSum = this.invoiceAmountRows.controls
      .map((item) => item.get('grossAmount')?.value)
      .reduce((acc, item) => acc + Number(item), 0);
  }

  updateVatRateOrNetAmount(row: AbstractControl) {
    const NET_AMOUNT_VALUE: number = parseInt(row.get('netAmount')?.value);
    const UPDATED_VAT_AMOUNT: number = parseFloat(
      (row.get('vatRate')?.value * NET_AMOUNT_VALUE).toFixed(2)
    );
    const UPDATED_GROSS_AMOUNT = parseFloat(
      (UPDATED_VAT_AMOUNT + NET_AMOUNT_VALUE).toFixed(2)
    );

    if (NET_AMOUNT_VALUE) {
      row.get('vatAmount')?.patchValue(UPDATED_VAT_AMOUNT);
      row.get('grossAmount')?.patchValue(UPDATED_GROSS_AMOUNT);
    } else {
      row.get('vatAmount')?.patchValue('');
      row.get('grossAmount')?.patchValue('');
    }
  }

  updateGrossAmount(row: AbstractControl) {
    const GROSS_AMOUNT: number = parseInt(row.get('grossAmount')?.value);
    const CALCULATE_VAT_RATE: number = row.get('vatRate')?.value;
    const UPDATED_NET_AMOUNT = this.calculateNetAmount(
      GROSS_AMOUNT,
      CALCULATE_VAT_RATE
    );
    if (GROSS_AMOUNT && UPDATED_NET_AMOUNT) {
      const UPDATED_VAT_AMOUNT = GROSS_AMOUNT - UPDATED_NET_AMOUNT;
      row.get('vatAmount')?.patchValue(UPDATED_VAT_AMOUNT.toFixed(2));
      row.get('netAmount')?.patchValue(UPDATED_NET_AMOUNT.toFixed(2));
    }
  }

  enableRowAmounts(row: AbstractControl) {
    row.get('netAmount')?.enable();
    row.get('vatAmount')?.enable();
    row.get('grossAmount')?.enable();
  }

  validateRowAmounts(row: AbstractControl): boolean {
    if (
      parseInt(row.get('vatAmount')?.value) +
        parseInt(row.get('netAmount')?.value) ===
      parseInt(row.get('grossAmount')?.value)
    ) {
      return true;
    }
    return false;
  }

  checkIfAmountsFilled(row: AbstractControl) {
    if (
      row.get('vatRate')?.value &&
      row.get('vatAmount')?.value &&
      row.get('netAmount')?.value &&
      row.get('grossAmount')?.value
    ) {
      return true;
    }
    return false;
  }

  updateVatAmount(row: AbstractControl) {
    const VAT_AMOUNT: number = row.get('vatAmount')?.value;
    const VAT_RATE: number = row.get('vatRate')?.value;
    if (VAT_AMOUNT && VAT_RATE) {
      const NET_AMOUNT = this.calculateNetAmountFromVat(VAT_AMOUNT, VAT_RATE);
      const GROSS_AMOUNT = this.calculateGrossAmountFromNet(
        NET_AMOUNT,
        VAT_RATE
      );
      row.get('grossAmount')?.patchValue(GROSS_AMOUNT);
      row.get('netAmount')?.patchValue(NET_AMOUNT);
    }
  }

  calculateNetAmount(grossAmount: number, vatRate: number): number {
    return parseFloat((grossAmount / (1 + vatRate)).toFixed(2));
  }

  calculateNetAmountFromVat(vatAmount: number, vatRate: number): number {
    return parseFloat((vatAmount / vatRate).toFixed(2));
  }

  calculateGrossAmountFromNet(netAmount: number, vatRate: number): number {
    return parseFloat((netAmount * (1 + vatRate)).toFixed(2));
  }

  deleteForm() {}

  saveForm() {}

  // public checkError = (controlName: string, errorName: string) => {
  //   return this.invoiceForm.controls[controlName].hasError(errorName);
  // };

  // getNipError() {
  //   if (this.email.hasError('email')) {
  //     return 'Please enter a valid email address.';
  //   }
  //   if (this.email.hasError('required')) {
  //     return 'An Email is required.';
  //   }
  // }
}
