import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { urlParser } from '@app/utils/utils';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '@app/models/api';
import {
  CompetitionTeam,
  CompetitionTeamCreateResponse,
  CompetitionTeamWithDetails,
} from '@app/models/competitionTeam';
import { Observable } from 'rxjs';
import { buildHttpParams } from '@app/utils/http-utils';

interface CompetitionTeamParams {
  competition_category_id: number;
  team_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompetitionTeamService {
  private static readonly apiUrl = `${config.apiUrl}/competition-teams`;
  private _genericService = inject(GenericApiService);

  constructor() {}

  getCompetitionTeams(
    params: Partial<CompetitionTeamParams>
  ): Observable<getAllResponse<CompetitionTeamWithDetails>> {
    const HttpParams = buildHttpParams(params);
    return this._genericService.getAll<
      getAllResponse<CompetitionTeamWithDetails>
    >(CompetitionTeamService.apiUrl, { params: HttpParams });
  }

  getCompetitionTeam(
    competitionTeamId: number
  ): Observable<getOneResponse<CompetitionTeam>> {
    return this._genericService.getOne<getOneResponse<CompetitionTeam>>(
      CompetitionTeamService.apiUrl,
      competitionTeamId
    );
  }

  createCompetitionTeam(
    competitionTeam: Partial<CompetitionTeam>
  ): Observable<postResponse<CompetitionTeam>> {
    return this._genericService.create<
      Partial<CompetitionTeam>,
      postResponse<CompetitionTeam>
    >(CompetitionTeamService.apiUrl, competitionTeam);
  }

  updateCompetitionTeam(
    competitionTeam: CompetitionTeam,
    id: number
  ): Observable<updateResponse<CompetitionTeam>> {
    return this._genericService.update<
      CompetitionTeam,
      updateResponse<CompetitionTeam>
    >(CompetitionTeamService.apiUrl, id, competitionTeam);
  }

  deleteCompetitionTeam(id: number): Observable<deleteResponse> {
    return this._genericService.delete<any>(CompetitionTeamService.apiUrl, id);
  }
}
