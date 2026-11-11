import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hilfeNummern } from '@/data/hilfe';
import { useApp } from '@/state/store';
import { farben, schatten, verlaeufe } from '@/theme';
import { Telefon } from './Symbole';
import { Txt } from './Txt';

const nativ = Platform.OS !== 'web';
type Verlauf = readonly [string, string, ...string[]];

// Ganzer Bildschirm mit weichem Verlauf im Hintergrund. unten: Platz für die schwebende Leiste.
export function Bildschirm({ children, verlauf = verlaeufe.start, scroll, unten = 0, stil }: { children: ReactNode; verlauf?: Verlauf; scroll?: boolean; unten?: number; stil?: ViewStyle }) {
  return (
    <LinearGradient colors={verlauf} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
        {scroll ? (
          <ScrollView contentContainerStyle={[{ padding: 20, paddingBottom: 30 + unten, gap: 14 }, stil]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1, padding: 20, paddingBottom: 12 + unten, gap: 14 }, stil]}>{children}</View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

// Federnder Druck-Effekt plus Haptik für alles Antippbare
export function useFeder() {
  const { vibriere } = useApp();
  const wert = useRef(new Animated.Value(1)).current;
  return {
    stil: { transform: [{ scale: wert }] },
    rein: () => Animated.spring(wert, { toValue: 0.95, useNativeDriver: nativ, speed: 40, bounciness: 0 }).start(),
    raus: () => Animated.spring(wert, { toValue: 1, useNativeDriver: nativ, speed: 14, bounciness: 12 }).start(),
    vibriere,
  };
}

// Haupt-Knopf: Pille mit Verlauf von Rot zu Korall. glas = weißer, leiser Knopf. leise = nur Text.
export function Knopf({ text, onPress, art = 'voll', aus, stil, klein }: { text: string; onPress: () => void; art?: 'voll' | 'glas' | 'leise'; aus?: boolean; stil?: ViewStyle; klein?: boolean }) {
  const feder = useFeder();
  const innen = (
    <Txt gewicht={art === 'leise' ? 'fett' : 'extra'} groesse={klein || art === 'leise' ? 15 : 18} farbe={art === 'voll' ? farben.weiss : art === 'leise' ? farben.textLeise : farben.text} mitte>
      {text}
    </Txt>
  );
  return (
    <Animated.View style={[feder.stil, aus && { opacity: 0.45 }, stil]}>
      <Pressable
        disabled={aus}
        onPressIn={feder.rein}
        onPressOut={feder.raus}
        onPress={() => {
          feder.vibriere(art === 'voll' ? 'mittel' : 'leicht');
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={text}
      >
        {art === 'voll' ? (
          <LinearGradient colors={verlaeufe.knopf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.knopf, klein && s.knopfKlein, { boxShadow: schatten.knopf }]}>
            {innen}
          </LinearGradient>
        ) : (
          <View style={[s.knopf, klein && s.knopfKlein, art === 'glas' ? { backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: schatten.leise } : { paddingVertical: 10 }]}>{innen}</View>
        )}
      </Pressable>
    </Animated.View>
  );
}

// Weiße Karte mit weichem Schatten
export function Karte({ children, stil, verlauf }: { children: ReactNode; stil?: ViewStyle; verlauf?: Verlauf }) {
  return (
    <LinearGradient colors={verlauf ?? farben.karteVerlauf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.karte, { boxShadow: verlauf ? undefined : schatten.karte }, stil]}>
      {children}
    </LinearGradient>
  );
}

// Auswahl-Chip (Kategorien, Gefühle, Uhrzeiten)
export function Chip({ text, an, onPress }: { text: string; an?: boolean; onPress: () => void }) {
  const feder = useFeder();
  return (
    <Animated.View style={feder.stil}>
      <Pressable
        onPressIn={feder.rein}
        onPressOut={feder.raus}
        onPress={() => {
          feder.vibriere('mittel');
          onPress();
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!an }}
        style={[s.chip, an && { backgroundColor: farben.akzent, borderColor: farben.akzent }]}
      >
        <Txt groesse={15} gewicht="fett" farbe={an ? farben.weiss : farben.text}>
          {text}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

// Kleine Überschrift in Großbuchstaben
export function Marke({ text, farbe = farben.akzent }: { text: string; farbe?: string }) {
  return (
    <Txt groesse={13} gewicht="extra" farbe={farbe} style={{ letterSpacing: 1 }}>
      {text.toUpperCase()}
    </Txt>
  );
}

// Inhalte erscheinen nacheinander (leicht von unten, weich eingeblendet)
export function Einblenden({ children, verz = 0, stil }: { children: ReactNode; verz?: number; stil?: ViewStyle }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 420, delay: verz, easing: Easing.out(Easing.cubic), useNativeDriver: nativ }).start();
  }, [a, verz]);
  return <Animated.View style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, stil]}>{children}</Animated.View>;
}

