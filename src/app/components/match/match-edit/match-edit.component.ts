import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DashboardPanelLayoutComponent } from '@app/layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { MatchService } from '@app/services/api_services/match.service';
import { AddGoalComponent } from '../add-goal/add-goal.component';
import { AddCardComponent } from '../add-card/add-card.component';
import { AddFoulComponent } from '../add-foul/add-foul.component';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { CommonModule } from '@angular/common';

type FormType = 'GOAL' | 'CARD' | 'FOUL' | null;

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [AddGoalComponent, AddCardComponent, AddFoulComponent, CommonModule],
  templateUrl: './match-edit.component.html',
  styleUrl: './match-edit.component.scss',
  animations: [
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px' }),
        animate('0.3s ease-in', style({ opacity: 1, maxHeight: '1000px' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, maxHeight: '1000px' }),
        animate('0.3s ease-in', style({ opacity: 0, maxHeight: '0px' })),
      ]),
    ]),
  ],
})
export class MatchEditComponent {
  public wichFormIsActive = signal<FormType>(null);

  setFormType(formType: FormType): string | null {
    if (this.wichFormIsActive() === formType) {
      this.wichFormIsActive.set(null);
      return formType;
    }
    if (this.wichFormIsActive() !== null) {
      this.wichFormIsActive.set(null);
      setTimeout(() => {
        this.wichFormIsActive.set(formType);
      }, 350);
      return formType;
    }
    this.wichFormIsActive.set(formType);
    return formType;
  }

  getButtonClasses(type: FormType) {
    if (this.wichFormIsActive() === type) {
      return {
        'bg-primary-900': true,
        'ring-primary-300': true,
      };
    }
    return {};
  }
}
