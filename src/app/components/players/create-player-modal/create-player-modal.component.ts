import { CommonModule } from '@angular/common';
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
import { RouterModule } from '@angular/router';
import { postOneResponse } from '@app/models/api';
import { Player, PlayerCreateResponse } from '@app/models/player';
import { ResourceCreateResponse } from '@app/models/resource';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { PlayerService } from '@app/services/api_services/player.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { Datepicker, initDatepickers } from 'flowbite';
import { catchError, firstValueFrom } from 'rxjs';
import { signal } from '@angular/core';
import { validateDni, validatePlayerIsOlderThan } from '@app/utils/utils';

@Component({
  selector: 'app-create-player-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-player-modal.component.html',
  styleUrl: './create-player-modal.component.scss',
})
export class CreatePlayerModalComponent implements OnInit, AfterViewInit {
  @ViewChild('birthdayDatepicker', { static: true })
  birthdayDatepicker!: ElementRef;

  public playerForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    dni: new FormControl('', [Validators.required, validateDni]),
    avatar: new FormControl('', []),
    birthday: new FormControl('', [Validators.required]),
  });
  public isSubmitted = false;
  public emailTouched = false;
  public datepicker!: Datepicker;
  public isCreatingPlayer = signal(false);

  private _playerService = inject(PlayerService);
  private _resourceService = inject(ResourceService);
  private _genericService = inject(GenericApiService);
  private _userState = inject(UserStateService);
  private _avatar: File | null = null;

  constructor() {}

  ngOnInit(): void {
    initDatepickers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initDatePicker();
    }, 100);
  }

  initDatePicker() {
    const datepickerEl = this.birthdayDatepicker.nativeElement;
    if (datepickerEl) {
      this.datepicker = new Datepicker(datepickerEl, {
        // format: 'dd-mm-yyyy',
        format: 'yyyy-mm-dd',
        autohide: true,
        maxDate: String(new Date()),
      });
    }
    console.log('Datepicker initialized:', this.datepicker);
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.playerForm.invalid) return;

    this.isCreatingPlayer.set(true);
    const player: Player = {
      ...this.playerForm.value,
      birthday: String(this.datepicker.getDate()),
      user_id: this._userState.me()?.id_user,
    };
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      player.avatar = resource.data.name;
    }
    const playerCreateResponse = await this.createPlayer(player);
    console.log(playerCreateResponse);
    this.playerForm.reset();
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
        next: (res: ResourceCreateResponse) => {
          resolve(res);
          this.isCreatingPlayer.set(false);
        },
        error: (err) => {
          console.log(err);
          this.isCreatingPlayer.set(false);
          reject(err);
        },
      });
    });
  }

  onAvatarChange(e: any) {
    if (e?.target?.files) {
      const file: File = e.target.files[0];
      this._avatar = file;
    }
  }

  onBirthdayInput(e: Event) {
    if (
      this.datepicker.getDate() &&
      this.playerForm.get?.('birthday')?.errors
    ) {
      this.playerForm.get('birthday')!.errors!['required'] = false;
    }

    const isPlayerOlder = validatePlayerIsOlderThan({
      birthday: this.datepicker.getDate(),
      age: 16,
    });
    if (!isPlayerOlder) {
      this.playerForm.get('birthday')?.setErrors({ birthday: true });
    } else {
      this.playerForm.get('birthday')!.errors!['birthday'] = false;
    }
  }
}
