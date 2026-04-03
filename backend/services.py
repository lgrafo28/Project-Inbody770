from typing import Dict, Any, List, Optional

from models import AnalysisResponse

# Lesbare deutsche Feldnamen für Ausgabetexte
_FELDNAMEN = {
    "gewicht":          "Körpergewicht",
    "skelettmuskel":    "Muskelmasse",
    "koerperfett":      "Körperfettmasse",
    "bmi":              "BMI",
    "koerperfettanteil": "Körperfettanteil",
    "viszeralfett":     "Viszeralfett",
    "grundumsatz":      "Grundumsatz",
    "koerperwasser":    "Körperwasser",
    "ecw_tbw":          "ECW/TBW",
}


def _build_summary(
    werte_dict: Dict[str, Any],
    ampel: str,
    geschlecht: Optional[str] = None,
    alter: Optional[int] = None,
) -> tuple[str, str]:
    """Erzeugt dynamische Zusammenfassungen basierend auf den tatsächlich
    auffälligen Feldern im Befund.

    Rückgabe: (zusammenfassung_kurz, zusammenfassung_detail)
    """
    # Einleitender Satz wenn Patientendaten vorhanden
    einleitung = ""
    if geschlecht is not None and alter is not None:
        geschlecht_text = "männlich" if geschlecht == "m" else "weiblich"
        einleitung = f"Basierend auf Ihren Angaben (Alter: {alter} Jahre, {geschlecht_text}): "

    # Auffällige Felder ermitteln (außerhalb des Normbereichs)
    over_range: List[str] = []   # Werte zu hoch
    under_range: List[str] = []  # Werte zu niedrig

    for field, messwert in werte_dict.items():
        if messwert is None:
            continue
        wert = messwert.get("wert")
        min_v = messwert.get("normal_min")
        max_v = messwert.get("normal_max")
        if wert is None or min_v is None or max_v is None:
            continue
        if wert > max_v:
            over_range.append(field)
        elif wert < min_v:
            under_range.append(field)

    # ── Kurze Zusammenfassung ────────────────────────────────────────────────
    kurz_teile: List[str] = []

    for field in over_range:
        m = werte_dict[field]
        wert = m.get("wert")
        einheit = m.get("einheit") or ""
        name = _FELDNAMEN.get(field, field)
        if einheit and einheit not in ("%", ""):
            kurz_teile.append(f"{name} ({wert} {einheit}) liegt über dem Referenzbereich")
        else:
            einheit_str = f"{wert}{einheit}" if einheit else str(wert)
            kurz_teile.append(f"{name} ({einheit_str}) liegt über dem Referenzbereich")

    for field in under_range:
        m = werte_dict[field]
        wert = m.get("wert")
        einheit = m.get("einheit") or ""
        name = _FELDNAMEN.get(field, field)
        if einheit:
            kurz_teile.append(f"{name} ({wert} {einheit}) liegt unter dem Referenzbereich")
        else:
            kurz_teile.append(f"{name} ({wert}) liegt unter dem Referenzbereich")

    if kurz_teile:
        zusammenfassung_kurz = "; ".join(kurz_teile) + "."
    else:
        zusammenfassung_kurz = "Die wichtigsten Werte wirken insgesamt unauffällig."

    # ── Detailtext mit feldspezifischen Handlungshinweisen ──────────────────
    detail_teile: List[str] = []

    # Körperfett / Körperfettanteil erhöht
    if "koerperfettanteil" in over_range or "koerperfett" in over_range:
        detail_teile.append(
            "Der Körperfettanteil liegt über dem Referenzbereich. "
            "Eine negative Kalorienbalance (moderates Defizit) kombiniert mit "
            "regelmäßigem Krafttraining ist die effektivste Strategie zum Abbau."
        )

    # Muskelmasse zu niedrig
    if "skelettmuskel" in under_range:
        detail_teile.append(
            "Die Muskelmasse liegt unterhalb des Referenzbereichs. "
            "Progressives Krafttraining (2–4×/Woche) sollte priorisiert werden, "
            "kombiniert mit ausreichend Protein (≥ 1,6 g/kg Körpergewicht)."
        )

    # ECW/TBW erhöht (mögliche Wassereinlagerung)
    ecw_messwert = werte_dict.get("ecw_tbw")
    if ecw_messwert is not None:
        ecw_wert = ecw_messwert.get("wert")
        if ecw_wert is not None and ecw_wert > 0.40:
            detail_teile.append(
                "Die ECW/TBW-Ratio ist erhöht (> 0,40), was auf mögliche "
                "Wassereinlagerungen hinweisen kann. "
                "Bei anhaltenden Auffälligkeiten ärztlich abklären lassen."
            )

    # Grundumsatz niedrig relativ zum Gewicht
    grundumsatz = werte_dict.get("grundumsatz")
    gewicht = werte_dict.get("gewicht")
    if grundumsatz is not None and gewicht is not None:
        gw = grundumsatz.get("wert")
        gew = gewicht.get("wert")
        gmin = grundumsatz.get("normal_min")
        if gw is not None and gew is not None and gmin is not None and gw < gmin:
            detail_teile.append(
                "Der Grundumsatz ist niedrig – ein Hinweis auf eine geringe "
                "stoffwechselaktive Muskelmasse. "
                "Muskelmassaufbau durch Krafttraining erhöht den Grundumsatz nachhaltig."
            )

    # Fallback: alles unauffällig
    if not detail_teile:
        staerkste: List[str] = []
        for field in ["skelettmuskel", "bmi", "koerperfettanteil"]:
            m = werte_dict.get(field)
            if m is not None:
                wert = m.get("wert")
                min_v = m.get("normal_min")
                max_v = m.get("normal_max")
                if wert is not None and min_v is not None and max_v is not None:
                    if min_v <= wert <= max_v:
                        staerkste.append(_FELDNAMEN.get(field, field))
        if staerkste:
            detail_teile.append(
                f"{', '.join(staerkste)} liegen im Normbereich – das ist eine solide Ausgangslage. "
                "Für eine fundierte Einordnung bleiben Verlauf und individuelle Zielsetzung trotzdem wichtig."
            )
        else:
            detail_teile.append(
                "Die extrahierten Werte liegen überwiegend im erwarteten Bereich. "
                "Für eine fundierte Einordnung bleiben Zielsetzung, Verlauf und individuelle Ausgangslage wichtig."
            )

    zusammenfassung_detail = einleitung + " ".join(detail_teile)
    return zusammenfassung_kurz, zusammenfassung_detail


