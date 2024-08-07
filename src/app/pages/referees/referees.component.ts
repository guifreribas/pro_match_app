import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-referees',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './referees.component.html',
  styleUrl: './referees.component.scss',
})
export class RefereesComponent {}
