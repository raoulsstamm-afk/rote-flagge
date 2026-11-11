import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { KategorieId } from '@/data/kategorien';
import { kalenderTage } from '@/data/muster';
import type { Antwort } from '@/data/quiz';

// Speicher der App. Alles bleibt nur auf dem Handy (AsyncStorage). Keine Konten, kein Server, keine Statistik.
// Tagebuch-Einträge sind hochsensibel (Beziehung, Gefühle) und verlassen das Gerät nie.

export type Eintrag = {
  id: string;
  zeit: number;
  text: string;
  gefuehle: string[];
  kategorien: KategorieId[];
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
  quiz: Record<string, Antwort>;
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
  erinnerung: null,
  appSperre: false,
  eintraege: [],
  geparkt: [],
  geparktGesamt: 0,
  kontaktpause: { start: null, laengste: 0 },
};

const SCHLUESSEL = 'rote-flagge-v1';
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
    AsyncStorage.getItem(SCHLUESSEL)
      .then((roh) => {
        if (roh) setZ({ ...leererZustand, ...JSON.parse(roh) });
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
    setZ((alt) => ({ ...alt, eintraege: [neu, ...alt.eintraege] }));
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

  const allesLoeschen = useCallback(async () => {
    await AsyncStorage.removeItem(SCHLUESSEL).catch(() => {});
    setZ(leererZustand);
  }, []);

  return (
    <Ctx.Provider value={{ z, geladen, setze, vibriere, eintragSpeichern, eintragLoeschen, parken, entscheiden, kontaktpauseStarten, kontaktGehabt, allesLoeschen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp nur innerhalb von StoreProvider');
  return c;
}
