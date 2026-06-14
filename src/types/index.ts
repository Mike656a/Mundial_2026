// ============================================================
// Tipos del sistema — Dashboard Mundial 2026
// ============================================================

/** Un partido de la fase de grupos (Anexo A del proyecto) */
export interface Match {
  matchId: number;
  phase: 'group';
  group: string;
  date: string;        // ISO 8601: "2026-06-11"
  timeLocal: string;   // HH:MM hora local de la sede
  timezone: string;    // IANA, ej. "America/Chicago"
  venueName: string;
  city: string;
  country: 'US' | 'MX' | 'CA';
  latitude: number;
  longitude: number;
  teamA: string;       // ISO-3166-1 alfa-3 (o código FIFA: ENG, SCO)
  teamB: string;
  teamAName: string;
  teamBName: string;
}

/** Estado dinámico del partido según fecha/hora actual */
export type MatchStatus = 'proximo' | 'en-curso' | 'finalizado';

// ------------------------------------------------------------
// Open-Meteo
// ------------------------------------------------------------

/** Respuesta cruda de Open-Meteo (solo los campos que usamos) */
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    windspeed_10m_max: number[];
    weathercode: number[];
  };
  daily_units: {
    temperature_2m_max: string;
    windspeed_10m_max: string;
  };
  hourly?: {
    time: string[];
    relative_humidity_2m: number[];
  };
}

/** Clima del día del partido, ya procesado para la UI */
export interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number;   // %
  windMax: number;           // km/h
  weatherCode: number;       // código WMO
  humidity: number | null;   // % a la hora del partido (variable horaria)
}

/** US-15 — Recomendación contextual generada en el frontend */
export interface WeatherRecommendation {
  level: 'favorable' | 'calor' | 'lluvia' | 'adverso';
  message: string;
}

// ------------------------------------------------------------
// REST Countries
// ------------------------------------------------------------

/** Respuesta cruda de REST Countries v3.1 (campos filtrados) */
export interface RestCountryResponse {
  name: {
    common: string;
    official: string;
    nativeName?: Record<string, { official: string; common: string }>;
  };
  cca3: string;
  flags: { svg: string; png: string; alt?: string };
  capital?: string[];
  region: string;
  subregion?: string;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol?: string }>;
  population: number;
  timezones: string[];
}

/** Ficha de país procesada para la UI */
export interface CountryInfo {
  code: string;
  commonName: string;
  officialName: string;
  flagSvg: string;
  flagAlt: string;
  capital: string;
  region: string;
  languages: string[];
  currencies: string[];
  population: number;
  timezones: string[];
}
