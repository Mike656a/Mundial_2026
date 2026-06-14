// ============================================================
// US-06 — Custom hook de países con TanStack Query
// Los datos de un país no cambian durante la sesión, así que el
// caché es permanente (staleTime: Infinity): los 48 equipos se
// consultan una sola vez aunque el usuario navegue entre partidos.
// ============================================================

import { useQuery } from '@tanstack/react-query';
import {
  getCountryByCode,
  getCountryByName,
} from '../services/country.service';
import type { CountryInfo } from '../types';

/**
 * Obtiene la ficha de un país por código ISO-3166-1 alfa-3
 * (acepta también los códigos FIFA ENG y SCO).
 *
 * Uso:
 * ```tsx
 * const { data, isLoading, isError, error } = useCountry(match.teamA);
 * if (isLoading) return <Spinner />;
 * if (isError)   return <ErrorBox message={error.message} />;
 * return <img src={data.flagSvg} alt={data.flagAlt} />;
 * ```
 */
export function useCountry(code: string | undefined) {
  return useQuery<CountryInfo, Error>({
    queryKey: ['country', code],
    queryFn: () => getCountryByCode(code!),
    enabled: Boolean(code),
    staleTime: Infinity,
    retry: 2,
  });
}

/**
 * Variante por nombre, pensada para la búsqueda por equipo (US-18).
 * Solo dispara cuando el texto tiene al menos 3 caracteres.
 */
export function useCountrySearch(name: string) {
  const trimmed = name.trim();

  return useQuery<CountryInfo, Error>({
    queryKey: ['country-search', trimmed.toLowerCase()],
    queryFn: () => getCountryByName(trimmed),
    enabled: trimmed.length >= 3,
    staleTime: Infinity,
    retry: 1, // una búsqueda fallida suele ser un nombre inexistente
  });
}
