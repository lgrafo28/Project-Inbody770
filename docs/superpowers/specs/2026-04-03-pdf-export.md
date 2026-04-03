# Phase 3 — PDF-Export des Analyseergebnisses
**Datum:** 2026-04-03
**Status:** Approved

---

## Überblick

Clientseitiger PDF-Export der InBody-Analyseergebnisse. Kein Backend-PDF, kein Screenshot-Hack. Eine dedizierte, druckoptimierte A4-Report-Komponente mit `@react-pdf/renderer`.

---

## Datenmodell-Ergänzungen

### Problem
`geschlecht` wird vom Frontend gesendet (`UploadDropzone.tsx` → FormData) und im Backend empfangen (`main.py` → `process_and_validate_data()`), aber **nie in `response_model.meta` gespeichert** und damit nie im API-Response zurückgegeben.

### Lösung

**`backend/models.py`** — `DocumentMeta` erhält:
```python
geschlecht: Optional[str] = None  # 'm' oder 'w', optional
```

**`backend/services.py`** — in `process_and_validate_data()`, analog zu `alter`:
```python
if geschlecht is not None:
    response_model.meta.geschlecht = geschlecht
```

**`frontend/src/types.ts`** — `DocumentMeta` erhält:
```ts
geschlecht?: string | null;
```

---

## Library-Wahl: `@react-pdf/renderer`

**Warum nicht `jspdf + html2canvas`:** html2canvas rendert den DOM zu einem Raster-Screenshot und bettet ihn als Bild ein — das wäre der "Screenshot-Hack", der explizit ausgeschlossen ist. Schlechte Textqualität, keine echte Vektorgrafik.

**Warum `@react-pdf/renderer`:**
- Erzeugt echte Vektor-PDFs direkt aus React-Komponenten
- Keine DOM-Capture, kein Canvas
- Saubere Typografie, echte Seitenumbrüche, kein Pixelartifakt
- Volle Layout-Kontrolle mit FlexBox-ähnlichem Styling
- Stabiles, weit verbreitetes Open-Source-Projekt

**Installation:**
```bash
npm install @react-pdf/renderer
```

---

## Architektur

```
App.tsx
  ├── isExporting: boolean (neuer State)
  ├── handleExportPdf() → erzeugt PDF-Blob, triggert Download
  └── NavBar (onExportPdf, isExporting props)

PdfReport.tsx             ← neue Datei
  └── Reine @react-pdf/renderer Komponente
      Empfängt: data: AnalysisResponse
      Gibt zurück: <Document> für PDF-Generierung
```

Der Download-Flow in `handleExportPdf()`:
1. `isExporting = true`
2. `const blob = await pdf(<PdfReport data={data} />).toBlob()`
3. Blob als Download-Link triggern
4. `isExporting = false`

---

## Neue Datei: `PdfReport.tsx`

**Pfad:** `frontend/src/components/PdfReport.tsx`

**Props:**
```ts
interface PdfReportProps {
  data: AnalysisResponse;
}
```

**A4-Layout-Struktur:**

### 1. Header
- Titel: **"InBody 770 Analysebericht"** (groß, links)
- Erstellungsdatum rechts: `Erstellt am {heute}`
- Trennlinie

### 2. Meta-Zeile
- Name | Messdatum | Alter (falls vorhanden) | Geschlecht (falls vorhanden)
- Signalqualität: `{confidence × 100}%`

### 3. Ampel-Status
- Farbiger Punkt + Status-Label: `gruen → Sehr gut`, `gelb → Beobachten`, `rot → Kritisch`
- Ampel-Begründung als Subtext

### 4. Klinische Einschätzung
- `zusammenfassung_kurz` als fetter Absatz
- `zusammenfassung_detail` als normaler Absatz darunter

### 5. Hauptwerte-Tabelle
Vier Werte in einer 2×2 oder 4-Spalten-Tabelle:
- Gewicht (`gewicht`)
- BMI (`bmi`)
- Skelettmuskelmasse (`skelettmuskel`)
- Körperfettanteil (`koerperfettanteil`)

Pro Wert: Messwert + Einheit, Normbereich (min–max), visueller In/Out-Indikator (✓/⚠)

