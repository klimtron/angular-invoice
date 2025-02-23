import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDatepickerModule,
  MatDateSelectionModel,
} from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
// import { MomentDateAdapter } from '@angular/materioal;
// import { MatMomentDateModule } from '@ngular/material/MatMomentDateModule';
import { DATE_FORMATS } from './shared/models';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    // MatMomentDateModule,
  ],
  providers: [
    MatDatepickerModule,
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-IN',
      // provide: DateAdapter,
      // useClass: MomentDateAdapter,
      // deps: { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
    },
    // { provide: MAT_DATE_FORMATS, useValue: DATE_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
