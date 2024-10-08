import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamEditComponent } from '@app/components/team/team-edit/team-edit.component';
import { TeamViewComponent } from '@app/components/team/team-view/team-view.component';
import { config } from '@app/config/config';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Team } from '@app/models/team';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamService } from '@app/services/api_services/team.service';
import { TeamPlayerStateService } from '@app/services/global_states/team-player-state.service';
import { TeamStateService } from '@app/services/global_states/team-state.service';
import { TeamViewState } from '@app/types/team';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    TeamViewComponent,
    TeamEditComponent,
  ],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent implements OnInit {
  public imgUrl = config.IMG_URL;
  public teamId: number | null = null;
  public teamViewState = signal<TeamViewState>('VIEW');
  public _isEditing = false;
  public isViewing = false;

  public team = TeamStateService.activeTeam;

  private route = inject(ActivatedRoute);
  private _teamState = inject(TeamStateService);
  private _teamPlayerState = inject(TeamPlayerStateService);
  private _teamService = inject(TeamService);
  private _teamPlayersService = inject(TeamPlayerService);

  ngOnInit(): void {
    this.teamId = this.route.snapshot.params['id'];
    this._isEditing = this.route.snapshot.queryParams['edit'];
    this.isViewing = this.route.snapshot.queryParams['view'];
    if (this._isEditing) this.teamViewState.set('EDIT');
    if (this.isViewing) this.teamViewState.set('VIEW');
    if (this.teamId) {
      this._teamService.getTeam(this.teamId).subscribe({
        next: (res) => {
          console.log(res);
          this._teamState.setActiveTeam(res.data);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }

    if (this.teamId) {
      const getTeamPlayersParams = {
        team_id: this.teamId,
        page: '1',
        limit: 50,
        sortBy: 'player_number',
        sortOrder: 'asc',
      };
      this._teamPlayersService.getTeamPlayers(getTeamPlayersParams).subscribe({
        next: (res) => {
          this._teamPlayerState.setTeamPlayers(res.data.items);
        },
        error: (err) => {
          console.log(err);
          throw err;
        },
      });
    }
  }
}
