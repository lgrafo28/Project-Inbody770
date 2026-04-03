# Camera Upload & Geschlecht/Alter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kamera-Upload-Button auf Mobile hinzufügen und optionale Geschlecht/Alter-Eingabe vor dem Upload mit Durchleitung bis in die Backend-Zusammenfassung.

**Architecture:** Backend zuerst (models → services → main), dann Frontend (UploadDropzone). Kein neues Test-Framework — Verifikation erfolgt manuell per Browser/curl. handleFile wird von einer regulären inner function zu einem useCallback refactored, damit onDrop nicht auf stale state zeigt.

**Tech Stack:** FastAPI (Form, Optional), Pydantic, React 18 (useState, useCallback), TypeScript, Tailwind CSS

---

## Datei-Übersicht

| Datei | Änderung |
|---|---|
| `backend/models.py` | `alter: Optional[int] = None` in `DocumentMeta` |
| `backend/services.py` | `_build_summary` + `process_and_validate_data` Signatur erweitern, `alter` in meta speichern, einleitender Satz |
| `backend/main.py` | `Form` Import, `Optional` Import, zwei neue Parameter im Endpoint |
| `frontend/src/components/UploadDropzone.tsx` | Neue States, `handleFile` → useCallback, Geschlecht/Alter UI, Kamera-Button |

---

## Task 1: models.py — `alter` in `DocumentMeta`

**Files:**
- Modify: `backend/models.py:5-9`

- [ ] **Schritt 1: `alter`-Feld zu `DocumentMeta` hinzufügen**

Aktuelle `DocumentMeta`-Klasse (Zeilen 5–9):
```python
class DocumentMeta(BaseModel):
    dokument_typ: str
    name: Optional[str] = None
    datum: Optional[str] = None
    confidence: float
```

Ersetzen durch:
```python
class DocumentMeta(BaseModel):
    dokument_typ: str
    name: Optional[str] = None
    datum: Optional[str] = None
    confidence: float
    alter: Optional[int] = None  # Patientenalter in Jahren (optional)
```

- [ ] **Schritt 2: Manuell verifizieren**

```bash
cd backend
python -c "from models import DocumentMeta; m = DocumentMeta(dokument_typ='test', confidence=1.0); print(m.alter)"
```

Erwartete Ausgabe: `None`

```bash
python -c "from models import DocumentMeta; m = DocumentMeta(dokument_typ='test', confidence=1.0, alter=35); print(m.alter)"
```

Erwartete Ausgabe: `35`

- [ ] **Schritt 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add optional alter field to DocumentMeta"
```

---

## Task 2: services.py — Signatur, alter in meta, Einleitung in _build_summary

**Files:**
- Modify: `backend/services.py:19`, `backend/services.py:142`

- [ ] **Schritt 1: `Optional` in services.py importieren**

Aktuelle Zeile 1:
```python
from typing import Dict, Any, List
```

Ersetzen durch:
```python
from typing import Dict, Any, List, Optional
```

- [ ] **Schritt 2: `_build_summary` Signatur und einleitenden Satz erweitern**

Aktuelle Signatur (Zeile 19):
```python
def _build_summary(werte_dict: Dict[str, Any], ampel: str) -> tuple[str, str]:
```

Ersetzen durch:
```python
def _build_summary(
    werte_dict: Dict[str, Any],
    ampel: str,
    geschlecht: Optional[str] = None,
    alter: Optional[int] = None,
) -> tuple[str, str]:
```

Direkt nach der Docstring-Zeile (nach Zeile 24, vor dem Kommentar `# Auffällige Felder ermitteln`) einfügen:
```python
    # Einleitender Satz wenn Patientendaten vorhanden
    einleitung = ""
    if geschlecht is not None and alter is not None:
        geschlecht_text = "männlich" if geschlecht == "m" else "weiblich"
        einleitung = f"Basierend auf Ihren Angaben (Alter: {alter} Jahre, {geschlecht_text}): "
```

Am Ende der Funktion, vor `return`, die Einleitung voranstellen:
```python
    zusammenfassung_detail = einleitung + " ".join(detail_teile)
    return zusammenfassung_kurz, zusammenfassung_detail
```

Die bisherige letzte Zeile `zusammenfassung_detail = " ".join(detail_teile)` wird dabei ersetzt.

- [ ] **Schritt 3: `process_and_validate_data` Signatur und Körper erweitern**

Aktuelle Signatur (Zeile 142):
```python
def process_and_validate_data(raw_data: Dict[str, Any]) -> AnalysisResponse:
```

Ersetzen durch:
```python
def process_and_validate_data(
    raw_data: Dict[str, Any],
    geschlecht: Optional[str] = None,
    alter: Optional[int] = None,
) -> AnalysisResponse:
```

Nach Zeile `response_model = AnalysisResponse(**raw_data)` (aktuell Zeile 144) einfügen:
```python
    # Patientenalter im Meta-Objekt speichern falls angegeben
    if alter is not None:
        response_model.meta.alter = alter
```

Den bestehenden `_build_summary`-Aufruf (aktuell Zeile 238):
```python
    zusammenfassung_kurz, zusammenfassung_detail = _build_summary(werte_dict, ampel)
```

Ersetzen durch:
```python
    zusammenfassung_kurz, zusammenfassung_detail = _build_summary(
        werte_dict, ampel, geschlecht=geschlecht, alter=alter
    )
```

- [ ] **Schritt 4: Manuell verifizieren**

```bash
cd backend
python -c "
from services import process_and_validate_data
from mock_data import MOCK_RESPONSE
r = process_and_validate_data(MOCK_RESPONSE, geschlecht='m', alter=35)
print('alter in meta:', r.meta.alter)
print('zusammenfassung_kurz beginnt mit:', r.zusammenfassung_kurz[:60])
print('detail beginnt mit:', r.zusammenfassung_detail[:80])
"
```

