import { Injectable } from '@angular/core';

export interface EquipoStats {
  nombre: string;
  golesFavorLocal: number;
  golesEnContraLocal: number;
  golesFavorVisita: number;
  golesEnContraVisita: number;
  bttsPct: number;
  cornersProm: number;
  faltasFavor: number;
  faltasEnContra: number;
  tirosPuerta: number;
  fuerasJuego: number;
  tarjetasAmarrillas: number;
}

export interface Liga {
  nombre: string;
  equipos: EquipoStats[];
}

@Injectable({
  providedIn: 'root'
})
export class FootballSheetService {
  private ligasCatalog: Liga[] = [
    {
      "nombre": "Colombia - Liga BetPlay Dimayor (1ª División)",
      "equipos": [
        {
          "nombre": "Millonarios",
          "golesFavorLocal": 1.8,
          "golesEnContraLocal": 0.7,
          "golesFavorVisita": 1.3,
          "golesEnContraVisita": 1.1,
          "bttsPct": 58,
          "cornersProm": 5.9,
          "faltasFavor": 13.2,
          "faltasEnContra": 12.5,
          "tirosPuerta": 5.4,
          "fuerasJuego": 2.1,
          "tarjetasAmarrillas": 2.6
        },
        {
          "nombre": "Junior de Barranquilla",
          "golesFavorLocal": 1.9,
          "golesEnContraLocal": 0.8,
          "golesFavorVisita": 1.2,
          "golesEnContraVisita": 1.4,
          "bttsPct": 60,
          "cornersProm": 5.6,
          "faltasFavor": 14,
          "faltasEnContra": 13.1,
          "tirosPuerta": 5.2,
          "fuerasJuego": 1.9,
          "tarjetasAmarrillas": 2.9
        }
      ]
    }
  ];

  constructor() {}

  getLigas(): Liga[] {
    return this.ligasCatalog;
  }

  calcularMarcador(
    golesFavorLocal: number,
    golesFavorVisita: number,
    golesEnContraLocal: number,
    golesEnContraVisita: number,
    promGolesPartidoLocal: number = 1.0,
    promGolesPartidoVisita: number = 1.0
  ) {
    const ataqueLocal = (Number(golesFavorLocal) + Number(golesEnContraVisita)) / 2;
    const ataqueVisita = (Number(golesFavorVisita) + Number(golesEnContraLocal)) / 2;

    // Ponderación integrada con los promedios por partido para mayor precisión conceptual
    const factorLocal = Number(promGolesPartidoLocal) > 0 ? Number(promGolesPartidoLocal) : 1.0;
    const factorVisita = Number(promGolesPartidoVisita) > 0 ? Number(promGolesPartidoVisita) : 1.0;

    const eq1 = Math.max(0, Math.round(ataqueLocal * factorLocal));
    const eq2 = Math.max(0, Math.round(ataqueVisita * factorVisita));
    const proporcion = Math.max(15, Math.min(90, ((eq1 / Math.max(eq1 + eq2, 1)) * 100)));

    return {
      equipo1: eq1,
      equipo2: eq2,
      porcentaje: Number(proporcion.toFixed(1))
    };
  }

  calcularOverUnder(gl: number, cl: number, gv: number, cv: number) {
    const total = Number((gl + gv).toFixed(2));
    return {
      total: total,
      recomendacion: total > 2.5 ? 'MÁS DE 2,5 GOLES (OVER)' : 'MENOS DE 2,5 GOLES (UNDER)'
    };
  }

  calcularBTTS(bttsL: number, bttsV: number) {
    const promedio = Number(((Number(bttsL) + Number(bttsV)) / 2).toFixed(1));
    return {
      promedio: promedio,
      recomendacion: promedio >= 60 ? 'SÍ MARCAN AMBOS (BTTS SÍ)' : 'NO MARCAN AMBOS (BTTS NO)'
    };
  }

  calcularCorners(cl: number, cv: number) {
    const pronosticados = Number((Number(cl) + Number(cv)).toFixed(1));
    return {
      pronosticados: pronosticados,
      recomendacion: pronosticados > 9.5 ? 'MÁS DE 9,5 CÓRNERS' : 'MENOS DE 9,5 CÓRNERS'
    };
  }

  calcularTarjetas(tl: number, tv: number, arb: number) {
    const pronosticadas = Number(((Number(tl) + Number(tv) + Number(arb)) / 2).toFixed(1));
    return {
      pronosticadas: pronosticadas,
      recomendacion: pronosticadas > 4.5 ? 'MÁS DE 4,5 TARJETAS' : 'MENOS DE 4,5 TARJETAS'
    };
  }

  calcularFaltas(ffl: number, fcl: number, ffv: number, fcv: number, arbF: number) {
    const pronosticadas = Number(((Number(ffl) + Number(ffv) + Number(arbF)) / 2).toFixed(1));
    return {
      pronosticadas: pronosticadas,
      recomendacion: pronosticadas > 23.5 ? 'MÁS DE 23,5 FALTAS' : 'MENOS DE 23,5 FALTAS'
    };
  }

  calcularTirosPuerta(tpl: number, tpv: number) {
    const pronosticados = Number((Number(tpl) + Number(tpv)).toFixed(1));
    return {
      pronosticados: pronosticados,
      recomendacion: pronosticados > 8.5 ? 'MÁS DE 8,5 TIROS A PUERTA' : 'MENOS DE 8,5 TIROS A PUERTA'
    };
  }

  calcularFuerasJuego(fjl: number, fjv: number) {
    const pronosticadas = Number((Number(fjl) + Number(fjv)).toFixed(1));
    return {
      pronosticadas: pronosticadas,
      recomendacion: pronosticadas > 3.5 ? 'MÁS DE 3,5 FUERAS DE JUEGO' : 'MENOS DE 3,5 FUERAS DE JUEGO'
    };
  }

  calcularAsiatico(golesL: number, golesV: number, handicap: number, lineaGoles: number) {
    const totalGoles = Number(golesL) + Number(golesV);
    const diferencia = Number(golesL) - Number(golesV);
    const margenMagnitud = Math.abs(diferencia);
    
    let equipoDominante = 'EQUILIBRADO';
    if (diferencia > 0) {
      equipoDominante = 'LOCAL';
    } else if (diferencia < 0) {
      equipoDominante = 'VISITANTE';
    }

    let recomendacion = totalGoles > Number(lineaGoles) ? 'OVER ASIÁTICO FAVORABLE' : 'UNDER ASIÁTICO FAVORABLE';
    
    if (margenMagnitud >= 0.5) {
      recomendacion += ` / HÁNDICAP SÓLIDO (${equipoDominante})`;
    }

    return {
      pronostico: `Margen: ${diferencia > 0 ? '+' : ''}${diferencia.toFixed(2)} Goles`,
      recomendacion: recomendacion
    };
  }
}