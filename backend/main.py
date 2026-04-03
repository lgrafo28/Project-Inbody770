from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional

import asyncio
import logging
import os
import time

from mock_data import MOCK_RESPONSE
from services import process_and_validate_data
from ai_extraction import extract_inbody_data


# --------------------------------------------------
# Konfiguration
# --------------------------------------------------

MAX_FILE_SIZE_MB = 15
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("inbody_api")

load_dotenv(override=True)

app = FastAPI(title="InBody 770 Vision API", version="0.2.0")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://project-inbody770-1.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Hilfsfunktionen
# --------------------------------------------------

def has_valid_gemini_key() -> bool:
    api_key = os.environ.get("GEMINI_API_KEY")
    return bool(api_key and api_key != "dein_api_key_hier" and len(api_key) > 10)


def format_seconds(seconds: float) -> str:
    return f"{seconds:.2f}s"


# --------------------------------------------------
# API Endpoints
# --------------------------------------------------

@app.post("/api/analyze")
async def analyze_document(
    file: UploadFile = File(...),
    geschlecht: Optional[str] = Form(None),   # 'm' oder 'w', optional
    alter: Optional[int] = Form(None),         # Alter in Jahren, optional
):
    if not file:
        raise HTTPException(status_code=400, detail="Keine Datei hochgeladen.")

    total_start = time.perf_counter()

    # .env bei Reloads sicher neu laden
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")

    logger.info("--------------------------------------------------")
    logger.info("NEUER UPLOAD")
    logger.info(f"Dateiname: {file.filename}")
    logger.info(f"Content-Type: {file.content_type}")

    if api_key:
        logger.info(f"GEMINI_API_KEY erkannt (Länge: {len(api_key)})")
    else:
        logger.warning("GEMINI_API_KEY nicht gefunden.")

    try:
        # -----------------------------
        # Datei einlesen
        # -----------------------------
        read_start = time.perf_counter()
        file_bytes = await file.read()
        read_duration = time.perf_counter() - read_start

        file_size = len(file_bytes)
        logger.info(f"Dateigröße: {round(file_size / 1024 / 1024, 2)} MB")
        logger.info(f"STEP read_file: {format_seconds(read_duration)}")

        if file_size == 0:
            raise HTTPException(status_code=400, detail="Die hochgeladene Datei ist leer.")

        if file_size > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Datei ist zu groß. Bitte maximal {MAX_FILE_SIZE_MB} MB hochladen."
            )

        mime_type = file.content_type or "image/jpeg"

        # -----------------------------
        # Echter Gemini-Modus
        # -----------------------------
        if has_valid_gemini_key():
            logger.info("MODE: GEMINI")

            ai_start = time.perf_counter()
            try:
                raw_data = extract_inbody_data(file_bytes, mime_type)
            except Exception as ai_err:
                logger.error(f"GEMINI FAILED: {str(ai_err)}")
                raise HTTPException(status_code=500, detail=f"Gemini API Fehler: {str(ai_err)}")

            ai_duration = time.perf_counter() - ai_start
            logger.info(f"STEP gemini_call: {format_seconds(ai_duration)}")

            validation_start = time.perf_counter()
            validated_response = process_and_validate_data(
                raw_data, geschlecht=geschlecht, alter=alter
            )
            validation_duration = time.perf_counter() - validation_start
            logger.info(f"STEP validation: {format_seconds(validation_duration)}")

            total_duration = time.perf_counter() - total_start
            logger.info(f"STEP total: {format_seconds(total_duration)}")
            logger.info("GEMINI extraction and validation successful.")

            return validated_response

        # -----------------------------
        # Mock-Modus
        # -----------------------------
        logger.info("MODE: MOCK (Key fehlt oder ungültig)")
        mock_start = time.perf_counter()

        await asyncio.sleep(0.5)
        validated_response = process_and_validate_data(
            MOCK_RESPONSE, geschlecht=geschlecht, alter=alter
        )

        mock_duration = time.perf_counter() - mock_start
        total_duration = time.perf_counter() - total_start

        logger.info(f"STEP mock_processing: {format_seconds(mock_duration)}")
        logger.info(f"STEP total: {format_seconds(total_duration)}")

        return validated_response

    except HTTPException:
        raise

    except Exception as e:
        total_duration = time.perf_counter() - total_start
        logger.error(f"FATAL ERROR IN PIPELINE: {str(e)}")
        logger.error(f"STEP total_until_error: {format_seconds(total_duration)}")
        raise HTTPException(status_code=500, detail=f"Interner Serverfehler: {str(e)}")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}