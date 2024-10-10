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
import {
  Card,
  CardsPlayerStats,
  CardWithPlayer,
  GetCardsParams,
  GetCardsPlayerStatsResponse,
} from '../../models/card';
import { GenericApiService } from './generic-api.service';
import { urlParser } from '@app/utils/utils';
import { buildHttpParams } from '@app/utils/http-utils';

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

  getPlayerCards(
    params?: Partial<GetCardsParams>
  ): Observable<GetCardsPlayerStatsResponse> {
    const httpParams = buildHttpParams(params);
    return this.genericService.getAll<GetCardsPlayerStatsResponse>(
      CardService.apiUrl + '/cards-stats',
      {
        params: httpParams,
      }
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
