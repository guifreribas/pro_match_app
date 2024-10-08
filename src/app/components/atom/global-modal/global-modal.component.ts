import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-modal',
  standalone: true,
  imports: [],
  templateUrl: './global-modal.component.html',
  styleUrl: './global-modal.component.scss',
})
export class GlobalModalComponent {
  public title: string = '';
  public message: string = '';
  public isVisible: boolean = false;

  openModal(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
  }
}
