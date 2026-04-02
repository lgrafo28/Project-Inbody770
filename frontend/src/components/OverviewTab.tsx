import type { AnalysisResponse, WerteList } from '../types';
import { ValueCard } from './ValueCard';

interface OverviewTabProps {
  data: AnalysisResponse;
}

// Shared label map — same as in ValueCard/AnalysisDashboard
const LABEL_MAP: Record<string, string> = {
  gewicht: 'Körpergewicht',
  skelettmuskel: 'Skelettmuskelmasse',
  koerperfett: 'Körperfettmasse',
  bmi: 'BMI',
  koerperfettanteil: 'Körperfettanteil',
  viszeralfett: 'Viszeraler Fettbereich',
  grundumsatz: 'Grundumsatz',
  koerperwasser: 'Körperwasser',
  ecw_tbw: 'ECW / TBW',
};

// Returns the human-readable label of the metric most centered within its normal range.
// Falls back to the first non-null metric if no range data is available.
function bestMetricLabel(werte: WerteList): string | null {
  let best: { key: string; score: number } | null = null;
  for (const [key, m] of Object.entries(werte)) {
    if (!m || m.wert === null || m.normal_min === null || m.normal_max === null) continue;
    const range = m.normal_max - m.normal_min;
    if (range <= 0) continue;
    // Score: 1 = perfectly centered, 0 = at boundary, negative = out of range
    const score = 1 - Math.abs(((m.wert - m.normal_min) / range) - 0.5) * 2;
    if (!best || score > best.score) best = { key, score };
  }
  if (best) return LABEL_MAP[best.key] ?? best.key;
  // Fallback: first metric with any non-null value
  const firstKey = Object.entries(werte).find(([, m]) => m?.wert !== null)?.[0];
  return firstKey ? (LABEL_MAP[firstKey] ?? firstKey) : null;
}

const AMPEL_MAP = {
  gruen: { label: 'Sehr Gut',    color: 'text-emerald-600' },
  gelb:  { label: 'Beobachten', color: 'text-amber-600' },
  rot:   { label: 'Kritisch',   color: 'text-error' },
} as const;

