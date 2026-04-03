# Kamera-Upload (Mobile) & Geschlecht/Alter-Eingabe
**Datum:** 2026-04-03
**Status:** Approved

---

## Überblick

Zwei unabhängige UX-Verbesserungen in `UploadDropzone.tsx` plus minimale Backend-Erweiterung:

1. **Kamera-Upload auf Mobile** — zweiter Upload-Button, der direkt die Rückkamera öffnet
2. **Optionale Patientendaten vor dem Upload** — Geschlecht + Alter werden als FormData-Felder mitgeschickt und im Befundergebnis berücksichtigt

---

## Feature 1 — Kamera-Upload (Mobile)

### Änderungen: `UploadDropzone.tsx`

Unterhalb des bestehenden "Datei auswählen"-Buttons wird ein zweiter Button eingefügt:

- `<input type="file" accept="image/*" capture="environment" className="hidden" onChange={onChange} />`
- Label: **"Foto aufnehmen"**
- Styling: identisch zum bestehenden Button
- Sichtbarkeit: `md:hidden` — nur auf Mobile sichtbar
- Bestehender "Datei auswählen"-Button bleibt unverändert

Auf Mobile erscheinen beide Buttons untereinander: "Datei auswählen" oben, "Foto aufnehmen" darunter.

---

## Feature 2 — Geschlecht & Alter (optional)

### Frontend: `UploadDropzone.tsx`

**Neue States:**
```ts
const [geschlecht, setGeschlecht] = useState<'m' | 'w' | null>(null);
const [alter, setAlter] = useState<number | null>(null);
```

**UI — vor der Upload-Zone:**
- Zwei Toggle-Buttons `Männlich` / `Weiblich` (kein `<select>`, kein `<form>`)
  - Aktiver Button: primary-Styling; inaktiver: outline
- Zahlen-Input: `placeholder="Alter (Jahre)"`, `min={10}`, `max={100}`, `type="number"`
- Beide Felder optional — Upload funktioniert ohne Angaben

**FormData-Erweiterung in `handleFile`:**
```ts
if (geschlecht) formData.append('geschlecht', geschlecht);
if (alter !== null) formData.append('alter', String(alter));
```

**useCallback-Refactoring (stale-closure-Fix):**

`handleFile` wird von einer regulären `async function` zu einem `useCallback` umgebaut:
```ts
const handleFile = useCallback(async (file: File) => {
  // ... bestehende Logik unverändert ...
}, [geschlecht, alter, onUploadStart, onUploadSuccess, onUploadError]);
```

`onDrop` bekommt `[handleFile]` als Dependency:
```ts
const onDrop = useCallback((e: React.DragEvent) => { ... }, [handleFile]);
```

`onDragOver` und `onDragLeave` bleiben unverändert (kein `handleFile`-Aufruf).

### Backend: `models.py`

`DocumentMeta` erhält ein optionales Feld:
```python
alter: Optional[int] = None
```
(`Optional` ist bereits importiert — kein neuer Import.)

### Backend: `main.py`

Import-Erweiterung:
```python
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from typing import Optional
```

Endpoint-Signatur:
```python
@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    geschlecht: Optional[str] = Form(None),
    alter: Optional[int] = Form(None),
):
```

Beide Werte werden an `process_and_validate_data()` weitergegeben:
```python
validated_response = process_and_validate_data(raw_data, geschlecht=geschlecht, alter=alter)
```
(gilt für beide Pfade: Gemini-Modus und Mock-Modus)

### Backend: `services.py`

**Signatur:**
```python
def process_and_validate_data(raw_data, geschlecht=None, alter=None):
```

**`alter` → `response_model.meta`:**
```python
if alter is not None:
    response_model.meta.alter = alter
```

**`_build_summary()` — einleitender Satz:**
```python
def _build_summary(werte_dict, ampel, geschlecht=None, alter=None):
```
Wenn beide Angaben vorhanden:
```
"Basierend auf Ihren Angaben (Alter: {alter} Jahre, {geschlecht_text}):"
```
`geschlecht_text`: `'m'` → `"männlich"`, `'w'` → `"weiblich"`

---

## Nicht geänderte Dateien

- `types.ts` — `DocumentMeta.alter` ist bereits als `alter?: number | null` typisiert
- `ValueCard.tsx`, `OverviewTab.tsx`, `DetailsTab.tsx`, `AnalysisDashboard.tsx`
- Alle anderen Komponenten und Backend-Dateien

---

## Dateien geändert

| Datei | Änderung |
|---|---|
| `frontend/src/components/UploadDropzone.tsx` | Kamera-Button, Geschlecht/Alter-Form, handleFile als useCallback |
| `backend/models.py` | `alter` Feld in `DocumentMeta` |
| `backend/main.py` | `Form`-Parameter, `Optional`-Import |
| `backend/services.py` | Signatur-Erweiterung, `alter` in meta, `_build_summary` Einleitung |
