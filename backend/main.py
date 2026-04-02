from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
import logging
from mock_data import MOCK_RESPONSE
from services import process_and_validate_data
from ai_extraction import extract_inbody_data
from dotenv import load_dotenv

# Set up clear debug logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("inbody_api")

# override=True ensures that hot-reloads catch modifications in .env
load_dotenv(override=True)

app = FastAPI(title="InBody 770 Vision API", version="0.1.0")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/analyze")
async def analyze_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Reload dotenv right before evaluating to guarantee safety during dev runs
    load_dotenv(override=True)
    api_key = os.environ.get("GEMINI_API_KEY")
    
    logger.info("--- NEW UPLOAD RECEIVED ---")
    if api_key:
        logger.info(f"GEMINI_API_KEY is present (Length: {len(api_key)})")
    else:
        logger.warning("GEMINI_API_KEY is NOT found in environment.")

    try:
        if api_key and api_key != "dein_api_key_hier" and len(api_key) > 10:
            logger.info("MODE: GEMINI AI (Attempting real extraction...)")
            try:
                image_bytes = await file.read()
                mime_type = file.content_type or "image/jpeg"
                
                raw_data = extract_inbody_data(image_bytes, mime_type)
                validated_response = process_and_validate_data(raw_data)
                
                logger.info("GEMINI extraction and validation successful.")
                return validated_response
            
            except Exception as ai_err:
                logger.error(f"GEMINI FAILED: {str(ai_err)}")
                raise HTTPException(status_code=500, detail=f"Gemini API Fehler: {str(ai_err)}")
        else:
            logger.info("MODE: MOCK (Key missing or invalid).")
            await asyncio.sleep(2.5) 
            return process_and_validate_data(MOCK_RESPONSE)
            
    except HTTPException:
        # Re-raise explicit HTTP exceptions unchanged
        raise
    except Exception as e:
        logger.error(f"FATAL ERROR IN PIPELINE: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
