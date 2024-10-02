import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { config } from '@app/config/config';
import { GetGoalsParams, Goal } from '@app/models/goal';
import { GoalService } from '@app/services/api_services/goal.service';
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

  private _goalService = inject(GoalService);
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    console.log('INIT');
    const competitionId = this._route.snapshot.params['id'];
    this.getScorers({
      competition_id: competitionId,
      limit: 30,
    });
  }

  async getScorers(params: Partial<GetGoalsParams>): Promise<Goal[] | null> {
    try {
      const response = await firstValueFrom(this._goalService.getGoals(params));
      console.log({ Scorers: response });
      return response.data.items;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
