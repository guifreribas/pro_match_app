import { Component } from '@angular/core';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';

@Component({
  selector: 'app-create-player',
  standalone: true,
  imports: [DashboardPanelLayoutComponent],
  templateUrl: './create-player.component.html',
  styleUrl: './create-player.component.scss',
})
export class CreatePlayerComponent {}