Erwartete Ausgabe:
```
alter in meta: 35
zusammenfassung_kurz beginnt mit: ...  (beliebig)
detail beginnt mit: Basierend auf Ihren Angaben (Alter: 35 Jahre, männlich): ...
```

- [ ] **Schritt 5: Commit**

```bash
git add backend/services.py
git commit -m "feat: pass geschlecht/alter through to summary and meta"
```

---

## Task 3: main.py — Form-Parameter im Endpoint

**Files:**
- Modify: `backend/main.py:1`, `backend/main.py:62`

- [ ] **Schritt 1: Imports erweitern**

Aktuelle Zeile 1:
```python
from fastapi import FastAPI, UploadFile, File, HTTPException
```

Ersetzen durch:
```python
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from typing import Optional
```

- [ ] **Schritt 2: Endpoint-Signatur erweitern**

Aktuelle Signatur (Zeile 62):
```python
@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
```

Ersetzen durch:
```python
@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    geschlecht: Optional[str] = Form(None),   # 'm' oder 'w', optional
    alter: Optional[int] = Form(None),         # Alter in Jahren, optional
):
```

- [ ] **Schritt 3: Beide `process_and_validate_data`-Aufrufe aktualisieren**

Gemini-Pfad — aktuell:
```python
            validated_response = process_and_validate_data(raw_data)
```

Ersetzen durch:
```python
            validated_response = process_and_validate_data(
                raw_data, geschlecht=geschlecht, alter=alter
            )
```

Mock-Pfad — aktuell:
```python
        validated_response = process_and_validate_data(MOCK_RESPONSE)
```

Ersetzen durch:
```python
        validated_response = process_and_validate_data(
            MOCK_RESPONSE, geschlecht=geschlecht, alter=alter
        )
```

- [ ] **Schritt 4: Backend starten und curl-Test**

```bash
cd backend
uvicorn main:app --reload
```

In einem zweiten Terminal:
```bash
curl -s -X POST http://127.0.0.1:8000/api/analyze \
  -F "file=@/dev/null;type=image/jpeg" \
  -F "geschlecht=m" \
  -F "alter=35" | python -m json.tool | grep -A2 '"alter"'
```

Erwartete Ausgabe (alter im meta-Objekt):
```json
"alter": 35,
```

- [ ] **Schritt 5: Commit**

```bash
git add backend/main.py
git commit -m "feat: accept optional geschlecht/alter form fields in /api/analyze"
```

---

## Task 4: UploadDropzone.tsx — States, useCallback-Fix, UI, Kamera-Button

**Files:**
- Modify: `frontend/src/components/UploadDropzone.tsx`

- [ ] **Schritt 1: Neue States hinzufügen**

Nach `const [isDragging, setIsDragging] = useState(false);` (Zeile 73) einfügen:
```tsx
  // Optionale Patientendaten — werden beim Upload als FormData-Felder mitgeschickt
  const [geschlecht, setGeschlecht] = useState<'m' | 'w' | null>(null);
  const [alter, setAlter] = useState<number | null>(null);
```

- [ ] **Schritt 2: `handleFile` von inner function zu useCallback umbauen**

Aktuelle `handleFile` (Zeilen 75–128):
```ts
  const handleFile = async (file: File) => {
```

Ersetzen durch `useCallback` mit vollständiger Dep-Liste. Der gesamte Block wird:
```tsx
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
```

- [ ] **Schritt 3: `onDrop` Deps aktualisieren**

Aktuell (Zeile 140–147):
```tsx
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);
```

`[]` durch `[handleFile]` ersetzen:
```tsx
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);
```

- [ ] **Schritt 4: Geschlecht/Alter-UI vor der Upload-Zone einfügen**

Direkt vor `<div className="bg-white rounded-xl p-10 ...">` (Zeile 172) einfügen:

```tsx
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
```

- [ ] **Schritt 5: Kamera-Button unter "Datei auswählen" einfügen**

Direkt nach dem bestehenden `<label>` für "Datei auswählen" (nach Zeile 208, vor dem `<p>` mit Dateigröße-Hinweis) einfügen:

```tsx
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
```

- [ ] **Schritt 6: TypeScript-Build prüfen**

```bash
cd frontend
npx tsc --noEmit
```

Erwartete Ausgabe: keine Fehler (leere Ausgabe oder nur Warnungen).

- [ ] **Schritt 7: Dev-Server starten und manuell testen**

```bash
cd frontend
npm run dev
```

Checkliste im Browser:
- [ ] Geschlecht-Buttons togglen korrekt (nur einer aktiv, nochmal klicken → deaktivieren)
- [ ] Alter-Input akzeptiert nur Zahlen zwischen 10–100
- [ ] Upload ohne Angaben funktioniert (beide Felder leer lassen)
- [ ] Upload mit Angaben: Network-Tab prüfen → FormData enthält `geschlecht` und `alter`
- [ ] Ergebnis-Seite: bei Angaben erscheint Einleitungssatz in `zusammenfassung_detail`
- [ ] Auf mobilem Viewport (DevTools): "Foto aufnehmen"-Button erscheint unterhalb von "Datei auswählen"
- [ ] Auf Desktop: "Foto aufnehmen"-Button ist unsichtbar

- [ ] **Schritt 8: Commit**

```bash
git add frontend/src/components/UploadDropzone.tsx
git commit -m "feat: camera upload button (mobile) + optional gender/age input before upload"
```

---

## Abschluss-Commit

```bash
git push origin chatgpt/perf-refactor-inbody-api
```
