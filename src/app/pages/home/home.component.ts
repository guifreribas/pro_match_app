import { Component, inject, OnInit, signal } from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { RouterLink } from '@angular/router';
import { OverviewService } from '@app/services/api_services/overview.service';
import { Overview, OverviewGetResponse } from '@app/models/overview';
import { UserStateService } from '@app/services/global_states/user-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DashboardPanelLayoutComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  public overviewResponse = signal<OverviewGetResponse | null>(null);
  public overview = signal<Overview | null>(null);
  private _overviewService = inject(OverviewService);
  constructor() {}

  ngOnInit(): void {
    this._overviewService.getOverview().subscribe({
      next: (res) => {
        console.log(res);
        this.overviewResponse.set(res);
        this.overview.set(res.data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
