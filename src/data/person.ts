// Um wen geht's? Name und Pronomen aus dem Onboarding steuern alle Texte (er/ihm, sie/ihr oder neutral).
export type Pronomen = 'er' | 'sie' | 'neutral';
export type Person = { name: string; pronomen: Pronomen };

export const PRONOMEN_WAHL: { id: Pronomen; text: string }[] = [
  { id: 'er', text: 'Ein Mann' },
  { id: 'sie', text: 'Eine Frau' },
  { id: 'neutral', text: 'Lieber offen lassen' },
];

// Formen für Texte. ihm = Dativ, ihn = Akkusativ, er = Nominativ, sein = Possessiv.
export function formen(p: Person | null) {
  const pr = p?.pronomen ?? 'er';
  const name = p?.name?.trim() || '';
  if (pr === 'sie') return { er: 'sie', Er: 'Sie', ihm: 'ihr', ihn: 'sie', sein: 'ihr', name, nameOder: name || 'ihr' };
  if (pr === 'neutral') return { er: 'die Person', Er: 'Die Person', ihm: 'der Person', ihn: 'die Person', sein: 'ihr', name, nameOder: name || 'der Person' };
  return { er: 'er', Er: 'Er', ihm: 'ihm', ihn: 'ihn', sein: 'sein', name, nameOder: name || 'ihm' };
}
