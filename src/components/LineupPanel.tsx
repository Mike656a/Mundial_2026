// ============================================================
// LineupPanel.tsx — Alineación probable de ambos equipos
// Fuente: src/data/squads.json (datos de prensa deportiva).
// Las alineaciones oficiales se anuncian ~1 hora antes de cada
// partido y no existen en las APIs gratuitas del proyecto, por
// eso se gestionan como JSON local extensible.
// ============================================================

import squadsData from '../data/squads.json';
import { getFlagUrl } from '../utils/flags';

interface Player {
  num: number;
  name: string;
  pos: 'POR' | 'DEF' | 'MED' | 'DEL';
}

interface Squad {
  coach: string;
  formation: string;
  status: string;
  players: Player[];
}

const squads = squadsData as unknown as Record<string, Squad>;

const POS_LABELS: Record<Player['pos'], string> = {
  POR: 'Portero',
  DEF: 'Defensas',
  MED: 'Mediocampistas',
  DEL: 'Delanteros',
};

const POS_ORDER: Player['pos'][] = ['POR', 'DEF', 'MED', 'DEL'];

export default function LineupPanel({
  teamA,
  teamAName,
  teamB,
  teamBName,
}: {
  teamA: string;
  teamAName: string;
  teamB: string;
  teamBName: string;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-slate-200">
        <span className="text-gold-500">XI</span> Alineaciones probables
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Según prensa deportiva — la alineación oficial se confirma ~1 hora
        antes del silbatazo inicial.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TeamLineup code={teamA} name={teamAName} />
        <TeamLineup code={teamB} name={teamBName} />
      </div>
    </section>
  );
}

function TeamLineup({ code, name }: { code: string; name: string }) {
  const squad = squads[code];

  return (
    <div className="rounded-lg border border-slate-700/60 bg-pitch-800 p-5">
      <div className="flex items-center gap-3 border-b border-gold-500/30 pb-3">
        <img
          src={getFlagUrl(code, 40)}
          alt={`Bandera de ${name}`}
          className="h-5 w-8 rounded-sm object-cover ring-1 ring-slate-600/60"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold uppercase leading-tight text-slate-100">
            {name}
          </p>
          {squad && (
            <p className="text-xs text-slate-400">
              DT: {squad.coach} · Esquema{' '}
              <span className="font-semibold text-gold-300">
                {squad.formation}
              </span>
            </p>
          )}
        </div>
      </div>

      {!squad && (
        <p className="mt-4 text-sm text-slate-500">
          Alineación no disponible todavía para esta selección. Las
          alineaciones se publican aproximadamente una hora antes de cada
          partido; pueden agregarse en{' '}
          <code className="rounded bg-pitch-950 px-1 text-xs text-gold-300">
            src/data/squads.json
          </code>
          .
        </p>
      )}

      {squad &&
        POS_ORDER.map((pos) => {
          const players = squad.players.filter((p) => p.pos === pos);
          if (players.length === 0) return null;
          return (
            <div key={pos} className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                {POS_LABELS[pos]}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {players.map((p) => (
                  <li key={p.num} className="flex items-center gap-3 text-sm">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full
                                 border border-gold-500/40 bg-pitch-950 font-display text-xs
                                 font-bold text-gold-300"
                    >
                      {p.num}
                    </span>
                    <span className="text-slate-200">{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
    </div>
  );
}
