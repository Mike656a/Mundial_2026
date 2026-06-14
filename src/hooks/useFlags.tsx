// ============================================================
// useFlags — Contexto global de banderas (REST Countries)
// Precarga las banderas SVG de las 48 selecciones en UNA sola
// llamada (getFlagsByCodes) y las comparte con toda la app.
// Cualquier componente obtiene la bandera de REST Countries sin
// disparar su propia petición, evitando el rate limit.
// ============================================================

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import matchesData from '../data/matches.json';
import { getFlagsByCodes } from '../services/country.service';
import { getFlagUrl } from '../utils/flags';
import type { Match } from '../types';

const matches = matchesData as Match[];

// Lista única de los 48 códigos de selección presentes en el calendario
const ALL_CODES = Array.from(
  new Set(matches.flatMap((m) => [m.teamA, m.teamB])),
);

type FlagMap = Record<string, string>;

const FlagsContext = createContext<FlagMap>({});

/**
 * Provider: hace una sola consulta a REST Countries con los 48
 * códigos y guarda el mapa { código → urlSvg } en el contexto.
 */
export function FlagsProvider({ children }: { children: ReactNode }) {
  const { data } = useQuery<FlagMap, Error>({
    queryKey: ['flags', 'all'],
    queryFn: () => getFlagsByCodes(ALL_CODES),
    staleTime: Infinity, // las banderas no cambian
    retry: 2,
  });

  return (
    <FlagsContext.Provider value={data ?? {}}>
      {children}
    </FlagsContext.Provider>
  );
}

/**
 * Devuelve la URL de la bandera SVG (REST Countries) de un equipo.
 * Mientras la precarga no termina, o si la API falla, cae al CDN
 * estático para que nunca se vea un hueco.
 */
export function useFlag(code: string): string {
  const flags = useContext(FlagsContext);
  return flags[code] || getFlagUrl(code, 160);
}
