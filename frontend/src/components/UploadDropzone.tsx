import React, { useCallback, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';


interface UploadDropzoneProps {
  onUploadStart: () => void;
  onUploadSuccess: (data: any) => void;
  onUploadError: (error: string) => void;
}

export function UploadDropzone({ onUploadStart, onUploadSuccess, onUploadError }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  // For MVP, we wire up a real POST array (even though backend mocks the processing)
  const handleFile = async (file: File) => {
    if (!file) return;
    
    // Quick local validation of extension
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|jpe?g|png)$/i)) {
      onUploadError("Bitte nur PDF, JPG oder PNG hochladen.");
      return;
    }

    onUploadStart();
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // In development, we'd use Vite proxy or absolute URL
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Versuche das echte Backend-JSON mit der Detail-Fehlermeldung zu lesen
        let errorDetail = 'Upload fehlgeschlagen (Unbekannter Fehler)';
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errorDetail = errData.detail;
          } else {
            errorDetail = `HTTP ${response.status} Error`;
          }
        } catch (e) {
          errorDetail = `Netzwerkfehler oder Server nicht erreichbar (${response.status})`;
        }
        throw new Error(errorDetail);
      }

      const data = await response.json();
      onUploadSuccess(data);
    } catch (e: any) {
      onUploadError(e.message || "Es ist ein Fehler aufgetreten");
    }
  };

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
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl transition-all duration-200 shadow-sm cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
        <div className="p-4 bg-primary-100 text-primary-700 rounded-full mb-4">
          <UploadCloud size={32} />
        </div>
        <h3 className="text-xl font-medium text-text-main mb-2">InBody-Befund hochladen</h3>
        <p className="text-text-muted text-center mb-6">
          PDF, JPG oder PNG auswählen oder hierher ziehen.<br/>
          Maximale Dateigröße: 10MB
        </p>
        
        <label className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors cursor-pointer">
          Datei auswählen
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={onChange}
          />
        </label>
      </div>
      
      <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-lg text-sm text-text-muted">
        <AlertCircle className="shrink-0 w-5 h-5 text-slate-400" />
        <p>
          Diese Auswertung dient ausschließlich der Orientierung und ersetzt keine medizinische Diagnose. 
          Die Datenverarbeitung erfolgt lokalisiert für diese Analyse; Befunde werden nicht dauerhaft gespeichert.
        </p>
      </div>
    </div>
  );
}
