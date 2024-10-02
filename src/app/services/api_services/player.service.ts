import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, getOneResponse, postResponse } from '../../models/api';
import { Player, PlayerCreateResponse } from '../../models/player';
import { urlParser } from '@app/utils/utils';
import { buildHttpParams } from '@app/utils/http-utils';

interface GetPlayersParams {
  q: string;
  page: string;
  user_id: number;
  team_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  public static readonly apiUrl = `${config.apiUrl}/players`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getPlayers(
    params?: Partial<GetPlayersParams>
  ): Observable<getAllResponse<Player>> {
    const httpParams = buildHttpParams(params);
    return this.genericService.getAll<getAllResponse<Player>>(
      PlayerService.apiUrl,
      { params: httpParams }
    );
  }

  getPlayer(id: number): Observable<getOneResponse<Player>> {
    return this.genericService.getOne<getOneResponse<Player>>(
      PlayerService.apiUrl,
      id
    );
  }

  createPlayer(player: Player): Observable<postResponse<PlayerCreateResponse>> {
    return this.genericService.create<
      Player,
      postResponse<PlayerCreateResponse>
    >(PlayerService.apiUrl, player);
  }

  updatePlayer(
    player: Partial<Player>,
    id: number
  ): Observable<getAllResponse<Player>> {
    return this.genericService.update<Partial<Player>, getAllResponse<Player>>(
      PlayerService.apiUrl,
      id,
      player
    );
  }

  deletePlayer(id: number): Observable<getAllResponse<Player>> {
    return this.genericService.delete<getAllResponse<Player>>(
      PlayerService.apiUrl,
      id
    );
  }
}
