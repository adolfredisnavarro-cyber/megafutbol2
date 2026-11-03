import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface EquipoMetricas {
  nombre: string;
  golesFavorLocal: number;
  golesFavorVisita: number;
  golesEnContraLocal?: number;
  golesEnContraVisita?: number;
  bttsPct: number;
  cornersProm: number;
  faltasFavor?: number;
  faltasEnContra?: number;
  tirosPuerta?: number;
  tarjetasAmarrillas?: number;
  fuerasJuego?: number;
  goles_a_favor_promedio?: number;
  posesion_media?: string;
  racha_reciente?: string;
  promedio_tarjetas_amarillas?: number;
  promedio_tarjetas_rojas?: number;
  faltas_cometidas_promedio?: number;
  faltasFavorLocal?: number;
  faltasFavorVisita?: number;
  faltasContraLocal?: number;
  faltasContraVisita?: number;
  promArbitroTarjetas?: number;
  promArbitroFaltas?: number;
}

export interface Liga {
  id?: string | number;
  nombre: string;
  equipos: EquipoMetricas[];
}

@Injectable({
  providedIn: 'root'
})
export class FootballApiService {
  private http = inject(HttpClient);

  // Pega aquí el enlace CSV publicado de tu Google Sheet cuando lo tengas
  private sheetCsvUrl = 'TU_ENLACE_CSV_DE_GOOGLE_SHEETS';

  private ligasLocales: Liga[] = [
    {
      id: 1,
      nombre: 'La Liga (España)',
      equipos: [
        {
          nombre: 'Atlético de Madrid',
          golesFavorLocal: 1.71,
          golesFavorVisita: 1.25,
          bttsPct: 70,
          cornersProm: 5.4,
          goles_a_favor_promedio: 1.71,
          posesion_media: '51%',
          racha_reciente: 'D-W-W-L-W',
          promedio_tarjetas_amarillas: 2.6,
          promedio_tarjetas_rojas: 0.2,
          faltas_cometidas_promedio: 13.5
        },
        {
          nombre: 'Real Madrid',
          golesFavorLocal: 2.57,
          golesFavorVisita: 1.82,
          bttsPct: 68,
          cornersProm: 6.1,
          goles_a_favor_promedio: 2.57,
          posesion_media: '58%',
          racha_reciente: 'W-W-W-D-W',
          promedio_tarjetas_amarillas: 1.6,
          promedio_tarjetas_rojas: 0.1,
          faltas_cometidas_promedio: 11.2
        }
      ]
    }
  ];

  obtenerLigas(): Liga[] {
    return this.ligasLocales;
  }
}