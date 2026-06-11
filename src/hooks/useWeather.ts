// ============================================================
// US-04 — Custom hook de clima con TanStack Query
// Caché automático: el mismo partido no vuelve a llamar a la API
// durante 30 minutos (staleTime), protegiendo el límite gratuito.
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { getWeatherForVenue } from '../services/weather.service';
import type { Match, DayWeather } from '../types';

/**
 * Obtiene el clima del día del partido para su sede.
 *
 * Uso:
 * ```tsx
 * const { data, isLoading, isError, error } = useWeather(match);
 * if (isLoading) return <Spinner />;
 * if (isError)   return <ErrorBox message={error.message} />;
 * return <p>Máx: {data.tempMax}°C</p>;
 * ```
 */
export function useWeather(match: Match | undefined) {
  return useQuery<DayWeather, Error>({
    // La clave incluye sede + fecha: dos partidos en la misma sede
    // y fecha comparten caché (ej. dobles jornadas)
    queryKey: ['weather', match?.latitude, match?.longitude, match?.date],
    queryFn: () =>
      getWeatherForVenue(
        match!.latitude,
        match!.longitude,
        match!.date,
        match!.timezone,
      ),
    enabled: Boolean(match),       // no dispara hasta tener un partido
    staleTime: 1000 * 60 * 30,     // 30 min: el pronóstico no cambia tanto
    retry: 2,                      // reintenta 2 veces ante fallos de red
  });
}
