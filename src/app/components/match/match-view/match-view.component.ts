import {
  Component,
  effect,
  inject,
  Input,
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
import {
  MatchPlayerWithDetails,
  MatchPlayerWithDetailsAndGoals,
} from '@app/models/matchPlayer';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Match } from '@app/models/match';
import { MatchService } from '@app/services/api_services/match.service';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { config } from '@app/config/config';
import { Card, CardWithPlayer } from '@app/models/card';
import { Foul, FoulWithPlayer } from '@app/models/foul';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

@Component({
  selector: 'app-match-view',
  standalone: true,
  imports: [
    AddGoalComponent,
    AddCardComponent,
    AddFoulComponent,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './match-view.component.html',
  styleUrl: './match-view.component.scss',
})
export class MatchViewComponent {
  public imgUrl = config.IMG_URL;
  public whichFormIsActive = signal<FormType>(null);
  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  // public localPlayers: TeamPlayerDetailsAndGoals[] = [];
  // public visitorPlayers: TeamPlayerDetailsAndGoals[] = [];
  public localPlayers: MatchPlayerWithDetailsAndGoals[] = [];
  public visitorPlayers: MatchPlayerWithDetailsAndGoals[] = [];
  public goals: WritableSignal<GoalWithPlayer[]> = signal([]);
  public cards: WritableSignal<CardWithPlayer[]> = signal([]);
  public fouls: WritableSignal<FoulWithPlayer[]> = signal([]);
  public localGoals: Goal[] = [];
  public visitorGoals: Goal[] = [];
  public matchPlayers: MatchPlayerWithDetails[] = [];
  public matchPlayersIds: number[] = [];
  public status = '';

  private _isFirstGoalLoad = true;

  private _matchState = inject(MatchStateService);

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
      const localTeamId = this._matchState.localTeam()?.id_team;
      this.goals = this._matchState.goals;
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
    });
    effect(() => {
      this.cards = this._matchState.cards;
    });
    effect(() => {
      this.fouls = this._matchState.fouls;
    });
    effect(() => {
      const matchPlayers = this._matchState.matchPlayers();
      if (matchPlayers) {
        this.matchPlayers = matchPlayers;
        this.matchPlayersIds = this.matchPlayers.map(
          (matchPlayer) => matchPlayer.player_id
        );
        const localPlayers = matchPlayers.filter(
          (matchPlayer) => matchPlayer.team_id === this.localTeam?.id_team
        );
        this.localPlayers = localPlayers.map((matchPlayer) => ({
          ...matchPlayer,
          goals: this.goals().filter(
            (goal) => goal.player_id === matchPlayer.player_id
          ),
        }));

        const visitorPlayers = matchPlayers.filter(
          (matchPlayer) => matchPlayer.team_id !== this.localTeam?.id_team
        );
        this.visitorPlayers = visitorPlayers.map((matchPlayer) => ({
          ...matchPlayer,
          goals: this.goals().filter(
            (goal) => goal.player_id !== matchPlayer.player_id
          ),
        }));
      }
    });

    effect(() => {
      const matchData = this._matchState.match();
      if (matchData) {
        this.status = matchData.status;
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

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
    console.log('LOCAL PLAYERS', this.localPlayers);
    this.visitorPlayers = this._updatePlayerGoals(
      this.visitorPlayers,
      this.visitorGoals
    );
  }

  private _updatePlayerGoals(
    players: MatchPlayerWithDetailsAndGoals[],
    goals: GoalWithPlayer[]
  ): MatchPlayerWithDetailsAndGoals[] {
    return players.map((player) => ({
      ...player,
      goals: goals.filter((goal) => goal.player_id === player.player_id),
    }));
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
}