Fehlende Werte werden mit `—` dargestellt (kein Crash).

### 6. Empfehlungen
Drei Abschnitte, je nur wenn Array nicht leer:
- **Bewegung** (`hinweise.training`, max. 3 Items)
- **Ernährung** (`hinweise.ernaehrung`, max. 3 Items)
- **Verlauf** (`hinweise.verlauf`, max. 3 Items)

### 7. Warnungen (konditionell)
Nur wenn `validierung.warnungen.length > 0`:
- Leicht grauer Hintergrundkasten
- Überschrift: "Hinweise zur Datenqualität"
- Jede Warnung als Zeile

### 8. Footer
- `Analysiert mit InBody Vision 770 · {erstellungsdatum}`
- Seite wird automatisch durch `@react-pdf/renderer` verwaltet

**Farbschema:**
- Hintergrund: Weiß (`#ffffff`)
- Primärfarbe: Teal (`#005c6b`) für Überschriften und Akzente
- Text: `#1a1a1a`
- Subtext / Labels: `#6b7280`
- Grün (gruen): `#059669`
- Amber (gelb): `#d97706`
- Rot: `#dc2626`
- Warnungsbox-Hintergrund: `#f9fafb`

---

## Änderungen: NavBar.tsx

Neue optionale Props:
```ts
onExportPdf?: () => void;
isExporting?: boolean;
```

PDF-Button wird rechts angezeigt, **nur wenn `onExportPdf` vorhanden** (= nur wenn Daten geladen):

```
[PDF exportieren]  [Neue Analyse]
```

Button-States:
- Normal: primärer Outline-Button
- `isExporting = true`: disabled + Text "Wird erstellt…"

---

## Änderungen: App.tsx

Neuer State: `const [isExporting, setIsExporting] = useState(false)`

Neue Funktion:
```ts
const handleExportPdf = async () => {
  if (!data) return;
  setIsExporting(true);
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const { PdfReport } = await import('./components/PdfReport');
    const blob = await pdf(<PdfReport data={data} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = data.meta.name?.replace(/\s+/g, '-').toLowerCase() || 'anonym';
    const datum = data.meta.datum?.replace(/\./g, '-') || new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `inbody-analyse-${name}-${datum}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } finally {
    setIsExporting(false);
  }
};
```

Dynamic import (`await import(...)`) verhindert, dass `@react-pdf/renderer` im initialen Bundle landet — nur geladen wenn wirklich exportiert wird.

NavBar-Aufruf:
```tsx
<NavBar
  activeTab={data ? activeTab : undefined}
  onTabChange={data ? setActiveTab : undefined}
  onReset={data ? handleReset : undefined}
  onExportPdf={data ? handleExportPdf : undefined}
  isExporting={isExporting}
/>
```

---

## Dateiname-Logik

```
inbody-analyse-{name|anonym}-{datum|YYYY-MM-DD}.pdf
```

Beispiele:
- `inbody-analyse-max-mustermann-15-03-2026.pdf`
- `inbody-analyse-anonym-2026-04-03.pdf`

---

## Nicht in Scope (v1)

- Mehrseiten-Layout mit automatischem Seitenumbruch bei sehr vielen Werten (wird durch `@react-pdf/renderer` ohnehin behandelt, aber nicht explizit designt)
- Segmentale Daten (Phasenwinkel, Arm/Bein-Analyse) — nicht im API-Response vorhanden
- Logo/Bild-Einbettung
- Backend-seitige PDF-Erzeugung
- Passwortschutz oder Verschlüsselung des PDFs

---

## Geänderte/neue Dateien

| Datei | Änderungstyp |
|---|---|
| `backend/models.py` | Modify — `geschlecht` in `DocumentMeta` |
| `backend/services.py` | Modify — `geschlecht` in meta speichern |
| `frontend/src/types.ts` | Modify — `geschlecht?` in `DocumentMeta` |
| `frontend/src/components/PdfReport.tsx` | **Neu** |
| `frontend/src/components/NavBar.tsx` | Modify — PDF-Button |
| `frontend/src/App.tsx` | Modify — `isExporting` State + `handleExportPdf` |

**npm-Package:** `@react-pdf/renderer` (eine neue Dependency)
