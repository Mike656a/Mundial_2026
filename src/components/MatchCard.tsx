// ============================================================
// Tarjeta de partido del listado
// Jornada · Grupo · Estado · Equipo A vs Equipo B (banderas) ·
// hora local + hora Guatemala · sede (estadio real + ciudad).
// Banderas vía flagcdn (CDN estático): 0 llamadas a la API.
// ============================================================

import type { Match, MatchStatus } from '../types';
import { getMatchStatus, getGuatemalaTime, STATUS_LABELS } from '../utils/time';
import { getVenue, formatCapacity } from '../data/venues';
import type { Jornada } from '../utils/jornada';
import Flag from './Flag';

interface MatchCardProps {
  match: Match;
  /** Instante "ahora" compartido por todo el listado (se actualiza c/60 s) */
  now: Date;
  /** Jornada derivada (1 · 2 · 3) */
  jornada?: Jornada;
  /** Navegación al detalle del partido */
  onSelect?: (match: Match) => void;
}

const STATUS_STYLES: Record<MatchStatus, string> = {
  proximo: 'border-gold-500/40 text-gold-300 bg-gold-500/5',
  'en-curso': 'border-emerald-400/60 text-emerald-300 bg-emerald-500/10 animate-pulse',
  finalizado: 'border-slate-600/60 text-slate-500 bg-slate-700/20',
};

export default function MatchCard({ match, now, jornada, onSelect }: MatchCardProps) {
  const status = getMatchStatus(match, now);
  const gt = getGuatemalaTime(match);
  const venue = getVenue(match.venueName);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(match)}
      className="group flex w-full flex-col rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left
                 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-500/50
                 hover:bg-white/[0.04] hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-gold-500/50"
      aria-label={`Ver detalle: ${match.teamAName} contra ${match.teamBName}, grupo ${match.group}`}
    >
      {/* Fila superior: jornada + grupo + estado */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-500">
          {jornada && (
            <span className="rounded bg-gold-500/10 px-1.5 py-0.5 text-gold-300">
              J{jornada}
            </span>
          )}
          Grupo {match.group}
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      {/* Equipos con banderas */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <Team code={match.teamA} name={match.teamAName} align="left" />
        <span className="font-display text-xs font-bold text-slate-600 group-hover:text-gold-400">
          VS
        </span>
        <Team code={match.teamB} name={match.teamBName} align="right" />
      </div>

      {/* Horarios */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/5 pt-3 text-xs text-slate-400">
        <span className="text-gold-400/90">
          {match.timeLocal} <span className="text-slate-600">local</span>
        </span>
        <span className="text-emerald-300/90">
          {gt.time}
          {gt.dayShift} <span className="text-slate-600">GT</span>
        </span>
      </div>

      {/* Sede / estadio */}
      <div className="mt-2 flex items-start gap-2 text-xs text-slate-400">
        <svg
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500/70"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span className="min-w-0">
          <span className="block truncate text-slate-300">
            {match.venueName}
          </span>
          <span className="block truncate text-slate-500">
            {match.city}
            {venue && ` · ${formatCapacity(venue.capacity)} asientos`}
          </span>
        </span>
      </div>
    </button>
  );
}

function Team({
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
      className={`flex min-w-0 flex-1 items-center gap-2.5 ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <Flag code={code} name={name} />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-semibold uppercase leading-tight tracking-wide text-slate-100 sm:text-lg">
          {name}
        </p>
        <p className="text-[10px] font-medium tracking-[0.25em] text-slate-500">
          {code}
        </p>
      </div>
    </div>
  );
}
