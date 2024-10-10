import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { config } from '@app/config/config';
import { GetGoalsParams, Goal, Scorers } from '@app/models/goal';
import { GoalService } from '@app/services/api_services/goal.service';
import { MatchService } from '@app/services/api_services/match.service';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-competition-scorers',
  standalone: true,
  imports: [],
  templateUrl: './competition-scorers.component.html',
  styleUrl: './competition-scorers.component.scss',
})
export class CompetitionScorersComponent {
  public imgUrl = config.IMG_URL;
  public playerAvatar = signal<string>('');
  public scorers = signal<Scorers[]>([]);

  private _goalService = inject(GoalService);
  private _competitionState = inject(CompetitionStateService);
  private _matchService = inject(MatchService);
  private _route = inject(ActivatedRoute);

  constructor() {
    this._setupEffects();
  }

  private _setupEffects() {
    effect(async () => {
      try {
        const competition = this._competitionState.competitions();
        if (competition) {
          const scorers = await this._getScorers({
            competition_id: competition.id_competition,
            limit: 500,
          });
          if (!scorers) return;

          const competitionCategoryId =
            competition.competitionCategory.competition_category_id;
          const scorersWithMathces = await this._getScorersWithMatches(
            scorers,
            competitionCategoryId
          );
          this.scorers.set(scorersWithMathces);
        }
      } catch (error) {
        console.error('Error getting scorers: ', error);
        throw error;
      }
    });
  }

  private async _getScorers(
    params: Partial<GetGoalsParams>
  ): Promise<Scorers[] | null> {
    try {
      const response = await firstValueFrom(
        this._goalService.getScorers(params)
      );
      return response.data.items || [];
    } catch (error) {
      console.error('Error getting scorers: ', error);
      return null;
    }
  }

  private _getScorersWithMatches(
    scorers: Scorers[],
    competitionCategoryId: number
  ): Promise<Scorers[]> {
    try {
      return Promise.all(
        scorers.map(async (scorer) => {
          const match = await firstValueFrom(
            this._matchService.getMatches({
              player_id: scorer.player_id,
              competition_category_id: competitionCategoryId,
              limit: 100,
            })
          );
          return {
            ...scorer,
            matches_played: match.data.items.length,
            matches: match.data.items,
          };
        })
      );
    } catch (error) {
      console.error('Error getting scorers with matches: ', error);
      throw error;
    }
  }

  getPercentage(totalGoals: number, matchesPlayed: number) {
    return ((totalGoals / matchesPlayed) * 100).toFixed(0) || 0;
  }
}
