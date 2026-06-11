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
