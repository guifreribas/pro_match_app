import { Injectable, signal } from '@angular/core';
import { CompetitionWithDetails } from '@app/models/competition';

@Injectable({
  providedIn: 'root',
})
export class CompetitionStateService {
  readonly competitions = signal<CompetitionWithDetails | null>(null);

  constructor() {}

  getCompetition(): CompetitionWithDetails | null {
    return this.competitions();
  }

  setCompetition(competition: CompetitionWithDetails) {
    this.competitions.set(competition);
  }

  updateCompetition(competition: Partial<CompetitionWithDetails>) {
    this.competitions.update((prev) => {
      if (!prev) return prev;
      return { ...prev, ...competition };
    });
  }

  clearCompetition() {
    this.competitions.set(null);
  }
}
