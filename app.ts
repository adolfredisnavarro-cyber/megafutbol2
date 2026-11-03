import { ChangeDetectorRef, Component, OnInit, NgZone, CUSTOM_ELEMENTS_SCHEMA, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FootballSheetService } from './services/football-sheet.service';
import { OddsApiService, OnlinePronostico } from './services/odds-api.service';
import { GlobalInvestmentComponent } from './components/global-investment/global-investment.component';
interface LicenciasResponse {
  claveMaestra: string;
  dispositivos: { id: string; expiracion: string }[];
}
interface Recomendacion {
  mercado: string;
  prob: number;
}
interface SurebetStake {
  resultado: string;
  casa: string;
  cuota: number;
  stake: number;
}
interface SurebetResultado {
  arbitrable: boolean;
  probabilidadImplicita: number;
  inversion: number;
  retorno: number;
  ganancia: number;
  roi: number;
  stakes: SurebetStake[];
}

interface PronosticoDiario {
  deporte: string;
  evento: string;
  mercado: string;
  seleccion: string;
  indiceValor: number;
  razon: string;
}

interface RetoPaso {
  paso: number;
  capitalInicial: number;
  apuesta: number;
  retorno: number;
  ganancia: number;
  capitalFinal: number;
  cuota: number;
}

interface RetoMillonarioMes {
  nombre: string;
  capitalInicial: number;
  cuota: number;
  porcentajeApuesta: number;
  meta: number;
  capitalFinal: number;
  cumplido: boolean;
  dias: RetoMillonarioDia[];
}

interface RetoMillonarioDia {
  dia: number;
  capitalInicial: number;
  apuesta1: RetoMillonarioApuesta;
  apuesta2: RetoMillonarioApuesta;
  saldoFinalProtegido: number;
  resultado: 'pendiente' | 'ganada' | 'perdida';
}

interface RetoMillonarioApuesta {
  monto: number;
  cuota: number;
  retorno: number;
  resultado: 'pendiente' | 'ganada' | 'perdida';
}

