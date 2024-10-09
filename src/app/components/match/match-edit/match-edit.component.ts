import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { AddGoalComponent } from '../add-goal/add-goal.component';
import { AddCardComponent } from '../add-card/add-card.component';
import { AddFoulComponent } from '../add-foul/add-foul.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { Team } from '@app/models/team';
import {
  TeamPlayerDetailsAndGoals,
  TeamPlayerWithDetails,
} from '@app/models/team-player';
import { Goal, GoalWithPlayer } from '@app/models/goal';
import { MatchPlayerService } from '@app/services/api_services/match-player.service';
import { MatchPlayerWithDetails } from '@app/models/matchPlayer';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Match, MatchStatus } from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import { distinctUntilChanged, firstValueFrom, Subscription } from 'rxjs';
import { config } from '@app/config/config';
import { StandingsService } from '@app/services/api_services/standings.service';
import { Standings } from '@app/models/standings';
import { Card, CardWithPlayer } from '@app/models/card';
import { Foul, FoulWithPlayer } from '@app/models/foul';
import { CardService } from '@app/services/api_services/card.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { SpinnerService } from '@app/services/spinner.service';
import { getMinute } from '@app/helpers/match';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

interface GetMatchMinutParams {
  goal?: Goal;
  card?: Card;
  foul?: Foul;
}

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [
    AddGoalComponent,
    AddCardComponent,
    AddFoulComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.scss',
  animations: [
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px' }),
        animate('0.3s ease-in', style({ opacity: 1, maxHeight: '1000px' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, maxHeight: '1000px' }),
        animate('0.3s ease-in', style({ opacity: 0, maxHeight: '0px' })),
      ]),
    ]),
    trigger('starAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('0.2s ease-in', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('0s ease-in', style({ opacity: 0, transform: 'scale(0)' })),
      ]),
    ]),
  ],
})
export class MatchEditComponent implements OnInit, OnDestroy {
  public imgUrl = config.IMG_URL;
  public whichFormIsActive = signal<FormType>(null);
  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerDetailsAndGoals[] = [];
  public visitorPlayers: TeamPlayerDetailsAndGoals[] = [];
  public goals: GoalWithPlayer[] = [];
  public cards: CardWithPlayer[] = [];
  public fouls: FoulWithPlayer[] = [];
  public localGoals: Goal[] = [];
  public visitorGoals: Goal[] = [];
  public matchPlayers: MatchPlayerWithDetails[] = [];
  public matchPlayersIds: number[] = [];
  public prevMatchStatus: MatchStatus | null = null;

  public partMap = {
    FIRST_HALF: '1ª Parte',
    SECOND_HALF: '2ª Parte',
    EXTRA_TIME_FIRST_HALF: 'Primera parte tiempo extra',
    EXTRA_TIME_SECOND_HALF: 'Segunda parte tiempo extra',
    PENALTIES: 'Penaltis',
  };

  public matchStatus: FormControl = new FormControl(null);

  private _matchState = inject(MatchStateService);
  private _globalModal = inject(GlobalModalService);
  private _spinnerService = inject(SpinnerService);

  private _matchPlayerService = inject(MatchPlayerService);
  private _matchService = inject(MatchService);
  private _standingsService = inject(StandingsService);
  private _cardService = inject(CardService);
  private _subscriptions: Subscription = new Subscription();

  constructor() {
    effect(() => {
      const matchData = this._matchState.match();
      if (matchData) {
        this.localTeam = matchData.localTeam;
        this.visitorTeam = matchData.visitorTeam;
        this.localPlayers = matchData.localPlayers;
        this.visitorPlayers = matchData.visitorPlayers;
        this.goals = matchData.goals || [];
        this.cards = matchData.cards || [];
        this.fouls = matchData.fouls || [];
        if (matchData.goals.length > 0) {
          this.goals.forEach((goal) => {
            if (goal.team_id === this.localTeam?.id_team) {
              this.localGoals.push(goal);
              this.localPlayers = this.localPlayers.map((player) => {
                if (player.player_id === goal.player_id)
                  return { ...player, goals: [goal] };
                return player;
              });
            } else {
              this.visitorGoals.push(goal);
              this.visitorPlayers = this.visitorPlayers.map((player) => {
                if (player.player_id === goal.player_id)
                  return { ...player, goals: [goal] };
                return player;
              });
            }
          });
        }
        this.matchPlayers = matchData.matchPlayers;
        this.matchPlayersIds = matchData.matchPlayers.map(
          (matchPlayer) => matchPlayer.player_id
        );

        this.matchStatus.setValue(matchData.match.status, { emitEvent: false });
        this.prevMatchStatus = matchData.match.status;
      }
    });
  }

  ngOnInit(): void {
    const matchStatusSub = this.matchStatus.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(async (value) => {
        console.log('MATCH STATUS', value);
        const matchId = this._matchState.match()?.match.id_match;
        if (matchId && value)
          this.updateMatch({ status: value as MatchStatus }, matchId);

        await this.updateLocalStandings(value);
        await this.updateVisitorStandings(value);
        this.prevMatchStatus = value;
      });
    this._subscriptions.add(matchStatusSub);
  }

