// ============================================================
// Catálogo de sedes (estadios) del Mundial 2026
// El nombre que se MUESTRA es el designado por la FIFA (igual que
// en matches.json, p. ej. "Estadio Ciudad de México"), porque en
// el torneo los recintos usan nombre neutro (sin patrocinador).
// `commonName` guarda el recinto real solo como dato secundario.
// `wiki` es el título en Wikipedia para obtener la imagen del
// estadio mediante la API de pageimages (ver useVenueImage).
//
// La clave es el `venueName` tal como aparece en matches.json.
// ============================================================

export type Country = 'US' | 'MX' | 'CA';
export type Roof = 'abierto' | 'retráctil' | 'techado';
export type Surface = 'natural' | 'híbrida';

export interface Venue {
  /** Nombre FIFA usado en matches.json (clave y nombre a mostrar) */
  venueName: string;
  /** Recinto real (dato secundario) */
  commonName: string;
  /** Título del artículo en Wikipedia (para la imagen) */
  wiki: string;
  city: string;
  region: string;          // estado / provincia
  country: Country;
  capacity: number;        // aforo aproximado para el torneo
  roof: Roof;
  surface: Surface;
  opened: number;          // año de inauguración
  latitude: number;
  longitude: number;
}

export const VENUES: Record<string, Venue> = {
  'Estadio Ciudad de México': {
    venueName: 'Estadio Ciudad de México',
    commonName: 'Estadio Azteca', wiki: 'Estadio Azteca',
    city: 'Ciudad de México', region: 'CDMX', country: 'MX',
    capacity: 87523, roof: 'abierto', surface: 'natural', opened: 1966,
    latitude: 19.3032, longitude: -99.1506,
  },
  'Estadio Guadalajara': {
    venueName: 'Estadio Guadalajara',
    commonName: 'Estadio Akron', wiki: 'Estadio Akron',
    city: 'Guadalajara', region: 'Jalisco', country: 'MX',
    capacity: 48071, roof: 'abierto', surface: 'natural', opened: 2010,
    latitude: 20.6819, longitude: -103.4625,
  },
  'Estadio Monterrey': {
    venueName: 'Estadio Monterrey',
    commonName: 'Estadio BBVA', wiki: 'Estadio BBVA',
    city: 'Monterrey', region: 'Nuevo León', country: 'MX',
    capacity: 53500, roof: 'abierto', surface: 'natural', opened: 2015,
    latitude: 25.6692, longitude: -100.2444,
  },
  'Estadio Atlanta': {
    venueName: 'Estadio Atlanta',
    commonName: 'Mercedes-Benz Stadium', wiki: 'Mercedes-Benz Stadium',
    city: 'Atlanta', region: 'Georgia', country: 'US',
    capacity: 71000, roof: 'retráctil', surface: 'híbrida', opened: 2017,
    latitude: 33.7554, longitude: -84.4008,
  },
  'Estadio Boston': {
    venueName: 'Estadio Boston',
    commonName: 'Gillette Stadium', wiki: 'Gillette Stadium',
    city: 'Foxborough', region: 'Massachusetts', country: 'US',
    capacity: 65878, roof: 'abierto', surface: 'híbrida', opened: 2002,
    latitude: 42.0909, longitude: -71.2643,
  },
  'Estadio Dallas': {
    venueName: 'Estadio Dallas',
    commonName: 'AT&T Stadium', wiki: 'AT&T Stadium',
    city: 'Arlington', region: 'Texas', country: 'US',
    capacity: 80000, roof: 'retráctil', surface: 'natural', opened: 2009,
    latitude: 32.7473, longitude: -97.0945,
  },
  'Estadio Filadelfia': {
    venueName: 'Estadio Filadelfia',
    commonName: 'Lincoln Financial Field', wiki: 'Lincoln Financial Field',
    city: 'Filadelfia', region: 'Pensilvania', country: 'US',
    capacity: 69796, roof: 'abierto', surface: 'híbrida', opened: 2003,
    latitude: 39.9008, longitude: -75.1675,
  },
  'Estadio Houston': {
    venueName: 'Estadio Houston',
    commonName: 'NRG Stadium', wiki: 'NRG Stadium',
    city: 'Houston', region: 'Texas', country: 'US',
    capacity: 72220, roof: 'retráctil', surface: 'natural', opened: 2002,
    latitude: 29.6847, longitude: -95.4107,
  },
  'Estadio Kansas City': {
    venueName: 'Estadio Kansas City',
    commonName: 'Arrowhead Stadium', wiki: 'Arrowhead Stadium',
    city: 'Kansas City', region: 'Misuri', country: 'US',
    capacity: 76416, roof: 'abierto', surface: 'natural', opened: 1972,
    latitude: 39.0489, longitude: -94.4839,
  },
  'Estadio Los Ángeles': {
    venueName: 'Estadio Los Ángeles',
    commonName: 'SoFi Stadium', wiki: 'SoFi Stadium',
    city: 'Inglewood', region: 'California', country: 'US',
    capacity: 70000, roof: 'techado', surface: 'natural', opened: 2020,
    latitude: 33.9535, longitude: -118.3392,
  },
  'Estadio Miami': {
    venueName: 'Estadio Miami',
    commonName: 'Hard Rock Stadium', wiki: 'Hard Rock Stadium',
    city: 'Miami Gardens', region: 'Florida', country: 'US',
    capacity: 65326, roof: 'abierto', surface: 'natural', opened: 1987,
    latitude: 25.9580, longitude: -80.2389,
  },
  'Estadio Nueva York Nueva Jersey': {
    venueName: 'Estadio Nueva York Nueva Jersey',
    commonName: 'MetLife Stadium', wiki: 'MetLife Stadium',
    city: 'East Rutherford', region: 'Nueva Jersey', country: 'US',
    capacity: 82500, roof: 'abierto', surface: 'natural', opened: 2010,
    latitude: 40.8135, longitude: -74.0745,
  },
  'Estadio Bahía de San Francisco': {
    venueName: 'Estadio Bahía de San Francisco',
    commonName: "Levi's Stadium", wiki: "Levi's Stadium",
    city: 'Santa Clara', region: 'California', country: 'US',
    capacity: 68500, roof: 'abierto', surface: 'natural', opened: 2014,
    latitude: 37.4030, longitude: -121.9698,
  },
  'Estadio Seattle': {
    venueName: 'Estadio Seattle',
    commonName: 'Lumen Field', wiki: 'Lumen Field',
    city: 'Seattle', region: 'Washington', country: 'US',
    capacity: 69000, roof: 'abierto', surface: 'natural', opened: 2002,
    latitude: 47.5952, longitude: -122.3316,
  },
  'Estadio Toronto': {
    venueName: 'Estadio Toronto',
    commonName: 'BMO Field', wiki: 'BMO Field',
    city: 'Toronto', region: 'Ontario', country: 'CA',
    capacity: 45500, roof: 'abierto', surface: 'natural', opened: 2007,
    latitude: 43.6332, longitude: -79.4185,
  },
  'Estadio BC Place Vancouver': {
    venueName: 'Estadio BC Place Vancouver',
    commonName: 'BC Place', wiki: 'BC Place',
    city: 'Vancouver', region: 'Columbia Británica', country: 'CA',
    capacity: 54500, roof: 'retráctil', surface: 'híbrida', opened: 1983,
    latitude: 49.2767, longitude: -123.1119,
  },
};

/** Devuelve la ficha de una sede a partir de su nombre genérico. */
export function getVenue(venueName: string): Venue | undefined {
  return VENUES[venueName];
}

const COUNTRY_LABELS: Record<Country, string> = {
  US: 'Estados Unidos',
  MX: 'México',
  CA: 'Canadá',
};

export function countryLabel(code: Country): string {
  return COUNTRY_LABELS[code];
}

/** Aforo con separador de miles en español (87 523). */
export function formatCapacity(n: number): string {
  return new Intl.NumberFormat('es-GT').format(n);
}

/**
 * URL de la API de Wikipedia (pageimages) para obtener la imagen
 * principal del estadio. `origin=*` habilita CORS sin API key.
 */
export function venueImageApi(wiki: string, size = 800): string {
  const params = new URLSearchParams({
    action: 'query',
    titles: wiki,
    prop: 'pageimages',
    piprop: 'thumbnail',
    pithumbsize: String(size),
    format: 'json',
    origin: '*',
  });
  return `https://en.wikipedia.org/w/api.php?${params.toString()}`;
}
