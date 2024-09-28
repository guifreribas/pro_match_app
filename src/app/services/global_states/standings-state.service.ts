import { Injectable, signal } from '@angular/core';
import { StandingsWithDetails, Standings } from '../../models/standings';

@Injectable({
  providedIn: 'root',
})
export class StandingsStateService {
  public readonly standings = signal<StandingsWithDetails[]>([]);

  constructor() {}

  setStandings(standings: StandingsWithDetails[]) {
    this.standings.set(standings);
  }

  updateStandings(standings: Partial<Standings>) {
    this.standings.update((prev) => {
      if (!prev) return prev;
      return { ...prev, ...standings };
    });
  }

  clearStandings() {
    this.standings.set([]);
  }
}
