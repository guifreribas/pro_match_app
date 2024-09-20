import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../../models/api';

interface GetGoalsParams {
  q: string;
  page: string;
  user_id: number;
  match_id: number;
  id_goal: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class GoalService {
  private apiUrl = `${config.apiUrl}/goals`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getGoals(params?: Partial<GetGoalsParams>): Observable<getAllResponse<any>> {
    return this.genericService.getAll<getAllResponse<any>>(this.apiUrl);
  }

  getGoal(id: number): Observable<getAllResponse<any>> {
    return this.genericService.getOne<getAllResponse<any>>(this.apiUrl, id);
  }

  createGoal(goal: any): Observable<getAllResponse<any>> {
    return this.genericService.create<any, getAllResponse<any>>(
      this.apiUrl,
      goal
    );
  }

  updateGoal(goal: any, id: number): Observable<getAllResponse<any>> {
    return this.genericService.update<any, getAllResponse<any>>(
      this.apiUrl,
      id,
      goal
    );
  }

  deleteGoal(id: number): Observable<getAllResponse<any>> {
    return this.genericService.delete<getAllResponse<any>>(this.apiUrl, id);
  }
}
