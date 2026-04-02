from typing import Dict, Any

from models import AnalysisResponse


def process_and_validate_data(raw_data: Dict[str, Any]) -> AnalysisResponse:
    # 1. Technische Validierung via Pydantic
    response_model = AnalysisResponse(**raw_data)

    fehlende_felder: list[str] = []
    auffaellige_felder: list[str] = []
    warnungen: list[str] = []

    out_of_bounds_count = 0
    low_confidence_count = 0

    # 2. Fachliche Plausibilitätsprüfung
    werte_dict = response_model.werte.model_dump()

    for field_name, messwert in werte_dict.items():
        if messwert is None:
            fehlende_felder.append(field_name)
            warnungen.append(f"Messwert '{field_name}' fehlt vollständig.")
            continue

        wert = messwert.get("wert")
        min_v = messwert.get("normal_min")
        max_v = messwert.get("normal_max")
        confidence = messwert.get("confidence")

        if confidence is None:
            confidence = 1.0

        # Wert fehlt
        if wert is None:
            fehlende_felder.append(field_name)
            warnungen.append(f"Wert für '{field_name}' konnte nicht sicher erkannt werden.")
            continue

        # Confidence prüfen
        if confidence < 0.85:
            low_confidence_count += 1
            warnungen.append(
                f"Geringe Erkennungssicherheit bei '{field_name}' ({int(confidence * 100)}%)."
            )

        # Negative Werte sind unplausibel
        if wert < 0:
            auffaellige_felder.append(f"{field_name} (negativer Wert unplausibel)")
            warnungen.append(f"Achtung: '{field_name}' ist negativ und wahrscheinlich fehlerhaft erkannt.")
            continue

        # Feldspezifische grobe Plausibilitätsgrenzen
        if field_name == "bmi" and (wert < 10 or wert > 60):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}' extrem unplausibel)")

        if field_name == "koerperfettanteil" and (wert < 2 or wert > 70):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}%' unplausibel)")

        if field_name == "ecw_tbw" and (wert < 0.2 or wert > 0.6):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}' unplausibel)")

        if field_name == "gewicht" and (wert < 20 or wert > 350):
            auffaellige_felder.append(f"{field_name} (Wert '{wert} kg' unplausibel)")

        # Referenzbereich prüfen
        if min_v is not None and max_v is not None:
            if wert < min_v or wert > max_v:
                out_of_bounds_count += 1

    # Meta-Confidence prüfen
    if response_model.meta.confidence < 0.8:
        warnungen.append(
            "Die allgemeine Lesbarkeit des Dokuments war eingeschränkt. Bitte Originalwerte prüfen."
        )

    # 3. Ampellogik
    if out_of_bounds_count >= 3 or len(auffaellige_felder) > 1 or low_confidence_count >= 3:
        ampel = "rot"
        ampel_begruendung = (
            "Mehrere relevante Abweichungen, Auffälligkeiten oder starke Leseunsicherheiten wurden erkannt."
        )
    elif out_of_bounds_count >= 1 or low_confidence_count >= 1 or len(auffaellige_felder) > 0:
        ampel = "gelb"
        ampel_begruendung = (
            "Es wurden kleinere Abweichungen vom Referenzbereich oder gewisse Erkennungsunsicherheiten gefunden."
        )
    else:
        ampel = "gruen"
        ampel_begruendung = (
            "Die wichtigsten Werte wirken unauffällig und wurden überwiegend stabil erkannt."
        )

    # 4. Lokale Zusammenfassungen erzeugen
    if ampel == "rot":
        zusammenfassung_kurz = (
            "Mehrere Werte sind auffällig oder unsicher erkannt und sollten genauer geprüft werden."
        )
        zusammenfassung_detail = (
            "Die Analyse zeigt mehrere relevante Abweichungen oder eine eingeschränkte Lesesicherheit. "
            "Bitte prüfe die extrahierten Werte direkt am Originalbefund. "
            "Für Trainings- oder Ernährungsentscheidungen sollte der Verlauf mit früheren Messungen einbezogen werden."
        )
    elif ampel == "gelb":
        zusammenfassung_kurz = (
            "Einige Werte weichen leicht ab oder wurden mit Unsicherheit erkannt."
        )
        zusammenfassung_detail = (
            "Die Analyse zeigt kleinere Auffälligkeiten oder begrenzte Erkennungssicherheit. "
            "Die Werte sind als Orientierung nutzbar, sollten aber im Gesamtkontext betrachtet werden. "
            "Ein Vergleich mit früheren Messungen ist sinnvoll."
        )
    else:
        zusammenfassung_kurz = (
            "Die wichtigsten Werte wirken insgesamt unauffällig."
        )
        zusammenfassung_detail = (
            "Die extrahierten Werte liegen überwiegend im erwarteten Bereich und wurden stabil erkannt. "
            "Für eine fundierte Einordnung bleiben Zielsetzung, Verlauf und individuelle Ausgangslage trotzdem wichtig. "
            "Einzelmessungen sollten nie isoliert bewertet werden."
        )

    # 5. Lokale Hinweise erzeugen
    training_hinweise = [
        "Trainingsfortschritt immer über mehrere Messungen statt über einen Einzelwert bewerten."
    ]
    ernaehrung_hinweise = [
        "Ernährungsempfehlungen nicht nur aus einem einzelnen Messwert ableiten."
    ]
    verlauf_hinweise = [
        "Folgemessungen möglichst unter ähnlichen Bedingungen durchführen."
    ]

    if low_confidence_count > 0:
        verlauf_hinweise.append(
            "Bei schwer lesbaren Dokumenten nach Möglichkeit ein schärferes oder gerader aufgenommenes Bild verwenden."
        )

    if out_of_bounds_count > 0:
        training_hinweise.append(
            "Auffällige Werte sollten immer im Zusammenhang mit Aktivität, Alltag und Zielsetzung interpretiert werden."
        )

    # 6. Response-Modell befüllen
    response_model.ampel = ampel
    response_model.ampel_begruendung = ampel_begruendung
    response_model.zusammenfassung_kurz = zusammenfassung_kurz
    response_model.zusammenfassung_detail = zusammenfassung_detail

    response_model.hinweise.training = training_hinweise
    response_model.hinweise.ernaehrung = ernaehrung_hinweise
    response_model.hinweise.verlauf = verlauf_hinweise

    response_model.validierung.fehlende_felder = fehlende_felder
    response_model.validierung.auffaellige_felder = auffaellige_felder
    response_model.validierung.warnungen = warnungen

    return response_model