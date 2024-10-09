import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, postResponse } from '../../models/api';
import { urlParser } from '@app/utils/utils';
import { GetGoalsParams, Goal } from '@app/models/goal';

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private apiUrl = `${config.apiUrl}/goals`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getGoals(params?: Partial<GetGoalsParams>): Observable<getAllResponse<Goal>> {
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<Goal>>(url);
  }

  getGoal(id: number): Observable<getAllResponse<Goal>> {
    return this.genericService.getOne<getAllResponse<Goal>>(this.apiUrl, id);
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
