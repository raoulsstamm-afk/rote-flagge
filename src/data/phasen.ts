// Ein Modus für alle (Raoul 11.11. und 23.11.2026): Die App gilt beim Kennenlernen, beim Warmgehalten-Werden,
// in der Beziehung und nach der Trennung. Die Phase ändert nur Texte und die große Zahl.
export type Phase = 'kennenlernen' | 'kompliziert' | 'zusammen' | 'getrennt';

export const PHASEN: { id: Phase; text: string; icon: string }[] = [
  { id: 'kennenlernen', text: 'Wir lernen uns kennen', icon: 'funken' },
  { id: 'kompliziert', text: 'Es ist kompliziert', icon: 'knoten' },
  { id: 'zusammen', text: 'Wir sind zusammen', icon: 'herz' },
  { id: 'getrennt', text: 'Wir haben uns getrennt', icon: 'bruch' },
];

// Nach der Trennung zählt die Kontaktpause, sonst die Tage bei dir
export const zaehltKontaktpause = (p: Phase | null) => p === 'getrennt';
