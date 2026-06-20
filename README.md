# Dashboard Mundial 2026: Clima, Sedes y Países

Plataforma web tipo dashboard interactivo para consultar los partidos de la
fase de grupos del Mundial FIFA 2026, con información de la sede, el clima
esperado (Open-Meteo) y los países participantes (REST Countries).

**Curso:** 032 — Análisis de Sistemas I · Universidad Mariano Gálvez, Centro
Universitario de Chiquimulilla
**Docente:** Ing. MA. Carmelo Estuardo Mayén Monterroso

## Tecnologías

- React 18 + TypeScript
- Vite
- TailwindCSS
- TanStack Query (caché de APIs, estados de carga y error)
- Open-Meteo API (clima, sin API key)
- REST Countries v3.1 (países, sin API key) + fallback CountriesNow

## Instalación local

```bash
git clone <URL-DEL-REPOSITORIO>
cd mundial-2026-dashboard
npm install
npm run dev
```

Abrir http://localhost:5173

## Build de producción

```bash
npm run build
```

## URL de producción

> Pendiente — seguir los pasos de [DEPLOY.md](./DEPLOY.md) (US-12).
> El archivo `render.yaml` ya incluye la regla de rewrite SPA.

## Notas técnicas

- **72 partidos, no 64:** la fase de grupos real del Mundial 2026 tiene
  12 grupos × 6 partidos = 72 encuentros (48 equipos × 3 partidos ÷ 2).
  El archivo `src/data/matches.json` contiene los 72 partidos oficiales.
- **Inglaterra y Escocia:** son selecciones FIFA pero no países ISO-3166.
  `country.service.ts` las mapea al Reino Unido (GBR) para consultar
  REST Countries.
- **CORS:** `vite.config.ts` incluye un proxy de desarrollo. En producción
  el servicio usa countriesnow.space como fallback automático.
- **Banderas:** el listado usa flagcdn.com (CDN estático, 0 llamadas a API);
  el detalle usa las banderas SVG de REST Countries (sección 4.4 del PDF).
- **Comparador y búsqueda:** US-17 compara los dos países de un partido (con diferencia de población) y US-18 permite buscar una selección y ver todos sus partidos con resumen de clima.
- **Manuales:** USER_GUIDE.md y docs/TECHNICAL.md documentan el sistema (US-21, US-22).
- **Alineaciones:** no existe API gratuita de alineaciones del Mundial;
  `src/data/squads.json` gestiona XIs probables de forma estática y
  extensible, igual que `matches.json`.


## Mejoras de esta versión

- **Filtro por jornada (US-10+):** pestañas Jornada 1 / 2 / 3 / Todas con conteo
  de partidos. La jornada se deriva en `src/utils/jornada.ts` ordenando los
  partidos de cada grupo cronológicamente (2 por jornada y grupo → 24/24/24).
- **Información de las sedes (US-13):** `src/data/venues.ts` enriquece cada
  `venueName` con el estadio real, aforo, tipo de techo, superficie y año de
  apertura. Se muestra en las tarjetas y en una sección «El estadio» en el
  detalle, con enlace a OpenStreetMap.
- **Filtros avanzados ampliados:** búsqueda libre por equipo o sede, selección,
  grupo, sede, país anfitrión, fecha y estado (próximo / en curso / finalizado),
  todos combinables (AND).
- **Rediseño visual:** se mantiene la paleta navy profundo + dorado (FC26) con
  más profundidad (fondo radial, tarjetas de cristal, microinteracciones y
  jerarquía tipográfica revisada). Respeta `prefers-reduced-motion`.

- **Nombres FIFA + imagen del estadio:** las sedes se muestran con el nombre
  oficial designado por la FIFA (el de `matches.json`, sin patrocinador); el
  recinto real queda como dato secundario en `commonName`. La sección «El
  estadio» del detalle incluye una foto obtenida de Wikipedia (API pageimages,
  sin API key, cacheada 24 h con TanStack Query) mediante `useVenueImage`, con
  esqueleto de carga y respaldo si no hay imagen.
