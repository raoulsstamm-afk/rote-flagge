// Wunsch-Wand: spricht mit der gemeinsamen Supabase-Funktion "wunschwand" (Kopfkiste-Projekt, EU).
// Kein Konto: das Handy bekommt eine zufällige Kennung, die der Server nur gehasht speichert.
// Neue Wünsche sieht erst nur der eigene Absender, bis sie freigegeben sind.
// Gleiche Datei in allen Apps (Vorlage: claude-wissen wissen/app-fabrik/vorlagen/wunschwand/), nur look.tsx ist je App anders.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { APP } from './look';

const URL = 'https://rozigbnbifcbsiybarzm.supabase.co/functions/v1/wunschwand';
// Öffentlicher Schlüssel (darf in der App stehen)
const KEY = 'sb_publishable_lhrWMHe-Ng1wp-j0muDq0w_U_LtnpXm';
const SPEICHER = 'wunschwand-geraet';

export type Wunsch = { id: string; text: string; status: 'neu' | 'frei' | 'erledigt'; stimmen: number; gestimmt: boolean; eigener: boolean };
export type Fehler = 'netz' | 'limit' | 'laenge';

let kennung: string | null = null;
async function geraet() {
  if (kennung) return kennung;
  try {
    kennung = await AsyncStorage.getItem(SPEICHER);
  } catch {}
  if (!kennung) {
    let s = '';
    for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16);
    kennung = `${Date.now().toString(16)}-${s}`;
    AsyncStorage.setItem(SPEICHER, kennung).catch(() => {});
  }
  return kennung;
}

// Für Browser-Fotos ohne Server: ?wunschprobe=1 zeigt Beispielwünsche
const probe = () => Platform.OS === 'web' && typeof location !== 'undefined' && location.search.includes('wunschprobe');
let probeListe: Wunsch[] = [
  { id: 'p1', text: 'Ein Widget für den Sperrbildschirm', status: 'frei', stimmen: 42, gestimmt: true, eigener: false },
  { id: 'p2', text: 'Dunkler Modus für abends', status: 'frei', stimmen: 27, gestimmt: false, eigener: false },
  { id: 'p3', text: 'Erinnerung zu zwei Uhrzeiten am Tag', status: 'frei', stimmen: 11, gestimmt: false, eigener: false },
  { id: 'p4', text: 'Mehr Töne zum Auswählen', status: 'erledigt', stimmen: 19, gestimmt: false, eigener: false },
  { id: 'p5', text: 'Eine Wochenübersicht zum Teilen', status: 'neu', stimmen: 0, gestimmt: false, eigener: true },
];

async function frage<T>(body: object): Promise<T> {
  const steuerung = new AbortController();
  const t = setTimeout(() => steuerung.abort(), 15000);
  try {
    const r = await fetch(URL, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ app: APP, geraet: await geraet(), ...body }),
      signal: steuerung.signal,
    });
    if (r.status === 429) throw 'limit' as Fehler;
    if (r.status === 400) throw 'laenge' as Fehler;
    if (!r.ok) throw 'netz' as Fehler;
    return (await r.json()) as T;
  } catch (e) {
    throw (e === 'limit' || e === 'laenge' ? e : 'netz') as Fehler;
  } finally {
    clearTimeout(t);
  }
}

export async function wuenscheLaden(): Promise<Wunsch[]> {
  if (probe()) return probeListe;
  const j = await frage<{ wuensche: Wunsch[] }>({ aktion: 'liste' });
  return j.wuensche;
}

export async function wunschSchicken(text: string): Promise<Wunsch> {
  if (probe()) {
    const w: Wunsch = { id: `p${Date.now()}`, text, status: 'neu', stimmen: 0, gestimmt: false, eigener: true };
    probeListe = [...probeListe, w];
    return w;
  }
  const j = await frage<{ wunsch: Wunsch }>({ aktion: 'neu', text });
  return j.wunsch;
}

export async function abstimmen(id: string): Promise<{ stimmen: number; gestimmt: boolean }> {
  if (probe()) {
    const w = probeListe.find((x) => x.id === id)!;
    return { stimmen: w.stimmen + (w.gestimmt ? -1 : 1), gestimmt: !w.gestimmt };
  }
  return frage({ aktion: 'stimme', id });
}
