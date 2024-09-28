import { CommonModule } from '@angular/common';
import { Component, effect, inject, Input } from '@angular/core';
import { config } from '@app/config/config';
import { MatchWithDetails } from '@app/models/match';
import { GoalService } from '@app/services/api_services/goal.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-competition-match-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './competition-match-result.component.html',
  styleUrl: './competition-match-result.component.scss',
})
export class CompetitionMatchResultComponent {
  @Input() match!: MatchWithDetails;
  public imgUrl = config.IMG_URL;
  // public matchData: Signal<MatchCompletedData | null> = signal(null);
  public localTeamGoals = 0;
  public visitorTeamGoals = 0;
  // private _matchState = inject(MatchStateService);
  private _goalService = inject(GoalService);
  private _userState = inject(UserStateService);

  constructor() {
    effect(() => {
      if (!this.match || !this.match.local_team || !this.match.visitor_team)
        return;

      const userId = this._userState.me()?.id_user;
      if (!userId) return;
      this._updateTeamGoals(userId);
    });
  }

  private async _updateTeamGoals(userId: number): Promise<void> {
    try {
      const [localGoals, visitorGoals] = await Promise.all([
        this._getTeamGoals(this.match.local_team.id_team, userId),
        this._getTeamGoals(this.match.visitor_team.id_team, userId),
      ]);
      this.localTeamGoals = localGoals?.length || 0;
      this.visitorTeamGoals = visitorGoals?.length || 0;
    } catch (error) {
      console.error('Error updating team goals: ', error);
    }
  }

  private async _getTeamGoals(teamId: number, userId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this._goalService.getGoals({
          team_id: teamId,
          user_id: this._userState.me()?.id_user,
          limit: 30,
        })
      );
      console.log('GOALS', response);
      return response.data.items;
    } catch (error) {
      console.error('Error getting goals: ', error);
    }
  }
}
