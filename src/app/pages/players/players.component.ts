import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { DashboardPanelLayoutComponent } from '../../layouts/dashboard-panel-layout/dashboard-panel-layout.component';
import { RouterModule } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { CreatePlayerModalComponent } from '@app/components/player/create-player-modal/create-player-modal.component';
import { AsideComponent } from '../../components/organism/aside/aside.component';
import { PlayerService } from '@app/services/api_services/player.service';
import { Player, PlayersGetResponse } from '@app/models/player';
import { CommonModule } from '@angular/common';
import { config } from '@app/config/config';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
} from 'rxjs';

type Action = 'NEXT' | 'PREVIOUS' | 'GO_ON_PAGE';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [
    DashboardPanelLayoutComponent,
    RouterModule,
    CreatePlayerModalComponent,
    AsideComponent,
    CommonModule,
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.scss',
})
export class PlayersComponent implements OnInit, AfterViewInit {
  public imgUrl = config.IMG_URL;
  public players: Player[] = [];
  public page = 1;
  public playersResponse: WritableSignal<PlayersGetResponse | null> =
    signal(null);
  public searchedPlayers = signal<PlayersGetResponse | null>(null);

  private _playerService = inject(PlayerService);
  private _searchSubject = new Subject<string>();

  constructor() {
    this._searchSubject
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap((query) =>
          this._playerService.getPlayers({ q: query }).pipe(
            catchError((error) => {
              console.log(error);
              return [];
            })
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.searchedPlayers.set(res);
      });
  }

  ngOnInit(): void {
    this._getPlayers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }

  private _getPlayers(action: Action = 'GO_ON_PAGE', page: string = '1') {
    this._playerService.getPlayers({ page }).subscribe({
      next: (res) => {
        console.log(res);
        console.log({ players: res.data.items });
        this.playersResponse.set(res);
        this.players = res.data.items;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  goOnPage(page: number) {
    this._getPlayers('GO_ON_PAGE', page.toString());
    this.reInitFlowbite();
  }

  goPreviousPage() {
    const currentPage = this.playersResponse()?.data?.currentPage ?? 0;
    const previusPage = currentPage - 1 > 0 ? currentPage - 1 : 1;
    this._getPlayers('PREVIOUS', String(previusPage));
    this.reInitFlowbite();
  }

  goNextPage() {
    const currentPage = this.playersResponse()?.data?.currentPage ?? 0;
    this._getPlayers('NEXT', String(currentPage + 1));
    this.reInitFlowbite();
  }

  onSearchInput(e: Event) {
    const inputElement = e.target as HTMLInputElement;
    const query = inputElement.value;
    if (query.length === 0) {
      this.searchedPlayers.set(null);
      return;
    }
    // if (inputElement.value.length < 2) return;
    if (query.length >= 2) {
      this._searchSubject.next(query);
    }
  }

  reInitFlowbite() {
    setTimeout(() => {
      initFlowbite();
    }, 100);
  }
}
