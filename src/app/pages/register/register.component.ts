import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/api_services/auth.service';
import { UserStateService } from '../../services/global_states/user-state.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  public registerForm!: FormGroup;
  public isSubmitted = false;
  public emailTouched = false;
  public passwordTouched = false;
  private authService = inject(AuthService);
  private userState = inject(UserStateService);
  private router = inject(Router);

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(e: SubmitEvent) {
    e.preventDefault();
    this.isSubmitted = true;
    this.emailTouched = true;
    if (this.registerForm.invalid) return;
    this.authService
      .register(
        this.registerForm.value.email,
        this.registerForm.value.password,
        'ADMIN'
      )
      .subscribe({
        next: (res) => {
          console.log(res);
          this.userState.setMe(res.data.user);
          this.authService.setLoggedIn(true);
          localStorage.setItem('loggedIn', 'true');
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log(err);
          this.registerForm.get('email')?.setErrors({ notValid: true });
        },
      });
  }
}