interface X3dApuesta extends OnlinePronostico {
  paso: number;
  horaReto: string;
  categoria: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, GlobalInvestmentComponent],
  template: `
    <!-- SI LA APP NO ESTÁ AUTORIZADA (PANTALLA DE BLOQUEO / ACTIVACIÓN) -->
    <div
      *ngIf="!isAuthenticated"
      style="background-color: #0f172a; color: white; min-height: 100vh; display: flex; 
justify-content: center; align-items: center; padding: 2rem; font-family: system-ui, sans
serif;"
    >
      <div
        style="background-color: #1e293b; border-radius: 12px; padding: 2rem; width: 100%; 
max-width: 400px; box-shadow: 0 10px 25px 5px rgba(0,0,0,0.5); text-align: center; border
top: 4px solid #38bdf8;"
      >
        <h2 style="color: #38bdf8; margin-top: 0; font-size: 1.5rem;">MEGAFUTBOL</h2>
        <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1.5rem;">
          Sistema protegido por licencia de dispositivo.
        </p>
        <div
          style="background-color: #0f172a; padding: 12px; border-radius: 8px; margin
bottom: 1.5rem; border: 1px dashed #475569;"
        >
          <span style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 4px;"
            >Tu ID de Dispositivo:</span
          >
          <strong style="color: #38bdf8; font-size: 1.1rem; letter-spacing: 1px;">{{
            appInternalId
          }}</strong>
          <small style="display: block; color: #64748b; margin-top: 4px; font-size: 0.75rem;"
            >Envía este código al administrador para obtener tu clave.</small
          >
        </div>
        <div style="margin-bottom: 1rem; text-align: left;">
          <label style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 4px;"
            >Clave de Activación</label
          >
          <input
            type="text"
            [(ngModel)]="inputKey"
            placeholder="Ingresa tu clave..."
            style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px; box-sizing: border-box;"
          />
        </div>
        <button
          (click)="validateKey()"
          style="width: 100%; background: linear-gradient(135deg, #0284c7, #0369a1); color: 
white; border: none; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; 
box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);"
        >
          Activar Licencia
        </button>
        <p
          *ngIf="errorMessage"
          style="color: #ef4444; font-size: 0.85rem; margin-top: 
1rem;"
        >
          {{ errorMessage }}
        </p>
      </div>
    </div>

    <!-- SI LA APP SÍ ESTÁ AUTORIZADA -->
    <div
      *ngIf="isAuthenticated"
      class="app-shell"
      style="background-color: #0f172a; color: white; min-height: 100vh; padding: 2rem; 
font-family: system-ui, sans-serif;"
    >
      <!-- Cabecera -->
      <header
        style="margin-bottom: 1.5rem; border-bottom: 1px solid #334155; padding-bottom: 
1rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; 
gap: 1rem;"
      >
        <div class="app-brand">
          <div class="app-logo" aria-hidden="true">⚽</div>
          <div>
          <h1 style="margin: 0; font-size: 1.8rem; color: #38bdf8;">MEGAFUTBOL</h1>
          <p style="color: #94a3b8; margin-top: 0.4rem; font-size: 0.95rem;">
            Sistema integral automatizado de analítica y predicción deportiva
          </p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div
            [style.background-color]="colorContadorFondo"
            [style.border]="'1px solid ' + colorContadorBorde"
            style="padding: 8px 14px; border-radius: 8px; display: flex; align-items: center; gap: 
8px; font-size: 0.85rem; font-weight: bold;"
          >
            <span [style.color]="colorContadorTexto">Licencia: {{ diasRestantesTexto }}</span>
          </div>
          <button
            (click)="imprimirReporte()"
            style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; 
border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; 
display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4); 
transition: 0.2s;"
          >
            Imprimir/Guardar PDF
          </button>
        </div>
      </header>

      <!-- 1. MÓDULO DE SELECCIÓN DE EQUIPOS -->
      <section
        style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
      >
        <h2 style="font-size: 1.05rem; margin-top: 0; color: #38bdf8; margin-bottom: 1rem;">
          Selección de Contendientes
        </h2>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
gap: 1.5rem;"
        >
          <div>
            <label style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 4px;"
              >Equipo Local (Home)</label
            >
            <input
              type="text"
              [(ngModel)]="localNombre"
              (input)="sincronizarEstadisticasDeEquipos()"
              placeholder="Escribe el equipo local..."
              style="width: 100%; padding: 9px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px; box-sizing: border-box;"
            />
          </div>
          <div>
            <label style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 4px;"
              >Equipo Visitante (Away)</label
            >
            <input
              type="text"
              [(ngModel)]="visitaNombre"
              (input)="sincronizarEstadisticasDeEquipos()"
              placeholder="Escribe el equipo visitante..."
              style="width: 100%; padding: 9px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px; box-sizing: border-box;"
            />
          </div>
        </div>
        <p
          style="margin: 12px 0 0; color: #94a3b8; font-size: 0.8rem;"
          aria-live="polite"
        >
          {{ estadisticasEstado }}
        </p>
      </section>

      <!-- 2. PESTAÑAS DE NAVEGACIÓN -->
      <button
        type="button"
        class="tabs-drawer-toggle"
        (click)="menuAbierto = !menuAbierto"
        [attr.aria-expanded]="menuAbierto"
        aria-controls="app-navigation"
      >
        <span aria-hidden="true">{{ menuAbierto ? '›' : '‹' }}</span>
        <span>{{ menuAbierto ? 'Ocultar menú' : 'Menú' }}</span>
      </button>
      <nav
        id="app-navigation"
        class="app-tabs"
        [class.menu-open]="menuAbierto"
        aria-label="Módulos de análisis"
      >
        <button
          (click)="pestanaActiva = 'partido'"
          [class.active]="pestanaActiva === 'partido'"
          [style.background-color]="pestanaActiva === 'partido' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'partido' ? '#0f172a' : 'white'"
          style="padding: 7px 11px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Partido & Goles
        </button>
        <button
          (click)="pestanaActiva = 'tarjetas'"
          [class.active]="pestanaActiva === 'tarjetas'"
          [style.background-color]="pestanaActiva === 'tarjetas' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'tarjetas' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Tarjetas
        </button>
        <button
          (click)="pestanaActiva = 'faltas'"
          [class.active]="pestanaActiva === 'faltas'"
          [style.background-color]="pestanaActiva === 'faltas' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'faltas' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Faltas
        </button>
        <button
          (click)="pestanaActiva = 'tirosPuerta'"
          [class.active]="pestanaActiva === 'tirosPuerta'"
          [style.background-color]="pestanaActiva === 'tirosPuerta' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'tirosPuerta' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Tiros a Puerta
        </button>
        <button
          (click)="pestanaActiva = 'fuerasJuego'"
          [class.active]="pestanaActiva === 'fuerasJuego'"
          [style.background-color]="pestanaActiva === 'fuerasJuego' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'fuerasJuego' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          + Fueras de Juego
        </button>
        <button
          (click)="pestanaActiva = 'asi'"
          [class.active]="pestanaActiva === 'asi'"
          [style.background-color]="pestanaActiva === 'asi' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'asi' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          +asi (Líneas Asiáticas)
        </button>
        <button
          (click)="pestanaActiva = 'auto'"
          [class.active]="pestanaActiva === 'auto'"
          [style.background-color]="pestanaActiva === 'auto' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'auto' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Auto (Relleno)
        </button>
        <button
          (click)="pestanaActiva = 'buscarDatos'"
          [class.active]="pestanaActiva === 'buscarDatos'"
          [style.background-color]="pestanaActiva === 'buscarDatos' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'buscarDatos' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Buscar datos
        </button>
        <button
          (click)="pestanaActiva = 'nba'"
          [class.active]="pestanaActiva === 'nba'"
          [style.background-color]="pestanaActiva === 'nba' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'nba' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          NBA
        </button>
        <button
          (click)="pestanaActiva = 'tenisMesa'"
          [class.active]="pestanaActiva === 'tenisMesa'"
          [style.background-color]="pestanaActiva === 'tenisMesa' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'tenisMesa' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Tenis de mesa
        </button>
        <button
          (click)="pestanaActiva = 'pronosticos'"
          [class.active]="pestanaActiva === 'pronosticos'"
          [style.background-color]="pestanaActiva === 'pronosticos' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'pronosticos' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Pronósticos diarios
        </button>
        <button
          (click)="pestanaActiva = 'comoUsar'"
          [class.active]="pestanaActiva === 'comoUsar'"
          [style.background-color]="pestanaActiva === 'comoUsar' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'comoUsar' ? '#0f172a' : 'white'"
          style="padding: 7px 10px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          ¿Cómo se usa?
        </button>
        <button
          (click)="pestanaActiva = 'resultadosAnalisis'"
          [class.active]="pestanaActiva === 'resultadosAnalisis'"
          [style.background-color]="pestanaActiva === 'resultadosAnalisis' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'resultadosAnalisis' ? '#0f172a' : 'white'"
          style="padding: 7px 11px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Resultado de Análisis
        </button>
        <button
          (click)="calcularYMostrarResultados()"
          class="calculate-now-button"
          title="Recalcular todos los mÃ³dulos y mostrar el resumen"
        >
          Calcular ahora
        </button>
        <button
          (click)="pestanaActiva = 'promWeb'"
          [class.active]="pestanaActiva === 'promWeb'"
          [style.background-color]="pestanaActiva === 'promWeb' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'promWeb' ? '#0f172a' : 'white'"
          style="padding: 7px 11px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          Prom Web
        </button>
        <button
          (click)="pestanaActiva = 'g1x2'"
          [class.active]="pestanaActiva === 'g1x2'"
          [style.background-color]="pestanaActiva === 'g1x2' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'g1x2' ? '#0f172a' : 'white'"
          style="padding: 7px 11px; border-radius: 7px; border: none; font-weight: bold; 
font-size: 0.84rem; cursor: pointer; transition: 0.2s;"
        >
          G 1X2
        </button>
        <button
          (click)="pestanaActiva = 'surebet'"
          [class.active]="pestanaActiva === 'surebet'"
          [style.background-color]="pestanaActiva === 'surebet' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'surebet' ? '#0f172a' : 'white'"
          style="padding: 10px 16px; border-radius: 8px; border: none; font-weight: bold; 
cursor: pointer; transition: 0.2s;"
        >
          Surebet
        </button>
        <button
          (click)="pestanaActiva = 'reto'"
          [class.active]="pestanaActiva === 'reto'"
          [style.background-color]="pestanaActiva === 'reto' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'reto' ? '#0f172a' : 'white'"
          style="padding: 10px 14px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;"
        >
          Reto
        </button>
        <button
          (click)="pestanaActiva = 'x3D'"
          [class.active]="pestanaActiva === 'x3D'"
          [style.background-color]="pestanaActiva === 'x3D' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'x3D' ? '#0f172a' : 'white'"
          style="padding: 10px 14px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;"
        >
          x3D
        </button>
        <button
          (click)="pestanaActiva = 'retoMillonario'"
          [class.active]="pestanaActiva === 'retoMillonario'"
          [style.background-color]="pestanaActiva === 'retoMillonario' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'retoMillonario' ? '#0f172a' : 'white'"
          style="padding: 10px 14px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; transition: 0.2s;"
        >
          Reto millonario
        </button>
        <button
          (click)="pestanaActiva = 'inversionGlobal'"
          [class.active]="pestanaActiva === 'inversionGlobal'"
          [style.background-color]="pestanaActiva === 'inversionGlobal' ? '#38bdf8' : '#1e293b'"
          [style.color]="pestanaActiva === 'inversionGlobal' ? '#0f172a' : 'white'"
          style="padding: 10px 14px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer;"
        >
          Inversión global
        </button>
      </nav>
      <app-global-investment *ngIf="pestanaActiva === 'inversionGlobal'"></app-global-investment>
      <!-- 3. PESTAÑA NUEVA: AUTO (EXCLUSIVAMENTE EL CUADRO DE PEGADO) -->
      <section
        *ngIf="pestanaActiva === 'auto'"
        style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
 bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
      >
      
      <!-- 3. PESTAÑA NUEVA: AUTO (EXCLUSIVAMENTE EL CUADRO DE PEGADO) -->
      
        <h2 style="font-size: 1.05rem; margin-top: 0; color: #38bdf8; margin-bottom: 1rem;">
          Auto-relleno Rápido de Datos (Paste & Parse)
        </h2>
        <div
          style="background: #0f172a; border: 1px dashed #38bdf8; padding: 15px; border
radius: 10px; color: white;"
        >
          <div
            style="display: flex; justify-content: space-between; align-items: center; margin
bottom: 8px;"
          >
            <label style="color: #38bdf8; font-size: 0.9rem; font-weight: bold;"
              >Pega el texto de la IA aquí</label
            >
            <span style="font-size: 0.75rem; color: #94a3b8;"
              >La app rellenará todo sola y mostrará los resultados</span
            >
          </div>
          <textarea
            [(ngModel)]="textoPegadoUsuario"
            placeholder="Pega aquí el bloque de texto con los datos de la IA..."
            rows="8"
            style="width: 100%; padding: 10px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px; font-size: 0.85rem; resize: vertical; box-sizing: 
border-box;"
          ></textarea>
          <button
            (click)="procesarTextoPegado()"
            style="width: 100%; margin-top: 10px; background: linear-gradient(135deg, 
#0284c7, #0369a1); color: white; border: none; padding: 12px; border-radius: 6px; font
weight: bold; cursor: pointer; font-size: 0.9rem;"
          >
            Procesar y Rellenar Automáticamente
          </button>
          <p
            *ngIf="mensajeImportacion"
            style="color: #cbd5e1; margin: 10px 0 0; font-size: 
0.85rem;"
          >
            {{ mensajeImportacion }}
          </p>
          <div *ngIf="datosNoColocadosFutbol.length > 0" class="unplaced-data" aria-live="polite">
            <strong>Datos no colocados:</strong>
            <span *ngFor="let dato of datosNoColocadosFutbol">{{ dato }}</span>
          </div>
        </div>
      </section>

      <!-- 4. CAMPOS Y TARJETAS ORIGINALES POR CADA PESTAÑA -->

      <!-- CAMPOS Y RESULTADOS: PARTIDO & GOLES -->
      <section *ngIf="pestanaActiva === 'reto'" class="reto-panel">
        <h2>Reto de 10 pasos · cuota 1,5</h2>
        <p class="reto-help">
          En cada paso se apuesta el 60% del capital disponible. El 40% restante se conserva y se
          suma al retorno de la apuesta para formar el capital del siguiente paso.
        </p>
        <div class="reto-controls">
          <label>
            Capital inicial
            <input
              type="number"
              min="0"
              step="100"
              [(ngModel)]="retoCapital"
              (input)="calcularReto()"
            />
          </label>
          <label>
            Porcentaje por paso
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              [(ngModel)]="retoPorcentaje"
              (input)="calcularReto()"
            />
          </label>
          <label>
            Cuota fija
            <input
              type="number"
              min="1.01"
              step="0.01"
              [(ngModel)]="retoCuota"
              (input)="calcularReto()"
            />
          </label>
        </div>
        <div *ngIf="retoTabla.length" class="reto-preview">
          <div>
            <span>Capital ingresado</span>
            <strong>{{ retoCapitalInicial | number: '1.2-2' }}</strong>
          </div>
          <div>
            <span>{{ retoPorcentaje }}% para colocar</span>
            <strong>{{ retoTabla[0].apuesta | number: '1.2-2' }}</strong>
          </div>
          <div>
            <span>Retorno del paso 1</span>
            <strong>{{ retoTabla[0].retorno | number: '1.2-2' }}</strong>
          </div>
          <div>
            <span>Ganancia del paso 1</span>
            <strong>{{ retoTabla[0].ganancia | number: '1.2-2' }}</strong>
          </div>
        </div>
        <div *ngIf="retoTabla.length; else retoVacio" class="reto-summary">
          Capital final estimado: <strong>{{ retoCapitalFinal | number: '1.2-2' }}</strong>
          · Ganancia acumulada:
          <strong>{{ retoCapitalFinal - retoCapitalInicial | number: '1.2-2' }}</strong>
        </div>
        <ng-template #retoVacio>
          <p class="reto-empty">Introduce un capital inicial mayor que cero.</p>
        </ng-template>
        <div class="reto-table-wrap" *ngIf="retoTabla.length">
          <table class="reto-table">
            <thead>
              <tr>
                <th>Paso</th>
                <th>Capital inicial</th>
                <th>60% apostado</th>
                <th>Ganancia</th>
                <th>Retorno</th>
                <th>Capital final</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let paso of retoTabla">
                <td>{{ paso.paso }}</td>
                <td>{{ paso.capitalInicial | number: '1.2-2' }}</td>
                <td>{{ paso.apuesta | number: '1.2-2' }}</td>
                <td class="reto-profit">{{ paso.ganancia | number: '1.2-2' }}</td>
                <td>{{ paso.retorno | number: '1.2-2' }}</td>
                <td class="reto-total">{{ paso.capitalFinal | number: '1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section *ngIf="pestanaActiva === 'x3D'" class="x3d-panel">
        <div class="x3d-heading">
          <div>
            <span class="module-kicker">Módulo de estrategia</span>
            <h2>x3D · Reto de 4 apuestas</h2>
          </div>
          <span class="x3d-badge">Cuota {{ x3dCuota | number: '1.2-2' }}</span>
        </div>
        <p class="reto-help">
          Configura tu capital y pulsa iniciar para extraer automáticamente cuotas válidas de The Odds API.
        </p>
        <div class="x3d-online-actions">
          <button type="button" class="search-data-button x3d-start-button" [disabled]="buscandoX3D" (click)="comenzarReto()">
            {{ buscandoX3D ? 'Extrayendo cuotas...' : 'Empezar extracción x3D' }}
          </button>
          <span class="import-status" aria-live="polite">{{ estadoX3D }}</span>
        </div>
        <div class="reto-controls x3d-controls">
          <label>
            Capital inicial
            <input type="number" min="1" step="100" [(ngModel)]="x3dCapital" (input)="calcularX3D()" />
          </label>
          <label>
            Cuota fija del reto
            <input type="number" min="1.5" max="1.5" step="0.01" [(ngModel)]="x3dCuota" readonly />
          </label>
        </div>
        <div class="x3d-step-grid">
          <article class="x3d-step-card" *ngFor="let paso of x3dTabla">
            <span>Apuesta {{ paso.paso }}</span>
            <strong>{{ x3dPorcentajes[paso.paso - 1] }}%</strong>
            <small>Capital: {{ paso.capitalInicial | number: '1.0-0' }}</small>
            <small>Apostado: {{ paso.apuesta | number: '1.0-0' }}</small>
            <small>Retorno: {{ paso.retorno | number: '1.0-0' }}</small>
            <b>Saldo: {{ paso.capitalFinal | number: '1.0-0' }}</b>
          </article>
        </div>
        <div class="x3d-picks-grid" *ngIf="x3dApuestas.length > 0">
          <article class="x3d-pick x3d-static-card" *ngFor="let apuesta of x3dApuestas">
            <span>{{ apuesta.categoria }} · {{ apuesta.deporte }}</span>
            <strong>{{ apuesta.evento }}</strong>
            <small>{{ apuesta.mercado }}: {{ apuesta.seleccion }}</small>
            <b>Cuota {{ apuesta.cuota | number: '1.2-2' }} · {{ apuesta.fuente }}</b>
          </article>
        </div>
        <div class="x3d-source-links">
          <span>Fuentes web:</span>
          <a
            *ngFor="let fuente of fuentesX3D"
            [href]="fuente.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ fuente.nombre }}
          </a>
        </div>
        <div class="x3d-result">
          <span>Saldo final estimado</span>
          <strong>{{ x3dCapitalFinal | number: '1.0-0' }}</strong>
          <small>Ganancia proyectada: {{ x3dCapitalFinal - x3dCapital | number: '1.0-0' }}</small>
        </div>
        <p class="x3d-note">
          Herramienta de apoyo para análisis predictivo. No garantiza resultados ni recomienda
          arriesgar dinero que no puedas perder.
        </p>
      </section>

      <section *ngIf="pestanaActiva === 'retoMillonario'" class="reto-millonario-panel">
        <h2>Reto millonario</h2>
        <p class="reto-help">
              Proyección desde {{ retoMillonarioCapitalInicial | number: '1.0-0' }} hasta
              {{ retoMillonarioMeta | number: '1.0-0' }} al cierre de cada mes. El capital final de
              un mes pasa automáticamente como capital inicial del siguiente.
        </p>
        <div class="x3d-online-actions">
          <button type="button" class="search-data-button x3d-start-button" [disabled]="buscandoMillonario" (click)="comenzarRetoMillonario()">
            {{ buscandoMillonario ? 'Extrayendo cuotas...' : 'Empezar extracción millonaria' }}
          </button>
          <span class="import-status" aria-live="polite">{{ estadoMillonario }}</span>
        </div>
        <div class="x3d-picks-grid" *ngIf="millonarioApuestas.length > 0">
          <article class="x3d-pick x3d-static-card" *ngFor="let apuesta of millonarioApuestas">
            <span>{{ apuesta.deporte }} · {{ apuesta.mercado }}</span>
            <strong>{{ apuesta.evento }}</strong>
            <small>{{ apuesta.seleccion }}</small>
            <b>Cuota {{ apuesta.cuota | number: '1.2-2' }} · {{ apuesta.fuente }}</b>
          </article>
        </div>
        <div class="reto-controls reto-millonario-controls">
          <label>
            Capital inicial
            <input
              type="number"
              min="1"
              step="100"
              [(ngModel)]="retoMillonarioCapitalInicial"
              readonly
            />
          </label>
          <label>
            Meta final
            <input
              type="number"
              min="1"
              step="1000000"
              [(ngModel)]="retoMillonarioMeta"
              (input)="calcularRetoMillonario()"
            />
          </label>
        </div>
        <div class="reto-summary" *ngIf="retoMillonarioTabla.length">
          Capital proyectado al cierre:
          <strong>{{ retoMillonarioCapitalFinal | number: '1.0-0' }}</strong>
          ·
          <strong>{{ retoMillonarioCumplido ? 'Cumplido' : 'Pendiente' }}</strong>
        </div>
        <div class="reto-meses-grid">
          <article
            *ngFor="let mes of retoMillonarioTabla; let indiceMes = index"
            class="reto-mes-card"
            [class.reto-mes-card-complete]="mes.cumplido"
          >
            <div class="reto-mes-header">
              <div>
                <h3>{{ mes.nombre }}</h3>
                <span>Meta: {{ mes.meta | number: '1.0-0' }} · 28 días</span>
              </div>
              <button
                type="button"
                class="reto-mes-toggle"
                (click)="alternarMes(indiceMes)"
                [attr.aria-expanded]="retoMesAbierto === indiceMes"
              >
                {{ retoMesAbierto === indiceMes ? 'Ocultar' : 'Ver mes' }}
              </button>
            </div>
            <div class="reto-mes-status">
              <strong>{{ mes.cumplido ? 'Cumplido' : 'Pendiente' }}</strong>
              <span>Capital inicial: {{ mes.capitalInicial | number: '1.0-0' }}</span>
              <span>Capital final: {{ mes.capitalFinal | number: '1.0-0' }}</span>
            </div>
            <div class="reto-mes-content" *ngIf="retoMesAbierto === indiceMes">
              <div class="reto-mes-summary">
              <div>
                <span>Capital inicial</span>
                <strong>{{ mes.capitalInicial | number: '1.0-0' }}</strong>
              </div>
              <div>
                <span>Meta del mes</span>
                <strong>{{ mes.meta | number: '1.0-0' }}</strong>
              </div>
              <div>
                <span>Cuota diaria</span>
                <strong>{{ mes.dias[0]?.apuesta1?.cuota | number: '1.2-2' }}</strong>
              </div>
              <div>
                <span>Capital final</span>
                <strong>{{ mes.capitalFinal | number: '1.0-0' }}</strong>
              </div>
              </div>
              <div class="reto-dias-grid">
              <div
                class="reto-dia-card"
                *ngFor="let dia of mes.dias"
                [class.reto-dia-completado]="dia.apuesta1.resultado === 'ganada' && dia.apuesta2.resultado === 'ganada'"
              >
                <div class="reto-dia-title">Día {{ dia.dia }}</div>
                <div>
                  <label>
                    <span>Resultado</span>
                    <strong>{{ dia.resultado === 'pendiente' ? 'Pendiente' : 'Registrado' }}</strong>
                  </label>
                </div>
                <div>
                  <label>
                    <span>Apuesta 1: monto y cuota</span>
                    <input class="reto-dia-input" type="number" min="0" step="1"
                      [(ngModel)]="dia.apuesta1.monto"
                      (input)="calcularRetoMillonario()"
                      [disabled]="dia.apuesta1.resultado !== 'pendiente'"
                    />
                    <input class="reto-dia-input" type="number" min="1.01" step="0.01"
                      [(ngModel)]="dia.apuesta1.cuota"
                      (input)="calcularRetoMillonario()"
                      [disabled]="dia.apuesta1.resultado !== 'pendiente'"
                    />
                    <div class="reto-apuesta-actions">
                      <button type="button" (click)="registrarApuesta(dia, 1, 'ganada')" [disabled]="dia.apuesta1.resultado !== 'pendiente'">Ganada</button>
                      <button type="button" (click)="registrarApuesta(dia, 1, 'perdida')" [disabled]="dia.apuesta1.resultado !== 'pendiente'">Perdida</button>
                    </div>
                    <strong>{{ dia.apuesta1.resultado | titlecase }}</strong>
                  </label>
                </div>
                <div>
                  <label>
                    <span>Apuesta 2: monto y cuota</span>
                    <input class="reto-dia-input" type="number" min="0" step="1"
                      [(ngModel)]="dia.apuesta2.monto"
                      (input)="calcularRetoMillonario()"
                      [disabled]="dia.apuesta2.resultado !== 'pendiente'"
                    />
                    <input class="reto-dia-input" type="number" min="1.01" step="0.01"
                      [(ngModel)]="dia.apuesta2.cuota"
                      (input)="calcularRetoMillonario()"
                      [disabled]="dia.apuesta2.resultado !== 'pendiente'"
                    />
                    <div class="reto-apuesta-actions">
                      <button type="button" (click)="registrarApuesta(dia, 2, 'ganada')" [disabled]="dia.apuesta2.resultado !== 'pendiente'">Ganada</button>
                      <button type="button" (click)="registrarApuesta(dia, 2, 'perdida')" [disabled]="dia.apuesta2.resultado !== 'pendiente'">Perdida</button>
                    </div>
                    <strong>{{ dia.apuesta2.resultado | titlecase }}</strong>
                  </label>
                </div>
                <div>
                  <span>Saldo inicial</span>
                  <strong>{{ dia.capitalInicial | number: '1.0-0' }}</strong>
                </div>
                <div>
                  <span>Saldo final protegido</span>
                  <strong>{{ dia.saldoFinalProtegido | number: '1.0-0' }}</strong>
                </div>
              </div>
              </div>
            </div>
          </article>
        </div>
        <button type="button" class="reto-nuevo-button" (click)="nuevoRetoMillonario()">
          Reto nuevo
        </button>
      </section>

      <div *ngIf="pestanaActiva === 'partido'">
        <section
          style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2 style="font-size: 1.05rem; margin-top: 0; color: #f8fafc; margin-bottom: 1rem;">
            Parámetros: Partido, Goles & Córners
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
gap: 1rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de goles a favor por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.golesFavorLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de goles en contra por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.golesEnContraLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de goles a favor por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.golesFavorVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de goles en contra por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.golesEnContraVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de goles totales por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.promGolesPartidoLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de goles totales por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.promGolesPartidoVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - BTTS (%)</label
              ><input
                type="number"
                [(ngModel)]="inputData.bttsLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - BTTS (%)</label
              ><input
                type="number"
                [(ngModel)]="inputData.bttsVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de córners por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.cornersLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de córners por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.cornersVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>

        <!-- Tarjetas de resultados originales para Partido -->
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); 
gap: 12px;"
        >
          <div
            class="market-card market-card-score"
            style="background-color: #1e293b; border-radius: 10px; padding: 1rem; border
top: 3px solid #38bdf8;"
          >
            <h3
              style="margin-top: 0; color: #f8fafc; font-size: 1rem; display: flex; gap: 6px; 
align-items: center; min-width: 0;"
            >
              <span
                [title]="localNombre"
                style="overflow: hidden; text-overflow: ellipsis; white
space: nowrap;"
                >{{ localNombre || 'Local' }}</span
              >
              <span>vs</span>
              <span
                [title]="visitaNombre"
                style="overflow: hidden; text-overflow: ellipsis; 
white-space: nowrap;"
                >{{ visitaNombre || 'Visitante' }}</span
              >
              <span style="flex: 0 0 auto;">· Marcador</span>
            </h3>
            <div
              style="background-color: #0f172a; padding: 0.75rem; border-radius: 7px; text-align: 
center; margin-top: 0.75rem;"
            >
              <span style="font-size: 1.8rem; font-weight: bold; color: #4ade80;"
                >{{ resultados.marcador.equipo1 }} - {{ resultados.marcador.equipo2 }}</span
              >
              <span style="font-size: 0.8rem; color: #38bdf8; display: block; margin-top: 6px;"
                >Probabilidad marcador exacto: {{ resultados.marcador.porcentaje }}%</span
              >
            </div>
          </div>
          <div
            class="market-card market-card-goals"
            style="background-color: #1e293b; border-radius: 10px; padding: 1rem; border
top: 3px solid #f59e0b;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1rem;">
              Goles Totales (Over/Under)
            </h3>
            <div
              style="background-color: #0f172a; padding: 0.75rem; border-radius: 7px; text-align: 
center; margin-top: 0.75rem;"
            >
              <span style="font-size: 1.5rem; font-weight: bold; color: #f59e0b;"
                >{{ resultados.overUnder.total }} Goles</span
              >
              <span
                style="font-size: 0.85rem; color: #34d399; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.overUnder.recomendacion }}</span
              >
            </div>
          </div>
          <div
            class="market-card market-card-btts"
            style="background-color: #1e293b; border-radius: 10px; padding: 1rem; border
top: 3px solid #10b981;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1rem;">Ambos Marcan (BTTS)</h3>
            <div
              style="background-color: #0f172a; padding: 0.75rem; border-radius: 7px; text-align: 
center; margin-top: 0.75rem;"
            >
              <span style="font-size: 1.05rem; font-weight: bold; color: #34d399;">{{
                resultados.btts.recomendacion
              }}</span>
              <span style="font-size: 0.8rem; color: #94a3b8; display: block; margin-top: 6px;"
                >BTTS promedio equipos: {{ resultados.btts.promedio }}% · Probabilidad Poisson:
                {{ resultados.btts.probabilidadModelo }}%</span
              >
            </div>
          </div>
          <div
            class="market-card market-card-corners"
            style="background-color: #1e293b; border-radius: 10px; padding: 1rem; border
top: 3px solid #ec4899;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1rem;">Pronóstico Córners</h3>
            <div
              style="background-color: #0f172a; padding: 0.75rem; border-radius: 7px; text-align: 
center; margin-top: 0.75rem;"
            >
              <span style="font-size: 1.5rem; font-weight: bold; color: #ec4899;"
                >{{ resultados.corners.pronosticados }} Córners</span
              >
              <span
                style="font-size: 0.85rem; color: #f472b6; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.corners.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- CAMPOS Y RESULTADOS: TARJETAS -->
      <div *ngIf="pestanaActiva === 'tarjetas'">
        <section
          style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2
            style="font-size: 1.05rem; margin-top: 0; color: #eab308; margin-bottom: 
1rem;"
          >
            Parámetros: Estadísticas de Tarjetas
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 1.2rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de tarjetas por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.tarjetasLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de tarjetas por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.tarjetasVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Árbitro - Promedio de tarjetas por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.promArbitroTarjetas"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
gap: 1.5rem;"
        >
          <div
            style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; border
top: 4px solid #eab308;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.1rem;">
              Predicción de Tarjetas
            </h3>
            <div
              style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; text-align: 
center; margin-top: 1.2rem;"
            >
              <span style="font-size: 0.85rem; color: #94a3b8; display: block;"
                >Total Pronosticado:</span
              >
              <span style="font-size: 1.8rem; font-weight: bold; color: #eab308;"
                >{{ resultados.tarjetas.pronosticadas }} Tarjetas</span
              >
              <span
                style="font-size: 0.9rem; color: #facc15; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.tarjetas.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- CAMPOS Y RESULTADOS: FALTAS -->
      <div *ngIf="pestanaActiva === 'faltas'">
        <section
          style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2
            style="font-size: 1.05rem; margin-top: 0; color: #a855f7; margin-bottom: 
1rem;"
          >
            Parámetros: Fouls Predictor (Faltas)
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
gap: 1rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de faltas a favor por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.faltasFavorLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de faltas en contra por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.faltasContraLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de faltas a favor por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.faltasFavorVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de faltas en contra por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.faltasContraVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Árbitro - Promedio de faltas señaladas por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.promArbitroFaltas"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
gap: 1.5rem;"
        >
          <div
            style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; border
top: 4px solid #a855f7;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.1rem;">Predicción de Faltas</h3>
            <div
              style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; text-align: 
center; margin-top: 1.2rem;"
            >
              <span style="font-size: 0.85rem; color: #94a3b8; display: block;"
                >Total Faltas Esperadas:</span
              >
              <span style="font-size: 1.8rem; font-weight: bold; color: #a855f7;"
                >{{ resultados.faltas.pronosticadas }} Faltas</span
              >
              <span
                style="font-size: 0.9rem; color: #c084fc; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.faltas.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- CAMPOS Y RESULTADOS: TIROS A PUERTA -->
      <div *ngIf="pestanaActiva === 'tirosPuerta'">
        <section
          style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2
            style="font-size: 1.05rem; margin-top: 0; color: #06b6d4; margin-bottom: 
1rem;"
          >
            Parámetros: Tiros a Puerta
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 1.2rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de tiros a puerta por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.tirosPuertaLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de tiros a puerta por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.tirosPuertaVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
gap: 1.5rem;"
        >
          <div
            style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; border
top: 4px solid #06b6d4;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.1rem;">
              Predicción de Tiros a Puerta
            </h3>
            <div
              style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; text-align: 
center; margin-top: 1.2rem;"
            >
              <span style="font-size: 0.85rem; color: #94a3b8; display: block;"
                >Total Tiros a Puerta Esperados:</span
              >
              <span style="font-size: 1.8rem; font-weight: bold; color: #06b6d4;"
                >{{ resultados.tirosPuerta.pronosticados }} Tiros</span
              >
              <span
                style="font-size: 0.9rem; color: #22d3ee; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.tirosPuerta.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA: FUERAS DE JUEGO -->
      <div *ngIf="pestanaActiva === 'fuerasJuego'">
        <section
          style="background-color: #1e293b; border-radius: 12px; padding: 8rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2
            style="font-size: 1.05rem; margin-top: 0; color: #f97316; margin-bottom: 
1rem;"
          >
            Parámetros: Fueras de Juego
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 1.2rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Local - Promedio de fueras de juego por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.fuerasJuegoLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Visita - Promedio de fueras de juego por partido</label
              ><input
                type="number"
                step="0.1"
                [(ngModel)]="inputData.fuerasJuegoVisita"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
gap: 1.5rem;"
        >
          <div
            style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; border
top: 4px solid #f97316;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.1rem;">
              Predicción de Fueras de Juego
            </h3>
            <div
              style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; text-align: 
center; margin-top: 1.2rem;"
            >
              <span style="font-size: 0.85rem; color: #94a3b8; display: block;"
                >Total Offsides Esperados:</span
              >
              <span style="font-size: 1.8rem; font-weight: bold; color: #f97316;"
                >{{ resultados.fuerasJuego.pronosticadas }} Offsides</span
              >
              <span
                style="font-size: 0.9rem; color: #fb923c; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.fuerasJuego.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA: +ASI (LÍNEAS ASIÁTICAS) -->
      <div *ngIf="pestanaActiva === 'asi'">
        <section
          style="background-color: #1e293b; border-radius: 8px; padding: 1.5rem; margin
           bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
        >
          <h2
            style="font-size: 1.05rem; margin-top: 0; color: #38bdf8; margin-bottom: 
1rem;"
          >
            Parámetros: Líneas Asiáticas (+asi)
          </h2>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 1.2rem;"
          >
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Hándicap asiático local recomendado</label
              ><input
                type="number"
                step="0.25"
                [(ngModel)]="inputData.handicapLocal"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
#475569; color: white; border-radius: 6px;"
              />
            </div>
            <div>
              <label
                style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 
5px;"
                >Línea de goles asiáticos</label
              ><input
                type="number"
                step="0.25"
                [(ngModel)]="inputData.golesAsiaticos"
                (input)="recalcular()"
                style="width: 100%; padding: 8px; background: #0f172a; border: 1px solid 
             #475569; color: white; border-radius: 6px;"
              />
            </div>
          </div>
        </section>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); 
gap: 1.5rem;"
        >
          <div
            style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; border
top: 4px solid #38bdf8;"
          >
            <h3 style="margin-top: 0; color: #f8fafc; font-size: 1.1rem;">
              Análisis Líneas Asiáticas (+asi)
            </h3>
            <div
              style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; text-align: 
center; margin-top: 1.2rem;"
            >
              <span style="font-size: 0.85rem; color: #94a3b8; display: block;"
                >Pronóstico Asiático:</span
              >
              <span style="font-size: 1.8rem; font-weight: bold; color: #38bdf8;">{{
                resultados.asiatico.pronostico
              }}</span>
              <span
                style="font-size: 0.9rem; color: #38bdf8; display: block; margin-top: 6px; font
weight: bold;"
                >{{ resultados.asiatico.recomendacion }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA: CÓMO SE USA -->
      <section *ngIf="pestanaActiva === 'buscarDatos'" class="data-sources-panel">
        <h2>Buscar datos para {{ localNombre }} vs {{ visitaNombre }}</h2>
        <p class="data-sources-intro">
          Usa estas fuentes para completar manualmente los campos. La app recalcula los resultados al modificar cada valor.
        </p>
        <button type="button" class="search-data-button" (click)="abrirBusquedaDatos()">
          Buscar este partido en Google
        </button>
        <div class="data-sources-grid">
          <a href="https://www.forebet.com/es" target="_blank" rel="noopener noreferrer">
            <strong>Forebet</strong><span>Pronósticos, tendencias, goles y córners.</span>
          </a>
          <a href="https://www.mismarcadores.com/" target="_blank" rel="noopener noreferrer">
            <strong>Mis Marcadores</strong><span>Resultados en vivo, partidos y estadísticas.</span>
          </a>
          <a href="https://www.soccerway.com/" target="_blank" rel="noopener noreferrer">
            <strong>Soccerway</strong><span>Resultados, partidos, goles y alineaciones.</span>
          </a>
          <a href="https://fbref.com/" target="_blank" rel="noopener noreferrer">
            <strong>FBref</strong><span>Goles, tiros, faltas y tarjetas.</span>
          </a>
          <a href="https://www.worldfootball.net/" target="_blank" rel="noopener noreferrer">
            <strong>WorldFootball.net</strong><span>Historial, resultados y tablas.</span>
          </a>
          <a href="https://www.transfermarkt.com/" target="_blank" rel="noopener noreferrer">
            <strong>Transfermarkt</strong><span>Plantillas, lesiones y contexto.</span>
          </a>
          <a href="https://es.whoscored.com/" target="_blank" rel="noopener noreferrer">
            <img
              class="source-logo"
              src="https://cdn.whoscored.com/theme/svg/wsLogo-6b5a171c2c.svg"
              alt="WhoScored"
            />
            <span>Valoraciones, estadísticas, alineaciones y datos del partido.</span>
          </a>
        </div>
        <div class="data-fields-guide">
          <strong>Datos necesarios</strong>
          <span>Goles a favor/contra, BTTS, goles totales, c&oacute;rners, tarjetas, faltas, tiros a puerta y fueras de juego.</span>
          <span>Del &aacute;rbitro: promedio de tarjetas y faltas se&ntilde;aladas.</span>
          <span>Si no existe un dato, escribe <b>No disponible</b>; no inventes valores.</span>
        </div>
      </section>

      <section *ngIf="pestanaActiva === 'nba'" class="nba-panel">
        <div class="nba-panel-header">
          <div>
            <span class="nba-kicker">NBA / BALONCESTO</span>
            <h2>Calculadoras NBA</h2>
            <p>Introduce los datos manualmente. Todos los resultados se actualizan al cambiar un valor.</p>
          </div>
          <button type="button" class="search-data-button" (click)="copiarPromptNba()">
            Copiar prompt NBA
          </button>
        </div>

        <div class="nba-teams-grid">
          <label>Equipo local<input type="text" [(ngModel)]="nba.localNombre" (input)="calcularNba()" /></label>
          <label>Equipo visitante<input type="text" [(ngModel)]="nba.visitaNombre" (input)="calcularNba()" /></label>
          <label>Jugador para triples<input type="text" [(ngModel)]="nba.jugador" (input)="calcularNba()" /></label>
        </div>

        <div class="nba-input-grid">
          <label>Local - Puntos a favor<input type="number" step="0.1" [(ngModel)]="nba.localPuntosFavor" (input)="calcularNba()" /></label>
          <label>Local - Puntos en contra<input type="number" step="0.1" [(ngModel)]="nba.localPuntosContra" (input)="calcularNba()" /></label>
          <label>Visitante - Puntos a favor<input type="number" step="0.1" [(ngModel)]="nba.visitaPuntosFavor" (input)="calcularNba()" /></label>
          <label>Visitante - Puntos en contra<input type="number" step="0.1" [(ngModel)]="nba.visitaPuntosContra" (input)="calcularNba()" /></label>
          <label>Ritmo local (posesiones)<input type="number" step="0.1" [(ngModel)]="nba.localRitmo" (input)="calcularNba()" /></label>
          <label>Ritmo visitante (posesiones)<input type="number" step="0.1" [(ngModel)]="nba.visitaRitmo" (input)="calcularNba()" /></label>
          <label>Ventaja local<input type="number" step="0.1" [(ngModel)]="nba.ventajaLocal" (input)="calcularNba()" /></label>
          <label>Desviaci&oacute;n del margen<input type="number" step="0.1" [(ngModel)]="nba.desviacionMargen" (input)="calcularNba()" /></label>
          <label>Jugador - Triples por partido<input type="number" step="0.1" [(ngModel)]="nba.triplesJugador" (input)="calcularNba()" /></label>
          <label>Jugador - Intentos de triple<input type="number" step="0.1" [(ngModel)]="nba.intentosTriple" (input)="calcularNba()" /></label>
          <label>Jugador - % de acierto triple<input type="number" step="0.1" [(ngModel)]="nba.porcentajeTriple" (input)="calcularNba()" /></label>
          <label>Jugador - Minutos esperados<input type="number" step="0.1" [(ngModel)]="nba.minutosJugador" (input)="calcularNba()" /></label>
          <label>Local - Puntos 1er cuarto<input type="number" step="0.1" [(ngModel)]="nba.localPrimerCuarto" (input)="calcularNba()" /></label>
          <label>Visitante - Puntos 1er cuarto<input type="number" step="0.1" [(ngModel)]="nba.visitaPrimerCuarto" (input)="calcularNba()" /></label>
        </div>

        <div class="nba-lines-grid">
          <label>L&iacute;nea casa - Total puntos<input type="number" step="0.5" [(ngModel)]="nba.lineaTotalPuntos" (input)="calcularNba()" /></label>
          <label>L&iacute;nea casa - Ganador / margen<input type="number" step="0.5" [(ngModel)]="nba.lineaGanador" (input)="calcularNba()" /></label>
          <label>L&iacute;nea casa - Triples jugador<input type="number" step="0.5" [(ngModel)]="nba.lineaTriples" (input)="calcularNba()" /></label>
          <label>L&iacute;nea casa - Total 1er cuarto<input type="number" step="0.5" [(ngModel)]="nba.lineaPrimerCuarto" (input)="calcularNba()" /></label>
        </div>

        <div class="nba-results-grid">
          <article><span>Total puntos</span><strong>{{ nbaResultados.totalPuntos }} pts</strong><small>{{ nbaResultados.totalRecomendacion }}</small></article>
          <article><span>Ganador</span><strong>{{ nbaResultados.ganador }}</strong><small>{{ nbaResultados.probabilidadLocal }}% local · {{ nbaResultados.probabilidadVisita }}% visitante</small></article>
          <article><span>Triples de {{ nba.jugador || 'jugador' }}</span><strong>{{ nbaResultados.triples }} triples</strong><small>{{ nbaResultados.triplesRecomendacion }}</small></article>
          <article><span>Primer cuarto</span><strong>{{ nbaResultados.primerCuarto }} pts</strong><small>{{ nbaResultados.primerCuartoRecomendacion }}</small></article>
        </div>

        <div class="nba-prompt-box">
          <strong>Prompt para buscar datos NBA</strong>
          <textarea rows="14" readonly [textContent]="promptNba"></textarea>
        </div>
        <div class="nba-prompt-box">
          <strong>Pega aquí el resultado del prompt NBA</strong>
          <textarea
            rows="10"
            [(ngModel)]="resultadoPromNba"
            (input)="procesarResultadoPromNba()"
            placeholder="Pega aquí la respuesta recibida. Los campos se rellenarán automáticamente."
          ></textarea>
          <small class="import-status" aria-live="polite">{{ estadoImportacionNba }}</small>
          <div *ngIf="datosNoColocadosNba.length > 0" class="unplaced-data" aria-live="polite">
            <strong>Datos no colocados:</strong>
            <span *ngFor="let dato of datosNoColocadosNba">{{ dato }}</span>
          </div>
        </div>
      </section>

      <section *ngIf="pestanaActiva === 'tenisMesa'" class="nba-panel table-tennis-panel">
        <div class="nba-panel-header">
          <div>
            <span class="nba-kicker">TENIS DE MESA</span>
            <h2>Calculadora de ganador y sets</h2>
            <p>Completa los datos manualmente; el ganador y el marcador de sets se actualizan al instante.</p>
          </div>
          <button type="button" class="search-data-button" (click)="copiarPromptTenisMesa()">
            Copiar prompt de tenis de mesa
          </button>
        </div>

        <div class="nba-teams-grid">
          <label>Jugador 1<input type="text" [(ngModel)]="tenisMesa.jugador1" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 2<input type="text" [(ngModel)]="tenisMesa.jugador2" (input)="calcularTenisMesa()" /></label>
          <label>Sets para ganar<input type="number" min="2" max="5" step="1" [(ngModel)]="tenisMesa.setsParaGanar" (input)="calcularTenisMesa()" /></label>
        </div>

        <div class="nba-input-grid">
          <label>Jugador 1 - % de victorias<input type="number" min="0" max="100" step="0.1" [(ngModel)]="tenisMesa.porcentajeVictorias1" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 2 - % de victorias<input type="number" min="0" max="100" step="0.1" [(ngModel)]="tenisMesa.porcentajeVictorias2" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 1 - sets ganados por partido<input type="number" min="0" max="7" step="0.1" [(ngModel)]="tenisMesa.setsGanados1" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 1 - sets perdidos por partido<input type="number" min="0" max="7" step="0.1" [(ngModel)]="tenisMesa.setsPerdidos1" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 2 - sets ganados por partido<input type="number" min="0" max="7" step="0.1" [(ngModel)]="tenisMesa.setsGanados2" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 2 - sets perdidos por partido<input type="number" min="0" max="7" step="0.1" [(ngModel)]="tenisMesa.setsPerdidos2" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 1 - puntos promedio por set<input type="number" min="0" max="30" step="0.1" [(ngModel)]="tenisMesa.puntosSet1" (input)="calcularTenisMesa()" /></label>
          <label>Jugador 2 - puntos promedio por set<input type="number" min="0" max="30" step="0.1" [(ngModel)]="tenisMesa.puntosSet2" (input)="calcularTenisMesa()" /></label>
        </div>

        <div class="nba-lines-grid">
          <label>Línea casa - ganador / hándicap de sets<input type="number" step="0.5" [(ngModel)]="tenisMesa.lineaHandicap" (input)="calcularTenisMesa()" /></label>
          <label>Línea casa - total de sets<input type="number" step="0.5" [(ngModel)]="tenisMesa.lineaTotalSets" (input)="calcularTenisMesa()" /></label>
        </div>

        <div class="nba-results-grid">
          <article><span>Ganador previsto</span><strong>{{ tenisMesaResultados.ganador }}</strong><small>{{ tenisMesaResultados.probabilidad1 }}% {{ tenisMesa.jugador1 }} · {{ tenisMesaResultados.probabilidad2 }}% {{ tenisMesa.jugador2 }}</small></article>
          <article><span>Marcador exacto de sets</span><strong>{{ tenisMesaResultados.marcadorSets }}</strong><small>{{ tenisMesaResultados.recomendacionSets }}</small></article>
          <article><span>Total esperado de sets</span><strong>{{ tenisMesaResultados.totalSets }} sets</strong><small>{{ tenisMesaResultados.recomendacionTotal }}</small></article>
          <article><span>Confianza del modelo</span><strong>{{ tenisMesaResultados.confianza }}%</strong><small>Basada en victorias, sets y puntos promedio.</small></article>
        </div>

        <div class="nba-prompt-box">
          <strong>Prompt para buscar datos de tenis de mesa</strong>
          <textarea rows="12" readonly [textContent]="promptTenisMesa"></textarea>
        </div>
        <div class="nba-prompt-box">
          <strong>Pega aquí el resultado del prompt de tenis de mesa</strong>
          <textarea
            rows="10"
            [(ngModel)]="resultadoPromTenisMesa"
            (input)="procesarResultadoPromTenisMesa()"
            placeholder="Pega aquí la respuesta recibida. Los campos se rellenarán automáticamente."
          ></textarea>
          <small class="import-status" aria-live="polite">{{ estadoImportacionTenisMesa }}</small>
          <div *ngIf="datosNoColocadosTenisMesa.length > 0" class="unplaced-data" aria-live="polite">
            <strong>Datos no colocados:</strong>
            <span *ngFor="let dato of datosNoColocadosTenisMesa">{{ dato }}</span>
          </div>
        </div>
      </section>

      <section *ngIf="pestanaActiva === 'pronosticos'" class="nba-panel pronosticos-panel">
        <div class="nba-panel-header">
          <div>
            <span class="nba-kicker">PRONÓSTICOS ONLINE</span>
            <h2>Pronósticos diarios</h2>
            <p>Hasta {{ limitePronosticos }} selecciones online de fútbol, NBA, tenis y otras ligas.</p>
          </div>
          <button type="button" class="search-data-button" [disabled]="buscandoPronosticosOnline" (click)="buscarPronosticosOnline()">
            {{ buscandoPronosticosOnline ? 'Extrayendo cuotas...' : 'Empezar extracción diaria' }}
          </button>
        </div>
        <div class="pronosticos-toolbar">
          <span class="import-status">Cualquier cuota decimal válida · Próximas 72 horas · Datos online</span>
          <span class="import-status" aria-live="polite">{{ estadoPronosticos }}</span>
          <small class="api-build-version">Buscador online v4 · cuotas reales de The Odds API</small>
        </div>
        <div class="online-warning" role="note">
          <strong>Fuente:</strong> los datos se consultan mediante la API configurada para la
          aplicación y la fuente devuelta se muestra en cada tarjeta.
        </div>
        <div class="pronosticos-notice">
          El índice de valor es una estimación del modelo basada en tus datos; no garantiza aciertos ni sustituye una fuente de información actualizada.
        </div>
        <div class="online-results-panel" *ngIf="pronosticosOnline.length > 0">
          <h3>Pronósticos encontrados online ({{ pronosticosOnline.length }})</h3>
          <div class="pronosticos-grid">
            <article class="pronostico-card online-pronostico-card" *ngFor="let pronostico of pronosticosOnline">
              <span class="nba-kicker">{{ pronostico.deporte }} · ONLINE</span>
              <h3>{{ pronostico.evento }}</h3>
              <small *ngIf="pronostico.horaInicio">Inicio: {{ pronostico.horaInicio | date:'dd/MM/yyyy HH:mm' }}</small>
              <strong>{{ pronostico.mercado }}: {{ pronostico.seleccion }}</strong>
              <span class="pronostico-value">Índice estimado: {{ pronostico.indiceValor }}%</span>
              <small>Cuota: {{ pronostico.cuota ?? 'No disponible' }} · Fuente: {{ pronostico.fuente }}</small>
            </article>
          </div>
        </div>
        <p *ngIf="pronosticosOnline.length === 0" class="pronosticos-empty">
          {{ consultaOnlineIntentada ? estadoPronosticos : 'Pulsa “Empezar extracción diaria” para consultar cuotas reales.' }}
        </p>
        <div class="nba-prompt-box">
          <strong>Fuentes de referencia</strong>
          <small>Las fuentes de referencia se muestran para contrastar la información.</small>
          <div class="source-links">
            <a *ngFor="let fuente of fuentesPronosticos" [href]="fuente.url" target="_blank" rel="noopener noreferrer">{{ fuente.nombre }}</a>
          </div>
        </div>
      </section>

      <section
        *ngIf="pestanaActiva === 'comoUsar'"
        style="background-color: #1e293b; border-radius: 12px; padding: 1.5rem; margin
bottom: 2rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);"
      >
        <h2 style="font-size: 1.2rem; margin-top: 0; color: #38bdf8; margin-bottom: 1rem;">
          ¿Cómo se utiliza MEGAFUTBOL?
        </h2>
        <div style="color: #cbd5e1; line-height: 1.6; font-size: 0.95rem;">
          <p>
            <strong>1. Asignar Contendientes:</strong> Escribe el nombre del equipo local y
            visitante.
          </p>
          <p>
            <strong>2. Pestaña Auto:</strong> Pega los datos de la IA para un autorelleno inmediato.
          </p>
          <p>
            <strong>3. Cálculos Automáticos:</strong> Modifica cualquier valor y los resultados se
            actualizan al instante.
          </p>
          <p class="legal-disclaimer">
            MEGAFUTBOL es únicamente una herramienta de ayuda para el análisis predictivo deportivo.
            No se hace responsable del uso, interpretación o destino del dinero. Todas las decisiones
            y sus consecuencias quedan bajo la autonomía y responsabilidad del cliente.
          </p>
        </div>
      </section>

      <!-- PESTAÑA: RESULTADOS DE ANÁLISIS -->
      <section
        *ngIf="pestanaActiva === 'resultadosAnalisis'"
        style="background-color: #1e293b; padding: 15px; border-radius: 8px;"
      >
        <h2 style="font-size: 1.2rem; margin-top: 0; color: #38bdf8; margin-bottom: 1rem;">
          Resultado de Análisis
        </h2>
        <p *ngIf="mensajeImportacion" style="color: #cbd5e1; margin: 0 0 12px;">
          {{ mensajeImportacion }}
        </p>

        <!-- Contenedor con scroll interno para textos largos en celulares -->
        <div
          style="background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid 
#334155; padding: 15px; border-radius: 8px; max-height: 350px; overflow-y: auto;"
        >
          <div
            style="color: #e2e8f0; font-size: 0.92rem; line-height: 1.6; margin: 0; white-space: 
pre-line;"
          >
            <div [innerHTML]="analisisNarrativo"></div>
          </div>
        </div>
        <h3 style="color: #38bdf8; margin: 18px 0 10px;">Resultados de todos los mercados</h3>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 10px;"
        >
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Marcador y goles</strong>
            <div
              style="display: flex; align-items: center; gap: 6px; min-width: 0; margin-top: 
8px;"
            >
              <span
                [title]="localNombre"
                style="max-width: 38%; overflow: hidden; text
overflow: ellipsis; white-space: nowrap;"
                >{{ localNombre }}</span
              >
              <strong>{{ resultados.marcador.equipo1 }} - {{ resultados.marcador.equipo2 }}</strong>
              <span
                [title]="visitaNombre"
                style="max-width: 38%; overflow: hidden; text
overflow: ellipsis; white-space: nowrap;"
                >{{ visitaNombre }}</span
              >
            </div>
            <div style="margin-top: 6px;">
              App: {{ resultados.overUnder.total }} goles · {{ resultados.overUnder.recomendacion }}
            </div>
            <div>{{ compararConLineaCasa(resultados.overUnder.total, lineasCasa.goles) }}</div>
            <div style="margin-top: 6px;">
              {{ resultados.btts.recomendacion }} · {{ resultados.btts.probabilidadModelo }}%
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Córners</strong>
            <div style="margin-top: 8px;">
              App: {{ resultados.corners.pronosticados }} · {{ resultados.corners.recomendacion }}
            </div>
            <div>
              {{ compararConLineaCasa(resultados.corners.pronosticados, lineasCasa.corners) }}
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Tarjetas</strong>
            <div style="margin-top: 8px;">
              App: {{ resultados.tarjetas.pronosticadas }} · {{ resultados.tarjetas.recomendacion }}
            </div>
            <div>
              {{ compararConLineaCasa(resultados.tarjetas.pronosticadas, lineasCasa.tarjetas) }}
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Faltas</strong>
            <div style="margin-top: 8px;">
              App: {{ resultados.faltas.pronosticadas }} · {{ resultados.faltas.recomendacion }}
            </div>
            <div>
              {{ compararConLineaCasa(resultados.faltas.pronosticadas, lineasCasa.faltas) }}
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Tiros a puerta</strong>
            <div style="margin-top: 8px;">
              App: {{ resultados.tirosPuerta.pronosticados }} ·
              {{ resultados.tirosPuerta.recomendacion }}
            </div>
            <div>
              {{
                compararConLineaCasa(resultados.tirosPuerta.pronosticados, lineasCasa.tirosPuerta)
              }}
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Fueras de juego</strong>
            <div style="margin-top: 8px;">
              App: {{ resultados.fuerasJuego.pronosticadas }} ·
              {{ resultados.fuerasJuego.recomendacion }}
            </div>
            <div>
              {{
                compararConLineaCasa(resultados.fuerasJuego.pronosticadas, lineasCasa.fuerasJuego)
              }}
            </div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>Líneas asiáticas</strong>
            <div>{{ resultados.asiatico.pronostico }}</div>
            <div>{{ resultados.asiatico.recomendacion }}</div>
          </div>
          <div
            style="background: linear-gradient(145deg, #0f172a, #172338); border: 1px 
solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 6px 16px 
rgba(0,0,0,0.18);"
          >
            <strong>1X2 y doble oportunidad</strong>
            <div>{{ resultados.g1x2.ganador }} · {{ resultados.g1x2.recomendacionGanador }}</div>
            <div>
              {{ resultados.g1x2.dobleOportunidad }} · {{ resultados.g1x2.recomendacionDoble }}
            </div>
          </div>
          <div
            *ngIf="surebetResultado"
            style="background: linear-gradient(145deg, #0f172a, 
#172338); border: 1px solid #334155; padding: 14px; border-radius: 10px; box-shadow: 0 
6px 16px rgba(0,0,0,0.18);"
          >
            <strong>Surebet</strong>
            <div>
              {{
                surebetResultado.arbitrable
                  ? 'Arbitraje teórico detectado'
                  : 'Sin arbitraje 
rentable'
              }}
            </div>
            <div>
              Ganancia estimada: {{ surebetResultado.ganancia.toFixed(2) }} (ROI
              {{ surebetResultado.roi.toFixed(2) }}%)
            </div>
          </div>
        </div>
      </section>

      <!-- PESTAÑA: G 1X2 Y DOBLE OPORTUNIDAD -->
      <section
        *ngIf="pestanaActiva === 'g1x2'"
        style="background: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 
      8px; margin-bottom: 20px; color: white;"
      >
        <h3
          style="color: #38bdf8; font-size: 1.1rem; margin-top: 0; text-align: center; margin
          bottom: 20px;"
        >
          Módulo de Predicción: G 1X2 &amp; Doble Oportunidad (Poisson)
        </h3>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 15px; margin-bottom: 20px; background: #1e293b; padding: 15px; border-radius: 8px; 
border: 1px solid #334155;"
        >
          <div>
            <label style="font-size: 0.8rem; color: #94a3b8; display: block;">
              {{ localNombre || 'Equipo Local' }} (goles esperados)
            </label>
            <input
              type="number"
              [(ngModel)]="inputData.golesFavorLocal"
              (input)="recalcular()"
              style="width: 100%; background: #0f172a; border: 1px solid #475569; color: white; 
            padding: 8px; border-radius: 6px; margin-top: 5px;"
              placeholder="Ej. 1.5"
            />
          </div>
          <div>
            <label style="font-size: 0.8rem; color: #94a3b8; display: block;">
              {{ visitaNombre || 'Equipo Visitante' }} (goles esperados)
            </label>
            <input
              type="number"
              [(ngModel)]="inputData.golesFavorVisita"
              (input)="recalcular()"
              style="width: 100%; background: #0f172a; border: 1px solid #475569; color: white; 
              padding: 8px; border-radius: 6px; margin-top: 5px;"
              placeholder="Ej. 1.2"
            />
          </div>
        </div>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
           gap: 15px;"
        >
          <div
            style="background: #1e293b; padding: 15px; border-radius: 10px; border-top: 4px 
solid #38bdf8; text-align: center;"
          >
            <span style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 6px;"
              >Ganador sugerido (1X2)</span
            >
            <strong
              style="font-size: 1.5rem; color: #38bdf8; display: block; margin-bottom: 8px;"
              >{{ resultados.g1x2.ganador }}</strong
            >
            <span style="font-size: 0.85rem; color: #e2e8f0;">{{
              resultados.g1x2.recomendacionGanador
            }}</span>
          </div>
          <div
            style="background: #1e293b; padding: 15px; border-radius: 10px; border-top: 4px 
solid #10b981; text-align: center;"
          >
            <span style="font-size: 0.8rem; color: #94a3b8; display: block; margin-bottom: 6px;"
              >Doble oportunidad (1X - X2 - 12)</span
            >
            <strong
              style="font-size: 1.5rem; color: #10b981; display: block; margin-bottom: 8px;"
              >{{ resultados.g1x2.dobleOportunidad }}</strong
            >
            <span style="font-size: 0.85rem; color: #e2e8f0;">{{
              resultados.g1x2.recomendacionDoble
            }}</span>
          </div>
        </div>
      </section>

      <!-- PESTAÑA: SUREBET (después de G 1X2) -->
      <section
        *ngIf="pestanaActiva === 'surebet'"
        style="background: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 
10px; margin-bottom: 20px; color: white;"
      >
        <h2 style="margin: 0 0 16px; color: #38bdf8; font-size: 1.15rem;">Calculadora Surebet</h2>
        <p
          *ngIf="surebetImportStatus"
          style="margin: -6px 0 14px; color: #cbd5e1; font-size: 
0.85rem;"
        >
          {{ surebetImportStatus }}
        </p>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
gap: 12px; margin-bottom: 16px;"
        >
          <label style="font-size: 0.85rem; color: #cbd5e1;">
            Mercado
            <select
              [(ngModel)]="surebetMercado"
              (ngModelChange)="calcularSurebet()"
              style="display: block; width: 100%; margin-top: 5px; padding: 9px; background: 
#1e293b; border: 1px solid #475569; color: white; border-radius: 6px;"
            >
              <option value="goles">Goles totales</option>
              <option value="faltas">Faltas totales</option>
              <option value="tarjetas">Tarjetas totales</option>
              <option value="fuerasJuego">Fueras de juego</option>
              <option value="corners">Córners totales</option>
              <option value="tirosPuerta">Tiros a puerta</option>
              <option value="resultado1x2">Resultado 1X2</option>
            </select>
          </label>
          <label *ngIf="!surebetEsTresVias" style="font-size: 0.85rem; color: #cbd5e1;">
            Línea
            <input
              type="text"
              [(ngModel)]="surebetLinea"
              (input)="calcularSurebet()"
              placeholder="Ej. 2.5"
              style="display: block; width: 100%; margin-top: 5px; padding: 9px; background: 
#1e293b; border: 1px solid #475569; color: white; border-radius: 6px; box-sizing: border
box;"
            />
          </label>
          <label style="font-size: 0.85rem; color: #cbd5e1;">
            Importe total a repartir
            <input
              type="number"
              min="0.01"
              step="0.01"
              [(ngModel)]="surebetBankroll"
              (input)="calcularSurebet()"
              style="display: block; width: 100%; margin-top: 5px; padding: 9px; background: 
#1e293b; border: 1px solid #475569; color: white; border-radius: 6px; box-sizing: border
box;"
            />
          </label>
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); 
gap: 12px;"
        >
          <div
            *ngFor="let outcome of surebetOutcomes; let i = index"
            style="background: 
#1e293b; border: 1px solid #334155; border-radius: 8px; padding: 14px;"
          >
            <h3 style="font-size: 0.95rem; margin: 0 0 10px; color: #e2e8f0;">{{ outcome }}</h3>
            <label style="font-size: 0.8rem; color: #94a3b8;">
              Casa de apuestas
              <input
                type="text"
                [(ngModel)]="surebetCasas[i]"
                (input)="calcularSurebet()"
                placeholder="Nombre de la casa"
                style="display: block; width: 100%; margin-top: 4px; padding: 8px; background: 
#0f172a; border: 1px solid #475569; color: white; border-radius: 6px; box-sizing: border
box;"
              />
            </label>
            <label style="display: block; margin-top: 10px; font-size: 0.8rem; color: #94a3b8;">
              Cuota decimal
              <input
                type="number"
                min="1.01"
                step="0.01"
                [(ngModel)]="surebetCuotas[i]"
                (input)="calcularSurebet()"
                placeholder="Ej. 2.10"
                style="display: block; width: 100%; margin-top: 4px; padding: 8px; background: 
#0f172a; border: 1px solid #475569; color: white; border-radius: 6px; box-sizing: border
box;"
              />
            </label>
          </div>
        </div>

        <p
          *ngIf="!surebetResultado"
          style="margin: 14px 0 0; color: #94a3b8; font-size: 
0.85rem;"
        >
          Completa todas las casas y cuotas. Usa la misma línea y el mismo evento para todos los
          resultados.
        </p>
        <div
          *ngIf="surebetResultado as resultado"
          style="margin-top: 16px; padding: 14px; 
background: #1e293b; border-radius: 6px;"
          [style.border-left]="'4px solid ' + (resultado.arbitrable ? '#10b981' : '#f59e0b')"
        >
          <strong [style.color]="resultado.arbitrable ? '#34d399' : '#fbbf24'">
            {{
              resultado.arbitrable
                ? 'Surebet matemática detectada'
                : 'No hay surebet con estas 
cuotas'
            }}
          </strong>
          <div
            style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 
1fr)); gap: 8px; margin-top: 10px; font-size: 0.85rem; color: #e2e8f0;"
          >
            <span>Suma implícita: {{ resultado.probabilidadImplicita.toFixed(2) }}%</span>
            <span>Stake calculado: {{ resultado.inversion.toFixed(2) }}</span>
            <span>Retorno mínimo: {{ resultado.retorno.toFixed(2) }}</span>
            <span>Ganancia neta: {{ resultado.ganancia.toFixed(2) }}</span>
            <span>ROI: {{ resultado.roi.toFixed(2) }}%</span>
          </div>
          <div style="margin-top: 10px; font-size: 0.85rem; color: #cbd5e1;">
            <div *ngFor="let stake of resultado.stakes">
              {{ stake.resultado }} en {{ stake.casa }} (cuota {{ stake.cuota.toFixed(2) }}):
              apostar {{ stake.stake.toFixed(2) }}
            </div>
          </div>
          <small style="display: block; margin-top: 10px; color: #94a3b8;">
            Resultado teórico según las cuotas ingresadas; no contempla límites, cambios de cuota ni
            reglas de liquidación distintas.
          </small>
        </div>
     
      </section>

      <section
        *ngIf="pestanaActiva === 'promWeb'"
        style="background: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: white;"
    >
        <div
          style="display: flex; justify-content: space-between; align-items: center; margin
bottom: 1rem; flex-wrap: wrap; gap: 1rem;"
        >
          <h2 style="font-size: 1.2rem; margin: 0; color: #38bdf8;">Prom Web</h2>
          <button
            (click)="copiarPrompt()"
            style="background: linear-gradient(135deg, #0284c7, #0369a1); color: white; 
border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; 
font-size: 0.85rem;"
          >
            Copiar Prompt al Portapapeles
          </button>
        </div>
        <div
          style="color: #cbd5e1; line-height: 1.5; font-size: 0.9rem; margin-bottom: 
1rem;"
        >
          <p>
            Toca el botón superior para copiar el siguiente texto con los equipos actualizados ({{
              localNombre
            }}
            vs {{ visitaNombre }}):
          </p>
        </div>
        <div
          style="background-color: #0f172a; padding: 1.2rem; border-radius: 8px; border: 1px 
solid #475569; font-family: monospace; font-size: 0.85rem; color: #38bdf8; white-space: 
pre-wrap; line-height: 1.5;"
          [textContent]="promptWeb"
        ></div>
      </section>
      <footer class="app-footer">
        <span>MEGAFUTBOL · Sistema integral de analítica deportiva</span>
        <strong>Versión 2 · 2026</strong>
      </footer>
    
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit {
  pestanaActiva: string = 'partido';
  menuAbierto = false;
  nba = {
    localNombre: 'Equipo NBA Local',
    visitaNombre: 'Equipo NBA Visitante',
    jugador: 'Jugador NBA',
    localPuntosFavor: 112,
    localPuntosContra: 110,
    visitaPuntosFavor: 111,
    visitaPuntosContra: 113,
    localRitmo: 99,
    visitaRitmo: 99,
    ventajaLocal: 2.5,
    desviacionMargen: 12,
    triplesJugador: 2.5,
    intentosTriple: 7,
    porcentajeTriple: 36,
    minutosJugador: 32,
    localPrimerCuarto: 28,
    visitaPrimerCuarto: 27,
    lineaTotalPuntos: 224.5,
    lineaGanador: 0,
    lineaTriples: 2.5,
    lineaPrimerCuarto: 55.5,
  };
  nbaResultados = {
    totalPuntos: 0,
    totalRecomendacion: '',
    ganador: '',
    probabilidadLocal: 0,
    probabilidadVisita: 0,
    triples: 0,
    triplesRecomendacion: '',
    primerCuarto: 0,
    primerCuartoRecomendacion: '',
  };
  nbaPromptCopiado = '';
  resultadoPromNba = '';
  estadoImportacionNba = '';
  datosNoColocadosNba: string[] = [];
  tenisMesa = {
    jugador1: 'Jugador 1',
    jugador2: 'Jugador 2',
    setsParaGanar: 3,
    porcentajeVictorias1: 55,
    porcentajeVictorias2: 45,
    setsGanados1: 2.8,
    setsPerdidos1: 1.8,
    setsGanados2: 2.4,
    setsPerdidos2: 2.1,
    puntosSet1: 10.8,
    puntosSet2: 10.2,
    lineaHandicap: 0,
    lineaTotalSets: 4.5,
  };
  tenisMesaResultados = {
    ganador: '',
    probabilidad1: 0,
    probabilidad2: 0,
    marcadorSets: '',
    recomendacionSets: '',
    totalSets: 0,
    recomendacionTotal: '',
    confianza: 0,
  };
  tenisMesaPromptCopiado = '';
  resultadoPromTenisMesa = '';
  estadoImportacionTenisMesa = '';
  datosNoColocadosTenisMesa: string[] = [];
  limitePronosticos = 15;
  umbralValorPronosticos = 65;
  pronosticosDiarios: PronosticoDiario[] = [];
  pronosticosOnline: OnlinePronostico[] = [];
  estadoPronosticos = 'Pulsa “Buscar pronósticos online” para consultar la API.';
  buscandoPronosticosOnline = false;
  consultaOnlineIntentada = false;
  apiConfigurada = false;
  fuentesPronosticos = [
    { nombre: 'BetMines', url: 'https://www.betmines.com/' },
    { nombre: 'Forebet', url: 'https://www.forebet.com/es/' },
    { nombre: 'Vitibet', url: 'https://www.vitibet.com/' },
    { nombre: 'Flashscore', url: 'https://www.flashscore.es/' },
  ];
  localNombre: string = 'Once Caldas';
  visitaNombre: string = 'Atlético Bucaramanga';
  // Tus claves configuradas
  masterKey: string = 'Milena1428';
  claveGenerica: string = '202601';
  public isLicensed: boolean = false;
  public inputKey: string = '';
  public mensajeEstado: string = '';
  public deviceId: string = '';
  public urlLicenciasJson = 'https://example.invalid/licencias.json';
  private readonly licenciaUsadaStorageKey = 'mega_app_claves_usadas_v1';
  constructor(
    private readonly ngZone: NgZone,
    private readonly sanitizer: DomSanitizer,
    private readonly http: HttpClient,
    private readonly footballSheetService: FootballSheetService,
    private readonly oddsApiService: OddsApiService,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) {}
  isAuthenticated: boolean = false;
  errorMessage: string = '';
  appInternalId: string = '';
  estadisticasEstado = 'Introduce los equipos o pega un informe para cargar sus estadísticas.';
  analisisNarrativo: SafeHtml | string = '';
  diasRestantesTexto: string = 'Acceso Vitalicio';
  colorContadorFondo: string = 'rgba(16,185,129,0.1)';
  colorContadorBorde: string = '#10b981';
  colorContadorTexto: string = '#34d399';
  private timerInterval: ReturnType<typeof setInterval> | undefined;

  textoPegadoUsuario: string = '';
  mensajeImportacion = '';
  cantidadDatosImportados = 0;
  cantidadDatosColocados = 0;
  datosNoColocadosFutbol: string[] = [];
  lineasCasa = {
    goles: null as number | null,
    tarjetas: null as number | null,
    faltas: null as number | null,
    tirosPuerta: null as number | null,
    fuerasJuego: null as number | null,
    corners: null as number | null,
  };

  inputData = {
    golesFavorLocal: 1.5,
    golesEnContraLocal: 0.8,
    golesFavorVisita: 1.2,
    golesEnContraVisita: 1.1,
    promGolesPartidoLocal: 2.3,
    promGolesPartidoVisita: 2.1,
    bttsLocal: 60,
    bttsVisita: 50,
    cornersLocal: 5.2,
    cornersVisita: 4.5,
    tarjetasLocal: 2.4,
    tarjetasVisita: 2.8,
    promArbitroTarjetas: 5.0,
    faltasFavorLocal: 13.5,
    faltasContraLocal: 12.0,
    faltasFavorVisita: 13.0,
    faltasContraVisita: 12.5,
    promArbitroFaltas: 24.0,
    tirosPuertaLocal: 4.8,
    tirosPuertaVisita: 4.0,
    fuerasJuegoLocal: 1.8,
    fuerasJuegoVisita: 1.5,
    handicapLocal: -0.25,
    golesAsiaticos: 2.25,
  };
  resultados = {
    marcador: { equipo1: 1, equipo2: 1, porcentaje: 70 },
    overUnder: {
      total: 2.5,
      probabilidadOver: 0,
      probabilidadUnder: 0,
      recomendacion: 'Calculando...',
    },
    btts: { promedio: 55, probabilidadModelo: 0, recomendacion: 'Calculando...' },
    corners: { pronosticados: 9.7, recomendacion: 'Over Córners' },
    tarjetas: { pronosticadas: 4.8, recomendacion: 'Partido caliente (Más de 4.5)' },
    faltas: { pronosticadas: 25.2, recomendacion: 'Alta intensidad de faltas' },
    tirosPuerta: { pronosticados: 8.8, recomendacion: 'Muchos remates a puerta' },
    fuerasJuego: { pronosticadas: 3.3, recomendacion: 'Línea defensiva alta' },
    asiatico: {
      pronostico: 'Handicap -0.25 | Goles 2.25',
      recomendacion: 'Línea analizada bajo parámetros asiáticos',
    },
    g1x2: {
      ganador: 'Local (1)',
      recomendacionGanador: 'Victoria probable del equipo local',
      dobleOportunidad: '1X',
      recomendacionDoble: 'Cubre Local o Empate con alta seguridad',
      probLocal: 0,
      probEmpate: 0,
      probVisita: 0,
    },
    recomendacionesTop: [] as Recomendacion[],
  };
  surebetMercado = 'goles';
  surebetLinea = '2.5';
  surebetBankroll = 100;
  surebetCasas: string[] = ['', '', ''];
  surebetCuotas: Array<number | null> = [null, null, null];
  surebetResultado: SurebetResultado | null = null;
  surebetImportStatus = '';
  retoCapitalInicial = 0;
  retoCapital = 0;
  retoPorcentaje = 60;
  retoCuota = 1.5;
  retoPasos = 10;
  retoCapitalFinal = 0;
  retoTabla: RetoPaso[] = [];
  x3dCapital = 100000;
  x3dCuota = 1.5;
  x3dPorcentajes = [60, 60, 50, 50];
  x3dCapitalFinal = 0;
  x3dTabla: RetoPaso[] = [];
  x3dPronosticoWebInput = '';
  x3dPronosticoWebCard = '';
  x3dApuestas: X3dApuesta[] = [];
  millonarioApuestas: X3dApuesta[] = [];
  readonly fuentesX3D = [
    {
      nombre: 'Forebet',
      url: 'https://www.forebet.com/en/football-predictions/predictions-1x2',
    },
    {
      nombre: 'BetMines',
      url: 'https://betmines.com/es',
    },
    {
      nombre: 'Vitisport',
      url: 'https://www.vitisport.es/',
    },
  ];
  estadoX3D = 'Pulsa “Empezar extracción x3D” para cargar cuotas.';
  buscandoX3D = false;
  estadoMillonario = 'Pulsa “Empezar extracción millonaria” para cargar cuotas.';
  buscandoMillonario = false;
  retoMillonarioCapitalInicial = 100000;
  retoMillonarioMeta = 54000000;
  retoMillonarioCapitalFinal = 0;
  retoMillonarioCumplido = false;
  retoMesAbierto = 0;
  retoMillonarioTabla: RetoMillonarioMes[] = [
    { nombre: 'Mes 1', capitalInicial: 0, cuota: 10, porcentajeApuesta: 10, meta: 1000000, capitalFinal: 0, cumplido: false, dias: [] },
    { nombre: 'Mes 2', capitalInicial: 0, cuota: 10, porcentajeApuesta: 10, meta: 6000000, capitalFinal: 0, cumplido: false, dias: [] },
    { nombre: 'Mes 3', capitalInicial: 0, cuota: 6, porcentajeApuesta: 10, meta: 18000000, capitalFinal: 0, cumplido: false, dias: [] },
    { nombre: 'Mes 4', capitalInicial: 0, cuota: 3, porcentajeApuesta: 10, meta: 54000000, capitalFinal: 0, cumplido: false, dias: [] },
  ];
  surebetPromptAddon = ` 
 
