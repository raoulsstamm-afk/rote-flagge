import { Platform } from 'react-native';

// Spracheingabe fürs Tagebuch (übernommen aus Kopfkiste, src/sprache.ts): antippen, erzählen, nochmal antippen.
// Die Erkennung läuft über Apple bzw. Google. Das Paket braucht einen eigenen Build. Fehlt es (Browser, ältere Test-App), meldet verfuegbar() false.
//
// iPhone in zwei Durchgängen, damit nichts abreißt:
// 1. Beim Sprechen erkennt das Handy selbst (bricht bei Pausen nicht ab) und schneidet den Ton mit.
// 2. Nach dem Fertig-Tippen erkennt Apple die ganze Aufnahme am Stück noch einmal genauer. Danach wird die Aufnahme gelöscht.
// Geht das nicht (älteres Handy, Deutsch nicht auf dem Gerät, Android), hört die App über Apple bzw. Google zu und startet nach Pausen neu.

type Modul = {
  isRecognitionAvailable: () => boolean;
  supportsOnDeviceRecognition: () => boolean;
  getSupportedLocales: (o: Record<string, unknown>) => Promise<{ locales: string[]; installedLocales: string[] }>;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  start: (o: Record<string, unknown>) => void;
  stop: () => void;
  abort: () => void;
  addListener: (name: string, fn: (e: any) => void) => { remove: () => void };
};

let modul: Modul | null | undefined;
function lade(): Modul | null {
  if (modul !== undefined) return modul;
  modul = null;
  if (Platform.OS === 'web') return modul;
  try {
    // Erst harmlos fragen, ob das native Modul im Build steckt. Nur dann das Paket laden (sonst Absturzgefahr).
    const { requireOptionalNativeModule } = require('expo');
    if (!requireOptionalNativeModule('ExpoSpeechRecognition')) return modul;
    modul = require('expo-speech-recognition').ExpoSpeechRecognitionModule as Modul;
    if (!modul || typeof modul.start !== 'function') modul = null;
  } catch {
    modul = null;
  }
  return modul;
}

export function spracheVerfuegbar(): boolean {
  const m = lade();
  if (!m) return false;
  try {
    return m.isRecognitionAvailable();
  } catch {
    return false;
  }
}

// Kann das iPhone Deutsch ohne Internet erkennen? Einmal nachsehen und merken.
let aufDemGeraet: boolean | undefined;
async function geraetKannDeutsch(m: Modul): Promise<boolean> {
  if (aufDemGeraet !== undefined) return aufDemGeraet;
  aufDemGeraet = false;
  if (Platform.OS !== 'ios') return aufDemGeraet;
  try {
    if (!m.supportsOnDeviceRecognition()) return aufDemGeraet;
    const { installedLocales } = await m.getSupportedLocales({});
    aufDemGeraet = installedLocales.some((l) => l.replace('_', '-').toLowerCase().startsWith('de'));
  } catch {
    aufDemGeraet = false;
  }
  return aufDemGeraet;
}

let abos: { remove: () => void }[] = [];
let haltend = false;
let gestartet = 0;
let abschluss: (() => void) | null = null;
// Länger als drei Minuten am Stück hört die App nicht zu (falls jemand vergisst, wieder zu tippen)
const HOECHSTENS = 180_000;
// Apple erkennt Aufnahmen über das Internet nur bis etwa eine Minute. Längeres bleibt beim Text vom Gerät.
const ZWEITER_DURCHGANG_BIS = 55_000;
// Typische Wörter im Beziehungs-Tagebuch, damit sie seltener falsch verstanden werden
const WOERTER = ['angeschrien', 'ignoriert', 'Nachricht', 'gelesen', 'Streit', 'Vorwurf', 'Eifersucht', 'entschuldigt', 'versprochen', 'lustig gemacht', 'Freunde', 'Handy', 'kontrolliert', 'Schuld', 'Mama', 'Papa'];
const OPTIONEN = {
  lang: 'de-DE',
  interimResults: true,
  continuous: true,
  addsPunctuation: true,
  contextualStrings: WOERTER,
  // Erkennung über Apple bzw. Google wie beim Diktieren der Tastatur: deutlich genauer als nur auf dem Gerät
  requiresOnDeviceRecognition: false,
  iosTaskHint: 'dictation',
  // Android: Sprechpausen bis 10 Sekunden aushalten, statt nach einer Sekunde Stille aufzuhören
  androidIntentOptions: {
    EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
    EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 10000,
  },
};
const aufraeumen = () => {
  abos.forEach((a) => a.remove());
  abos = [];
};
const verbinde = (a: string, b: string) => (a && b ? `${a.replace(/\s+$/, '')} ${b.replace(/^\s+/, '')}` : a || b);

// Die Aufnahme ist nur für den zweiten Durchgang da und wird danach sofort gelöscht
function loescheAufnahme(uri: string | null) {
  if (!uri) return;
  try {
    const { File } = require('expo-file-system');
    new File(uri).delete();
  } catch {
    // schon weg oder nicht erreichbar
  }
}

