import { useState } from 'react';
import { UploadDropzone } from './components/UploadDropzone';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import type { AnalysisResponse } from './types';
import { Activity, Loader2 } from 'lucide-react';

function App() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadStart = () => {
    setIsLoading(true);
    setError(null);
  };

  const handleUploadSuccess = (response: AnalysisResponse) => {
    setIsLoading(false);
    setData(response);
  };

  const handleUploadError = (err: string) => {
    setIsLoading(false);
    setError(err);
  };

  const handleReset = () => {
    setData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-100 selection:text-primary-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary-600 text-white p-1.5 rounded-lg shadow-sm">
            <Activity size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">InBody Vision</h1>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Professionelle Befundanalyse
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        
        {!data && !isLoading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mb-4">
                Befunde einfach auswerten.
              </h2>
              <p className="text-lg text-slate-600">
                Lade einen InBody 770 Scan hoch, um strukturierte Werte, Warnhinweise und eine verständliche Visualisierung zu erhalten.
              </p>
            </div>
            
            {error && (
              <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            <UploadDropzone 
              onUploadStart={handleUploadStart}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-300">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <h3 className="text-xl font-medium text-slate-800">Dokument wird analysiert...</h3>
            <p className="text-slate-500 mt-2">Messwerte werden durch KI extrahiert und plausibilisiert.</p>
          </div>
        )}

        {data && !isLoading && (
          <AnalysisDashboard data={data} onReset={handleReset} />
        )}

      </main>

    </div>
  );
}

export default App;
