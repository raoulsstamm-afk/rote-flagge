import { router, Tabs, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Buch, Haus, Kurve } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { useApp } from '@/state/store';
import { farben } from '@/theme';

// Schwebende Leiste unten (Raoul 24.11.2026: 3 übersichtliche Tabs, jeder mit einer klaren Funktion, passend zu den
// 3 Schritten im Plan): Tagebuch (Anzeichen festhalten), Heute (auflösen: Zahl und SOS), Muster (erkennen).
// Einstellungen über das Zahnrad oben (`ZahnradKnopf`).

const REITER = {
  tagebuch: { titel: 'Tagebuch', Symbol: Buch },
  heute: { titel: 'Heute', Symbol: Haus },
  muster: { titel: 'Muster', Symbol: Kurve },
} as const;
type Name = keyof typeof REITER;

function Reiter({ name, aktiv, onPress }: { name: Name; aktiv: boolean; onPress: () => void }) {
  const { titel, Symbol } = REITER[name];
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, marginVertical: 5, borderRadius: 26, backgroundColor: aktiv ? 'rgba(255,122,99,0.14)' : 'transparent' }} accessibilityRole="tab" accessibilityState={{ selected: aktiv }} accessibilityLabel={titel}>
      <Symbol groesse={24} farbe={aktiv ? farben.akzent : farben.textHell} />
      <Txt groesse={11} gewicht={aktiv ? 'extra' : 'fett'} farbe={aktiv ? farben.akzent : farben.textHell}>
        {titel}
      </Txt>
    </Pressable>
  );
}

function Leiste() {
  const { vibriere } = useApp();
  const pfad = usePathname();
  const unten = Math.max(useSafeAreaInsets().bottom, 12);
  const geh = (name: string) => {
    vibriere('leicht');
    if (pfad !== `/${name}`) router.navigate(`/${name}` as never);
  };
  return (
    <View style={{ position: 'absolute', left: 14, right: 14, bottom: unten, zIndex: 100, elevation: 12 }} pointerEvents="box-none">
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#120D17', borderRadius: 34, borderWidth: 1, borderColor: farben.karteRand, paddingHorizontal: 4, boxShadow: '0px 10px 28px rgba(0,0,0,0.5)' }}>
        <Reiter name="tagebuch" aktiv={pfad === '/tagebuch'} onPress={() => geh('tagebuch')} />
        <Reiter name="heute" aktiv={pfad === '/heute'} onPress={() => geh('heute')} />
        <Reiter name="muster" aktiv={pfad === '/muster'} onPress={() => geh('muster')} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtOben }}>
      <Tabs tabBar={() => null} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farben.nachtOben } }}>
        <Tabs.Screen name="tagebuch" />
        <Tabs.Screen name="heute" />
        <Tabs.Screen name="muster" />
      </Tabs>
      <Leiste />
    </View>
  );
}
