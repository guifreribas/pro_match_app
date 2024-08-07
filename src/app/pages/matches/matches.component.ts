import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.scss',
})
export class MatchesComponent {}
