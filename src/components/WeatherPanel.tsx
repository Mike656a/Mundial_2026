// ============================================================
// US-14 — Panel de clima de la sede (Open-Meteo)
// Temperatura máx/mín, condición WMO con ícono, humedad relativa
// a la hora del partido, viento, probabilidad de lluvia y la
// recomendación contextual (US-15) generada en el frontend.
// Maneja los tres estados: cargando, error y datos.
// ============================================================

import { useWeather } from '../hooks/useWeather';
import {
  describeWeatherCode,
  getRecommendation,
  weatherIcon,
} from '../services/weather.service';
import type { Match, WeatherRecommendation } from '../types';

/** Estilos del banner según severidad de la recomendación (US-15) */
const LEVEL_STYLES: Record<
  WeatherRecommendation['level'],
  { box: string; icon: string }
> = {
  favorable: { box: 'border-emerald-400/50 text-emerald-300', icon: '✅' },
  calor: { box: 'border-amber-400/50 text-amber-300', icon: '🥵' },
  lluvia: { box: 'border-sky-400/50 text-sky-300', icon: '☔' },
  adverso: { box: 'border-red-400/60 text-red-300', icon: '⚠️' },
};

export default function WeatherPanel({ match }: { match: Match }) {
  const { data, isLoading, isError, error, refetch } = useWeather(match);

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-lg border border-slate-700/60 bg-pitch-800 p-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-700/50" />
          <div className="space-y-2">
            <div className="h-6 w-32 rounded bg-slate-700/50" />
            <div className="h-3 w-44 rounded bg-slate-700/40" />
          </div>
        </div>
        <div className="mt-4 h-3 w-full rounded bg-slate-700/30" />
      </div>
    );
  }

  if (isError) {
    // Incluye el caso "fuera del horizonte de 16 días" con mensaje claro
    return (
      <div className="rounded-lg border border-amber-500/40 bg-pitch-800 p-5">
        <p className="font-display text-lg font-semibold uppercase text-amber-300">
          Clima no disponible
        </p>
        <p className="mt-1 text-sm text-slate-400">{error.message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-md border border-amber-400/50 px-3 py-1.5 text-xs uppercase
                     tracking-wide text-amber-300 hover:bg-amber-500/10"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return null;

  const reco = getRecommendation(data);
  const style = LEVEL_STYLES[reco.level];

  return (
    <article className="rounded-lg border border-gold-500/30 bg-pitch-800 p-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        {/* Ícono + temperaturas + condición */}
        <div className="flex items-center gap-4">
          <span className="text-5xl" role="img" aria-label={describeWeatherCode(data.weatherCode)}>
            {weatherIcon(data.weatherCode)}
          </span>
          <div>
            <p className="font-display text-3xl font-bold text-slate-100">
              {Math.round(data.tempMax)}°
              <span className="text-lg text-slate-400">
                {' '}/ {Math.round(data.tempMin)}°C
              </span>
            </p>
            <p className="text-sm text-slate-400">
              {describeWeatherCode(data.weatherCode)}{' '}
              <span className="text-slate-600">· WMO {data.weatherCode}</span>
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
          <Metric
            label="Lluvia"
            value={`${Math.round(data.rainProbability)}%`}
            accent="text-sky-300"
          />
          <Metric
            label="Viento"
            value={`${Math.round(data.windMax)} km/h`}
            accent="text-slate-200"
          />
          <Metric
            label="Humedad"
            value={
              data.humidity !== null ? `${Math.round(data.humidity)}%` : '—'
            }
            accent="text-slate-200"
            hint={`a las ${match.timeLocal}`}
          />
        </div>
      </div>

      {/* US-15: recomendación contextual */}
      <div
        className={`mt-4 flex items-center gap-3 rounded-md border px-4 py-3 text-sm ${style.box}`}
        role="status"
      >
        <span aria-hidden="true">{style.icon}</span>
        <p>{reco.message}</p>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  accent,
  hint,
}: {
  label: string;
  value: string;
  accent: string;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>
      <p className={`font-display text-xl font-semibold ${accent}`}>{value}</p>
      {hint && <p className="text-[10px] text-slate-600">{hint}</p>}
    </div>
  );
}
