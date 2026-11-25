// Wunsch-Wand: was in dieser App anders ist (Name, Farben, Schrift, Knopf, Haptik).
import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Platform } from 'react-native';
import { Txt } from '@/components/Txt';
import { Knopf } from '@/components/ui';
import { farben, schrift } from '@/theme';

export const APP = 'rote-flagge';
export const APP_NAME = 'Rote Flagge';

export const LOOK = {
  karte: farben.karte,
  feld: farben.feld,
  rand: farben.karteRand,
  text: farben.text,
  leise: farben.textLeise,
  akzent: farben.akzent,
  aufAkzent: farben.dunkel,
  schrift: schrift.normal,
};
export const useLook = () => LOOK;

type Rolle = 'titel' | 'fett' | 'text' | 'leise' | 'klein';
export function WText({ rolle, farbe, children }: { rolle: Rolle; farbe?: string; children: ReactNode }) {
  if (rolle === 'titel') return <Txt groesse={28} gewicht="serifFett">{children}</Txt>;
  if (rolle === 'fett') return <Txt groesse={17} gewicht="serif" farbe={farbe}>{children}</Txt>;
  if (rolle === 'leise') return <Txt groesse={15} farbe={farben.textLeise}>{children}</Txt>;
  if (rolle === 'klein') return <Txt groesse={13} farbe={farben.textLeise}>{children}</Txt>;
  return <Txt groesse={16} farbe={farbe}>{children}</Txt>;
}

export function WKnopf({ text, onPress, aus, leise }: { text: string; onPress: () => void; aus?: boolean; leise?: boolean }) {
  return <Knopf text={text} onPress={onPress} aus={aus} art={leise ? 'glas' : 'voll'} />;
}

export function haptik(art: 'leicht' | 'mittel' | 'erfolg') {
  if (Platform.OS === 'web') return;
  const p =
    art === 'erfolg'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : Haptics.impactAsync(art === 'leicht' ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
  p.catch(() => {});
}
