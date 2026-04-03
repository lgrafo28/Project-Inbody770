# InBody Vision — Dev Server Starten

## Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt   # nur beim ersten Mal
cp .env.example .env               # nur beim ersten Mal, dann API-Key eintragen

uvicorn main:app --reload --port 8000
```

> **Windows (PowerShell):** Falls `uvicorn` nicht erkannt wird, stattdessen:
> ```bash
> python -m pip install -r requirements.txt
> python -m uvicorn main:app --reload --port 8000
> ```

Läuft auf: http://127.0.0.1:8000  
Health-Check: http://127.0.0.1:8000/api/health

---

## Frontend (Vite + React)

```bash
cd frontend
npm install      # nur beim ersten Mal

npm run dev
```

Läuft auf: http://localhost:5173

---

## Beide gleichzeitig (zwei Terminals)

**Terminal 1 — Backend:**
```bash
cd backend && python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
```

---

## Nützliche Zusatzbefehle

| Was | Befehl |
|---|---|
| Frontend bauen (Prod) | `cd frontend && npm run build` |
| Frontend linten | `cd frontend && npm run lint` |
| Backend ohne Reload | `cd backend && python -m uvicorn main:app --port 8000` |
| Mock-Modus erzwingen | `.env` leer lassen oder Key auf `dein_api_key_hier` |

---

## Hinweis .env

```
# backend/.env
GEMINI_API_KEY="AIza..."
```

Ohne gültigen Key läuft das Backend automatisch im **Mock-Modus** (Testdaten, kein echter API-Call).
