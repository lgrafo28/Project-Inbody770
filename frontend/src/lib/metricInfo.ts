export interface MetricInfo {
  title: string;
  body: string;
}

export const METRIC_INFO: Record<string, MetricInfo> = {
  gewicht: {
    title: 'Körpergewicht',
    body: 'Das Körpergewicht ist ein wichtiger Basiswert, sollte aber immer zusammen mit Muskelmasse, Körperfett und Wasserverteilung betrachtet werden. Erst die Kombination ergibt ein aussagekräftiges Gesamtbild.',
  },
  bmi: {
    title: 'BMI',
    body: 'Der Body-Mass-Index setzt Körpergewicht und Körpergröße ins Verhältnis. Er dient als grober Orientierungswert, sagt aber allein noch nichts über Muskel- und Fettverteilung aus.',
  },
  skelettmuskel: {
    title: 'Muskelmasse',
    body: 'Die Muskelmasse beschreibt den Anteil Ihres Körpers, der aktiv zur Bewegung und Stabilität beiträgt. Sie ist ein wichtiger Faktor für Leistungsfähigkeit, Haltung und Stoffwechsel.',
  },
  koerperfett: {
    title: 'Körperfettmasse',
    body: 'Die Körperfettmasse zeigt das absolute Gewicht des Fettgewebes. Betrachten Sie sie stets im Zusammenhang mit Muskelmasse und Körperfettanteil für ein vollständiges Bild.',
  },
  koerperfettanteil: {
    title: 'Körperfettanteil',
    body: 'Der Körperfettanteil zeigt, wie viel Prozent Ihres Körpergewichts aus Fettmasse bestehen. Er hilft dabei, die Körperzusammensetzung besser einzuordnen als das Gewicht allein.',
  },
  viszeralfett: {
    title: 'Viszeraler Fettbereich',
    body: 'Dieser Wert beschreibt das Fettgewebe im Bauchraum rund um die inneren Organe. Er ist gesundheitlich besonders relevant und wird meist genauer beobachtet als reines Unterhautfett.',
  },
  grundumsatz: {
    title: 'Grundumsatz',
    body: 'Der Grundumsatz beschreibt die Energiemenge, die Ihr Körper in Ruhe pro Tag benötigt. Er ist eine hilfreiche Grundlage für Ernährung, Gewichtsverlauf und Trainingsplanung.',
  },
  koerperwasser: {
    title: 'Körperwasser',
    body: 'Das Körperwasser umfasst die gesamte im Körper gespeicherte Flüssigkeit. Es spielt eine wichtige Rolle für Stoffwechsel, Leistungsfähigkeit und allgemeine körperliche Balance.',
  },
  ecw_tbw: {
    title: 'ECW / TBW',
    body: 'ECW/TBW beschreibt das Verhältnis von extrazellulärem Wasser zum Gesamtkörperwasser. Der Wert kann Hinweise auf die Wasserverteilung im Körper geben und wird im Verlauf oft mitbeobachtet.',
  },
};
