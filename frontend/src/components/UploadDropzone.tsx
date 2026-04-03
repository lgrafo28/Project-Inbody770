import React, { useCallback, useState } from 'react';
import type { AnalysisResponse } from '../types';

interface UploadDropzoneProps {
  onUploadStart: () => void;
  onUploadSuccess: (data: AnalysisResponse) => void;
  onUploadError: (error: string) => void;
}

const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const img = new Image();
  const imageUrl = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Bild konnte nicht geladen werden.'));
    img.src = imageUrl;
  });

  const maxDimension = 1800;
  let { width, height } = img;

  if (width > height && width > maxDimension) {
    height = Math.round((height * maxDimension) / width);
    width = maxDimension;
  } else if (height >= width && height > maxDimension) {
    width = Math.round((width * maxDimension) / height);
    height = maxDimension;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    URL.revokeObjectURL(imageUrl);
    throw new Error('Canvas-Kontext nicht verfügbar.');
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.8);
  });

  URL.revokeObjectURL(imageUrl);

  if (!blob) {
    throw new Error('Bildkomprimierung fehlgeschlagen.');
  }

  const compressedName = file.name.replace(/\.(png|jpe?g|webp)$/i, '.jpg');

  return new File([blob], compressedName, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

export function UploadDropzone({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Optionale Patientendaten — werden beim Upload als FormData-Felder mitgeschickt
  const [geschlecht, setGeschlecht] = useState<'m' | 'w' | null>(null);
  const [alter, setAlter] = useState<number | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      onUploadError('Bitte nur PDF, JPG oder PNG hochladen.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      onUploadError(`Datei ist zu groß. Bitte maximal ${MAX_FILE_SIZE_MB} MB hochladen.`);
      return;
    }

    onUploadStart();

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

      // Bilder komprimieren, PDFs unverändert lassen
      const optimizedFile =
        file.type === 'application/pdf' || file.name.match(/\.pdf$/i)
          ? file
          : await compressImage(file);

      const formData = new FormData();
      formData.append('file', optimizedFile);

      // Optionale Patientendaten mitsenden
      if (geschlecht) formData.append('geschlecht', geschlecht);
      if (alter !== null) formData.append('alter', String(alter));

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = 'Upload fehlgeschlagen (Unbekannter Fehler)';
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errorDetail = errData.detail;
          } else {
            errorDetail = `HTTP ${response.status} Error`;
          }
        } catch {
          errorDetail = `Netzwerkfehler oder Server nicht erreichbar (${response.status})`;
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (e: any) {
      onUploadError(e.message || 'Es ist ein Fehler aufgetreten');
    }
  }, [geschlecht, alter, onUploadStart, onUploadSuccess, onUploadError]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="pt-12 pb-24 px-8 max-w-7xl mx-auto">
      <header className="mb-16 max-w-3xl py-4">
        <span className="inline-block px-3 py-1 bg-tertiary-container/10 text-on-tertiary-fixed-variant font-label text-[0.7rem] font-bold uppercase tracking-widest rounded-full mb-4">
          Precision Diagnostics
        </span>
        <h1 className="font-headline text-[3rem] leading-[1.1] font-extrabold tracking-tight text-on-surface mb-5">
          Befunde einfach auswerten.
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed font-body">
          Laden Sie einen InBody-770-Scan hoch. Für die schnellste Analyse empfehlen wir
          JPG oder PNG statt PDF.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
        <section className="space-y-8">
          {/* Optionale Patientendaten */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Geschlecht-Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGeschlecht(g => g === 'm' ? null : 'm')}
                className={`px-5 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  geschlecht === 'm'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white text-on-surface border-outline-variant hover:border-primary/40'
                }`}
              >
                Männlich
              </button>
              <button
                type="button"
                onClick={() => setGeschlecht(g => g === 'w' ? null : 'w')}
                className={`px-5 py-2 rounded-lg text-sm font-bold border transition-colors ${
                  geschlecht === 'w'
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-white text-on-surface border-outline-variant hover:border-primary/40'
                }`}
              >
                Weiblich
              </button>
            </div>

            {/* Alter-Input */}
            <input
              type="number"
              min={10}
              max={100}
              placeholder="Alter (Jahre)"
              value={alter ?? ''}
              onChange={e => setAlter(e.target.value ? Number(e.target.value) : null)}
              className="w-36 px-4 py-2 rounded-lg text-sm font-medium border border-outline-variant bg-white text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-colors"
            />

            {/* Hinweis: optional */}
            <span className="text-xs text-outline font-label uppercase tracking-widest">
              Optional
            </span>
          </div>

          <div className="bg-white rounded-xl p-10 shadow-[0px_24px_64px_rgba(0,86,179,0.12)] border border-primary/5 group transition-all duration-300 hover:shadow-[0px_32px_80px_rgba(0,86,179,0.16)]">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-6 transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-primary/20 bg-primary/[0.02] group-hover:border-primary/40'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8 17v-2h8v2H8zm0-4v-2h8v2H8z" />
                  <path d="M11 14V9l-2 2-1.41-1.41L11 6.17l3.41 3.42L13 11l-2-2v5h-2z" fillOpacity="0" />
                </svg>
              </div>

              <div>
                <h3 className="font-headline text-2xl font-extrabold text-on-surface mb-2 tracking-tight">
                  InBody-770 Befund zur Analyse hinzufügen
                </h3>
                <p className="text-on-surface-variant max-w-sm mx-auto font-body text-sm leading-relaxed">
                  PDF oder Bilddatei hochladen. Bilder werden vor dem Upload für eine
                  schnellere Analyse optimiert.
                </p>
              </div>

              <label className="bg-primary hover:bg-primary-container text-on-primary px-12 py-4 rounded-xl font-extrabold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/25 cursor-pointer">
                Datei auswählen
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={onChange}
                />
              </label>

              {/* Kamera-Button — nur auf Mobile sichtbar */}
              <label className="md:hidden bg-primary hover:bg-primary-container text-on-primary px-12 py-4 rounded-xl font-extrabold tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/25 cursor-pointer">
                Foto aufnehmen
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onChange}
                />
              </label>

              <p className="text-[0.7rem] text-outline font-label font-bold uppercase tracking-widest">
                Maximale Dateigröße: 15 MB · PDF, JPG, PNG
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-7 rounded-xl border border-outline-variant/10 shadow-sm transition-all duration-300 hover:border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h4 className="text-sm font-extrabold text-on-surface font-headline mb-2 tracking-tight">
                KI-Extraktion
              </h4>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                Präzise Werterkennung durch fortschrittliche Modelle in Sekunden.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-7 rounded-xl border border-outline-variant/10 shadow-sm transition-all duration-300 hover:border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h4 className="text-sm font-extrabold text-on-surface font-headline mb-2 tracking-tight">
                Sicher & Verschlüsselt
              </h4>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                Befunde werden nach der Analyse nicht dauerhaft gespeichert.
              </p>
            </div>

            <div className="bg-surface-container-lowest p-7 rounded-xl border border-outline-variant/10 shadow-sm transition-all duration-300 hover:border-primary/20">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h4 className="text-sm font-extrabold text-on-surface font-headline mb-2 tracking-tight">
                Visuelle Analyse
              </h4>
              <p className="text-xs text-on-surface-variant font-body leading-relaxed">
                Automatisierte Visualisierung biometrischer Marker mit Referenzbereichen.
              </p>
            </div>
          </div>
        </section>

        <aside className="relative hidden lg:block">
          <div className="sticky top-24">
            <div className="relative bg-surface-container-lowest rounded-xl overflow-hidden shadow-2xl border border-outline-variant/10">
              <div className="p-10 space-y-8 select-none">
                <div className="flex justify-between items-start border-b border-slate-100 pb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <h5 className="text-[13px] font-extrabold uppercase tracking-[0.15em] text-on-surface font-headline">
                        Körperzusammensetzungs-Analyse
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Beispiel-Analyse · InBody 770
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-on-surface">ANALYSE-ERGEBNIS</div>
                    <div className="text-[10px] text-primary font-bold uppercase tracking-wider">
                      InBody 770 Clinical
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-tight font-headline">
                      Gewicht & BMI
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      Normalbereich: 18.5–25.0
                    </span>
                  </div>
                  {[
                    { label: 'BMI (kg/m²)', value: '23.8', width: '68%', color: 'bg-primary' },
                    { label: 'Skelettmuskel (SMM)', value: '34.8 kg', width: '82%', color: 'bg-tertiary-container' },
                    { label: 'Körperfett (BFM)', value: '14.2 kg', width: '42%', color: 'bg-primary' },
                  ].map((row) => (
                    <div key={row.label} className="grid grid-cols-[110px_1fr_60px] gap-6 items-center">
                      <span className="text-[11px] font-bold text-on-surface">{row.label}</span>
                      <div className="h-2 bg-slate-100 rounded-full relative overflow-hidden">
                        <div className={`absolute left-0 top-0 h-full ${row.color}`} style={{ width: row.width }} />
                      </div>
                      <span className="text-[12px] font-extrabold text-primary text-right">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <h6 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-6 font-headline">
                    Segmentale Mageranalyse
                  </h6>
                  <div className="grid grid-cols-2 gap-6">
                    {['Rechter Arm · 3.1 kg', 'Linker Arm · 3.0 kg'].map((label) => (
                      <div key={label} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase">{label.split('·')[0]}</span>
                          <span className="text-[11px] font-bold text-on-surface">{label.split('·')[1]}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-[104%] bg-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 right-8 z-20">
                <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-primary/10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-on-surface font-headline leading-tight">
                      Sofortige Analyse
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-body">
                      Ergebnis in &lt; 30s
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
