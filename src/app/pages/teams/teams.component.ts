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
  private _teamService = inject(TeamService);
  public teamsResponse: TeamsGetResponse | null = null;
  public teams: Team[] = [];
  public createdAt: Date | null = null;
  public dayjs = dayjs;
  public IMG_URL = config.IMG_URL;

  ngOnInit(): void {
    this._teamService.getTeams().subscribe({
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
