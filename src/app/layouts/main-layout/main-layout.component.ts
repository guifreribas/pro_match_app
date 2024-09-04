import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '@services/api_services/user.service';
import { UserStateService } from '@services/global_states/user-state.service';
import { initFlowbite } from 'flowbite';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '@components/organism/navbar/navbar.component';
import { AsideComponent } from '@components/organism/aside/aside.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, AsideComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private userState = inject(UserStateService);
  private UserService = inject(UserService);

  ngOnInit(): void {
    if (!this.userState.me()?.id_user) {
      this.UserService.getMe().subscribe({
        next: (res) => {
          console.log({ res });
          this.userState.setMe(res.data);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
