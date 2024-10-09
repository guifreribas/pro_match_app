import { Injectable, signal } from '@angular/core';
import { CardWithPlayer } from '@app/models/card';
import { FoulWithPlayer } from '@app/models/foul';
import { GoalWithPlayer } from '@app/models/goal';
import { MatchWithDetails } from '@app/models/match';
import { MatchPlayerWithDetails } from '@app/models/matchPlayer';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';

export interface MatchCompletedData {
  match: MatchWithDetails;
  goals: GoalWithPlayer[];
  cards: CardWithPlayer[];
  fouls: FoulWithPlayer[];
  localTeam: Team;
  visitorTeam: Team;
  localPlayers: TeamPlayerWithDetails[];
  visitorPlayers: TeamPlayerWithDetails[];
  matchPlayers: MatchPlayerWithDetails[];
}

@Injectable({
  providedIn: 'root',
})
export class MatchStateService {
  public readonly match = signal<MatchWithDetails | null>(null);
  public readonly goals = signal<GoalWithPlayer[]>([]);
  public readonly cards = signal<CardWithPlayer[]>([]);
  public readonly fouls = signal<FoulWithPlayer[]>([]);
  public readonly localTeam = signal<Team | null>(null);
  public readonly visitorTeam = signal<Team | null>(null);
  public readonly localPlayers = signal<TeamPlayerWithDetails[]>([]);
  public readonly visitorPlayers = signal<TeamPlayerWithDetails[]>([]);
  public readonly matchPlayers = signal<MatchPlayerWithDetails[]>([]);

  constructor() {}

  getMatch(): any | null {
    return this.match;
  }

  setAllMatchData(match: MatchCompletedData) {
    console.log('MATCH STATE', match);
    this.match.set(match.match);
    this.goals.set(match.goals);
    this.cards.set(match.cards);
    this.fouls.set(match.fouls);
    this.localTeam.set(match.localTeam);
    this.visitorTeam.set(match.visitorTeam);
    this.localPlayers.set(match.localPlayers);
    this.visitorPlayers.set(match.visitorPlayers);
    this.matchPlayers.set(match.matchPlayers);
  }
  setMatch(match: MatchWithDetails) {
    this.match.set(match);
  }

  updateMatch(match: Partial<any>) {
    this.match.update((prev) => {
      if (!prev) return prev;
      return { ...prev, ...match };
    });
  }

  clearMatch(): void {
    this.match.set(null);
  }
}
