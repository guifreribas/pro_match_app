import { Component, effect, inject, Input, signal } from '@angular/core';
import { AddGoalComponent } from '../add-goal/add-goal.component';
import { AddCardComponent } from '../add-card/add-card.component';
import { AddFoulComponent } from '../add-foul/add-foul.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { Goal } from '@app/models/goal';
import { MatchPlayerService } from '@app/services/api_services/match-player.service';
import { MatchPlayerWithDetails } from '@app/models/matchPlayer';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [AddGoalComponent, AddCardComponent, AddFoulComponent, CommonModule],
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
export class MatchEditComponent {
  public wichFormIsActive = signal<FormType>(null);
  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerWithDetails[] = [];
  public visitorPlayers: TeamPlayerWithDetails[] = [];
  public goals: Goal[] = [];
  public localGoals: Goal[] = [];
  public visitorGoals: Goal[] = [];
  public matchPlayers: MatchPlayerWithDetails[] = [];
  public matchPlayersIds: number[] = [];

  private _matchState = inject(MatchStateService);
  private _matchPlayerService = inject(MatchPlayerService);

  constructor() {
    effect(() => {
      const matchData = this._matchState.match();
      if (matchData) {
        this.localTeam = matchData.localTeam;
        this.visitorTeam = matchData.visitorTeam;
        this.localPlayers = matchData.localPlayers;
        this.visitorPlayers = matchData.visitorPlayers;
        this.goals = matchData.goals;
        this.localGoals = this.goals.filter(
          (goal) => goal.team_id === this.localTeam?.id_team
        );
        this.visitorGoals = this.goals.filter(
          (goal) => goal.team_id === this.visitorTeam?.id_team
        );
        this.matchPlayers = matchData.matchPlayers;
        this.matchPlayersIds = matchData.matchPlayers.map(
          (matchPlayer) => matchPlayer.player_id
        );
      }
    });
  }

  setFormType(formType: FormType): string | null {
    if (this.wichFormIsActive() === formType) {
      this.wichFormIsActive.set(null);
      return formType;
    }
    if (this.wichFormIsActive() !== null) {
      this.wichFormIsActive.set(null);
      setTimeout(() => {
        this.wichFormIsActive.set(formType);
      }, 350);
      return formType;
    }
    this.wichFormIsActive.set(formType);
    return formType;
  }

  getButtonClasses(type: FormType) {
    if (this.wichFormIsActive() === type) {
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
    console.log(matchPlayer);
    if (!matchPlayer?.id_match_player) return;
    this._matchPlayerService
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
    return;
  }

  private createMatchPlayer(player: TeamPlayerWithDetails) {
    this._matchPlayerService
      .createMatchPlayer({
        match_id: Number(this._matchState.match()?.match.id_match),
        player_id: player.player_id,
        team_id: player.team_id,
        user_id: Number(this._matchState.match()?.match.user_id),
        team_player_id: player.id_team_player,
      })
      .subscribe({
        next: (res) => {
          const matchPlayers = this._matchState.match()?.matchPlayers || [];
          this._matchState.updateMatch({
            ...this._matchState.match(),
            matchPlayers: [...matchPlayers, res.data],
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
