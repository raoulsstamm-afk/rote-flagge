// Stufen der Szene auf "Heute": je mehr Tage, desto heller wird es. Nichts geht bei einem Neustart verloren,
// die Szene richtet sich nach der aktuellen Zahl (sanft, ohne Strafe).
export type Stufe = { ab: number; name: string; himmel: [string, string, string]; sonne: number; sterne: number };

export const STUFEN: Stufe[] = [
  { ab: 0, name: 'Nacht', himmel: ['#0B0714', '#160C22', '#24112A'], sonne: 0, sterne: 1 },
  { ab: 3, name: 'Morgengrauen', himmel: ['#120C22', '#2A1430', '#4A1F33'], sonne: 0.35, sterne: 0.6 },
  { ab: 7, name: 'Sonnenaufgang', himmel: ['#1E1230', '#5A2638', '#B4553F'], sonne: 0.7, sterne: 0.2 },
  { ab: 14, name: 'Neuer Tag', himmel: ['#2B2347', '#7A4A5E', '#E59A6A'], sonne: 0.9, sterne: 0 },
  { ab: 30, name: 'Weites Land', himmel: ['#3B3C6B', '#9A6A7A', '#F2B98A'], sonne: 1, sterne: 0 },
];

export function stufeZu(tage: number) {
  let i = 0;
  STUFEN.forEach((s, j) => {
    if (tage >= s.ab) i = j;
  });
  const naechste = STUFEN[i + 1] ?? null;
  const anteil = naechste ? (tage - STUFEN[i].ab) / (naechste.ab - STUFEN[i].ab) : 1;
  return { index: i, stufe: STUFEN[i], naechste, anteil: Math.max(0, Math.min(1, anteil)), fehlt: naechste ? naechste.ab - tage : 0 };
}
