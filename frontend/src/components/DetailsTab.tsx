import type { ReactNode } from 'react';
import type { AnalysisResponse, Hinweise } from '../types';
import { ValueCard } from './ValueCard';
import { SECONDARY_KEY_ORDER } from './AnalysisDashboard';

interface DetailsTabProps {
  data: AnalysisResponse;
}

// Which secondary metrics go into each category group.
// Keys must match WerteList index signature keys.
const DETAIL_CATEGORIES: Array<{ label: string; keys: string[] }> = [
  { label: 'Wasserhaushalt', keys: ['koerperwasser', 'ecw_tbw'] },
  { label: 'Stoffwechsel',   keys: ['grundumsatz'] },
  { label: 'Risikomarker',   keys: ['viszeralfett'] },
];

const STEP_LABELS: Record<string, string> = {
  training:  'Bewegung',
  ernaehrung: 'Ernährung',
  verlauf:   'Verlauf',
};

const STEP_ICONS: Record<string, ReactNode> = {
  training: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  ernaehrung: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5A2.25 2.25 0 0012.75 4.5h-1.5A2.25 2.25 0 009 6.75v1.5M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.375-1.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75z" />
    </svg>
  ),
  verlauf: (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
};

type HinweisKey = keyof Hinweise; // 'training' | 'ernaehrung' | 'verlauf'
const hinweisKeys: readonly HinweisKey[] = ['training', 'ernaehrung', 'verlauf'];

const STEP_HIGHLIGHT: Record<HinweisKey, boolean> = {
  training: false,
  ernaehrung: false,
  verlauf: true,
};

// ── NextStepCard ─────────────────────────────────────────────────────────────
interface NextStepCardProps {
  icon: ReactNode;
  label: string;
  items: string[];
  highlight: boolean;
}

function NextStepCard({ icon, label, items, highlight }: NextStepCardProps) {
  if (items.length === 0) return null;

  if (highlight) {
    return (
      <div className="p-7 bg-primary text-on-primary rounded-xl flex gap-4 shadow-lg shadow-primary/10">
        <span className="mt-0.5 opacity-80">{icon}</span>
        <div>
          <h3 className="font-bold text-base mb-2">{label}</h3>
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="text-xs opacity-75 leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-7 bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex gap-4 hover:bg-surface-container transition-colors duration-200">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <h3 className="font-bold text-sm text-on-surface mb-2">{label}</h3>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-on-surface-variant leading-relaxed">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Section heading helper ───────────────────────────────────────────────────
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="h-6 w-1 bg-primary rounded-full" />
      <h2 className="text-xl font-bold tracking-tight text-on-surface font-headline">{children}</h2>
    </div>
  );
}

// ── DetailsTab ───────────────────────────────────────────────────────────────
export function DetailsTab({ data }: DetailsTabProps) {
  const { werte, hinweise, ampel_begruendung } = data;

  // Geordnete Sekundärmetriken aus der zentralen Konstante – feste Reihenfolge garantiert
  const secondaryKeys: string[] = SECONDARY_KEY_ORDER.filter(
    k => werte[k] != null && werte[k]?.wert != null
  );

  const presentCategories = DETAIL_CATEGORIES.filter(cat =>
    cat.keys.some(k => secondaryKeys.includes(k))
  );

  const presentHinweisKeys = hinweisKeys.filter(
    (k: HinweisKey) => hinweise[k].length > 0
  );

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-12 pb-32">

      {/* ── Page header ─────────────────────────────────────────── */}
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">
          Ergänzende Werte & Prognose
        </h1>
        <p className="text-on-surface-variant font-medium">
          Detaillierte Analyse physiologischer Marker und Empfehlungen.
        </p>
      </header>

      {/* ── Section 1: Weitere Messwerte ────────────────────────── */}
      {presentCategories.length > 0 && (
        <section className="mb-16">
          <SectionHeading>Weitere Messwerte</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {presentCategories.map(cat => {
              const presentKeys = cat.keys.filter(k => werte[k]?.wert != null);
              return (
                <div key={cat.label} className="space-y-4">
                  <h3 className="text-xs font-extrabold tracking-widest text-primary uppercase pl-1">
                    {cat.label}
                  </h3>
                  {presentKeys.map(k => (
                    <ValueCard key={k} title={k} data={werte[k]!} />
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Section 2: Praktische Einordnung ────────────────────── */}
      {presentHinweisKeys.length > 0 && (
        <section className="mb-16">
          <SectionHeading>Praktische Einordnung</SectionHeading>
          <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
              {presentHinweisKeys.map((key: HinweisKey) => (
                <div key={key}>
                  <h4 className="text-sm font-bold text-on-surface mb-1">{STEP_LABELS[key]}</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">{hinweise[key][0]}</p>
                </div>
              ))}
            </div>
            {ampel_begruendung && (
              <p className="mt-6 pt-6 border-t border-outline-variant/10 text-xs text-on-surface-variant/70 leading-relaxed italic">
                {ampel_begruendung}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Section 3: Nächste Schritte ─────────────────────────── */}
      {presentHinweisKeys.length > 0 && (
        <section>
          <SectionHeading>Nächste Schritte</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presentHinweisKeys.map(key => (
              <NextStepCard
                key={key}
                icon={STEP_ICONS[key]}
                label={STEP_LABELS[key]}
                items={hinweise[key].slice(0, 2)}
                highlight={STEP_HIGHLIGHT[key]}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
