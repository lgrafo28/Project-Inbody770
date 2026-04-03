import { useState } from 'react';
import { UploadDropzone } from './components/UploadDropzone';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { NavBar } from './components/NavBar';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import type { AnalysisResponse } from './types';

type TabKey = 'overview' | 'details';

function App() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const handleUploadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleUploadSuccess = (response: AnalysisResponse) => {
    setIsLoading(false);
    setData(response);
    setActiveTab('overview');
  };

  const handleUploadError = (err: string) => {
    setIsLoading(false);
    setError(err);
  };

  const handleReset = () => {
    setData(null);
    setError(null);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      <NavBar
        activeTab={data ? activeTab : undefined}
        onTabChange={data ? setActiveTab : undefined}
        onReset={data ? handleReset : undefined}
      />

      <main className="flex-grow pt-16">
        {!data && !isLoading && (
          <>
            {error && (
              <div className="max-w-2xl mx-auto mt-8 px-4">
                <div className="p-4 bg-error-container border border-error/20 text-error rounded-xl text-center font-medium text-sm">
                  {error}
                </div>
              </div>
            )}
            <UploadDropzone
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </>
        )}

        {isLoading && <LoadingScreen />}

        {data && !isLoading && (
          <AnalysisDashboard
            data={data}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
