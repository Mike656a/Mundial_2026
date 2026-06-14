// ============================================================
// Flag — Componente de bandera reutilizable
// Obtiene la bandera SVG desde REST Countries (vía el contexto
// useFlag, precargado en una sola llamada). Al ser un componente,
// puede usarse dentro de listas y .map() sin romper las reglas de
// los hooks de React.
// ============================================================

import { useFlag } from '../hooks/useFlags';

interface FlagProps {
  code: string;
  name: string;
  className?: string;
}

export default function Flag({ code, name, className }: FlagProps) {
  const src = useFlag(code);
  return (
    <img
      src={src}
      alt={`Bandera de ${name}`}
      loading="lazy"
      className={
        className ??
        'h-6 w-9 flex-shrink-0 rounded-sm object-cover ring-1 ring-slate-600/60'
      }
    />
  );
}
