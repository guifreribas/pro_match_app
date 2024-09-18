import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  RouterModule,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions()),
    importProvidersFrom(RouterModule, BrowserAnimationsModule),
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideNativeDateAdapter(),
    provideAnimationsAsync(),
  ],
};
