import { Component, Input, WritableSignal } from '@angular/core';
import { Team } from '@app/models/team';

@Component({
  selector: 'app-team-edit',
  standalone: true,
  imports: [],
  templateUrl: './team-edit.component.html',
  styleUrl: './team-edit.component.scss',
})
export class TeamEditComponent {
  @Input() team!: WritableSignal<Team | null>;
}
