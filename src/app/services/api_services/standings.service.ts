import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { urlParser } from '@app/utils/utils';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '@app/models/api';
import { Standings } from '@app/models/standings';

interface GetStandingsParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  team_id: number;
  competition_category_id: number;
  competition_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  private apiUrl = `${config.apiUrl}/standings`;
  private _genericServices = inject(GenericApiService);

  constructor() {}

  getStandings(
    params: Partial<GetStandingsParams>
  ): Observable<getAllResponse<Standings>> {
    const url = urlParser(params, this.apiUrl);
    return this._genericServices.getAll<getAllResponse<Standings>>(this.apiUrl);
  }

  getStanding(id: number): Observable<getOneResponse<Standings>> {
    return this._genericServices.getOne<getOneResponse<Standings>>(
      this.apiUrl,
      id
    );
  }

  createStanding(standing: Standings): Observable<postResponse<Standings>> {
    return this._genericServices.create<Standings, postResponse<Standings>>(
      this.apiUrl,
      standing
    );
  }

  updateStanding(
    standing: Partial<Standings>,
    id: number
  ): Observable<updateResponse<Standings>> {
    return this._genericServices.update<Standings, updateResponse<Standings>>(
      this.apiUrl,
      id,
      standing
    );
  }

  deleteStanding(id: number): Observable<deleteResponse> {
    return this._genericServices.delete<deleteResponse>(this.apiUrl, id);
  }
}
