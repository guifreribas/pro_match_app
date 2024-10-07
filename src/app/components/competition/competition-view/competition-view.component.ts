import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';

import { CompetitionService } from '@app/services/api_services/competition.service';
import { MatchService } from '@app/services/api_services/match.service';
import { UserStateService } from '@app/services/global_states/user-state.service';

import { CompetitionWithDetails } from '@app/models/competition';
import { GetMatchesParams, Match, MatchWithDetails } from '@app/models/match';
import { getAllResponse } from '@app/models/api';

import { config } from '@app/config/config';
import { createEventId } from '@app/utils/event-utils';

import { CompetitionOverviewComponent } from '../competition-overview/competition-overview.component';
import { CompetitionClassificationComponent } from '../competition-classification/competition-classification.component';
import { initFlowbite } from 'flowbite';
import { StandingsService } from '@app/services/api_services/standings.service';
import { firstValueFrom } from 'rxjs';
import {
  GetStandingsParams,
  StandingsWithDetails,
  Standings,
} from '@app/models/standings';
import { StandingsStateService } from '@app/services/global_states/standings-state.service';
import { CompetitionResultsComponent } from '../competition-results/competition-results.component';
import { GoalService } from '@app/services/api_services/goal.service';
import { Goal } from '@app/models/goal';
import { CompetitionCardsComponent } from '../competition-cards/competition-cards.component';
import { CompetitionPlayerStatsComponent } from '../competition-player-stats/competition-player-stats.component';
import { CompetitionScorersComponent } from '../competition-scorers/competition-scorers.component';

@Component({
  selector: 'app-competition-view',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    RouterModule,
    RouterLink,
    CompetitionOverviewComponent,
    CompetitionClassificationComponent,
    CompetitionResultsComponent,
    CompetitionCardsComponent,
    CompetitionPlayerStatsComponent,
    CompetitionScorersComponent,
    CompetitionPlayerStatsComponent,
  ],
  templateUrl: './competition-view.component.html',
  styleUrl: './competition-view.component.scss',
})
export class CompetitionViewComponent implements OnInit {
  @ViewChild('fullCalendar') fullCalendar!: FullCalendarComponent;

