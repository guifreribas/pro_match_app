import {
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  signal,
  SimpleChanges,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Team } from '@app/models/team';
import { TeamViewState } from '@app/types/team';
import { config } from '@app/config/config';
import { CommonModule } from '@angular/common';
import { TeamPlayerService } from '@app/services/api_services/team-player.service';
import { TeamPlayerWithDetails } from '@app/models/team-player';
import { TeamService } from '@app/services/api_services/team.service';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';
import { PlayerService } from '@app/services/api_services/player.service';
import { Player } from '@app/models/player';
import { UserStateService } from '@app/services/global_states/user-state.service';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { initFlowbite } from 'flowbite';
import { AfterViewInit } from '@angular/core';
import { TeamPlayer } from '../../../models/team-player';
import { GlobalModalService } from '@app/services/global-modal.service';
import { TeamStateService } from '@app/services/global_states/team-state.service';

@Component({
  selector: 'app-team-view',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './team-view.component.html',
  styleUrl: './team-view.component.scss',
})
export class TeamViewComponent implements OnInit {
  @Input() teamViewState!: WritableSignal<TeamViewState>;

  public imgUrl: string = config.IMG_URL;
  public teamPlayers = signal<TeamPlayerWithDetails[]>([]);
  public searchedPlayers = signal<Player[] | null>(null);
  public playerSearchInput: FormControl = new FormControl('');
  public isPlayerCreatedSuccessfully = false;
  public playerForms: { [key: string]: FormGroup } = {};
  public team = TeamStateService.activeTeam;

  ngOnInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }
}
