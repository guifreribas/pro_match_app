import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  Input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { config } from '@app/config/config';
import { getAllResponse } from '@app/models/api';
import { ResourceCreateResponse } from '@app/models/resource';
import { Team, TeamsGetResponse } from '@app/models/team';
import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { TeamService } from '@app/services/api_services/team.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { catchError, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.scss',
})
export class TeamEditComponent {
  @Input() team!: WritableSignal<Team | null>;
  public imgUrl = config.IMG_URL;
  public searchedTeams = signal<TeamsGetResponse | null>(null);

  public teamForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    avatar: new FormControl('', []),
  });

  public isSubmitted = false;

  private _isEditing = false;

  private _teamService = inject(TeamService);
  private _resourceService = inject(ResourceService);
  private _userState = inject(UserStateService);
  private _globalModalService = inject(GlobalModalService);
  private _avatar: File | null = null;
  private cdr = inject(ChangeDetectorRef);

  public dynamicClasses: { [key: string]: boolean } = {};

  constructor() {
    effect(() => {
      const team = this.team();
      if (team && this._isEditing === false) {
        this._isEditing = true;
        const formControls = this.teamForm.controls;
        formControls.name.setValue(team.name);
      }
    });
  }

  ngOnInit(): void {}

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    if (this.teamForm.invalid) return;
    const team: Partial<Team> = {
      user_id: Number(this._userState.me()?.id_user),
    };
    const body: Partial<Team> = {
      name: this.teamForm.value.name as string,
    };
    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      body.avatar = resource.data.name;
    }
    console.log({ team });
    const teamCreateResponse = await this.updateTeam(body);
    console.log(teamCreateResponse);
    this._globalModalService.openModal('Equipo actualizado', '');

    // this.isCreatingTeam.set(false);
    // this.teamForm.reset();
  }

  async updateTeam(team: Partial<Team>): Promise<getAllResponse<Team>> {
    try {
      return firstValueFrom(
        this._teamService.updateTeam(team, Number(this.team()?.id_team)).pipe(
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
          // this.isCreatingTeam.set(false);
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
}