  ngOnDestroy(): void {
    this._subscriptions.unsubscribe();
  }

  async updateLocalStandings(value: MatchStatus) {
    const localTeamId = this._matchState.match()?.match.local_team.id_team;
    if (!localTeamId) return;
    try {
      const standing = await firstValueFrom(
        this._standingsService.getStandings({
          competition_id:
            this._matchState.match()?.match.competition.id_competition,
          team_id: localTeamId,
        })
      );
      const localStndings = standing.data.items[0];
      console.log('STANDINGS', standing);
      const isVictory = this.localGoals.length > localStndings.goals_for;
      const isDraw = this.localGoals.length === localStndings.goals_for;
      const isDefeat = this.localGoals.length < localStndings.goals_for;
      let dataToUpdate: Partial<Standings> | null = null;
      if (value === 'FINISHED' && this.prevMatchStatus !== 'FINISHED') {
        dataToUpdate = {
          goals_for: localStndings.goals_for + this.localGoals.length,
          goals_against: localStndings.goals_against + this.visitorGoals.length,
          victories: isVictory
            ? localStndings.victories + 1
            : localStndings.victories,
          draws: isDraw ? localStndings.draws + 1 : localStndings.draws,
          losses: isDefeat ? localStndings.losses + 1 : localStndings.losses,
        };
      } else if (value !== 'FINISHED' && this.prevMatchStatus === 'FINISHED') {
        dataToUpdate = {
          goals_for: localStndings.goals_for - this.localGoals.length,
          goals_against: localStndings.goals_against - this.visitorGoals.length,
          victories: isVictory
            ? localStndings.victories - 1
            : localStndings.victories,
          draws: isDraw ? localStndings.draws - 1 : localStndings.draws,
          losses: isDefeat ? localStndings.losses - 1 : localStndings.losses,
        };
      }
      console.log('DATA TO UPDATE', dataToUpdate);
      if (!dataToUpdate) return;
      const response = await firstValueFrom(
        this._standingsService.updateStanding(dataToUpdate, localTeamId)
      );

      console.log('STANDINGS', response);
      return response;
    } catch (error) {
      console.error('Error updating standings: ', error);
      return null;
    }
  }

  async updateVisitorStandings(value: MatchStatus) {
    const visitorTeamId = this._matchState.match()?.match.visitor_team.id_team;
    if (!visitorTeamId) return;
    try {
      const standing = await firstValueFrom(
        this._standingsService.getStandings({
          competition_id:
            this._matchState.match()?.match.competition.id_competition,
          team_id: visitorTeamId,
        })
      );
      const visitorStndings = standing.data.items[0];
      console.log('STANDINGS', standing);
      const isVictory = this.visitorGoals.length > visitorStndings.goals_for;
      const isDraw = this.visitorGoals.length === visitorStndings.goals_for;
      const isDefeat = this.visitorGoals.length < visitorStndings.goals_for;
      let dataToUpdate: Partial<Standings> | null = null;
      if (value === 'FINISHED' && this.prevMatchStatus !== 'FINISHED') {
        dataToUpdate = {
          goals_for: visitorStndings.goals_for + this.visitorGoals.length,
          goals_against: visitorStndings.goals_against + this.localGoals.length,
          victories: isVictory
            ? visitorStndings.victories + 1
            : visitorStndings.victories,
          draws: isDraw ? visitorStndings.draws + 1 : visitorStndings.draws,
          losses: isDefeat
            ? visitorStndings.losses + 1
            : visitorStndings.losses,
        };
      } else if (value !== 'FINISHED' && this.prevMatchStatus === 'FINISHED') {
        dataToUpdate = {
          goals_for: visitorStndings.goals_for - this.visitorGoals.length,
          goals_against: visitorStndings.goals_against - this.localGoals.length,
          victories: isVictory
            ? visitorStndings.victories - 1
            : visitorStndings.victories,
          draws: isDraw ? visitorStndings.draws - 1 : visitorStndings.draws,
          losses: isDefeat
            ? visitorStndings.losses - 1
            : visitorStndings.losses,
        };
      }
      console.log('DATA TO UPDATE', dataToUpdate);
      if (!dataToUpdate) return;
      const response = await firstValueFrom(
        this._standingsService.updateStanding(dataToUpdate, visitorTeamId)
      );

      console.log('STANDINGS', response);
      return response;
    } catch (error) {
      console.error('Error updating standings: ', error);
      return null;
    }
  }

  setFormType(formType: FormType): string | null {
    if (this.whichFormIsActive() === formType) {
      this.whichFormIsActive.set(null);
      return formType;
    }
    if (this.whichFormIsActive() !== null) {
      this.whichFormIsActive.set(null);
      setTimeout(() => {
        this.whichFormIsActive.set(formType);
      }, 350);
      return formType;
    }
    this.whichFormIsActive.set(formType);
    return formType;
  }

