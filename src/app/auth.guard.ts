import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/api_services/auth.service';
import { UserService } from './services/api_services/user.service';
import { LocalStorageService } from './services/local-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const localStorageService = inject(LocalStorageService);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    localStorageService.getItem('loggedIn');
    if (localStorageService.getItem('loggedIn') === 'true') {
      return true;
    }
    router.navigate(['/login']);
    return false;
  }

  return true;
};

//   return authService.isLogged().pipe(
//     map((isAuthenticated) => {
//       if (isAuthenticated) {
//         return true;
//       } else {
//         router.navigate(['/login']);
//         return false;
//       }
//     }),
//     catchError(() => {
//       router.navigate(['/login']);
//       return of(false);
//     })
//   );
// };

// export const publicGuard: CanActivateFn = (route, state) => {
//   const router = inject(Router);
//   const authService = inject(AuthService);
//   const userService = inject(UserService);

//   return userService.getMe().pipe(
//     map((res) => {
//       console.log(res);
//       return true;
//     }),
//     catchError(() => {
//       console.log('error');
//       router.navigate(['login']);
//       return of(false);
//     })
//   );
// };
