import { inject, Injectable } from '@angular/core';
import { config } from '../../config/config';
import { Observable } from 'rxjs';
import {
  deleteResponse,
  getAllResponse,
  getOneResponse,
  postResponse,
  updateResponse,
} from '../../models/api';
import { Card } from '../../models/card';
import { GenericApiService } from './generic-api.service';
import { urlParser } from '@app/utils/utils';

interface GetCardsParams {
  q: string;
  page: string;
  user_id: number;
  limit: number;
  match_id: number;
  team_id: number;
  player_id: number;
  competition_id: number;
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private static readonly apiUrl = `${config.apiUrl}/cards`;
  private genericService = inject(GenericApiService);

  constructor() {}

  getCards(params: Partial<GetCardsParams>): Observable<getAllResponse<Card>> {
    const url = urlParser(params, CardService.apiUrl);
    return this.genericService.getAll<getAllResponse<Card>>(url);
  }

  getCard(id: number): Observable<getOneResponse<Card>> {
    return this.genericService.getOne<getOneResponse<Card>>(
      CardService.apiUrl,
      id
    );
  }

  createCard(card: Card): Observable<postResponse<Card>> {
    return this.genericService.create<Card, postResponse<Card>>(
      CardService.apiUrl,
      card
    );
  }

  updateCard(card: Card, id: number): Observable<updateResponse<Card>> {
    return this.genericService.update<Card, updateResponse<Card>>(
      CardService.apiUrl,
      id,
      card
    );
  }

  deleteCard(id: number): Observable<deleteResponse> {
    return this.genericService.delete<deleteResponse>(CardService.apiUrl, id);
  }
}
