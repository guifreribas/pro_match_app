import {
  Component,
  forwardRef,
  LOCALE_ID,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
  FormGroup,
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
  templateUrl: './datepicker.component.html',
  // template: `
  //   <div class="relative">
  //     <input
  //       matInput
  //       [matDatepicker]="picker"
  //       [formControl]="dateControl"
  //       placeholder="Selecciona una data"
  //       class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-700 focus:border-primary-700 block w-full p-2.5"
  //     />
  //     <mat-datepicker-toggle
  //       matSuffix
  //       [for]="picker"
  //       class="absolute right-[2px] top-[1px]"
  //     ></mat-datepicker-toggle>
  //     <mat-datepicker #picker></mat-datepicker>
  //   </div>
  // `,
})
export class DatepickerComponent implements ControlValueAccessor, OnChanges {
  @Input() minDate?: Date;
  @Input() maxDate?: Date;
  @Input() classesFromParent: { [Key: string]: boolean } = {};
  @Output() dateChange = new EventEmitter<any>();
  dateControl = new FormControl();
  onChange: any = () => {};
  onTouch: any = () => {};

  private locale = inject(LOCALE_ID);
  private dateAdapter = inject(DateAdapter);

  constructor() {
    // this.minDate = new Date(2024, 0, 1);
    // this.maxDate = new Date(2024, 11, 31);

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classesFromParent']) {
      this.applyClasses();
    }
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

  onDateInput(event: any) {
    const value = event.value;
    this.onChange(this.formatDate(value));
    this.onTouch();
    this.dateChange.emit({ value: this.formatDate(value) });
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

  private applyClasses() {
    const inputElement = document.querySelector(
      'input[matInput]'
    ) as HTMLElement;
    if (inputElement) {
      Object.keys(this.classesFromParent).forEach((className) => {
        inputElement.classList.toggle(
          className,
          this.classesFromParent[className]
        );
      });
    }
  }
}
