import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse, postResponse } from '../../models/api';
import { urlParser } from '@app/utils/utils';

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
    const url = urlParser(params, this.apiUrl);
    return this.genericService.getAll<getAllResponse<any>>(url);
  }

  getGoal(id: number): Observable<getAllResponse<any>> {
    return this.genericService.getOne<getAllResponse<any>>(this.apiUrl, id);
  }

  createGoal(goal: any): Observable<postResponse<any>> {
    return this.genericService.create<any, postResponse<any>>(
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
