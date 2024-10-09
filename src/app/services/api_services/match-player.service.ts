import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { urlParser } from '@app/utils/utils';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '@app/models/api';
import { MatchPlayer, MatchPlayerWithDetails } from '@app/models/matchPlayer';
import { Observable } from 'rxjs';

interface GetMatchPlayersParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  match_id: number;
  team_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatchPlayerService {
  private apiUrl = `${config.apiUrl}/match-players`;
  private _genericServices = inject(GenericApiService);

  constructor() {}

  getMatchPlayers(
    params: Partial<GetMatchPlayersParams>
  ): Observable<getAllResponse<MatchPlayerWithDetails>> {
    const url = urlParser(params, this.apiUrl);
    return this._genericServices.getAll<getAllResponse<MatchPlayerWithDetails>>(
      url
    );
  }

  getMatchPlayer(id: number): Observable<getOneResponse<MatchPlayer>> {
    return this._genericServices.getOne<getOneResponse<MatchPlayer>>(
      this.apiUrl,
      id
    );
  }

  createMatchPlayer(
    matchPlayer: MatchPlayer
  ): Observable<postResponse<MatchPlayerWithDetails>> {
    return this._genericServices.create<
      MatchPlayer,
      postResponse<MatchPlayerWithDetails>
    >(this.apiUrl, matchPlayer);
  }

  updateMatchPlayer(matchPlayer: MatchPlayer, id: number) {
    return this._genericServices.update<
      MatchPlayer,
      updateResponse<MatchPlayer>
    >(this.apiUrl, id, matchPlayer);
  }

  deleteMatchPlayer(id: number): Observable<deleteResponse> {
    return this._genericServices.delete<deleteResponse>(this.apiUrl, id);
  }
}
