import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AsideComponent } from '../../components/aside/aside.component';
import { RouterOutlet } from '@angular/router';
import { UserService } from '../../services/api_services/user.service';
import { UserStateService } from '../../services/global_states/user-state.service';
import { initFlowbite } from 'flowbite';

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
    initFlowbite();
    if (!this.userState.me()) {
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
