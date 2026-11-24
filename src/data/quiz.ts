import type { KategorieId } from './kategorien';
import type { formen } from './person';

// Onboarding-Quiz (Redesign 23.11.2026, zwei Regler seit 24.11.). Gemischte Formate: Karten (höchstens 4), Mehrfachwahl als Chips,
// Regler mit Knäuel-Posen je Stufe. Fragen beschreiben Verhalten und Alltag, nie eine Diagnose. Antworten tauchen in Ergebnis,
// Plan, Tagebuch und SOS wieder auf.
type F = ReturnType<typeof formen>;
export type QuizAntworten = Record<string, string | string[] | number>;

export type Frage =
  | { id: string; art: 'karten'; titel: (f: F) => string; optionen: { id: string; text: (f: F) => string; icon: string }[] }
  | { id: string; art: 'chips'; titel: (f: F) => string; unter: string; optionen: { id: string; text: (f: F) => string; kategorie?: KategorieId }[] }
  | { id: string; art: 'regler'; titel: (f: F) => string; stufen: string[]; posen: string[] };

export const FRAGEN: Frage[] = [
  {
    id: 'danach',
    art: 'karten',
    titel: (f) => `Wie fühlst du dich nach einem Treffen mit ${f.nameOder}?`,
    optionen: [
      { id: 'leichter', text: () => 'Leichter', icon: 'sonne' },
      { id: 'gemischt', text: () => 'Mal so, mal so', icon: 'welle' },
      { id: 'verwirrt', text: () => 'Verwirrt', icon: 'knoten' },
      { id: 'kleiner', text: () => 'Kleiner als vorher', icon: 'klein' },
    ],
  },
  {
    id: 'gedanken',
    art: 'regler',
    titel: (f) => `Wie oft denkst du an ${f.ihn}?`,
    stufen: ['Selten', 'Ab und zu', 'Täglich', 'Mehrmals täglich', 'Ständig'],
    posen: ['schlafen', 'stehen', 'denken', 'verheddert', 'verheddert'],
  },
  {
    id: 'kennst',
    art: 'chips',
    titel: () => 'Was davon kennst du?',
    unter: 'Tipp alles an, was passt.',
    optionen: [
      { id: 'warmkalt', text: () => 'Erst ganz nah, dann tagelang still', kategorie: 'warmkalt' },
      { id: 'schuld', text: () => 'Am Ende bin ich schuld', kategorie: 'schuld' },
      { id: 'versprechen', text: () => 'Versprechen ohne Taten', kategorie: 'versprechen' },
      { id: 'erinnerung', text: () => 'Meine Erinnerung wird angezweifelt', kategorie: 'angezweifelt' },
      { id: 'warten', text: () => 'Ich warte ständig auf eine Nachricht' },
      { id: 'klein', text: () => 'Kleine Sticheleien vor anderen', kategorie: 'laecherlich' },
      { id: 'kontrolle', text: (f) => `${f.Er} will wissen, wo ich bin`, kategorie: 'kontrolliert' },
      { id: 'schoenreden', text: () => 'Ich rede vieles schön' },
    ],
  },
  {
    id: 'handy',
    art: 'regler',
    titel: (f) => `Wie oft schaust du, ob ${f.er} geschrieben hat?`,
    stufen: ['Kaum', 'Ab und zu', 'Oft', 'Ständig', 'Alle paar Minuten'],
    posen: ['schlafen', 'stehen', 'denken', 'handy', 'handy'],
  },
  {
    id: 'schwer',
    art: 'chips',
    titel: () => 'Wann ist es am schwersten?',
    unter: 'Genau dann ist die App für dich da.',
    optionen: [
      { id: 'abends', text: () => 'Abends im Bett' },
      { id: 'meldet', text: (f) => `Wenn ${f.er} sich meldet` },
      { id: 'still', text: (f) => `Wenn ${f.er} nicht antwortet` },
      { id: 'wochenende', text: () => 'Am Wochenende' },
      { id: 'social', text: (f) => `Wenn ich ${f.sein === 'sein' ? 'seine' : 'ihre'} Storys sehe` },
      { id: 'alkohol', text: () => 'Nach ein paar Drinks' },
    ],
  },
  {
    id: 'zurueck',
    art: 'chips',
    titel: () => 'Was willst du zurück?',
    unter: 'Wir bauen deinen Plan darum.',
    optionen: [
      { id: 'ruhe', text: () => 'Ruhe im Kopf' },
      { id: 'schlaf', text: () => 'Guten Schlaf' },
      { id: 'selbstwert', text: () => 'Mein Selbstwert' },
      { id: 'klarheit', text: () => 'Klarheit' },
      { id: 'freunde', text: () => 'Zeit mit Freunden' },
      { id: 'ich', text: () => 'Mich selbst' },
    ],
  },
];

export const liste = (a: QuizAntworten, id: string) => (Array.isArray(a[id]) ? (a[id] as string[]) : []);

// Die Kategorien aus "Was davon kennst du?" (höchstens 3), für Chip-Reihenfolge im Tagebuch und den Plan
export function quizSchwerpunkte(a: QuizAntworten): KategorieId[] {
  const frage = FRAGEN.find((f) => f.id === 'kennst');
  if (!frage || frage.art !== 'chips') return [];
  return liste(a, 'kennst')
    .map((id) => frage.optionen.find((o) => o.id === id)?.kategorie)
    .filter((k): k is KategorieId => !!k)
    .slice(0, 3);
}

// Dein Muster aus den Antworten (beschreibt dein Verhalten, nie die andere Person)
export function deinMuster(a: QuizAntworten) {
  const k = liste(a, 'kennst');
  if (k.includes('warmkalt') || k.includes('warten'))
    return { name: 'Das Warten', satz: 'Du wartest auf die warme Seite. Und die kalte Seite kostet dich Kraft.' };
  if (k.includes('schuld') || k.includes('erinnerung'))
    return { name: 'Das Erklären', satz: 'Du erklärst dich, bis du selbst nicht mehr weißt, was passiert ist.' };
  if (k.includes('schoenreden') || k.includes('versprechen'))
    return { name: 'Das Hoffen', satz: 'Du hältst an dem fest, was sein könnte. Nicht an dem, was ist.' };
  return { name: 'Das genaue Hinschauen', satz: 'Du spürst, dass etwas nicht passt. Jetzt machst du es sichtbar.' };
}

export const ZIELE = [30, 60, 90] as const;
