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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalModalComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(GlobalModalComponent) globalModal!: GlobalModalComponent;
  public title = 'pro_match_app';

  private _modalService = inject(GlobalModalService);

  constructor() {}

  ngOnInit(): void {
    initFlowbite();
  }

  ngAfterViewInit(): void {
    this._modalService.register(this.globalModal);
  }
}
