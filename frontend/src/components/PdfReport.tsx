/**
 * PdfReport.tsx
 *
 * Dedizierte A4-Reportkomponente für den PDF-Export.
 * Verwendet ausschließlich @react-pdf/renderer — keine HTML-Tags, kein Tailwind.
 *
 * Rendern: wird lazy-geladen (dynamic import in App.tsx), landet nicht im
 * initialen Bundle.
 */
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { AnalysisResponse, Messwert } from '../types';

// ── Farben ────────────────────────────────────────────────────────────────────
const C = {
  teal:     '#005c6b',
  tealLight:'#e0f4f7',
  text:     '#1a1a1a',
  sub:      '#6b7280',
  green:    '#059669',
  amber:    '#d97706',
  red:      '#dc2626',
  warnBg:   '#fffbeb',
  warnBorder:'#fcd34d',
  border:   '#e5e7eb',
  lightBg:  '#f8fafc',
  white:    '#ffffff',
} as const;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: C.white,
    paddingTop: 40,
    paddingBottom: 55,
    paddingHorizontal: 45,
    fontSize: 10,
    color: C.text,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: C.teal,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
  },
  headerSub: {
    fontSize: 7,
    color: C.sub,
    marginTop: 3,
  },
  headerDate: {
    fontSize: 8,
    color: C.sub,
    textAlign: 'right',
  },

  // Meta-Zeile
  metaBox: {
    backgroundColor: C.lightBg,
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    width: '33%',
    marginBottom: 6,
  },
  metaItemWide: {
    width: '66%',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
  },

  // Ampel
  ampelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ampelDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  ampelLabel: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  ampelBegruendung: {
    fontSize: 8.5,
    color: C.sub,
    marginBottom: 16,
    lineHeight: 1.4,
  },

  // Sections
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
    marginBottom: 8,
    marginTop: 16,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },

  // Klinische Einschätzung
  summaryKurz: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.text,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  summaryDetail: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.55,
  },

  // Hauptwerte-Grid (2×2)
  werteRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  werteCardWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  werteCardWrapperLast: {
    flex: 1,
    paddingRight: 0,
  },
  werteCard: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 4,
    padding: 10,
  },
  werteCardLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: C.sub,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  werteCardValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
    marginBottom: 3,
  },
  werteCardEinheit: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: C.sub,
  },
  werteCardNorm: {
    fontSize: 7.5,
    color: C.sub,
    marginBottom: 3,
  },
  statusOk: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.green,
  },
  statusOut: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: C.amber,
  },

  // Empfehlungen
  empSection: {
    marginBottom: 10,
  },
  empTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: C.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  empItem: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 3,
    paddingLeft: 10,
  },
  empBullet: {
    fontSize: 9,
    color: C.sub,
  },

  // Warnungsbox
  warnBox: {
    backgroundColor: C.warnBg,
    borderWidth: 1,
    borderColor: C.warnBorder,
    borderRadius: 4,
    padding: 10,
    marginTop: 16,
  },
  warnTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#92400e',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warnItem: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.45,
    marginBottom: 3,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 45,
    right: 45,
    textAlign: 'center',
    fontSize: 7,
    color: C.sub,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
    paddingTop: 6,
  },
});

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

function wertStr(m: Messwert | null | undefined): string {
  if (!m || m.wert == null) return '—';
  return String(m.wert);
}

function einheitStr(m: Messwert | null | undefined): string {
  return m?.einheit ?? '';
}

function normStr(m: Messwert | null | undefined): string | null {
  if (!m || m.normal_min == null || m.normal_max == null) return null;
  const e = m.einheit ? ` ${m.einheit}` : '';
  return `Norm: ${m.normal_min}–${m.normal_max}${e}`;
}

function rangeStatus(m: Messwert | null | undefined): 'ok' | 'out' | null {
  if (!m || m.wert == null || m.normal_min == null || m.normal_max == null) return null;
  return m.wert >= m.normal_min && m.wert <= m.normal_max ? 'ok' : 'out';
}

