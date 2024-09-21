import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Foul, FoulPart } from '@app/models/foul';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { FoulService } from '@app/services/api_services/foul.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

@Component({
  selector: 'app-add-foul',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-foul.component.html',
  styleUrl: './add-foul.component.scss',
})
export class AddFoulComponent {
  public foulForm = new FormGroup({
    team: new FormControl('', [Validators.required]),
    player: new FormControl('', [Validators.required]),
    minute: new FormControl('', [Validators.required]),
    part: new FormControl('', [Validators.required]),
  });

  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerWithDetails[] = [];
  public visitorPlayers: TeamPlayerWithDetails[] = [];
  public fouls: Foul[] = [];
  public whatTeamIsSelected = 'LOCAL_TEAM';

  private _userState = inject(UserStateService);
  private _foulService = inject(FoulService);
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
        // this.fouls = matchData.fouls;

        this.foulForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
    });

    this.foulForm.controls.team.valueChanges.subscribe((teamId) => {
      const localTeamId = String(this.localTeam?.id_team);
      this.whatTeamIsSelected =
        teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
      this.foulForm.controls.player.setValue('');
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    console.log(this.foulForm.value);
    this._foulService
      .createFoul({
        minute: Number(this.foulForm.value.minute),
        part: this.foulForm.value.part as FoulPart,
        player_id: Number(this.foulForm.value.player),
        team_id: Number(this.foulForm.value.team),
        match_id: Number(this._matchState.match()?.match.id_match),
        user_id: Number(this._userState.me()?.id_user),
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          const playerName = this.getNameOfPlayer(
            Number(this.foulForm.value.player)
          );
          this._globalModalService.openModal(
            'Falta en el campo!',
            `Falta para ${playerName}!`
          );
        },
        error: (err) => {
          console.log(err);
          this._globalModalService.openModal(
            'No ha habido falta!',
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
