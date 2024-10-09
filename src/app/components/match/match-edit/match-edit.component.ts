import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  WritableSignal,
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
import { Match, MatchStatus, MatchWithDetails } from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import {
  distinctUntilChanged,
  firstValueFrom,
  Subject,
  Subscription,
  takeUntil,
} from 'rxjs';
import { config } from '@app/config/config';
import { StandingsService } from '@app/services/api_services/standings.service';
import { Standings } from '@app/models/standings';
import { Card, CardWithPlayer } from '@app/models/card';
import { Foul, FoulWithPlayer } from '@app/models/foul';
import { CardService } from '@app/services/api_services/card.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { SpinnerService } from '@app/services/spinner.service';
import { getMinute } from '@app/helpers/match';
import { myAnimations } from '@app/helpers/matchEdit';

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
  animations: [myAnimations()],
})
export class MatchEditComponent implements OnInit {
  public imgUrl = config.IMG_URL;
  public whichFormIsActive = signal<FormType>(null);
  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerDetailsAndGoals[] = [];
  public visitorPlayers: TeamPlayerDetailsAndGoals[] = [];
  public goals: WritableSignal<GoalWithPlayer[]> = signal([]);
  public cards: WritableSignal<CardWithPlayer[]> = signal([]);
  public fouls: WritableSignal<FoulWithPlayer[]> = signal([]);
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

  private _isFirstGoalLoad = true;
  private _matchState = inject(MatchStateService);
  private _globalModal = inject(GlobalModalService);
  private _spinnerService = inject(SpinnerService);
  private _matchPlayerService = inject(MatchPlayerService);
  private _matchService = inject(MatchService);
  private _standingsService = inject(StandingsService);
  private _cardService = inject(CardService);
  private _subscriptins: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor() {
    this._setupEffects();
  }

  private _setupEffects() {
    effect(() => {
      const localTeam = this._matchState.localTeam();
      const visitorTeam = this._matchState.visitorTeam();
      if (localTeam) this.localTeam = localTeam;
      if (visitorTeam) this.visitorTeam = visitorTeam;
    });
    effect(() => {
      const localPlayers = this._matchState.localPlayers();
      const visitorPlayers = this._matchState.visitorPlayers();
      if (localPlayers) this.localPlayers = localPlayers;
      if (visitorPlayers) this.visitorPlayers = visitorPlayers;
    });

    effect(() => {
      const localTeamId = this._matchState.localTeam()?.id_team;
      const goals = this._matchState.goals;
      if (goals) {
        this.goals = goals;
        if (this.goals().length > 0 && localTeamId && this._isFirstGoalLoad) {
          this.updateGoals(localTeamId);
          this._isFirstGoalLoad = false;
        }
        if (
          this.goals().length > 0 &&
          this.localTeam?.id_team &&
          !this._isFirstGoalLoad
        ) {
          this.updateGoals(this.localTeam.id_team);
        }
      }
    });
    effect(() => {
      const cards = this._matchState.cards;
      if (cards) this.cards = cards;
    });
    effect(() => {
      const fouls = this._matchState.fouls;
      if (fouls) this.fouls = fouls;
    });
    effect(() => {
      const matchPlayers = this._matchState.matchPlayers();
      if (matchPlayers) {
        this.matchPlayers = matchPlayers;
        this.matchPlayersIds = this.matchPlayers.map(
          (matchPlayer) => matchPlayer.player_id
        );
      }
    });
    effect(() => {
      const match = this._matchState.match();
      if (match) {
        this.matchStatus.setValue(match.status, { emitEvent: false });
        this.prevMatchStatus = match.status;
      }
    });
  }

  ngOnInit(): void {
    this.matchStatus.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(async (value) => {
        const matchId = this._matchState.match()?.id_match;
        if (matchId && value)
          this.updateMatch({ status: value as MatchStatus }, matchId);
        await this.updateStandings(value);
        this.prevMatchStatus = value;
      });
  }

