import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatchEditComponent } from '@app/components/match/match-edit/match-edit.component';
import { MatchViewComponent } from '@app/components/match/match-view/match-view.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { MatchWithDetails } from '@app/models/match';
import { CardService } from '@app/services/api_services/card.service';
import { FoulService } from '@app/services/api_services/foul.service';
import { GoalService } from '@app/services/api_services/goal.service';
import { MatchPlayerService } from '@app/services/api_services/match-player.service';
import { MatchService } from '@app/services/api_services/match.service';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamService } from '@app/services/api_services/team.service';
import { MatchStateService } from '@app/services/global_states/match-state.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    MatchViewComponent,
    MatchEditComponent,
  ],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss',
})
export class MatchComponent {
  public match = signal<MatchWithDetails | null>(null);
  public goals = signal<any[]>([]);
  public cards = signal<any[]>([]);
  public localTeam = signal<any>(null);
  public visitorTeam = signal<any>(null);
  public localPlayers = signal<any[]>([]);
  public visitorPlayers = signal<any[]>([]);
  public matchViewState = signal<string>('VIEW');

  private _matchService = inject(MatchService);
  private _route = inject(ActivatedRoute);
  private _userState = inject(UserStateService);
  private _matchState = inject(MatchStateService);
  private _teamService = inject(TeamService);
  private _teamPlayerService = inject(TeamPlayerService);
  private _goalService = inject(GoalService);
  private _cardService = inject(CardService);
  private _foulService = inject(FoulService);
  private _matchPlayerService = inject(MatchPlayerService);

  private _hasFetchedInitData = false;

  constructor() {
    effect(() => {
      const matchId = this._route.snapshot.params['id'];
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedInitData === false) {
        this.getAllInitData({ userId: user.id_user, matchId: Number(matchId) });
        this._hasFetchedInitData = true;
      }
    });
  }

  ngAfterViewInit(): void {
    const params = this._route.snapshot.queryParams;
    const isEdit = params['edit'] === 'true';
    const isView = params['view'] === 'true';

    if (isEdit) {
      this.matchViewState.set('EDIT');
    } else if (isView) {
      this.matchViewState.set('VIEW');
    }
  }

  async getAllInitData({
    userId,
    matchId,
  }: {
    userId: number;
    matchId: number;
  }) {
    const [match, goals, cards, fouls, matchPlayers] = await Promise.all([
      firstValueFrom(
        this._matchService.getMatches({ id_match: matchId, user_id: userId })
      ),
      firstValueFrom(
        this._goalService.getGoals({
          match_id: matchId,
          user_id: userId,
          limit: 30,
        })
      ),
      firstValueFrom(
        this._cardService.getCards({
          match_id: matchId,
          user_id: userId,
          limit: 30,
        })
      ),
      firstValueFrom(
        this._foulService.getFouls({
          match_id: matchId,
          user_id: userId,
          limit: 30,
        })
      ),
      firstValueFrom(
        this._matchPlayerService.getMatchPlayers({
          match_id: matchId,
          user_id: userId,
          limit: 30,
        })
      ),
    ]);
    const [localTeam, visitorTeam] = await Promise.all([
      firstValueFrom(
        this._teamService.getTeams({
          id_team: match.data.items[0].local_team.id_team,
        })
      ),
      firstValueFrom(
        this._teamService.getTeams({
          id_team: match.data.items[0].visitor_team.id_team,
        })
      ),
    ]);

    const [localPlayers, visitorPlayers] = await Promise.all([
      firstValueFrom(
        this._teamPlayerService.getTeamPlayers({
          team_id: Number(localTeam.data.items[0].id_team),
          user_id: userId,
          limit: 30,
        })
      ),
      firstValueFrom(
        this._teamPlayerService.getTeamPlayers({
          team_id: Number(visitorTeam.data.items[0].id_team),
          user_id: userId,
          limit: 30,
        })
      ),
    ]);

    const players = matchPlayers.data.items;

    const goalsWithPlayers = goals.data.items.map((goal) => {
      const player = players.find(
        (player) => player.player_id === goal.player_id
      );
      return { ...goal, player: player?.player };
    });

    console.log('GOALS', goalsWithPlayers);

    const cardsWithPlayers = cards.data.items.map((card) => {
      const player = players.find(
        (player) => player.player_id === card.player_id
      );
      return { ...card, player: player?.player };
    });

    const foulsWithPlayers = fouls.data.items.map((foul) => {
      const player = players.find(
        (player) => player.player_id === foul.player_id
      );
      return { ...foul, player: player?.player };
    });

    this._matchState.setMatch({
      match: match.data.items[0],
      goals: goalsWithPlayers,
      cards: cardsWithPlayers,
      fouls: foulsWithPlayers,
      localTeam: localTeam.data.items[0],
      visitorTeam: visitorTeam.data.items[0],
      localPlayers: localPlayers.data.items,
      visitorPlayers: visitorPlayers.data.items,
      matchPlayers: players,
    });

    console.log({
      match: match.data.items[0],
      goals: goalsWithPlayers,
      cards: cardsWithPlayers,
      fouls: foulsWithPlayers,
      localTeam: localTeam.data.items[0],
      visitorTeam: visitorTeam.data.items[0],
      localPlayers: localPlayers.data.items,
      visitorPlayers: visitorPlayers.data.items,
      matchPlayers: matchPlayers.data.items,
      matchPlayersIds: matchPlayers.data.items.map(
        (matchPlayer) => matchPlayer.player_id
      ),
    });

    // console.log(team);
    // const teamPlayer = await this._teamPlayerService.getTeamPlayer(match.data.local_team.id_team_player).toPromise();
    // console.log(teamPlayer);
  }
}
