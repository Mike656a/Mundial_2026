// ============================================================
// US-05 — Servicio de países (REST Countries v3.1)
// Documentación: https://restcountries.com/#endpoints
// Sin API key. Fallback: https://countriesnow.space (sección 5.3)
// ============================================================

import type { RestCountryResponse, CountryInfo } from '../types';
import localData from '../data/countries.fallback.json';

/** Ficha local de respaldo (último nivel de la cascada) */
interface LocalCountry {
  commonName: string;
  officialName: string;
  capital: string;
  region: string;
  languages: string[];
  currency: string;
  population: number;
  timezones: string[];
}

const LOCAL: Record<string, LocalCountry> = localData;

/** Construye una CountryInfo desde el dataset local de las 48 selecciones */
function fromLocal(originalCode: string, isoCode: string): CountryInfo | null {
  const c = LOCAL[isoCode];
  if (!c) return null;
  return {
    code: originalCode,
    commonName: DISPLAY_NAME_OVERRIDES[originalCode] ?? c.commonName,
    officialName: c.officialName,
    flagSvg: '', // la UI usa el CDN estático de banderas como respaldo
    flagAlt: `Bandera de ${c.commonName}`,
    capital: c.capital,
    region: c.region,
    languages: c.languages,
    currencies: [c.currency],
    population: c.population,
    timezones: c.timezones,
  };
}

/**
 * US-07 — Cascada de acceso a REST Countries:
 *  1. En desarrollo, primero el proxy de Vite (/api/countries →
 *     restcountries.com, definido en vite.config.ts) para evitar CORS.
 *  2. Si el proxy falla (redes con SSL interceptado, server no
 *     reiniciado, etc.), se intenta la URL directa: REST Countries
 *     normalmente envía Access-Control-Allow-Origin: *.
 *  3. Si ambas fallan, getCountryFromFallback() usa CountriesNow.
 * Cada intento fallido se registra en la consola con su causa.
 */
const REST_URLS = import.meta.env.DEV
  ? ['/api/countries', 'https://restcountries.com/v3.1']
  : ['https://restcountries.com/v3.1'];

