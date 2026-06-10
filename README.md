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
npm install
npm run dev
```

Abrir http://localhost:5173

## Build de producción

```bash
npm run build
```

## URL de producción

> Pendiente — se desplegará en Render.com como Static Site (US-12).

## Notas técnicas

- **72 partidos, no 64:** la fase de grupos real del Mundial 2026 tiene
  12 grupos × 6 partidos = 72 encuentros (48 equipos × 3 partidos ÷ 2).
  El archivo `src/data/matches.json` contiene los 72 partidos oficiales.
- **Inglaterra y Escocia:** son selecciones FIFA pero no países ISO-3166.
  `country.service.ts` las mapea al Reino Unido (GBR) para consultar
  REST Countries.
- **CORS:** `vite.config.ts` incluye un proxy de desarrollo. En producción
  el servicio usa countriesnow.space como fallback automático.
=======
# Mundial_2026

