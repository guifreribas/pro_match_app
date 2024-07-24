import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/api_services/auth.service';
import { tap } from 'rxjs';
import { AvatarComponent } from '../avatar/avatar.component';
import { UserStateService } from '../../services/global_states/user-state.service';
import { User } from '../../models/user';
import { config } from '../../config/config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [AvatarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private userState = inject(UserStateService);

  public me = this.userState.me;
  public imgUrl = config.IMG_URL;

  ngOnInit(): void {
    console.log(this.imgUrl);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('loggedIn');
        this.authService.setLoggedIn(false);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
