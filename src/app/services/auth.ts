import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
	login(token: string, role: string): void {
		localStorage.setItem('token', token);
		localStorage.setItem('role', role);
	}
}
