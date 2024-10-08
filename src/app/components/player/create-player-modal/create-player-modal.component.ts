import { CommonModule, DatePipe } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
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
import { getAllResponse, postResponse } from '@app/models/api';
import { Player, PlayerCreateResponse } from '@app/models/player';
import { ResourceCreateResponse } from '@app/models/resource';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { PlayerService } from '@app/services/api_services/player.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { TeamService } from '@app/services/api_services/team.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { Datepicker } from 'flowbite';
import {
  catchError,
  debounceTime,
  distinct,
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  switchMap,
} from 'rxjs';
import { signal } from '@angular/core';
import { validateDni } from '@app/utils/utils';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { Team, TeamsGetResponse } from '@app/models/team';
import { config } from '@app/config/config';

@Component({
  selector: 'app-create-player-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    DatepickerComponent,
  ],
  templateUrl: './create-player-modal.component.html',
  styleUrl: './create-player-modal.component.scss',
})
export class CreatePlayerModalComponent implements OnInit {
  @ViewChild('birthdayDatepicker') birthdayDatepicker!: ElementRef;

  public imgUrl = config.IMG_URL;
  public playerForm!: FormGroup;
  public isSubmitted = false;
  public emailTouched = false;
  public datepicker!: Datepicker;
  public isCreatingPlayer = signal(false);
  public dynamicClasses: { [key: string]: boolean } = {};
  public searchedTeams = signal<TeamsGetResponse | null>(null);

  private _teamService = inject(TeamService);
  private _playerService = inject(PlayerService);
  private _resourceService = inject(ResourceService);
  private _genericService = inject(GenericApiService);
  private _userState = inject(UserStateService);
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
    this.isCreatingPlayer.set(true);
    const player: Player = {
      ...this.playerForm.value,
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
    this.isCreatingPlayer.set(false);
    this.playerForm.markAsPristine();
    this.isSubmitted = false;
    this.playerForm.reset();
  }

  async createPlayer(
    player: Player
  ): Promise<postResponse<PlayerCreateResponse>> {
    try {
      return firstValueFrom(
        this._genericService
          .create<Player, postResponse<PlayerCreateResponse>>(
            PlayerService.apiUrl,
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

  onDateChange(event: any) {
    const birthdayControl = this.playerForm.get('birthday');
    if (birthdayControl) {
      birthdayControl.markAsTouched();
      birthdayControl.setValue(event.value);
      this.updateBirthdayClasses();
      this.cdr.detectChanges();
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
}
