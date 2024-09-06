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
import { Competition, CompetitionWithDetails } from '../../models/competition';
import { urlParser } from '@app/utils/utils';

interface GetCompetitionsParams {
  q?: string;
  page?: string;
  includeCompetitionType?: boolean;
  includeOrganization?: boolean;
  includeCompetitionCategory?: boolean;
  user_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompetitionService {
  private apiUrl = `${config.apiUrl}/competitions`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCompetitions(
    params?: GetCompetitionsParams
  ): Observable<getAllResponse<CompetitionWithDetails>> {
    const url = urlParser(params, this.apiUrl);
    console.log('url', url);
    return this.genericService.getAll<getAllResponse<CompetitionWithDetails>>(
      url
    );
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

  createCompetitionFull(competition: Competition): Observable<any> {
    return this.genericService.create<Competition, any>(
      `${config.apiUrl}/competitions/full`,
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
