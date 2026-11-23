import { LinearGradient } from 'expo-linear-gradient';
import { router, Tabs, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Buch, Haus, Kurve, Person } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { useApp } from '@/state/store';
import { farben, schatten, verlaeufe } from '@/theme';

// Schwebende Leiste unten wie bei Drangduell: Heute, Tagebuch, SOS (großer Knopf in der Mitte), Muster, Profil.
const nativ = Platform.OS !== 'web';

const REITER = {
  heute: { titel: 'Heute', Symbol: Haus },
  tagebuch: { titel: 'Tagebuch', Symbol: Buch },
  muster: { titel: 'Muster', Symbol: Kurve },
  profil: { titel: 'Profil', Symbol: Person },
} as const;
type Name = keyof typeof REITER;

function Reiter({ name, aktiv, onPress }: { name: Name; aktiv: boolean; onPress: () => void }) {
  const { titel, Symbol } = REITER[name];
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8 }} accessibilityRole="tab" accessibilityState={{ selected: aktiv }} accessibilityLabel={titel}>
      <Symbol groesse={24} farbe={aktiv ? farben.akzent : farben.textHell} />
      <Txt groesse={11} gewicht={aktiv ? 'extra' : 'fett'} farbe={aktiv ? farben.akzent : farben.textHell}>
        {titel}
      </Txt>
    </Pressable>
  );
}

// Der SOS-Knopf atmet leicht und leuchtet
function SosKnopf({ onPress }: { onPress: () => void }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(a, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [a]);
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="button" accessibilityLabel="SOS: Ich will schreiben" style={{ width: 74, alignItems: 'center' }}>
      <Animated.View style={{ transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }], marginTop: -26 }}>
        <LinearGradient colors={verlaeufe.knopf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', boxShadow: schatten.knopf, borderWidth: 3, borderColor: farben.nachtOben }}>
          <Txt groesse={15} gewicht="extra" farbe={farben.dunkel}>
            SOS
          </Txt>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

function Leiste() {
  const { vibriere } = useApp();
  const pfad = usePathname();
  const unten = Math.max(useSafeAreaInsets().bottom, 12);
  const geh = (name: string) => {
    vibriere('leicht');
    if (name === 'profil') router.push('/einstellungen');
    else if (pfad !== `/${name}`) router.navigate(`/${name}` as never);
  };
  return (
    <View style={{ position: 'absolute', left: 14, right: 14, bottom: unten, zIndex: 100, elevation: 12 }} pointerEvents="box-none">
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#120D17', borderRadius: 34, borderWidth: 1, borderColor: farben.karteRand, paddingHorizontal: 4, boxShadow: '0px 10px 28px rgba(0,0,0,0.5)' }}>
        <Reiter name="heute" aktiv={pfad === '/heute'} onPress={() => geh('heute')} />
        <Reiter name="tagebuch" aktiv={pfad === '/tagebuch'} onPress={() => geh('tagebuch')} />
        <SosKnopf
          onPress={() => {
            vibriere('mittel');
            router.push('/sos');
          }}
        />
        <Reiter name="muster" aktiv={pfad === '/muster'} onPress={() => geh('muster')} />
        <Reiter name="profil" aktiv={false} onPress={() => geh('profil')} />
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: farben.nachtOben }}>
      <Tabs tabBar={() => null} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: farben.nachtOben } }}>
        <Tabs.Screen name="heute" />
        <Tabs.Screen name="tagebuch" />
        <Tabs.Screen name="muster" />
      </Tabs>
      <Leiste />
    </View>
  );
}
