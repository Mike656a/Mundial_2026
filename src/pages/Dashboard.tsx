// ============================================================
// US-08 — Página Dashboard: listado completo de partidos
// Los 72 partidos de fase de grupos agrupados por jornada, en
// tarjetas (MatchCard) con fecha, hora local, grupo, sede,
// equipos y estado dinámico.
// Los filtros (US-10) y la búsqueda (US-18) se montarán encima
// de esta misma página.
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import matchesData from '../data/matches.json';
import MatchCard from '../components/MatchCard';
import { formatDateEs } from '../utils/time';
import type { Match } from '../types';

const matches = matchesData as Match[];

export default function Dashboard() {
  // "Ahora" compartido por todas las tarjetas; se refresca cada minuto
  // para que los estados Próximo / En curso / Finalizado cambien solos
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Agrupar por fecha preservando el orden cronológico del JSON
  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of matches) {
      const list = map.get(match.date) ?? [];
      list.push(match);
      map.set(match.date, list);
    }
    return Array.from(map.entries());
  }, []);

  const venues = useMemo(
    () => new Set(matches.map((m) => m.venueName)).size,
    [],
  );

  return (
    <main className="fc-grid-bg min-h-screen pb-16">
      <header className="border-b border-gold-500/40 bg-gradient-to-r from-pitch-950 via-pitch-600/40 to-pitch-950 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Fase de grupos · 11 — 27 de junio
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-wide text-slate-100 sm:text-5xl">
            Mundial <span className="text-gold-400">2026</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Clima, sedes y países de los 72 partidos en Estados Unidos, México
            y Canadá
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Stat value={matches.length} label="Partidos" />
            <Stat value={12} label="Grupos" />
            <Stat value={48} label="Selecciones" />
            <Stat value={venues} label="Estadios" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {byDate.map(([date, dayMatches]) => (
          <section key={date} className="mt-10" aria-label={formatDateEs(date)}>
            <div className="flex items-center gap-4">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-gold-300">
                {formatDateEs(date)}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gold-500/50 to-transparent" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                {dayMatches.length} partido{dayMatches.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dayMatches.map((match) => (
                <MatchCard key={match.matchId} match={match} now={now} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-gold-500/30 bg-pitch-800/80 px-5 py-3 text-center">
      <p className="font-display text-2xl font-bold leading-none text-gold-300">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
    </div>
  );
}
