import os
import json
import logging

from google import genai
from google.genai import types


logger = logging.getLogger("inbody_api")


PROMPT_TEMPLATE = """
Du bist ein präziser Datenextraktions-Assistent für InBody-Befundbögen.

Deine einzige Aufgabe:
Lies ausschließlich die sichtbaren Messwerte aus dem hochgeladenen InBody-Dokument aus.

Regeln:
1. Erfinde keine Werte.
2. Wenn ein Wert nicht eindeutig lesbar oder nicht vorhanden ist, setze ihn auf null.
3. Antworte ausschließlich mit validem JSON.
4. Kein Fließtext, kein Markdown, keine Erklärungen.
5. Verwende genau die Feldnamen aus dem Schema.
6. "confidence" ist eine Zahl zwischen 0.0 und 1.0.
7. "datum" wenn möglich im Format YYYY-MM-DD, sonst null.
8. "viszeralfett.einheit" nur dann befüllen, wenn sie im Dokument klar erkennbar ist, sonst null.

Antworte exakt in diesem JSON-Format:

{
  "meta": {
    "dokument_typ": "inbody_770",
    "name": null,
    "datum": null,
    "confidence": 0.0
  },
  "werte": {
    "gewicht": {
      "wert": null,
      "einheit": "kg",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "skelettmuskel": {
      "wert": null,
      "einheit": "kg",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "koerperfett": {
      "wert": null,
      "einheit": "kg",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "bmi": {
      "wert": null,
      "einheit": "kg/m²",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "koerperfettanteil": {
      "wert": null,
      "einheit": "%",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "viszeralfett": {
      "wert": null,
      "einheit": null,
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "grundumsatz": {
      "wert": null,
      "einheit": "kcal",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "koerperwasser": {
      "wert": null,
      "einheit": "l",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    },
    "ecw_tbw": {
      "wert": null,
      "einheit": "ratio",
      "normal_min": null,
      "normal_max": null,
      "confidence": 0.0
    }
  }
}
"""


def extract_inbody_data(image_bytes: bytes, mime_type: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")

    client = genai.Client(api_key=api_key)
    part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[PROMPT_TEMPLATE, part],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )

        raw_text = (response.text or "").strip()

        if not raw_text:
            raise ValueError("Die KI hat keine Antwort geliefert.")

        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError:
            # Falls das Modell wider Erwarten JSON in einen Codeblock packt
            cleaned = raw_text.replace("```json", "").replace("```", "").strip()
            try:
                data = json.loads(cleaned)
            except json.JSONDecodeError as e:
                logger.error(f"Ungültiges JSON von Gemini: {raw_text[:1000]}")
                raise ValueError("Die KI hat ein ungültiges JSON-Format geantwortet.") from e

        if not isinstance(data, dict):
            raise ValueError("Die KI-Antwort hat kein gültiges Objekt geliefert.")

        return data

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Gemini API Error: {str(e)}")
        raise ValueError(f"KI Anfrage fehlgeschlagen: {str(e)}")