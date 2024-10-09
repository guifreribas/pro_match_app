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
import { Card, CardPart, CardType, CardWithPlayer } from '@app/models/card';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { CardService } from '@app/services/api_services/card.service';
import { GlobalModalService } from '@app/services/global-modal.service';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { SpinnerService } from '@app/services/spinner.service';
import { firstValueFrom } from 'rxjs';

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
  private _spinner = inject(SpinnerService);

  constructor() {
    effect(() => {
      const { localTeam, visitorTeam } = this._matchState;
      if (localTeam) {
        this.localTeam = localTeam();
        this.cardForm.controls.team.setValue(String(this.localTeam?.id_team));
      }
      if (visitorTeam) {
        this.visitorTeam = visitorTeam();
      }
    });

    effect(() => {
      const localPlayers = this._matchState.localPlayers();
      const visitorPlayers = this._matchState.visitorPlayers();
      if (localPlayers) this.localPlayers = localPlayers;
      if (visitorPlayers) this.visitorPlayers = visitorPlayers;
    });

    effect(() => {
      const cards = this._matchState.cards();
      if (cards) this.cards = cards;
    });
  }

  ngOnInit(): void {
    this.cardForm.controls.team.valueChanges.subscribe((teamId) => {
      const localTeamId = String(this.localTeam?.id_team);
      this.whatTeamIsSelected =
        teamId === localTeamId ? 'LOCAL_TEAM' : 'VISITOR_TEAM';
      this.cardForm.controls.player.setValue('');
    });
  }

  async onAddCard(e: Event) {
    e.preventDefault();
    try {
      this._spinner.setLoading(true);
      const response = await firstValueFrom(
        this._cardService.createCard({
          card_type: this.cardForm.value.card as CardType,
          minute: Number(this.cardForm.value.minute),
          part: this.cardForm.value.part as CardPart,
          match_id: Number(this._matchState.match()?.id_match),
          player_id: Number(this.cardForm.value.player),
          team_id: Number(this.cardForm.value.team),
          user_id: Number(this._userState.me()?.id_user),
          competition_id: Number(
            this._matchState.match()?.competition.id_competition
          ),
        })
      );
      const playerName = this.getNameOfPlayer(
        Number(this.cardForm.value.player)
      );
      this.updateCardStateAfterCreate(response.data);

      this._globalModalService.openModal(
        'Tarjeta en el campo!',
        `Tarjeta para ${playerName}!`
      );
    } catch (error) {
      console.log(error);
      this._globalModalService.openModal(
        'No ha habido tarjeta!',
        'Ha ocurrido un error. Prueba de nuevo!'
      );
    } finally {
      this._spinner.setLoading(false);
    }
  }

  updateCardStateAfterCreate(card: Card) {
    this._matchState.cards.update((prev) => {
      const matchPlayer = this._matchState
        .matchPlayers()
        .find((player) => player.player_id === card.player_id);
      const player = matchPlayer?.player;
      const newCardWithPlayer: CardWithPlayer = { ...card, player };
      if (!prev) return [newCardWithPlayer];
      return [...prev, newCardWithPlayer];
    });
  }

  getNameOfPlayer(playerId: number) {
    const player = [...this.localPlayers, ...this.visitorPlayers].find(
      ({ player_id }) => player_id === playerId
    );
    return player?.player?.name;
  }

  onCancel(e: Event) {
    e.preventDefault();
    this.whichFormIsActive.set(null);
  }
}
