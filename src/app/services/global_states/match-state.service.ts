import { Injectable, signal } from '@angular/core';
import { Card } from '@app/models/card';
import { MatchWithDetails } from '@app/models/match';
import { MatchPlayerWithDetails } from '@app/models/matchPlayer';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';

export interface MatchCompletedData {
  match: MatchWithDetails;
  goals: any[];
  localTeam: Team;
  visitorTeam: Team;
  localPlayers: TeamPlayerWithDetails[];
  visitorPlayers: TeamPlayerWithDetails[];
  matchPlayers: MatchPlayerWithDetails[];
  cards: Card[];
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
