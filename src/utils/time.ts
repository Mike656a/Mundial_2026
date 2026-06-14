import type { Match, MatchStatus } from '../types';

const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function zonedTimeToUtc(
  dateISO: string,
  timeHM: string,
  timeZone: string,
): Date {
  const naive = new Date(`${dateISO}T${timeHM}:00Z`);

  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const p = Object.fromEntries(fmt.formatToParts(naive).map(x => [x.type, x.value]));
  const localAtNaive = Date.UTC(
    +p.year, +p.month - 1, +p.day,
    +p.hour % 24, +p.minute, +p.second,
  );

  const offsetMs = localAtNaive - naive.getTime();
  return new Date(naive.getTime() - offsetMs);
}

export function getKickoffUtc(match: Match): Date {
  return zonedTimeToUtc(match.date, match.timeLocal, match.timezone);
}

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

export function getGuatemalaTime(match: Match): { time: string; dayShift: string } {
  const kickoff = getKickoffUtc(match);

  const timeFmt = new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });

  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Guatemala',
    year: 'numeric', month: '2-digit', day: '2-digit',
  });

  const gtDate = dateFmt.format(kickoff);
  const dayShift = gtDate === match.date ? '' : gtDate > match.date ? ' (+1)' : ' (−1)';

  return { time: timeFmt.format(kickoff), dayShift };
}

export function formatDateEs(dateISO: string): string {
  const date = new Date(`${dateISO}T12:00:00`);
  const text = new Intl.DateTimeFormat('es-GT', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(date);
  return text.charAt(0).toUpperCase() + text.slice(1);
}