// Fortschritt im Quiz
export function Leiste({ wert }: { wert: number }) {
  const a = useRef(new Animated.Value(wert)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: wert, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [wert, a]);
  return (
    <View style={{ height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' }}>
      <Animated.View style={{ height: 8, width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}>
        <LinearGradient colors={[farben.korall, farben.akzent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 4 }} />
      </Animated.View>
    </View>
  );
}

// Balken, der sich beim Erscheinen füllt
export function Balken({ wert, verz = 0 }: { wert: number; verz?: number }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: Math.max(0.04, Math.min(1, wert)), duration: 700, delay: verz, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [wert, a, verz]);
  return (
    <View style={{ height: 12, borderRadius: 6, backgroundColor: 'rgba(184,70,60,0.10)', overflow: 'hidden' }}>
      <Animated.View style={{ height: 12, width: a.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }}>
        <LinearGradient colors={verlaeufe.knopf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 6 }} />
      </Animated.View>
    </View>
  );
}

// Rückfrage als eigenes Fenster (Alert funktioniert im Browser nicht, und so sieht es nach der App aus)
export function Rueckfrage({ sichtbar, titel, text, ja, nein = 'Abbrechen', onJa, onNein }: { sichtbar: boolean; titel: string; text?: string; ja: string; nein?: string; onJa: () => void; onNein: () => void }) {
  return (
    <Modal visible={sichtbar} transparent animationType="fade" onRequestClose={onNein}>
      <View style={s.schleier}>
        <Karte stil={{ gap: 12, width: '100%', maxWidth: 360 }}>
          <Txt groesse={22} gewicht="serif">
            {titel}
          </Txt>
          {text ? (
            <Txt groesse={15} farbe={farben.textLeise}>
              {text}
            </Txt>
          ) : null}
          <Knopf text={ja} onPress={onJa} klein />
          <Knopf text={nein} art="leise" onPress={onNein} />
        </Karte>
      </View>
    </Modal>
  );
}

// Hilfe-Nummern. kurz: nur das Hilfetelefon und der Notruf
export function HilfeKarte({ kurz, titel = 'Wirst du bedroht oder angefasst?' }: { kurz?: boolean; titel?: string }) {
  const liste = kurz ? hilfeNummern.filter((h) => h.nummer === '116 016' || h.nummer === '110') : hilfeNummern;
  return (
    <View style={s.hilfe}>
      <Txt groesse={15} gewicht="extra">
        {titel}
      </Txt>
      <Txt groesse={14} farbe={farben.textLeise}>
        Du musst da nicht allein durch. Hier hört dir jemand zu.
      </Txt>
      {liste.map((h) => (
        <Pressable key={h.nummer} onPress={() => Linking.openURL(`tel:${h.nummer.replace(/\s/g, '')}`).catch(() => {})} style={s.hilfeZeile} accessibilityRole="link">
          <Telefon />
          <View style={{ flex: 1 }}>
            <Txt groesse={14} gewicht="extra">
              {h.nummer} <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>{h.name}</Txt>
            </Txt>
            <Txt groesse={12} farbe={farben.textLeise}>
              {h.info}
            </Txt>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// Datenschutz-Satz, der in der App immer wieder sichtbar ist
export function NurAufDemHandy({ text = 'Alles bleibt nur auf deinem Handy.' }: { text?: string }) {
  return (
    <Txt groesse={13} farbe={farben.textLeise} mitte>
      {text}
    </Txt>
  );
}

const s = StyleSheet.create({
  knopf: { borderRadius: 999, paddingVertical: 17, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  knopfKlein: { paddingVertical: 13 },
  karte: { borderRadius: 22, padding: 20 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  schleier: { flex: 1, backgroundColor: 'rgba(74,61,53,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hilfe: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.85)' },
  hilfeZeile: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
});
