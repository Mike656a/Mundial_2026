// ============================================================
// Dashboard — Listado de partidos de la fase de grupos
// · Pestañas por jornada (1 · 2 · 3 · Todas) con conteo
// · Filtros avanzados combinables (AND): búsqueda equipo/sede,
//   selección, grupo, sede, país anfitrión, fecha y estado
// · Resultados agrupados por fecha; cada tarjeta abre el detalle
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import matchesData from '../data/matches.json';
import MatchCard from '../components/MatchCard';
import TeamSearch from '../components/TeamSearch';
import { formatDateEs, getMatchStatus, STATUS_LABELS } from '../utils/time';
import { buildJornadaMap, jornadaDateRange, type Jornada } from '../utils/jornada';
import { countryLabel, type Country } from '../data/venues';
import type { Match, MatchStatus } from '../types';

const matches = matchesData as Match[];
const JORNADA_MAP = buildJornadaMap(matches);

const GROUPS = Array.from(new Set(matches.map((m) => m.group))).sort();
const VENUES = Array.from(new Set(matches.map((m) => m.venueName))).sort((a, b) =>
  a.localeCompare(b, 'es'),
);
const DATES = Array.from(new Set(matches.map((m) => m.date))).sort();
const HOSTS = Array.from(new Set(matches.map((m) => m.country))) as Country[];
const TEAMS = Array.from(
  new Map(
    matches.flatMap((m) => [
      [m.teamA, m.teamAName] as const,
      [m.teamB, m.teamBName] as const,
    ]),
  ).entries(),
).sort((a, b) => a[1].localeCompare(b[1], 'es'));

