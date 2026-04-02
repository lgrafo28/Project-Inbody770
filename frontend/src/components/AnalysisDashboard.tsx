import type { AnalysisResponse } from '../types';
import { ValueCard } from './ValueCard';

interface AnalysisDashboardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

const ampelConfig = {
  gruen: {
    banner: 'bg-tertiary-container/20 border-tertiary/20 text-tertiary',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    label: 'Alles im Normbereich',
  },
  gelb: {
    banner: 'bg-error-container/30 border-error/20 text-error',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    label: 'Einzelne Werte auffällig',
  },
  rot: {
    banner: 'bg-error-container/50 border-error/30 text-error',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
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
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  ernaehrung: (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5A2.25 2.25 0 0012.75 4.5h-1.5A2.25 2.25 0 009 6.75v1.5M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.375-1.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75z" />
    </svg>
  ),
  verlauf: (
    <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
};

export function AnalysisDashboard({ data, onReset }: AnalysisDashboardProps) {
  const { meta, werte, zusammenfassung_kurz, zusammenfassung_detail, ampel, ampel_begruendung, hinweise, validierung } = data;
  const hasWarnings = validierung.warnungen.length > 0 || validierung.auffaellige_felder.length > 0;
  const cfg = ampelConfig[ampel];

  // Separate hero metrics from grid metrics
  const heroKeys = ['gewicht', 'bmi', 'skelettmuskel', 'koerperfettanteil', 'grundumsatz'];
  const gridKeys = Object.keys(werte).filter(k => !heroKeys.includes(k) && werte[k] !== null);

  // Weight range slider position
  const gewicht = werte.gewicht;
  const weightBarPercent = (() => {
    if (!gewicht || gewicht.wert === null || gewicht.normal_min === null || gewicht.normal_max === null) return null;
    const range = gewicht.normal_max - gewicht.normal_min;
    const extMin = gewicht.normal_min - range * 0.5;
    const extMax = gewicht.normal_max + range * 0.5;
    return Math.max(2, Math.min(98, ((gewicht.wert - extMin) / (extMax - extMin)) * 100));
  })();

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-12 pb-24">

      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-2">
            Ihre Körperzusammensetzung im Detail
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span className="font-label text-xs font-bold uppercase tracking-wider">{meta.datum}</span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-outline-variant/30 pl-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="font-label text-xs font-bold uppercase tracking-wider">{meta.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-tertiary-container/20 px-2 py-0.5 rounded text-tertiary font-label text-[10px] font-bold uppercase">
              Erkennungsrate {Math.round(meta.confidence * 100)}%
            </div>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:bg-surface-container transition-all duration-200 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Neue Analyse
        </button>
      </header>

      {/* Status banner */}
      <div className={`mb-6 flex items-start gap-3 p-4 rounded-xl border ${cfg.banner}`}>
        {cfg.icon}
        <div>
          <span className="font-headline font-bold text-sm">{cfg.label}</span>
          <p className="text-sm font-medium leading-relaxed opacity-80 mt-0.5">{ampel_begruendung}</p>
        </div>
      </div>

      {/* Validation warnings */}
      {hasWarnings && (
        <div className="mb-6 p-4 rounded-xl bg-error-container/40 border border-error/15 flex items-start gap-3">
          <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <h4 className="font-headline font-bold text-error text-sm mb-1">Qualitäts-Hinweise zur Extraktion</h4>
            <ul className="text-sm text-error/80 space-y-0.5 list-disc list-inside">
              {validierung.warnungen.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
              {validierung.auffaellige_felder.map((f, i) => <li key={`f-${i}`}>Auffälliger Wert: {f}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* Metric grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Hero: Gewicht (col-span-8) */}
        {gewicht && gewicht.wert !== null && (
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/5 shadow-sm transition-all hover:shadow-md duration-200">
            <div className="flex justify-between items-start mb-10">
              <div>
                <span className="font-label text-xs font-bold uppercase text-primary tracking-widest">Aktuelles Gewicht</span>
                <h2 className="font-headline text-5xl font-extrabold text-on-surface tracking-tight mt-2">
                  {gewicht.wert}{' '}
                  <span className="text-2xl font-medium text-on-surface-variant">{gewicht.einheit}</span>
                </h2>
              </div>
              {gewicht.normal_min !== null && gewicht.normal_max !== null && (
                <div className="text-right">
                  <span className="text-on-surface-variant text-xs font-label">
                    Referenz: {gewicht.normal_min}–{gewicht.normal_max} {gewicht.einheit}
                  </span>
                </div>
              )}
            </div>
            {weightBarPercent !== null && (
              <div className="relative pt-4">
                <div className="h-1.5 w-full bg-surface-container rounded-full flex overflow-hidden">
                  <div className="h-full bg-secondary-container/40 w-1/4" />
                  <div className="h-full bg-tertiary/40 w-1/2" />
                  <div className="h-full bg-error-container/40 w-1/4" />
                </div>
                <div
                  className="absolute top-3 -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${weightBarPercent}%` }}
                >
                  <div className="w-4 h-4 bg-primary border-4 border-surface-container-lowest rounded-full shadow-sm" />
                  <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-tighter">Ihr Wert</span>
                </div>
                <div className="flex justify-between mt-5 text-[10px] font-bold uppercase text-on-surface-variant/60 tracking-tighter">
                  <span>Untergewicht</span>
                  <span>Normalbereich</span>
                  <span>Übergewicht</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BMI (col-span-4) */}
        {werte.bmi && werte.bmi.wert !== null && (
          <div className="md:col-span-4 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/5 shadow-sm flex flex-col justify-between">
            <div>
              <span className="font-label text-xs font-bold uppercase text-on-surface-variant tracking-widest">Body Mass Index</span>
              <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mt-2">{werte.bmi.wert}</h2>
            </div>
            <div className="mt-8 border-t border-outline-variant/10 pt-4">
              <p className="text-sm text-on-surface-variant leading-relaxed italic">
                {werte.bmi.normal_min !== null && werte.bmi.normal_max !== null
                  ? `Normbereich: ${werte.bmi.normal_min}–${werte.bmi.normal_max} kg/m²`
                  : 'BMI – Körpermasse im Verhältnis zur Körpergröße'}
              </p>
            </div>
          </div>
        )}

        {/* Skelettmuskelmasse (col-span-4) */}
        {werte.skelettmuskel && (
          <div className="md:col-span-4">
            <ValueCard title="skelettmuskel" data={werte.skelettmuskel} />
          </div>
        )}

        {/* Körperfettanteil (col-span-4) */}
        {werte.koerperfettanteil && (
          <div className="md:col-span-4">
            <ValueCard title="koerperfettanteil" data={werte.koerperfettanteil} />
          </div>
        )}

        {/* Grundumsatz (col-span-4) */}
        {werte.grundumsatz && (
          <div className="md:col-span-4">
            <ValueCard title="grundumsatz" data={werte.grundumsatz} />
          </div>
        )}

        {/* Remaining metrics */}
        {gridKeys.map((key) => (
          <div key={key} className="md:col-span-4">
            <ValueCard title={key} data={werte[key]} />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-10 bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/5 shadow-sm">
        <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Zusammenfassung</h3>
        <p className="font-semibold text-primary leading-relaxed mb-3">{zusammenfassung_kurz}</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">{zusammenfassung_detail}</p>
      </div>

      {/* Recommendations */}
      <section className="mt-10">
        <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Empfehlungen für Ihren Alltag</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.entries(hinweise) as [string, string[]][]).slice(0, 2).map(([key, items]) => (
            <div key={key} className="p-6 bg-surface-container/50 rounded-xl border border-outline-variant/10 flex gap-4 transition-colors hover:bg-surface-container">
              {HINT_ICON[key]}
              <div>
                <h4 className="font-bold text-sm mb-2 text-on-surface">{HINT_LABEL[key] ?? key}</h4>
                <ul className="space-y-1.5">
                  {items.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs text-on-surface-variant leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          {/* CTA card: Verlauf */}
          {hinweise.verlauf && hinweise.verlauf.length > 0 && (
            <div
              className="p-6 bg-primary text-on-primary rounded-xl flex items-start gap-4 shadow-lg shadow-primary/10 cursor-default"
            >
              <svg className="w-5 h-5 flex-shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div>
                <h4 className="font-bold text-sm mb-2">{HINT_LABEL['verlauf']}</h4>
                <ul className="space-y-1.5">
                  {hinweise.verlauf.slice(0, 2).map((item, idx) => (
                    <li key={idx} className="text-xs opacity-80 leading-relaxed">{item}</li>
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
