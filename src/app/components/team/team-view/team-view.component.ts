import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.scss',
})
export class TeamViewComponent {}
