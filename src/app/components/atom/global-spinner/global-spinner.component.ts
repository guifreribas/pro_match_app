import { Component } from '@angular/core';
import { SpinnerService } from '@app/services/spinner.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [],
  templateUrl: './global-spinner.component.html',
  styleUrl: './global-spinner.component.scss',
})
export class GlobalSpinnerComponent {
  public isLoading = SpinnerService.isLoading;
}
