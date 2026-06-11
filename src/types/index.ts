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
}

/** Clima del día del partido, ya procesado para la UI */
export interface DayWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  rainProbability: number; // %
  windMax: number;         // km/h
  weatherCode: number;     // código WMO
}