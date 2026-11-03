import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  usuarioInput: string = '';
  passwordInput: string = '';

  constructor(
    private readonly authService: Auth,
    private readonly router: Router
  ) {}

  onLogin(): void {
    const usuario = this.usuarioInput.trim();
    const password = this.passwordInput.trim();

    if (usuario === 'adolfredis' && password === 'Milena1428') {
      const tokenAdmin = 'jwt_token_admin_megafutbol';
      this.authService.login(tokenAdmin, 'admin');
      console.log('¡Acceso concedido como Administrador permanentemente!');
      this.router.navigate(['/dashboard']);
      return;
    }

    const clavesPorMes: Record<string, string> = {
      'octubre-2026-1': 'octubre',
      'noviembre-2026-14-28': 'noviembre',
      'diciembre-2026-09-18': 'diciembre',
      'enero-2027-28': 'enero'
    };

    const mesAsignado = clavesPorMes[password];

    if (mesAsignado) {
      const tokenInvitado = `jwt_token_${mesAsignado}`;
      this.authService.login(tokenInvitado, 'invitado');

      console.log(`¡Acceso concedido para el mes de ${mesAsignado}!`);
      this.router.navigate(['/dashboard']);
      return;
    }

    alert('Usuario o contraseña incorrectos');
  }
}