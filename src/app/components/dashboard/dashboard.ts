import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FootballApiService, Liga, EquipoMetricas } from '../../services/football-api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private footballApi = inject(FootballApiService);

  ligas: Liga[] = [];
  ligaSeleccionada: Liga | null = null;
  equipoSeleccionado: EquipoMetricas | null = null;

  ngOnInit(): void {
    this.ligas = this.footballApi.obtenerLigas();
    if (this.ligas.length > 0) {
      this.ligaSeleccionada = this.ligas[0];
      if (this.ligaSeleccionada.equipos.length > 0) {
        this.equipoSeleccionado = this.ligaSeleccionada.equipos[0];
      }
    }
  }

  onLigaChange(): void {
    if (this.ligaSeleccionada && this.ligaSeleccionada.equipos.length > 0) {
      this.equipoSeleccionado = this.ligaSeleccionada.equipos[0];
    } else {
      this.equipoSeleccionado = null;
    }
  }
}