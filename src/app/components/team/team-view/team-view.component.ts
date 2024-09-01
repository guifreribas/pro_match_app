import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  SimpleChanges,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Team } from '@app/models/team';
import { TeamViewState } from '@app/types/team';
import { config } from '@app/config/config';
import { CommonModule } from '@angular/common';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { TeamService } from '@app/services/api_services/team.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';
import { PlayerService } from '@app/services/api_services/player.service';
import { Player } from '@app/models/player';
import { UserStateService } from '@app/services/global_states/user-state.service';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { AfterViewInit } from '@angular/core';
import { TeamPlayer } from '../../../models/team-player';
import { GlobalModalService } from '@app/services/global-modal.service';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.scss',
})
export class TeamViewComponent implements OnInit {
  @Input() team!: Team | null;
  @Input() teamViewState!: WritableSignal<TeamViewState>;

  @ViewChild('mainContainer', { static: false }) mainContainer!: ElementRef;
  @ViewChild('searchedPlayersContainer', { static: false })
  searchedPlayersContainer!: ElementRef;

  public imgUrl: string = config.IMG_URL;
  public teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  public searchedPlayers = signal<Player[] | null>(null);
  public playerSearchInput: FormControl = new FormControl('');
  public isPlayerCreatedSuccessfully = false;
  public playerForms: { [key: string]: FormGroup } = {};

  private _teamPlayersService = inject(TeamPlayerService);
  private _teamId: number | null = null;
  private _route = inject(ActivatedRoute);
  private _searchSubject = new Subject<string>();
  private _playerService = inject(PlayerService);
  private _userState = inject(UserStateService);
  private _formBuilder = inject(FormBuilder);
  private _globalModalService = inject(GlobalModalService);

  ngOnInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);

    this._teamId = this._route.snapshot.params['id'] ?? null;
    const getTeamPlayersParams = {
      team_id: this._teamId,
      page: '1',
      limit: 50,
      sortBy: 'player_number',
      sortOrder: 'asc',
    };
    this._teamPlayersService.getTeamPlayers(getTeamPlayersParams).subscribe({
      next: (res) => {
        console.log(res);
        this.teamPlayers.set(res.data.items);
      },
      error: (err) => {
        console.log(err);
      },
    });

    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._playerService.getPlayers({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedPlayers.set(res.data.items);
        this.initPlayerForms(res.data.items);
      });
  }

  initPlayerForms(players: Player[]) {
    players.forEach((player) => {
      this.playerForms[player.id_player] = this._formBuilder.group({
        dorsal: [
          '',
          [Validators.required, Validators.min(1), Validators.max(99)],
        ],
      });
    });
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedPlayers.set(null);
      this.mainContainer.nativeElement.style.minHeight = 'auto';
      return;
    }

    if (query.length >= 2) {
      this._searchSubject.next(query);
      this.mainContainer.nativeElement.style.minHeight = '600px';
    }
  }

  handleAddPlayer(playerId: number) {
    console.log('submit');
    if (!this._teamId) return;
    const playerForm = this.playerForms[playerId];
    if (playerForm.invalid) {
      playerForm.markAllAsTouched();
      return;
    }
    console.log({
      team_id: this._teamId,
      player_id: playerId,
      user_id: this._userState.me()!.id_user,
      player_number: this.playerForms[playerId].value.dorsal,
    });
    this._teamPlayersService
      .createTeamPlayer({
        team_id: this._teamId,
        player_id: playerId,
        user_id: this._userState.me()!.id_user,
        player_number: this.playerForms[playerId].value.dorsal,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.teamPlayers.set([...this.teamPlayers(), res.data]);
          console.log(this.teamPlayers());
          this._globalModalService.openModal('Jugador/a añadido', '');
          this.playerSearchInput.setValue('');
          this.searchedPlayers.set(null);
          this.isPlayerCreatedSuccessfully = true;
        },
        error: (err) => {
          console.error(err);
          this._globalModalService.openModal('Error', err.error.message);
          throw err;
        },
      });
  }

  getDorsalControl(playerId: number): FormControl {
    return this.playerForms[playerId].get('dorsal') as FormControl;
  }

  isInvalidDorsal(playerId: number): boolean {
    const control = this.getDorsalControl(playerId);
    return control.invalid && (control.dirty || control.touched);
  }

  handleDeletePlayer(e: Event, TeamPlayer: TeamPlayerWithDetails) {
    e.stopPropagation();
    this._teamPlayersService
      .deleteTeamPlayer(TeamPlayer.id_team_player)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.teamPlayers.update((prev) =>
            prev.filter(
              (player) => player.id_team_player !== TeamPlayer.id_team_player
            )
          );
          console.log(this.teamPlayers());
          this._globalModalService.openModal('Jugador/a eliminado', '');
        },
        error: (err) => {
          console.error(err);
          this._globalModalService.openModal('Error', err.error.message);
          throw err;
        },
      });
  }
}
