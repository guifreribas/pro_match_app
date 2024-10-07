import { Injectable, signal } from '@angular/core';
import { Team } from '@app/models/team';

@Injectable({
  providedIn: 'root',
})
export class TeamStateService {
  static readonly teams = signal<Team[]>([]);
  static readonly activeTeam = signal<Team | null>(null);

  constructor() {}

  //Teams methods
  getTeams(): Team[] {
    return TeamStateService.teams();
  }

  setTeams(teams: Team[]) {
    TeamStateService.teams.set(teams);
  }

  updateTeams(teams: Team[]) {
    TeamStateService.teams.update((prev) => {
      if (!prev) return prev;
      return [...prev, ...teams];
    });
  }

  //Active team methods
  clearTeams() {
    TeamStateService.teams.set([]);
  }

  getActiveTeam(): Team | null {
    return TeamStateService.activeTeam();
  }

  setActiveTeam(team: Team | null) {
    TeamStateService.activeTeam.set(team);
  }

  updateActiveTeam(team: Team | null) {
    TeamStateService.activeTeam.update((prev) => {
      if (!prev) return prev;
      return team;
    });
  }

  clearActiveTeam() {
    TeamStateService.activeTeam.set(null);
  }
}
