import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { GlobalModalComponent } from './components/atom/global-modal/global-modal.component';
import { GlobalModalService } from './services/global-modal.service';
import { GlobalActionModalComponent } from './components/atom/global-action-modal/global-action-modal.component';
import { GlobalActionModalService } from './services/global-action-modal.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalModalComponent, GlobalActionModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(GlobalModalComponent) globalModal!: GlobalModalComponent;
  @ViewChild(GlobalActionModalComponent)
  globalActionModal!: GlobalActionModalComponent;
  public title = 'pro_match_app';

  private _modalService = inject(GlobalModalService);
  private _actionModalService = inject(GlobalActionModalService);

  constructor() {}

  ngOnInit(): void {
    initFlowbite();
  }

  ngAfterViewInit(): void {
    this._modalService.register(this.globalModal);
    this._actionModalService.register(this.globalActionModal);
  }
}
