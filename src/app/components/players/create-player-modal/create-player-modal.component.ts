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
import { postOneResponse } from '@app/models/api';
import { Player, PlayerCreate, PlayerCreateResponse } from '@app/models/player';
import { Resource, ResourceCreateResponse } from '@app/models/resource';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { PlayerService } from '@app/services/api_services/player.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { initFlowbite, Datepicker, initDatepickers } from 'flowbite';
import { catchError, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-player-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-player-modal.component.html',
  styleUrl: './create-player-modal.component.scss',
})
export class CreatePlayerModalComponent implements AfterViewInit {
  @ViewChild('birthdayDatepicker', { static: true })
  birthdayDatepicker!: ElementRef;

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

  private _playerService = inject(PlayerService);
  private _resourceService = inject(ResourceService);
  private _genericService = inject(GenericApiService);
  private _avatar: File | null = null;

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

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();

    let player: Player = {
      ...this.playerForm.value,
      birthday: String(this.datepicker.getDate()),
    };
    // Afegeix la data de naixement
    // formData.append('birthday', String(this.datepicker.getDate()));
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      player.avatar = resource.data.name;
    }

    const playerCreateResponse = await this.createPlayer(player);
    console.log(playerCreateResponse);
  }

  async createPlayer(
    player: Player
  ): Promise<postOneResponse<PlayerCreateResponse>> {
    try {
      return firstValueFrom(
        this._genericService
          .create<Player, postOneResponse<PlayerCreateResponse>>(
            this._playerService.apiUrl,
            player
          )
          .pipe(
            catchError((err) => {
              console.log(err);
              throw err;
            })
          )
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async createResource(
    avatar: File,
    avatarName: string
  ): Promise<ResourceCreateResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', avatar, avatarName);
      this._resourceService.createResource(formData).subscribe({
        next: (res: ResourceCreateResponse) => resolve(res),
        error: (err) => {
          console.log(err);
          reject(err);
        },
      });
    });
  }

  onAvatarChange(e: any) {
    if (e?.target?.files) {
      const file: File = e.target.files[0];
      console.log(file);
      this._avatar = file;
    }
  }
}
