import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  public login(token: string, role: 'admin' | 'user'): void {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_role', role);
    
    if (role === 'user') {
      const expirationDate = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
      localStorage.setItem('jwt_expiration', expirationDate.toString());
    } else {
      localStorage.removeItem('jwt_expiration');
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
      return false;
    }

    if (role === 'admin') {
      return true;
    }

    const expiration = localStorage.getItem('jwt_expiration');
    if (expiration) {
      const now = new Date().getTime();
      if (now < parseInt(expiration, 10)) {
        return true;
      }
    }

    this.logout();
    return false;
  }

  public logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('jwt_expiration');
  }
}