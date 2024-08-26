import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../../models/api';
import { TeamPlayer } from '../../models/team-player';

@Injectable({
  providedIn: 'root',
})
export class TeamPlayerService {
  public apiUrl = `${config.apiUrl}/team-players`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getTeamPlayers(): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.getAll<getAllResponse<TeamPlayer>>(this.apiUrl);
  }

  getTeamPlayer(id: number): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.getOne<getAllResponse<TeamPlayer>>(
      this.apiUrl,
      id
    );
  }

  createTeamPlayer(
    teamPlayer: TeamPlayer
  ): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.create<TeamPlayer, getAllResponse<TeamPlayer>>(
      this.apiUrl,
      teamPlayer
    );
  }

  updateTeamPlayer(
    teamPlayer: TeamPlayer,
    id: number
  ): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.update<TeamPlayer, getAllResponse<TeamPlayer>>(
      this.apiUrl,
      id,
      teamPlayer
    );
  }

  deleteTeamPlayer(id: number): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.delete<getAllResponse<TeamPlayer>>(
      this.apiUrl,
      id
    );
  }
}
