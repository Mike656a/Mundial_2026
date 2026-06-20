// ============================================================
// VenueImage — Imagen del estadio con carga y respaldo
// Muestra la foto del estadio (Wikipedia). Mientras carga, un
// esqueleto; si no hay imagen o falla, un respaldo con degradado
// y el ícono de ubicación. Nunca rompe el layout.
// ============================================================

import { useState } from 'react';
import { useVenueImage } from '../hooks/useVenueImage';

interface VenueImageProps {
  wiki: string;
  alt: string;
  className?: string;
}

export default function VenueImage({ wiki, alt, className }: VenueImageProps) {
  const { data: url, isLoading } = useVenueImage(wiki);
  const [broken, setBroken] = useState(false);

  const base =
    className ??
    'h-48 w-full overflow-hidden rounded-xl sm:h-60';

  if (isLoading) {
    return <div className={`${base} animate-pulse bg-pitch-700/50`} />;
  }

  if (!url || broken) {
    return (
      <div
        className={`${base} flex items-center justify-center bg-gradient-to-br from-pitch-700 to-pitch-900`}
      >
        <svg
          className="h-10 w-10 text-gold-500/50"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${base} relative`}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        onError={() => setBroken(true)}
        className="h-full w-full object-cover"
      />
      {/* Velo inferior para integrar la foto con el tema oscuro */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-pitch-950/70 via-transparent to-transparent" />
    </div>
  );
}