def process_and_validate_data(
    raw_data: Dict[str, Any],
    geschlecht: Optional[str] = None,
    alter: Optional[int] = None,
) -> AnalysisResponse:
    # 1. Technische Validierung via Pydantic
    response_model = AnalysisResponse(**raw_data)

    # Patientendaten im Meta-Objekt speichern falls angegeben
    if alter is not None:
        response_model.meta.alter = alter
    if geschlecht is not None:
        response_model.meta.geschlecht = geschlecht

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

        if field_name == "ecw_tbw" and (wert < 0.30 or wert > 0.55):
            auffaellige_felder.append(f"{field_name} (Wert '{wert}' unplausibel)")

        # Fachlicher Warnhinweis: ECW/TBW erhöht → mögliche Wassereinlagerung
        if field_name == "ecw_tbw" and wert > 0.40:
            warnungen.append(
                "ECW/TBW-Ratio erhöht (>0.40). Möglicher Hinweis auf Wassereinlagerungen "
                "– bei Auffälligkeiten ärztlich abklären lassen."
            )

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

    # 4. Dynamische Zusammenfassungen erzeugen (feldspezifisch)
    zusammenfassung_kurz, zusammenfassung_detail = _build_summary(
        werte_dict, ampel, geschlecht=geschlecht, alter=alter
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