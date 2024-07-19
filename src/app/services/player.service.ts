import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../models/api';
import { Player } from '../models/player';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private apiUrl = `${config.apiUrl}/players`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getPlayers(): Observable<getAllResponse<Player>> {
    return this.genericService.getAll<getAllResponse<Player>>(this.apiUrl);
  }

  getPlayer(id: number): Observable<getAllResponse<Player>> {
    return this.genericService.getOne<getAllResponse<Player>>(this.apiUrl, id);
  }

  createPlayer(player: Player): Observable<getAllResponse<Player>> {
    return this.genericService.create<Player, getAllResponse<Player>>(
      this.apiUrl,
      player
    );
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
