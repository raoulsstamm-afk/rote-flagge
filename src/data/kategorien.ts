// Was ist passiert? Kategorien beschreiben Verhalten, nie die Person (keine Diagnosewörter).
export type KategorieId =
  | 'warmkalt'
  | 'ignoriert'
  | 'angeschrien'
  | 'versprechen'
  | 'laecherlich'
  | 'kontrolliert'
  | 'schuld'
  | 'angezweifelt'
  | 'abgewertet'
  | 'bedroht'
  | 'anderes';

export const kategorien: { id: KategorieId; name: string; kurz: string }[] = [
  { id: 'warmkalt', name: 'Erst nah, dann weg', kurz: 'erst nah, dann weg' },
  { id: 'ignoriert', name: 'Ignoriert', kurz: 'ignoriert' },
  { id: 'angeschrien', name: 'Angeschrien', kurz: 'angeschrien' },
  { id: 'versprechen', name: 'Versprechen gebrochen', kurz: 'Versprechen gebrochen' },
  { id: 'laecherlich', name: 'Lächerlich gemacht', kurz: 'lächerlich gemacht' },
  { id: 'kontrolliert', name: 'Kontrolliert', kurz: 'kontrolliert' },
  { id: 'schuld', name: 'Schuld umgedreht', kurz: 'Schuld umgedreht' },
  { id: 'angezweifelt', name: 'Meine Erinnerung angezweifelt', kurz: 'Erinnerung angezweifelt' },
  { id: 'abgewertet', name: 'Kleingemacht', kurz: 'kleingemacht' },
  { id: 'bedroht', name: 'Bedroht oder angefasst', kurz: 'bedroht oder angefasst' },
  { id: 'anderes', name: 'Etwas anderes', kurz: 'etwas anderes' },
];

export const kategorieName = (id: KategorieId) => kategorien.find((k) => k.id === id)?.name ?? id;
export const kategorieKurz = (id: KategorieId) => kategorien.find((k) => k.id === id)?.kurz ?? id;

// Wie ging's dir danach?
export const gefuehle = ['Klein', 'Verwirrt', 'Schuldig', 'Traurig', 'Wütend', 'Ängstlich', 'Leer', 'Erschöpft', 'Hoffnungsvoll', 'Ruhig'];

// War die andere Person gerade warm oder kalt? Daraus entsteht die Heiß-kalt-Kurve.
export type Waerme = 'warm' | 'kalt' | 'beides';
export const WAERME_WAHL: { id: Waerme; text: string }[] = [
  { id: 'warm', text: 'Warm und nah' },
  { id: 'kalt', text: 'Kalt und weg' },
  { id: 'beides', text: 'Beides auf einmal' },
];
export const waermeWert = (w: Waerme | null | undefined) => (w === 'warm' ? 1 : w === 'kalt' ? -1 : 0);
