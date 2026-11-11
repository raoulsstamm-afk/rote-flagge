// Farben und Schriften von Rote Flagge. Warm statt Alarm: Rot ist nur Akzent und Symbol, nie Warnfarbe.
export const farben = {
  // Hintergrund-Verläufe (von oben nach unten)
  creme: '#FFF3EA',
  pfirsich: '#FBE1D6',
  rose: '#F3D3D2',
  sand: '#F8E4DA',
  flieder: '#EADBE6',
  // Text
  text: '#4A3D35',
  textLeise: '#6E6057',
  textHell: '#9A8A80',
  weiss: '#FFFFFF',
  // Akzent (Flagge, Hauptknöpfe), Verlauf zu Korall
  akzent: '#B8463C',
  akzentHell: '#E0705A',
  akzentDunkel: '#9C3A44',
  akzentZart: '#FBD9C8',
  korall: '#F28B66',
  lavendel: '#B39AE8',
  // Flächen
  glas: 'rgba(255,255,255,0.85)',
  glasLeise: 'rgba(255,255,255,0.6)',
  karteVerlauf: ['#FFFFFF', '#FFF6F0'] as const,
  musterVerlauf: ['#FBD9C8', '#F2D3DF'] as const,
};

export const verlaeufe = {
  start: [farben.creme, farben.pfirsich, farben.rose] as const,
  tagebuch: [farben.creme, farben.sand, farben.flieder] as const,
  muster: [farben.creme, farben.pfirsich, '#EBDDEA'] as const,
  sos: [farben.rose, farben.sand, farben.creme] as const,
  knopf: [farben.akzent, farben.akzentHell] as const,
  grossKnopf: [farben.akzentHell, farben.akzent, farben.akzentDunkel] as const,
};

export const schatten = {
  karte: '0px 12px 30px rgba(184,70,60,0.12)',
  knopf: '0px 8px 20px rgba(184,70,60,0.30)',
  leise: '0px 6px 16px rgba(74,61,53,0.10)',
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

// Platz, den die schwebende Leiste unten braucht (Inhalte enden darüber)
export const LEISTE_PLATZ = 92;
