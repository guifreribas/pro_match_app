import { Injectable } from '@angular/core';
import { GlobalActionModalComponent } from '@app/components/atom/global-action-modal/global-action-modal.component';

interface OpenModal {
  title: string;
  message: string;
  actionButtonMessage: string;
  cancelButtonMessage?: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class GlobalActionModalService {
  private _modalComponent!: GlobalActionModalComponent;

  constructor() {}

  register(modalComponent: GlobalActionModalComponent) {
    this._modalComponent = modalComponent;
    console.log(this._modalComponent);
  }

  openModal(props: OpenModal) {
    this._modalComponent.openModal(props);
  }

  closeModal() {
    this._modalComponent.closeModal();
  }
}
