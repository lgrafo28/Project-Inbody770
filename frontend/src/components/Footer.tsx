export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/10 w-full py-10 mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-primary font-headline">InBody Vision</span>
          <p className="text-xs text-on-surface-variant max-w-md leading-relaxed">
            © 2024 InBody Vision. Wichtiger Hinweis: Diese Analysen dienen Ihrer Information und ersetzen keine ärztliche Diagnose.
          </p>
        </div>
        <div className="flex gap-8">
          <span className="text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest">Impressum</span>
          <span className="text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest">Datenschutz</span>
          <span className="text-on-surface-variant font-label text-[10px] font-bold uppercase tracking-widest">Support</span>
        </div>
      </div>
    </footer>
  );
}
