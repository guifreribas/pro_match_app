import { AfterViewInit, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsideComponent } from '@app/components/organism/aside/aside.component';
import { CreateTeamModalComponent } from '@app/components/team/create-team-modal/create-team-modal.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Team, TeamsGetResponse } from '@app/models/team';
import { TeamService } from '@app/services/api_services/team.service';
import { initFlowbite } from 'flowbite';
import dayjs from 'dayjs';
import { config } from '@app/config/config';
import { UserStateService } from '@app/services/global_states/user-state.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CreateTeamModalComponent,
    AsideComponent,
  ],
  templateUrl: './teams.component.html',
  styleUrl: './teams.component.scss',
})
export class TeamsComponent implements OnInit, AfterViewInit {
  public teamsResponse: TeamsGetResponse | null = null;
  public teams: Team[] = [];
  public createdAt: Date | null = null;
  public dayjs = dayjs;
  public IMG_URL = config.IMG_URL;

  private _teamService = inject(TeamService);
  private _userState = inject(UserStateService);

  ngOnInit(): void {
    console.log('my user id:', this._userState.me()?.id_user);
    this._teamService
      .getTeams({ user_id: this._userState.me()?.id_user })
      .subscribe({
        next: (res) => {
          console.log(res);
          console.log({ teams: res.data.items });
          this.teams = res.data.items;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  ngAfterViewInit(): void {
    //Init flowbite after view init to avoid flickering
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }
}
