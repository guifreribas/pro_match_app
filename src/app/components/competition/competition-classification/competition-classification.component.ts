import {
  Component,
  effect,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import { config } from '@app/config/config';
import { CompetitionWithDetails } from '@app/models/competition';
import { StandingsStateService } from '@app/services/global_states/standings-state.service';

@Component({
  selector: 'app-competition-classification',
  standalone: true,
  imports: [],
  templateUrl: './competition-classification.component.html',
  styleUrl: './competition-classification.component.scss',
})
export class CompetitionClassificationComponent {
  @Input() competition!: WritableSignal<CompetitionWithDetails | null>;

  public imgUrl = config.IMG_URL;

  private _standingsState = inject(StandingsStateService);
  public standings = this._standingsState.standings;

  constructor() {
    effect(() => {
      console.log('STANDINGS: ', this._standingsState.standings());
    });
  }
}
