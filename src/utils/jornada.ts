// ============================================================
// Jornadas (matchdays) de la fase de grupos
// El JSON no trae el número de jornada, así que lo derivamos:
// dentro de cada grupo, los partidos se ordenan cronológicamente
// y se reparten en 3 jornadas (2 partidos por jornada y grupo).
//   Jornada 1 → 24 partidos · Jornada 2 → 24 · Jornada 3 → 24
// El resultado se memoiza en un mapa matchId → jornada.
// ============================================================

import type { Match } from '../types';

export type Jornada = 1 | 2 | 3;

/** matchId → número de jornada (1, 2 o 3) */
export function buildJornadaMap(matches: Match[]): Map<number, Jornada> {
  const byGroup = new Map<string, Match[]>();
  for (const m of matches) {
    const list = byGroup.get(m.group) ?? [];
    list.push(m);
    byGroup.set(m.group, list);
  }

  const map = new Map<number, Jornada>();
  for (const list of byGroup.values()) {
    list
      .slice()
      .sort((a, b) =>
        a.date === b.date
          ? a.timeLocal.localeCompare(b.timeLocal)
          : a.date.localeCompare(b.date),
      )
      .forEach((m, i) => {
        // 0,1 → J1 · 2,3 → J2 · 4,5 → J3
        map.set(m.matchId, (Math.floor(i / 2) + 1) as Jornada);
      });
  }
  return map;
}

/** Rango de fechas legible de una jornada (p. ej. "11 — 13 jun"). */
export function jornadaDateRange(
  matches: Match[],
  jornadaMap: Map<number, Jornada>,
  jornada: Jornada,
): string {
  const dates = matches
    .filter((m) => jornadaMap.get(m.matchId) === jornada)
    .map((m) => m.date)
    .sort();
  if (dates.length === 0) return '';
  const fmt = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return new Intl.DateTimeFormat('es-GT', { day: 'numeric', month: 'short' })
      .format(d)
      .replace('.', '');
  };
  const first = dates[0];
  const last = dates[dates.length - 1];
  return first === last ? fmt(first) : `${fmt(first)} — ${fmt(last)}`;
}
