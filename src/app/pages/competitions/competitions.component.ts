import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { Competition, CompetitionsGetResponse } from '@app/models/competition';
import { CompetitionService } from '@app/services/api_services/competition.service';
import { UserStateService } from '@app/services/global_states/user-state.service';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-competitions',
  standalone: true,
  imports: [DashboardPanelLayoutComponent, RouterModule, CommonModule],
  templateUrl: './competitions.component.html',
  styleUrl: './competitions.component.scss',
})
export class CompetitionsComponent {
  public competitionsResponse = signal<CompetitionsGetResponse | null>(null);
  public competitions: Competition[] = [];

  private _competitionService = inject(CompetitionService);
  private _userState = inject(UserStateService);

  constructor() {}

  ngOnInit(): void {
    this._competitionService.getCompetitions().subscribe({
      next: (res) => {
        console.log(res);
        console.log({ competitions: res.data.items });
        this.competitionsResponse.set(res);
        this.competitions = res.data.items;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }
}
