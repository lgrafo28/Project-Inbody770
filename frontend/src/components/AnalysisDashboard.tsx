import type { AnalysisResponse } from '../types';
import { ValueCard } from './ValueCard';

interface AnalysisDashboardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

// Status config — integrated into interpretation card, not a standalone banner
const ampelConfig = {
  gruen: {
    pill: 'bg-tertiary-container/20 text-tertiary',
    dot: 'bg-tertiary',
    label: 'Alles im Normbereich',
  },
  gelb: {
    pill: 'bg-[#fef3c7] text-[#92400e]',
    dot: 'bg-[#f59e0b]',
    label: 'Einzelne Werte auffällig',
  },
  rot: {
    pill: 'bg-error-container/40 text-error',
    dot: 'bg-error',
    label: 'Mehrere Werte außerhalb des Normbereichs',
  },
};

const HINT_LABEL: Record<string, string> = {
  training: 'Bewegung',
  ernaehrung: 'Ernährung',
  verlauf: 'Verlauf',
};

const HINT_ICON: Record<string, React.ReactNode> = {
  training: (
    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  ernaehrung: (
    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5A2.25 2.25 0 0012.75 4.5h-1.5A2.25 2.25 0 009 6.75v1.5M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.375-1.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75z" />
    </svg>
  ),
  verlauf: (
    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
};

export function AnalysisDashboard({ data, onReset }: AnalysisDashboardProps) {
  const {
    meta, werte, zusammenfassung_kurz, zusammenfassung_detail,
    ampel, ampel_begruendung, hinweise, validierung,
  } = data;

  const hasWarnings = validierung.warnungen.length > 0 || validierung.auffaellige_felder.length > 0;
  const cfg = ampelConfig[ampel];

  // Metric tiers
  const primaryKeys = ['skelettmuskel', 'koerperfettanteil', 'grundumsatz'];
  const secondaryKeys = Object.keys(werte).filter(
    k => !['gewicht', 'bmi', ...primaryKeys].includes(k) && werte[k] !== null,
  );

  const gewicht = werte.gewicht;
  const weightBarPercent = (() => {
    if (!gewicht || gewicht.wert === null || gewicht.normal_min === null || gewicht.normal_max === null) return null;
    const range = gewicht.normal_max - gewicht.normal_min;
    const extMin = gewicht.normal_min - range * 0.5;
    const extMax = gewicht.normal_max + range * 0.5;
    return Math.max(2, Math.min(98, ((gewicht.wert - extMin) / (extMax - extMin)) * 100));
  })();

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-12 pb-32">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="mb-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">
            Ihre Körperzusammensetzung im Detail
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="font-label text-xs font-bold uppercase tracking-wider">{meta.datum}</span>
            </div>
            <span className="text-outline-variant">·</span>
            <span className="font-label text-xs font-bold uppercase tracking-wider">{meta.name}</span>
            <span className="text-outline-variant">·</span>
            <span className="bg-tertiary-container/20 text-tertiary font-label text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              Erkennungsrate {Math.round(meta.confidence * 100)}%
            </span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:bg-surface-container transition-all duration-200 flex-shrink-0 self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Neue Analyse
        </button>
      </header>

      {/* ── Interpretation card (first, most prominent) ─────────── */}
      <div className="mb-10 bg-surface-container-lowest rounded-2xl p-10 border border-outline-variant/10 shadow-sm">
        {/* Status pill — integrated, not a banner */}
        <div className="mb-6">
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-label ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* Interpretation content */}
        <p className="font-headline text-xl font-semibold text-on-surface leading-relaxed mb-4 max-w-3xl">
          {zusammenfassung_kurz}
        </p>
        <p className="text-base text-on-surface-variant leading-relaxed max-w-3xl">
          {zusammenfassung_detail}
        </p>

        {/* Ampel reasoning — calm footer note */}
        {ampel_begruendung && (
          <p className="mt-6 pt-6 border-t border-outline-variant/10 text-sm text-on-surface-variant/70 leading-relaxed italic">
            {ampel_begruendung}
          </p>
        )}
      </div>

      {/* ── Extraction quality notice (soft, informational) ─────── */}
      {hasWarnings && (
        <div className="mb-10 flex items-start gap-3 px-5 py-4 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface-variant">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <span className="font-label text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 block mb-1">
              Hinweise zur Datenqualität
            </span>
            <ul className="text-sm text-on-surface-variant/80 space-y-0.5">
              {validierung.warnungen.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
              {validierung.auffaellige_felder.map((f, i) => <li key={`f-${i}`}>Auffälliger Wert: {f}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* ── Primary metrics ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Hero: Gewicht */}
        {gewicht && gewicht.wert !== null && (
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/5 shadow-sm">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-primary/70">Aktuelles Gewicht</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline text-5xl font-extrabold text-on-surface tracking-tight">{gewicht.wert}</span>
                  <span className="text-xl font-medium text-on-surface-variant">{gewicht.einheit}</span>
                </div>
              </div>
              {gewicht.normal_min !== null && gewicht.normal_max !== null && (
                <span className="text-[11px] text-on-surface-variant/50 font-label text-right leading-relaxed">
                  Referenz<br />{gewicht.normal_min}–{gewicht.normal_max} {gewicht.einheit}
                </span>
              )}
            </div>
            {weightBarPercent !== null && (
              <div className="relative pt-2">
                {/* Three-segment range bar */}
                <div className="h-1.5 w-full rounded-full flex overflow-hidden">
                  <div className="h-full bg-secondary-container/50 w-1/4" />
                  <div className="h-full bg-tertiary/25 w-1/2" />
                  <div className="h-full bg-error-container/50 w-1/4" />
                </div>
                {/* Indicator dot */}
                <div
                  className="absolute top-1 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${weightBarPercent}%` }}
                >
                  <div className="w-4 h-4 bg-primary border-[3px] border-white rounded-full shadow-md" />
                </div>
                <div className="flex justify-between mt-5 text-[10px] font-bold uppercase text-on-surface-variant/40 tracking-widest">
                  <span>Untergewicht</span>
                  <span>Normalbereich</span>
                  <span>Übergewicht</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BMI */}
        {werte.bmi && werte.bmi.wert !== null && (
          <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/5 shadow-sm flex flex-col">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-2">Body Mass Index</span>
            <span className="font-headline text-5xl font-extrabold text-on-surface tracking-tight">{werte.bmi.wert}</span>
            <div className="flex-grow" />
            <div className="mt-8 pt-6 border-t border-outline-variant/10">
              <p className="text-sm text-on-surface-variant leading-relaxed italic">
                {werte.bmi.normal_min !== null && werte.bmi.normal_max !== null
                  ? `Normbereich liegt zwischen ${werte.bmi.normal_min} und ${werte.bmi.normal_max} kg/m².`
                  : 'Body-Mass-Index: Körpergewicht im Verhältnis zur Körpergröße.'}
              </p>
            </div>
          </div>
        )}

        {/* Tier-1 metric cards */}
        {primaryKeys.filter(k => werte[k]).map((key) => (
          <div key={key} className="md:col-span-4">
            <ValueCard title={key} data={werte[key]} />
          </div>
        ))}
      </div>

      {/* ── Secondary metrics ────────────────────────────────────── */}
      {secondaryKeys.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50">
              Weitere Messwerte
            </span>
            <div className="flex-grow h-px bg-outline-variant/20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {secondaryKeys.map((key) => (
              <div key={key} className="md:col-span-4">
                <ValueCard title={key} data={werte[key]} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommendations ──────────────────────────────────────── */}
      <section className="mt-16">
        <div className="flex items-center gap-4 mb-8">
          <h3 className="font-headline text-xl font-bold text-on-surface">Empfehlungen für Ihren Alltag</h3>
          <div className="flex-grow h-px bg-outline-variant/20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(Object.entries(hinweise) as [string, string[]][]).slice(0, 2).map(([key, items]) => (
            <div
              key={key}
              className="p-7 bg-surface-container-lowest rounded-xl border border-outline-variant/10 flex gap-4 transition-colors duration-200 hover:bg-surface-container"
            >
              {HINT_ICON[key]}
              <div>
                <h4 className="font-headline font-bold text-sm text-on-surface mb-2">{HINT_LABEL[key] ?? key}</h4>
                <ul className="space-y-2">
                  {items.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs text-on-surface-variant leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* Verlauf CTA */}
          {hinweise.verlauf && hinweise.verlauf.length > 0 && (
            <div className="p-7 bg-primary text-on-primary rounded-xl flex gap-4 shadow-lg shadow-primary/10 cursor-default">
              <svg className="w-5 h-5 flex-shrink-0 opacity-70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div>
                <h4 className="font-headline font-bold text-sm mb-2">{HINT_LABEL['verlauf']}</h4>
                <ul className="space-y-2">
                  {hinweise.verlauf.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs opacity-75 leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
