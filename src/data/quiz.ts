import type { KategorieId } from './kategorien';

// Quiz "Ist das noch normal?". Aussagen beschreiben Verhalten, keine Diagnosen.
// Jede Aussage gehört zu einer Kategorie, damit die Antworten im Plan und im Tagebuch wieder auftauchen.
export type Antwort = 0 | 1 | 2; // 0 = Nein, 1 = Manchmal, 2 = Ja, oft

export const quizAussagen: { id: string; text: string; kategorie: KategorieId | null }[] = [
  { id: 'luft', text: 'Nach einem Streit tut er tagelang so, als wäre ich Luft.', kategorie: 'ignoriert' },
  { id: 'schuld', text: 'Wenn ich etwas anspreche, bin am Ende ich schuld.', kategorie: 'schuld' },
  { id: 'nie-passiert', text: 'Er sagt, Dinge seien nie passiert, obwohl ich mich genau erinnere.', kategorie: 'angezweifelt' },
  { id: 'spass', text: 'Vor anderen macht er sich über mich lustig und nennt es Spaß.', kategorie: 'laecherlich' },
  { id: 'wo-bist-du', text: 'Er will immer wissen, wo ich bin und mit wem ich schreibe.', kategorie: 'kontrolliert' },
  { id: 'laut', text: 'Wenn ihm etwas nicht passt, wird er laut.', kategorie: 'angeschrien' },
  { id: 'aendern', text: 'Er verspricht, sich zu ändern. Dann bleibt alles, wie es war.', kategorie: 'versprechen' },
  { id: 'eierschalen', text: 'Ich überlege mir vorher genau, wie ich etwas sage, damit er nicht sauer wird.', kategorie: null },
  { id: 'kleiner', text: 'Nach einem Treffen fühle ich mich kleiner als vorher.', kategorie: 'abgewertet' },
  { id: 'freunde', text: 'Seit wir uns kennen, sehe ich meine Freunde seltener.', kategorie: 'kontrolliert' },
];

export const antwortTexte: { wert: Antwort; text: string }[] = [
  { wert: 2, text: 'Ja, oft' },
  { wert: 1, text: 'Manchmal' },
  { wert: 0, text: 'Nein' },
];

// Wie viele Aussagen kennst du (oft oder manchmal)?
export function quizTreffer(antworten: Record<string, Antwort>) {
  return quizAussagen.filter((a) => (antworten[a.id] ?? 0) > 0).length;
}

// Die Kategorien, die im Quiz am stärksten vorkamen (höchstens 3), für Plan und Chip-Reihenfolge
export function quizSchwerpunkte(antworten: Record<string, Antwort>): KategorieId[] {
  const punkte = new Map<KategorieId, number>();
  for (const a of quizAussagen) {
    const w = antworten[a.id] ?? 0;
    if (!a.kategorie || w === 0) continue;
    punkte.set(a.kategorie, (punkte.get(a.kategorie) ?? 0) + w);
  }
  return [...punkte.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => k);
}

export function ergebnisText(treffer: number) {
  if (treffer >= 6)
    return {
      titel: 'Du bildest dir das nicht ein.',
      text: 'Das sind keine Kleinigkeiten. Wenn du festhältst, was passiert, siehst du es schwarz auf weiß.',
    };
  if (treffer >= 3)
    return {
      titel: 'Da ist einiges, das dir nicht guttut.',
      text: 'Dein Gefühl hat einen Grund. Halte fest, was passiert, dann wird es klarer.',
    };
  return {
    titel: 'Gut, dass du genau hinschaust.',
    text: 'Auch einzelne Momente dürfen dich beschäftigen. Halte sie fest, wenn sie passieren.',
  };
}
