import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { KategorieId, Waerme } from '@/data/kategorien';
import { kalenderTage } from '@/data/muster';
import type { Person } from '@/data/person';
import { Phase, zaehltKontaktpause } from '@/data/phasen';
import type { QuizAntworten } from '@/data/quiz';
import type { MusterBericht } from '@/ki/musterKI';

// Speicher der App. Alles bleibt nur auf dem Handy (AsyncStorage). Keine Konten, kein Server, keine Statistik.
// Tagebuch-Einträge sind hochsensibel (Beziehung, Gefühle) und verlassen das Gerät nie.

export type Eintrag = {
  id: string;
  zeit: number;
  text: string;
  gefuehle: string[];
  kategorien: KategorieId[];
  // War die andere Person gerade warm oder kalt? (für die Heiß-kalt-Kurve, ältere Einträge haben nichts)
  waerme?: Waerme | null;
};

export type Geparkt = {
  id: string;
  text: string;
  zeit: number;
  // ab wann entschieden werden darf (24 Stunden später)
  bis: number;
  status: 'wartet' | 'behalten';
};

export type Zustand = {
  onboardingFertig: boolean;
  quiz: QuizAntworten;
  // Wo stehst du gerade? Und um wen geht's? (Redesign 23.11.2026)
  phase: Phase | null;
  person: Person | null;
  ziel: number;
  // Tage, an denen du bei dir geblieben bist (JJJJ-MM-TT), zählt außerhalb der Trennung
  tageBeiDir: string[];
  // SOS-Momente, die du überstanden hast
  sosGeschafft: number;
  // KI-Musterbericht nur mit ausdrücklicher Einwilligung (Art. 9 DSGVO, Daten Dritter)
  kiEinwilligung: boolean;
  kiBericht: { zeit: number; anzahl: number; bericht: MusterBericht } | null;
  // Uhrzeit der täglichen Erinnerung ("20:00") oder null
  erinnerung: string | null;
  appSperre: boolean;
  eintraege: Eintrag[];
  geparkt: Geparkt[];
  geparktGesamt: number;
  kontaktpause: { start: number | null; laengste: number };
};

const leererZustand: Zustand = {
  onboardingFertig: false,
  quiz: {},
  phase: null,
  person: null,
  ziel: 30,
  tageBeiDir: [],
  sosGeschafft: 0,
  kiEinwilligung: false,
  kiBericht: null,
  erinnerung: null,
  appSperre: false,
  eintraege: [],
  geparkt: [],
  geparktGesamt: 0,
  kontaktpause: { start: null, laengste: 0 },
};

// v2 seit dem Redesign 23.11.2026 (neues Quiz, Phasen). Alte Stände starten das Onboarding neu, Einträge bleiben.
const SCHLUESSEL = 'rote-flagge-v2';
const ALT_SCHLUESSEL = 'rote-flagge-v1';
export const PARK_DAUER_MS = 24 * 60 * 60 * 1000;

const neueId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type Vibration = 'tick' | 'leicht' | 'mittel' | 'erfolg';

type Kontext = {
  z: Zustand;
  geladen: boolean;
  setze: (teil: Partial<Zustand>) => void;
  vibriere: (stil?: Vibration) => void;
  eintragSpeichern: (e: Omit<Eintrag, 'id' | 'zeit'>) => Eintrag;
  eintragLoeschen: (id: string) => void;
  parken: (text: string) => Geparkt;
  entscheiden: (id: string, wahl: 'loeschen' | 'behalten') => void;
  kontaktpauseStarten: () => void;
  heuteBeiMir: () => void;
  sosGeschafftZaehlen: () => void;
  kontaktGehabt: () => void;
  allesLoeschen: () => Promise<void>;
};

