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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExportPdf = async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      // Lazy-load: @react-pdf/renderer landet nicht im initialen Bundle
      const [{ pdf }, { PdfReport }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./components/PdfReport'),
      ]);

      const blob = await pdf(<PdfReport data={data} />).toBlob();
      const url  = URL.createObjectURL(blob);

      // Dateiname: slugifizierter Name + Datum
      const namePart = data.meta.name
        ? data.meta.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : 'anonym';
      const datumPart = data.meta.datum
        ? data.meta.datum.replace(/[.\s/]/g, '-').replace(/-+/g, '-')
        : new Date().toISOString().slice(0, 10);

      const a = document.createElement('a');
      a.href = url;
      a.download = `inbody-analyse-${namePart}-${datumPart}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Kurze Verzögerung: Download muss sicher ausgelöst sein bevor URL freigegeben wird
      setTimeout(() => URL.revokeObjectURL(url), 150);
    } finally {
      setIsExporting(false);
    }
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
        onExportPdf={data ? handleExportPdf : undefined}
        isExporting={isExporting}
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
