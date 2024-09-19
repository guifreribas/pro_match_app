import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, getOneResponse } from '../../models/api';
import { Team } from '../../models/team';
import { urlParser } from '@app/utils/utils';

interface GetTeamsParams {
  q: string;
  page: string;
  user_id: number;
  id_team: number;
}

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  public apiUrl = `${config.apiUrl}/teams`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getTeams(params?: Partial<GetTeamsParams>): Observable<getAllResponse<Team>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<Team>>(url);
  }

  getTeam(id: number): Observable<getOneResponse<Team>> {
    return this.genericService.getOne<getOneResponse<Team>>(this.apiUrl, id);
  }

  createTeam(team: Team): Observable<getAllResponse<Team>> {
    return this.genericService.create<Team, getAllResponse<Team>>(
      this.apiUrl,
      team
    );
  }

  updateTeam(team: Team, id: number): Observable<getAllResponse<Team>> {
    return this.genericService.update<Team, getAllResponse<Team>>(
      this.apiUrl,
      id,
      team
    );
  }

  deleteTeam(id: number): Observable<getAllResponse<Team>> {
    return this.genericService.delete<getAllResponse<Team>>(this.apiUrl, id);
  }
}