8. SUREBET PARA IMPORTAR EN LA APP 
Busca cuotas decimales vigentes en fuentes reales y nombra la casa para cada resultado. 
Usa cuotas del mismo evento, mercado, periodo y línea exacta; no mezcles líneas ni 
inventes cuotas. Elige una oportunidad verificable entre goles, faltas, tarjetas, fuerasJuego, 
corners, tirosPuerta o resultado1x2. Si no encuentras cuotas reales para todos los 
resultados después de revisar las casas disponibles, escribe solo: Surebet mercado: 
no_disponible 
Si hay oportunidad, responde este bloque sin Markdown, negritas ni viñetas y respetando 
exactamente estas etiquetas: 
Surebet mercado: [goles|faltas|tarjetas|fuerasJuego|corners|tirosPuerta|resultado1x2] 
Surebet línea: [línea exacta, o n/a para resultado1x2] 
Surebet importe: 100 
Surebet Over: Casa=[nombre]; Cuota=[cuota decimal] 
Surebet Under: Casa=[nombre]; Cuota=[cuota decimal] 
Para resultado1x2, omite Over/Under y devuelve cada una de estas filas por separado: 
Surebet Local: Casa=[nombre]; Cuota=[cuota decimal] 
Surebet Empate: Casa=[nombre]; Cuota=[cuota decimal] 
Surebet Visitante: Casa=[nombre]; Cuota=[cuota decimal] 
La app calculará el arbitraje teórico; no afirmes ganancias garantizadas.`;
  get promptWeb(): string {
    return `PARTIDO A ANALIZAR: ${this.localNombre} vs ${this.visitaNombre}
