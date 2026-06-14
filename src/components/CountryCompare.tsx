// ============================================================
// US-17 — Comparador de países
// Vista comparativa lado a lado de los dos equipos del partido:
// población, región, idiomas, moneda y zona horaria, más la
// diferencia de población en valor absoluto y porcentaje.
// ============================================================

import { useCountry } from '../hooks/useCountry';
import Flag from './Flag';
import type { Match } from '../types';

export default function CountryCompare({ match }: { match: Match }) {
  const a = useCountry(match.teamA);
  const b = useCountry(match.teamB);

  const loading = a.isLoading || b.isLoading;
  const failed = a.isError || b.isError;

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border border-slate-700/60 bg-pitch-800 p-6">
        <div className="h-5 w-1/3 rounded bg-slate-700/50" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-slate-700/30" />
          ))}
        </div>
      </div>
    );
  }

  if (failed || !a.data || !b.data) {
    return (
      <div className="rounded-lg border border-red-500/40 bg-pitch-800 p-6 text-sm text-slate-400">
        No se pudo cargar la comparación: faltan datos de algún país.
      </div>
    );
  }

  const ca = a.data;
  const cb = b.data;

  // Diferencia de población (US-17): absoluta y relativa al país menor
  const diff = Math.abs(ca.population - cb.population);
  const menor = Math.min(ca.population, cb.population);
  const mayor = ca.population >= cb.population ? ca : cb;
  const pct = menor > 0 ? (diff / menor) * 100 : 0;

  const rows: Array<{ label: string; a: string; b: string }> = [
    {
      label: 'Población',
      a: ca.population.toLocaleString('es-GT'),
      b: cb.population.toLocaleString('es-GT'),
    },
    { label: 'Región', a: ca.region, b: cb.region },
    {
      label: 'Idiomas',
      a: ca.languages.join(', ') || '—',
      b: cb.languages.join(', ') || '—',
    },
    {
      label: 'Moneda',
      a: ca.currencies.join(' · ') || '—',
      b: cb.currencies.join(' · ') || '—',
    },
    {
      label: 'Zona horaria',
      a: ca.timezones.slice(0, 2).join(', ') || '—',
      b: cb.timezones.slice(0, 2).join(', ') || '—',
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gold-500/30 bg-pitch-800">
      {/* Encabezado: las dos selecciones */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-slate-700/50 bg-pitch-700/40 p-4">
        <CompareHead code={ca.code} name={ca.commonName} align="left" />
        <span className="font-display text-sm font-bold text-gold-400">VS</span>
        <CompareHead code={cb.code} name={cb.commonName} align="right" />
      </div>

      {/* Filas comparativas */}
      <dl className="divide-y divide-slate-700/40">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 text-sm"
          >
            <dd className="text-left text-slate-200">{row.a}</dd>
            <dt className="text-center text-[10px] uppercase tracking-widest text-slate-500">
              {row.label}
            </dt>
            <dd className="text-right text-slate-200">{row.b}</dd>
          </div>
        ))}
      </dl>

      {/* Diferencia de población destacada */}
      <div className="border-t border-gold-500/20 bg-pitch-700/30 px-4 py-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-slate-500">
          Diferencia de población
        </p>
        <p className="mt-1 font-display text-2xl font-bold text-gold-300">
          {diff.toLocaleString('es-GT')}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {mayor.commonName} tiene {pct.toFixed(1)}% más habitantes
        </p>
      </div>
    </div>
  );
}

function CompareHead({
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
      className={`flex items-center gap-2 ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      <Flag code={code} name={name} />
      <span className="font-display text-base font-semibold uppercase tracking-wide text-slate-100">
        {name}
      </span>
    </div>
  );
}
