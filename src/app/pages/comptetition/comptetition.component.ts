import { Component } from '@angular/core';
import { CompetitionInitalizerComponent } from '@app/components/competition/competition-initalizer/competition-initalizer.component';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-comptetition',
  standalone: true,
  imports: [DashboardPanelLayoutComponent, CompetitionInitalizerComponent],
  templateUrl: './comptetition.component.html',
  styleUrl: './comptetition.component.scss',
})
export class ComptetitionComponent {}
