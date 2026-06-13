// ============================================================
// Utilidades de fecha/hora del sistema
// - Conversión de hora local de la sede → instante UTC real
// - Estado dinámico del partido (US-09)
// - Formato de fechas en español y hora de Guatemala (US-11)
// ============================================================

import type { Match, MatchStatus } from '../types';

/** Duración estimada de un partido: 90' + descanso + adición ≈ 2 horas */
const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

/**
 * Convierte una hora "de pared" en una zona horaria IANA al instante
 * UTC real. JavaScript no trae esto nativo, así que usamos la técnica
 * de dos pasadas con Intl.DateTimeFormat:
 *
 * 1. Interpretamos la fecha/hora como si fuera UTC (suposición inicial).
 * 2. Preguntamos qué hora de pared marca ese instante en la zona destino.
 * 3. La diferencia entre ambas es el offset → lo restamos.
 */
export function zonedTimeToUtc(
  dateISO: string, // "2026-06-11"
  timeHM: string, // "13:00"
  timeZone: string, // "America/Mexico_City"
): Date {
  const guess = new Date(`${dateISO}T${timeHM}:00Z`);

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(guess).map((p) => [p.type, p.value]),
  );

  const wallClockAtGuess = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24, // Intl puede devolver "24" a medianoche
    Number(parts.minute),
    Number(parts.second),
  );

  const offsetMs = wallClockAtGuess - guess.getTime();
  return new Date(guess.getTime() - offsetMs);
}

/** Instante UTC de inicio del partido */
export function getKickoffUtc(match: Match): Date {
  return zonedTimeToUtc(match.date, match.timeLocal, match.timezone);
}

/**
 * US-09 — Estado dinámico según la fecha/hora actual:
 * Próximo · En curso · Finalizado
 */
export function getMatchStatus(match: Match, now: Date = new Date()): MatchStatus {
  const kickoff = getKickoffUtc(match).getTime();
  const end = kickoff + MATCH_DURATION_MS;
  const t = now.getTime();

  if (t < kickoff) return 'proximo';
  if (t < end) return 'en-curso';
  return 'finalizado';
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  'proximo': 'Próximo',
  'en-curso': 'En curso',
  'finalizado': 'Finalizado',
};

/**
 * US-11 — Hora del partido convertida a la zona de Guatemala (UTC-6).
 * Devuelve "11:00" y, si el día cambia respecto a la sede, lo indica.
 */
export function getGuatemalaTime(match: Match): { time: string; dayShift: string } {
  const kickoff = getKickoffUtc(match);

  const formatter = new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const gtDate = dateFormatter.format(kickoff); // "2026-06-11"
  const dayShift =
    gtDate === match.date ? '' : gtDate > match.date ? ' (+1 día)' : ' (−1 día)';

  return { time: formatter.format(kickoff), dayShift };
}

/** Fecha en español para encabezados: "Jueves 11 de junio" */
export function formatDateEs(dateISO: string): string {
  // T12:00 evita que la zona horaria del navegador corra el día
  const date = new Date(`${dateISO}T12:00:00`);
  const text = new Intl.DateTimeFormat('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
