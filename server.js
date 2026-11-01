const http = require('http');

const PORT = Number(process.env.PORT) || 3000;
const API_BASE_URL = 'https://api.the-odds-api.com/v4/sports';

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
  url.searchParams.set('markets', 'h2h,totals');
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
  const formatoFecha = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const hoy = formatoFecha.format(new Date());
  const unicos = new Map();
  for (const evento of eventos) {
    if (!evento.home_team || !evento.away_team) continue;
    if (evento.commence_time && Date.parse(evento.commence_time) < ahora) continue;
    if (!evento.commence_time || formatoFecha.format(new Date(evento.commence_time)) !== hoy) continue;
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
        if (mercados.has(market.key)) continue;
        const outcome = (market.outcomes || [])
          .filter((item) => Number.isFinite(Number(item.price)))
          .sort((a, b) => Number(a.price) - Number(b.price))[0];
        if (outcome) mercados.set(market.key, { outcome, bookmaker });
      }
    }
    return [...mercados].map(([marketKey, { outcome, bookmaker }]) => {
      const cuota = Number(outcome.price);
      return {
        deporte,
        evento: eventoNombre,
        horaInicio: evento.commence_time || null,
        mercado: marketKey === 'h2h' ? 'Ganador' : 'Total',
        seleccion: marketKey === 'totals'
          ? `${outcome.name} ${outcome.point ?? ''}`.trim()
          : outcome.name,
        cuota,
        indiceValor: Math.min(95, Math.max(50, Math.round((1 / cuota) * 100))),
        fuente: bookmaker.title || bookmaker.key || 'The Odds API',
      };
    });
  });

  const limite = Math.min(10, Math.max(5, Number(limiteSolicitado) || 5));
  return pronosticos
    .filter((item, index, all) => all.findIndex((other) =>
      other.deporte === item.deporte &&
      other.evento === item.evento) === index)
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

  const eventos = (await Promise.all([
    consultarDeporte('soccer_spain_la_liga', apiKey),
    consultarDeporte('basketball_nba', apiKey),
  ])).flat();
  const pronosticos = crearPronosticos(eventos, limite);
  return {
    ok: true,
    configured: true,
    events: eventos.length,
    message: `Se encontraron ${eventos.length} eventos y ${pronosticos.length} pronósticos para mostrar.`,
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
      console.error('Error consultando The Odds API.', error);
      enviarJson(res, 502, {
        ok: false,
        configured: true,
        events: 0,
        message: error instanceof Error ? error.message : 'Error consultando The Odds API.',
        pronosticos: [],
      });
    }
    return;
  }
  enviarJson(res, 404, { ok: false, message: 'Ruta no encontrada.' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor MegaFutbol escuchando en el puerto ${PORT}.`);
});
