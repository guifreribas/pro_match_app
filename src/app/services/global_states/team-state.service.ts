import { Injectable, signal } from '@angular/core';
import { Team } from '@app/models/team';

@Injectable({
  providedIn: 'root',
})
export class TeamStateService {
  readonly teams = signal<Team[]>([]);

  constructor() {}

  getTeams(): Team[] {
    return this.teams();
  }

  setTeams(teams: Team[]) {
    this.teams.set(teams);
  }

  updateTeams(teams: Team[]) {
    this.teams.update((prev) => {
      if (!prev) return prev;
      return [...prev, ...teams];
    });
  }

  clearTeams() {
    this.teams.set([]);
  }
}
