import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { createEventId, INITIAL_EVENTS } from '@app/utils/event-utils';
import { CommonModule } from '@angular/common';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { MatchService } from '@app/services/api_services/match.service';
import { Match, MatchWithDetails } from '@app/models/match';
import { config } from '@app/config/config';
import { getAllResponse } from '@app/models/api';
import dayjs from 'dayjs';
import { CompetitionWithDetails } from '@app/models/competition';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { CompetitionService } from '@app/services/api_services/competition.service';

@Component({
  selector: 'app-competition-view',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterModule, RouterLink],
  templateUrl: './competition-view.component.html',
  styleUrl: './competition-view.component.scss',
})
export class CompetitionViewComponent implements OnInit {
  public colors = [
    '#3d8333',
    '#8e2de2',
    '#4a148c',
    '#c23616',
    '#2a9d8f',
    '#195f3b',
    '#a8e063',
    '#e6c600',
  ];
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
  private _matchService = inject(MatchService);
  private _userState = inject(UserStateService);
  private _competitionService = inject(CompetitionService);
  private _route = inject(ActivatedRoute);

  constructor(private changeDetector: ChangeDetectorRef) {
    effect(() => {
      const user = this._userState.me();
      if (user?.id_user && this._hasFetchedMatches === false) {
        const competitionId = this._route.snapshot.params['id'];
        this.getCompetition(competitionId, user.id_user);
        this._hasFetchedMatches = true;
      }

      if (
        user?.id_user &&
        this.competitionCategoryId() &&
        this._hasFetchedCompetition === false
      ) {
        this.getMatches({
          user_id: user.id_user,
          competition_category_id: this.competitionCategoryId() as number,
        });
        this._hasFetchedCompetition = true;
      }
    });
  }

  ngOnInit(): void {}

  getCompetition(competitionId: number, userId: number) {
    this._competitionService
      .getCompetitions({
        user_id: userId,
        includeCompetitionType: true,
        includeOrganization: true,
        includeCompetitionCategory: true,
        id_competition: competitionId,
      })
      .subscribe({
        next: (res) => {
          console.log('COMPETITION', res);
          this.competition.set(res.data.items[0]);

          this.competitionCategoryId.set(
            res.data.items[0].competitionCategory.competition_category_id
          );
          if (res.data.items[0]?.competitionType?.name) {
            this.competitionType.set(
              this.competitionTypeMap[res.data.items[0].competitionType.name]
            );
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
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
    if (
      confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    // this.currentEvents.set(events);
    // this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  getMatches(params?: Partial<Match>) {
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
              backgroundColor:
                this.colors[match.competition_category.id_competition_category],
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

  getFormat(format: string | undefined): string {
    console.log('FORMAT', format);
    // if (!format) return '';
    return this.formatMap['LEAGUE'];
  }
}
