import type { AnalysisResponse } from '../types';
import { ValueCard } from './ValueCard';
import { ShieldCheck, AlertCircle, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface AnalysisDashboardProps {
  data: AnalysisResponse;
  onReset: () => void;
}

export function AnalysisDashboard({ data, onReset }: AnalysisDashboardProps) {
  const { meta, werte, zusammenfassung_kurz, zusammenfassung_detail, ampel, ampel_begruendung, hinweise, validierung } = data;

  const getAmpelIcon = () => {
    switch (ampel) {
      case 'gruen': return <ShieldCheck className="w-8 h-8 text-status-green-border" />;
      case 'gelb': return <AlertCircle className="w-8 h-8 text-status-yellow-border" />;
      case 'rot': return <AlertTriangle className="w-8 h-8 text-status-red-border" />;
    }
  };

  const ampelColors = {
    gruen: "bg-status-green-bg border-status-green-border text-status-green-text",
    gelb: "bg-status-yellow-bg border-status-yellow-border text-status-yellow-text",
    rot: "bg-status-red-bg border-status-red-border text-status-red-text"
  };

  const hasWarnings = validierung.warnungen.length > 0 || validierung.auffaellige_felder.length > 0;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{meta.name}</h2>
          <div className="flex items-center gap-2 text-slate-500 mt-1">
            <span className="font-mono text-sm">{meta.datum}</span>
            <span>•</span>
            <span className="text-sm">InBody 770 Analyse</span>
            <span>•</span>
            <span className="text-sm flex items-center gap-1">
               <FileText className="w-3 h-3" />
               Erkennungsrate {Math.round(meta.confidence * 100)}%
            </span>
          </div>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Neue Analyse
        </button>
      </div>

      {/* VALIDATION WARNINGS (Technical / Plausibility) */}
      {hasWarnings && (
        <div className="mb-6 p-4 rounded-lg bg-orange-50 border border-orange-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-orange-800 text-sm mb-1">Qualitäts-Hinweise zur Extraktion</h4>
            <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
              {validierung.warnungen.map((warn, i) => <li key={`w-${i}`}>{warn}</li>)}
              {validierung.auffaellige_felder.map((feld, i) => <li key={`f-${i}`}>Auffälliger Wert: {feld}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: STATUS & SUMMARY */}
        <div className="lg:col-span-1 space-y-6">
          <div className={cn(
            "p-6 rounded-2xl border flex flex-col gap-4",
            ampelColors[ampel]
          )}>
            <div className="flex items-center gap-3">
              {getAmpelIcon()}
              <h3 className="text-xl font-bold capitalize">Status {ampel}</h3>
            </div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              {ampel_begruendung}
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Zusammenfassung</h3>
            <p className="font-medium text-primary-700 mb-4 leading-relaxed">
              {zusammenfassung_kurz}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {zusammenfassung_detail}
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Handlungsempfehlungen</h3>
            
            {Object.entries(hinweise).map(([key, items]) => (
              <div key={key} className="mb-4 last:mb-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{key}</h4>
                <ul className="space-y-2">
                  {items.map((item: string, idx: number) => (
                    <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                      <span className="text-primary-500 font-bold mt-[-1px]">•</span> 
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COL: METRICS GRID */}
        <div className="lg:col-span-2">
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm h-full">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              Detaillierte Messwerte
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(werte).map(([key, messwert]) => (
                <ValueCard key={key} title={key} data={messwert} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
