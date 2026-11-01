import { Injectable } from '@angular/core';

export interface OddsApiResponse {
  ok: boolean;
  configured: boolean;
  events: number;
  message: string;
  pronosticos: OnlinePronostico[];
}

export interface OnlinePronostico {
  deporte: string;
  evento: string;
  horaInicio: string | null;
  mercado: string;
  seleccion: string;
  cuota: number | null;
  indiceValor: number;
  fuente: string;
}

interface ElectronIpcRenderer {
  invoke(channel: string, ...args: unknown[]): Promise<OddsApiResponse>;
}

interface ElectronModule {
  ipcRenderer: ElectronIpcRenderer;
}

declare global {
  interface Window {
    require?: (moduleName: string) => ElectronModule;
  }
}

@Injectable({
  providedIn: 'root',
})
export class OddsApiService {
  private readonly backendUrl = 'https://megafutbol2-2.onrender.com';

  consultarPronosticos(limite: number): Promise<OddsApiResponse> {
    if (typeof window === 'undefined' || !window.require) {
      return this.consultarDesdeBackend(limite);
    }

    try {
      const consulta = window.require('electron').ipcRenderer.invoke('odds-api:consultar', limite);
      const timeout = new Promise<OddsApiResponse>((resolve) => {
        window.setTimeout(() => resolve({
          ok: false,
          configured: true,
          events: 0,
          message: 'La consulta tardó demasiado. Comprueba internet o vuelve a intentarlo.',
          pronosticos: [],
        }), 12000);
      });
      return Promise.race([consulta, timeout]);
    } catch (error) {
      console.error('No se pudo acceder al puente de Electron para consultar la API.', error);
      return Promise.resolve({
        ok: false,
        configured: false,
        events: 0,
        message: 'No se pudo iniciar la consulta de la API local.',
        pronosticos: [],
      });
    }
  }

  verificarElectron(): Promise<{ ok: boolean; message: string }> {
    if (typeof window === 'undefined' || !window.require) {
      return fetch(`${this.backendUrl}/health`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`El servidor respondió ${response.status}.`);
          }
          return { ok: true, message: 'Servidor online conectado.' };
        })
        .catch((error) => {
          console.error('No se pudo verificar el servidor online.', error);
          return {
            ok: false,
            message: 'No se pudo conectar con el servidor online. Comprueba internet e inténtalo de nuevo.',
          };
        });
    }

    try {
      return window.require('electron').ipcRenderer.invoke('odds-api:ping') as Promise<{ ok: boolean; message: string }>;
    } catch (error) {
      console.error('No se pudo verificar el puente de Electron.', error);
      return Promise.resolve({ ok: false, message: 'No se pudo verificar el puente de Electron.' });
    }
  }

  private consultarDesdeBackend(limite: number): Promise<OddsApiResponse> {
    const timeout = window.setTimeout;
    const controlador = new AbortController();
    const temporizador = timeout(() => controlador.abort(), 15000);
    return fetch(`${this.backendUrl}/api/pronosticos?limite=${encodeURIComponent(limite)}`, {
      signal: controlador.signal,
    })
      .then(async (response) => {
        const respuesta = await response.json() as OddsApiResponse;
        if (!response.ok) {
          throw new Error(respuesta.message || `El servidor respondió ${response.status}.`);
        }
        return respuesta;
      })
      .catch((error) => ({
        ok: false,
        configured: true,
        events: 0,
        message: error?.name === 'AbortError'
          ? 'La consulta online tardó demasiado. Inténtalo nuevamente.'
          : error instanceof Error
            ? error.message
            : 'No se pudo consultar el servidor online.',
        pronosticos: [],
      }))
      .finally(() => clearTimeout(temporizador));
  }
}