function todayDE(): string {
  return new Date().toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

// ── WerteCard ────────────────────────────────────────────────────────────────

interface WerteCardProps {
  label: string;
  messwert: Messwert | null | undefined;
  last?: boolean;
}

function WerteCard({ label, messwert, last }: WerteCardProps) {
  const status   = rangeStatus(messwert);
  const normText = normStr(messwert);
  const einheit  = einheitStr(messwert);

  return (
    <View style={last ? s.werteCardWrapperLast : s.werteCardWrapper}>
      <View style={s.werteCard}>
        <Text style={s.werteCardLabel}>{label}</Text>
        <Text style={s.werteCardValue}>
          {wertStr(messwert)}
          {einheit ? <Text style={s.werteCardEinheit}> {einheit}</Text> : null}
        </Text>
        {normText ? <Text style={s.werteCardNorm}>{normText}</Text> : null}
        {status === 'ok'  && <Text style={s.statusOk}>Im Normbereich</Text>}
        {status === 'out' && <Text style={s.statusOut}>Außerhalb Norm</Text>}
      </View>
    </View>
  );
}

// ── Haupt-Komponente ──────────────────────────────────────────────────────────

interface PdfReportProps {
  data: AnalysisResponse;
}

export function PdfReport({ data }: PdfReportProps) {
  const {
    meta, werte,
    zusammenfassung_kurz, zusammenfassung_detail,
    ampel, ampel_begruendung,
    hinweise, validierung,
  } = data;

  const today = todayDE();

  // Ampel
  const ampelColor = ampel === 'gruen' ? C.green : ampel === 'rot' ? C.red : C.amber;
  const ampelLabel = ampel === 'gruen' ? 'Sehr gut' : ampel === 'rot' ? 'Kritisch' : 'Beobachten';

  // Meta-Anzeige
  const geschlechtLabel = meta.geschlecht === 'm' ? 'Männlich'
    : meta.geschlecht === 'w' ? 'Weiblich'
    : null;
  const signalQuality = `${Math.round(meta.confidence * 100)} %`;

  // Empfehlungen: nur wenn vorhanden
  const hasTraining  = hinweise.training.length > 0;
  const hasErnährung = hinweise.ernaehrung.length > 0;
  const hasVerlauf   = hinweise.verlauf.length > 0;
  const hasHinweise  = hasTraining || hasErnährung || hasVerlauf;
  const hasWarnungen = validierung.warnungen.length > 0;

  return (
    <Document
      title="InBody 770 Analysebericht"
      author="InBody Vision"
      subject="Körperzusammensetzungs-Analyse"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>InBody 770 Analysebericht</Text>
            <Text style={s.headerSub}>Körperzusammensetzungs-Analyse</Text>
          </View>
          <Text style={s.headerDate}>Erstellt am {today}</Text>
        </View>

        {/* ── Meta-Zeile ─────────────────────────────────────────────── */}
        <View style={s.metaBox}>
          <View style={s.metaItemWide}>
            <Text style={s.metaLabel}>Name</Text>
            <Text style={s.metaValue}>{meta.name || '—'}</Text>
          </View>
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Messdatum</Text>
            <Text style={s.metaValue}>{meta.datum || '—'}</Text>
          </View>
          {meta.alter != null && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Alter</Text>
              <Text style={s.metaValue}>{meta.alter} Jahre</Text>
            </View>
          )}
          {geschlechtLabel && (
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Geschlecht</Text>
              <Text style={s.metaValue}>{geschlechtLabel}</Text>
            </View>
          )}
          <View style={s.metaItem}>
            <Text style={s.metaLabel}>Signalqualität</Text>
            <Text style={s.metaValue}>{signalQuality}</Text>
          </View>
        </View>

        {/* ── Ampel-Status ───────────────────────────────────────────── */}
        <View style={s.ampelRow}>
          <View style={[s.ampelDot, { backgroundColor: ampelColor }]} />
          <Text style={[s.ampelLabel, { color: ampelColor }]}>{ampelLabel}</Text>
        </View>
        {ampel_begruendung ? (
          <Text style={s.ampelBegruendung}>{ampel_begruendung}</Text>
        ) : null}

        {/* ── Klinische Einschätzung ─────────────────────────────────── */}
        {(zusammenfassung_kurz || zusammenfassung_detail) ? (
          <View>
            <Text style={s.sectionTitle}>Klinische Einschätzung</Text>
            {zusammenfassung_kurz ? (
              <Text style={s.summaryKurz}>{zusammenfassung_kurz}</Text>
            ) : null}
            {zusammenfassung_detail ? (
              <Text style={s.summaryDetail}>{zusammenfassung_detail}</Text>
            ) : null}
          </View>
        ) : null}

        {/* ── Hauptwerte ─────────────────────────────────────────────── */}
        <Text style={s.sectionTitle}>Hauptwerte</Text>
        <View style={s.werteRow}>
          <WerteCard label="Körpergewicht" messwert={werte.gewicht} />
          <WerteCard label="BMI" messwert={werte.bmi} last />
        </View>
        <View style={s.werteRow}>
          <WerteCard label="Skelettmuskelmasse" messwert={werte.skelettmuskel} />
          <WerteCard label="Körperfettanteil" messwert={werte.koerperfettanteil} last />
        </View>

        {/* ── Empfehlungen ───────────────────────────────────────────── */}
        {hasHinweise ? (
          <View>
            <Text style={s.sectionTitle}>Empfehlungen</Text>
            {hasTraining && (
              <View style={s.empSection}>
                <Text style={s.empTitle}>Bewegung</Text>
                {hinweise.training.slice(0, 3).map((item, i) => (
                  <Text key={i} style={s.empItem}>· {item}</Text>
                ))}
              </View>
            )}
            {hasErnährung && (
              <View style={s.empSection}>
                <Text style={s.empTitle}>Ernährung</Text>
                {hinweise.ernaehrung.slice(0, 3).map((item, i) => (
                  <Text key={i} style={s.empItem}>· {item}</Text>
                ))}
              </View>
            )}
            {hasVerlauf && (
              <View style={s.empSection}>
                <Text style={s.empTitle}>Verlauf</Text>
                {hinweise.verlauf.slice(0, 3).map((item, i) => (
                  <Text key={i} style={s.empItem}>· {item}</Text>
                ))}
              </View>
            )}
          </View>
        ) : null}

        {/* ── Warnungen ──────────────────────────────────────────────── */}
        {hasWarnungen ? (
          <View style={s.warnBox}>
            <Text style={s.warnTitle}>Hinweise zur Datenqualität</Text>
            {validierung.warnungen.map((w, i) => (
              <Text key={i} style={s.warnItem}>· {w}</Text>
            ))}
          </View>
        ) : null}

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <Text style={s.footer} fixed>
          Analysiert mit InBody Vision 770 · {today} · Kein Ersatz für ärztliche Beratung
        </Text>

      </Page>
    </Document>
  );
}
