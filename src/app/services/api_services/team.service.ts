import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import {
  getAllResponse,
  getOneResponse,
  updateResponse,
} from '../../models/api';
import { GetTeamsParams, Team } from '../../models/team';
import { urlParser } from '@app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  static readonly apiUrl = `${config.apiUrl}/teams`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getTeams(params?: Partial<GetTeamsParams>): Observable<getAllResponse<Team>> {
    const url = urlParser(params, TeamService.apiUrl);
    return this.genericService.getAll<getAllResponse<Team>>(url);
  }

  getTeam(id: number): Observable<getOneResponse<Team>> {
    return this.genericService.getOne<getOneResponse<Team>>(
      TeamService.apiUrl,
      id
    );
  }

  createTeam(team: Team): Observable<getAllResponse<Team>> {
    return this.genericService.create<Team, getAllResponse<Team>>(
      TeamService.apiUrl,
      team
    );
  }

  updateTeam(
    team: Partial<Team>,
    id: number
  ): Observable<updateResponse<Team>> {
    return this.genericService.update<Partial<Team>, updateResponse<Team>>(
      TeamService.apiUrl,
      id,
      team
    );
  }

  deleteTeam(id: number): Observable<getAllResponse<Team>> {
    return this.genericService.delete<getAllResponse<Team>>(
      TeamService.apiUrl,
      id
    );
  }
}
