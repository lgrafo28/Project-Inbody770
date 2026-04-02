export interface DocumentMeta {
  dokument_typ: string;
  name: string;
  datum: string;
  confidence: number;
}

export interface Messwert {
  wert: number | null;
  einheit: string | null;
  normal_min: number | null;
  normal_max: number | null;
  confidence: number | null;
}

export interface WerteList {
  [key: string]: Messwert | null;
}

export interface Hinweise {
  training: string[];
  ernaehrung: string[];
  verlauf: string[];
}

export interface ValidierungsErgebnis {
  fehlende_felder: string[];
  auffaellige_felder: string[];
  warnungen: string[];
}

export interface AnalysisResponse {
  meta: DocumentMeta;
  werte: WerteList;
  zusammenfassung_kurz: string;
  zusammenfassung_detail: string;
  ampel: 'gruen' | 'gelb' | 'rot';
  ampel_begruendung: string;
  hinweise: Hinweise;
  validierung: ValidierungsErgebnis;
}
