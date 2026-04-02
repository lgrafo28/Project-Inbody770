export function LoadingScreen() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center px-8 pt-16 pb-20">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* Left: Step Indicator */}
        <div className="lg:col-span-7 space-y-12">
          <div className="space-y-4">
            <h1 className="font-headline font-extrabold text-4xl lg:text-5xl text-on-surface tracking-tight leading-tight">
              Dokument wird analysiert...
            </h1>
            <p className="text-on-surface-variant text-lg font-medium max-w-xl">
              Messwerte werden extrahiert, geprüft und visuell für Ihr Dashboard aufbereitet.
            </p>
          </div>

          <div className="space-y-8 relative">
            {/* Connector line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-outline-variant/20" />

            {/* Step 1: Completed */}
            <div className="flex items-start gap-8 relative">
              <div className="z-10 bg-tertiary-container rounded-full p-2 flex items-center justify-center shadow-sm flex-shrink-0">
                <svg className="w-5 h-5 text-on-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="font-headline font-semibold text-on-surface-variant/80">Dokument wird gelesen</p>
                <p className="text-on-surface-variant text-sm mt-0.5">Vollständiger Scan der InBody-Matrix abgeschlossen.</p>
              </div>
            </div>

            {/* Step 2: Active */}
            <div className="flex items-start gap-8 relative">
              <div className="z-10 bg-primary ring-8 ring-primary/10 rounded-full p-2 flex items-center justify-center shadow-lg animate-pulse-soft flex-shrink-0">
                <svg className="w-5 h-5 text-on-primary animate-spin" style={{ animationDuration: '3s' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="pt-1">
                <p className="font-headline font-bold text-primary text-lg">Messwerte werden extrahiert</p>
                <p className="text-on-surface-variant font-medium text-sm mt-1 italic">Verarbeite Körperzusammensetzung und Segmental-Analyse...</p>
              </div>
            </div>

            {/* Step 3: Upcoming */}
            <div className="flex items-start gap-8 relative opacity-40">
              <div className="z-10 bg-surface-container-highest rounded-full p-2 flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-outline/20" />
              </div>
              <div className="pt-1">
                <p className="font-headline font-semibold text-outline">Plausibilität wird geprüft</p>
                <p className="text-on-surface-variant text-sm mt-0.5">Abgleich mit medizinischen Referenzwerten.</p>
              </div>
            </div>

            {/* Step 4: Upcoming */}
            <div className="flex items-start gap-8 relative opacity-40">
              <div className="z-10 bg-surface-container-highest rounded-full p-2 flex items-center justify-center border border-outline-variant/30 flex-shrink-0">
                <div className="w-5 h-5 rounded-full border-2 border-outline/20" />
              </div>
              <div className="pt-1">
                <p className="font-headline font-semibold text-outline">Ergebnis wird vorbereitet</p>
                <p className="text-on-surface-variant text-sm mt-0.5">Generierung der finalen Analyse-Übersicht.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Document Preview */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md aspect-[3/4.2] bg-surface-container-lowest rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden p-10 border border-outline-variant/20">
            {/* Skeleton content */}
            <div className="space-y-8 opacity-25 blur-[0.5px]">
              <div className="flex justify-between items-center">
                <div className="h-6 bg-surface-container-highest rounded-md w-1/3" />
                <div className="h-4 bg-surface-container-highest rounded-md w-20" />
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-outline-variant/50 rounded-full w-24" />
                <div className="grid grid-cols-1 gap-3">
                  <div className="h-10 bg-surface-container-low rounded-lg border border-outline-variant/10" />
                  <div className="h-10 bg-surface-container-low rounded-lg border border-outline-variant/10" />
                  <div className="h-10 bg-surface-container-low rounded-lg border border-outline-variant/10" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-3 bg-outline-variant/50 rounded-full w-32" />
                <div className="h-24 bg-surface-container-low rounded-xl flex items-end gap-3 p-4">
                  <div className="w-full bg-primary/20 h-3/4 rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-1/2 rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-5/6 rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-2/3 rounded-t-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-tertiary-container/10 rounded-xl border border-tertiary/5" />
                <div className="h-20 bg-tertiary-container/10 rounded-xl border border-tertiary/5" />
              </div>
            </div>

            {/* Scanning glow */}
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
              <div className="scanning-glow" />
            </div>

            {/* Activity badge */}
            <div className="absolute bottom-10 right-10 bg-primary text-on-primary text-[11px] uppercase tracking-widest font-bold px-4 py-2 rounded-full flex items-center gap-3 shadow-xl ring-4 ring-white/50">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              KI-Analyse läuft
            </div>
          </div>
        </div>
      </div>

      {/* Trust signals */}
      <div className="mt-24 max-w-6xl w-full">
        <div className="bg-surface-container-low/50 backdrop-blur-sm rounded-2xl p-10 grid grid-cols-1 md:grid-cols-3 gap-12 border border-outline-variant/10">
          <div className="flex items-start gap-5">
            <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface text-sm">Transparenz</p>
              <p className="text-on-surface-variant text-[13px] leading-relaxed mt-1.5">Unsicher erkannte Werte werden im Dashboard markiert.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface text-sm">Medizinischer Hinweis</p>
              <p className="text-on-surface-variant text-[13px] leading-relaxed mt-1.5">Dient der Orientierung und ersetzt keine klinische Diagnose.</p>
            </div>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-white p-2 rounded-lg shadow-sm flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface text-sm">Datenschutz</p>
              <p className="text-on-surface-variant text-[13px] leading-relaxed mt-1.5">Befunde werden nach der Analyse sicher vom Server gelöscht.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
