import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { postResponse } from '@app/models/api';
import { ResourceCreateResponse } from '@app/models/resource';
import { Team, TeamsCreateResponse } from '@app/models/team';

import { GenericApiService } from '@app/services/api_services/generic-api.service';
import { ResourceService } from '@app/services/api_services/resource.service';
import { TeamService } from '@app/services/api_services/team.service';
import { TeamStateService } from '@app/services/global_states/team-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { catchError, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-team-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './create-team-modal.component.html',
  styleUrl: './create-team-modal.component.scss',
})
export class CreateTeamModalComponent {
  public teamForm: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    avatar: new FormControl('', []),
  });
  public isSubmitted = false;
  public isCreatingTeam = signal(false);

  private _teamService = inject(TeamService);
  private _resourceService = inject(ResourceService);
  private _genericService = inject(GenericApiService);
  private _userState = inject(UserStateService);
  private _avatar: File | null = null;
  private _teamState = inject(TeamStateService);

  constructor() {}

  async onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    this.isCreatingTeam.set(true);
    if (this.teamForm.invalid) return;

    let team: Team = {
      ...this.teamForm.value,
      user_id: this._userState.me()?.id_user,
    };

    let resource: ResourceCreateResponse | null = null;
    if (this._avatar) {
      resource = await this.createResource(this._avatar, this._avatar.name);
      console.log(resource);
      team.avatar = resource.data.name;
    }

    const teamCreateResponse = await this.createTeam(team);
    console.log(teamCreateResponse);
    this._teamState.updateTeams([teamCreateResponse.data]);
    this.teamForm.reset();
    this.isCreatingTeam.set(false);
    this.isSubmitted = false;
  }

  async createTeam(team: Team): Promise<postResponse<Team>> {
    try {
      return firstValueFrom(
        this._genericService
          .create<Team, postResponse<Team>>(TeamService.apiUrl, team)
          .pipe(
            catchError((err) => {
              console.log(err);
              this.isCreatingTeam.set(false);
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
          this.isCreatingTeam.set(false);
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
