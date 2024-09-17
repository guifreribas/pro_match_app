import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, postResponse } from '../../models/api';
import { Match, MatchStatus, MatchWithDetails } from '../../models/match';
import { urlParser } from '@app/utils/utils';

interface GetMatchesParams {
  q?: string;
  page?: string;
  id_match?: number;
  status: MatchStatus;
  local_team: number;
  visitor_team: number;
  date: Date;
  dateBefore: Date;
  dateAfter: Date;
  competition_category_id: number;
  user_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private apiUrl = `${config.apiUrl}/matches`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getMatches(
    params?: Partial<GetMatchesParams>
  ): Observable<getAllResponse<MatchWithDetails>> {
    const url = urlParser(params, this.apiUrl);
    console.log('url', url);
    return this.genericService.getAll<getAllResponse<MatchWithDetails>>(url);
  }

  getMatch(id: number): Observable<getAllResponse<Match>> {
    return this.genericService.getOne<getAllResponse<Match>>(this.apiUrl, id);
  }

  createMatch(match: Match): Observable<postResponse<Match>> {
    return this.genericService.create<Match, postResponse<Match>>(
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
