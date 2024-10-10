import { Injectable, signal } from '@angular/core';
import { CompetitionWithDetails } from '@app/models/competition';
import { CompetitionCategory, MatchWithDetails } from '@app/models/match';

@Injectable({
  providedIn: 'root',
})
export class CompetitionStateService {
  public readonly competitions = signal<CompetitionWithDetails | null>(null);
  public readonly match = signal<MatchWithDetails | null>(null);
  public readonly matches = signal<MatchWithDetails[]>([]);
  public readonly competitionCategory = signal<CompetitionCategory | null>(
    null
  );

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
