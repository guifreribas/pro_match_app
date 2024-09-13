import { Component, inject } from '@angular/core';
import { tap } from 'rxjs';
import { AuthService } from '@services/api_services/auth.service';
import { UserStateService } from '@services/global_states/user-state.service';
import { config } from '@config/config';
import { RouterModule } from '@angular/router';
import { LocalStorageService } from '@app/services/local-storage.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private userState = inject(UserStateService);
  private localStorageService = inject(LocalStorageService);

  public me = this.userState.me;
  public imgUrl = config.IMG_URL;

  ngOnInit(): void {
    console.log(this.imgUrl);
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.localStorageService.removeItem('loggedIn');
        this.authService.setLoggedIn(false);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