  updateGoals(localTeamId: number) {
    this.localGoals = this.goals().filter(
      (goal) => goal.team_id === localTeamId
    );
    this.visitorGoals = this.goals().filter(
      (goal) => goal.team_id !== localTeamId
    );

    this.localPlayers = this._updatePlayerGoals(
      this.localPlayers,
      this.localGoals
    );
    this.visitorPlayers = this._updatePlayerGoals(
      this.visitorPlayers,
      this.visitorGoals
    );
  }

  private _updatePlayerGoals(
    players: TeamPlayerDetailsAndGoals[],
    goals: GoalWithPlayer[]
  ): TeamPlayerDetailsAndGoals[] {
    return players.map((player) => ({
      ...player,
      goals: goals.filter((goal) => goal.player_id === player.player_id),
    }));
  }

  async updateTeamStandings(
    teamId: number,
    goalsFor: number,
    goalsAgainst: number,
    value: MatchStatus
  ): Promise<any> {
    if (!teamId) return;
    try {
      const standing = await firstValueFrom(
        this._standingsService.getStandings({
          competition_id: this._matchState.match()?.competition.id_competition,
          team_id: teamId,
        })
      );
      const teamStanding = standing.data.items[0];

      const isVictory = goalsFor > goalsAgainst;
      const isDraw = goalsFor === goalsAgainst;
      const isDefeat = goalsFor < goalsAgainst;

      let dataToUpdate: Partial<Standings> | null = null;
      const points = () => {
        if (isVictory) return 3;
        if (isDraw) return 1;
        return 0;
      };

      if (value === 'FINISHED' && this.prevMatchStatus !== 'FINISHED') {
        dataToUpdate = {
          goals_for: teamStanding.goals_for + goalsFor,
          goals_against: teamStanding.goals_against + goalsAgainst,
          victories: isVictory
            ? teamStanding.victories + 1
            : teamStanding.victories,
          draws: isDraw ? teamStanding.draws + 1 : teamStanding.draws,
          losses: isDefeat ? teamStanding.losses + 1 : teamStanding.losses,
          points: teamStanding.points + points(),
          matches_played: teamStanding.matches_played + 1,
        };
      } else if (value !== 'FINISHED' && this.prevMatchStatus === 'FINISHED') {
        dataToUpdate = {
          goals_for: teamStanding.goals_for - goalsFor,
          goals_against: teamStanding.goals_against - goalsAgainst,
          victories: isVictory
            ? teamStanding.victories - 1
            : teamStanding.victories,
          draws: isDraw ? teamStanding.draws - 1 : teamStanding.draws,
          losses: isDefeat ? teamStanding.losses - 1 : teamStanding.losses,
          points: teamStanding.points - points(),
          matches_played: teamStanding.matches_played - 1,
        };
      }

      if (!dataToUpdate) return;

      const response = await firstValueFrom(
        this._standingsService.updateStanding(
          dataToUpdate,
          teamStanding.id_standings
        )
      );

      return response;
    } catch (error) {
      console.error('Error updating standings: ', error);
      return null;
    }
  }

