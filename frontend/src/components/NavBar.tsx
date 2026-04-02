export function NavBar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f8f9fb]/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-[0px_12px_32px_rgba(0,63,135,0.06)] border-b border-[#c2c6d4]/10">
      <span className="text-xl font-bold tracking-tight text-primary font-headline">
        InBody Vision
      </span>
      <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
        Professionelle Befundanalyse
      </span>
    </nav>
  );
}
