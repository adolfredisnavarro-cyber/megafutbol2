const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

function cargarVariablesEnv() {
  const rutas = [
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '.env'),
    path.join(path.dirname(process.execPath), '.env'),
    path.join(app.getPath('userData'), '.env'),
    path.join(app.getAppPath(), '.env'),
  ];
  const ruta = rutas.find((candidata) => fs.existsSync(candidata));
  if (!ruta) return false;

  const contenido = fs.readFileSync(ruta, 'utf8').replace(/^\uFEFF/, '');
  for (const linea of contenido.split(/\r?\n/)) {
    const coincidencia = linea.replace(/^\uFEFF/, '').match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!coincidencia) continue;
    process.env[coincidencia[1]] = coincidencia[2].replace(/^["']|["']$/g, '').trim();
  }
  return true;
}

async function consultarOddsApi(limiteSolicitado = 5) {
  const envEncontrado = cargarVariablesEnv();
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey || apiKey === 'pega_aqui_tu_clave') {
    return {
      ok: false,
      configured: false,
      events: 0,
      message: envEncontrado
        ? 'Se encontró .env, pero no se encontró una clave válida ODDS_API_KEY.'
        : 'No se encontró .env. Colócalo junto a main.js y configura ODDS_API_KEY.',
      pronosticos: [],
    };
  }

  const sports = [
    'soccer_epl',
    'soccer_spain_la_liga',
    'soccer_italy_serie_a',
    'soccer_germany_bundesliga',
    'soccer_uefa_champs_league',
    'basketball_nba',
  ];
  const consultarDeporte = async (sport) => {
    const url = new URL(`https://api.the-odds-api.com/v4/sports/${sport}/odds/`);
    url.searchParams.set('apiKey', apiKey);
    url.searchParams.set('regions', 'eu');
    url.searchParams.set('markets', 'h2h,totals,spreads');
    url.searchParams.set('oddsFormat', 'decimal');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        const detalle = await response.text();
        throw new Error(`The Odds API respondió ${response.status} para ${sport}: ${detalle.slice(0, 180)}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data.map((evento) => ({ ...evento, sport })) : [];
    } catch (error) {
      if (error?.name === 'AbortError') {
        throw new Error(`La consulta de ${sport} superó el límite de 10 segundos.`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };
  const respuestas = await Promise.all(sports.map(async (sport) => {
    try {
      return await consultarDeporte(sport);
    } catch (error) {
      console.error(`No se pudo consultar ${sport}.`, error);
      return [];
    }
  }));
  const ahora = Date.now();
  const limiteFuturo = ahora + 72 * 60 * 60 * 1000;
  const eventosUnicos = new Map();
  for (const evento of respuestas.flat()) {
    if (!evento.home_team || !evento.away_team) continue;
    if (evento.commence_time && (Date.parse(evento.commence_time) < ahora || Date.parse(evento.commence_time) > limiteFuturo)) continue;
    const clave = evento.id || [
      evento.sport,
      evento.home_team.trim().toLocaleLowerCase(),
      evento.away_team.trim().toLocaleLowerCase(),
      evento.commence_time || 'sin-hora',
    ].join('|');
    const existente = eventosUnicos.get(clave);
    if (!existente || (evento.bookmakers || []).length > (existente.bookmakers || []).length) {
      eventosUnicos.set(clave, evento);
    }
  }
  const eventos = [...eventosUnicos.values()];

  const pronosticos = eventos
    .flatMap((evento) => {
      const nombreDeporte = evento.sport === 'basketball_nba' ? 'NBA' : 'FÚTBOL';
      const nombreEvento = `${evento.home_team} vs ${evento.away_team}`;
      const resultados = [];
      const mercadosVistos = new Set();
      const mercadosDisponibles = new Map();
      for (const bookmaker of evento.bookmakers || []) {
        for (const market of bookmaker.markets || []) {
          if (mercadosVistos.has(market.key)) continue;
          const outcome = (market.outcomes || [])
            .filter((item) => Number.isFinite(Number(item.price)) && Number(item.price) > 1)
            .sort((a, b) => Number(b.price) - Number(a.price))[0];
          if (!outcome) continue;
          mercadosDisponibles.set(market.key, { outcome, bookmaker });
          mercadosVistos.add(market.key);
        }
      }
      for (const [marketKey, { outcome, bookmaker }] of mercadosDisponibles) {
        const cuota = Number(outcome.price);
        const probabilidad = Math.round((1 / cuota) * 100);
        resultados.push({
          deporte: nombreDeporte,
          evento: nombreEvento,
          horaInicio: evento.commence_time || null,
          mercado: marketKey === 'h2h' ? 'Ganador' : 'Total',
          seleccion: marketKey === 'totals' ? `${outcome.name} ${outcome.point ?? ''}`.trim() : outcome.name,
          cuota,
          indiceValor: Math.min(95, Math.max(50, probabilidad)),
          fuente: bookmaker.title || bookmaker.key || 'The Odds API',
        });
      }
      return resultados;
    })
    .filter((pronostico, indice, todos) => todos.findIndex((otro) =>
      otro.deporte === pronostico.deporte &&
      otro.evento === pronostico.evento &&
      otro.mercado === pronostico.mercado
    ) === indice)
    .sort((a, b) => b.indiceValor - a.indiceValor)
    .slice(0, Math.min(15, Math.max(5, Number(limiteSolicitado) || 5)));

  return {
    ok: true,
    configured: true,
    events: eventos.length,
    message: pronosticos.length > 0
      ? `Se encontraron ${eventos.length} eventos y ${pronosticos.length} pronósticos para mostrar.`
      : 'Se encontraron eventos, pero no hay cuotas decimales válidas en las próximas 72 horas.',
    pronosticos,
  };
}

ipcMain.handle('odds-api:consultar', async (_event, limite) => {
  try {
    return await consultarOddsApi(limite);
  } catch (error) {
    console.error('Error consultando The Odds API.', error);
    return {
      ok: false,
      configured: true,
      events: 0,
      message: error instanceof Error ? error.message : 'Error desconocido consultando The Odds API.',
      pronosticos: [],
    };
  }
});

ipcMain.handle('odds-api:ping', () => ({
  ok: true,
  message: 'Puente Electron conectado.',
}));

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // <--- Esto permite que cargue todos los recursos locales sin bloqueo
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'dist', 'miappgooglesheet', 'browser', 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});