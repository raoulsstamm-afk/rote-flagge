import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Zurueck } from '@/components/Symbole';
import { Bildschirm } from '@/components/ui';
import { farben, verlaeufe } from '@/theme';
import { WunschWand } from '@/wunschwand/WunschWand';

export default function WunschWandSeite() {
  return (
    <Bildschirm verlauf={verlaeufe.tagebuch} scroll>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/einstellungen'))} hitSlop={12} style={s.zurueck} accessibilityRole="button" accessibilityLabel="Zurück">
        <Zurueck />
      </Pressable>
      <WunschWand />
      <View style={{ height: 40 }} />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  zurueck: { width: 40, height: 40, borderRadius: 20, backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
});
