import type { KategorieId } from '@/data/kategorien';

// ============================================================================
// PLATZHALTER: KI-Einordnung eines Tagebuch-Eintrags. Im MVP AUS, es wird KEIN Server angerufen.
// ============================================================================
// Später (Muster wie Kopfkiste src/ki/sortierenKI.ts):
// - Supabase-Funktion "einordnen" im Kopfkiste-Projekt (rozigbnbifcbsiybarzm), Modell Haiku, nichts speichern,
//   Tageslimit pro Gerät, nur für Zahlende (harte Paywall).
// - Vor dem ersten Aufruf ausdrückliche Einwilligung (Gesundheitsdaten, Art. 9 DSGVO, und Daten Dritter).
// - Regeln für die Anleitung: Verhalten beschreiben, nie die Person bewerten. Keine Diagnosewörter
//   (kein "Narzisst", keine Störungen), keine Heilversprechen, kein Rat "trenn dich" oder "bleib".
//   Bei Gewalt, Drohung oder Angst um das eigene Leben sofort auf 116 016 bzw. 110 hinweisen (hilfeHinweis).
// - Ohne Einwilligung oder ohne Internet: null zurückgeben, die App zeigt dann die einfache Auswertung.

export const KI_AKTIV = false;

export type Einordnung = {
  // ein warmer Satz zur Einordnung, z. B. "Das klingt nach Schuldumkehr: am Ende ging es um dich statt um sein Verhalten."
  satz: string;
  // vorgeschlagene Kategorien
  kategorien: KategorieId[];
  // true, wenn Hilfe-Nummern gezeigt werden sollen
  hilfeHinweis: boolean;
};

export async function ordneEin(_text: string, _kategorien: KategorieId[]): Promise<Einordnung | null> {
  if (!KI_AKTIV) return null;
  // Hier kommt später der Aufruf der Supabase-Funktion hin.
  return null;
}
