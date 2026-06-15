// ============================================================
// US-03 — Servicio de clima (Open-Meteo)
// Documentación: https://open-meteo.com/en/docs
// Sin API key. CORS habilitado. 10,000 llamadas/día gratis.
// ============================================================

import type {
  OpenMeteoResponse,
  DayWeather,
  WeatherRecommendation,
} from '../types';

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

const DAILY_VARS = [
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'windspeed_10m_max',
  'weathercode',
].join(',');

/**
 * Consulta Open-Meteo para una sede y una fecha exacta.
 *
 * Nota (sección 4.3 vs 2.1 del PDF): la humedad relativa NO existe
 * como variable diaria en Open-Meteo, solo horaria. Por eso pedimos
 * también hourly=relative_humidity_2m y tomamos el valor de la hora
 * del partido (timeLocal).
 *
 * @param latitude  Latitud de la sede (ej. 32.748 para AT&T Stadium)
 * @param longitude Longitud de la sede (ej. -97.093)
 * @param date      Fecha del partido en formato ISO "2026-06-14"
 * @param timezone  Zona horaria IANA de la sede (ej. "America/Chicago")
 * @param timeLocal Hora local del partido "HH:MM" (para la humedad)
 * @returns Clima del día procesado para la UI
 * @throws Error si la red falla o la API responde con error
 */
export async function getWeatherForVenue(
  latitude: number,
  longitude: number,
  date: string,
  timezone: string,
  timeLocal = '12:00',
): Promise<DayWeather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: DAILY_VARS,
    hourly: 'relative_humidity_2m',
    timezone,
    start_date: date,
    end_date: date,
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    // Open-Meteo devuelve {"error": true, "reason": "..."} en errores 400.
    // El caso más común: la fecha está fuera del horizonte de pronóstico
    // (~16 días). Ej.: el 10 de junio, los partidos del 27 aún no tienen
    // pronóstico disponible.
    let reason = '';
    try {
      const body: { error?: boolean; reason?: string } = await response.json();
      reason = body.reason ?? '';
    } catch {
      /* cuerpo no-JSON: usamos el mensaje genérico */
    }

    if (reason.toLowerCase().includes('out of allowed range')) {
      throw new Error(
        `El pronóstico para el ${date} aún no está disponible: ` +
          'Open-Meteo publica hasta 16 días hacia adelante. ' +
          'Vuelve a consultar más cerca de la fecha del partido.',
      );
    }

    throw new Error(
      `Open-Meteo respondió ${response.status} ${response.statusText}` +
        (reason ? ` — ${reason}` : ''),
    );
  }

  const data: OpenMeteoResponse = await response.json();

  if (!data.daily || data.daily.time.length === 0) {
    throw new Error(`Open-Meteo no devolvió datos para la fecha ${date}`);
  }

  // La respuesta es un arreglo por día; pedimos un solo día → índice 0
  return {
    date: data.daily.time[0],
    tempMax: data.daily.temperature_2m_max[0],
    tempMin: data.daily.temperature_2m_min[0],
    rainProbability: data.daily.precipitation_probability_max[0] ?? 0,
    windMax: data.daily.windspeed_10m_max[0],
    weatherCode: data.daily.weathercode[0],
    humidity: extractHumidityAtHour(data, timeLocal),
  };
}

/**
 * Toma la humedad relativa de la hora del partido del arreglo horario.
 * Las horas vienen como "2026-06-11T13:00" en la zona de la sede.
 */
function extractHumidityAtHour(
  data: OpenMeteoResponse,
  timeLocal: string,
): number | null {
  if (!data.hourly) return null;
  const hour = timeLocal.slice(0, 2); // "13:00" → "13"
  const idx = data.hourly.time.findIndex((t) => t.slice(11, 13) === hour);
  if (idx === -1) return null;
  return data.hourly.relative_humidity_2m[idx] ?? null;
}

/**
 * Traduce un código WMO de Open-Meteo a una condición legible en español.
 * Tabla de códigos: https://open-meteo.com/en/docs (WMO Weather codes)
 */
export function describeWeatherCode(code: number): string {
  if (code === 0) return 'Despejado';
  if (code <= 2) return 'Mayormente despejado';
  if (code === 3) return 'Nublado';
  if (code <= 48) return 'Niebla';
  if (code <= 57) return 'Llovizna';
  if (code <= 67) return 'Lluvia';
  if (code <= 77) return 'Nieve';
  if (code <= 82) return 'Chubascos';
  if (code <= 86) return 'Chubascos de nieve';
  return 'Tormenta eléctrica';
}

/**
 * US-15 — Recomendación contextual generada en el frontend.
 * Reglas de la sección 4.3 del PDF, evaluadas de la más severa
 * a la más leve (un pronóstico puede cumplir varias):
 *
 *  1. "Condiciones adversas"        — lluvia ≥ 70% Y viento > 40 km/h
 *  2. "Posible lluvia"              — lluvia ≥ 40%
 *  3. "Temperatura alta"            — temp máx ≥ 30 °C
 *  4. "Clima favorable"             — sin lluvia (< 40%) y temp < 30 °C
 */
export function getRecommendation(w: DayWeather): WeatherRecommendation {
  if (w.rainProbability >= 70 && w.windMax > 40) {
    return {
      level: 'adverso',
      message: 'Condiciones adversas — lluvia intensa y viento fuerte',
    };
  }
  if (w.rainProbability >= 40) {
    return {
      level: 'lluvia',
      message: 'Posible lluvia durante el partido',
    };
  }
  if (w.tempMax >= 30) {
    return {
      level: 'calor',
      message: 'Temperatura alta — condiciones exigentes',
    };
  }
  return {
    level: 'favorable',
    message: 'Clima favorable para el partido',
  };
}

/**
 * Ícono visual representativo de la condición (sección 4.3).
 * Mapeo de códigos WMO a emoji: simple, sin dependencias extra.
 */
export function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}
