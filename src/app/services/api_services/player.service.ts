import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import {
  getAllResponse,
  getOneResponse,
  postOneResponse,
} from '../../models/api';
import { Player, PlayerCreateResponse } from '../../models/player';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  public apiUrl = `${config.apiUrl}/players`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getPlayers(): Observable<getAllResponse<Player>> {
    return this.genericService.getAll<getAllResponse<Player>>(this.apiUrl);
  }

  getPlayer(id: number): Observable<getOneResponse<Player>> {
    return this.genericService.getOne<getOneResponse<Player>>(this.apiUrl, id);
  }

  createPlayer(
    player: Player
  ): Observable<postOneResponse<PlayerCreateResponse>> {
    return this.genericService.create<
      Player,
      postOneResponse<PlayerCreateResponse>
    >(this.apiUrl, player);
  }

  updatePlayer(player: Player, id: number): Observable<getAllResponse<Player>> {
    return this.genericService.update<Player, getAllResponse<Player>>(
      this.apiUrl,
      id,
      player
    );
  }

  deletePlayer(id: number): Observable<getAllResponse<Player>> {
    return this.genericService.delete<getAllResponse<Player>>(this.apiUrl, id);
  }
}