  async updateStandings(value: MatchStatus): Promise<void> {
    const localTeamId = this._matchState.match()?.local_team.id_team;
    const visitorTeamId = this._matchState.match()?.visitor_team.id_team;

    // Actualitzar standings de l'equip local
    if (localTeamId && visitorTeamId) {
      this.updateGoals(localTeamId);
      const repsonse = await Promise.all([
        this.updateTeamStandings(
          localTeamId,
          this.localGoals.length,
          this.visitorGoals.length,
          value
        ),
        this.updateTeamStandings(
          visitorTeamId,
          this.visitorGoals.length,
          this.localGoals.length,
          value
        ),
      ]);
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

  onTogglePlayer(player: TeamPlayerWithDetails, event: Event) {
    event.preventDefault();
    if (this.matchStatus.value === 'FINISHED') return;
    const isLocalPlayer = true;
    if (this.matchPlayersIds.includes(player.player_id)) {
      this.deleteMatchPlayer(player, isLocalPlayer);
    } else {
      this.createMatchPlayer(player, isLocalPlayer);
    }
  }

  private async deleteMatchPlayer(
    player: TeamPlayerWithDetails,
    isLocalPlayer: boolean
  ) {
    const matchPlayer = this._matchState
      .match()
      ?.matchPlayers.find(
        (matchPlayer) => matchPlayer.player_id === player.player_id
      );
    if (!matchPlayer?.id_match_player) return;

    try {
      await firstValueFrom(
        this._matchPlayerService.deleteMatchPlayer(matchPlayer.id_match_player)
      );

      this._matchState.updateMatch({
        ...this._matchState.match(),
        matchPlayers: this._matchState
          .match()
          ?.matchPlayers.filter(
            (matchPlayer) => matchPlayer.player_id !== player.player_id
          ),
      });
      // this._updateTeamPlayers(isLocalPlayer);
    } catch (error) {
      console.error('Error deleting match player: ', error);
      throw error;
    }
  }

  // private _updateTeamPlayers(isLocalPlayer: boolean) {
  //   if (isLocalPlayer) {
  //     this._matchState.localPlayers.update((prev) => {
  //       if (!prev) return prev;
  //       return prev.filter((player) => player.player_id !== player.player_id);
  //     });
  //   } else {
  //     this._matchState.visitorPlayers.update((prev) => {
  //       if (!prev) return prev;
  //       return prev.filter((player) => player.player_id !== player.player_id);
  //     });
  //   }
  // }

  private async createMatchPlayer(
    player: TeamPlayerWithDetails,
    isLocalPlayer: boolean
  ) {
    try {
      const currentMatch = this._matchState.match();
      if (!currentMatch) return;

      const newMatchPlayer = {
        match_id: Number(currentMatch?.id_match),
        player_id: player.player_id,
        team_id: player.team_id,
        user_id: Number(currentMatch?.user_id),
        team_player_id: player.id_team_player,
      };

      const createMatchPlayerResponse = await firstValueFrom(
        this._matchPlayerService.createMatchPlayer(newMatchPlayer)
      );
      if (createMatchPlayerResponse) {
        const matchPlayers = currentMatch.matchPlayers || [];
        this._matchState.matchPlayers.update((prev) => {
          if (!prev) return [createMatchPlayerResponse.data];
          return [...prev, createMatchPlayerResponse.data];
        });
        this._matchState.updateMatch({
          ...currentMatch,
          matchPlayers: [...matchPlayers, createMatchPlayerResponse.data],
        });
      }
    } catch (error) {
      console.error('Error creating match player: ', error);
      throw error;
    }
  }

  private async updateMatch(params: Partial<Match>, matchId: number) {
    try {
      const response = await firstValueFrom(
        this._matchService.updateMatch(params, matchId)
      );
      const matchWithDetails = await firstValueFrom(
        this._matchService.getMatches({ id_match: matchId })
      );

      const updatedMatch = matchWithDetails.data.items[0];

      this._matchState.match.update((prev) => {
        if (!prev) return updatedMatch;
        return { ...prev, ...updatedMatch };
      });
    } catch (error) {
      console.error('Error updating match: ', error);
      throw error;
    }
  }

  updateStateAfterUpdateMatch(match: Match) {
    this._matchState.updateMatch({
      ...this._matchState.match(),
      match: {
        ...this._matchState.match(),
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
    this._matchState.cards.update((prev) => {
      if (!prev) return prev;
      return prev.filter((card) => card.id_card !== cardId);
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

  getGoalName(goal: Goal) {
    const player = this.matchPlayers.find((player) => {
      return player.player_id === goal.player_id;
    });
    return `${player?.player?.name} ${player?.player?.last_name}`;
  }
}
