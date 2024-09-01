import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
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
  ): Observable<postResponse<Competition>> {
    return this.genericService.create<Competition, postResponse<Competition>>(
      this.apiUrl,
      competition
    );
  }

  updateCompetition(
    competition: Competition,
    id: number
  ): Observable<updateResponse<Competition>> {
    return this.genericService.update<Competition, updateResponse<Competition>>(
      this.apiUrl,
      id,
      competition
    );
  }

  deleteCompetition(id: number): Observable<deleteResponse> {
    return this.genericService.delete<deleteResponse>(this.apiUrl, id);
  }
}
