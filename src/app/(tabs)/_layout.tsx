import { router, Tabs, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Buch, Saeulen, Sprechblase, Zahnrad } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { useApp } from '@/state/store';
import { farben } from '@/theme';

// Schwebende Leiste unten: Tagebuch, Muster, SOS, daneben das Zahnrad für die Einstellungen.
const nativ = Platform.OS !== 'web';

const REITER: Record<string, { titel: string; Symbol: typeof Buch }> = {
  tagebuch: { titel: 'Tagebuch', Symbol: Buch },
  muster: { titel: 'Muster', Symbol: Saeulen },
  sos: { titel: 'SOS', Symbol: Sprechblase },
};

function Reiter({ name, aktiv, onPress }: { name: string; aktiv: boolean; onPress: () => void }) {
  const anim = useRef(new Animated.Value(aktiv ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: aktiv ? 1 : 0, useNativeDriver: nativ, speed: 16, bounciness: 10 }).start();
  }, [aktiv, anim]);
  const { titel, Symbol } = REITER[name];
  return (
    <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6 }} accessibilityRole="tab" accessibilityState={{ selected: aktiv }} accessibilityLabel={titel}>
      <View style={{ width: 52, height: 34, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 52,
            height: 34,
            borderRadius: 17,
            backgroundColor: farben.akzentZart,
            opacity: anim,
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
          }}
        />
        <View style={{ zIndex: 1 }}>
          <Symbol groesse={24} farbe={aktiv ? farben.akzent : farben.textLeise} />
        </View>
      </View>
      <Txt groesse={12} gewicht={aktiv ? 'extra' : 'fett'} farbe={aktiv ? farben.akzent : farben.textLeise}>
        {titel}
      </Txt>
    </Pressable>
  );
}

const NAMEN = ['tagebuch', 'muster', 'sos'] as const;

// Die Leiste liegt bewusst außerhalb der Tabs und nach ihnen, damit sie im Web und auf dem iPhone sicher über dem Inhalt liegt
function Leiste() {
  const { vibriere } = useApp();
  const pfad = usePathname();
  const unten = Math.max(useSafeAreaInsets().bottom, 12);
  return (
    <View style={{ position: 'absolute', left: 16, right: 16, bottom: unten, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 100, elevation: 12 }} pointerEvents="box-none">
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 30, paddingHorizontal: 6, paddingVertical: 4, boxShadow: '0px 10px 28px rgba(74,61,53,0.14)' }}>
        {NAMEN.map((name) => (
          <Reiter
            key={name}
            name={name}
            aktiv={pfad === `/${name}`}
            onPress={() => {
              vibriere('leicht');
              if (pfad !== `/${name}`) router.navigate(`/${name}`);
            }}
          />
        ))}
      </View>
      <Pressable
        onPress={() => {
          vibriere('leicht');
          router.push('/einstellungen');
        }}
        style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 10px 28px rgba(74,61,53,0.14)' }}
        accessibilityRole="button"
        accessibilityLabel="Einstellungen"
      >
        <Zahnrad groesse={26} farbe={farben.textLeise} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs tabBar={() => null} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="tagebuch" />
        <Tabs.Screen name="muster" />
        <Tabs.Screen name="sos" />
      </Tabs>
      <Leiste />
    </View>
  );
}