  public imgUrl = config.IMG_URL;
  public formatMap: Record<string, string> = {
    SINGLE_ROUND: 'Doble vuelta',
    DOUBLE_ROUND: 'Doble vuelta',
    KNOCKOUT: 'Eliminatorias',
    KNOCKOUT_SINGLE_ROUND: 'Liguilla una vuelta más eliminatorias',
    KNOCKOUT_DOUBLE_ROUND: 'Liguilla dos vueltas más eliminatorias',
  };
  public competitionTypeMap: Record<string, string> = {
    LEAGUE: 'Liga',
    TOURNAMENT: 'Copa',
  };
  public competitionType = signal<string>('LEAGUE');
  public competitionId: number | null = null;
  public competitionCategoryId = signal<number | null>(null);
  public competition = signal<CompetitionWithDetails | null>(null);
  public matchesResponse = signal<getAllResponse<MatchWithDetails> | null>(
    null
  );
  public goals = signal<Goal[]>([]);
  public standings = signal<Standings[]>([]);
  public matchesEvents = signal<EventInput[]>([]);
  public calendarVisible = signal(true);
  public calendarOptions = signal<CalendarOptions>({
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
    },
    initialView: 'dayGridMonth',
    // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    events: this.matchesEvents(),
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  });
  public currentEvents = signal<EventApi[]>([]);
  private _hasFetchedMatches = false;
  private _hasFetchedCompetition = false;
  private _hasFetchedStaindings = false;
  private _matchService = inject(MatchService);
  private _competitionService = inject(CompetitionService);
  private _standingsService = inject(StandingsService);
  private _goalService = inject(GoalService);
  private _userState = inject(UserStateService);
  private _standingsState = inject(StandingsStateService);
  private _route = inject(ActivatedRoute);
  private router = inject(Router);

  constructor(private changeDetector: ChangeDetectorRef) {
    effect(() => {
      const userId = this._userState.me()?.id_user;
      const competitionId = this._route.snapshot.params['id'];
      if (!userId) return;
      if (this._hasFetchedMatches === false) {
        this.getCompetition(competitionId, userId);
        this._hasFetchedMatches = true;
      }

      if (
        this.competitionCategoryId() &&
        this._hasFetchedCompetition === false
      ) {
        this.getMatches({
          user_id: userId,
          competition_category_id: this.competitionCategoryId() as number,
          limit: 200, // In 20 teams league with double rounds, has total of 190 matches
        });
        this._hasFetchedCompetition = true;
      }

      if (this._hasFetchedStaindings === false) {
        console.log('STANDINGS FETCHED', competitionId);
        this.getStandings({
          user_id: userId,
          competition_id: competitionId,
          limit: 20,
        });
        this._hasFetchedStaindings = true;
      }
    });

    // effect(() => {
    //   const matches = this.matchesResponse()?.data?.items || [];
    //   const getMatchGoals = matches.map((match) => {
    //     return firstValueFrom(
    //       this._goalService.getGoals({
    //         match_id: match.id_match,
    //         user_id: this._userState.me()?.id_user,
    //         limit: 30,
    //       })
    //     );
    //   });
    //   Promise.all(getMatchGoals).then((goalsResponse) => {
    //     console.log('GOALS', goalsResponse);
    //     this.goals.update((prev) => {
    //       if (!prev) return prev;
    //       return [...prev,...goalsResponse.data.items];
    //   });
    // });
  }

  ngOnInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  async getCompetition(competitionId: number, userId: number) {
    const response = await firstValueFrom(
      this._competitionService.getCompetitions({
        user_id: userId,
        includeCompetitionType: true,
        includeOrganization: true,
        includeCompetitionCategory: true,
        id_competition: competitionId,
      })
    );
    this.competition.set(response.data.items[0]);
    this.competitionCategoryId.set(
      response.data.items[0].competitionCategory.competition_category_id
    );
    if (response.data.items[0]?.competitionType?.name) {
      this.competitionType.set(
        this.competitionTypeMap[response.data.items[0].competitionType.name]
      );
    }
  }

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleWeekendsToggle() {
    this.calendarOptions.update((options) => ({
      ...options,
      weekends: !options.weekends,
    }));
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    console.log(clickInfo.event);
    const matchId = clickInfo.event.id;
    if (matchId) {
      this.router.navigate(['/matches', matchId]);
    }
    // if (
    //   confirm(
    //     `Are you sure you want to delete the event '${clickInfo.event.title}'`
    //   )
    // ) {
    //   clickInfo.event.remove();
    // }
  }

  handleEvents(events: EventApi[]) {
    // const matchId = events.eve;
    // this.currentEvents.set(events);
    // this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  getMatches(params?: Partial<GetMatchesParams>) {
    this._matchService.getMatches(params).subscribe({
      next: (res) => {
        console.log('MATCHES', res);
        this.matchesResponse.set(res);
        this.matchesEvents.set(
          res.data.items.map((match) => {
            const parsedDate = dayjs(match.date).toISOString();
            return {
              id: String(match.id_match),
              title: match.local_team.name + ' vs ' + match.visitor_team.name,
              start: parsedDate.replace(/T.*$/, ''),
              allDay: true,
              backgroundColor: '#3d8333',
            };
          })
        );
        this.calendarOptions.set({
          ...this.calendarOptions(),
          events: this.matchesEvents(),
        });
        this.changeDetector.detectChanges();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  async getStandings(
    params: Partial<GetStandingsParams>
  ): Promise<getAllResponse<StandingsWithDetails> | null> {
    try {
      const response = await firstValueFrom(
        this._standingsService.getStandings(params)
      );
      this._standingsState.setStandings(response.data.items);
      return response || null;
    } catch (error) {
      return null;
    }
  }

  getFormat(format: string | undefined): string {
    // if (!format) return '';
    return this.formatMap['LEAGUE'];
  }

  updateCalendarSize() {
    if (this.fullCalendar) {
      this.fullCalendar.getApi().updateSize();
    }
  }

  onCalendarTabClick() {
    setTimeout(() => {
      this.updateCalendarSize();
      this.changeDetector.detectChanges();
    }, 0);
  }
}
