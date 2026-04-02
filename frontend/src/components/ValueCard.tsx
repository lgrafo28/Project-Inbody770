import type { Messwert } from '../types';

interface ValueCardProps {
  title: string;
  data: Messwert | null;
}

const LABEL_MAP: Record<string, string> = {
  gewicht: "Körpergewicht",
  skelettmuskel: "Skelettmuskelmasse",
  koerperfett: "Körperfettmasse",
  bmi: "BMI",
  koerperfettanteil: "Körperfettanteil",
  viszeralfett: "Viszeraler Fettbereich",
  grundumsatz: "Grundumsatz",
  koerperwasser: "Körperwasser",
  ecw_tbw: "ECW / TBW",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  gewicht: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  skelettmuskel: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  koerperfett: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  bmi: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  koerperfettanteil: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  viszeralfett: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  grundumsatz: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  ),
  koerperwasser: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 5.16-7 8.37-7 11a7 7 0 0014 0c0-2.63-2.03-5.84-7-11z" />
    </svg>
  ),
  ecw_tbw: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
    </svg>
  ),
};

// Color per metric: primary (blue) or tertiary (green)
const COLOR_MAP: Record<string, 'primary' | 'tertiary' | 'secondary'> = {
  gewicht: 'primary',
  skelettmuskel: 'primary',
  koerperfett: 'secondary',
  bmi: 'primary',
  koerperfettanteil: 'tertiary',
  viszeralfett: 'secondary',
  grundumsatz: 'tertiary',
  koerperwasser: 'primary',
  ecw_tbw: 'secondary',
};

const colorClasses = {
  primary: {
    iconBg: 'bg-primary/5',
    iconColor: 'text-primary',
    bar: 'bg-primary/60',
    label: 'text-primary',
  },
  tertiary: {
    iconBg: 'bg-tertiary-container/10',
    iconColor: 'text-tertiary',
    bar: 'bg-tertiary/60',
    label: 'text-tertiary',
  },
  secondary: {
    iconBg: 'bg-secondary-container/20',
    iconColor: 'text-secondary',
    bar: 'bg-secondary/60',
    label: 'text-secondary',
  },
};

export function ValueCard({ title, data }: ValueCardProps) {
  if (!data) return null;

  const hasWert = data.wert !== null && data.wert !== undefined;
  const outOfBounds = hasWert && (
    (data.normal_min !== null && data.wert! < data.normal_min) ||
    (data.normal_max !== null && data.wert! > data.normal_max)
  );
  const lowConfidence = data.confidence !== null && data.confidence < 0.85;
  const color = colorClasses[outOfBounds ? 'secondary' : (COLOR_MAP[title] ?? 'primary')];

  // Progress bar position (extended range with 50% padding each side)
  const barPercent = (() => {
    if (!hasWert || data.normal_min === null || data.normal_max === null) return null;
    const range = data.normal_max - data.normal_min;
    const extMin = data.normal_min - range * 0.5;
    const extMax = data.normal_max + range * 0.5;
    return Math.max(2, Math.min(98, ((data.wert! - extMin) / (extMax - extMin)) * 100));
  })();

  const label = LABEL_MAP[title] || title.replace(/_/g, ' ');
  const icon = ICON_MAP[title] ?? null;

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-6 border shadow-sm transition-all duration-200 hover:shadow-md ${
      outOfBounds ? 'border-error/20' : 'border-outline-variant/5'
    }`}>

      {/* Icon + label row */}
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-lg ${color.iconBg} flex items-center justify-center flex-shrink-0`}>
          <span className={color.iconColor}>{icon}</span>
        </div>
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="font-label text-xs font-bold uppercase text-on-surface-variant tracking-wider truncate">{label}</span>
          {lowConfidence && data.confidence !== null && (
            <div className="group relative flex items-center gap-1 ml-2 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-error/70" />
              <span className="text-[10px] text-error font-bold uppercase tracking-wider">Unsicher</span>
              <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-inverse-surface text-inverse-on-surface text-xs rounded-lg shadow-lg z-10">
                Erkennungssicherheit: {Math.round(data.confidence * 100)}%. Bitte manuell prüfen.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className={`font-headline text-3xl font-bold ${outOfBounds ? 'text-error' : 'text-on-surface'} ${!hasWert ? 'text-on-surface-variant text-xl' : ''}`}>
          {hasWert ? data.wert : '—'}
        </span>
        {hasWert && data.einheit && (
          <span className="text-sm text-on-surface-variant font-medium">{data.einheit}</span>
        )}
      </div>

      {/* Progress bar */}
      {barPercent !== null && (
        <div className="flex items-center gap-2">
          <div className="flex-grow h-1 bg-surface-container rounded-full overflow-hidden relative">
            <div
              className={`h-full ${color.bar} rounded-full`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          {outOfBounds ? (
            <span className="text-[10px] font-bold text-error uppercase tracking-wider flex-shrink-0">Außerhalb</span>
          ) : (
            <span className={`text-[10px] font-bold ${color.label} uppercase tracking-wider flex-shrink-0`}>Normal</span>
          )}
        </div>
      )}
    </div>
  );
}
