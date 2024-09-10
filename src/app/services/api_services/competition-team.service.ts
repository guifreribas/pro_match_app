import { inject, Injectable } from '@angular/core';
import { config } from '@app/config/config';
import { GenericApiService } from './generic-api.service';
import { HttpClient } from '@angular/common/http';
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
} from '@app/models/competitionTeam';
import { Observable } from 'rxjs';

interface CompetitionTeamParams {
  competition_id: number;
  team_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompetitionTeamService {
  private apiUrl = `${config.apiUrl}/competition-teams`;
  private genericService = inject(GenericApiService);
  private http = inject(HttpClient);

  constructor() {}

  getCompetitionTeams(
    params: CompetitionTeamParams
  ): Observable<getAllResponse<CompetitionTeam>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<CompetitionTeam>>(url);
  }

  getCompetitionTeam(
    competitionTeamId: number
  ): Observable<getOneResponse<CompetitionTeam>> {
    return this.genericService.getOne<getOneResponse<CompetitionTeam>>(
      this.apiUrl,
      competitionTeamId
    );
  }

  createCompetitionTeam(
    competitionTeam: CompetitionTeam
  ): Observable<postResponse<CompetitionTeam>> {
    return this.genericService.create<
      CompetitionTeam,
      postResponse<CompetitionTeam>
    >(this.apiUrl, competitionTeam);
  }

  updateCompetitionTeam(
    competitionTeam: CompetitionTeam,
    id: number
  ): Observable<updateResponse<CompetitionTeam>> {
    return this.genericService.update<
      CompetitionTeam,
      updateResponse<CompetitionTeam>
    >(this.apiUrl, id, competitionTeam);
  }

  deleteCompetitionTeam(id: number): Observable<deleteResponse> {
    return this.genericService.delete<any>(this.apiUrl, id);
  }
}
