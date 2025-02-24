import { Component, ElementRef, OnInit } from '@angular/core';
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
  NIP_EXAMPLE,
} from './shared/models';
import { decimalValidator, nipNumberValidator } from './shared/validators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  formId: string = '';
  netAmountSum: number = 0;
  vatAmountSum: number = 0;
  grossAmountSum: number = 0;
  VAT_RATES = VAT_RATES;
  RowFieldTypes = RowFieldTypes;
  CurrencySymbolEnum = CurrencySymbolEnum;
  CurrencySymbolEnumKeys: string[] = [];
  customValidatorMessages: { [key: string]: string } = {};

  invoiceForm: FormGroup = new FormGroup({
    id: new FormControl<string | null>(''),
    nipNumber: new FormControl<string | null>(NIP_EXAMPLE, [
      Validators.required,
      nipNumberValidator(),
    ]),
    currency: new FormControl(
      { value: CurrencySymbolEnum.PLN, disabled: false },
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
          // decimalValidator() <<--------- chce tu dac ten validator!!!
        ),
        vatAmount: new FormControl(
          { value: '', disabled: true },
          Validators.required
          // decimalValidator() <<--------- chce tu dac ten validator!!!
        ),
        grossAmount: new FormControl(
          { value: '', disabled: true },
          Validators.required
          // decimalValidator() <<--------- chce tu dac ten validator!!!
        ),
      }),
    ]),
    invoiceIssueDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
    invoiceDeliveryDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
    invoicePaymentDate: new FormControl(
      { value: '', disabled: false },
      Validators.required
    ),
  });

  ngOnInit(): void {
    document.documentElement.setAttribute('theme', 'light');
    this.invoiceForm.get('id')?.patchValue(new Date().getTime().toString());
    this.CurrencySymbolEnumKeys = Object.keys(this.CurrencySymbolEnum);
  }

  get lightTheme(): boolean {
    return document.documentElement.getAttribute('theme') === 'light';
  }

  toggleTheme() {
    if (this.lightTheme) {
      document.documentElement.setAttribute('theme', null!);
    } else {
      document.documentElement.setAttribute('theme', 'light');
    }
  }
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

  deleteInvoiceRow(i: number, row: AbstractControl) {
    this.invoiceAmountRows.removeAt(i);
    this.calculateSummaryAmount();
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

    this.calculateSummaryAmount();

    // console.log('invoiceForm', this.invoiceForm.get('amountRows')?.value);
  }

  calculateSummaryAmount() {
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
    const NET_AMOUNT_VALUE: number = parseFloat(row.get('netAmount')?.value);
    const UPDATED_VAT_AMOUNT: number = parseFloat(
      (row.get('vatRate')?.value * NET_AMOUNT_VALUE).toFixed(2)
    );
    const UPDATED_GROSS_AMOUNT = parseFloat(
      (UPDATED_VAT_AMOUNT + NET_AMOUNT_VALUE).toFixed(2)
    );

    if (NET_AMOUNT_VALUE) {
      row.get('netAmount')?.patchValue(NET_AMOUNT_VALUE);
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

  validateTotalGrossAmount(): boolean {
    if (
      (this.grossAmountSum > 4000 &&
        this.invoiceForm.get('currency')?.value === CurrencySymbolEnum.PLN) ||
      (this.grossAmountSum > 1000 &&
        this.invoiceForm.get('currency')?.value === CurrencySymbolEnum.USD) ||
      (this.grossAmountSum > 1000 &&
        this.invoiceForm.get('currency')?.value === CurrencySymbolEnum.EUR)
    ) {
      return true;
    }
    return false;
  }

  deleteForm() {
    this.invoiceForm.markAsPristine();
    this.invoiceForm.markAsUntouched();
    this.invoiceForm.reset(this.invoiceForm.value);
  }

  saveForm() {}
}
