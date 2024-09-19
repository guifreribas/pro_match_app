import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { MatchService } from '@app/services/api_services/match.service';
import { AddGoalComponent } from '../add-goal/add-goal.component';
import { AddCardComponent } from '../add-card/add-card.component';
import { AddFoulComponent } from '../add-foul/add-foul.component';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [AddGoalComponent, AddCardComponent, AddFoulComponent],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.scss',
})
export class MatchEditComponent {
  public wichFormIsActive = signal<FormType>(null);

  setFormType(formType: FormType) {
    if (this.wichFormIsActive() === formType) {
      this.wichFormIsActive.set(null);
      return;
    }
    this.wichFormIsActive.set(formType);
  }
}
