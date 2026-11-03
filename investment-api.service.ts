import { Injectable } from '@angular/core';

export type InvestmentGroup = 'x3d' | 'millionaire' | 'daily';
export type BetStatus = 'pending' | 'won' | 'lost';

export interface InvestmentBet {
  id: string;
  sport: string;
  league: string;
  event: string;
  start_time: string | null;
  market: string;
  selection: string;
  odds: number;
  bookmaker: string;
  group: InvestmentGroup;
  investment: number;
  net_profit: number;
  status: BetStatus;
}

export interface InvestmentPhase {
  name: string;
  initial_balance: number;
  target_balance: number;
  days: number;
  visible: boolean;
  progress: number;
}

export interface InvestmentBoard {
  generated_at: string;
  message: string;
  api_configured: boolean;
  events: number;
  balance: number;
  active_phase: number;
  phases: InvestmentPhase[];
  bets: InvestmentBet[];
}

@Injectable({ providedIn: 'root' })
export class InvestmentApiService {
  private readonly backendUrl = 'https://megafutbol2-2.onrender.com';
  private balance = 100000;
  private readonly statuses = new Map<string, BetStatus>();

  async getBoard(): Promise<InvestmentBoard> {
    const response = await fetch(`${this.backendUrl}/api/pronosticos?limite=40`);
    const payload = await response.json() as {
      ok: boolean;
      configured: boolean;
      events: number;
      message: string;
      pronosticos: Array<{
        deporte: string;
        evento: string;
        horaInicio: string | null;
        mercado: string;
        seleccion: string;
        cuota: number | null;
        fuente: string;
      }>;
    };
    if (!response.ok) {
      throw new Error(payload.message || 'Error del backend.');
    }
    const valid = payload.pronosticos.filter((item) => item.cuota !== null && item.cuota > 1);
    if (!payload.ok || valid.length < 11) {
      throw new Error(payload.message || 'La API no devolvió suficientes cuotas.');
    }
    const bets = valid.slice(0, 11).map((item, index) => ({
      id: `${item.evento}|${item.mercado}|${item.seleccion}`,
      sport: item.deporte,
      league: item.deporte === 'NBA' ? 'NBA' : 'Liga principal',
      event: item.evento,
      start_time: item.horaInicio,
      market: item.mercado,
      selection: item.seleccion,
      odds: item.cuota as number,
      bookmaker: item.fuente,
      group: index < 4 ? 'x3d' : index < 6 ? 'millionaire' : 'daily',
      investment: 0,
      net_profit: 0,
      status: this.statuses.get(`${item.evento}|${item.mercado}|${item.seleccion}`) ?? 'pending',
    } as InvestmentBet));
    const pending = bets.filter((bet) => bet.status === 'pending');
    const profit = Math.max(0, 1000000 - this.balance) / Math.max(1, pending.length);
    for (const bet of pending) {
      bet.net_profit = Math.round(profit);
      bet.investment = Math.round(profit / (bet.odds - 1));
    }
    const phases: InvestmentPhase[] = [
      ['Mes 1', 100000, 1000000, 28],
      ['Mes 2', 1000000, 6000000, 30],
      ['Mes 3', 6000000, 18000000, 30],
      ['Mes 4', 18000000, 54000000, 30],
    ].map(([name, initial_balance, target_balance, days]) => ({
      name: name as string,
      initial_balance: initial_balance as number,
      target_balance: target_balance as number,
      days: days as number,
      visible: true,
      progress: 0,
    }));
    return {
      generated_at: new Date().toISOString(),
      message: payload.message,
      api_configured: payload.configured,
      events: payload.events,
      balance: this.balance,
      active_phase: 0,
      phases,
      bets,
    };
  }

  async setResult(betId: string, result: BetStatus): Promise<InvestmentBoard> {
    this.statuses.set(betId, result);
    return this.getBoard();
  }
}
