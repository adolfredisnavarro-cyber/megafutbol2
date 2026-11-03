import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  BetStatus,
  InvestmentApiService,
  InvestmentBet,
  InvestmentBoard,
  InvestmentPhase,
} from '../../services/investment-api.service';

@Component({
  selector: 'app-global-investment',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './global-investment.component.html',
  styleUrls: ['./global-investment.component.css'],
})
export class GlobalInvestmentComponent implements OnInit {
  private readonly api = inject(InvestmentApiService);
  board: InvestmentBoard | null = null;
  error = '';
  loading = false;
  closedMonths = new Set<number>();

  get x3dBets(): InvestmentBet[] {
    return this.board?.bets.filter((bet) => bet.group === 'x3d').slice(0, 4) ?? [];
  }

  get millionaireBets(): InvestmentBet[] {
    return this.board?.bets.filter((bet) => bet.group === 'millionaire').slice(0, 2) ?? [];
  }

  get dailyBets(): InvestmentBet[] {
    return this.board?.bets.filter((bet) => bet.group === 'daily').slice(0, 5) ?? [];
  }

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.board = await this.api.getBoard();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo cargar el tablero.';
    } finally {
      this.loading = false;
    }
  }

  async setResult(bet: InvestmentBet, result: BetStatus): Promise<void> {
    if (bet.status !== 'pending') return;
    this.loading = true;
    this.error = '';
    try {
      this.board = await this.api.setResult(bet.id, result);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'No se pudo actualizar la selección.';
    } finally {
      this.loading = false;
    }
  }

  toggleMonth(index: number): void {
    if (this.closedMonths.has(index)) {
      this.closedMonths.delete(index);
    } else {
      this.closedMonths.add(index);
    }
  }

  isMonthClosed(index: number): boolean {
    return this.closedMonths.has(index);
  }

  trackByBet(_index: number, bet: InvestmentBet): string {
    return bet.id;
  }

  trackByPhase(_index: number, phase: InvestmentPhase): string {
    return phase.name;
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }
}
