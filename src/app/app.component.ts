import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { nipNumberValidator } from './shared/validators';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ReplacePipe } from './shared/replace-pipe';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(liveAnnouncer: LiveAnnouncer, private replacePipe: ReplacePipe) {
    liveAnnouncer.announce('Witaj w aplikacji do wypełniania faktur'); //WCAG LiveAnnouncer is used to announce messages for screen-reader users using an aria-live region.
  }
  netAmountSum: number = 0;
  vatAmountSum: number = 0;
  grossAmountSum: number = 0;
  RowFieldTypes = RowFieldTypes;
  CurrencySymbolEnum = CurrencySymbolEnum;
  CurrencySymbolEnumKeys: string[] = [];
  VAT_RATES = VAT_RATES;

  @ViewChild('netInput') netInput!: ElementRef<HTMLInputElement>;

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
        netAmount: new FormControl<string | null>(
          { value: null, disabled: true },
          [Validators.required]
        ),
        vatAmount: new FormControl<string | null>(
          { value: null, disabled: true },
          [Validators.required]
        ),
        grossAmount: new FormControl<string | null>(
          { value: null, disabled: true },
          [Validators.required]
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

  deleteInvoiceRow(i: number) {
    this.invoiceAmountRows.removeAt(i);
    this.calculateSummaryAmount();
  }

  get invoiceAmountRows() {
    return this.invoiceForm.get('amountRows') as FormArray;
  }

  onRowChanges(fieldType: RowFieldTypes, row: AbstractControl, $event?: Event) {
    this.replaceNonNumberValues(row);

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
  }

  replaceNonNumberValues(row: AbstractControl) {
    row
      .get('netAmount')
      ?.patchValue(this.replacePipe.transform(row.get('netAmount')?.value));

    row
      .get('vatAmount')
      ?.patchValue(this.replacePipe.transform(row.get('vatAmount')?.value));

    row
      .get('grossAmount')
      ?.patchValue(this.replacePipe.transform(row.get('grossAmount')?.value));
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

  loadState() {
    const FORM_VALUE: string = JSON.parse(
      localStorage.getItem('form-data') || '{}'
    );
    if (FORM_VALUE) {
      this.invoiceForm.patchValue(JSON.parse(JSON.stringify(FORM_VALUE)));
      this.invoiceAmountRows.controls.forEach((row, i) => {
        if (row.valid) this.enableRowAmounts(row);
      });
      this.calculateSummaryAmount();
    }
  }

  resetForm() {
    this.invoiceForm.reset(this.invoiceForm);
    this.invoiceForm.markAsPristine();
    this.invoiceForm.markAsUntouched();
    this.calculateSummaryAmount();
  }

  saveForm() {
    localStorage.setItem('form-data', JSON.stringify(this.invoiceForm.value));
  }
}
