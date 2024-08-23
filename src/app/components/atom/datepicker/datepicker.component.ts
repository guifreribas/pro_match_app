import { Component, forwardRef, LOCALE_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  MAT_DATE_FORMATS,
  DateAdapter,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
  MatMomentDateModule,
} from '@angular/material-moment-adapter';
import moment from 'moment';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatMomentDateModule,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
  template: `
    <div class="relative">
      <input
        matInput
        [matDatepicker]="picker"
        [formControl]="dateControl"
        placeholder="Selecciona una data"
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
      />
      <mat-datepicker-toggle
        matSuffix
        [for]="picker"
        class="absolute right-[2px] top-[1px]"
      ></mat-datepicker-toggle>
      <mat-datepicker #picker></mat-datepicker>
    </div>
  `,
})
export class DatepickerComponent implements ControlValueAccessor {
  dateControl = new FormControl();
  onChange: any = () => {};
  onTouch: any = () => {};

  private locale = inject(LOCALE_ID);
  private dateAdapter = inject(DateAdapter);

  constructor() {
    this.dateAdapter.setLocale(this.locale);

    this.dateControl.valueChanges.subscribe((value) => {
      if (value) {
        const formattedDate = this.formatDate(value);
        this.onChange(formattedDate);
      } else {
        this.onChange(null);
      }
      this.onTouch();
    });
  }

  writeValue(value: any): void {
    if (value) {
      console.log({ value });
      const date = this.parseDate(value);
      this.dateControl.setValue(date, { emitEvent: false });
    } else {
      this.dateControl.setValue(null, { emitEvent: false });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.dateControl.disable() : this.dateControl.enable();
  }

  private formatDate(date: moment.Moment): string {
    return date.format('YYYY/MM/DD');
  }

  private parseDate(dateString: string): moment.Moment | null {
    const parsed = moment(dateString, 'DD/MM/YYYY', true);
    return parsed.isValid() ? parsed : null;
  }
}
