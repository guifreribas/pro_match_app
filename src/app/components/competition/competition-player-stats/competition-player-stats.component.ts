import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  WritableSignal,
  OnInit,
  effect,
  signal,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RadarComponent } from '@app/components/graphics/radar/radar.component';
import { config } from '@app/config/config';
import { Card } from '@app/models/card';
import { CompetitionWithDetails } from '@app/models/competition';
import { CompetitionTeamWithDetails } from '@app/models/competitionTeam';
import { Goal } from '@app/models/goal';
import { CompetitionCategory, MatchWithDetails } from '@app/models/match';
import { Player } from '@app/models/player';
import { Standings, StandingsWithDetails } from '@app/models/standings';
import { Team } from '@app/models/team';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { CardService } from '@app/services/api_services/card.service';
import { CompetitionTeamService } from '@app/services/api_services/competition-team.service';
import { GoalService } from '@app/services/api_services/goal.service';
import { MatchService } from '@app/services/api_services/match.service';
import { PlayerService } from '@app/services/api_services/player.service';
import { StandingsService } from '@app/services/api_services/standings.service';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { StandingsStateService } from '@app/services/global_states/standings-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-competition-player-stats',
  standalone: true,
  imports: [RadarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './competition-player-stats.component.html',
  styleUrl: './competition-player-stats.component.scss',
})
export class CompetitionPlayerStatsComponent implements OnInit {
  @Input() competition!: WritableSignal<CompetitionWithDetails | null>;
  @ViewChild('playerOneAvatar', { static: false }) playerOneAvatar!: ElementRef;
  @ViewChild('playerTwoAvatar', { static: false }) playerTwoAvatar!: ElementRef;
  public imgUrl = config.IMG_URL;
  public player1Avatar = '';
  public selectorForm = new FormGroup({
    teamOne: new FormControl(''),
    playerOne: new FormControl(''),
    teamTwo: new FormControl(''),
    playerTwo: new FormControl(''),
  });
  public teams: CompetitionTeamWithDetails[] = [];
  public playersTeam1 = signal<TeamPlayerWithDetails[]>([]);
  public playersTeam2 = signal<TeamPlayerWithDetails[]>([]);
  public playerOne = signal<TeamPlayerWithDetails | null>(null);
  public playerTwo = signal<TeamPlayerWithDetails | null>(null);
  public playerOneMatches = signal<MatchWithDetails[]>([]);
  public playerTwoMatches = signal<MatchWithDetails[]>([]);
  public playerOneGoals = signal<Goal[]>([]);
  public playerTwoGoals = signal<Goal[]>([]);
  public playerOneCards = signal<Card[]>([]);
  public playerTwoCards = signal<Card[]>([]);
  public playerOneStandings = signal<StandingsWithDetails | null>(null);
  public playerTwoStandings = signal<StandingsWithDetails | null>(null);

  private _standingsState = inject(StandingsStateService);
  public standings = this._standingsState.standings;

  private prevPlayerOne: any = null;
  private prevPlayerTwo: any = null;

  private _competitionTeamsService = inject(CompetitionTeamService);
  private _userState = inject(UserStateService);
  private _playerService = inject(PlayerService);
  private _matchService = inject(MatchService);
  private _goalService = inject(GoalService);
  private _cardService = inject(CardService);
  private _standingsService = inject(StandingsService);
  private _teamPlayerService = inject(TeamPlayerService);

