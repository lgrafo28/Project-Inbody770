# Frontend Redesign — InBody Vision 770

Stitch-Referenz als visuelle Vorlage. Bestehende Logik bleibt unverändert.

## Dateien die sich ändern

| Datei | Was ändert sich |
|---|---|
| `frontend/tailwind.config.js` | Ersetzt durch MD3-Farbsystem aus Stitch + Manrope |
| `frontend/src/index.css` | Manrope-Font, Basis-Animationen (pulse-soft, scanning-glow) |
| `frontend/src/App.tsx` | NavBar/Footer einbinden, LoadingScreen-Komponente nutzen |
| `frontend/src/components/UploadDropzone.tsx` | Layout-Refactor (2-Spalten + Feature-Cards) |
| `frontend/src/components/AnalysisDashboard.tsx` | Layout-Refactor (12-Spalten-Grid) |
| `frontend/src/components/ValueCard.tsx` | Visual-Refactor (Progress-Bar, Icon-Pattern) |

## Neue Dateien

| Datei | Zweck |
|---|---|
| `frontend/src/components/NavBar.tsx` | Glassmorphic Fixed-Nav |
| `frontend/src/components/LoadingScreen.tsx` | Step-Indicator + Scanning-Preview |

## Was nicht angefasst wird

- `src/types.ts`, `src/lib/utils.ts` — unverändert
- Alle Handler in App.tsx (handleUploadStart/Success/Error/Reset)
- Upload-Logik in UploadDropzone (Drag-Drop, FormData, API-Call)
- Backend komplett

## Design-Token-Mapping

| Alt | Neu |
|---|---|
| `#3b82f6` (primary) | `#003f87` |
| `bg-white` (Karte) | `bg-surface-container-lowest` |
| `text-slate-500` | `text-on-surface-variant` |
| `rounded-3xl` | `rounded-xl` |
| Nur Inter | Manrope (Überschriften) + Inter (Body) |

## Umsetzungsreihenfolge

1. tailwind.config.js + index.css
2. NavBar + Footer
3. Upload-Screen
4. Loading-Screen
5. Result-Screen
