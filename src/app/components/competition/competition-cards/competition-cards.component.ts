import { Component, effect, inject, signal } from '@angular/core';
import { config } from '@app/config/config';
import {
  CardsPlayerStats,
  CardWithPlayer,
  GetCardsParams,
  GetCardsPlayerStatsResponse,
} from '@app/models/card';
import { CardService } from '@app/services/api_services/card.service';
import { MatchService } from '@app/services/api_services/match.service';
import { CompetitionStateService } from '@app/services/global_states/competition-state.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-competition-cards',
  standalone: true,
  imports: [],
  templateUrl: './competition-cards.component.html',
  styleUrl: './competition-cards.component.scss',
})
export class CompetitionCardsComponent {
  public imgUrl = config.IMG_URL;
  public playerAvatar = signal<string>('');
  public playerCards = signal<CardsPlayerStats[]>([]);

  private _cardService = inject(CardService);
  private _competitionState = inject(CompetitionStateService);
  private _matchService = inject(MatchService);

  constructor() {
    effect(async () => {
      const competition = this._competitionState.competitions();
      if (competition) {
        const response = await this._getPlayerCards({
          competition_id: competition.id_competition,
          limit: 500,
        });
        console.log('RESPONSE hash', response);
        if (!response) return;
        this.playerCards.set(response);

        const competitionCategoryId =
          competition.competitionCategory.competition_category_id;
        const cardsWithMatches = await this._getCardsWithMatches(
          response,
          competitionCategoryId
        );
        console.log('CARDS WITH MATCHES', cardsWithMatches);
        this.playerCards.set(cardsWithMatches);
      }
    });
  }

  private async _getPlayerCards(
    params: Partial<GetCardsParams>
  ): Promise<CardsPlayerStats[] | null> {
    try {
      const response = await firstValueFrom(
        this._cardService.getPlayerCards(params)
      );
      return response.data;
    } catch (error) {
      console.error('Error getting player cards: ', error);
      return null;
    }
  }

  private async _getCardsWithMatches(
    cards: CardsPlayerStats[],
    competitionCategoryId: number
  ): Promise<CardsPlayerStats[]> {
    try {
      return Promise.all(
        cards.map(async (card) => {
          const match = await firstValueFrom(
            this._matchService.getMatches({
              player_id: card.player_id,
              competition_category_id: competitionCategoryId,
              limit: 100,
            })
          );
          return {
            ...card,
            matches_played: match.data.items.length,
            matches: match.data.items,
          };
        })
      );
    } catch (error) {
      console.error('Error getting cards with matches: ', error);
      throw error;
    }
  }
}
