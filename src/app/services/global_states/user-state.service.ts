import { Injectable, signal } from '@angular/core';
import { User } from '../../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserStateService {
  private _me = signal<User | null>(null);

  readonly me = this._me.asReadonly();

  getMe(): User | null {
    return this._me();
  }

  setMe(user: User) {
    this._me.set(user);
  }

  updateMe(userUpdate: Partial<User>) {
    this._me.update((prev) => {
      if (!prev) return prev;
      return { ...prev, ...userUpdate };
    });
  }

  clearMe() {
    this._me.set(null);
  }
}
