import { CommonModule, FormatWidth } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PlayerService } from '@app/services/api_services/player.service';
import { initFlowbite, Datepicker, initDatepickers } from 'flowbite';

@Component({
  selector: 'app-create-player-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-player-modal.component.html',
  styleUrl: './create-player-modal.component.scss',
})
export class CreatePlayerModalComponent implements AfterViewInit {
  public playerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    dni: new FormControl('', [Validators.required]),
    avatar: new FormControl('', []),
    birthday: new FormControl('', [Validators.required]),
  });
  public isSubmitted = false;
  public emailTouched = false;
  public datepicker!: Datepicker;
  @ViewChild('birthdayDatepicker', { static: true })
  birthdayDatepicker!: ElementRef;
  private playerService = inject(PlayerService);

  constructor() {}

  ngAfterViewInit(): void {
    this.initDatePicker();
  }

  initDatePicker() {
    const datepickerEl = this.birthdayDatepicker.nativeElement;
    if (datepickerEl) {
      this.datepicker = new Datepicker(datepickerEl, {
        format: 'yyyy-mm-dd',
        autohide: true,
        maxDate: String(new Date()),
        buttons: true,
      });
    }
    console.log('Datepicker initialized:', this.datepicker);
  }

  onSubmit(e: SubmitEvent) {
    e.preventDefault();
    console.log(this.playerForm.value);
    console.log(this.datepicker);
    console.log(this.datepicker.getDate());
    const player = {
      ...this.playerForm.value,
      birthday: String(this.datepicker.getDate()),
    };
    console.log(player);
    this.playerService.createPlayer(player).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onBirthdayChange(e: Event) {
    console.log(e);
    console.log(this.datepicker.getDate());
  }
}
