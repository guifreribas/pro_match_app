import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import {
  deleteOneResponse,
  getAllResponse,
  getOneResponse,
  postOneResponse,
  putOneResponse,
} from '../../models/api';
import { Competition } from '../../models/competition';

@Injectable({
  providedIn: 'root',
})
export class CompetitionService {
  private apiUrl = `${config.apiUrl}/competitions`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCompetitions(): Observable<getAllResponse<Competition>> {
    return this.genericService.getAll<getAllResponse<Competition>>(this.apiUrl);
  }

  getCompetition(id: number): Observable<getOneResponse<Competition>> {
    return this.genericService.getOne<getOneResponse<Competition>>(
      this.apiUrl,
      id
    );
  }

  createCompetition(
    competition: Competition
  ): Observable<postOneResponse<Competition>> {
    return this.genericService.create<
      Competition,
      postOneResponse<Competition>
    >(this.apiUrl, competition);
  }

  updateCompetition(
    competition: Competition,
    id: number
  ): Observable<putOneResponse<Competition>> {
    return this.genericService.update<Competition, putOneResponse<Competition>>(
      this.apiUrl,
      id,
      competition
    );
  }

  deleteCompetition(id: number): Observable<deleteOneResponse> {
    return this.genericService.delete<deleteOneResponse>(this.apiUrl, id);
  }
}
