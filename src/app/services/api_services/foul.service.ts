import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../../models/api';
import { Foul } from '../../models/foul';
import { buildHttpParams } from '@app/utils/http-utils';

interface GetFoulsParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  match_id: number;
  team_id: number;
  competition_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class FoulService {
  private static readonly apiUrl = `${config.apiUrl}/fouls`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getFouls(params?: Partial<GetFoulsParams>): Observable<getAllResponse<Foul>> {
    const HttpParams = buildHttpParams(params);
    return this.genericService.getAll<getAllResponse<Foul>>(
      FoulService.apiUrl,
      { params: HttpParams }
    );
  }

  getFoul(id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.getOne<getAllResponse<Foul>>(
      FoulService.apiUrl,
      id
    );
  }

  createFoul(foul: Foul): Observable<getAllResponse<Foul>> {
    return this.genericService.create<Foul, getAllResponse<Foul>>(
      FoulService.apiUrl,
      foul
    );
  }

  updateFoul(foul: Foul, id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.update<Foul, getAllResponse<Foul>>(
      FoulService.apiUrl,
      id,
      foul
    );
  }

  deleteFoul(id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.delete<getAllResponse<Foul>>(
      FoulService.apiUrl,
      id
    );
  }
}
