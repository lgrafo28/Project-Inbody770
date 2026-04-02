import type { AnalysisResponse } from '../types';
import { OverviewTab } from './OverviewTab';
import { DetailsTab } from './DetailsTab';

type TabKey = 'overview' | 'details';

interface AnalysisDashboardProps {
  data: AnalysisResponse;
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export function AnalysisDashboard({ data, activeTab, onTabChange }: AnalysisDashboardProps) {
  return (
    <div>
      {/* Mobile tab switcher — desktop tabs are in NavBar */}
      <div className="md:hidden flex border-b border-outline-variant/20 bg-surface-container-lowest px-4 sticky top-16 z-40">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent'
          }`}
        >
          Ergebnisübersicht
        </button>
        <button
          onClick={() => onTabChange('details')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'details'
              ? 'text-primary border-primary'
              : 'text-slate-500 border-transparent'
          }`}
        >
          Ergänzende Werte
        </button>
      </div>

      {activeTab === 'overview' ? (
        <OverviewTab data={data} />
      ) : (
        <DetailsTab data={data} />
      )}
    </div>
  );
}
