// Farben und Schriften von Rote Flagge. Redesign 23.11.2026 (Raoul): warme Nacht wie Drangduell,
// aber Pflaume statt Schwarz, Halation in Koralle und Morgenrot. Die Koralle ist nur Flagge, Hauptknopf
// und Fortschritt, nie Warnfarbe. Auf Koralle immer dunkle Schrift.
// Die alten Namen (creme, pfirsich ...) bleiben, damit alle Bildschirme mitziehen. Sie sind jetzt dunkel.
export const farben = {
  // Hintergrund (von oben nach unten)
  nachtOben: '#120C1C',
  nachtMitte: '#1B1027',
  nachtUnten: '#2A1426',
  creme: '#160E20',
  pfirsich: '#1D1128',
  rose: '#261427',
  sand: '#1A1024',
  flieder: '#22132A',
  // Text: hell, damit es auf der Nacht gut lesbar ist
  text: '#FFFFFF',
  textLeise: '#E6DCE8',
  textHell: '#A89BAE',
  weiss: '#FFFFFF',
  dunkel: '#1A0B0B',
  // Akzent (Flagge, Hauptknöpfe, Fortschritt): Koralle mit Verlauf zu Rot
  akzent: '#FF7A63',
  akzentHell: '#FF9A7A',
  akzentDunkel: '#E24A4A',
  akzentZart: 'rgba(255,122,99,0.16)',
  korall: '#FF9A6A',
  flaggeRot: '#FF5F55',
  morgen: '#FFB37A',
  lavendel: '#B39AE8',
  // Warm und kalt in der Heiß-kalt-Kurve
  warm: '#FFB37A',
  kalt: '#8FA3C8',
  schatten: '#8FA3C8',
  // Flächen: deckend fast schwarz-violett, nie halbtransparentes Weiß unter heller Schrift
  karte: '#17101E',
  karteRand: '#2E2236',
  feld: '#120C18',
  glas: '#17101E',
  glasLeise: '#140E1A',
  karteVerlauf: ['#1A1222', '#150E1C'] as const,
  musterVerlauf: ['#3A1A26', '#2A1430'] as const,
};

export const verlaeufe = {
  start: [farben.nachtOben, farben.nachtMitte, farben.nachtUnten] as const,
  tagebuch: [farben.nachtOben, farben.sand, farben.flieder] as const,
  muster: [farben.nachtOben, farben.pfirsich, '#2A1430'] as const,
  sos: [farben.nachtOben, '#1E0F22', '#2E1422'] as const,
  knopf: [farben.akzentHell, farben.akzentDunkel] as const,
  grossKnopf: [farben.akzentHell, farben.akzent, farben.akzentDunkel] as const,
};

export const schatten = {
  karte: '0px 12px 30px rgba(0,0,0,0.35)',
  knopf: '0px 0px 32px rgba(255,110,90,0.55)',
  leise: '0px 6px 16px rgba(0,0,0,0.30)',
  leuchten: '0px 0px 26px rgba(255,122,99,0.45)',
};

export const schrift = {
  normal: 'Nunito_400Regular',
  halbfett: 'Nunito_600SemiBold',
  fett: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
  // Serifen nur für Überschriften und große Sätze
  serif: 'Fraunces_600SemiBold',
  serifFett: 'Fraunces_700Bold',
};

// Überschriften: weiß mit dunkler Kontur und leichtem Leuchten (Raouls Design-Regel)
export const titelSchatten = { textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 };

// Platz, den die schwebende Leiste unten braucht (Inhalte enden darüber)
export const LEISTE_PLATZ = 96;
