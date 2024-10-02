import { Component, signal } from '@angular/core';
import { config } from '@app/config/config';

@Component({
  selector: 'app-competition-cards',
  standalone: true,
  imports: [],
  templateUrl: './competition-cards.component.html',
  styleUrl: './competition-cards.component.scss',
})
export class CompetitionCardsComponent {
  public imgUrl = config.IMG_URL;
  public playerAvatar = signal<string>('');
}
