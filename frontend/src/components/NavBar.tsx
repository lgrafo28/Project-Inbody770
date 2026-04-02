type TabKey = 'overview' | 'details';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Ergebnisübersicht' },
  { key: 'details', label: 'Ergänzende Werte' },
];

interface NavBarProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  onReset?: () => void;
}

export function NavBar({ activeTab, onTabChange, onReset }: NavBarProps) {
  const showTabs = activeTab !== undefined;

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#f8f9fb]/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 shadow-[0px_12px_32px_rgba(0,92,107,0.06)] border-b border-outline-variant/10">
      <div className="flex items-center h-full gap-10">
        <span className="text-xl font-bold tracking-tight text-primary font-headline flex-shrink-0">
          InBody Vision
        </span>

        {showTabs && (
          <div className="hidden md:flex items-center h-full">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={`h-full px-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <button
              disabled
              className="h-full px-4 text-sm font-medium text-slate-300 border-b-2 border-transparent cursor-not-allowed"
              title="Noch nicht verfügbar"
            >
              Verlauf
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {!showTabs && (
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">
            Professionelle Befundanalyse
          </span>
        )}
        {showTabs && onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface-variant bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-sm hover:bg-surface-container transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0113.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Neue Analyse
          </button>
        )}
      </div>
    </nav>
  );
}
