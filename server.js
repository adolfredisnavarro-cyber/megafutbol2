const http = require('http');

const PORT = Number(process.env.PORT) || 3000;
const API_BASE_URL = 'https://api.the-odds-api.com/v4/sports';
const SPORTS = [
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_italy_serie_a',
  'soccer_germany_bundesliga',
  'soccer_uefa_champs_league',
  'basketball_nba',
];
const MARKETS = 'h2h,totals,spreads';
const MIN_ODDS = 1.01;

function enviarJson(res, status, data) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  });
  res.end(JSON.stringify(data));
}

async function consultarDeporte(sport, apiKey) {
  const url = new URL(`${API_BASE_URL}/${sport}/odds/`);
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('regions', 'eu');
  url.searchParams.set('markets', MARKETS);
  url.searchParams.set('oddsFormat', 'decimal');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`The Odds API respondió ${response.status}: ${detail.slice(0, 180)}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data.map((event) => ({ ...event, sport })) : [];
  } finally {
    clearTimeout(timeout);
  }
}

function crearPronosticos(eventos, limiteSolicitado) {
  const ahora = Date.now();
  const limiteFuturo = ahora + 72 * 60 * 60 * 1000;
  const unicos = new Map();
  for (const evento of eventos) {
    if (!evento.home_team || !evento.away_team) continue;
    if (evento.commence_time && Date.parse(evento.commence_time) < ahora) continue;
    if (!evento.commence_time || Date.parse(evento.commence_time) > limiteFuturo) continue;
    const normalizarEquipo = (nombre) => nombre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\b(fc|cf|sc|club|deportivo|basketball|bc)\b/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    const key = [
      evento.sport,
      normalizarEquipo(evento.home_team),
      normalizarEquipo(evento.away_team),
    ].join('|');
    const existente = unicos.get(key);
    const horaEvento = Date.parse(evento.commence_time || '') || Number.MAX_SAFE_INTEGER;
    const horaExistente = Date.parse(existente?.commence_time || '') || Number.MAX_SAFE_INTEGER;
    if (!existente ||
      (horaEvento < horaExistente && (evento.bookmakers || []).length >= (existente.bookmakers || []).length) ||
      (horaEvento === horaExistente && (evento.bookmakers || []).length > (existente.bookmakers || []).length)) {
      unicos.set(key, evento);
    }
  }

  const pronosticos = [...unicos.values()].flatMap((evento) => {
    const deporte = evento.sport === 'basketball_nba' ? 'NBA' : 'FÚTBOL';
    const eventoNombre = `${evento.home_team} vs ${evento.away_team}`;
    const mercados = new Map();
    for (const bookmaker of evento.bookmakers || []) {
      for (const market of bookmaker.markets || []) {
        for (const outcome of market.outcomes || []) {
          const cuota = Number(outcome.price);
          if (!Number.isFinite(cuota) || cuota < MIN_ODDS) continue;
          const key = `${market.key}|${outcome.name}|${outcome.point ?? ''}`;
          const actual = mercados.get(key);
          if (!actual || cuota > actual.cuota) {
            mercados.set(key, { market, outcome, bookmaker, cuota });
          }
        }
      }
    }
    return [...mercados.values()].map(({ market, outcome, bookmaker, cuota }) => {
      return {
        deporte,
        evento: eventoNombre,
        horaInicio: evento.commence_time || null,
        mercado: market.key === 'h2h' ? 'Ganador' : market.key === 'spreads' ? 'Hándicap' : 'Total',
        seleccion: market.key === 'totals'
          ? `${outcome.name} ${outcome.point ?? ''}`.trim()
          : outcome.name,
        cuota,
        indiceValor: Math.min(95, Math.max(50, Math.round((1 / cuota) * 100))),
        fuente: bookmaker.title || bookmaker.key || 'The Odds API',
      };
    });
  });

  const limite = Math.min(15, Math.max(5, Number(limiteSolicitado) || 5));
  return pronosticos
    .filter((item, index, all) => all.findIndex((other) =>
      other.deporte === item.deporte &&
      other.evento === item.evento &&
      other.mercado === item.mercado &&
      other.seleccion === item.seleccion) === index)
    .sort((a, b) => b.indiceValor - a.indiceValor)
    .slice(0, limite);
}

async function consultarPronosticos(limite) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      configured: false,
      events: 0,
      message: 'El servidor no tiene configurada ODDS_API_KEY.',
      pronosticos: [],
    };
  }

  const resultados = await Promise.all(SPORTS.map(async (sport) => {
    try {
      return { sport, eventos: await consultarDeporte(sport, apiKey) };
    } catch (error) {
      console.error(`No se pudo consultar ${sport}.`, error);
      return {
        sport,
        eventos: [],
        error: error instanceof Error ? error.message : 'Error desconocido consultando el deporte.',
      };
    }
  }));
  const eventos = resultados.flatMap((resultado) => resultado.eventos);
  const errores = resultados
    .filter((resultado) => resultado.error)
    .map((resultado) => `${resultado.sport}: ${resultado.error}`);
  const pronosticos = crearPronosticos(eventos, limite);
  return {
    ok: true,
    configured: true,
    events: eventos.length,
    message: pronosticos.length > 0
      ? `Se encontraron ${eventos.length} eventos y ${pronosticos.length} pronósticos para mostrar.`
      : errores.length > 0
        ? `The Odds API no devolvió datos: ${errores.join(' | ')}`
        : `Se encontraron ${eventos.length} eventos, pero no hay cuotas decimales válidas en las próximas 72 horas.`,
    pronosticos,
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    enviarJson(res, 204, {});
    return;
  }
  if (req.method === 'GET' && req.url === '/health') {
    enviarJson(res, 200, { ok: true, service: 'megafutbol-odds-api' });
    return;
  }
  if (req.method === 'GET' && req.url.startsWith('/api/pronosticos')) {
    const limite = new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams.get('limite');
    try {
      enviarJson(res, 200, await consultarPronosticos(limite));
    } catch (error) {
      console.error('Error consultando The Odds API.', error)
