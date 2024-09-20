import { Injectable, signal } from '@angular/core';
import { MatchWithDetails } from '@app/models/match';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';

interface MatchCompletedData {
  match: MatchWithDetails;
  goals: any[];
  localTeam: Team;
  visitorTeam: Team;
  localPlayers: TeamPlayerWithDetails[];
  visitorPlayers: TeamPlayerWithDetails[];
}

@Injectable({
  providedIn: 'root',
})
export class MatchStateService {
  public match = signal<MatchCompletedData | null>(null);

  constructor() {}

  getMatch(): any | null {
    return this.match;
  }

  setMatch(match: any) {
    this.match.set(match);
  }

  updateMatch(match: Partial<any>) {
    this.match.update((prev) => {
      if (!prev) return prev;
      return { ...prev, ...match };
    });
  }

  clearMatch() {
    this.match.set(null);
  }
}