export function OverviewTab({ data }: OverviewTabProps) {
  const { meta, werte, zusammenfassung_kurz, zusammenfassung_detail, ampel, validierung } = data;

  // --- Derived display values ---
  const signalPercent = Math.round(meta.confidence * 100);
  const signalBadgeClass =
    signalPercent >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
    : signalPercent >= 75 ? 'bg-amber-50 text-amber-700 border border-amber-100'
    : 'bg-error-container text-error border border-error/20';

  const statusCfg = AMPEL_MAP[ampel as keyof typeof AMPEL_MAP] ?? AMPEL_MAP.gruen;

  const beobachtung = validierung.auffaellige_felder.length > 0
    ? (LABEL_MAP[validierung.auffaellige_felder[0]] ?? validierung.auffaellige_felder[0])
    : 'Unauffällig';
  const beobachtungColor = validierung.auffaellige_felder.length > 0 ? 'text-amber-600' : 'text-emerald-600';

  const qualitaet = meta.confidence >= 0.9 ? 'Hoch' : meta.confidence >= 0.75 ? 'Mittel' : 'Niedrig';
  const qualitaetColor = meta.confidence >= 0.9 ? 'text-cyan-600' : meta.confidence >= 0.75 ? 'text-amber-600' : 'text-error';

  const staerksterWert = bestMetricLabel(werte);

  // --- Conditional rendering flags ---
  const hasHero = !!(zusammenfassung_kurz || zusammenfassung_detail);
  const primaryKeys = ['gewicht', 'bmi', 'skelettmuskel', 'koerperfettanteil'];
  const presentPrimaryKeys = primaryKeys.filter(k => werte[k]?.wert != null);
  const hasKoerperzusammensetzung = werte.koerperwasser?.wert != null || werte.koerperfett?.wert != null;
  const hasWarnings = validierung.warnungen.length > 0 || validierung.auffaellige_felder.length > 0;

  return (
    <div className="max-w-screen-xl mx-auto px-8 pt-12 pb-32">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
            Ergebnisübersicht
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-on-surface-variant font-medium">
            {meta.name && <span className="text-lg">{meta.name}</span>}
            {meta.name && meta.datum && <span className="w-1 h-1 rounded-full bg-outline-variant" />}
            {meta.datum && <span>{meta.datum}</span>}
            {meta.alter != null && (
              <>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span>{meta.alter} Jahre</span>
              </>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 ${signalBadgeClass}`}>
          <span className="w-2 h-2 rounded-full bg-current opacity-60" />
          <span>{signalPercent}% Signalqualität</span>
        </div>
      </div>

      {/* ── Hero Card + Summary Chips ───────────────────────────── */}
      <div className="grid grid-cols-12 gap-6 mb-10">

        {/* Hero: Clinical interpretation */}
        {hasHero && (
          <section className="col-span-12 lg:col-span-8">
            <div className="bg-gradient-to-br from-primary to-primary-container p-8 rounded-xl text-on-primary h-full flex flex-col justify-center shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                <span className="text-sm font-bold uppercase tracking-widest opacity-80">Klinische Interpretation</span>
              </div>
              {zusammenfassung_kurz && (
                <p className="text-xl font-bold leading-snug mb-3">{zusammenfassung_kurz}</p>
              )}
              {zusammenfassung_detail && (
                <p className="text-on-primary-container text-base leading-relaxed">{zusammenfassung_detail}</p>
              )}
            </div>
          </section>
        )}

        {/* Summary chips: 2×2 grid */}
        <section className={`col-span-12 ${hasHero ? 'lg:col-span-4' : ''} grid grid-cols-2 gap-4`}>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Gesamtstatus</span>
            <span className={`text-xl font-extrabold ${statusCfg.color}`}>{statusCfg.label}</span>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Stärkster Wert</span>
            <span className="text-xl font-extrabold text-primary">{staerksterWert ?? '—'}</span>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Beobachtung</span>
            <span className={`text-xl font-extrabold ${beobachtungColor}`}>{beobachtung}</span>
          </div>
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Qualität</span>
            <span className={`text-xl font-extrabold ${qualitaetColor}`}>{qualitaet}</span>
          </div>
        </section>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────── */}
      {presentPrimaryKeys.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {presentPrimaryKeys.map(key => (
            <ValueCard key={key} title={key} data={werte[key]!} />
          ))}
        </section>
      )}

      {/* ── Körperzusammensetzung ────────────────────────────────── */}
      {hasKoerperzusammensetzung && (
        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm mb-10">
          <h3 className="text-lg font-bold mb-6 text-on-surface tracking-tight font-headline">
            Körperzusammensetzung
          </h3>
          <div className="divide-y divide-slate-100">
            {werte.koerperwasser?.wert != null && (
              <div className="flex justify-between items-end py-4 first:pt-0">
                <div>
                  <span className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">
                    Körperwasser
                  </span>
                  <span className="text-xl font-extrabold text-on-surface">
                    {werte.koerperwasser.wert} {werte.koerperwasser.einheit}
                  </span>
                </div>
                {werte.koerperwasser.normal_min != null && werte.koerperwasser.normal_max != null && (
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Norm: {werte.koerperwasser.normal_min}–{werte.koerperwasser.normal_max}
                  </span>
                )}
              </div>
            )}
            {werte.koerperfett?.wert != null && (
              <div className="flex justify-between items-end py-4 last:pb-0">
                <div>
                  <span className="block text-xs font-bold text-outline-variant uppercase tracking-widest mb-1">
                    Körperfettmasse
                  </span>
                  <span className="text-xl font-extrabold text-on-surface">
                    {werte.koerperfett.wert} {werte.koerperfett.einheit}
                  </span>
                </div>
                {werte.koerperfett.normal_min != null && werte.koerperfett.normal_max != null && (
                  <span className="text-xs font-semibold text-on-surface-variant">
                    Norm: {werte.koerperfett.normal_min}–{werte.koerperfett.normal_max}
                  </span>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Validation notice ────────────────────────────────────── */}
      {hasWarnings && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-surface-container border border-outline-variant/20 text-on-surface-variant">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 block mb-1">
              Hinweise zur Datenqualität
            </span>
            <ul className="text-sm text-on-surface-variant/80 space-y-0.5">
              {validierung.warnungen.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
              {validierung.auffaellige_felder.map((f, i) => (
                <li key={`f-${i}`}>Auffälliger Wert: {LABEL_MAP[f] ?? f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
