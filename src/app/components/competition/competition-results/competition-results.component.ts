import {
  Component,
  effect,
  inject,
  Input,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  MatchCompletedData,
  MatchStateService,
} from '@app/services/global_states/match-state.service';
import { CompetitionMatchResultComponent } from '../competition-match-result/competition-match-result.component';
import { MatchWithDetails } from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import { firstValueFrom } from 'rxjs';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';
import { CompetitionWithDetails } from '@app/models/competition';

@Component({
  selector: 'app-competition-results',
  standalone: true,
  imports: [CompetitionMatchResultComponent],
  templateUrl: './competition-results.component.html',
  styleUrl: './competition-results.component.scss',
})
export class CompetitionResultsComponent {
  @Input() matches!: MatchWithDetails[];

  public match: MatchWithDetails | null = null;
  public hasFinishedMatches = false;
  public competition: CompetitionWithDetails | null = null;
  public matchesPlayed = signal<MatchWithDetails[]>([]);

  private _matchState = inject(MatchStateService);
  private _competitionState = inject(CompetitionStateService);
  private _matchService = inject(MatchService);

  constructor() {
    effect(() => {
      const competition = this._competitionState.competitions();
      if (competition) {
        this.competition = competition;
        this._getMatches(
          competition.competitionCategory.competition_category_id
        );
      }
    });
  }

  ngOnInit(): void {
    console.log('MATCH STATE', this.matches);
    // this.hasFinishedMatches = this.matches.some(
    //   (match) => match.status === 'FINISHED'
    // );
  }

  private async _getMatches(competition_category_id: number) {
    const matches = await firstValueFrom(
      this._matchService.getMatches({
        competition_category_id,
        limit: 100,
      })
    );
    console.log('MATCHES RESPOSNE: ', matches);
    this.matchesPlayed.set(matches.data.items);
  }
}
