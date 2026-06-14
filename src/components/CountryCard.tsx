// ============================================================
// CountryCard.tsx — Ficha informativa de país (US-16)
// Datos de REST Countries vía useCountry: bandera, nombre oficial,
// capital, región, idiomas, moneda, población y zona horaria.
// Incluye estados de carga y error (rúbrica, criterio 1).
// ============================================================

import { useCountry } from '../hooks/useCountry';
import { getFlagUrl } from '../utils/flags';

export default function CountryCard({
  code,
  teamName,
}: {
  code: string;
  teamName: string;
}) {
  const { data, isLoading, isError, error, refetch } = useCountry(code);

  // Para ENG/SCO la bandera correcta viene de flagcdn (REST Countries
  // solo conoce la del Reino Unido); para el resto usamos el SVG de la API
  const isUkNation = code === 'ENG' || code === 'SCO';

  return (
    <article className="rounded-lg border border-gold-500/30 bg-pitch-800 p-5">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-gold-500">
        {teamName}
      </p>

      {isLoading && (
        <div className="mt-4 space-y-3" aria-label="Cargando país">
          <div className="h-14 w-24 animate-pulse rounded bg-slate-700/50" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-700/50" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-700/40" />
        </div>
      )}

      {isError && (
        <div className="mt-4 rounded border border-red-500/40 bg-red-950/30 p-3 text-sm text-red-300">
          <p>No se pudo cargar la información del país.</p>
          <p className="mt-1 text-xs text-red-400/80">{error.message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 rounded border border-red-400/50 px-2 py-1 text-xs uppercase tracking-wide hover:bg-red-500/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <>
          <img
            src={
              isUkNation || !data.flagSvg
                ? getFlagUrl(code, 160) // CDN estático: respaldo si la API no trajo bandera
                : data.flagSvg
            }
            alt={data.flagAlt}
            className="mt-4 h-16 w-28 rounded object-cover ring-1 ring-gold-500/40"
          />
          <h3 className="mt-3 font-display text-xl font-semibold uppercase tracking-wide text-slate-100">
            {data.commonName}
          </h3>
          <p className="text-xs italic text-slate-500">{data.officialName}</p>

          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Capital" value={data.capital} />
            <Row label="Región" value={data.region} />
            <Row label="Idiomas" value={data.languages.join(', ') || '—'} />
            <Row label="Moneda" value={data.currencies.join(' · ') || '—'} />
            <Row
              label="Población"
              value={data.population.toLocaleString('es-GT')}
            />
            <Row label="Zona horaria" value={data.timezones.join(', ')} />
          </dl>
        </>
      )}
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 border-b border-slate-700/40 pb-2">
      <dt className="w-24 shrink-0 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-slate-200">{value}</dd>
    </div>
  );
}
