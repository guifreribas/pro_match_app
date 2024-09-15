import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventInput,
  ToolbarInput,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-full-calendar-wrapper',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './full-calendar.component.html',
  styleUrls: ['./full-calendar.component.scss'],
})
export class FullCalendarComponent implements OnInit, OnChanges {
  @Input() events: EventInput[] = [];
  @Input() initialView: string = 'dayGridMonth';
  @Input() headerToolbar: ToolbarInput = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };
  @Input() selectable: boolean = true;
  @Input() editable: boolean = true;
  @Input() weekends: boolean = true;
  @Input() initialDate?: string; // Opcional: data inicial del calendari

  @Output() dateSelect = new EventEmitter<DateSelectArg>();
  @Output() eventClick = new EventEmitter<EventClickArg>();
  @Output() eventsSet = new EventEmitter<any>();

  calendarOptions: Partial<CalendarOptions> = {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: this.initialView,
    headerToolbar: this.headerToolbar,
    events: this.events,
    selectable: this.selectable,
    editable: this.editable,
    weekends: this.weekends,
    select: this.onDateSelect.bind(this),
    eventClick: this.onEventClick.bind(this),
    eventsSet: this.onEventsSet.bind(this),
    dayMaxEvents: true,
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Configuració inicial
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['events'] ||
      changes['initialView'] ||
      changes['headerToolbar'] ||
      changes['selectable'] ||
      changes['editable'] ||
      changes['weekends'] ||
      changes['initialDate']
    ) {
      this.updateCalendarOptions();
    }
  }

  private updateCalendarOptions() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events,
      initialView: this.initialView,
      headerToolbar: this.headerToolbar,
      selectable: this.selectable,
      editable: this.editable,
      weekends: this.weekends,
      initialDate: this.initialDate,
    };
    this.cdr.detectChanges();
  }

  onDateSelect(selectInfo: DateSelectArg) {
    this.dateSelect.emit(selectInfo);
  }

  onEventClick(clickInfo: EventClickArg) {
    this.eventClick.emit(clickInfo);
  }

  onEventsSet(events: any) {
    this.eventsSet.emit(events);
  }
}
