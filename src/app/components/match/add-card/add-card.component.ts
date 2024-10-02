import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  inject,
  Input,
  WritableSignal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Card, CardPart, CardType } from '@app/models/card';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { CardService } from '@app/services/api_services/card.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

@Component({
  selector: 'app-add-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-card.component.html',
  styleUrl: './add-card.component.scss',
})
export class AddCardComponent {
  @Input() whichFormIsActive!: WritableSignal<FormType>;
  public cardForm = new FormGroup({
    team: new FormControl('', [Validators.required]),
    player: new FormControl('', [Validators.required]),
    card: new FormControl('', [Validators.required]),
    minute: new FormControl('', [Validators.required]),
    part: new FormControl('', [Validators.required]),
  });

  public localTeam: Team | null = null;
  public visitorTeam: Team | null = null;
  public localPlayers: TeamPlayerWithDetails[] = [];
  public visitorPlayers: TeamPlayerWithDetails[] = [];
  public cards: Card[] = [];
  public whatTeamIsSelected = 'LOCAL_TEAM';

  private _userState = inject(UserStateService);
  private _cardService = inject(CardService);
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
        // this.cards = matchData.cards;

        this.cardForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
    });

    this.cardForm.controls.team.valueChanges.subscribe((teamId) => {
      const localTeamId = String(this.localTeam?.id_team);
      this.whatTeamIsSelected =
        teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
      this.cardForm.controls.player.setValue('');
    });
  }

  onSubmit(e: Event) {
    e.preventDefault();
    console.log(this.cardForm.value);
    this._cardService
      .createCard({
        card_type: this.cardForm.value.card as CardType,
        minute: Number(this.cardForm.value.minute),
        part: this.cardForm.value.part as CardPart,
        match_id: Number(this._matchState.match()?.match.id_match),
        player_id: Number(this.cardForm.value.player),
        team_id: Number(this.cardForm.value.team),
        user_id: Number(this._userState.me()?.id_user),
        competition_id: Number(
          this._matchState.match()?.match.competition.id_competition
        ),
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          const playerName = this.getNameOfPlayer(
            Number(this.cardForm.value.player)
          );
          const cards = this._matchState.match()?.cards || [];
          this._matchState.updateMatch({
            ...this._matchState.match(),
            cards: [...cards, res.data],
          });
          this._globalModalService.openModal(
            'Tarjeta en el campo!',
            `Tarjeta para ${playerName}!`
          );
        },
        error: (err) => {
          console.log(err);
          this._globalModalService.openModal(
            'No ha habido tarjeta!',
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

  onCancel(e: Event) {
    e.preventDefault();
    this.whichFormIsActive.set(null);
  }
}
