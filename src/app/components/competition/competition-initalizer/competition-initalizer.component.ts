import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatepickerComponent } from '@app/components/atom/datepicker/datepicker.component';
import { config } from '@app/config/config';
import { generateLeagueCalendar, Round } from '@app/helpers/competitions';

import { CompetitionWithDetails } from '@app/models/competition';
import { Team, TeamsGetResponse } from '@app/models/team';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { MatchService } from '@app/services/api_services/match.service';
import { StandingsService } from '@app/services/api_services/standings.service';
import { TeamService } from '@app/services/api_services/team.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { SearchServiceService } from '@app/services/search-service.service';

interface CompetitionDays {
  index: number;
  day: string[];
}

interface InitalizeCompetitionParams {
  teams: Team[];
  competitionDays: CompetitionDays[];
  startDate: Date;
  discardedDays: Date[];
}

@Component({
  selector: 'app-competition-initalizer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, DatepickerComponent],
  templateUrl: './competition-initalizer.component.html',
  styleUrls: ['./competition-initalizer.component.scss'],
})
export class CompetitionInitalizerComponent implements OnInit {
  public imgUrl = config.IMG_URL;
  public competitionId = 0;
  public teamsSearchInput: FormControl = new FormControl('');
  public startDateInput: FormControl = new FormControl(null);
  public discardedDatesInput: FormControl = new FormControl(null);
  public competitionDaysInput: FormControl = new FormControl('');
  public competition = signal<CompetitionWithDetails | null>(null);
  public dynamicClasses: { [key: string]: boolean } = {};
  public searchedCompetition = signal<CompetitionWithDetails[]>([]);
  public searchedTeams = signal<TeamsGetResponse | null>(null);
  public teamsAdded = signal<Team[]>([]);
  public minDate = new Date(2024, 0, 1);
  public maxDate = new Date(2024, 11, 31);
  public startDate: Date = new Date();
  public discardedDays: Date[] = [];
  public competitionDays: CompetitionDays[] = [];
  public days = [
    ['Lunes', 'MONDAY'],
    ['Martes', 'TUESDAY'],
    ['Miércoles', 'WEDNESDAY'],
    ['Jueves', 'THURSDAY'],
    ['Viernes', 'FRIDAY'],
    ['Sábado', 'SATURDAY'],
    ['Domingo', 'SUNDAY'],
  ];

  private _competitionService = inject(CompetitionService);
  private _teamService = inject(TeamService);
  private _searchService = inject(SearchServiceService);
  private _matchService = inject(MatchService);
  private _standingsService = inject(StandingsService);
  private _userState = inject(UserStateService);
  private _route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      const user = this._userState.me();
      const userId = user?.id_user;
      if (userId) {
        this._competitionService
          .getCompetitions({
            user_id: userId,
            includeCompetitionType: true,
            includeOrganization: true,
            includeCompetitionCategory: true,
            id_competition: this.competitionId,
          })
          .subscribe({
            next: (res) => {
              console.log({ competitionWithDetails: res });
              this.competition.set(res.data.items[0]);
            },
            error: (err) => {
              console.error(err);
            },
          });
      }
    });
  }

  ngOnInit(): void {
    this.competitionId = this._route.snapshot.params['id'];

    this._searchService
      .search(this.teamsSearchInput.valueChanges, (query) =>
        this._teamService.getTeams({ q: query })
      )
      .subscribe((res) => this.searchedTeams.set(res || null));
  }

  onResetInput() {
    this.searchedTeams.set(null);
    this.teamsSearchInput.setValue('');
  }

  getDorsalControl(playerId: number): FormControl {
    return new FormControl('');
  }

  isInvalidDorsal(playerId: number): boolean {
    return false;
  }

  handleAddTeam(event: Event, team: Team) {
    event.stopPropagation();
    event.preventDefault();
    this.teamsAdded.update((prevTeams) => {
      if (!prevTeams) return [team];
      return [...prevTeams, team];
    });
    console.log(this.teamsAdded());
  }

  handleDeleteTeam(team: Team) {
    this.teamsAdded.update((prevTeams) => {
      if (!prevTeams) return [];
      return prevTeams.filter((prevTeam) => prevTeam.id_team !== team.id_team);
    });
  }

  handleDeletedDate(date: Date) {
    this.discardedDays = this.discardedDays.filter((discardedDate) => {
      return discardedDate !== date;
    });
  }

  onDateChange(event: any) {}

  onAddStartDate() {
    console.log(this.startDateInput.value);
    this.startDate = this.startDateInput.value;
  }

  onAddDiscardedDate() {
    console.log(this.discardedDatesInput.value);
    this.discardedDays.push(this.discardedDatesInput.value);
  }

  onAddCompetitionDays(event: Event, day: string[], index: number) {
    if (!event.target) return;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      this.competitionDays.push({ index, day: day });
      this.competitionDays = this.competitionDays.sort(
        (a, b) => a.index - b.index
      );
    } else {
      this.competitionDays = this.competitionDays.filter(
        (item) => item.index !== index
      );
    }
  }

  handleInitializeCompetition({
    teams,
    competitionDays,
    startDate,
    discardedDays,
  }: InitalizeCompetitionParams) {
    const competitionDaysIndex = competitionDays.map((day) => day.index + 1);
    const leagueCalendar = generateLeagueCalendar({
      teams,
      startDate,
      excludeDates: discardedDays,
      validWeekDays: competitionDaysIndex,
      isDoubleRound: this.competition()?.format === 'DOUBLE_ROUND',
      userId: this._userState.me()!.id_user,
    });

    this.initStandingsForEachTeam(teams);
  }

  initStandingsForEachTeam(teams: Team[]) {
    console.log('INIT STANDINGS FOR EACH TEAM', this.competition());
    teams.forEach((team) => {
      console.log('TEAM', team);
      this.initStandings(team);
    });
  }

  initStandings(team: Team) {
    this._standingsService
      .createStanding({
        competition_id: this.competitionId,
        team_id: team.id_team as number,
        competition_category_id: this.competition()?.competitionCategory
          .competition_category_id as number,
        user_id: this._userState.me()?.id_user as number,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  createMatches(leagueCalendar: Round[]) {
    for (const round of leagueCalendar) {
      for (const match of round.matches) {
        this._matchService
          .createMatch({
            status: 'TO_BE_SCHEDULED',
            local_team: Number(match.match.home.id_team),
            visitor_team: Number(match.match.away.id_team),
            date: match.date,
            competition_category_id: Number(
              this.competition()?.competitionCategory.competition_category_id
            ),
            user_id: this._userState.me()!.id_user,
          })
          .subscribe({
            next: (res) => {
              console.log(res);
              this.updateComptetition();
            },
            error: (err) => {
              console.log(err);
            },
          });
      }
    }
  }

  updateComptetition() {
    this._competitionService
      .updateCompetition(
        {
          is_initialized: true,
        },
        this.competitionId
      )
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
