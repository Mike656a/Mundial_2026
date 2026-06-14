import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import matchesData from '../data/matches.json';
import MatchCard from '../components/MatchCard';
import { formatDateEs } from '../utils/time';
import type { Match } from '../types';

const matches = matchesData as Match[];

const GROUPS = Array.from(new Set(matches.map((m) => m.group))).sort();
const VENUES = Array.from(new Set(matches.map((m) => m.venueName))).sort();
const DATES = Array.from(new Set(matches.map((m) => m.date))).sort();
const TEAMS = Array.from(
  new Map(
    matches.flatMap((m) => [
      [m.teamA, m.teamAName] as const,
      [m.teamB, m.teamBName] as const,
    ]),
  ).entries(),
).sort((a, b) => a[1].localeCompare(b[1], 'es'));

export default function Dashboard() {
  const navigate = useNavigate();

  // "Ahora" compartido por todas las tarjetas; se refresca cada minuto
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ===== US-10: estado de los filtros =====
  const [group, setGroup] = useState('');
  const [venue, setVenue] = useState('');
  const [team, setTeam] = useState('');
  const [date, setDate] = useState('');

  const hasFilters = Boolean(group || venue || team || date);

  const filtered = useMemo(
    () =>
      matches.filter(
        (m) =>
          (!group || m.group === group) &&
          (!venue || m.venueName === venue) &&
          (!team || m.teamA === team || m.teamB === team) &&
          (!date || m.date === date),
      ),
    [group, venue, team, date],
  );

  // Agrupar resultados por fecha preservando orden cronológico
  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of filtered) {
      const list = map.get(match.date) ?? [];
      list.push(match);
      map.set(match.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <main className="fc-grid-bg min-h-screen pb-16">
      {/* ===== Encabezado FC26 ===== */}
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
            <Stat value={GROUPS.length} label="Grupos" />
            <Stat value={TEAMS.length} label="Selecciones" />
            <Stat value={VENUES.length} label="Estadios" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* ===== US-10: barra de filtros ===== */}
        <section
          aria-label="Filtros del listado"
          className="sticky top-0 z-10 -mx-4 mt-0 border-b border-slate-700/60 bg-pitch-950/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8"
        >
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <FilterSelect
              label="Grupo"
              value={group}
              onChange={setGroup}
              options={GROUPS.map((g): [string, string] => [g, `Grupo ${g}`])}
            />
            <FilterSelect
              label="Sede"
              value={venue}
              onChange={setVenue}
              options={VENUES.map((v): [string, string] => [v, v])}
            />
            <FilterSelect
              label="Equipo"
              value={team}
              onChange={setTeam}
              options={TEAMS.map(([code, name]): [string, string] => [code, name])}
            />
            <FilterSelect
              label="Fecha"
              value={date}
              onChange={setDate}
              options={DATES.map((d): [string, string] => [d, formatDateEs(d)])}
            />
            <div className="flex items-end">
              <button
                type="button"
                disabled={!hasFilters}
                onClick={() => {
                  setGroup('');
                  setVenue('');
                  setTeam('');
                  setDate('');
                }}
                className="h-10 w-full rounded-md border border-gold-500/40 px-3 text-sm font-medium
                           uppercase tracking-wide text-gold-300 transition-colors
                           hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Limpiar
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400" role="status">
            Mostrando{' '}
            <span className="font-semibold text-gold-300">{filtered.length}</span>{' '}
            de {matches.length} partidos
          </p>
        </section>

        {/* ===== Listado por jornada ===== */}
        {filtered.length === 0 && (
          <div className="mt-16 rounded-lg border border-slate-700/60 bg-pitch-800 p-10 text-center">
            <p className="font-display text-xl font-semibold uppercase text-slate-300">
              Sin resultados
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ninguna combinación de filtros coincide. Prueba quitar alguno con
              el botón Limpiar.
            </p>
          </div>
        )}

        {byDate.map(([dateKey, dayMatches]) => (
          <section key={dateKey} className="mt-10" aria-label={formatDateEs(dateKey)}>
            <div className="flex items-center gap-4">
              <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-gold-300">
                {formatDateEs(dateKey)}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-gold-500/50 to-transparent" />
              <span className="text-xs uppercase tracking-wider text-slate-500">
                {dayMatches.length} partido{dayMatches.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dayMatches.map((match) => (
                <MatchCard
                  key={match.matchId}
                  match={match}
                  now={now}
                  onSelect={(m) => navigate(`/partido/${m.matchId}`)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<readonly [string, string]>;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border border-slate-700 bg-pitch-800 px-2 text-sm normal-case
                   tracking-normal text-slate-200 focus:border-gold-500/60 focus:outline-none"
      >
        <option value="">Todos</option>
        {options.map(([val, text]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </label>
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
