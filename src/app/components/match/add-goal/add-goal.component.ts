import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Goal } from '@app/models/goal';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { GoalService } from '@app/services/api_services/goal.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

@Component({
  selector: 'app-add-goal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-goal.component.html',
  styleUrl: './add-goal.component.scss',
})
export class AddGoalComponent {
  public goalForm = new FormGroup({
    team: new FormControl('', [Validators.required]),
    player: new FormControl('', [Validators.required]),
    minute: new FormControl('', [Validators.required]),
    part: new FormControl('', [Validators.required]),
  });

  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerWithDetails[] = [];
  public visitorPlayers: TeamPlayerWithDetails[] = [];
  public goals: Goal[] = [];
  public whatTeamIsSelected = 'LOCAL_TEAM';

  private _userState = inject(UserStateService);
  private _goalService = inject(GoalService);
  private _matchState = inject(MatchStateService);
  private _globalModalService = inject(GlobalModalService);

  constructor() {
    effect(() => {
      const matchData = this._matchState.match();
      if (matchData) {
        this.localTeam = matchData.localTeam;
        this.visitorTeam = matchData.visitorTeam;
        this.localPlayers = matchData.localPlayers;
        this.visitorPlayers = matchData.visitorPlayers;
        this.goals = matchData.goals;

        this.goalForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
    });

    this.goalForm.controls.team.valueChanges.subscribe((teamId) => {
      const localTeamId = String(this.localTeam?.id_team);
      this.whatTeamIsSelected =
        teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
      this.goalForm.controls.player.setValue('');
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    console.log(this.goalForm.value);
    this._goalService
      .createGoal({
        minute: this.goalForm.value.minute,
        part: this.goalForm.value.part,
        player_id: Number(this.goalForm.value.player),
        team_id: Number(this.goalForm.value.team),
        match_id: this._matchState.match()?.match.id_match,
        user_id: this._userState.me()?.id_user,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          const playerName = this.getNameOfPlayer(
            Number(this.goalForm.value.player)
          );
          this._globalModalService.openModal(
            'Gol en el campo!',
            `Ha marcado ${playerName}!`
          );
        },
        error: (err) => {
          console.log(err);
          this._globalModalService.openModal(
            'No ha habido gol!',
            'Ha ocurrido un error. Prueba de nuevo!'
          );
        },
      });
  }

  getNameOfPlayer(playerId: number) {
    let player = this.localPlayers.find(
      (player) => player.player_id === playerId
    );
    if (!player) {
      player = this.visitorPlayers.find(
        (player) => player.player_id === playerId
      );
    }
    return player?.player?.name;
  }
}