REGLAS OBLIGATORIAS: devuelve Ãºnicamente las lÃ­neas de datos indicadas abajo, una por lÃ­nea y en el mismo orden. No escribas introducciÃ³n, conclusiÃ³n, tÃ­tulos, explicaciones, viÃ±etas, tablas ni Markdown. Escribe exactamente un valor despuÃ©s de cada dos puntos. Usa punto decimal, por ejemplo 1.75; nunca escribas 1. 75. Si no puedes verificar un dato, escribe exactamente No disponible. No aÃ±adas etiquetas, lÃ­neas o cuotas que no aparezcan en este bloque.
Analiza el partido usando únicamente datos verificables y recientes. No inventes estadísticas ni cuotas. Si no puedes verificar un dato, escribe No disponible.

Entrega SOLO las siguientes líneas, en este orden. Usa un número decimal después de cada dos puntos; no agregues unidades, comentarios ni Markdown:
Equipo Local (Home): ${this.localNombre}
Equipo Visitante (Away): ${this.visitaNombre}
Local - Promedio de goles a favor por partido: [valor]
Local - Promedio de goles en contra por partido: [valor]
Local - BTTS (%): [valor]
Local - Promedio de goles totales por partido: [valor]
Visita - Promedio de goles a favor por partido: [valor]
Visita - Promedio de goles en contra por partido: [valor]
Visita - BTTS (%): [valor]
Visita - Promedio de goles totales por partido: [valor]
Local - Promedio de córners por partido: [valor]
Visita - Promedio de córners por partido: [valor]
Local - Promedio de tarjetas por partido: [valor]
Visita - Promedio de tarjetas por partido: [valor]
Árbitro - Promedio de tarjetas por partido: [valor]
Local - Promedio de faltas a favor por partido: [valor]
Local - Promedio de faltas en contra por partido: [valor]
Visita - Promedio de faltas a favor por partido: [valor]
Visita - Promedio de faltas en contra por partido: [valor]
Árbitro - Promedio de faltas señaladas por partido: [valor]
Local - Promedio de tiros a puerta por partido: [valor]
Visita - Promedio de tiros a puerta por partido: [valor]
Local - Promedio de fueras de juego por partido: [valor]
Visita - Promedio de fueras de juego por partido: [valor]
Hándicap asiático local recomendado: [valor]
Línea de goles asiáticos: [valor]
Línea de la casa - Total de goles: [valor] | Casa: [nombre o No disponible]
Línea de la casa - Total de córners: [valor] | Casa: [nombre o No disponible]
Línea de la casa - Total de tarjetas: [valor] | Casa: [nombre o No disponible]
Línea de la casa - Total de faltas: [valor] | Casa: [nombre o No disponible]
Línea de la casa - Total de tiros a puerta: [valor] | Casa: [nombre o No disponible]
Línea de la casa - Total de fueras de juego: [valor] | Casa: [nombre o No disponible]
Cuota 1X2 Local: Casa=[nombre o No disponible]; Cuota=[valor o No disponible]
Cuota 1X2 Empate: Casa=[nombre o No disponible]; Cuota=[valor o No disponible]
Cuota 1X2 Visitante: Casa=[nombre o No disponible]; Cuota=[valor o No disponible]

Las líneas de casas y las cuotas deben corresponder al mismo partido, mercado, periodo y línea. No afirmes ganancias garantizadas. Si no hay cuotas verificables para una surebet, añade exactamente:
Surebet mercado: no_disponible`;
  }

  get legacyPromptWeb(): string {
    return `Actúa como analista estadístico de fútbol profesional. 
Busca datos verificables basándote en todos los partidos oficiales disputados en la 
competición actual. No inventes datos ni cuotas. Si una métrica no está disponible, escribe 
"No disponible" en su línea. Estructura el informe ordenando cada métrica estrictamente 
en su propia línea individual, sin combinar ni agrupar ítems, de forma que sea un formato 
limpio, automatizable y listo para ser leído e importado automáticamente por una 
aplicación para rellenar formularios o bases de datos (en compatibilidad con estructuras 
de exportación PDF/Word). 
    PARTIDO A ANALIZAR: ${this.localNombre} vs ${this.visitaNombre} 
    Equipo Local (Home): ${this.localNombre} 
    Equipo Visitante (Away): ${this.visitaNombre} 
    Árbitro: [Buscar árbitro del encuentro] 
 
    Devuelve cada métrica en su propia línea, respetando exactamente estas etiquetas y 
este orden. Escribe el valor numérico después de los dos puntos, usando punto o coma 
decimal. 
 
    1. GOLES 
    Local - Promedio de goles a favor por partido: [valor] 
    Local - Promedio de goles en contra por partido: [valor] 
    Local - BTTS (%): [valor] 
    Local - Promedio de goles totales por partido: [valor] 
    Visita - Promedio de goles a favor por partido: [valor] 
    Visita - Promedio de goles en contra por partido: [valor] 
    Visita - BTTS (%): [valor] 
    Visita - Promedio de goles totales por partido: [valor] 
    Línea de la casa - Total de goles: [valor de la línea] | Casa: [nombre de la casa] 
 
    2. CÓRNERS 
    Local - Promedio de córners por partido: [valor] 
    Visita - Promedio de córners por partido: [valor] 
    Línea de la casa - Total de córners: [valor de la línea] | Casa: [nombre de la casa] 
 
    3. TARJETAS 
    Local - Promedio de tarjetas por partido: [valor] 
    Visita - Promedio de tarjetas por partido: [valor] 
    Árbitro - Promedio de tarjetas por partido: [valor] 
    Línea de la casa - Total de tarjetas: [valor de la línea] | Casa: [nombre de la casa] 
 
    4. FALTAS 
    Local - Promedio de faltas a favor por partido: [valor] 
    Local - Promedio de faltas en contra por partido: [valor] 
    Visita - Promedio de faltas a favor por partido: [valor] 
    Visita - Promedio de faltas en contra por partido: [valor] 
    Árbitro - Promedio de faltas señaladas por partido: [valor] 
    Línea de la casa - Total de faltas: [valor de la línea] | Casa: [nombre de la casa] 
 
    5. TIROS A PUERTA 
    Local - Promedio de tiros a puerta por partido: [valor] 
    Visita - Promedio de tiros a puerta por partido: [valor] 
    Línea de la casa - Total de tiros a puerta: [valor de la línea] | Casa: [nombre de la casa] 
 
    6. FUERAS DE JUEGO 
    Local - Promedio de fueras de juego por partido: [valor] 
    Visita - Promedio de fueras de juego por partido: [valor] 
    Línea de la casa - Total de fueras de juego: [valor de la línea] | Casa: [nombre de la casa] 
 
    7. LÍNEAS ASIÁTICAS 
    Hándicap asiático local recomendado: [línea con signo, por ejemplo -0.25] | Casa: 
[nombre de la casa] 
    Línea de goles asiáticos: [línea, por ejemplo 2.25] | Casa: [nombre de la casa] 
    Usa las líneas anteriores en el mismo orden. No agregues números de sección a los 
valores ni combines métricas. 
 
    BÚSQUEDA DE CASAS Y MERCADO GANADOR 1X2 
    Antes de completar las líneas y cuotas, busca el partido y los mercados en las 
páginas/listados de cuotas de Wplay, Betsson, BetPlay, RushBet, Codere y otras casas 
disponibles legalmente en el país. Revisa más de una casa y usa una que realmente 
publique el mercado; no supongas que todas ofrecen todos los mercados. Si una casa no 
tiene la línea exacta, continúa buscando en las otras casas y reporta la línea exacta 
encontrada, junto con el nombre de esa casa. No escribas "No aplica" por falta de línea: si 
ninguna casa consultada ofrece ese mercado, escribe "No disponible" y no inventes una 
línea. Confirma que sea el mismo partido, mercado, periodo y tipo de liquidación. 
 
    Devuelve también las cuotas para el mercado ganador 1X2, cada resultado en su propia 
línea: 
    Cuota 1X2 Local: Casa=[nombre]; Cuota=[cuota decimal] 
    Cuota 1X2 Empate: Casa=[nombre]; Cuota=[cuota decimal] 
    Cuota 1X2 Visitante: Casa=[nombre]; Cuota=[cuota decimal] 
    Usa cuotas de la misma casa y del mismo mercado 1X2 cuando estén disponibles. Si no, 
puedes combinar casas, pero indica la casa individual junto a cada cuota. Si no encuentras 
un resultado, escribe "No disponible" en esa línea. No presentes cuotas sin una fuente 
verificable ni afirmes haber consultado una página a la que no tuviste acceso. 
 
