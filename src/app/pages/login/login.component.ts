import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/api_services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { UserStateService } from '../../services/global_states/user-state.service';
import { LocalStorageService } from '@app/services/local-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  public loginForm!: FormGroup;
  public isSubmitted = false;
  public emailTouched = false;
  public passwordTouched = false;
  private authService = inject(AuthService);
  private userState = inject(UserStateService);
  private router = inject(Router);
  private localStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      remember: new FormControl(false, []),
    });
  }

  onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    this.emailTouched = true;
    if (this.loginForm.invalid) return;
    this.authService
      .login(
        this.loginForm.value.email,
        this.loginForm.value.password,
        this.loginForm.value.remember
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.userState.setMe(res.data.user);
          this.authService.setLoggedIn(true);
          this.localStorageService.setItem('loggedIn', 'true');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log(err);
          this.loginForm.get('email')?.setErrors({ notValid: true });
        },
      });
  }

  onEmailInput(e: Event) {
    this.emailTouched = false;
    if (this.loginForm.get('email')?.errors?.['notValid']) {
      this.loginForm.setErrors(null);
    }
  }
}
