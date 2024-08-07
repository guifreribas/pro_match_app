import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-leagues',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './leagues.component.html',
  styleUrl: './leagues.component.scss',
})
export class LeaguesComponent {}
