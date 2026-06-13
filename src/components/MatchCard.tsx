// ============================================================
// MatchCard.tsx — Tarjeta de partido del listado principal (US-08)
// Columnas requeridas: Fecha · Hora local · Grupo · Sede ·
// Equipo A vs Equipo B · Estado (dinámico, US-09)
// ============================================================

import type { Match, MatchStatus } from '../types';
import { getMatchStatus, STATUS_LABELS } from '../utils/time';

interface MatchCardProps {
  match: Match;
  /** Instante "ahora" compartido por todo el listado (se actualiza c/60 s) */
  now: Date;
  /** Navegación al detalle (US-13) — opcional por ahora */
  onSelect?: (match: Match) => void;
}

const STATUS_STYLES: Record<MatchStatus, string> = {
  'proximo': 'border-gold-500/50 text-gold-300',
  'en-curso': 'border-emerald-400/60 text-emerald-300 animate-pulse',
  'finalizado': 'border-slate-600 text-slate-500',
};

export default function MatchCard({ match, now, onSelect }: MatchCardProps) {
  const status = getMatchStatus(match, now);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className="group w-full rounded-lg border border-slate-700/60 bg-pitch-800 p-4 text-left
                 transition-all duration-150 hover:border-gold-500/60 hover:bg-pitch-700
                 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
      aria-label={`${match.teamAName} contra ${match.teamBName}, grupo ${match.group}, ${match.date}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-gold-500">
          Grupo {match.group}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <TeamName code={match.teamA} name={match.teamAName} align="left" />
        <span className="font-display text-sm font-bold text-slate-500 group-hover:text-gold-400">
          VS
        </span>
        <TeamName code={match.teamB} name={match.teamBName} align="right" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-700/50 pt-3 text-xs text-slate-400">
        <span>{match.date}</span>
        <span className="text-gold-400/80">
          {match.timeLocal} <span className="text-slate-500">hora local</span>
        </span>
        <span className="truncate">
          {match.venueName} · {match.city}
        </span>
      </div>
    </button>
  );
}

function TeamName({
  code,
  name,
  align,
}: {
  code: string;
  name: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col ${
        align === 'right' ? 'items-end text-right' : 'items-start'
      }`}
    >
      <span className="font-display text-base font-semibold uppercase leading-tight tracking-wide text-slate-100 sm:text-lg">
        {name}
      </span>
      <span className="text-[11px] font-medium tracking-[0.25em] text-slate-500">
        {code}
      </span>
    </div>
  );
}