${this.surebetPromptAddon}`
      .replace(/^    /gm, '')
      .trim();
  }

  get surebetEsTresVias(): boolean {
    return this.surebetMercado === 'resultado1x2';
  }

  get surebetOutcomes(): string[] {
    return this.surebetEsTresVias
      ? ['Local (1)', 'Empate (X)', 'Visitante (2)']
      : ['Over', 'Under'];
  }

  calcularSurebet(): void {
    const cantidadResultados = this.surebetEsTresVias ? 3 : 2;
    const resultados = this.surebetOutcomes;
    const entradas = this.surebetCuotas.slice(0, cantidadResultados).map((cuota, index) => ({
      resultado: resultados[index] ?? '',
      casa: (this.surebetCasas[index] ?? '').trim(),
      cuota: Number(cuota),
    }));
    const importe = Number(this.surebetBankroll);

    if (
      !Number.isFinite(importe) ||
      importe <= 0 ||
      entradas.some(
        (entrada) => !entrada.casa || !Number.isFinite(entrada.cuota) || entrada.cuota <= 1,
      )
    ) {
      this.surebetResultado = null;
      return;
    }

    const sumaImplicita = entradas.reduce((suma, entrada) => suma + 1 / entrada.cuota, 0);
    const stakes = entradas.map((entrada) => ({
      ...entrada,
      stake: importe * (1 / entrada.cuota / sumaImplicita),
    }));
    const inversion = stakes.reduce((suma, entrada) => suma + entrada.stake, 0);
    const retorno = importe / sumaImplicita;
    const ganancia = retorno - inversion;

    this.surebetResultado = {
      arbitrable: sumaImplicita < 1 && ganancia > 0,
      probabilidadImplicita: sumaImplicita * 100,
      inversion,
      retorno,
      ganancia,
      roi: inversion > 0 ? (ganancia / inversion) * 100 : 0,
      stakes,
    };
  }

  calcularReto(): void {
    const capitalInicial = Number(this.retoCapital);
    const porcentajeIngresado = Number(this.retoPorcentaje);
    const cuotaIngresada = Number(this.retoCuota);
    const porcentaje = (Number.isFinite(porcentajeIngresado)
      ? Math.min(100, Math.max(0, porcentajeIngresado))
      : 60) / 100;
    const cuota = Number.isFinite(cuotaIngresada) ? Math.max(1.01, cuotaIngresada) : 1.5;

    this.retoCapitalInicial = Number.isFinite(capitalInicial) && capitalInicial > 0 ? capitalInicial : 0;
    this.retoCapital = this.retoCapitalInicial;
    this.retoPorcentaje = porcentaje * 100;
    this.retoCuota = cuota;
    this.retoTabla = [];

    if (!this.retoCapitalInicial) {
      this.retoCapitalFinal = 0;
      return;
    }

    let capital = this.retoCapitalInicial;
    for (let paso = 1; paso <= this.retoPasos; paso++) {
      const apuesta = capital * porcentaje;
      const retorno = apuesta * this.retoCuota;
      const ganancia = retorno - apuesta;
      const capitalFinal = capital - apuesta + retorno;
      this.retoTabla.push({
        paso,
        capitalInicial: capital,
        apuesta,
        retorno,
        ganancia,
        capitalFinal,
        cuota: this.retoCuota,
      });
      capital = capitalFinal;
    }
    this.retoCapitalFinal = capital;
  }

  calcularX3D(): void {
    const capitalIngresado = Number(this.x3dCapital);
    const cuotaIngresada = Number(this.x3dCuota);
    const capitalInicial = Number.isFinite(capitalIngresado) && capitalIngresado > 0
      ? capitalIngresado
      : 0;
    const cuota = Number.isFinite(cuotaIngresada) ? Math.max(1.01, cuotaIngresada) : 1.5;

    this.x3dCapital = capitalInicial;
    this.x3dCuota = cuota;
    this.x3dTabla = [];
    let capital = capitalInicial;

    for (let indice = 0; indice < this.x3dPorcentajes.length; indice++) {
      const apuesta = capital * (this.x3dPorcentajes[indice] / 100);
      const retorno = apuesta * cuota;
      const capitalFinal = capital - apuesta + retorno;
      this.x3dTabla.push({
        paso: indice + 1,
        capitalInicial: capital,
        apuesta,
        retorno,
        ganancia: retorno - apuesta,
        capitalFinal,
        cuota,
      });
      capital = capitalFinal;
    }

    this.x3dCapitalFinal = capital;
  }

  calcularRetoMillonario(): void {
    const capitalIngresado = Number(this.retoMillonarioCapitalInicial);
    const metaIngresada = Number(this.retoMillonarioMeta);
    let capital = Number.isFinite(capitalIngresado) && capitalIngresado > 0 ? capitalIngresado : 0;

    this.retoMillonarioCapitalInicial = capital;
    this.retoMillonarioMeta =
      Number.isFinite(metaIngresada) && metaIngresada > 0 ? metaIngresada : 1000000;

    const cuotasBase = [
      [1.18, 1.18],
      [1.2, 1.19],
      [1.2, 1.2],
      [1.21, 1.2],
      [1.21, 1.21],
      [1.22, 1.21],
      [1.22, 1.22],
      [1.23, 1.23],
      [1.24, 1.23],
      [1.25, 1.24],
    ];
    const mes1Montos = [
      15000, 16000, 17000, 18000, 19000, 20000, 21000, 22000,
      22500, 23000, 23500, 24000, 24500, 25000, 25000, 25000,
      25000, 25000, 25000, 25000, 25000, 25000, 25000, 25000,
      25000, 25000, 25000, 25000,
    ];
    const mes1Cuotas = [
      [1.18, 1.18], [1.20, 1.19], [1.20, 1.20], [1.21, 1.20],
      [1.21, 1.21], [1.22, 1.21], [1.22, 1.22], [1.23, 1.23],
      [1.24, 1.23], [1.25, 1.24], [1.25, 1.24], [1.26, 1.24],
      [1.26, 1.25], [1.26, 1.26], [1.26, 1.26], [1.26, 1.26],
      [1.26, 1.26], [1.26, 1.26], [1.26, 1.26], [1.26, 1.26],
      [1.26, 1.26], [1.26, 1.26], [1.26, 1.26], [1.26, 1.26],
      [1.26, 1.26], [1.26, 1.26], [1.26, 1.26], [1.28, 1.27],
    ];
    const mes1Saldos = [
      112000, 125760, 141060, 157620, 175480, 194680, 215680,
      238560, 262410, 287710, 314030, 341390, 369810, 399310,
      428810, 458310, 487810, 517310, 546810, 576310, 605810,
      635310, 664810, 694310, 723810, 753310, 782810, 1000000,
    ];
    const mes2Montos = [
      60000, 62500, 65000, 67500, 70000, 72500, 75000, 77500,
      80000, 82500, 85000, 87500, 90000, 92500, 95000, 97500,
      100000, 102500, 105000, 107500, 110000, 112500, 115000, 117500,
      120000, 125000, 150000, 220000,
    ];
    const mes2Cuotas = [
      [1.22, 1.22], [1.23, 1.22], [1.24, 1.22], [1.24, 1.23],
      [1.24, 1.23], [1.25, 1.24], [1.25, 1.25], [1.26, 1.25],
      [1.26, 1.26], [1.27, 1.26], [1.25, 1.24], [1.26, 1.25],
      [1.26, 1.25], [1.27, 1.25], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.26], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.25], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.26], [1.28, 1.27], [1.32, 1.30], [1.38, 1.36],
    ];
    const mes2Saldos = [
      1054000, 1114000, 1179000, 1249200, 1323400, 1403150, 1487150,
      1575500, 1668300, 1765650, 1859150, 1958900, 2063300, 2172450,
      2284550, 2397650, 2515650, 2636600, 2760500, 2887350, 3014950,
      3147700, 3283400, 3422050, 3563650, 3725650, 3947650, 6000000,
    ];
    const mes3Montos = [
      310000, 320000, 330000, 340000, 350000, 360000, 370000, 380000,
      390000, 400000, 410000, 420000, 430000, 440000, 450000, 460000,
      470000, 480000, 490000, 500000, 510000, 520000, 530000, 540000,
      550000, 500000, 400000, 350000,
    ];
    const mes3Cuotas = [
      [1.22, 1.22], [1.23, 1.22], [1.24, 1.22], [1.24, 1.23],
      [1.24, 1.23], [1.25, 1.24], [1.25, 1.25], [1.26, 1.25],
      [1.26, 1.26], [1.27, 1.26], [1.27, 1.26], [1.28, 1.26],
      [1.25, 1.24], [1.27, 1.25], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.26], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.25], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.25, 1.24], [1.23, 1.22], [1.22, 1.21], [1.28, 1.27],
    ];
    const mes3Saldos = [
      6252000, 6531000, 6831800, 7148600, 7488600, 7852600, 8234200,
      8641200, 9066800, 9511400, 9975400, 10459200, 10921200, 11411400,
      11921800, 12452800, 12995600, 13550200, 14116600, 14694800, 15274800,
      15864800, 16454800, 17044800, 17389800, 17632800, 17810800, 18000000,
    ];
    const mes4Montos = [
      900000, 930000, 960000, 990000, 1020000, 1050000, 1080000, 1110000,
      1140000, 1170000, 1200000, 1230000, 1260000, 1290000, 1320000, 1350000,
      1380000, 1410000, 1440000, 1470000, 1500000, 1530000, 1560000, 1590000,
      800000, 600000, 400000, 500000,
    ];
    const mes4Cuotas = [
      [1.22, 1.22], [1.23, 1.22], [1.24, 1.22], [1.24, 1.23],
      [1.24, 1.23], [1.25, 1.24], [1.25, 1.25], [1.26, 1.25],
      [1.26, 1.26], [1.27, 1.26], [1.27, 1.26], [1.28, 1.26],
      [1.25, 1.24], [1.27, 1.25], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.26], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.27, 1.25], [1.27, 1.26], [1.27, 1.26], [1.27, 1.26],
      [1.25, 1.24], [1.23, 1.22], [1.22, 1.21], [1.46, 1.45],
    ];
    const mes4Saldos = [
      18756000, 19588500, 20481500, 21417500, 22417500, 23457500, 24517500,
      25617500, 26737500, 27877500, 29037500, 30217500, 31573500, 33003900,
      34508700, 36089100, 37746300, 39482100, 41297700, 43194900, 45169500,
      47225700, 49365300, 51590100, 52091700, 52383300, 52560900, 54000000,
    ];
    const metasMensuales = [1 / 54, 6 / 54, 18 / 54, 1].map(
      (proporcion) => this.retoMillonarioMeta * proporcion,
    );

    this.retoMillonarioTabla = this.retoMillonarioTabla.map((mes, indiceMes) => {
      const capitalInicial = capital;
      const dias: RetoMillonarioDia[] = [];

      for (let dia = 1; dia <= 28; dia++) {
        const guardado = mes.dias[dia - 1];
        const resultado1 = guardado?.apuesta1?.resultado || 'pendiente';
        const resultado2 = guardado?.apuesta2?.resultado || 'pendiente';
        const capitalDia = capital;
        const diasRestantes = 29 - dia;
        const capitalObjetivoDia = capitalDia < mes.meta
          ? capitalDia * Math.pow(mes.meta / capitalDia, 1 / diasRestantes)
          : capitalDia;
        const gananciaNecesaria = Math.max(0, capitalObjetivoDia - capitalDia);
        const esMes1 = indiceMes === 0;
        const esMes2 = indiceMes === 1;
        const esMes3 = indiceMes === 2;
        const esMes4 = indiceMes === 3;
        const cuotasPredeterminadas = esMes1
          ? mes1Cuotas[dia - 1]
          : esMes2
            ? mes2Cuotas[dia - 1]
            : esMes3
              ? mes3Cuotas[dia - 1]
              : esMes4
                ? mes4Cuotas[dia - 1]
                : cuotasBase[(dia - 1) % cuotasBase.length];
        const cuota1Base = resultado1 === 'pendiente'
          ? cuotasPredeterminadas[0]
          : guardado?.apuesta1?.cuota ?? cuotasPredeterminadas[0];
        const cuota2Base = resultado2 === 'pendiente'
          ? cuotasPredeterminadas[1]
          : guardado?.apuesta2?.cuota ?? cuotasPredeterminadas[1];
        const factorGanancia = Math.max(0.01, cuota1Base - 1) + Math.max(0.01, cuota2Base - 1);
        const montoTotal = Math.min(capitalDia * 0.4, gananciaNecesaria / factorGanancia);
        const hayPerdidaAnterior = mes.dias
          .slice(0, dia - 1)
          .some((diaAnterior) =>
            diaAnterior.apuesta1.resultado === 'perdida' ||
            diaAnterior.apuesta2.resultado === 'perdida',
          );
        const perdidasAnteriores = mes.dias
          .slice(0, dia - 1)
          .reduce(
            (total, diaAnterior) =>
              total +
              (diaAnterior.apuesta1.resultado === 'perdida' ? 1 : 0) +
              (diaAnterior.apuesta2.resultado === 'perdida' ? 1 : 0),
            0,
          );
        const aumentoRecuperacion = hayPerdidaAnterior
          ? 1 + Math.min(0.5, perdidasAnteriores * 0.05)
          : 1;
        const montoBase1 = guardado?.apuesta1?.monto ?? montoTotal / 2;
        const montoBase2 = guardado?.apuesta2?.monto ?? montoTotal / 2;
        const monto1 = resultado1 === 'pendiente'
          ? Math.min(capitalDia * 0.4, montoBase1 * aumentoRecuperacion)
          : guardado?.apuesta1?.monto ?? montoTotal / 2;
        const monto2 = resultado2 === 'pendiente'
          ? Math.min(capitalDia * 0.4, montoBase2 * aumentoRecuperacion)
          : guardado?.apuesta2?.monto ?? montoTotal / 2;
        const gananciaBase = monto1 * (cuota1Base - 1) + monto2 * (cuota2Base - 1);
        const gananciaFaltante = Math.max(0, gananciaNecesaria - gananciaBase);
        const ajustePorCuota = hayPerdidaAnterior &&
          resultado1 === 'pendiente' &&
          resultado2 === 'pendiente'
          ? gananciaFaltante / Math.max(1, monto1 + monto2)
          : 0;
        const cuotaFinal1 = resultado1 === 'pendiente'
          ? Math.round((cuota1Base + ajustePorCuota) * 100) / 100
          : cuota1Base;
        const cuotaFinal2 = resultado2 === 'pendiente'
          ? Math.round((cuota2Base + ajustePorCuota) * 100) / 100
          : cuota2Base;
        const retornoApuesta1 = resultado1 === 'perdida' ? 0 : monto1 * cuotaFinal1;
        const retornoApuesta2 = resultado2 === 'perdida' ? 0 : monto2 * cuotaFinal2;
        const saldoProyectado = capitalDia - monto1 - monto2 + retornoApuesta1 + retornoApuesta2;
        const capitalConGanancia = Math.round(saldoProyectado);
        dias.push({
          dia,
          capitalInicial: capitalDia,
          apuesta1: { monto: Math.round(monto1), cuota: cuotaFinal1, retorno: Math.round(retornoApuesta1), resultado: resultado1 },
          apuesta2: { monto: Math.round(monto2), cuota: cuotaFinal2, retorno: Math.round(retornoApuesta2), resultado: resultado2 },
          saldoFinalProtegido: capitalConGanancia,
          resultado: resultado1 === 'pendiente' || resultado2 === 'pendiente' ? 'pendiente' : 'ganada',
        });
        capital = capitalConGanancia;
      }

      const capitalFinal = capital;
      capital = capitalFinal;
      return {
        ...mes,
        capitalInicial,
        meta: metasMensuales[indiceMes] ?? mes.meta,
        cuota: mes.dias[0]?.apuesta1?.cuota || 1.18,
        capitalFinal,
        dias,
        cumplido:
          dias.length === 28 &&
          dias[27].apuesta1.resultado === 'ganada' &&
          dias[27].apuesta2.resultado === 'ganada',
      };
    });

    this.retoMillonarioCapitalFinal = capital;
    this.retoMillonarioCumplido = this.retoMillonarioTabla.every((mes) => mes.cumplido);
    this.guardarRetoMillonario();
  }

  private guardarRetoMillonario(): void {
    localStorage.setItem(
      'reto_millonario_dias_v2',
      JSON.stringify(
        this.retoMillonarioTabla.map((mes) => ({
          nombre: mes.nombre,
          dias: mes.dias.map((dia) => ({
            apuesta1: dia.apuesta1,
            apuesta2: dia.apuesta2,
            resultado: dia.resultado,
          })),
        })),
      ),
    );
  }

  private cargarRetoMillonario(): void {
    const datosGuardados = localStorage.getItem('reto_millonario_dias_v2');
    if (!datosGuardados) {
      return;
    }

    try {
      const datos = JSON.parse(datosGuardados) as Array<{
        nombre?: string;
        dias?: Array<{
          apuesta1?: Partial<RetoMillonarioApuesta>;
          apuesta2?: Partial<RetoMillonarioApuesta>;
          resultado?: RetoMillonarioDia['resultado'];
        }>;
      }>;
      this.retoMillonarioTabla = this.retoMillonarioTabla.map((mes, indiceMes) => {
        const guardado = datos[indiceMes];
        if (!guardado) {
          return mes;
        }
        return {
          ...mes,
          dias: (guardado.dias ?? []).map((dia, indiceDia) => ({
            dia: indiceDia + 1,
            capitalInicial: 0,
            apuesta1: {
              monto: dia.apuesta1?.monto ?? 0,
              cuota: dia.apuesta1?.cuota ?? 1.18,
              retorno: 0,
              resultado: dia.apuesta1?.resultado ?? 'pendiente',
            },
            apuesta2: {
              monto: dia.apuesta2?.monto ?? 0,
              cuota: dia.apuesta2?.cuota ?? 1.18,
              retorno: 0,
              resultado: dia.apuesta2?.resultado ?? 'pendiente',
            },
            saldoFinalProtegido: 0,
            resultado: dia.resultado ?? 'pendiente',
          })),
        };
      });
    } catch (error) {
      console.warn('No se pudo cargar el progreso del reto millonario.', error);
    }

  }

  nuevoRetoMillonario(): void {
    localStorage.removeItem('reto_millonario_dias_v2');
    this.retoMillonarioCapitalInicial = 100000;
    this.retoMillonarioTabla = this.retoMillonarioTabla.map((mes) => ({
      ...mes,
      capitalInicial: 0,
      capitalFinal: 0,
      cumplido: false,
      dias: [],
    }));
    this.retoMillonarioCapitalFinal = 0;
    this.retoMillonarioCumplido = false;
    this.retoMesAbierto = 0;
    this.calcularRetoMillonario();
  }

  alternarMes(indiceMes: number): void {
    this.retoMesAbierto = this.retoMesAbierto === indiceMes ? -1 : indiceMes;
  }

  registrarApuesta(
    dia: RetoMillonarioDia,
    numeroApuesta: 1 | 2,
    resultado: 'ganada' | 'perdida',
  ): void {
    const apuesta = numeroApuesta === 1 ? dia.apuesta1 : dia.apuesta2;
    apuesta.resultado = resultado;
    this.calcularRetoMillonario();
  }

  verificarLicenciaEnLinea(): void {
    // 1. Obtenemos el ID de tu dispositivo
    this.deviceId = this.appInternalId || localStorage.getItem('mega_app_internal_signature') || '';

    if (!this.urlLicenciasJson || this.urlLicenciasJson.includes('example.invalid')) {
      this.isLicensed = true;
      this.mensajeEstado = 'Modo local activo: configura una URL real de licencias para validar en línea.';
      return;
    }
    this.deviceId = localStorage.getItem('appInternalId') || 'AQUÍ_EL_ID_DEL_DISPOSITIVO';

    this.deviceId = this.appInternalId || localStorage.getItem('mega_app_internal_signature') || '';

    // 2. Realizamos la consulta HTTP al archivo de GitHub de forma gratuita
    this.http.get<LicenciasResponse>(this.urlLicenciasJson).subscribe({
      next: (data) => {
        const fechaActual = new Date().toISOString().split('T')[0];

        // Buscamos si el ID coincide en tu lista de GitHub
        const dispositivoEncontrado = data.dispositivos.find(
          (dispositivo) => dispositivo.id === this.deviceId,
        );

        if (dispositivoEncontrado) {
          // Comparamos si la fecha actual es menor o igual a la expiración de 30 días
          if (fechaActual <= dispositivoEncontrado.expiracion) {
            this.isLicensed = true;
            this.mensajeEstado = `Licencia activa hasta: ${dispositivoEncontrado.expiracion}`;
          } else {
            this.isLicensed = false;
            this.mensajeEstado = 'Tu licencia de 30 días ha expirado.';
          }
        } else {
          this.isLicensed = false;
          this.mensajeEstado = 'Este dispositivo no está registrado.';
        }
      },
      error: (err) => {
        console.warn('Advertencia al verificar licencia en línea, modo seguro activado', err);
        this.isLicensed = true; // Permite el uso local de la app si falla la red
        this.mensajeEstado = 'Modo local activo (Sin conexión).';
      },
    });
  }

  ngOnInit(): void {
    this.cargarEstadoPartido();
    this.recalcular();
    this.cargarRetoMillonario();
    this.calcularRetoMillonario();
    this.calcularX3D();
    this.calcularNba();
    this.calcularTenisMesa();
    this.generarPronosticosInternos();
    this.verificarEstadoLicencia();
    this.verificarLicenciaEnLinea();
    this.timerInterval = setInterval(() => this.verificarEstadoLicencia(), 60_000);
  }

  ngOnDestroy(): void {
    this.guardarEstadoPartido();
    if (this.timerInterval !== undefined) clearInterval(this.timerInterval);
  }

  generarPronosticosInternos(): void {
    const limite = Math.min(10, Math.max(5, Math.round(Number(this.limitePronosticos) || 5)));
    this.limitePronosticos = limite;
    this.umbralValorPronosticos = Math.min(95, Math.max(50, Math.round(Number(this.umbralValorPronosticos) || 65)));
    const candidatos: PronosticoDiario[] = [];
    const marcador = this.resultados.marcador;
    const totalGoles = Number(this.resultados.overUnder.total);
    const corners = Number(this.resultados.corners.pronosticados);
    const tarjetas = Number(this.resultados.tarjetas.pronosticadas);

    candidatos.push(
      {
        deporte: 'FÚTBOL',
        evento: `${this.localNombre} vs ${this.visitaNombre}`,
        mercado: 'Ganador',
        seleccion: marcador.equipo1 >= marcador.equipo2 ? this.localNombre : this.visitaNombre,
        indiceValor: Math.round(Math.max(50, Math.min(95, marcador.porcentaje))),
        razon: `Marcador interno ${marcador.equipo1}-${marcador.equipo2} y probabilidad estimada del ${marcador.porcentaje}%.`,
      },
      {
        deporte: 'FÚTBOL',
        evento: `${this.localNombre} vs ${this.visitaNombre}`,
        mercado: 'Total de goles',
        seleccion: totalGoles > 1.5 ? 'Más de 1,5' : 'Menos de 1,5',
        indiceValor: Math.round(Math.max(50, Math.min(92, totalGoles > 1.5 ? 78 : 68))),
        razon: `Promedio interno de goles: ${totalGoles.toFixed(2)}.`,
      },
      {
        deporte: 'FÚTBOL',
        evento: `${this.localNombre} vs ${this.visitaNombre}`,
        mercado: 'Córners',
        seleccion: corners > 9.5 ? 'Más de 9,5' : 'Menos de 9,5',
        indiceValor: Math.round(Math.max(50, Math.min(90, corners > 9.5 ? 76 : 67))),
        razon: `Proyección interna de córners: ${corners.toFixed(1)}.`,
      },
      {
        deporte: 'FÚTBOL',
        evento: `${this.localNombre} vs ${this.visitaNombre}`,
        mercado: 'Tarjetas',
        seleccion: tarjetas > 4.5 ? 'Más de 4,5' : 'Menos de 4,5',
        indiceValor: Math.round(Math.max(50, Math.min(88, tarjetas > 4.5 ? 74 : 66))),
        razon: `Proyección interna de tarjetas: ${tarjetas.toFixed(1)}.`,
      },
      {
        deporte: 'NBA',
        evento: `${this.nba.localNombre} vs ${this.nba.visitaNombre}`,
        mercado: 'Total de puntos',
        seleccion: this.nbaResultados.totalRecomendacion,
        indiceValor: Math.round(Math.max(50, Math.min(93, this.nbaResultados.totalPuntos > 0 ? 75 : 50))),
        razon: `Proyección interna: ${this.nbaResultados.totalPuntos} puntos.`,
      },
      {
        deporte: 'NBA',
        evento: `${this.nba.localNombre} vs ${this.nba.visitaNombre}`,
        mercado: 'Ganador',
        seleccion: this.nbaResultados.ganador,
        indiceValor: Math.round(Math.max(50, Math.min(94, Math.max(this.nbaResultados.probabilidadLocal, this.nbaResultados.probabilidadVisita)))),
        razon: `Probabilidades internas: ${this.nbaResultados.probabilidadLocal}% local y ${this.nbaResultados.probabilidadVisita}% visitante.`,
      },
      {
        deporte: 'TENIS DE MESA',
        evento: `${this.tenisMesa.jugador1} vs ${this.tenisMesa.jugador2}`,
        mercado: 'Ganador',
        seleccion: this.tenisMesaResultados.ganador,
        indiceValor: Math.round(Math.max(50, Math.min(94, this.tenisMesaResultados.confianza))),
        razon: `Confianza interna: ${this.tenisMesaResultados.confianza}%.`,
      },
      {
        deporte: 'TENIS DE MESA',
        evento: `${this.tenisMesa.jugador1} vs ${this.tenisMesa.jugador2}`,
        mercado: 'Total de sets',
        seleccion: this.tenisMesaResultados.recomendacionTotal,
        indiceValor: Math.round(Math.max(50, Math.min(90, this.tenisMesaResultados.totalSets > 0 ? 72 : 50))),
        razon: `Total esperado de sets: ${this.tenisMesaResultados.totalSets}.`,
      },
    );

    this.pronosticosDiarios = candidatos
      .filter((pronostico) => pronostico.seleccion && !pronostico.seleccion.includes('undefined'))
      .filter((pronostico) => pronostico.indiceValor >= this.umbralValorPronosticos)
      .sort((a, b) => b.indiceValor - a.indiceValor)
      .slice(0, limite);
    this.estadoPronosticos = `${this.pronosticosDiarios.length} opciones generadas sin internet.`;
    this.guardarEstadoPartido();
  }

  async buscarPronosticosOnline(): Promise<void> {
    if (this.buscandoPronosticosOnline) return;
    this.buscandoPronosticosOnline = true;
    this.consultaOnlineIntentada = true;
    this.pronosticosOnline = [];
    this.estadoPronosticos = 'Consultando la API de pronósticos...';
    try {
      const respuesta = await this.oddsApiService.consultarPronosticos(40);
      this.apiConfigurada = respuesta.configured;
      this.pronosticosOnline = this.seleccionarPronosticosOnline(
        this.filtrarPronosticosDeHoy(respuesta.pronosticos),
      );
      this.estadoPronosticos = respuesta.ok && this.pronosticosOnline.length > 0
        ? `API actualizada: ${this.pronosticosOnline.length} pronósticos disponibles.`
        : respuesta.events > 0 && respuesta.pronosticos.length === 0
          ? 'El backend online devolvió eventos sin cuotas. Publica la versión actualizada o inicia "node server.js" localmente.'
          : respuesta.message || 'La API no devolvió cuotas válidas para las próximas 72 horas.';
    } catch (error) {
      console.error('Error consultando la API de pronósticos.', error);
      this.estadoPronosticos = error instanceof Error
        ? `No se pudo consultar la API: ${error.message}`
        : 'No se pudo consultar la API de pronósticos.';
    } finally {
      this.buscandoPronosticosOnline = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  guardarPronosticoWeb(): void {
    const pronostico = this.x3dPronosticoWebInput.trim();
    if (!pronostico) {
      this.estadoX3D = 'Pega un pronóstico antes de guardarlo.';
      return;
    }

    this.x3dPronosticoWebCard = pronostico;
    this.estadoX3D = 'Pronóstico web guardado en una tarjeta estática.';
    this.guardarEstadoPartido();
  }

  copiarPronosticoWeb(): void {
    if (!this.x3dPronosticoWebCard || typeof navigator === 'undefined' || !navigator.clipboard) {
      this.estadoX3D = 'No hay una tarjeta guardada para copiar.';
      return;
    }

    void navigator.clipboard.writeText(this.x3dPronosticoWebCard)
      .then(() => {
        this.estadoX3D = 'Pronóstico copiado al portapapeles.';
      })
      .catch(() => {
        this.estadoX3D = 'No se pudo copiar. Selecciona el texto de la tarjeta manualmente.';
      });
  }

  async comenzarReto(): Promise<void> {
    if (this.buscandoX3D) return;
    this.buscandoX3D = true;
    this.x3dApuestas = [];
    this.estadoX3D = 'Consultando API para buscar eventos de hoy...';
    try {
      const respuesta = await this.oddsApiService.consultarPronosticos(40);
      this.apiConfigurada = respuesta.configured;
      this.x3dApuestas = this.crearSecuenciaX3D(this.filtrarPronosticosDeHoy(respuesta.pronosticos));
      this.estadoX3D = respuesta.ok && this.x3dApuestas.length > 0
        ? `${this.x3dApuestas.length} apuestas cargadas desde la API para el reto x3D.`
        : respuesta.message || 'La API no devolvió cuotas válidas para x3D.';
    } catch (error) {
      console.error('Error consultando la API para x3D.', error);
      this.estadoX3D = error instanceof Error
        ? `No se pudo consultar la API: ${error.message}`
        : 'No se pudo consultar la API para x3D.';
    } finally {
      this.buscandoX3D = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  async comenzarRetoMillonario(): Promise<void> {
    if (this.buscandoMillonario) return;
    this.buscandoMillonario = true;
    this.millonarioApuestas = [];
    this.estadoMillonario = 'Consultando cuotas válidas para la fase activa...';
    try {
      const respuesta = await this.oddsApiService.consultarPronosticos(40);
      this.apiConfigurada = respuesta.configured;
      const disponibles = this.filtrarPronosticosDeHoy(respuesta.pronosticos)
        .filter((pronostico) => pronostico.cuota !== null && pronostico.cuota > 1);
      const seleccionados = this.eliminarPronosticosDuplicados(disponibles).slice(0, 2);
      this.millonarioApuestas = seleccionados.map((pronostico, indice) => ({
        ...pronostico,
        paso: indice + 1,
        categoria: 'Fase activa',
        horaReto: pronostico.horaInicio ?? '',
      }));
      this.estadoMillonario = respuesta.ok && this.millonarioApuestas.length > 0
        ? `${this.millonarioApuestas.length} cuotas cargadas para el Reto Millonario.`
        : respuesta.message || 'La API no devolvió dos cuotas válidas para el Reto Millonario.';
    } catch (error) {
      console.error('Error consultando la API para el Reto Millonario.', error);
      this.estadoMillonario = error instanceof Error
        ? `No se pudo consultar la API: ${error.message}`
        : 'No se pudo consultar la API para el Reto Millonario.';
    } finally {
      this.buscandoMillonario = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  private crearSecuenciaX3D(pronosticos: OnlinePronostico[]): X3dApuesta[] {
    const cuotasDeReto = pronosticos.filter((pronostico) =>
      pronostico.cuota !== null && pronostico.cuota > 1,
    );
    const normalizar = (valor: string): string => this.normalizarEtiqueta(valor);
    const grupos: Array<{ categoria: string; coincide: (texto: string) => boolean }> = [
      {
        categoria: 'Goles y ambos marcan',
        coincide: (texto) => /gol|over|under|btts|ambos marcan|1[,.]5|2[,.]5/.test(texto),
      },
      {
        categoria: 'Ganador',
        coincide: (texto) => /ganador|winner|1x2|moneyline|match winner/.test(texto),
      },
      {
        categoria: 'Córners',
        coincide: (texto) => /corner|córner|esquina/.test(texto),
      },
      {
        categoria: 'Faltas',
        coincide: (texto) => /falta|foul/.test(texto),
      },
      {
        categoria: 'NBA, tenis y otras ligas',
        coincide: (texto) => /nba|basket|baloncesto|tenis|table tennis|ping pong|hockey|baseball/.test(texto),
      },
    ];
    const usados = new Set<OnlinePronostico>();
    const seleccionados: Array<{ pronostico: OnlinePronostico; categoria: string }> = [];

    for (const grupo of grupos) {
      const candidato = cuotasDeReto.find((pronostico) => {
        if (usados.has(pronostico)) return false;
        const texto = normalizar(`${pronostico.deporte} ${pronostico.mercado} ${pronostico.seleccion}`);
        return grupo.coincide(texto);
      });
      if (candidato) {
        usados.add(candidato);
        seleccionados.push({ pronostico: candidato, categoria: grupo.categoria });
      }
      if (seleccionados.length === 4) break;
    }

    if (seleccionados.length < 4) {
      for (const pronostico of cuotasDeReto) {
        if (usados.has(pronostico)) continue;
        usados.add(pronostico);
        seleccionados.push({ pronostico, categoria: 'Mercado disponible' });
        if (seleccionados.length === 4) break;
      }
    }

    const ahora = new Date();
    ahora.setMinutes(0, 0, 0);
    if (ahora.getTime() <= Date.now()) ahora.setHours(ahora.getHours() + 1);

    return seleccionados.map(({ pronostico, categoria }, indice) => {
      const hora = new Date(ahora);
      hora.setHours(ahora.getHours() + indice);
      return {
        ...pronostico,
        paso: indice + 1,
        categoria,
        horaReto: hora.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
      };
    });
  }

  private seleccionarPronosticosOnline(pronosticos: OnlinePronostico[]): OnlinePronostico[] {
    const candidatos = this.eliminarPronosticosDuplicados(pronosticos)
      .filter((pronostico) => pronostico.cuota !== null && pronostico.cuota > 1)
      .filter((pronostico) => /f[uú]tbol|soccer|nba|basket|baloncesto|tenis|tennis|table tennis/i
        .test(`${pronostico.deporte} ${pronostico.evento}`));
    const grupos: Array<(pronostico: OnlinePronostico) => boolean> = [
      (pronostico) => /gol|over|under|btts|ambos marcan|1[,.]5|2[,.]5/i.test(`${pronostico.mercado} ${pronostico.seleccion}`),
      (pronostico) => /corner|córner|esquina|tiro de esquina/i.test(`${pronostico.mercado} ${pronostico.seleccion}`),
      (pronostico) => /ganador|winner|1x2|moneyline/i.test(`${pronostico.mercado} ${pronostico.seleccion}`),
      (pronostico) => /falta|foul|tiro|shot|punto|set|h[aá]ndicap/i.test(`${pronostico.mercado} ${pronostico.seleccion}`),
      (pronostico) => /nba|basket|baloncesto|tenis|tennis|table tennis/i.test(pronostico.deporte),
    ];
    const seleccionados: OnlinePronostico[] = [];
    const usados = new Set<OnlinePronostico>();

    for (const grupo of grupos) {
      const candidato = candidatos.find((pronostico) => !usados.has(pronostico) && grupo(pronostico));
      if (candidato) {
        usados.add(candidato);
        seleccionados.push(candidato);
      }

    }

    for (const candidato of candidatos) {
      if (seleccionados.length >= 15) break;
      if (!usados.has(candidato)) {
        usados.add(candidato);
        seleccionados.push(candidato);
      }
    }

    return seleccionados.slice(0, 15);
  }

  private eliminarPronosticosDuplicados(pronosticos: OnlinePronostico[]): OnlinePronostico[] {
    const vistos = new Set<string>();
    return pronosticos.filter((pronostico) => {
      const clave = [
        pronostico.deporte,
        pronostico.evento
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\b(fc|cf|sc|club|deportivo|basketball|bc)\b/g, '')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim(),
      ].join('|');
      if (vistos.has(clave)) {
        return false;
      }
      vistos.add(clave);
      return true;
    });
  }

  private filtrarPronosticosDeHoy(pronosticos: OnlinePronostico[]): OnlinePronostico[] {
    const ahora = Date.now();
    const limiteFuturo = ahora + 72 * 60 * 60 * 1000;
    return pronosticos.filter((pronostico) => {
      if (!pronostico.horaInicio) {
        return false;
      }
      const inicio = Date.parse(pronostico.horaInicio);
      return Number.isFinite(inicio) && inicio >= ahora && inicio <= limiteFuturo;
    });
  }

  @HostListener('window:beforeunload')
  guardarEstadoAntesDeSalir(): void {
    this.guardarEstadoPartido();
  }

  private guardarEstadoPartido(): void {
    try {
      localStorage.setItem('mega_app_estado_partido_v2', JSON.stringify({
        pestanaActiva: this.pestanaActiva,
        localNombre: this.localNombre,
        visitaNombre: this.visitaNombre,
        inputData: this.inputData,
        lineasCasa: this.lineasCasa,
        textoPegadoUsuario: this.textoPegadoUsuario,
        mensajeImportacion: this.mensajeImportacion,
        cantidadDatosImportados: this.cantidadDatosImportados,
        cantidadDatosColocados: this.cantidadDatosColocados,
        datosNoColocadosFutbol: this.datosNoColocadosFutbol,
        nba: this.nba,
        resultadoPromNba: this.resultadoPromNba,
        estadoImportacionNba: this.estadoImportacionNba,
        datosNoColocadosNba: this.datosNoColocadosNba,
        tenisMesa: this.tenisMesa,
        resultadoPromTenisMesa: this.resultadoPromTenisMesa,
        estadoImportacionTenisMesa: this.estadoImportacionTenisMesa,
        datosNoColocadosTenisMesa: this.datosNoColocadosTenisMesa,
        limitePronosticos: this.limitePronosticos,
        umbralValorPronosticos: this.umbralValorPronosticos,
        pronosticosDiarios: this.pronosticosDiarios,
        pronosticosOnline: this.pronosticosOnline,
        estadoPronosticos: this.estadoPronosticos,
        x3dPronosticoWebInput: this.x3dPronosticoWebInput,
        x3dPronosticoWebCard: this.x3dPronosticoWebCard,
        estadoX3D: this.estadoX3D,
      }));
    } catch (error) {
      console.warn('No se pudo guardar el estado del último partido.', error);
    }
  }

  private cargarEstadoPartido(): void {
    const estadoGuardado = localStorage.getItem('mega_app_estado_partido_v2');
    if (!estadoGuardado) return;

    try {
      const estado = JSON.parse(estadoGuardado) as Partial<AppComponent>;
      this.pestanaActiva = estado.pestanaActiva ?? this.pestanaActiva;
      this.localNombre = estado.localNombre ?? this.localNombre;
      this.visitaNombre = estado.visitaNombre ?? this.visitaNombre;
      this.inputData = { ...this.inputData, ...(estado.inputData ?? {}) };
      this.lineasCasa = { ...this.lineasCasa, ...(estado.lineasCasa ?? {}) };
      this.textoPegadoUsuario = estado.textoPegadoUsuario ?? this.textoPegadoUsuario;
      this.mensajeImportacion = estado.mensajeImportacion ?? this.mensajeImportacion;
      this.cantidadDatosImportados = estado.cantidadDatosImportados ?? this.cantidadDatosImportados;
      this.cantidadDatosColocados = estado.cantidadDatosColocados ?? this.cantidadDatosColocados;
      this.datosNoColocadosFutbol = estado.datosNoColocadosFutbol ?? this.datosNoColocadosFutbol;
      this.nba = { ...this.nba, ...(estado.nba ?? {}) };
      this.resultadoPromNba = estado.resultadoPromNba ?? this.resultadoPromNba;
      this.estadoImportacionNba = estado.estadoImportacionNba ?? this.estadoImportacionNba;
      this.datosNoColocadosNba = estado.datosNoColocadosNba ?? this.datosNoColocadosNba;
      this.tenisMesa = { ...this.tenisMesa, ...(estado.tenisMesa ?? {}) };
      this.resultadoPromTenisMesa = estado.resultadoPromTenisMesa ?? this.resultadoPromTenisMesa;
      this.estadoImportacionTenisMesa = estado.estadoImportacionTenisMesa ?? this.estadoImportacionTenisMesa;
      this.datosNoColocadosTenisMesa = estado.datosNoColocadosTenisMesa ?? this.datosNoColocadosTenisMesa;
      this.limitePronosticos = estado.limitePronosticos ?? this.limitePronosticos;
      this.umbralValorPronosticos = estado.umbralValorPronosticos ?? this.umbralValorPronosticos;
      this.pronosticosDiarios = estado.pronosticosDiarios ?? this.pronosticosDiarios;
      this.pronosticosOnline = this.filtrarPronosticosDeHoy(estado.pronosticosOnline ?? []);
      this.estadoPronosticos = estado.estadoPronosticos ?? this.estadoPronosticos;
      this.x3dPronosticoWebInput = estado.x3dPronosticoWebInput ?? this.x3dPronosticoWebInput;
      this.x3dPronosticoWebCard = estado.x3dPronosticoWebCard ?? this.x3dPronosticoWebCard;
      this.estadoX3D = estado.estadoX3D ?? this.estadoX3D;
    } catch (error) {
      console.warn('No se pudo cargar el estado del último partido.', error);
    }
  }

  verificarEstadoLicencia() {
    let storedId = localStorage.getItem('mega_app_internal_signature');
    if (!storedId) {
      storedId = 'APP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('mega_app_internal_signature', storedId);
    }
    this.appInternalId = storedId;

    const isAuthStored = localStorage.getItem('mega_app_authenticated');
    const fechaActivacionStr = localStorage.getItem('mega_app_fecha_activacion');
    const diasValidezStr = localStorage.getItem('mega_app_dias_validez');

    if (isAuthStored === 'true' && fechaActivacionStr && diasValidezStr) {
      const fechaActivacion = parseInt(fechaActivacionStr, 10);
      const diasValidez = parseInt(diasValidezStr, 10);

      // Si es vitalicio (999999 días)
      if (diasValidez > 50000) {
        this.isAuthenticated = true;
        this.diasRestantesTexto = 'Acceso Vitalicio';
        return;
      }

      // Calcular días transcurridos desde la activación
      const tiempoActual = new Date().getTime();
      const diasTranscurridos = (tiempoActual - fechaActivacion) / (1000 * 60 * 60 * 24);

      if (diasTranscurridos <= diasValidez) {
        this.isAuthenticated = true;
        const diasRestantes = Math.ceil(diasValidez - diasTranscurridos);
        this.diasRestantesTexto = `Expira en ${diasRestantes} días`;
      } else {
        // Expiró el tiempo de la licencia
        this.isAuthenticated = false;
        localStorage.removeItem('mega_app_authenticated');
        localStorage.removeItem('mega_app_fecha_activacion');
        localStorage.removeItem('mega_app_dias_validez');
        this.errorMessage = 'Tu licencia ha expirado. Por favor ingresa una nueva clave.';
      }
    } else {
      this.isAuthenticated = false;
    }
  }

  private obtenerClavesUsadas(): string[] {
    try {
      const clavesGuardadas = JSON.parse(
        localStorage.getItem(this.licenciaUsadaStorageKey) ?? '[]',
      );
      return Array.isArray(clavesGuardadas)
        ? clavesGuardadas.filter((clave): clave is string => typeof clave === 'string')
        : [];
    } catch (error) {
      console.warn('No se pudieron leer las claves ya utilizadas.', error);
      return [];
    }
  }

  private registrarClaveUsada(clave: string): void {
    const clavesUsadas = new Set(this.obtenerClavesUsadas());
    clavesUsadas.add(clave);
    localStorage.setItem(this.licenciaUsadaStorageKey, JSON.stringify([...clavesUsadas]));
  }

  validateKey(): void {
    const claveIngresada = this.inputKey.trim();
    const idDispositivoActual = this.appInternalId;

    if (!claveIngresada) {
      this.errorMessage = 'Ingresa una clave de activación.';
      return;
    }

    // Estas claves no caducan ni se consumen.
    const clavesVitalicias = new Set(['Milena1428', this.masterKey]);
    const esLicenciaVitalicia = clavesVitalicias.has(claveIngresada);

    // Las demás claves son de un solo uso y duran 30 días desde su activación.
    const licenciasValidas: Record<string, Record<string, string>> = {
      'APP-URERQE': {
        mes1: 'MF-2026-A4N8',
        mes2: 'MF-2026-C6P2',
        mes3: 'MF-2026-H9V5',
      },
      'APP-K3CMZ7': {
        mes1: 'MF-2026-D7Q1',
        mes2: 'MF-2026-K3R8',
        mes3: 'MF-2026-T6W4',
      },
      'APP-NUEVO': {
        mes1: 'MF-2026-E2L9',
        mes2: 'MF-2026-M8S5',
        mes3: 'MF-2026-Y4Z7',
      },
    };

    const clavesPorDispositivo = licenciasValidas[idDispositivoActual] ?? {};
    const esClaveGenerica = claveIngresada === this.claveGenerica;
    const esLicenciaValida = esClaveGenerica || Object.values(clavesPorDispositivo).includes(claveIngresada);
    const claveYaUsada = this.obtenerClavesUsadas().includes(claveIngresada);

    if (esLicenciaVitalicia) {
      this.isAuthenticated = true;
      localStorage.setItem('mega_app_authenticated', 'true');
      localStorage.setItem('mega_app_dias_validez', '999999');
      localStorage.setItem('mega_app_fecha_activacion', new Date().getTime().toString());
      this.diasRestantesTexto = 'Acceso Vitalicio';
      this.errorMessage = '';
      this.recalcular();
      return;
    }

    if (!esLicenciaValida) {
      this.errorMessage = 'Clave incorrecta o no válida para este dispositivo.';
      return;
    }

    if (claveYaUsada) {
      this.errorMessage = 'Esta clave ya fue utilizada y no puede volver a activarse.';
      return;
    }

    this.registrarClaveUsada(claveIngresada);
    this.isAuthenticated = true;
    localStorage.setItem('mega_app_authenticated', 'true');
    localStorage.setItem('mega_app_dias_validez', '30');
    localStorage.setItem('mega_app_fecha_activacion', new Date().getTime().toString());
    this.diasRestantesTexto = 'Expira en 30 días';
    this.errorMessage = '';
    this.recalcular();
  }
  copiarPrompt() {
    const textoPrompt = this.promptWeb;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textoPrompt)
        .then(() => alert('Prompt actualizado copiado al portapapeles.'))
        .catch(() => alert('Copia manual requerida.'));
    } else {
      alert('Copia manual requerida.');
    }
  }

  compararConLineaCasa(pronosticoApp: number, lineaCasa: number | null): string {
    if (lineaCasa === null) return 'Línea de la casa: no ingresada';

    const diferencia = Number((pronosticoApp - lineaCasa).toFixed(1));
    if (diferencia === 0) {
      return `Línea de la casa: ${lineaCasa} · La app coincide con la línea`;
    }

    const direccion = diferencia > 0 ? 'por encima' : 'por debajo';
    return `Línea de la casa: ${lineaCasa} · App ${direccion} por 
