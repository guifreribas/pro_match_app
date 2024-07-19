import { inject, Injectable } from '@angular/core';
import { config } from '../config/config';
import { Observable } from 'rxjs';
import {
  deleteOneResponse,
  getAllResponse,
  getOneResponse,
  postOneResponse,
  putOneResponse,
} from '../models/api';
import { Card } from '../models/card';
import { GenericApiService } from './generic-api.service';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private apiUrl = `${config.apiUrl}/cards`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCards(): Observable<getAllResponse<Card>> {
    return this.genericService.getAll<getAllResponse<Card>>(this.apiUrl);
  }

  getCard(id: number): Observable<getOneResponse<Card>> {
    return this.genericService.getOne<getOneResponse<Card>>(this.apiUrl, id);
  }

  createCard(card: Card): Observable<postOneResponse<Card>> {
    return this.genericService.create<Card, postOneResponse<Card>>(
      this.apiUrl,
      card
    );
  }

  updateCard(card: Card, id: number): Observable<putOneResponse<Card>> {
    return this.genericService.update<Card, putOneResponse<Card>>(
      this.apiUrl,
      id,
      card
    );
  }

  deleteCard(id: number): Observable<deleteOneResponse> {
    return this.genericService.delete<deleteOneResponse>(this.apiUrl, id);
  }
}
