import { Component, Input, WritableSignal } from '@angular/core';
import { CompetitionWithDetails } from '@app/models/competition';

@Component({
  selector: 'app-competition-overview',
  standalone: true,
  imports: [],
  templateUrl: './competition-overview.component.html',
  styleUrl: './competition-overview.component.scss',
})
export class CompetitionOverviewComponent {
  @Input() competition!: WritableSignal<CompetitionWithDetails | null>;
  @Input() competitionType!: WritableSignal<string>;

  private _genderMap: { [key: string]: string } = {
    MALE: 'Masculino',
    FEMALE: 'Femenino',
    OTHER: 'Otro',
  };

  private _formatMap: { [key: string]: string } = {
    SINGLE_ROUND: 'Sólo ida',
    DOUBLE_ROUND: 'Doble vuelta',
    KNOCKOUT: 'Eliminatorias',
    KNOCKOUT_SINGLE_ROUND: 'Liguilla una vuelta más eliminatorias',
    KNOCKOUT_DOUBLE_ROUND: 'Liguilla dos vueltas más eliminatorias',
  };

  getGenre(gender: string = 'Otro') {
    return this._genderMap[gender] || 'Otro';
  }

  getFormat(format: string = 'DOUBLE_ROUND'): string {
    return this._formatMap[format] || 'Doble vuelta';
  }
}
