import { Component } from '@angular/core';
import { OrganizationCardComponent } from '../../components/organization-card/organization-card.component';
import { PlayerCardComponent } from '../../components/player-card/player-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [OrganizationCardComponent, PlayerCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
