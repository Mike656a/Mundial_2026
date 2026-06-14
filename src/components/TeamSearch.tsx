// ============================================================
// US-18 — Búsqueda por equipo
// Campo de búsqueda que filtra las 48 selecciones por nombre.
// Al elegir una, muestra su ficha de país (REST Countries) y
// todos sus partidos de fase de grupos con sede, fecha, hora y
// un resumen de clima (Open-Meteo) por encuentro.
// ============================================================

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import matchesData from '../data/matches.json';
import CountryCard from './CountryCard';
import { useWeather } from '../hooks/useWeather';
import { describeWeatherCode } from '../services/weather.service';
import Flag from './Flag';
import { getGuatemalaTime } from '../utils/time';
import type { Match } from '../types';

const matches = matchesData as Match[];

// Catálogo de selecciones { código → nombre } a partir del JSON
const TEAMS = Array.from(
  new Map(
    matches.flatMap((m) => [
      [m.teamA, m.teamAName] as const,
      [m.teamB, m.teamBName] as const,
    ]),
  ).entries(),
).sort((a, b) => a[1].localeCompare(b[1], 'es'));

export default function TeamSearch() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<{ code: string; name: string } | null>(
    null,
  );

  // Sugerencias: coinciden por nombre o por código (ignora acentos)
  const suggestions = useMemo(() => {
    const q = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    if (!q) return [];
    return TEAMS.filter(
      ([code, name]) =>
        name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .includes(q) || code.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [query]);

  const teamMatches = useMemo(
    () =>
      selected
        ? matches.filter(
            (m) => m.teamA === selected.code || m.teamB === selected.code,
          )
        : [],
    [selected],
  );

  return (
    <section
      aria-label="Búsqueda por equipo"
      className="rounded-lg border border-gold-500/30 bg-pitch-800/60 p-4"
    >
      <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-gold-300">
        Búsqueda por equipo
      </h2>

      {/* Campo + sugerencias */}
      <div className="relative mt-3">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
          placeholder="Escribe un país: México, Brasil, FRA…"
          className="w-full rounded-md border border-slate-700 bg-pitch-900 px-3 py-2 text-sm
                     text-slate-200 placeholder:text-slate-600 focus:border-gold-500/60 focus:outline-none"
        />

        {suggestions.length > 0 && !selected && (
          <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-md border border-slate-700 bg-pitch-900 shadow-xl">
            {suggestions.map(([code, name]) => (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected({ code, name });
                    setQuery(name);
                  }}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm
                             text-slate-200 hover:bg-pitch-700"
                >
                  <Flag
                    code={code}
                    name={name}
                    className="h-5 w-7 rounded-sm object-cover ring-1 ring-slate-600/60"
                  />
                  {name}
                  <span className="ml-auto text-[11px] tracking-widest text-slate-500">
                    {code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Resultado: ficha + partidos del equipo */}
      {selected && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <CountryCard code={selected.code} teamName={selected.name} />

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-300">
              Partidos de {selected.name} en fase de grupos
            </h3>
            <div className="mt-3 space-y-2">
              {teamMatches.map((m) => (
                <TeamMatchRow key={m.matchId} match={m} teamCode={selected.code} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** Fila de partido con resumen de clima (US-18) */
function TeamMatchRow({ match, teamCode }: { match: Match; teamCode: string }) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useWeather(match);
  const gt = getGuatemalaTime(match);

  // El rival es el equipo del partido que no es el buscado
  const rivalName =
    match.teamA === teamCode ? match.teamBName : match.teamAName;

  return (
    <button
      type="button"
      onClick={() => navigate(`/partido/${match.matchId}`)}
      className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-slate-700/60
                 bg-pitch-900/60 px-3 py-2 text-left text-sm transition hover:border-gold-500/50"
    >
      <span className="font-display font-semibold uppercase tracking-wide text-slate-100">
        vs {rivalName}
      </span>
      <span className="text-[11px] uppercase tracking-wider text-gold-500">
        Grupo {match.group}
      </span>
      <span className="text-slate-400">
        {match.date} · {match.timeLocal} local · {gt.time} GT
      </span>
      <span className="text-slate-500">{match.city}</span>

      {/* Resumen de clima */}
      <span className="ml-auto text-xs">
        {isLoading && <span className="text-slate-600">clima…</span>}
        {isError && <span className="text-slate-600">clima n/d</span>}
        {data && (
          <span className="text-gold-300">
            {Math.round(data.tempMax)}° · {describeWeatherCode(data.weatherCode)}
          </span>
        )}
      </span>
    </button>
  );
}
