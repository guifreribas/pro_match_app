import {
  Component,
  effect,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import {
  MatchCompletedData,
  MatchStateService,
} from '@app/services/global_states/match-state.service';
import { CompetitionMatchResultComponent } from '../competition-match-result/competition-match-result.component';
import { MatchWithDetails } from '@app/models/match';

@Component({
  selector: 'app-competition-results',
  standalone: true,
  imports: [CompetitionMatchResultComponent],
  templateUrl: './competition-results.component.html',
  styleUrl: './competition-results.component.scss',
})
export class CompetitionResultsComponent {
  @Input() matches!: MatchWithDetails[];

  public match: MatchCompletedData | null = null;
  public hasFinishedMatches = false;
  private _matchState = inject(MatchStateService);

  constructor() {
    effect(() => {
      const match = this._matchState.match();
      this.match = match;
    });
  }

  ngOnInit(): void {
    this.hasFinishedMatches = this.matches.some(
      (match) => match.status === 'FINISHED'
    );
  }
}