// Sammelt erkannte Abschnitte. Nach einer Sprechpause fängt das iPhone (und Android) mit einem neuen Abschnitt an,
// deshalb werden fertige Abschnitte aufgehoben, sonst bliebe nur das letzte Stück übrig.
function neuerSammler() {
  let fertig = '';
  let aktuell = '';
  return {
    nimm(e: { isFinal?: boolean; results?: { transcript: string }[] }) {
      const t = e.results?.[0]?.transcript ?? '';
      if (!t) return false;
      if (e.isFinal) {
        fertig = verbinde(fertig, t);
        aktuell = '';
      } else {
        // Neuer Abschnitt ohne Final-Meldung: deutlich kürzer und kein Anfang des alten Textes
        const neuAngefangen = aktuell.length > 12 && t.length < aktuell.length * 0.6 && !aktuell.trim().toLowerCase().startsWith(t.trim().toLowerCase().slice(0, 8));
        if (neuAngefangen) fertig = verbinde(fertig, aktuell);
        aktuell = t;
      }
      return true;
    },
    abschnittFertig() {
      fertig = verbinde(fertig, aktuell);
      aktuell = '';
    },
    text: () => verbinde(fertig, aktuell).trim(),
  };
}

// Startet das Zuhören. beiText bekommt laufend den erkannten Text, beiEnde den fertigen Text (oder '' bei Fehler).
export async function starteZuhoeren(beiText: (text: string) => void, beiEnde: (text: string) => void): Promise<boolean> {
  const m = lade();
  if (!m) return false;
  try {
    const erlaubnis = await m.requestPermissionsAsync();
    if (!erlaubnis.granted) return false;
    aufraeumen();
    const zweiDurchgaenge = await geraetKannDeutsch(m);
    const liveOptionen = zweiDurchgaenge ? { ...OPTIONEN, requiresOnDeviceRecognition: true, recordingOptions: { persist: true } } : OPTIONEN;

    let phase: 'live' | 'genau' = 'live';
    const live = neuerSammler();
    const genau = neuerSammler();
    let aufnahme: string | null = null;
    let neugestartet = false;
    let gemeldet = false;

    const fertigMelden = (text: string) => {
      if (gemeldet) return;
      gemeldet = true;
      haltend = false;
      abschluss = null;
      aufraeumen();
      loescheAufnahme(aufnahme);
      beiEnde(text);
    };

    // Zweiter Durchgang: die ganze Aufnahme am Stück genau erkennen lassen. Klappt das nicht, gilt der Text vom Gerät.
    const genauErkennen = () => {
      const dauer = Date.now() - gestartet;
      if (!aufnahme || neugestartet || dauer > ZWEITER_DURCHGANG_BIS) return fertigMelden(live.text());
      phase = 'genau';
      abschluss = null;
      const notbremse = setTimeout(() => fertigMelden(live.text()), 15000);
      abos.push(m.addListener('end', () => clearTimeout(notbremse)));
      try {
        m.start({ ...OPTIONEN, audioSource: { uri: aufnahme } });
      } catch {
        clearTimeout(notbremse);
        fertigMelden(live.text());
      }
    };

    abos.push(
      m.addListener('audiostart', (e: { uri?: string | null }) => {
        if (phase === 'live' && e?.uri && !aufnahme) aufnahme = e.uri;
      }),
      m.addListener('audioend', (e: { uri?: string | null }) => {
        if (phase === 'live' && e?.uri) aufnahme = e.uri;
      }),
      m.addListener('result', (e: { isFinal?: boolean; results?: { transcript: string }[] }) => {
        if (phase === 'live') {
          if (live.nimm(e)) beiText(live.text());
        } else {
          genau.nimm(e);
        }
      }),
      m.addListener('end', () => {
        if (phase === 'genau') {
          // Nur übernehmen, wenn der genaue Durchgang nicht deutlich weniger gefunden hat
          const g = genau.text();
          const l = live.text();
          return fertigMelden(g && g.length >= l.length * 0.6 ? g : l);
        }
        // Die Erkennung beendet sich nach einer Sprechpause manchmal von selbst. Solange der Mensch nicht "fertig" getippt hat, hört sie gleich weiter.
        // Kurz warten, damit die alte Runde ganz zu ist, sonst wird der Neustart manchmal verschluckt.
        if (haltend && Date.now() - gestartet < HOECHSTENS) {
          live.abschnittFertig();
          neugestartet = true;
          loescheAufnahme(aufnahme);
          aufnahme = null;
          setTimeout(() => {
            if (!haltend) return fertigMelden(live.text());
            try {
              m.start(liveOptionen);
            } catch {
              fertigMelden(live.text());
            }
          }, 120);
          return;
        }
        if (zweiDurchgaenge) genauErkennen();
        else fertigMelden(live.text());
      }),
      m.addListener('error', () => {
        // Meist folgt ein "end", dort wird neu gestartet bzw. abgeschlossen
        if (!haltend && phase === 'live' && !zweiDurchgaenge) fertigMelden(live.text());
      }),
    );
    abschluss = () => fertigMelden(live.text());
    haltend = true;
    gestartet = Date.now();
    m.start(liveOptionen);
    return true;
  } catch {
    aufraeumen();
    return false;
  }
}

export function stoppeZuhoeren() {
  haltend = false;
  try {
    lade()?.stop();
  } catch {
    // nichts zu tun
  }
  // Falls gerade zwischen zwei Abschnitten neu gestartet wurde und kein "end" mehr kommt
  const offen = abschluss;
  setTimeout(() => {
    if (offen && abschluss === offen) offen();
  }, 1500);
}