const Ctx = createContext<Kontext | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [z, setZ] = useState<Zustand>(leererZustand);
  const [geladen, setGeladen] = useState(false);
  const zRef = useRef(z);
  zRef.current = z;

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(SCHLUESSEL), AsyncStorage.getItem(ALT_SCHLUESSEL)])
      .then(([roh, alt]) => {
        if (roh) setZ({ ...leererZustand, ...JSON.parse(roh) });
        else if (alt) {
          const a = JSON.parse(alt);
          setZ({ ...leererZustand, eintraege: a.eintraege ?? [], geparkt: a.geparkt ?? [], geparktGesamt: a.geparktGesamt ?? 0, kontaktpause: a.kontaktpause ?? leererZustand.kontaktpause, appSperre: !!a.appSperre });
        }
      })
      .catch(() => {})
      .finally(() => setGeladen(true));
  }, []);

  useEffect(() => {
    if (!geladen) return;
    AsyncStorage.setItem(SCHLUESSEL, JSON.stringify(z)).catch(() => {});
  }, [z, geladen]);

  const setze = useCallback((teil: Partial<Zustand>) => setZ((alt) => ({ ...alt, ...teil })), []);

  const vibriere = useCallback((stil: Vibration = 'leicht') => {
    if (Platform.OS === 'web') return;
    if (stil === 'tick') Haptics.selectionAsync().catch(() => {});
    else if (stil === 'erfolg') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    else Haptics.impactAsync(stil === 'mittel' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const eintragSpeichern = useCallback((e: Omit<Eintrag, 'id' | 'zeit'>) => {
    const neu: Eintrag = { ...e, id: neueId(), zeit: Date.now() };
    // Festhalten zählt auch als Tag bei dir
    setZ((alt) => ({ ...alt, eintraege: [neu, ...alt.eintraege], tageBeiDir: mitHeute(alt.tageBeiDir) }));
    return neu;
  }, []);

  const eintragLoeschen = useCallback((id: string) => setZ((alt) => ({ ...alt, eintraege: alt.eintraege.filter((e) => e.id !== id) })), []);

  const parken = useCallback((text: string) => {
    const jetzt = Date.now();
    const neu: Geparkt = { id: neueId(), text, zeit: jetzt, bis: jetzt + PARK_DAUER_MS, status: 'wartet' };
    setZ((alt) => ({ ...alt, geparkt: [neu, ...alt.geparkt], geparktGesamt: alt.geparktGesamt + 1 }));
    return neu;
  }, []);

  const entscheiden = useCallback(
    (id: string, wahl: 'loeschen' | 'behalten') =>
      setZ((alt) => ({
        ...alt,
        geparkt: wahl === 'loeschen' ? alt.geparkt.filter((g) => g.id !== id) : alt.geparkt.map((g) => (g.id === id ? { ...g, status: 'behalten' } : g)),
      })),
    [],
  );

  const kontaktpauseStarten = useCallback(() => setZ((alt) => ({ ...alt, kontaktpause: { ...alt.kontaktpause, start: Date.now() } })), []);

  // Sanfter Neustart: die längste Pause bleibt erhalten, nichts geht verloren
  const kontaktGehabt = useCallback(
    () =>
      setZ((alt) => {
        const bisher = alt.kontaktpause.start ? kalenderTage(alt.kontaktpause.start) : 0;
        return { ...alt, kontaktpause: { start: Date.now(), laengste: Math.max(alt.kontaktpause.laengste, bisher) } };
      }),
    [],
  );

  const heuteBeiMir = useCallback(() => setZ((alt) => ({ ...alt, tageBeiDir: mitHeute(alt.tageBeiDir) })), []);
  const sosGeschafftZaehlen = useCallback(() => setZ((alt) => ({ ...alt, sosGeschafft: alt.sosGeschafft + 1, tageBeiDir: mitHeute(alt.tageBeiDir) })), []);

  const allesLoeschen = useCallback(async () => {
    await AsyncStorage.removeItem(SCHLUESSEL).catch(() => {});
    await AsyncStorage.removeItem(ALT_SCHLUESSEL).catch(() => {});
    setZ(leererZustand);
  }, []);

  return (
    <Ctx.Provider value={{ z, geladen, setze, vibriere, eintragSpeichern, eintragLoeschen, parken, entscheiden, kontaktpauseStarten, kontaktGehabt, heuteBeiMir, sosGeschafftZaehlen, allesLoeschen }}>
      {children}
    </Ctx.Provider>
  );
}

export const tagSchluessel = (zeit = Date.now()) => {
  const d = new Date(zeit);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const mitHeute = (tage: string[]) => (tage.includes(tagSchluessel()) ? tage : [...tage, tagSchluessel()]);

// Die große Zahl auf "Heute": nach der Trennung Tage Kontaktpause, sonst Tage bei dir
export function berechne(z: Zustand) {
  const kontakt = zaehltKontaktpause(z.phase);
  const pauseTage = z.kontaktpause.start ? kalenderTage(z.kontaktpause.start) : 0;
  const zahl = kontakt ? pauseTage : z.tageBeiDir.length;
  return {
    kontakt,
    zahl,
    einheit: kontakt ? (zahl === 1 ? 'Tag Kontaktpause' : 'Tage Kontaktpause') : zahl === 1 ? 'Tag bei dir' : 'Tage bei dir',
    heuteGezaehlt: kontakt ? !!z.kontaktpause.start : z.tageBeiDir.includes(tagSchluessel()),
    laengste: Math.max(z.kontaktpause.laengste, pauseTage),
  };
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp nur innerhalb von StoreProvider');
  return c;
}
