import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, postResponse } from '../../models/api';
import { urlParser } from '@app/utils/utils';
import {
  GetGoalsParams,
  GetScorersResponse,
  Goal,
  GoalWithPlayer,
  Scorers,
} from '@app/models/goal';
import { buildHttpParams } from '@app/utils/http-utils';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private apiUrl = `${config.apiUrl}/goals`;
  private genericService = inject(GenericApiService);
  private http = inject(HttpClient);

  constructor() {}

  getGoals(params?: Partial<GetGoalsParams>): Observable<getAllResponse<Goal>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<Goal>>(url);
  }

  getGoal(id: number): Observable<getAllResponse<Goal>> {
    return this.genericService.getOne<getAllResponse<Goal>>(this.apiUrl, id);
  }

  getScorers(params?: Partial<GetGoalsParams>): Observable<GetScorersResponse> {
    const httpParams = buildHttpParams(params);
    const scorersUrl = this.apiUrl + '/scorers';
    return this.http.get<GetScorersResponse>(scorersUrl, {
      params: httpParams,
    });
  }

  createGoal(goal: Goal): Observable<postResponse<Goal>> {
    return this.genericService.create<Goal, postResponse<Goal>>(
      this.apiUrl,
      goal
    );
  }

  updateGoal(
    goal: Partial<Goal>,
    id: number
  ): Observable<getAllResponse<Goal>> {
    return this.genericService.update<Partial<Goal>, getAllResponse<Goal>>(
      this.apiUrl,
      id,
      goal
    );
  }

  deleteGoal(id: number): Observable<getAllResponse<Goal>> {
    return this.genericService.delete<getAllResponse<Goal>>(this.apiUrl, id);
  }
}