  getButtonClasses(type: FormType) {
    if (this.whichFormIsActive() === type) {
      return {
        'bg-primary-900': true,
        'ring-primary-300': true,
      };
    }
    return {};
  }

  onTogglePlayer(player: TeamPlayerWithDetails) {
    if (this.matchPlayersIds.includes(player.player_id)) {
      this.deleteMatchPlayer(player);
      return;
    }
    this.createMatchPlayer(player);
  }

  private deleteMatchPlayer(player: TeamPlayerWithDetails) {
    const matchPlayer = this._matchState
      .match()
      ?.matchPlayers.find(
        (matchPlayer) => matchPlayer.player_id === player.player_id
      );
    if (!matchPlayer?.id_match_player) return;
    const deleteMatchPlayerSub = this._matchPlayerService
      .deleteMatchPlayer(matchPlayer.id_match_player)
      .subscribe({
        next: (res) => {
          this._matchState.updateMatch({
            ...this._matchState.match(),
            matchPlayers: this._matchState
              .match()
              ?.matchPlayers.filter(
                (matchPlayer) => matchPlayer.player_id !== player.player_id
              ),
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
    this._subscriptions.add(deleteMatchPlayerSub);
  }

  private async createMatchPlayer(player: TeamPlayerWithDetails) {
    try {
      const currentMatch = this._matchState.match();
      if (!currentMatch) return;

      this._spinnerService.setLoading(true);

      const newMatchPlayer = {
        match_id: Number(currentMatch?.match.id_match),
        player_id: player.player_id,
        team_id: player.team_id,
        user_id: Number(currentMatch?.match.user_id),
        team_player_id: player.id_team_player,
      };

      const createMatchPlayerResponse = await firstValueFrom(
        this._matchPlayerService.createMatchPlayer(newMatchPlayer)
      );
      if (createMatchPlayerResponse) {
        const matchPlayers = currentMatch.matchPlayers || [];
        this._matchState.updateMatch({
          ...currentMatch,
          matchPlayers: [...matchPlayers, createMatchPlayerResponse.data],
        });
      }
    } catch (error) {
      console.error('Error creating match player: ', error);
      throw error;
    } finally {
      this._spinnerService.setLoading(false);
    }
  }

  private updateMatch(params: Partial<Match>, matchId: number) {
    const updateMatchSub = this._matchService
      .updateMatch(params, matchId)
      .subscribe({
        next: (res) => {
          this._matchState.updateMatch({
            ...this._matchState.match(),
            match: {
              ...this._matchState.match()?.match,
              ...params,
            },
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
    this._subscriptions.add(updateMatchSub);
  }

  updateStateAfterUpdateMatch(match: Match) {
    this._matchState.updateMatch({
      ...this._matchState.match(),
      match: {
        ...this._matchState.match()?.match,
        ...match,
      },
    });
  }

  getPlayerName(playerId: number) {
    const player = this.matchPlayers.find(
      (player) => player.player_id === playerId
    );
    return `${player?.player?.name} ${player?.player?.last_name}`;
  }

  async onDeleteCard(card: CardWithPlayer) {
    const cardId = card?.id_card;
    if (!cardId) {
      this._showError(
        'Tarjeta no encontrada',
        'Ha ocurrido un error, prueba de nuevo'
      );
      return;
    }
    const deleteResponse = await this.deleteCard(cardId);
    if (deleteResponse) this.updateStateAfterDeleteCard(cardId);
  }

  async deleteCard(cardId: number): Promise<boolean> {
    try {
      this._spinnerService.setLoading(true);
      const response = await firstValueFrom(
        this._cardService.deleteCard(cardId)
      );
      if (!response.success) {
        this._showError(
          'Tarjeta no encontrada',
          'Ha ocurrido un error, prueba de nuevo'
        );
        return false;
      }
      this._showSuccess('Tarjeta eliminada', '');
      return true;
    } catch (error) {
      this._showError('Error', 'No se ha podido eliminar la tarjeta.');
      return false;
    } finally {
      this._spinnerService.setLoading(false);
    }
  }

  updateStateAfterDeleteCard(cardId: number) {
    this._matchState.updateMatch({
      ...this._matchState.match(),
      cards: this.cards.filter((card) => card.id_card !== cardId),
    });
  }

  private _showError(title: string, message: string) {
    this._globalModal.openModal(title, message);
  }

  private _showSuccess(title: string, message: string) {
    this._globalModal.openModal(title, message);
  }

  getMatchMinute(params: GetMatchMinutParams) {
    const { goal, card, foul } = params;
    if (goal?.id_goal)
      return getMinute({ minute: goal.minute, part: goal.part });
    if (card?.id_card)
      return getMinute({ minute: card.minute, part: card.part });
    if (foul?.id_foul)
      return getMinute({ minute: foul.minute, part: foul.part });
    return '';
  }
}
