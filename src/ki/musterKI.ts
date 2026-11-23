import { kategorieKurz, KategorieId, waermeWert } from '@/data/kategorien';
import { haeufigkeiten, haeufigstesGefuehl, letzteVierWochen } from '@/data/muster';
import type { Eintrag } from '@/state/store';

// ============================================================================
// KI-Musterbericht (Raoul 23.11.2026): die KI liest die Einträge der letzten 4 Wochen und zeigt Muster
// als Bilder (Heiß-kalt-Kurve, "Was gesagt wird / was passiert", Muster-Karten).
// ============================================================================
// - Server: Supabase-Funktion "rote-flagge-muster" im Kopfkiste-Projekt (rozigbnbifcbsiybarzm, EU),
//   Claude Haiku, nichts gespeichert, Tageslimit pro Gerät. Code: supabase/functions/rote-flagge-muster/.
// - Nur mit ausdrücklicher Einwilligung (z.kiEinwilligung), nur für Zahlende.
// - Regeln: Verhalten beschreiben, nie die Person bewerten. Keine Diagnosewörter,
//   kein Rat "trenn dich" oder "bleib". Bei Gewalt oder Angst sofort Hilfe-Nummern (hilfeHinweis).
// - Solange KI_AKTIV aus ist oder kein Internet da ist, rechnet die App den Bericht selbst (lokalerBericht).
//   Die Bilder sehen gleich aus, nur die Sätze sind einfacher.

export const KI_AKTIV = false;
const FUNKTION_URL = 'https://rozigbnbifcbsiybarzm.supabase.co/functions/v1/rote-flagge-muster';

export type MusterKarte = { name: string; anzahl: number; satz: string };
export type MusterBericht = {
  quelle: 'ki' | 'app';
  kernsatz: string;
  muster: MusterKarte[];
  // Was gesagt wurde und was danach passiert ist (aus den Einträgen, nur bei der KI)
  sagtTut: { sagt: string; tut: string }[];
  hilfeHinweis: boolean;
};

// Heiß-kalt-Kurve: ein Punkt pro Eintrag mit Wärme-Angabe (warm +1, beides 0, kalt -1), älteste zuerst
export function kurve(eintraege: Eintrag[]) {
  return letzteVierWochen(eintraege)
    .filter((e) => e.waerme)
    .sort((a, b) => a.zeit - b.zeit)
    .map((e) => ({ zeit: e.zeit, wert: waermeWert(e.waerme) }));
}

// Wie oft kippt es zwischen warm und kalt? Ab 3 Wechseln ist das Hin und Her ein Muster.
export function wechsel(punkte: { wert: number }[]) {
  let n = 0;
  let letzter = 0;
  for (const p of punkte) {
    if (p.wert === 0) continue;
    if (letzter !== 0 && p.wert !== letzter) n++;
    letzter = p.wert;
  }
  return n;
}

const SATZ: Partial<Record<KategorieId, string>> = {
  warmkalt: 'Nähe kommt und geht. Du wartest dazwischen.',
  schuld: 'Am Ende ging es um dich statt um das, was passiert ist.',
  versprechen: 'Worte ändern sich schnell. Das Verhalten bleibt.',
  angezweifelt: 'Du erinnerst dich. Deine Einträge auch.',
  ignoriert: 'Schweigen wird zur Antwort.',
  abgewertet: 'Danach fühlst du dich kleiner als vorher.',
  laecherlich: 'Was als Spaß verpackt ist, trifft dich trotzdem.',
  kontrolliert: 'Dein Freiraum wird kleiner.',
  angeschrien: 'Laut werden ist nie deine Schuld.',
};

export function lokalerBericht(eintraege: Eintrag[]): MusterBericht {
  const h = haeufigkeiten(eintraege).filter((x) => x.id !== 'anderes').slice(0, 3);
  const w = wechsel(kurve(eintraege));
  const gefuehl = haeufigstesGefuehl(eintraege);
  const muster: MusterKarte[] = h.map((x) => ({ name: kategorieKurz(x.id), anzahl: x.anzahl, satz: SATZ[x.id] ?? 'Das wiederholt sich.' }));
  let kernsatz = 'Mit jedem Eintrag wird das Bild klarer.';
  if (w >= 3) kernsatz = `Es kippt immer wieder zwischen warm und kalt (${w} Mal). So fühlt sich Warmhalten an.`;
  else if (h[0] && h[0].anzahl >= 3) kernsatz = `${h[0].anzahl} Mal "${kategorieKurz(h[0].id)}". Du bildest dir das nicht ein.`;
  else if (gefuehl) kernsatz = `Danach fühlst du dich am häufigsten ${gefuehl.gefuehl.toLowerCase()}.`;
  return { quelle: 'app', kernsatz, muster, sagtTut: [], hilfeHinweis: eintraege.some((e) => e.kategorien.includes('bedroht')) };
}

// Holt den KI-Bericht. Ohne Einwilligung, ohne KI oder bei einem Fehler: der Bericht der App.
export async function musterBericht(eintraege: Eintrag[], einwilligung: boolean, holeToken?: () => Promise<string | null>): Promise<MusterBericht> {
  const lokal = lokalerBericht(eintraege);
  if (!KI_AKTIV || !einwilligung || !holeToken) return lokal;
  try {
    const token = await holeToken();
    if (!token) return lokal;
    const daten = letzteVierWochen(eintraege).map((e) => ({
      tag: new Date(e.zeit).toISOString().slice(0, 10),
      text: e.text.slice(0, 1200),
      gefuehle: e.gefuehle,
      waerme: e.waerme ?? null,
      kategorien: e.kategorien,
    }));
    const antwort = await fetch(FUNKTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ eintraege: daten.slice(0, 40) }),
    });
    if (!antwort.ok) return lokal;
    const ki = (await antwort.json()) as Partial<MusterBericht>;
    if (!ki.kernsatz) return lokal;
    return { quelle: 'ki', kernsatz: ki.kernsatz, muster: ki.muster?.slice(0, 4) ?? lokal.muster, sagtTut: ki.sagtTut?.slice(0, 3) ?? [], hilfeHinweis: !!ki.hilfeHinweis || lokal.hilfeHinweis };
  } catch {
    return lokal;
  }
}