${Math.abs(diferencia).toFixed(1)}`;
  }

  procesarTextoPegado(): void {
    const textoCompleto = this.textoPegadoUsuario?.trim();
    if (!textoCompleto) {
      this.mensajeImportacion = 'Pega primero el informe con los datos.';
      return;
    }

    this.ngZone.run(() => {
      // Acepta decimales escritos como "1. 75" o "1, 75".
      const textoNormalizado = textoCompleto
        .replace(/(\d)\s*[.,]\s*(\d)/g, '$1.$2')
        .replace(/equipo\s+local\s*\(\s*casa\s*\)/gi, 'Equipo Local (Home)')
        .replace(/equipo\s+(?:visitante|visita)\s*\(\s*visitante\s*\)/gi, 'Equipo Visitante (Away)');
      const normalizar = (valor: string): string =>
        valor
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\*\*/g, '')
          .replace(/__/g, '')
          .toLowerCase()
          .trim();
      const camposImportados = new Set<keyof typeof this.inputData>();
      const lineasCasaImportadas = new Set<keyof typeof this.lineasCasa>();
      const lineasConDatos: string[] = [];
      const lineasColocadas = new Set<string>();
      let lineaActual = '';
      const asignarDato = (campo: keyof typeof this.inputData, valor: number): void => {
        this.inputData[campo] = valor;
        camposImportados.add(campo);
        lineasColocadas.add(lineaActual);
      };

      for (const linea of textoNormalizado.split(/\r?\n/)) {
        const lineaLimpia = linea
          .replace(/\*\*/g, '')
          .replace(/__/g, '')
          .replace(/`/g, '')
          .replace(/^\s*[-•]\s*/, '')
          .trim();
        const tieneDatos = lineaLimpia.includes(':') && !/^casa de apuestas\s*:/i.test(lineaLimpia);
        if (tieneDatos) {
          lineaActual = lineaLimpia;
          lineasConDatos.push(lineaActual);
        } else {
          lineaActual = '';
        }
        const limpiarNombreEquipo = (nombre: string): string =>
          nombre
            .replace(/\*\*/g, '')
            .replace(/__/g, '')
            .replace(/`/g, '')
            .replace(/^\s*[\[("'“‘]+|[\])"'”’]+\s*$/g, '')
            .trim();
        const equipoLocal = lineaLimpia.match(
          /^equipo\s+local(?:\s*\(\s*home\s*\))?\s*(?::|[-–—])\s*(.+?)\s*$/i,
        );
        const equipoVisitante = lineaLimpia.match(
          /^equipo\s+(?:visitante|visita)(?:\s*\(\s*away\s*\))?\s*(?::|[-–—])\s*(.+?)\s*$/i,
        );

        if (equipoLocal?.[1]) {
          this.localNombre = limpiarNombreEquipo(equipoLocal[1]);
          lineasColocadas.add(lineaActual);
          continue;
        }
        if (equipoVisitante?.[1]) {
          this.visitaNombre = limpiarNombreEquipo(equipoVisitante[1]);
          lineasColocadas.add(lineaActual);
          continue;
        }

        const nombrePartido = linea.match(
          /^\s*(?:partido(?:\s+a\s+analizar)?|encuentro)\s*:\s*(.+?)\s+vs\.?\s+(.+?)\s*$/i,
        );
        const partidoLimpio = lineaLimpia.match(
          /^(?:partido(?:\s+a\s+analizar)?|encuentro)\s*:\s*(.+?)\s+vs\.?\s+(.+?)\s*$/i,
        );
        const nombresPartido = partidoLimpio ?? nombrePartido;
        if (nombresPartido) {
          this.localNombre = limpiarNombreEquipo(nombresPartido[1]);
          this.visitaNombre = limpiarNombreEquipo(nombresPartido[2]);
          lineasColocadas.add(lineaActual);
        }

        const etiquetaNormalizada = normalizar(linea);
        const parteValor = linea.match(/:\s*(?:\*\*)?\[?\s*(-?\d+(?:[.,]\d+)?)/);
        if (!parteValor) continue;
        const valor = Number(parteValor[1].replace(',', '.'));
        if (!Number.isFinite(valor)) continue;

        if (etiquetaNormalizada.includes('linea de la casa')) {
          let mercado: keyof typeof this.lineasCasa | undefined;
          if (etiquetaNormalizada.includes('goles')) mercado = 'goles';
          else if (etiquetaNormalizada.includes('tarjetas')) mercado = 'tarjetas';
          else if (etiquetaNormalizada.includes('faltas')) mercado = 'faltas';
          else if (etiquetaNormalizada.includes('tiros a puerta')) mercado = 'tirosPuerta';
          else if (
            etiquetaNormalizada.includes('fueras de juego') ||
            etiquetaNormalizada.includes('offsides')
          ) {
            mercado = 'fuerasJuego';
          } else if (
            etiquetaNormalizada.includes('corner') ||
            etiquetaNormalizada.includes('esquina')
          ) {
            mercado = 'corners';
          }

          if (mercado) {
            this.lineasCasa[mercado] = valor;
            lineasCasaImportadas.add(mercado);
            lineasColocadas.add(lineaActual);
          }
          continue;
        }

        const esLocal = /\blocal\b|\bhome\b/.test(etiquetaNormalizada);
        const esVisita = /\bvisita\b|\bvisitante\b|\baway\b/.test(etiquetaNormalizada);
        let campo: keyof typeof this.inputData | undefined;

        if (etiquetaNormalizada.includes('handicap asiatico')) {
          campo = 'handicapLocal';
        } else if (etiquetaNormalizada.includes('linea de goles asiaticos')) {
          campo = 'golesAsiaticos';
        } else if (
          etiquetaNormalizada.includes('btts') ||
          etiquetaNormalizada.includes('ambos marcan')
        ) {
          if (esLocal) campo = 'bttsLocal';
          else if (esVisita) campo = 'bttsVisita';
        } else if (etiquetaNormalizada.includes('goles totales')) {
          if (esLocal) campo = 'promGolesPartidoLocal';
          else if (esVisita) campo = 'promGolesPartidoVisita';
        } else if (etiquetaNormalizada.includes('goles a favor')) {
          if (esLocal) campo = 'golesFavorLocal';
          else if (esVisita) campo = 'golesFavorVisita';
        } else if (etiquetaNormalizada.includes('goles en contra')) {
          if (esLocal) campo = 'golesEnContraLocal';
          else if (esVisita) campo = 'golesEnContraVisita';
        } else if (etiquetaNormalizada.includes('tarjetas')) {
          if (etiquetaNormalizada.includes('arbitro')) campo = 'promArbitroTarjetas';
          else if (esLocal) campo = 'tarjetasLocal';
          else if (esVisita) campo = 'tarjetasVisita';
        } else if (etiquetaNormalizada.includes('faltas')) {
          if (etiquetaNormalizada.includes('arbitro')) campo = 'promArbitroFaltas';
          else if (esLocal && etiquetaNormalizada.includes('favor')) campo = 'faltasFavorLocal';
          else if (esLocal && etiquetaNormalizada.includes('contra')) campo = 'faltasContraLocal';
          else if (esVisita && etiquetaNormalizada.includes('favor')) campo = 'faltasFavorVisita';
          else if (esVisita && etiquetaNormalizada.includes('contra')) campo = 'faltasContraVisita';
        } else if (etiquetaNormalizada.includes('tiros a puerta')) {
          if (esLocal) campo = 'tirosPuertaLocal';
          else if (esVisita) campo = 'tirosPuertaVisita';
        } else if (
          etiquetaNormalizada.includes('fuera de juego') ||
          etiquetaNormalizada.includes('fueras de juego') ||
          etiquetaNormalizada.includes('offsides') ||
          etiquetaNormalizada.includes('offside')
        ) {
          if (esLocal) campo = 'fuerasJuegoLocal';
          else if (esVisita) campo = 'fuerasJuegoVisita';
        } else if (
          etiquetaNormalizada.includes('corner') ||
          etiquetaNormalizada.includes('esquina')
        ) {
          if (esLocal) campo = 'cornersLocal';
          else if (esVisita) campo = 'cornersVisita';
        }

        if (campo) asignarDato(campo, valor);
      }

      this.cantidadDatosImportados = lineasConDatos.length;
      this.cantidadDatosColocados = lineasColocadas.size;
      this.datosNoColocadosFutbol = lineasConDatos
        .filter((linea, indice, todas) => todas.indexOf(linea) === indice && !lineasColocadas.has(linea))
        .map((linea) => linea);
      const surebetImportado = this.cargarSurebetDesdeTexto(textoNormalizado);
      this.recalcular();
      this.mensajeImportacion =
        this.cantidadDatosImportados > 0
          ? `Se importaron ${lineasConDatos.length} datos · ${this.cantidadDatosColocados} colocados · ${this.datosNoColocadosFutbol.length} no colocados. Los resultados están actualizados en "Resultado de Análisis".${
              lineasCasaImportadas.size
                ? ` También se importaron ${lineasCasaImportadas.size} líneas de casas de apuestas.`
                : ''
            }${surebetImportado ? ' También se procesó el bloque Surebet.' : ''}`
          : surebetImportado
            ? 'Se procesó el bloque Surebet. No encontré estadísticas para las tarjetas de análisis.'
            : 'No reconocí valores estadísticos. Usa el formato del prompt y escribe cada valor después de los dos puntos.';
      this.pestanaActiva = 'resultadosAnalisis';
      this.guardarEstadoPartido();
    });
  }

  private cargarSurebetDesdeTexto(texto: string): boolean {
    const textoLimpio = texto
      .replace(/\*\*/g, '')
      .replace(/__/g, '')
      .replace(/`/g, '')
      .replace(/\r/g, '')
      .replace(/\s+\/\s+(?=Surebet\s)/gi, '\n');
    const lineaMercado = textoLimpio.match(/^\s*(?:[-•]\s*)?Surebet mercado:\s*([^\r\n]+)\s*$/im);
    if (!lineaMercado || lineaMercado[1].includes('|')) return false;

    const mercadoMatch = textoLimpio.match(
      /^\s*(?:[-•]\s*)?Surebet mercado:\s*\[?([a-z0-9_]+)\]?\s*$/im,
    );
    this.surebetImportStatus = '';
    if (!mercadoMatch) {
      this.surebetImportStatus =
        'Detecté la etiqueta «Surebet mercado», pero el código no tiene un formato válido.';
      return true;
    }

    const codigoMercado = mercadoMatch[1].toLowerCase();
    if (codigoMercado === 'no_disponible') {
      this.surebetCasas = ['', '', ''];
      this.surebetCuotas = [null, null, null];
      this.surebetResultado = null;
      this.surebetImportStatus =
        'El texto indica que no se encontraron cuotas reales para una surebet; no se importaron datos.';
      return true;
    }

    const mercados: Record<string, string> = {
      goles: 'goles',
      faltas: 'faltas',
      tarjetas: 'tarjetas',
      fuerasjuego: 'fuerasJuego',
      corners: 'corners',
      tirospuerta: 'tirosPuerta',
      resultado1x2: 'resultado1x2',
    };
    const mercado = mercados[codigoMercado];
    if (!mercado) {
      this.surebetImportStatus = `El código de mercado «${codigoMercado}» no es compatible con la calculadora.`;
      return true;
    }

    this.surebetMercado = mercado;
    const lineaMatch = textoLimpio.match(/^\s*(?:[-•]\s*)?Surebet línea:\s*([^\r\n]+)\s*$/im);
    this.surebetLinea = lineaMatch?.[1].trim().replace(/^\[|\]$/g, '') ?? '';
    const importeMatch = textoLimpio.match(
      /^\s*(?:[-•]\s*)?Surebet importe:\s*([0-9]+(?:[.,][0-9]+)?)\s*$/im,
    );
    if (importeMatch) {
      this.surebetBankroll = Number(importeMatch[1].replace(',', '.'));
    }

    this.surebetCasas = ['', '', ''];
    this.surebetCuotas = [null, null, null];
    const indices: Record<string, number> = this.surebetEsTresVias
      ? { local: 0, empate: 1, visitante: 2 }
      : { over: 0, under: 1 };
    const cuotaRegex =
      /^\s*(?:[-•]\s*)?Surebet\s+(Over|Under|Local|Empate|Visitante):\s*(?:Casa\s*[:=]\s*)?(.+?)\s*(?:;|\|)\s*(?:Cuota(?:\s*decimal)?\s*[:=]\s*)?\[?([0-9]+(?:[.,][0-9]+)?)\]?\s*$/gim;
    let cuotaMatch: RegExpExecArray | null;
    let cuotasImportadas = 0;

    while ((cuotaMatch = cuotaRegex.exec(textoLimpio)) !== null) {
      const index = indices[cuotaMatch[1].toLowerCase()];
      if (index === undefined) continue;
      const casa = cuotaMatch[2].trim().replace(/^\[|\]$/g, '');
      const cuota = Number(cuotaMatch[3].replace(',', '.'));
      if (!casa || !Number.isFinite(cuota) || cuota <= 1) continue;
      this.surebetCasas[index] = casa;
      this.surebetCuotas[index] = cuota;
      cuotasImportadas++;
    }

    this.calcularSurebet();
    const cuotasNecesarias = this.surebetEsTresVias ? 3 : 2;
    this.surebetImportStatus =
      cuotasImportadas === cuotasNecesarias
        ? `Importé ${cuotasImportadas} cuotas para 
${this.surebetMercado}${this.surebetEsTresVias ? '' : `, línea ${this.surebetLinea}`}. Verifica 
casas, cuotas y liquidación antes de usar.`
        : `Detecté el mercado ${this.surebetMercado}, pero solo pude importar 
${cuotasImportadas} de ${cuotasNecesarias} cuotas. Revisa que cada fila tenga Casa=...; 
Cuota=...`;
    return true;
  }

  sincronizarEstadisticasDeEquipos(): void {
    const normalizar = (valor: string): string =>
      valor
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    const equipos = this.footballSheetService
      .getLigas()
      .flatMap((liga) => liga.equipos);
    const local = equipos.find((equipo) => normalizar(equipo.nombre) === normalizar(this.localNombre));
    const visitante = equipos.find(
      (equipo) => normalizar(equipo.nombre) === normalizar(this.visitaNombre),
    );

    if (local) {
      this.inputData.golesFavorLocal = local.golesFavorLocal;
      this.inputData.golesEnContraLocal = local.golesEnContraLocal;
      this.inputData.bttsLocal = local.bttsPct;
      this.inputData.cornersLocal = local.cornersProm;
      this.inputData.faltasFavorLocal = local.faltasFavor;
      this.inputData.faltasContraLocal = local.faltasEnContra;
      this.inputData.tirosPuertaLocal = local.tirosPuerta;
      this.inputData.fuerasJuegoLocal = local.fuerasJuego;
      this.inputData.tarjetasLocal = local.tarjetasAmarrillas;
    }
    if (visitante) {
      this.inputData.golesFavorVisita = visitante.golesFavorVisita;
      this.inputData.golesEnContraVisita = visitante.golesEnContraVisita;
      this.inputData.bttsVisita = visitante.bttsPct;
      this.inputData.cornersVisita = visitante.cornersProm;
      this.inputData.faltasFavorVisita = visitante.faltasFavor;
      this.inputData.faltasContraVisita = visitante.faltasEnContra;
      this.inputData.tirosPuertaVisita = visitante.tirosPuerta;
      this.inputData.fuerasJuegoVisita = visitante.fuerasJuego;
      this.inputData.tarjetasVisita = visitante.tarjetasAmarrillas;
    }

    if (local || visitante) {
      this.estadisticasEstado = `Datos conectados: ${local?.nombre ?? 'Local manual'} y ${visitante?.nombre ?? 'visitante manual'}.`;
    } else {
      this.estadisticasEstado =
        'Sin coincidencia en el catálogo local; se conservan los datos introducidos manualmente.';
    }
    this.recalcular();
  }

  calcularYMostrarResultados(): void {
    this.recalcular();
    this.pestanaActiva = 'resultadosAnalisis';
  }

  recalcular() {
    this.ngZone.run(() => {
      const leerDato = (
        dato: number,
        predeterminado: number,
        minimo = 0,
        maximo = Number.POSITIVE_INFINITY,
      ): number =>
        Number.isFinite(dato)
          ? Math.min(maximo, Math.max(minimo, dato))
          : predeterminado;

      // 1. Obtener los datos existentes de los inputs
      const IFav = leerDato(this.inputData.golesFavorLocal, 1.5, 0, 10);
      const IContra = leerDato(this.inputData.golesEnContraLocal, 1.0, 0, 10);
      const vFav = leerDato(this.inputData.golesFavorVisita, 1.2, 0, 10);
      const vContra = leerDato(this.inputData.golesEnContraVisita, 1.2, 0, 10);
      const pPartLocal = leerDato(this.inputData.promGolesPartidoLocal, 2.4, 0, 10);
      const pPartVisita = leerDato(this.inputData.promGolesPartidoVisita, 2.2, 0, 10);
      // Regla de Partidos Abiertos
      const baseLocal = (IFav + vContra) / 2;
      const baseVisita = (vFav + IContra) / 2;
      const baseTotal = Math.max(baseLocal + baseVisita, 0.1);
      const ritmoObservado = (pPartLocal + pPartVisita) / 2;
      const factorRitmo = Math.min(1.35, Math.max(0.65, ritmoObservado / baseTotal));
      const lambdaLocal = Math.min(6, Math.max(0, baseLocal * factorRitmo * 1.06));
      const lambdaVisita = Math.min(6, Math.max(0, baseVisita * factorRitmo * 0.94));
      // 2. Modelo de Poisson para Goles y Marcador (Calibrado de forma limpia)
      const mediaLiga = 1.35; // Mantienes tu valor original o cámbialo aquí si lo deseas

      // Factores de ajuste sutiles y profesionales (opcionalmente ajustados para mayor precisión)
      const factorLocalCalibrado = 1.04; // Ligeramente optimizado desde 1.06
      const factorVisitaCalibrado = 0.96; // Ligeramente optimizado desde 0.94

      const factorRitmoLocal = pPartLocal > 0 ? pPartLocal / (mediaLiga * 2) : 1.0;
      const factorRitmoVisita = pPartVisita > 0 ? pPartVisita / (mediaLiga * 2) : 1.0;

      // Base equilibrada y acotada para evitar desbordes con defensas muy goleadas
      const totalGoles = lambdaLocal + lambdaVisita;

      const poissonProb = (lambda: number, k: number) => {
        return (Math.exp(-lambda) * Math.pow(lambda, k)) / this.factorial(k);
      };

      let maxProb = -1;
      let mejorGolesLocal = 0;
      let mejorGolesVisita = 0;
      for (let gL = 0; gL <= 20; gL++) {
        for (let gV = 0; gV <= 20; gV++) {
          const prob = poissonProb(lambdaLocal, gL) * poissonProb(lambdaVisita, gV);
          if (prob > maxProb) {
            maxProb = prob;
            mejorGolesLocal = gL;
            mejorGolesVisita = gV;
          }
        }
      }
      this.resultados.marcador = {
        equipo1: mejorGolesLocal,
        equipo2: mejorGolesVisita,
        porcentaje: Math.round(maxProb * 100),
      };

      const probabilidadUnder25 =
        Math.exp(-totalGoles) * (1 + totalGoles + (totalGoles * totalGoles) / 2);
      const probabilidadOver25 = 1 - probabilidadUnder25;
      this.resultados.overUnder = {
        total: Number(totalGoles.toFixed(2)),
        probabilidadOver: Math.round(probabilidadOver25 * 100),
        probabilidadUnder: Math.round(probabilidadUnder25 * 100),
        recomendacion:
          probabilidadOver25 >= 0.5
            ? `Over 2.5 Goles (${Math.round(probabilidadOver25 * 100)}% modelo)`
            : `Under 2.5 Goles (${Math.round(probabilidadUnder25 * 100)}% modelo)`,
      };

      // Keep the teams' historical BTTS average separate from the match-model probability.
      const bttsL = leerDato(this.inputData.bttsLocal, 50, 0, 100);
      const bttsV = leerDato(this.inputData.bttsVisita, 50, 0, 100);
      const promBtts = Math.round(bttsL * 0.5 + bttsV * 0.5);
      const probabilidadBttsPoisson = (1 - Math.exp(-lambdaLocal)) * (1 - Math.exp(-lambdaVisita));
      const probabilidadBtts = probabilidadBttsPoisson * 0.65 + (promBtts / 100) * 0.35;
      this.resultados.btts = {
        promedio: promBtts,
        probabilidadModelo: Math.round(probabilidadBtts * 100),
        recomendacion: probabilidadBtts >= 0.5 ? 'Ambos marcan: Sí' : 'Ambos marcan: No',
      };
      // 4. CÓRNERS
      const cornersL = leerDato(this.inputData.cornersLocal, 4.5);
      const cornersV = leerDato(this.inputData.cornersVisita, 4.0);
      const totalCorners = cornersL + cornersV;
      this.resultados.corners = {
        pronosticados: Number(totalCorners.toFixed(1)),
        recomendacion: totalCorners > 9.5 ? 'Over 9.5 Córners' : 'Under 9.5 Córners',
      };

      // 5. TARJETAS
      const tarLocal = leerDato(this.inputData.tarjetasLocal, 2.0, 0, 20);
      const tarVisita = leerDato(this.inputData.tarjetasVisita, 1.9, 0, 20);
      const tarArbitro = leerDato(this.inputData.promArbitroTarjetas, 4.4, 0, 20);
      const totalTarjetas = (tarLocal + tarVisita) * 0.65 + tarArbitro * 0.35;
      this.resultados.tarjetas = {
        pronosticadas: Number(totalTarjetas.toFixed(1)),
        recomendacion:
          totalTarjetas > 4.5
            ? 'Partido caliente (Más de 4.5)'
            : 'Partido tranquilo (Menos de 4.5)',
      };

      // 6. FALTAS
      const faltasFL = leerDato(this.inputData.faltasFavorLocal, 13, 0, 40);
      const faltasCL = leerDato(this.inputData.faltasContraLocal, 12, 0, 40);
      const faltasFV = leerDato(this.inputData.faltasFavorVisita, 13, 0, 40);
      const faltasCV = leerDato(this.inputData.faltasContraVisita, 12.5, 0, 40);
      const faltasArb = leerDato(this.inputData.promArbitroFaltas, 24, 0, 60);
      const faltasEquipos = (faltasFL + faltasCV) / 2 + (faltasFV + faltasCL) / 2;
      const totalFaltas = faltasEquipos * 0.7 + faltasArb * 0.3;
      this.resultados.faltas = {
        pronosticadas: Number(totalFaltas.toFixed(1)),
        recomendacion: totalFaltas > 24 ? 'Alta intensidad de faltas' : 'Faltas moderadas',
      };

      // 7. TIROS A PUERTA
      const tirosL = leerDato(this.inputData.tirosPuertaLocal, 4.2);
      const tirosV = leerDato(this.inputData.tirosPuertaVisita, 3.8);
      const totalTiros = tirosL + tirosV;
      this.resultados.tirosPuerta = {
        pronosticados: Number(totalTiros.toFixed(1)),
        recomendacion: totalTiros > 8.5 ? 'Muchos remates al arco' : 'Pocos remates al arco',
      };

      // 8. FUERAS DE JUEGO
      const fuerasL = leerDato(this.inputData.fuerasJuegoLocal, 1.8);
      const fuerasV = leerDato(this.inputData.fuerasJuegoVisita, 1.5);
      const totalFueras = fuerasL + fuerasV;
      this.resultados.fuerasJuego = {
        pronosticadas: Number(totalFueras.toFixed(1)),
        recomendacion: totalFueras > 3.5 ? 'Línea defensiva adelantada' : 'Pocos fueras de juego',
      };

      // 9. LÍNEA ASIÁTICA
      let lineaAsiaticaSugerida = 2.25;
      if (totalGoles > 3.1) lineaAsiaticaSugerida = 3.25;
      else if (totalGoles > 2.7) lineaAsiaticaSugerida = 2.75;
      else if (totalGoles < 2.2) lineaAsiaticaSugerida = 2.0;
      const handicapL = parseFloat(String(this.inputData.handicapLocal)) || 0;
      // Si el usuario indicó una línea válida, tiene prioridad sobre la sugerencia calculada.
      const lineaAsiaticaUsuario = parseFloat(String(this.inputData.golesAsiaticos));
      if (Number.isFinite(lineaAsiaticaUsuario)) {
        lineaAsiaticaSugerida = lineaAsiaticaUsuario;
      }

      this.resultados.asiatico = {
        pronostico: `Hándicap ${handicapL >= 0 ? '+' + handicapL : handicapL} | Línea de Goles: ${lineaAsiaticaSugerida}`,
        recomendacion: `${totalGoles >= lineaAsiaticaSugerida ? 'Tendencia Over' : 'Tendencia Under'} según ${totalGoles.toFixed(2)} goles esperados frente a línea ${lineaAsiaticaSugerida}`,
      };
      // 10. G 1X2 Y DOBLE OPORTUNIDAD
      let probLoc = 0;
      let probEmp = 0;
      let probVis = 0;

      for (let gL = 0; gL <= 20; gL++) {
        for (let gV = 0; gV <= 20; gV++) {
          const p = poissonProb(lambdaLocal, gL) * poissonProb(lambdaVisita, gV);
          if (gL > gV) probLoc += p;
          else if (gL === gV) probEmp += p;
          else probVis += p;
        }
      }

      const sumaTotal = probLoc + probEmp + probVis;
      const p1 = Math.round((probLoc / sumaTotal) * 100);
      const pX = Math.round((probEmp / sumaTotal) * 100);
      const p2 = Math.round((probVis / sumaTotal) * 100);

      let ganadorSugerido = 'Empate (X)';
      let recGanador = `Tendencia de paridad (${pX}%)`;
      if (p1 > p2 && p1 >= pX) {
        ganadorSugerido = 'Local (1)';
        recGanador = `Victoria local probable (${p1}%)`;
      } else if (p2 > p1 && p2 >= pX) {
        ganadorSugerido = 'Visitante (2)';
        recGanador = `Victoria visitante probable (${p2}%)`;
      }

      let dobleOp = '1X';
      let recDoble = `Cubre Local o Empate (${p1 + pX}%)`;
      if (p1 + pX >= 75) {
        dobleOp = '1X';
        recDoble = `Alta probabilidad local/empate (${p1 + pX}%)`;
      } else if (p2 + pX >= 75) {
        dobleOp = 'X2';
        recDoble = `Alta probabilidad visitante/empate (${p2 + pX}%)`;
      } else if (p1 >= p2) {
        dobleOp = '12';
        recDoble = `Local o visitante (${p1 + p2}%)`;
      } else {
        dobleOp = 'X2';
        recDoble = `Visitante o empate (${p2 + pX}%)`;
      }

      this.resultados.g1x2 = {
        ganador: ganadorSugerido,
        recomendacionGanador: recGanador,
        dobleOportunidad: dobleOp,
        recomendacionDoble: recDoble,
        probLocal: p1,
        probEmpate: pX,
        probVisita: p2,
      };

      // Without bookmaker odds, only model probabilities can be reported, not expected value.
      const recomendaciones: Recomendacion[] = [
        {
          mercado: probabilidadOver25 >= 0.5 ? 'Over 2.5 Goles' : 'Under 2.5 Goles',
          prob: Math.round(Math.max(probabilidadOver25, probabilidadUnder25) * 100),
        },
        {
          mercado: probabilidadBtts >= 0.5 ? 'Ambos Marcan: Sí' : 'Ambos Marcan: No',
          prob: Math.round(Math.max(probabilidadBtts, 1 - probabilidadBtts) * 100),
        },
        {
          mercado: `1X2: ${ganadorSugerido}`,
          prob: Math.max(p1, pX, p2),
        },
      ];

      this.resultados.recomendacionesTop = recomendaciones.sort((a, b) => b.prob - a.prob);

      // Generación dinámica de tarjetas para el análisis narrativo
      let tarjetasHTML = '';

      this.resultados.recomendacionesTop.forEach((rec, index) => {
        tarjetasHTML += ` 
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid #334155; padding: 
12px; border-radius: 8px; margin-bottom: 10px;"> 
          <div style="font-size: 1.05rem; font-weight: bold; color: #f59e0b; margin-bottom: 
4px;"> 
            ${index + 1}. ${rec.mercado} 
          </div> 
          <div style="font-size: 0.85rem; color: #e2e8f0;"> 
            Probabilidad estimada por el modelo: ${rec.prob}% 
          </div> 
        </div> 
      `;
      });

      this.analisisNarrativo = this.sanitizer.bypassSecurityTrustHtml(` 
      <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid 
#38bdf8; border-radius: 10px; padding: 15px;"> 
        <div style="font-size: 0.9rem; color: #94a3b8; font-weight: 500; margin-bottom: 12px; 
text-align: center;"> 
          Tendencias del modelo ordenadas por probabilidad estimada 
        </div> 
        ${tarjetasHTML} 
      </div> 
    `);
      this.generarPronosticosInternos();
    });
  }

  get promptTenisMesa(): string {
    return `PARTIDO DE TENIS DE MESA: ${this.tenisMesa.jugador1} vs ${this.tenisMesa.jugador2}
Devuelve unicamente estas lineas, sin explicaciones, tablas ni Markdown. Escribe un valor despues de cada dos puntos. Usa punto decimal; si no existe un dato, escribe No disponible.
Jugador 1: ${this.tenisMesa.jugador1}
Jugador 2: ${this.tenisMesa.jugador2}
Formato del partido - Sets para ganar: [2 para mejor de 3, 3 para mejor de 5 o 4 para mejor de 7]
Jugador 1 - Porcentaje de victorias: [valor]
Jugador 2 - Porcentaje de victorias: [valor]
Jugador 1 - Sets ganados por partido: [valor]
Jugador 1 - Sets perdidos por partido: [valor]
Jugador 2 - Sets ganados por partido: [valor]
Jugador 2 - Sets perdidos por partido: [valor]
Jugador 1 - Puntos promedio por set: [valor]
Jugador 2 - Puntos promedio por set: [valor]
Linea de la casa - Handicap de sets: [valor o No disponible]
Linea de la casa - Total de sets: [valor o No disponible]
Casa de apuestas: [nombre o No disponible]`;
  }

  calcularTenisMesa(): void {
    const n = (value: number, fallback: number, min = 0, max = Number.POSITIVE_INFINITY) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
    };
    const setsParaGanar = Math.round(n(this.tenisMesa.setsParaGanar, 3, 2, 5));
    const victorias1 = n(this.tenisMesa.porcentajeVictorias1, 55, 0, 100);
    const victorias2 = n(this.tenisMesa.porcentajeVictorias2, 45, 0, 100);
    const ratioSets1 = n(this.tenisMesa.setsGanados1, 2.8, 0, 7) / Math.max(0.1, n(this.tenisMesa.setsGanados1, 2.8, 0, 7) + n(this.tenisMesa.setsPerdidos1, 1.8, 0, 7));
    const ratioSets2 = n(this.tenisMesa.setsGanados2, 2.4, 0, 7) / Math.max(0.1, n(this.tenisMesa.setsGanados2, 2.4, 0, 7) + n(this.tenisMesa.setsPerdidos2, 2.1, 0, 7));
    const puntosDiferencia = n(this.tenisMesa.puntosSet1, 10.8, 0, 30) - n(this.tenisMesa.puntosSet2, 10.2, 0, 30);
    const senal = (victorias1 - victorias2) / 100 * 0.55 + (ratioSets1 - ratioSets2) * 0.3 + puntosDiferencia / 30 * 0.15;
    const p1 = Math.min(0.95, Math.max(0.05, 0.5 + senal));
    const p2 = 1 - p1;
    const combinaciones = (a: number, b: number) => {
      let result = 1;
      for (let i = 1; i <= b; i++) result *= (a - b + i) / i;
      return result;
    };
    let mejorProbabilidad = -1;
    let marcador = `${setsParaGanar}-${setsParaGanar - 1}`;
    let totalSetsEsperado = 0;
    for (let perdidos = 0; perdidos < setsParaGanar; perdidos++) {
      const prob1 = combinaciones(setsParaGanar + perdidos - 1, perdidos) * Math.pow(p1, setsParaGanar) * Math.pow(p2, perdidos);
      const prob2 = combinaciones(setsParaGanar + perdidos - 1, perdidos) * Math.pow(p2, setsParaGanar) * Math.pow(p1, perdidos);
      totalSetsEsperado += prob1 * (setsParaGanar + perdidos) + prob2 * (setsParaGanar + perdidos);
      if (prob1 > mejorProbabilidad) {
        mejorProbabilidad = prob1;
        marcador = `${setsParaGanar}-${perdidos}`;
      }
      if (prob2 > mejorProbabilidad) {
        mejorProbabilidad = prob2;
        marcador = `${perdidos}-${setsParaGanar}`;
      }
    }
    const lineaTotal = n(this.tenisMesa.lineaTotalSets, 4.5, 0, 9);
    this.tenisMesaResultados = {
      ganador: p1 >= 0.5 ? this.tenisMesa.jugador1 : this.tenisMesa.jugador2,
      probabilidad1: Math.round(p1 * 100),
      probabilidad2: Math.round(p2 * 100),
      marcadorSets: marcador,
      recomendacionSets: `Handicap sugerido: ${p1 >= 0.5 ? '+' : '-'}${Math.abs(setsParaGanar - (marcador.startsWith(`${setsParaGanar}-`) ? Number(marcador.split('-')[1]) : Number(marcador.split('-')[0])))} sets`,
      totalSets: Number(totalSetsEsperado.toFixed(2)),
      recomendacionTotal: `${totalSetsEsperado >= lineaTotal ? 'Over' : 'Under'} ${lineaTotal} sets`,
      confianza: Math.round(Math.max(p1, p2) * 100),
    };
    this.generarPronosticosInternos();
  }

  copiarPromptTenisMesa(): void {
    this.tenisMesaPromptCopiado = 'Prompt de tenis de mesa listo para copiar.';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(this.promptTenisMesa);
    }
  }

  private normalizarEtiqueta(etiqueta: string): string {
    return etiqueta
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private leerResultadoProm(texto: string): Map<string, string> {
    const valores = new Map<string, string>();
    for (const linea of texto.split(/\r?\n/)) {
      const separador = linea.indexOf(':');
      if (separador < 0) continue;
      const etiqueta = this.normalizarEtiqueta(linea.slice(0, separador));
      const valor = linea.slice(separador + 1).trim();
      if (etiqueta && valor) valores.set(etiqueta, valor);
    }
    return valores;
  }

  private numeroImportado(valor: string | undefined): number | null {
    if (!valor || this.normalizarEtiqueta(valor) === 'no disponible') return null;
    const coincidencia = valor.replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    if (!coincidencia) return null;
    const numero = Number(coincidencia[0]);
    return Number.isFinite(numero) ? numero : null;
  }

  procesarResultadoPromNba(): void {
    if (!this.resultadoPromNba.trim()) {
      this.estadoImportacionNba = '';
      this.datosNoColocadosNba = [];
      return;
    }

    const valores = this.leerResultadoProm(this.resultadoPromNba);
    const campos = [
      'equipo local',
      'equipo visitante',
      'local - promedio de puntos a favor por partido',
      'local - promedio de puntos en contra por partido',
      'visita - promedio de puntos a favor por partido',
      'visita - promedio de puntos en contra por partido',
      'local - ritmo o posesiones por partido',
      'visita - ritmo o posesiones por partido',
      'jugador de triples',
      'jugador - triples convertidos por partido',
      'jugador - intentos de triple por partido',
      'jugador - porcentaje de triple',
      'jugador - minutos esperados',
      'local - promedio de puntos en el primer cuarto',
      'visita - promedio de puntos en el primer cuarto',
      'linea de la casa - total de puntos',
      'linea de la casa - ganador o margen',
      'linea de la casa - triples del jugador',
      'linea de la casa - total de puntos del primer cuarto',
    ];
    const colocados = new Set<string>();
    const asignarNumero = (etiqueta: string, propiedad: keyof typeof this.nba): void => {
      const numero = this.numeroImportado(valores.get(etiqueta));
      if (numero === null) return;
      (this.nba[propiedad] as number) = numero;
      colocados.add(etiqueta);
    };
    const asignarTexto = (etiqueta: string, propiedad: 'localNombre' | 'visitaNombre' | 'jugador'): void => {
      const valor = valores.get(etiqueta);
      if (!valor || this.normalizarEtiqueta(valor) === 'no disponible') return;
      this.nba[propiedad] = valor;
      colocados.add(etiqueta);
    };

    asignarTexto('equipo local', 'localNombre');
    asignarTexto('equipo visitante', 'visitaNombre');
    asignarNumero('local - promedio de puntos a favor por partido', 'localPuntosFavor');
    asignarNumero('local - promedio de puntos en contra por partido', 'localPuntosContra');
    asignarNumero('visita - promedio de puntos a favor por partido', 'visitaPuntosFavor');
    asignarNumero('visita - promedio de puntos en contra por partido', 'visitaPuntosContra');
    asignarNumero('local - ritmo o posesiones por partido', 'localRitmo');
    asignarNumero('visita - ritmo o posesiones por partido', 'visitaRitmo');
    asignarTexto('jugador de triples', 'jugador');
    asignarNumero('jugador - triples convertidos por partido', 'triplesJugador');
    asignarNumero('jugador - intentos de triple por partido', 'intentosTriple');
    asignarNumero('jugador - porcentaje de triple', 'porcentajeTriple');
    asignarNumero('jugador - minutos esperados', 'minutosJugador');
    asignarNumero('local - promedio de puntos en el primer cuarto', 'localPrimerCuarto');
    asignarNumero('visita - promedio de puntos en el primer cuarto', 'visitaPrimerCuarto');
    asignarNumero('linea de la casa - total de puntos', 'lineaTotalPuntos');
    asignarNumero('linea de la casa - ganador o margen', 'lineaGanador');
    asignarNumero('linea de la casa - triples del jugador', 'lineaTriples');
    asignarNumero('linea de la casa - total de puntos del primer cuarto', 'lineaPrimerCuarto');

    this.calcularNba();
    const importados = campos.filter((campo) => valores.has(campo)).length;
    this.datosNoColocadosNba = campos
      .filter((campo) => !colocados.has(campo))
      .map((campo) => valores.has(campo) ? `${campo}: ${valores.get(campo)}` : campo);
    this.estadoImportacionNba = importados > 0
      ? `${importados} datos importados · ${colocados.size} colocados · ${this.datosNoColocadosNba.length} no colocados.`
      : 'No se encontraron líneas con el formato Etiqueta: valor.';
    this.guardarEstadoPartido();
  }

  get promptNba(): string {
    return `PARTIDO NBA: ${this.nba.localNombre} vs ${this.nba.visitaNombre}
Devuelve unicamente estas lineas, sin explicaciones, tablas ni Markdown. Escribe un valor despues de cada dos puntos. Usa punto decimal; si no existe un dato, escribe No disponible.
Equipo Local: ${this.nba.localNombre}
Equipo Visitante: ${this.nba.visitaNombre}
Local - Promedio de puntos a favor por partido: [valor]
Local - Promedio de puntos en contra por partido: [valor]
Visita - Promedio de puntos a favor por partido: [valor]
Visita - Promedio de puntos en contra por partido: [valor]
Local - Ritmo o posesiones por partido: [valor]
Visita - Ritmo o posesiones por partido: [valor]
Jugador de triples: ${this.nba.jugador}
Jugador - Triples convertidos por partido: [valor]
Jugador - Intentos de triple por partido: [valor]
Jugador - Porcentaje de triple: [valor]
Jugador - Minutos esperados: [valor]
Local - Promedio de puntos en el primer cuarto: [valor]
Visita - Promedio de puntos en el primer cuarto: [valor]
Linea de la casa - Total de puntos: [valor o No disponible]
Linea de la casa - Ganador o margen: [valor o No disponible]
Linea de la casa - Triples del jugador: [valor o No disponible]
Linea de la casa - Total de puntos del primer cuarto: [valor o No disponible]
Casa de apuestas: [nombre o No disponible]`;
  }

  calcularNba(): void {
    const n = (value: number, fallback: number, min = 0, max = Number.POSITIVE_INFINITY) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
    };
    const localFavor = n(this.nba.localPuntosFavor, 112, 0, 180);
    const localContra = n(this.nba.localPuntosContra, 110, 0, 180);
    const visitaFavor = n(this.nba.visitaPuntosFavor, 111, 0, 180);
    const visitaContra = n(this.nba.visitaPuntosContra, 113, 0, 180);
    const ritmoLocal = n(this.nba.localRitmo, 99, 80, 130);
    const ritmoVisita = n(this.nba.visitaRitmo, 99, 80, 130);
    const ritmoFactor = Math.min(1.12, Math.max(0.88, ((ritmoLocal + ritmoVisita) / 2) / 99));
    const puntosLocal = ((localFavor + visitaContra) / 2) * ritmoFactor;
    const puntosVisita = ((visitaFavor + localContra) / 2) * ritmoFactor;
    const totalPuntos = puntosLocal + puntosVisita;
    const margen = puntosLocal - puntosVisita + n(this.nba.ventajaLocal, 2.5, -10, 10);
    const desviacion = n(this.nba.desviacionMargen, 12, 4, 30);
    const probLocal = 1 / (1 + Math.exp(-margen / desviacion));
    const lineaGanador = n(this.nba.lineaGanador, 0, -30, 30);
    const triplesObservados = n(this.nba.triplesJugador, 2.5, 0, 15);
    const intentos = n(this.nba.intentosTriple, 7, 0, 30);
    const porcentaje = n(this.nba.porcentajeTriple, 36, 0, 100) / 100;
    const minutos = n(this.nba.minutosJugador, 32, 0, 60);
    const triplesEsperados = triplesObservados * 0.55 + intentos * porcentaje * (minutos / 32) * 0.45;
    const primerCuarto = n(this.nba.localPrimerCuarto, 28, 0, 80) + n(this.nba.visitaPrimerCuarto, 27, 0, 80);
    const lineaTotal = n(this.nba.lineaTotalPuntos, 224.5, 0, 300);
    const lineaTriples = n(this.nba.lineaTriples, 2.5, 0, 15);
    const lineaPrimerCuarto = n(this.nba.lineaPrimerCuarto, 55.5, 0, 150);
    this.nbaResultados = {
      totalPuntos: Number(totalPuntos.toFixed(1)),
      totalRecomendacion: `${totalPuntos >= lineaTotal ? 'Over' : 'Under'} ${lineaTotal} puntos`,
      ganador: margen - lineaGanador >= 0 ? this.nba.localNombre : this.nba.visitaNombre,
      probabilidadLocal: Math.round(probLocal * 100),
      probabilidadVisita: Math.round((1 - probLocal) * 100),
      triples: Number(triplesEsperados.toFixed(1)),
      triplesRecomendacion: `${triplesEsperados >= lineaTriples ? 'Over' : 'Under'} ${lineaTriples} triples`,
      primerCuarto: Number(primerCuarto.toFixed(1)),
      primerCuartoRecomendacion: `${primerCuarto >= lineaPrimerCuarto ? 'Over' : 'Under'} ${lineaPrimerCuarto} puntos`,
    };
    this.generarPronosticosInternos();
  }

  copiarPromptNba(): void {
    this.nbaPromptCopiado = 'Prompt NBA listo para copiar.';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(this.promptNba);
    }
  }

  procesarResultadoPromTenisMesa(): void {
    if (!this.resultadoPromTenisMesa.trim()) {
      this.estadoImportacionTenisMesa = '';
      this.datosNoColocadosTenisMesa = [];
      return;
    }

    const valores = this.leerResultadoProm(this.resultadoPromTenisMesa);
    const campos = [
      'jugador 1',
      'jugador 2',
      'formato del partido - sets para ganar',
      'jugador 1 - porcentaje de victorias',
      'jugador 2 - porcentaje de victorias',
      'jugador 1 - sets ganados por partido',
      'jugador 1 - sets perdidos por partido',
      'jugador 2 - sets ganados por partido',
      'jugador 2 - sets perdidos por partido',
      'jugador 1 - puntos promedio por set',
      'jugador 2 - puntos promedio por set',
      'linea de la casa - handicap de sets',
      'linea de la casa - total de sets',
    ];
    const colocados = new Set<string>();
    const asignarNumero = (etiqueta: string, propiedad: keyof typeof this.tenisMesa): void => {
      const numero = this.numeroImportado(valores.get(etiqueta));
      if (numero === null) return;
      (this.tenisMesa[propiedad] as number) = numero;
      colocados.add(etiqueta);
    };
    const asignarTexto = (etiqueta: string, propiedad: 'jugador1' | 'jugador2'): void => {
      const valor = valores.get(etiqueta);
      if (!valor || this.normalizarEtiqueta(valor) === 'no disponible') return;
      this.tenisMesa[propiedad] = valor;
      colocados.add(etiqueta);
    };

    asignarTexto('jugador 1', 'jugador1');
    asignarTexto('jugador 2', 'jugador2');
    asignarNumero('formato del partido - sets para ganar', 'setsParaGanar');
    asignarNumero('jugador 1 - porcentaje de victorias', 'porcentajeVictorias1');
    asignarNumero('jugador 2 - porcentaje de victorias', 'porcentajeVictorias2');
    asignarNumero('jugador 1 - sets ganados por partido', 'setsGanados1');
    asignarNumero('jugador 1 - sets perdidos por partido', 'setsPerdidos1');
    asignarNumero('jugador 2 - sets ganados por partido', 'setsGanados2');
    asignarNumero('jugador 2 - sets perdidos por partido', 'setsPerdidos2');
    asignarNumero('jugador 1 - puntos promedio por set', 'puntosSet1');
    asignarNumero('jugador 2 - puntos promedio por set', 'puntosSet2');
    asignarNumero('linea de la casa - handicap de sets', 'lineaHandicap');
    asignarNumero('linea de la casa - total de sets', 'lineaTotalSets');

    this.calcularTenisMesa();
    const importados = campos.filter((campo) => valores.has(campo)).length;
    this.datosNoColocadosTenisMesa = campos
      .filter((campo) => !colocados.has(campo))
      .map((campo) => valores.has(campo) ? `${campo}: ${valores.get(campo)}` : campo);
    this.estadoImportacionTenisMesa = importados > 0
      ? `${importados} datos importados · ${colocados.size} colocados · ${this.datosNoColocadosTenisMesa.length} no colocados.`
      : 'No se encontraron líneas con el formato Etiqueta: valor.';
    this.guardarEstadoPartido();
  }

  abrirBusquedaDatos(): void {
    const consulta = encodeURIComponent(
      `${this.localNombre} vs ${this.visitaNombre} estad&iacute;sticas goles c&oacute;rners tarjetas tiros a puerta`,
    );
    window.open(`https://www.google.com/search?q=${consulta}`, '_blank', 'noopener,noreferrer');
  }

  imprimirReporte() {
    this.ngZone.run(() => {
      const ventanaImpresion = window.open('', '_blank');
      if (!ventanaImpresion) {
        alert('Por favor, permite las ventanas emergentes (pop-ups) para generar el PDF.');
        return;
      }

      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte Técnico - MEGAFÚTBOL</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #0f172a;
              color: #f8fafc;
              padding: 2rem;
              margin: 0;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #334155;
              padding-bottom: 1rem;
              margin-bottom: 1.5rem;
            }
            .header h1 {
              color: #38bdf8;
              margin: 0;
              font-size: 1.8rem;
            }
            .header p {
              color: #94a3b8;
              margin: 0.4rem 0 0;
            }
            .section-title {
              color: #38bdf8;
              font-size: 1.1rem;
              border-bottom: 1px solid #334155;
              padding-bottom: 0.5rem;
              margin-top: 1.5rem;
              margin-bottom: 1rem;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 1.5rem;
            }
            .param-item {
              background-color: #1e293b;
              border: 1px solid #475569;
              padding: 10px;
              border-radius: 6px;
            }
            .param-label {
              font-size: 0.75rem;
              color: #94a3b8;
              display: block;
            }
            .param-value {
              font-size: 1rem;
              font-weight: bold;
              color: #ffffff;
              margin-top: 4px;
            }
            .analysis-box {
              background-color: #1e293b;
              border: 1px solid #334155;
              padding: 15px;
              border-radius: 10px;
              margin-top: 1rem;
            }
            @media print {
              body { background-color: #ffffff; color: #000000; }
              .param-item, .analysis-box { background-color: #f1f5f9; border-color: #cbd5e1; color: #000000; }
              .param-value { color: #000000; }
              .header h1, .section-title { color: #0284c7; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MEGAFÚTBOL</h1>
            <p>Sistema integral automatizado de análisis y predicción deportiva</p>
          </div>

          <div class="section-title">Opciones y Pronósticos Calculados</div>
          <div class="grid">
            <div class="param-item">
              <span class="param-label">Top 1 (Mercado Principal)</span>
              <div class="param-value">${this.resultados.recomendacionesTop[0]?.mercado ?? 'Sin pronóstico'}</div>
            </div>
            <div class="param-item">
              <span class="param-label">Top 2 (Alternativa)</span>
              <div class="param-value">${this.resultados.recomendacionesTop[1]?.mercado ?? 'Sin pronóstico'}</div>
            </div>
          </div>
          <div class="section-title">Resultado de Análisis Detallado</div>
          <div class="analysis-box">
            ${this.analisisNarrativo || '<p>Sin análisis generado aún.</p>'}
          </div>
        </body>
        </html>
      `;

      ventanaImpresion.document.open();
      ventanaImpresion.document.write(contenidoHTML);
      ventanaImpresion.document.close();

      setTimeout(() => {
        ventanaImpresion.focus();
        ventanaImpresion.print();
      }, 500);
    });
  }

  factorial(n: number): number {
    if (n === 0 || n === 1) return 1;
    let acum = 1;
    for (let i = 2; i <= n; i++) acum *= i;
    return acum;
  }

  // Método opcional por si ingresan la Clave Maestra de emergencia
  validarClaveMaestra(inputClave: string): void {
    this.http.get<LicenciasResponse>(this.urlLicenciasJson).subscribe({
      next: (data) => {
        if (inputClave.trim() === data.claveMaestra) {
          this.isLicensed = true;
          this.mensajeEstado = 'Acceso concedido por Clave Maestra.';
        } else {
          alert('Clave maestra incorrecta');
        }
      },
    });
  }
}
