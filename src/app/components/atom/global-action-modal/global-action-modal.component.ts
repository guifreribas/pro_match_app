import { Component } from '@angular/core';

interface OpenModal {
  title: string;
  message: string;
  actionButtonMessage: string;
  cancelButtonMessage?: string;
  action: () => void;
}

@Component({
  selector: 'app-global-action-modal',
  standalone: true,
  imports: [],
  templateUrl: './global-action-modal.component.html',
  styleUrl: './global-action-modal.component.scss',
})
export class GlobalActionModalComponent {
  public title: string = '';
  public message: string = '';
  public actionButtonMessage: string = 'Aceptar';
  public cancelButtonMessage: string = 'Cancelar';
  public action: () => void = () => {};
  public isVisible: boolean = false;

  openModal(props: OpenModal) {
    const { title, message, actionButtonMessage, cancelButtonMessage, action } =
      props;
    this.title = title;
    this.message = message;
    this.actionButtonMessage = actionButtonMessage;
    this.cancelButtonMessage = cancelButtonMessage ?? 'Cancelar';
    this.action = action;
    this.isVisible = true;
  }

  closeModal() {
    this.isVisible = false;
  }
}