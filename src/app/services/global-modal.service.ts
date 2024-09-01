import { Injectable } from '@angular/core';
import { GlobalModalComponent } from '@app/components/atom/global-modal/global-modal.component';

@Injectable({
  providedIn: 'root',
})
export class GlobalModalService {
  private _modalComponent!: GlobalModalComponent;

  constructor() {}

  register(modalComponent: GlobalModalComponent) {
    this._modalComponent = modalComponent;
  }

  openModal(title: string, message: string) {
    this._modalComponent.openModal(title, message);
  }

  closeModal() {
    this._modalComponent.closeModal();
  }
}
