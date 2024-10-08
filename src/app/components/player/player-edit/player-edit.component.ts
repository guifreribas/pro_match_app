import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { config } from '@app/config/config';
import { postResponse } from '@app/models/api';
import { Player, PlayerCreateResponse } from '@app/models/player';
import { ResourceCreateResponse } from '@app/models/resource';
import { TeamsGetResponse } from '@app/models/team';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { PlayerService } from '@app/services/api_services/player.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { TeamService } from '@app/services/api_services/team.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { SpinnerService } from '@app/services/spinner.service';
import { validateDni } from '@app/utils/utils';
import { Datepicker } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  switchMap,
} from 'rxjs';

@Component({
  selector: 'app-player-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    DatepickerComponent,
  ],
  templateUrl: './player-edit.component.html',
  styleUrl: './player-edit.component.scss',
})
export class PlayerEditComponent {
  @Input() player!: WritableSignal<Player | null>;
  @Input() playerYears!: number | null;

  @ViewChild('birthdayDatepicker') birthdayDatepicker!: ElementRef;

  public imgUrl = config.IMG_URL;
  public playerForm!: FormGroup;
  public isSubmitted = false;
  public emailTouched = false;
  public datepicker!: Datepicker;
  public isEditingPlayer = signal(false);
  public dynamicClasses: { [key: string]: boolean } = {};
  public searchedTeams = signal<TeamsGetResponse | null>(null);

  private _resourceService = inject(ResourceService);
  private _teamService = inject(TeamService);
  private _genericService = inject(GenericApiService);
  private _userState = inject(UserStateService);
  private _spinnerService = inject(SpinnerService);
  private _globalModalService = inject(GlobalModalService);
  private _avatar: File | null = null;
  private _searchSubject = new Subject<string>();

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.playerForm = this.fb.group({
      name: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      dni: new FormControl('', [Validators.required, validateDni]),
      avatar: new FormControl('', []),
      birthday: new FormControl('', [
        Validators.required,
        this.validatePlayerIsOlderThan16,
      ]),
    });

    effect(() => {
      console.log('Player changed:', this.player());
      if (this.player()) {
        const birthdayParsed = new Date(this.player()!.birthday);
        this.playerForm.controls['name'].setValue(this.player()?.name);
        this.playerForm.controls['lastName'].setValue(this.player()?.last_name);
        this.playerForm.controls['dni'].setValue(this.player()?.dni);
        this.playerForm.controls['birthday'].setValue(birthdayParsed);
      }
    });
  }

  ngOnInit(): void {
    this.updateBirthdayClasses();
    this.playerForm.get('birthday')?.valueChanges.subscribe(() => {
      this.updateBirthdayClasses();
      this.cdr.detectChanges();
    });

    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._teamService.getTeams({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedTeams.set(res);
      });
  }

  updateBirthdayClasses() {
    const birthdayControl = this.playerForm.get('birthday');
    const isInvalid = birthdayControl?.invalid ?? false;
    const isTouchedOrSubmitted =
      (birthdayControl?.touched ?? false) || this.isSubmitted;

    this.dynamicClasses = {
      'border-red-500': isInvalid && isTouchedOrSubmitted,
      'border-2': isInvalid && isTouchedOrSubmitted,
    };
    // console.log('Birthday classes updated:', this.dynamicClasses);
  }

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.playerForm.invalid) return;
    this._spinnerService.setLoading(true);
    // this.isEditingPlayer.set(true);
    let player: Partial<Player> = {
      ...this.playerForm.value,
      user_id: this._userState.me()?.id_user,
    };
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      player.avatar = resource.data.name;
    } else {
      const { avatar, ...rest } = player;
      player = rest;
    }

    const playerCreateResponse = await this.updatePlayer(player);
    console.log(playerCreateResponse);
    // this.isEditingPlayer.set(false);
    this.player.set(playerCreateResponse.data);
    this.playerForm.markAsPristine();
    this.isSubmitted = false;
    this._spinnerService.setLoading(false);
    this._globalModalService.openModal('Jugador actualizado', '');
  }

  async updatePlayer(player: Partial<Player>): Promise<postResponse<Player>> {
    console.log('UPDATE PLAYER', player);
    const playerId = this.player()?.id_player;
    if (!playerId) {
      throw new Error('Player id is required');
    }
    try {
      return firstValueFrom(
        this._genericService.update<Player, postResponse<Player>>(
          PlayerService.apiUrl,
          playerId,
          player
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
        },
        error: (err) => {
          console.log(err);
          this.isEditingPlayer.set(false);
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

  onDateChange(event: any) {
    const birthdayControl = this.playerForm.get('birthday');
    if (birthdayControl) {
      birthdayControl.markAsTouched();
      birthdayControl.setValue(event.value);
      this.updateBirthdayClasses();
      this.cdr.detectChanges();
    }
  }

  onTeamSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedTeams.set(null);
      return;
    }
    // if (inputElement.value.length < 2) return;
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }
  validatePlayerIsOlderThan16(
    control: AbstractControl
  ): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    const minAgeDate = new Date(
      today.getFullYear() - 16,
      today.getMonth(),
      today.getDate()
    );

    return selectedDate <= minAgeDate ? null : { underage: true };
  }
}
