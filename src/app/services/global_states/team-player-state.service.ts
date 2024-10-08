import { Injectable, signal } from '@angular/core';
import { TeamPlayer, TeamPlayerWithDetails } from '@app/models/team-player';

@Injectable({
  providedIn: 'root',
})
export class TeamPlayerStateService {
  static readonly teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  static readonly activeTeamPlayer = signal<TeamPlayer | null>(null);

  constructor() {}

  //Teams methods
  getTeamPlayers(): TeamPlayerWithDetails[] {
    return TeamPlayerStateService.teamPlayers();
  }

  setTeamPlayers(teamPlayers: TeamPlayerWithDetails[]) {
    TeamPlayerStateService.teamPlayers.set(teamPlayers);
  }

  updateTeamPlayers(teamPlayers: TeamPlayerWithDetails[]) {
    TeamPlayerStateService.teamPlayers.update((prev) => {
      if (!prev) return prev;
      return [...prev, ...teamPlayers];
    });
  }

  clearTeamPlayers() {
    TeamPlayerStateService.teamPlayers.set([]);
  }

  getActiveTeamPlayer(): TeamPlayer | null {
    return TeamPlayerStateService.activeTeamPlayer();
  }

  setActiveTeamPlayer(teamPlayer: TeamPlayer | null) {
    TeamPlayerStateService.activeTeamPlayer.set(teamPlayer);
  }

  updateActiveTeamPlayer(teamPlayer: TeamPlayer | null) {
    TeamPlayerStateService.activeTeamPlayer.update((prev) => {
      if (!prev) return prev;
      return teamPlayer;
    });
  }

  clearActiveTeamPlayer() {
    TeamPlayerStateService.activeTeamPlayer.set(null);
  }
}
