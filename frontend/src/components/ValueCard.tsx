import type { Messwert } from '../types';
import { cn } from '../lib/utils';

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
  ecw_tbw: "ECW / TBW"
};

export function ValueCard({ title, data }: ValueCardProps) {
  if (!data) return null;

  const hasWert = data.wert !== null && data.wert !== undefined;

  const outOfBounds = hasWert && (
    (data.normal_min !== null && data.wert! < data.normal_min) || 
    (data.normal_max !== null && data.wert! > data.normal_max)
  );
    
  const lowConfidence = data.confidence !== null && data.confidence < 0.85;

  return (
    <div className={cn(
      "p-5 rounded-2xl border bg-surface shadow-sm transition-all hover:shadow-md",
      outOfBounds ? "border-status-yellow-border/50" : "border-slate-100"
    )}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-semibold text-slate-500 tracking-wide">
          {LABEL_MAP[title] || title.replace(/_/g, ' ')}
        </h4>
        {lowConfidence && data.confidence !== null && (
          <div className="group relative flex items-center">
            <span className="flex h-2 w-2 rounded-full bg-orange-400 mr-1.5 opacity-70"></span>
            <span className="text-[10px] text-orange-500 font-medium">Unsicher</span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 font-normal">
              Erkennungssicherheit liegt nur bei {Math.round(data.confidence * 100)}%. Bitte Wert manuell prüfen.
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn(
          "text-2xl font-bold font-mono tracking-tight",
          outOfBounds ? "text-status-yellow-text" : "text-slate-900",
          !hasWert && "text-slate-400 text-lg"
        )}>
          {hasWert ? data.wert : 'Nicht erkannt'}
        </span>
        {hasWert && data.einheit && (
          <span className="text-slate-500 font-medium ml-1">
            {data.einheit}
          </span>
        )}
      </div>
      
      {hasWert && data.normal_min !== null && data.normal_max !== null && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
            <span>{data.normal_min}</span>
            <span>{data.normal_max}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden relative">
            {/* Visual range indicator logic */}
            <div className="absolute inset-y-0 left-1/4 right-1/4 bg-status-green-border/20 rounded-full" />
            <div 
              className={cn(
                "absolute inset-y-0 w-1.5 rounded-full z-10 -ml-[3px]",
                outOfBounds ? "bg-status-yellow-border" : "bg-status-green-border"
              )}
              style={{
                // Normalize position relative to a wider visual scale (e.g. min - 20%, max + 20%)
                left: (() => {
                  const range = data.normal_max - data.normal_min;
                  const extendedMin = data.normal_min - range * 0.5;
                  const extendedMax = data.normal_max + range * 0.5;
                  const totalRange = extendedMax - extendedMin;
                  const percent = Math.max(0, Math.min(100, ((data.wert! - extendedMin) / totalRange) * 100));
                  return `${percent}%`;
                })()
              }}
            />
          </div>
          <div className="text-center text-[10px] uppercase text-slate-400 font-semibold tracking-wider mt-1">
            Referenzbereich
          </div>
        </div>
      )}
    </div>
  );
}
