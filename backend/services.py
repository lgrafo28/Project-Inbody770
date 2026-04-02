from models import AnalysisResponse, ValidierungsErgebnis
from typing import Dict, Any

def process_and_validate_data(raw_data: Dict[str, Any]) -> AnalysisResponse:
    # 1. Technical validation via Pydantic (will raise error if types are wrong)
    response_model = AnalysisResponse(**raw_data)
    
    fehlende_felder = []
    auffaellige_felder = []
    warnungen = []
    
    out_of_bounds_count = 0
    low_confidence_count = 0
    
    # 2. Fachliche Plausibilitätsprüfung (Domain Validation)
    werte_dict = response_model.werte.model_dump()
    for field_name, messwert in werte_dict.items():
        if messwert is None:
            fehlende_felder.append(field_name)
            continue
            
        wert = messwert.get('wert')
        min_v = messwert.get('normal_min')
        max_v = messwert.get('normal_max')
        confidence = messwert.get('confidence')
        if confidence is None:
            confidence = 1.0
        
        # Falls der numerische Wert nicht extrahiert wurde
        if wert is None:
            fehlende_felder.append(field_name)
            warnungen.append(f"Wert für '{field_name}' konnte nicht erkannt werden (null).")
            # Überspringe die restlichen arithmetischen Vergleiche für dieses Feld
            continue
            
        # Check Confidence
        if confidence < 0.85:
            warnungen.append(f"Geringe Erkennungssicherheit bei '{field_name}' ({int(confidence*100)}%).")
            low_confidence_count += 1
            
        # Basic Plausible Bounds
        if wert < 0:
            auffaellige_felder.append(f"{field_name} (Negativer Wert unplausibel)")
            warnungen.append(f"Achtung: '{field_name}' ist negativ, wahrscheinlich ein Lesefehler.")
            continue
            
        if field_name == "bmi" and (wert < 10 or wert > 60):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}' extrem unplausibel)")
        
        if field_name == "koerperfettanteil" and (wert > 70):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}%' sehr hoch)")
            
        # Reference Range Check
        if min_v is not None and max_v is not None:
            if wert < min_v or wert > max_v:
                out_of_bounds_count += 1

    # Overall Confidence of Meta
    if response_model.meta.confidence < 0.8:
         warnungen.append("Die allgemeine Lesbarkeit des Dokuments war gering. Bitte Werte genau prüfen.")

    # 3. Ampellogik regelbasiert (Überstimmt die KI, falls sie falsch liegt)
    if out_of_bounds_count >= 3 or len(auffaellige_felder) > 1 or low_confidence_count >= 3:
        ampel = "rot"
        ampel_begruendung = "Mehrere relevante Abweichungen im Referenzbereich oder starke Leseunsicherheiten gefunden."
    elif out_of_bounds_count >= 1 or low_confidence_count >= 1 or len(auffaellige_felder) > 0:
        ampel = "gelb"
        ampel_begruendung = "Moderate Abweichungen vom Referenzbereich oder leichte Unsicherheit in der Extraktion."
    else:
        ampel = "gruen"
        ampel_begruendung = "Alle Werte liegen im Normalbereich und wurden sicher erkannt."
        
    # Update model
    response_model.ampel = ampel
    response_model.ampel_begruendung = ampel_begruendung
    response_model.validierung.fehlende_felder = fehlende_felder
    response_model.validierung.auffaellige_felder = auffaellige_felder
    response_model.validierung.warnungen = warnungen

    return response_model