type JornadaTab = Jornada | 'all';
const STATUS_OPTIONS: MatchStatus[] = ['proximo', 'en-curso', 'finalizado'];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function Dashboard() {
  const navigate = useNavigate();

  // "Ahora" compartido por todas las tarjetas; se refresca cada minuto
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ===== Estado de pestaña de jornada y filtros =====
  const [tab, setTab] = useState<JornadaTab>('all');
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [group, setGroup] = useState('');
  const [venue, setVenue] = useState('');
  const [host, setHost] = useState<Country | ''>('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<MatchStatus | ''>('');

  const hasFilters = Boolean(
    search || team || group || venue || host || date || status,
  );

  // Conteo por jornada (constante)
  const jornadaCounts = useMemo(() => {
    const c: Record<JornadaTab, number> = { 1: 0, 2: 0, 3: 0, all: matches.length };
    for (const m of matches) c[JORNADA_MAP.get(m.matchId) as Jornada]++;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return matches.filter((m) => {
      if (tab !== 'all' && JORNADA_MAP.get(m.matchId) !== tab) return false;
      if (team && m.teamA !== team && m.teamB !== team) return false;
      if (group && m.group !== group) return false;
      if (venue && m.venueName !== venue) return false;
      if (host && m.country !== host) return false;
      if (date && m.date !== date) return false;
      if (status && getMatchStatus(m, now) !== status) return false;
      if (q) {
        const hay = normalize(
          `${m.teamAName} ${m.teamBName} ${m.teamA} ${m.teamB} ${m.venueName} ${m.city}`,
        );
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tab, search, team, group, venue, host, date, status, now]);

  const byDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const match of [...filtered].sort((a, b) =>
      a.date === b.date
        ? a.timeLocal.localeCompare(b.timeLocal)
        : a.date.localeCompare(b.date),
    )) {
      const list = map.get(match.date) ?? [];
      list.push(match);
      map.set(match.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const clearAll = () => {
    setSearch('');
    setTeam('');
    setGroup('');
    setVenue('');
    setHost('');
    setDate('');
    setStatus('');
  };

  return (
    <main className="fc-grid-bg min-h-screen pb-20">
      {/* ===================== HERO ===================== */}
      <header className="relative overflow-hidden border-b border-gold-500/25">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl animate-fade-up">
              <p className="eyebrow">Copa Mundial de la FIFA 2026</p>
              <h1 className="mt-3 font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-slate-50 sm:text-6xl">
                Todos los partidos.
                <br />
                Cada sede.
                <br />
                <span className="text-gold-300">El clima en contexto.</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                Explora la fase de grupos, compara selecciones y consulta
                horarios locales y condiciones meteorológicas en Canadá, México
                y Estados Unidos.
              </p>
            </div>

            {/* Sello 26 estilo FC26 */}
            <div className="relative hidden shrink-0 md:block">
              <div className="grid h-40 w-40 place-items-center rounded-3xl border border-gold-500/30 bg-gradient-to-br from-pitch-700/60 to-pitch-900 shadow-glow">
                <span className="font-display text-7xl font-bold tracking-tighter text-gold-300">
                  26
                </span>
                <span className="absolute bottom-4 font-display text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">
                  FIFA
                </span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={matches.length} label="Partidos" />
            <Stat value={TEAMS.length} label="Selecciones" />
            <Stat value={VENUES.length} label="Sedes" />
            <Stat value={GROUPS.length} label="Grupos" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* ===================== PESTAÑAS DE JORNADA ===================== */}
        <section className="mt-8" aria-label="Jornadas">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Jornadas</p>
              <p className="mt-1 text-xs text-slate-500">
                Fase de grupos · 11 al 27 de junio
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {([1, 2, 3, 'all'] as JornadaTab[]).map((j) => {
              const active = tab === j;
              const label = j === 'all' ? 'Todas' : `Jornada ${j}`;
              const sub =
                j === 'all'
                  ? '11 — 27 jun'
                  : jornadaDateRange(matches, JORNADA_MAP, j as Jornada);
              return (
                <button
                  key={String(j)}
                  type="button"
                  onClick={() => setTab(j)}
                  aria-pressed={active}
                  className={`group flex items-center gap-2 rounded-xl border px-4 py-2.5 text-left transition-all ${
                    active
                      ? 'border-gold-500/60 bg-gold-500/10 shadow-glow'
                      : 'border-white/5 bg-white/[0.02] hover:border-gold-500/30 hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex flex-col">
                    <span
                      className={`font-display text-sm font-semibold uppercase tracking-wide ${
                        active ? 'text-gold-200' : 'text-slate-200'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500">
                      {sub}
                    </span>
                  </span>
                  <span
                    className={`ml-1 rounded-md px-2 py-0.5 font-display text-xs font-bold tabular-nums ${
                      active
                        ? 'bg-gold-500/20 text-gold-200'
                        : 'bg-pitch-800 text-slate-400'
                    }`}
                  >
                    {jornadaCounts[j]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================== FILTROS AVANZADOS ===================== */}
        <section className="mt-6 glass p-5 sm:p-6" aria-label="Filtros avanzados">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-slate-100">
                Filtros avanzados
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Afina la jornada por selección, grupo, sede o fecha
              </p>
            </div>
            <button
              type="button"
              disabled={!hasFilters}
              onClick={clearAll}
              className="rounded-lg border border-gold-500/30 px-3 py-1.5 text-xs font-medium uppercase
                         tracking-wide text-gold-300 transition-colors hover:bg-gold-500/10
                         disabled:cursor-not-allowed disabled:opacity-30"
            >
              Limpiar filtros
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Búsqueda libre */}
            <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 lg:col-span-2">
              Equipo o sede
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="México, Dallas…"
                  className="h-10 w-full rounded-lg border border-white/10 bg-pitch-900/70 pl-9 pr-3 text-sm
                             font-normal normal-case tracking-normal text-slate-100 placeholder:text-slate-600
                             focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
                />
              </div>
            </label>

            <FilterSelect
              label="Selección"
              value={team}
              onChange={setTeam}
              options={TEAMS.map(([code, name]): [string, string] => [code, name])}
            />
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
              label="País anfitrión"
              value={host}
              onChange={(v) => setHost(v as Country | '')}
              options={HOSTS.map((c): [string, string] => [c, countryLabel(c)])}
            />
            <FilterSelect
              label="Fecha"
              value={date}
              onChange={setDate}
              options={DATES.map((d): [string, string] => [d, formatDateEs(d)])}
            />
            <FilterSelect
              label="Estado"
              value={status}
              onChange={(v) => setStatus(v as MatchStatus | '')}
              options={STATUS_OPTIONS.map((s): [string, string] => [
                s,
                STATUS_LABELS[s],
              ])}
            />
          </div>

          <p className="mt-4 text-xs text-slate-400" role="status">
            Mostrando{' '}
            <span className="font-semibold text-gold-300">{filtered.length}</span> de{' '}
            {matches.length} partidos
            {tab !== 'all' && (
              <span className="text-slate-500"> · Jornada {tab}</span>
            )}
          </p>
        </section>

        {/* ===================== BÚSQUEDA POR SELECCIÓN ===================== */}
        <div className="mt-6">
          <TeamSearch />
        </div>

        {/* ===================== RESULTADOS ===================== */}
        {filtered.length === 0 ? (
          <div className="mt-14 glass p-10 text-center">
            <p className="font-display text-xl font-semibold uppercase text-slate-200">
              Sin resultados
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Ninguna combinación de filtros coincide. Quita alguno con
              «Limpiar filtros».
            </p>
          </div>
        ) : (
          byDate.map(([dateKey, dayMatches]) => (
            <section
              key={dateKey}
              className="mt-10 animate-fade-up"
              aria-label={formatDateEs(dateKey)}
            >
              <div className="flex items-center gap-4">
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-gold-300 sm:text-xl">
                  {formatDateEs(dateKey)}
                </h2>
                <div className="rule-gold" />
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
                    jornada={JORNADA_MAP.get(match.matchId)}
                    onSelect={(m) => navigate(`/partido/${m.matchId}`)}
                  />
                ))}
              </div>
            </section>
          ))
        )}
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
    <label className="flex flex-col gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
      {label}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-pitch-900/70 px-3 pr-8
                     text-sm font-normal normal-case tracking-normal text-slate-100
                     focus:border-gold-500/60 focus:outline-none focus:ring-1 focus:ring-gold-500/40"
        >
          <option value="">Todas</option>
          {options.map(([val, text]) => (
            <option key={val} value={val}>
              {text}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="glass px-5 py-4 text-center">
      <p className="font-display text-3xl font-bold leading-none text-gold-300 tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-[11px] uppercase tracking-widest text-slate-400">
        {label}
      </p>
    </div>
  );
}
