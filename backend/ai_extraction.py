import os
import json
from google import genai
from google.genai import types

PROMPT_TEMPLATE = """
Du bist ein medizinischer Datenextraktions-Assistent. Deine Aufgabe ist es, exakt den vorliegenden InBody 770 Befundbogen auszulesen.
Achte streng auf folgende Vorgaben:
1. Extrahiere ALLE verlangten Werte. Wenn ein Wert im Bericht **absolut nicht auffindbar** ist, setze ihn auf `null`.
2. Schätze bei jedem Wert einen `confidence`-Wert zwischen 0.0 und 1.0 (1.0 = perfekt gelesen, <0.8 = unleserlich/unsicher).
3. Lass dir keine Werte ausdenken! Nimm nur das, was auf dem Bild steht.
4. Generiere exakt das JSON-Format ohne zusätzlichen Text, keinen Markdown-Block um das JSON, NUR JSON.

Wichtigstes Ziel: Extrahiere IMMER exakt 1 JSON-Struktur, die dem unten stehenden Format entspricht.
Das Feld `ampel` am Ende DARF grün, gelb, oder rot sein. 
Das Array `warnungen` kann leer bleiben oder Fehler auflisten.

{
  "meta": {
    "dokument_typ": "inbody_770",
    "name": "Mustername (Falls lesbar, sonst null)",
    "datum": "YYYY-MM-DD",
    "confidence": 0.95
  },
  "werte": {
    "gewicht": { "wert": 0.0, "einheit": "kg", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "skelettmuskel": { "wert": 0.0, "einheit": "kg", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "koerperfett": { "wert": 0.0, "einheit": "kg", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "bmi": { "wert": 0.0, "einheit": "kg/m²", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "koerperfettanteil": { "wert": 0.0, "einheit": "%", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "viszeralfett": { "wert": 0.0, "einheit": "cm² (oder Level, exakt wie auf Papier)", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "grundumsatz": { "wert": 0, "einheit": "kcal", "normal_min": null, "normal_max": null, "confidence": 0.99 },
    "koerperwasser": { "wert": 0.0, "einheit": "l", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 },
    "ecw_tbw": { "wert": 0.0, "einheit": "ratio", "normal_min": 0.0, "normal_max": 0.0, "confidence": 0.99 }
  },
  "zusammenfassung_kurz": "Generiere einen kurzen Satz (max 15 Wörter) basierend auf den Werten.",
  "zusammenfassung_detail": "Generiere 2-3 Sätze Detailauswertung.",
  "ampel": "gruen", 
  "ampel_begruendung": "Grund für Ampelfarbe",
  "hinweise": {
    "training": ["Tipp 1"],
    "ernaehrung": ["Tipp 2"],
    "verlauf": ["Tipp 3"]
  },
  "validierung": {
    "fehlende_felder": [],
    "auffaellige_felder": [],
    "warnungen": []
  }
}
"""

def extract_inbody_data(image_bytes: bytes, mime_type: str) -> dict:
    """
    Simulates sending the document to Gemini and extracting the predefined JSON schema.
    Returns a Python dictionary parsed from the JSON output.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)
    
    # We use gemini-2.5-flash for the fastest, most potent multimodal logic
    part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[PROMPT_TEMPLATE, part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Parse the JSON string from Gemini into a Python dictionary.
        # Strict validation will happen in services.py (Pydantic model)
        data = json.loads(response.text)
        return data
        
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON from Gemini: {e}")
        # Log the raw text somewhere if needed: response.text
        raise ValueError("Die KI hat ein ungültiges Format geantwortet.")
    except Exception as e:
        print(f"Gemini API Error: {e}")
        raise ValueError(f"KI Anfrage fehlgeschlagen: {str(e)}")
