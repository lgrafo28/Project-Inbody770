from pydantic import BaseModel, conlist, Field
from typing import Optional, Dict

class DocumentMeta(BaseModel):
    dokument_typ: str
    name: Optional[str] = None
    datum: Optional[str] = None
    confidence: float

class Messwert(BaseModel):
    wert: Optional[float] = None
    einheit: Optional[str] = None
    normal_min: Optional[float] = None
    normal_max: Optional[float] = None
    confidence: Optional[float] = 1.0

class WerteList(BaseModel):
    gewicht: Optional[Messwert] = None
    skelettmuskel: Optional[Messwert] = None
    koerperfett: Optional[Messwert] = None
    bmi: Optional[Messwert] = None
    koerperfettanteil: Optional[Messwert] = None
    viszeralfett: Optional[Messwert] = None
    grundumsatz: Optional[Messwert] = None
    koerperwasser: Optional[Messwert] = None
    ecw_tbw: Optional[Messwert] = None

class Hinweise(BaseModel):
    training: list[str] = Field(default_factory=list)
    ernaehrung: list[str] = Field(default_factory=list)
    verlauf: list[str] = Field(default_factory=list)

class ValidierungsErgebnis(BaseModel):
    fehlende_felder: list[str] = Field(default_factory=list)
    auffaellige_felder: list[str] = Field(default_factory=list)
    warnungen: list[str] = Field(default_factory=list)

class AnalysisResponse(BaseModel):
    meta: DocumentMeta
    werte: WerteList
    zusammenfassung_kurz: str
    zusammenfassung_detail: str
    ampel: str
    ampel_begruendung: str
    hinweise: Hinweise
    validierung: ValidierungsErgebnis
