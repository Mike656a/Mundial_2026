// ============================================================
// Banderas estáticas vía flagcdn.com (sin API key, sin límite)
// - El listado (72 tarjetas) NO debe disparar 48 llamadas a
//   REST Countries; usamos un CDN de imágenes estáticas.
// - Bonus: flagcdn tiene banderas REALES de Inglaterra (gb-eng)
//   y Escocia (gb-sct), que REST Countries no distingue de GBR.
// ============================================================

/** Mapa ISO-3166-1 alfa-3 (+ códigos FIFA) → alfa-2 de flagcdn */
const ALPHA3_TO_FLAG: Record<string, string> = {
  MEX: 'mx', ZAF: 'za', KOR: 'kr', CZE: 'cz',
  CAN: 'ca', BIH: 'ba', QAT: 'qa', CHE: 'ch',
  BRA: 'br', MAR: 'ma', HTI: 'ht', SCO: 'gb-sct',
  USA: 'us', PRY: 'py', AUS: 'au', TUR: 'tr',
  DEU: 'de', CUW: 'cw', CIV: 'ci', ECU: 'ec',
  NLD: 'nl', JPN: 'jp', SWE: 'se', TUN: 'tn',
  BEL: 'be', EGY: 'eg', IRN: 'ir', NZL: 'nz',
  ESP: 'es', CPV: 'cv', SAU: 'sa', URY: 'uy',
  FRA: 'fr', SEN: 'sn', IRQ: 'iq', NOR: 'no',
  ARG: 'ar', DZA: 'dz', AUT: 'at', JOR: 'jo',
  PRT: 'pt', COL: 'co', UZB: 'uz', COD: 'cd',
  ENG: 'gb-eng', CRO: 'hr', GHA: 'gh', PAN: 'pa',
};

/**
 * URL de la bandera de un equipo.
 * @param code  Código alfa-3 o FIFA (MEX, ENG, SCO…)
 * @param width Ancho del PNG: 40 (listado) | 80 | 160 (detalle)
 */
export function getFlagUrl(code: string, width: 40 | 80 | 160 = 40): string {
  const alpha2 = ALPHA3_TO_FLAG[code];
  if (!alpha2) return '';
  return `https://flagcdn.com/w${width}/${alpha2}.png`;
}
