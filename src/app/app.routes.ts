import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from './auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';
import { PlayersComponent } from './pages/players/players.component';
import { PlayerCardComponent } from './components/player-card/player-card.component';
import { CreatePlayerComponent } from './pages/create-player/create-player.component';
import { PlayerComponent } from './pages/player/player.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent, canActivate: [authGuard] },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
      },
      {
        path: 'players/:id',
        component: PlayerComponent,
        canActivate: [authGuard],
      },
      {
        path: 'create-player',
        component: CreatePlayerComponent,
        canActivate: [authGuard],
      },
      {
        path: 'players',
        component: PlayersComponent,
        canActivate: [authGuard],
      },
      { path: '**', redirectTo: '' },
    ],
  },
];
