import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, postOneResponse } from '../../models/api';
import {
  CreateTeamPlayer,
  TeamPlayer,
  TeamPlayersGetResponse,
  TeamPlayerWithDetails,
} from '../../models/team-player';
import { urlParser } from '@app/utils/utils';

interface GetTeamPlayersParams {
  q?: string;
  page?: string;
  limit?: number;
  team_id?: number | null;
  player_id?: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TeamPlayerService {
  public apiUrl = `${config.apiUrl}/team-players`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getTeamPlayers(
    params?: GetTeamPlayersParams
  ): Observable<getAllResponse<TeamPlayerWithDetails>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<TeamPlayerWithDetails>>(
      url
    );
  }

  getTeamPlayer(id: number): Observable<getAllResponse<TeamPlayer>> {
    return this.genericService.getOne<getAllResponse<TeamPlayer>>(
      this.apiUrl,
      id
    );
  }

  createTeamPlayer(
    teamPlayer: CreateTeamPlayer
  ): Observable<postOneResponse<TeamPlayer>> {
    return this.genericService.create<
      CreateTeamPlayer,
      postOneResponse<TeamPlayer>
    >(this.apiUrl, teamPlayer);
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
