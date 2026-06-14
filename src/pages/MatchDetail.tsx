// ============================================================
// MatchDetail.tsx — Vista de detalle del partido (US-13 a US-16)
// Datos de la sede (estadio, ciudad, coordenadas), hora local y
// hora de Guatemala (UTC-6), panel de clima con recomendación
// contextual, fichas de ambos países con bandera y alineaciones
// probables. El comparador (US-17) se montará sobre esta página.
// ============================================================

import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import matchesData from '../data/matches.json';
import CountryCard from '../components/CountryCard';
import LineupPanel from '../components/LineupPanel';
import WeatherPanel from '../components/WeatherPanel';
import { getFlagUrl } from '../utils/flags';
import {
  getMatchStatus,
  getGuatemalaTime,
  formatDateEs,
  STATUS_LABELS,
} from '../utils/time';
import type { Match } from '../types';

const matches = matchesData as Match[];

export default function MatchDetail() {
  const { matchId } = useParams();
  const match = matches.find((m) => m.matchId === Number(matchId));

  if (!match) {
    return (
      <main className="fc-grid-bg flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Partido no encontrado.</p>
        <Link
          to="/"
          className="rounded border border-gold-500/50 px-4 py-2 text-sm uppercase tracking-wide text-gold-300 hover:bg-gold-500/10"
        >
          ← Volver al dashboard
        </Link>
      </main>
    );
  }

  const status = getMatchStatus(match);
  const gt = getGuatemalaTime(match);

  return (
    <main className="fc-grid-bg min-h-screen pb-16">
      {/* ===== Encabezado del partido ===== */}
      <header className="border-b border-gold-500/40 bg-gradient-to-r from-pitch-950 via-pitch-600/40 to-pitch-950 px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="text-xs uppercase tracking-wider text-slate-400 transition hover:text-gold-300"
          >
            ← Volver al dashboard
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-gold-500">
              Grupo {match.group} · Partido {match.matchId}
            </span>
            <span className="rounded-full border border-gold-500/50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gold-300">
              {STATUS_LABELS[status]}
            </span>
          </div>

          {/* Marcador visual: bandera grande + VS */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <BigTeam code={match.teamA} name={match.teamAName} align="left" />
            <span className="font-display text-2xl font-bold text-gold-400 sm:text-3xl">
              VS
            </span>
            <BigTeam code={match.teamB} name={match.teamBName} align="right" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-10 px-4 pt-8 sm:px-8">
        {/* ===== Datos de la sede y horarios (US-13) ===== */}
        <section className="grid gap-4 sm:grid-cols-3">
          <InfoCard label="Sede">
            <p className="font-display text-lg font-semibold uppercase text-slate-100">
              {match.venueName}
            </p>
            <p className="text-sm text-slate-400">
              {match.city} ({match.country})
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {match.latitude.toFixed(4)}, {match.longitude.toFixed(4)}
            </p>
          </InfoCard>

          <InfoCard label="Hora local de la sede">
            <p className="font-display text-2xl font-bold text-gold-300">
              {match.timeLocal}
            </p>
            <p className="text-sm text-slate-400">{formatDateEs(match.date)}</p>
            <p className="mt-1 text-xs text-slate-500">{match.timezone}</p>
          </InfoCard>

          <InfoCard label="Hora de Guatemala (UTC-6)">
            <p className="font-display text-2xl font-bold text-emerald-300">
              {gt.time}
              <span className="text-sm">{gt.dayShift}</span>
            </p>
            <p className="text-sm text-slate-400">America/Guatemala</p>
          </InfoCard>
        </section>

        {/* ===== Panel de clima de la sede (US-14 + US-15) ===== */}
        <section>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-slate-200">
            <span className="text-gold-500">/</span> Clima de la sede
            <span className="ml-2 text-xs font-normal normal-case tracking-normal text-slate-500">
              Open-Meteo · {match.date}
            </span>
          </h2>
          <div className="mt-4">
            <WeatherPanel match={match} />
          </div>
        </section>

        {/* ===== Fichas de países (US-16) ===== */}
        <section>
          <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-slate-200">
            <span className="text-gold-500">/</span> Países participantes
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <CountryCard code={match.teamA} teamName={match.teamAName} />
            <CountryCard code={match.teamB} teamName={match.teamBName} />
          </div>
        </section>

        {/* ===== Alineaciones probables ===== */}
        <LineupPanel
          teamA={match.teamA}
          teamAName={match.teamAName}
          teamB={match.teamB}
          teamBName={match.teamBName}
        />
      </div>
    </main>
  );
}

function BigTeam({
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
      className={`flex min-w-0 flex-1 flex-col gap-2 ${
        align === 'right' ? 'items-end text-right' : 'items-start'
      }`}
    >
      <img
        src={getFlagUrl(code, 160)}
        alt={`Bandera de ${name}`}
        className="h-12 w-20 rounded object-cover ring-1 ring-gold-500/40 sm:h-16 sm:w-28"
      />
      <span className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-slate-100 sm:text-4xl">
        {name}
      </span>
      <span className="text-xs font-medium tracking-[0.3em] text-slate-500">
        {code}
      </span>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gold-500/30 bg-pitch-800 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
