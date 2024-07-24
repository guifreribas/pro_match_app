import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../../models/api';
import { Result } from '../../models/result';

@Injectable({
  providedIn: 'root',
})
export class ResultService {
  private apiUrl = `${config.apiUrl}/results`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getResults(): Observable<getAllResponse<Result>> {
    return this.genericService.getAll<getAllResponse<Result>>(this.apiUrl);
  }

  getResult(id: number): Observable<getAllResponse<Result>> {
    return this.genericService.getOne<getAllResponse<Result>>(this.apiUrl, id);
  }

  createResult(result: Result): Observable<getAllResponse<Result>> {
    return this.genericService.create<Result, getAllResponse<Result>>(
      this.apiUrl,
      result
    );
  }

  updateResult(result: Result, id: number): Observable<getAllResponse<Result>> {
    return this.genericService.update<Result, getAllResponse<Result>>(
      this.apiUrl,
      id,
      result
    );
  }

  deleteResult(id: number): Observable<getAllResponse<Result>> {
    return this.genericService.delete<getAllResponse<Result>>(this.apiUrl, id);
  }
}
