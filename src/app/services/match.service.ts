import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../models/api';
import { Match } from '../models/match';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private apiUrl = `${config.apiUrl}/matches`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getMatches(): Observable<getAllResponse<Match>> {
    return this.genericService.getAll<getAllResponse<Match>>(this.apiUrl);
  }

  getMatch(id: number): Observable<getAllResponse<Match>> {
    return this.genericService.getOne<getAllResponse<Match>>(this.apiUrl, id);
  }

  createMatch(match: Match): Observable<getAllResponse<Match>> {
    return this.genericService.create<Match, getAllResponse<Match>>(
      this.apiUrl,
      match
    );
  }

  updateMatch(match: Match, id: number): Observable<getAllResponse<Match>> {
    return this.genericService.update<Match, getAllResponse<Match>>(
      this.apiUrl,
      id,
      match
    );
  }

  deleteMatch(id: number): Observable<getAllResponse<Match>> {
    return this.genericService.delete<getAllResponse<Match>>(this.apiUrl, id);
  }
}
