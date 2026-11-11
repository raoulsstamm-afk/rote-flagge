import type { Eintrag } from '@/state/store';
import { KategorieId, kategorien } from './kategorien';

// Einfache Auswertung ohne KI: Wie oft kam welche Kategorie in den letzten 4 Wochen vor?
export const TAGE_ZEITRAUM = 28;
// Ab so vielen gleichen Einträgen zeigt die App "Du bildest dir das nicht ein"
export const MUSTER_AB = 3;

const TAG_MS = 24 * 60 * 60 * 1000;

export function letzteVierWochen(eintraege: Eintrag[], jetzt = Date.now()) {
  return eintraege.filter((e) => jetzt - e.zeit <= TAGE_ZEITRAUM * TAG_MS);
}

export function haeufigkeiten(eintraege: Eintrag[], jetzt = Date.now()): { id: KategorieId; anzahl: number }[] {
  const zaehler = new Map<KategorieId, number>();
  for (const e of letzteVierWochen(eintraege, jetzt)) for (const k of e.kategorien) zaehler.set(k, (zaehler.get(k) ?? 0) + 1);
  return kategorien
    .map((k) => ({ id: k.id, anzahl: zaehler.get(k.id) ?? 0 }))
    .filter((k) => k.anzahl > 0)
    .sort((a, b) => b.anzahl - a.anzahl);
}

// Kategorien mit mindestens MUSTER_AB Einträgen in 4 Wochen ("etwas anderes" zählt nicht als Muster)
export function erkannteMuster(eintraege: Eintrag[], jetzt = Date.now()) {
  return haeufigkeiten(eintraege, jetzt).filter((h) => h.anzahl >= MUSTER_AB && h.id !== 'anderes');
}

// Einträge pro Woche (älteste zuerst), für den kleinen Wochen-Verlauf
export function proWoche(eintraege: Eintrag[], jetzt = Date.now()) {
  const wochen = [0, 0, 0, 0];
  for (const e of letzteVierWochen(eintraege, jetzt)) {
    const w = Math.min(3, Math.floor((jetzt - e.zeit) / (7 * TAG_MS)));
    wochen[3 - w] += 1;
  }
  return wochen;
}

// Häufigstes Gefühl danach
export function haeufigstesGefuehl(eintraege: Eintrag[], jetzt = Date.now()) {
  const zaehler = new Map<string, number>();
  for (const e of letzteVierWochen(eintraege, jetzt)) for (const g of e.gefuehle) zaehler.set(g, (zaehler.get(g) ?? 0) + 1);
  const top = [...zaehler.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? { gefuehl: top[0], anzahl: top[1] } : null;
}

const WOCHENTAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONAT = ['Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.'];
export function datumText(zeit: number) {
  const d = new Date(zeit);
  const uhr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${WOCHENTAG[d.getDay()]}, ${d.getDate()}. ${MONAT[d.getMonth()]} · ${uhr}`;
}

// Ganze Kalendertage zwischen zwei Zeitpunkten
export function kalenderTage(von: number, bis = Date.now()) {
  const a = new Date(von);
  const b = new Date(bis);
  const ta = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const tb = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.max(0, Math.round((tb - ta) / TAG_MS));
}
