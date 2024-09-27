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
import {
  GetStandingsParams,
  GetStandingsResponse,
  Standings,
  StandingsCreateDto,
} from '@app/models/standings';
import { buildHttpParams } from '@app/utils/http-utils';

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  private static readonly API_URL = `${config.apiUrl}/standings`;
  private _genericServices = inject(GenericApiService);

  constructor() {}

  getStandings(
    params: Partial<GetStandingsParams>
  ): Observable<getAllResponse<GetStandingsResponse>> {
    const httpParams = buildHttpParams(params);
    return this._genericServices.getAll<getAllResponse<GetStandingsResponse>>(
      StandingsService.API_URL,
      { params: httpParams }
    );
  }

  getStanding(id: number): Observable<getOneResponse<Standings>> {
    return this._genericServices.getOne<getOneResponse<Standings>>(
      StandingsService.API_URL,
      id
    );
  }

  createStanding(
    standing: StandingsCreateDto
  ): Observable<postResponse<Standings>> {
    return this._genericServices.create(StandingsService.API_URL, standing);
  }

  updateStanding(
    standing: Partial<Standings>,
    id: number
  ): Observable<updateResponse<Standings>> {
    return this._genericServices.update<Standings, updateResponse<Standings>>(
      StandingsService.API_URL,
      id,
      standing
    );
  }

  deleteStanding(id: number): Observable<deleteResponse> {
    return this._genericServices.delete<deleteResponse>(
      StandingsService.API_URL,
      id
    );
  }
}
