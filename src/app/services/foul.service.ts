import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { GenericApiService } from './generic-api.service';
import { Observable } from 'rxjs';
import { getAllResponse } from '../models/api';
import { Foul } from '../models/foul';

@Injectable({
  providedIn: 'root',
})
export class FoulService {
  private apiUrl = `${config.apiUrl}/fouls`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getFouls(): Observable<getAllResponse<Foul>> {
    return this.genericService.getAll<getAllResponse<Foul>>(this.apiUrl);
  }

  getFoul(id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.getOne<getAllResponse<Foul>>(this.apiUrl, id);
  }

  createFoul(foul: Foul): Observable<getAllResponse<Foul>> {
    return this.genericService.create<Foul, getAllResponse<Foul>>(
      this.apiUrl,
      foul
    );
  }

  updateFoul(foul: Foul, id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.update<Foul, getAllResponse<Foul>>(
      this.apiUrl,
      id,
      foul
    );
  }

  deleteFoul(id: number): Observable<getAllResponse<Foul>> {
    return this.genericService.delete<getAllResponse<Foul>>(this.apiUrl, id);
  }
}
