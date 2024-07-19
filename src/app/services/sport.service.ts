import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../models/api';
import { Sport } from '../models/sport';

@Injectable({
  providedIn: 'root',
})
export class SportService {
  private apiUrl = `${config.apiUrl}/sports`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getSports(): Observable<getAllResponse<Sport>> {
    return this.genericService.getAll<getAllResponse<Sport>>(this.apiUrl);
  }

  getSport(id: number): Observable<getAllResponse<Sport>> {
    return this.genericService.getOne<getAllResponse<Sport>>(this.apiUrl, id);
  }

  createSport(sport: Sport): Observable<getAllResponse<Sport>> {
    return this.genericService.create<Sport, getAllResponse<Sport>>(
      this.apiUrl,
      sport
    );
  }

  updateSport(sport: Sport, id: number): Observable<getAllResponse<Sport>> {
    return this.genericService.update<Sport, getAllResponse<Sport>>(
      this.apiUrl,
      id,
      sport
    );
  }

  deleteSport(id: number): Observable<getAllResponse<Sport>> {
    return this.genericService.delete<getAllResponse<Sport>>(this.apiUrl, id);
  }
}
