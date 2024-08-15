import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../../models/api';
import { Team } from '../../models/team';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  public apiUrl = `${config.apiUrl}/teams`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getTeams(): Observable<getAllResponse<Team>> {
    return this.genericService.getAll<getAllResponse<Team>>(this.apiUrl);
  }

  getTeam(id: number): Observable<getAllResponse<Team>> {
    return this.genericService.getOne<getAllResponse<Team>>(this.apiUrl, id);
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