  public datasets = [
    {
      label: 'My First Dataset',
      data: [65, 59, 90, 81, 55],
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)',
    },
    {
      label: 'My First Dataset',
      data: [30, 64, 76, 72, 85],
      fill: true,
      backgroundColor: 'rgba(40, 160, 255, 0.1)',
      borderColor: 'rgb(40, 160, 255)',
      pointBackgroundColor: 'rgb(40, 160, 255)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(40, 160, 255)',
    },
  ];

  constructor() {
    effect(() => {
      const competitionId = this.competition()?.competitionCategory
        .competition_category_id as
        | CompetitionCategory['id_competition_category']
        | undefined;
      const competition = this.competition();
      console.log('COMPETITION ID', competitionId, competition);
      if (competitionId) {
        console.log('Competition Player Stats', competitionId);
        this._competitionTeamsService
          .getCompetitionTeams({
            competition_category_id: competitionId,
          })
          .subscribe({
            next: (res) => {
              console.log('TEAMS', res);
              this.teams = res.data.items || [];
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    });
  }

  ngOnInit(): void {
    this.selectorForm.controls.teamOne.valueChanges.subscribe(
      async (teamId) => {
        console.log('TEAM ID', teamId);
        if (!teamId) return;
        const teamIdParsed = Number(teamId);
        const playersTeam = await this.getPlayersTeam(teamIdParsed);
        this.playersTeam1.set(playersTeam);
      }
    );

    this.selectorForm.controls.teamTwo.valueChanges.subscribe(
      async (teamId) => {
        console.log('TEAM ID', teamId);
        if (!teamId) return;
        const teamIdParsed = Number(teamId);
        const playersTeam = await this.getPlayersTeam(teamIdParsed);
        this.playersTeam2.set(playersTeam);
      }
    );

    this.selectorForm.controls.playerOne.valueChanges.subscribe(
      async (playerId) => {
        console.log('PLAYER ID', playerId);
        if (!playerId) return;
        const player = this.playersTeam1()?.find(
          (player) => player.player_id === Number(playerId)
        );
        if (player) this.playerOne.set(player);

        const playerIdParsed = Number(playerId);
        const competitionCategoryId = this.competition()?.competitionCategory
          .competition_category_id as
          | CompetitionCategory['id_competition_category']
          | undefined;
        if (!competitionCategoryId) return;
        const matchesPlayed = await this.getMatchesPlayed(
          playerIdParsed,
          competitionCategoryId
        );
        this.playerOneMatches.set(matchesPlayed);

        const competitionId = this.competition()?.id_competition;
        if (!competitionId) return;
        const goals = await this.getPlayerGoals(playerIdParsed, competitionId);
        this.playerOneGoals.set(goals);

        const teamId = Number(this.selectorForm.value.teamOne);
        const standigns = await this.getStandings(teamId, competitionId);
        console.log('STANDINGS', standigns);
        this.playerOneStandings.set(standigns[0]);

        const cards = await this.getPlayerCards(playerIdParsed, competitionId);
        this.playerOneCards.set(cards);
      }
    );

    this.selectorForm.controls.playerTwo.valueChanges.subscribe(
      async (playerId) => {
        console.log('PLAYER ID', playerId);
        if (!playerId) return;
        const player = this.playersTeam2()?.find(
          (player) => player.player_id === Number(playerId)
        );
        if (player) this.playerTwo.set(player);

        const playerIdParsed = Number(playerId);
        const competitionCategoryId = this.competition()?.competitionCategory
          .competition_category_id as
          | CompetitionCategory['id_competition_category']
          | undefined;
        if (!competitionCategoryId) return;
        const matchesPlayed = await this.getMatchesPlayed(
          playerIdParsed,
          competitionCategoryId
        );
        this.playerTwoMatches.set(matchesPlayed);

        const competitionId = this.competition()?.id_competition;
        if (!competitionId) return;
        const goals = await this.getPlayerGoals(playerIdParsed, competitionId);
        this.playerTwoGoals.set(goals);

        const teamId = Number(this.selectorForm.value.teamTwo);
        const standigns = await this.getStandings(teamId, competitionId);
        console.log('STANDINGS', standigns);
        this.playerTwoStandings.set(standigns[0]);

        const cards = await this.getPlayerCards(playerIdParsed, competitionId);
        this.playerTwoCards.set(cards);
      }
    );
  }

  async getPlayersTeam(teamId: number) {
    const response = await firstValueFrom(
      this._teamPlayerService.getTeamPlayers({ team_id: teamId })
    );
    console.log('PLAYERS', response);
    return response.data.items || [];
  }

  async getMatchesPlayed(playerId: number, competition_category_id: number) {
    const response = await firstValueFrom(
      this._matchService.getMatches({
        player_id: playerId,
        competition_category_id: competition_category_id,
      })
    );
    return response.data.items || [];
  }

  async getPlayerGoals(playerId: number, competition_id: number) {
    const response = await firstValueFrom(
      this._goalService.getGoals({
        player_id: playerId,
        competition_id: competition_id,
      })
    );
    return response.data.items || [];
  }

  async getPlayerCards(playerId: number, competitionId: number) {
    console.log('GET CARDS', playerId);
    const response = await firstValueFrom(
      this._cardService.getCards({
        player_id: playerId,
        competition_id: competitionId,
      })
    );
    return response.data.items || [];
  }

  async getStandings(teamId: number, competitionId: number) {
    const response = await firstValueFrom(
      this._standingsService.getStandings({
        competition_id: competitionId,
        team_id: teamId,
      })
    );
    return response.data.items || [];
  }

  ngAfterViewChecked(): void {
    // Comprova si el jugador ha canviat
    if (this.playerOne() !== this.prevPlayerOne) {
      this.prevPlayerOne = this.playerOne();
      this.resetAnimation(this.playerOneAvatar.nativeElement);
      // this.resetAnimation(this.statsContainer.nativeElement);
    }
    if (this.playerTwo() !== this.prevPlayerTwo) {
      this.prevPlayerTwo = this.playerTwo();
      this.resetAnimation(this.playerTwoAvatar.nativeElement);
      // this.resetAnimation(this.statsContainer.nativeElement);
    }
  }

  resetAnimation(element: HTMLElement) {
    // Elimina i afegeix la classe per reiniciar l'animació
    element.classList.remove('player');
    void element.offsetWidth; // Força el reflow per assegurar que la classe s'elimina correctament
    element.classList.add('player');
  }
}
