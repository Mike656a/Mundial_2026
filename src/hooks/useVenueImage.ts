// ============================================================
// useVenueImage — Imagen del estadio desde Wikipedia
// Usa la API pageimages (sin API key, con CORS vía origin=*) para
// traer la imagen principal del artículo del estadio. Se cachea
// 24 h con TanStack Query: cada sede se pide una sola vez.
// Devuelve la URL de la imagen o null si no hay/ falla.
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { venueImageApi } from '../data/venues';

interface PageImagesResponse {
  query?: {
    pages?: Record<
      string,
      { thumbnail?: { source: string; width: number; height: number } }
    >;
  };
}

async function fetchVenueImage(wiki: string): Promise<string | null> {
  const res = await fetch(venueImageApi(wiki));
  if (!res.ok) throw new Error('No se pudo consultar la imagen del estadio');
  const data = (await res.json()) as PageImagesResponse;
  const pages = data.query?.pages ?? {};
  for (const page of Object.values(pages)) {
    if (page.thumbnail?.source) return page.thumbnail.source;
  }
  return null;
}

export function useVenueImage(wiki: string | undefined) {
  return useQuery<string | null, Error>({
    queryKey: ['venue-image', wiki],
    queryFn: () => fetchVenueImage(wiki!),
    enabled: Boolean(wiki),
    staleTime: 1000 * 60 * 60 * 24, // 24 h: la foto del estadio no cambia
    retry: 1,
  });
}