/** Intenta la misma ruta en cada base de REST_URLS hasta que una responda */
async function fetchRest(path: string): Promise<unknown> {
  const intentos: string[] = [];
  for (const base of REST_URLS) {
    try {
      const res = await fetch(`${base}${path}`);
      if (!res.ok) {
        intentos.push(`${base} → HTTP ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (e) {
      intentos.push(`${base} → ${(e as Error).message}`);
    }
  }
  throw new Error(`REST Countries no respondió [${intentos.join(' | ')}]`);
}

// Solo pedimos los campos que la UI necesita (recomendado por el proyecto)
const FIELDS =
  'name,cca3,flags,capital,region,subregion,languages,currencies,population,timezones';

/**
 * Inglaterra y Escocia son selecciones FIFA pero NO países ISO-3166:
 * ambas pertenecen al Reino Unido (GBR). REST Countries solo conoce GBR,
 * así que mapeamos sus códigos FIFA al código ISO del Reino Unido.
 * Este caso debe documentarse en el Manual Técnico.
 */
const FIFA_CODE_OVERRIDES: Record<string, string> = {
  ENG: 'GBR',
  SCO: 'GBR',
};

/**
 * Nombres mostrados cuando el código FIFA no coincide con el país ISO.
 * Así la ficha dice "Inglaterra" aunque los datos demográficos sean de GBR.
 */
const DISPLAY_NAME_OVERRIDES: Record<string, string> = {
  ENG: 'Inglaterra (Reino Unido)',
  SCO: 'Escocia (Reino Unido)',
};

/**
 * Consulta REST Countries por código ISO-3166-1 alfa-3.
 *
 * @param code Código alfa-3, ej. "FRA", "ARG" (acepta también ENG/SCO)
 * @returns Ficha de país procesada para la UI
 * @throws Error si ninguna de las dos APIs responde
 */
export async function getCountryByCode(code: string): Promise<CountryInfo> {
  const isoCode = FIFA_CODE_OVERRIDES[code] ?? code;

  try {
    // El endpoint /alpha/{código} ha devuelto históricamente UN OBJETO,
    // pero la versión actual devuelve un ARREGLO de un elemento.
    // Aceptamos ambas formas para no romper la app por un cambio de API.
    const json = (await fetchRest(
      `/alpha/${isoCode}?fields=${FIELDS}`,
    )) as RestCountryResponse | RestCountryResponse[];
    const data = Array.isArray(json) ? json[0] : json;

    if (!data?.name?.common) {
      throw new Error(
        `REST Countries devolvió una respuesta sin datos para ${isoCode}`,
      );
    }

    return mapToCountryInfo(code, data);
  } catch (primaryError) {
    // Fallback de CORS/caídas en producción (sección 5.3 del proyecto):
    // si REST Countries falla, intentamos countriesnow.space
    console.error(
      `[country.service] REST Countries falló para ${isoCode}; ` +
        'usando fallback CountriesNow (ficha con campos limitados). ' +
        'Causa:',
      primaryError,
    );
    return getCountryFromFallback(code, isoCode, primaryError as Error);
  }
}

/**
 * Consulta REST Countries por nombre (para la búsqueda por equipo, US-18).
 *
 * @param name Nombre del país en inglés o español, ej. "france"
 */
export async function getCountryByName(name: string): Promise<CountryInfo> {
  // /name/ devuelve un arreglo; tomamos la mejor coincidencia
  const data = (await fetchRest(
    `/name/${encodeURIComponent(name)}?fields=${FIELDS}`,
  )) as RestCountryResponse[];
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No se encontró el país "${name}"`);
  }

  return mapToCountryInfo(data[0].cca3, data[0]);
}

// ------------------------------------------------------------
// Helpers internos
// ------------------------------------------------------------

/** Convierte la respuesta cruda de REST Countries al modelo de la UI */
function mapToCountryInfo(
  originalCode: string,
  data: RestCountryResponse,
): CountryInfo {
  return {
    code: originalCode,
    commonName: DISPLAY_NAME_OVERRIDES[originalCode] ?? data.name.common,
    officialName: data.name.official,
    flagSvg: data.flags.svg,
    flagAlt: data.flags.alt ?? `Bandera de ${data.name.common}`,
    capital: data.capital?.[0] ?? '—',
    region: data.subregion ? `${data.region} · ${data.subregion}` : data.region,
    languages: data.languages ? Object.values(data.languages) : [],
    currencies: data.currencies
      ? Object.entries(data.currencies).map(
          ([codeKey, c]) =>
            `${c.name}${c.symbol ? ` (${c.symbol})` : ''} — ${codeKey}`,
        )
      : [],
    population: data.population,
    timezones: data.timezones,
  };
}

/**
 * Nombres en inglés de las 48 selecciones (más GBR) tal como los usa
 * CountriesNow. Su endpoint /countries/info NO devuelve códigos ISO,
 * solo el nombre, así que el fallback busca por nombre normalizado.
 * Algunos países tienen variantes históricas (Czechia/Czech Republic).
 */
const FALLBACK_NAMES: Record<string, string[]> = {
  MEX: ['mexico'], ZAF: ['south africa'],
  KOR: ['south korea', 'korea (republic of)', 'republic of korea'],
  CZE: ['czechia', 'czech republic'], CAN: ['canada'],
  BIH: ['bosnia and herzegovina', 'bosnia & herzegovina'],
  QAT: ['qatar'], CHE: ['switzerland'], BRA: ['brazil'],
  MAR: ['morocco'], HTI: ['haiti'], GBR: ['united kingdom'],
  USA: ['united states', 'united states of america'],
  PRY: ['paraguay'], AUS: ['australia'], TUR: ['turkey', 'turkiye'],
  DEU: ['germany'], CUW: ['curacao'],
  CIV: ['ivory coast', "cote d'ivoire"], ECU: ['ecuador'],
  NLD: ['netherlands', 'the netherlands'], JPN: ['japan'],
  SWE: ['sweden'], TUN: ['tunisia'], BEL: ['belgium'], EGY: ['egypt'],
  IRN: ['iran', 'iran (islamic republic of)'], NZL: ['new zealand'],
  ESP: ['spain'], CPV: ['cabo verde', 'cape verde'],
  SAU: ['saudi arabia'], URY: ['uruguay'], FRA: ['france'],
  SEN: ['senegal'], IRQ: ['iraq'], NOR: ['norway'], ARG: ['argentina'],
  DZA: ['algeria'], AUT: ['austria'], JOR: ['jordan'],
  PRT: ['portugal'], COL: ['colombia'], UZB: ['uzbekistan'],
  COD: [
    'democratic republic of the congo',
    'dr congo',
    'congo (democratic republic of the)',
    'congo, the democratic republic of the',
  ],
};

/** Normaliza un nombre para comparar: minúsculas y sin acentos */
function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Niveles 3 y 4 de la cascada cuando REST Countries no responde:
 *  3. CountriesNow (countriesnow.space, sección 5.3 del PDF) — aporta
 *     capital, moneda y a veces población; sus campos faltantes
 *     (región, idiomas, zonas horarias) se completan con el dataset
 *     local para que la ficha nunca salga a medias.
 *  4. Dataset local countries.fallback.json (48 selecciones) — garantiza
 *     la ficha completa incluso sin internet, igual que matches.json.
 */
async function getCountryFromFallback(
  originalCode: string,
  isoCode: string,
  primaryError: Error,
): Promise<CountryInfo> {
  const local = fromLocal(originalCode, isoCode);

  try {
    const response = await fetch(
      'https://countriesnow.space/api/v0.1/countries/info?returns=currency,flag,capital,population',
    );
    if (!response.ok) {
      throw new Error(`CountriesNow → HTTP ${response.status}`);
    }

    const json: {
      data: Array<{
        name: string;
        iso3?: string;
        currency?: string;
        flag?: string;
        capital?: string;
        population?: number;
      }>;
    } = await response.json();

    const candidates = FALLBACK_NAMES[isoCode] ?? [];
    const found = json.data.find(
      (c) => c.iso3 === isoCode || candidates.includes(normalizeName(c.name)),
    );

    if (found) {
      // Datos vivos de CountriesNow + huecos rellenados con el local
      return {
        code: originalCode,
        commonName:
          DISPLAY_NAME_OVERRIDES[originalCode] ??
          local?.commonName ??
          found.name,
        officialName: local?.officialName ?? found.name,
        flagSvg: found.flag?.startsWith('http') ? found.flag : '',
        flagAlt: `Bandera de ${found.name}`,
        capital: found.capital ?? local?.capital ?? '—',
        region: local?.region ?? '—',
        languages: local?.languages ?? [],
        currencies: found.currency
          ? [found.currency]
          : local?.currencies ?? [],
        population: found.population || local?.population || 0,
        timezones: local?.timezones ?? [],
      };
    }

    throw new Error(`CountriesNow no encontró ${isoCode}`);
  } catch (secondaryError) {
    // Nivel 4: dataset local puro
    if (local) {
      console.warn(
        `[country.service] Usando dataset local para ${isoCode}. ` +
          `REST Countries: ${primaryError.message}. ` +
          `CountriesNow: ${(secondaryError as Error).message}.`,
      );
      return local;
    }
    throw new Error(
      `Las tres fuentes fallaron para ${isoCode}. ` +
        `REST Countries: ${primaryError.message}. ` +
        `CountriesNow: ${(secondaryError as Error).message}. ` +
        'Sin entrada en el dataset local.',
    );
  }
}

// ============================================================
// Banderas en lote (para el dashboard y todos los componentes)
// REST Countries acepta varios códigos en /alpha?codes=a,b,c y
// devuelve un arreglo. Así obtenemos las 48 banderas SVG en UNA
// sola llamada, en vez de 96 peticiones desde las tarjetas.
// ============================================================

/**
 * Descarga las banderas SVG de varias selecciones a la vez desde
 * REST Countries. Devuelve un mapa { códigoOriginal → urlSvg }.
 *
 * @param codes Códigos alfa-3 / FIFA, ej. ["MEX","ZAF","ENG"]
 */
export async function getFlagsByCodes(
  codes: string[],
): Promise<Record<string, string>> {
  // Resolver códigos FIFA (ENG/SCO → GBR) y quitar duplicados
  const isoToOriginals = new Map<string, string[]>();
  for (const code of codes) {
    const iso = FIFA_CODE_OVERRIDES[code] ?? code;
    isoToOriginals.set(iso, [...(isoToOriginals.get(iso) ?? []), code]);
  }
  const isoCodes = Array.from(isoToOriginals.keys());

  const json = (await fetchRest(
    `/alpha?codes=${isoCodes.join(',')}&fields=cca3,flags`,
  )) as Array<{ cca3: string; flags: { svg: string } }>;

  const result: Record<string, string> = {};
  for (const country of json) {
    const originals = isoToOriginals.get(country.cca3) ?? [];
    for (const original of originals) {
      result[original] = country.flags.svg;
    }
  }
  return result;
}
