import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem('mega_app_authenticated');
    localStorage.removeItem('mega_app_fecha_activacion');
    localStorage.removeItem('mega_app_dias_validez');
    localStorage.removeItem('reto_millonario_dias_v2');
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should keep a web pronostic in a static x3D card without calling the API', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.x3dPronosticoWebInput = 'Over 2.5 goles - Deportivo Cali vs Deportes Tolima';

    app.guardarPronosticoWeb();

    expect(app.x3dPronosticoWebCard).toBe(app.x3dPronosticoWebInput);
    expect(app.estadoX3D).toContain('tarjeta estática');
  });

  it('should keep the projected balance when a planned bet is marked as won', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.calcularRetoMillonario();

    const dia = app.retoMillonarioTabla[0].dias[0];
    const saldoProyectado = dia.saldoFinalProtegido;

    app.registrarApuesta(dia, 1, 'ganada');

    expect(app.retoMillonarioTabla[0].dias[0].saldoFinalProtegido).toBe(saldoProyectado);
  });

  it('should render the dashboard', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Clave de Activación');
  });

  it('should calculate connected Poisson results for zero-goal inputs', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.inputData.golesFavorLocal = 0;
    app.inputData.golesEnContraLocal = 0;
    app.inputData.golesFavorVisita = 0;
    app.inputData.golesEnContraVisita = 0;
    app.inputData.promGolesPartidoLocal = 0;
    app.inputData.promGolesPartidoVisita = 0;

    app.recalcular();

    expect(app.resultados.overUnder.total).toBe(0.8);
    expect(app.resultados.overUnder.probabilidadUnder).toBe(95);
    expect(app.resultados.btts.probabilidadModelo).toBe(33);
    expect(app.resultados.marcador).toEqual({
      equipo1: 0,
      equipo2: 0,
      porcentaje: 45,
    });
    expect(app.resultados.g1x2.ganador).not.toBe('Esperando datos...');
    expect(app.resultados.g1x2.probLocal).toBe(app.resultados.g1x2.probVisita);
    expect(app.resultados.recomendacionesTop[0].mercado).toBe('Under 2.5 Goles');
    expect(app.resultados.recomendacionesTop.every(({ prob }) => Number.isFinite(prob))).toBe(true);
  });

  it('should import every prompt field and show the refreshed market results', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const values = [
      '1,7', '0.8', '61', '2,5', '1.4', '1.1', '52', '2.6',
      '5.5', '4.7',
      '2.1', '2.4', '4.2',
      '14', '10.5', '13', '11.5', '25',
      '4.8', '3.6', '2.2', '1.3',
    ];
    const bookmakerLines = ['2.5', '9.5', '4.5', '22.5', '8.5', '3.5'];
    app.textoPegadoUsuario = app.promptWeb
      .replace(/\[valor\]/g, () => values.shift() ?? '')
      .replace(/\[valor de la línea(?: Over\/Under)?\]/g, () => bookmakerLines.shift() ?? 'No disponible')
      .replace('línea con signo, por ejemplo -0.25', '-0,25')
      .replace('línea, por ejemplo 2.25', '2,75')
      .replace('Equipo Local (Home): Once Caldas', 'Equipo Local (Home): Deportivo Cali')
      .replace(
        'Equipo Visitante (Away): Atlético Bucaramanga',
        'Equipo Visitante (Away): Deportes Tolima',
      );

    app.procesarTextoPegado();

    expect(app.localNombre).toBe('Deportivo Cali');
    expect(app.visitaNombre).toBe('Deportes Tolima');
    expect(app.cantidadDatosImportados).toBe(24);
    expect(app.inputData.golesFavorLocal).toBe(1.7);
    expect(app.inputData.golesEnContraVisita).toBe(1.1);
    expect(app.inputData.promGolesPartidoLocal).toBe(2.5);
    expect(app.inputData.bttsLocal).toBe(61);
    expect(app.inputData.tarjetasVisita).toBe(2.4);
    expect(app.inputData.promArbitroTarjetas).toBe(4.2);
    expect(app.inputData.faltasContraLocal).toBe(10.5);
    expect(app.inputData.promArbitroFaltas).toBe(25);
    expect(app.inputData.tirosPuertaVisita).toBe(3.6);
    expect(app.inputData.fuerasJuegoVisita).toBe(1.3);
    expect(app.inputData.handicapLocal).toBe(-0.25);
    expect(app.inputData.golesAsiaticos).toBe(2.75);
    expect(app.inputData.cornersLocal).toBe(5.5);
    expect(app.inputData.cornersVisita).toBe(4.7);
    expect(app.resultados.corners.pronosticados).toBe(10.2);
    expect(app.lineasCasa.goles).toBe(2.5);
    expect(app.lineasCasa.tarjetas).toBe(4.5);
    expect(app.lineasCasa.faltas).toBe(22.5);
    expect(app.lineasCasa.corners).toBe(9.5);
    expect(app.compararConLineaCasa(app.resultados.corners.pronosticados, app.lineasCasa.corners))
      .toContain('App por encima por 0.7');
    expect(app.resultados.btts.recomendacion).toMatch(/^Ambos marcan:/);
    expect(app.pestanaActiva).toBe('resultadosAnalisis');
    expect(app.mensajeImportacion).toContain('Se importaron 24 campos');

    localStorage.setItem('mega_app_authenticated', 'true');
    localStorage.setItem('mega_app_fecha_activacion', Date.now().toString());
    localStorage.setItem('mega_app_dias_validez', '999999');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Resultados de todos los mercados');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Se importaron 24 campos');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Tiros a puerta');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Línea de la casa: 9.5 · App por encima por 0.7',
    );

    localStorage.removeItem('mega_app_authenticated');
    localStorage.removeItem('mega_app_fecha_activacion');
    localStorage.removeItem('mega_app_dias_validez');
  });

  it('should fill both team name fields from bold AI response labels', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.textoPegadoUsuario = [
      '**PARTIDO A ANALIZAR:** Deportivo Cali vs Deportes Tolima',
      '**Equipo Local (Home):** **Independiente Medellín**',
      '**Equipo Visitante (Away):** **Atlético Nacional**',
      'Local - Promedio de córners por partido: 5,2',
      'Visita - Promedio de córners por partido: 4.8',
    ].join('\n');

    app.procesarTextoPegado();

    expect(app.localNombre).toBe('Independiente Medellín');
    expect(app.visitaNombre).toBe('Atlético Nacional');
    expect(app.inputData.cornersLocal).toBe(5.2);
    expect(app.inputData.cornersVisita).toBe(4.8);
  });

  it('should render the generated prompt in the same order as the imported fields', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.localNombre = 'Equipo A';
    app.visitaNombre = 'Equipo B';
    app.pestanaActiva = 'promWeb';
    localStorage.setItem('mega_app_authenticated', 'true');
    localStorage.setItem('mega_app_fecha_activacion', Date.now().toString());
    localStorage.setItem('mega_app_dias_validez', '999999');

    fixture.detectChanges();
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('PARTIDO A ANALIZAR: Equipo A vs Equipo B');
    expect(text).toContain('Local - Promedio de goles a favor por partido: [valor]');
    expect(text.indexOf('Local - Promedio de goles a favor')).toBeLessThan(
      text.indexOf('Local - Promedio de tarjetas'),
    );

    localStorage.removeItem('mega_app_authenticated');
    localStorage.removeItem('mega_app_fecha_activacion');
    localStorage.removeItem('mega_app_dias_validez');
  });

  it('should generate a single ordered prompt with the current team names', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.localNombre = 'Equipo A';
    app.visitaNombre = 'Equipo B';

    const prompt = app.promptWeb;

    expect(prompt).toContain('PARTIDO A ANALIZAR: Equipo A vs Equipo B');
    expect(prompt).toContain('Equipo Local (Home): Equipo A');
    expect(prompt).toContain('Equipo Visitante (Away): Equipo B');
    expect(prompt.indexOf('Visita - Promedio de goles totales')).toBeLessThan(
      prompt.indexOf('Local - Promedio de córners'),
    );
    expect(prompt.indexOf('Local - Promedio de goles a favor')).toBeLessThan(
      prompt.indexOf('Local - Promedio de tarjetas'),
    );
    expect(prompt).toContain('Visita - Promedio de córners por partido: [valor]');
    expect(prompt).toContain('Línea de la casa - Total de faltas: [valor de la línea] | Casa: [nombre de la casa]');
    expect(prompt).toContain('Wplay, Betsson, BetPlay, RushBet, Codere');
    expect(prompt).toContain('Cuota 1X2 Empate: Casa=[nombre]; Cuota=[cuota decimal]');
    expect(prompt).toContain('No escribas "No aplica" por falta de línea');
  });
});
