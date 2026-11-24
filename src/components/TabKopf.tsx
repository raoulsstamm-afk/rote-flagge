import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useApp } from '@/state/store';
import { farben } from '@/theme';
import { Zahnrad } from './Symbole';
import { Txt } from './Txt';

// Kopf jedes Tabs: welcher der 3 Schritte hier passiert (wie im Plan), optional ein Titel, rechts das Zahnrad
export function TabKopf({ schritt, was, titel }: { schritt: 1 | 2 | 3; was: string; titel?: string }) {
  const { vibriere } = useApp();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Txt groesse={12} gewicht="extra" farbe={farben.akzent} style={{ letterSpacing: 1 }}>
          {`SCHRITT ${schritt} · ${was.toUpperCase()}`}
        </Txt>
        {titel ? (
          <Txt groesse={30} gewicht="serifFett">
            {titel}
          </Txt>
        ) : null}
      </View>
      <Pressable
        onPress={() => {
          vibriere('leicht');
          router.push('/einstellungen');
        }}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Einstellungen"
        style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand }}
      >
        <Zahnrad groesse={22} farbe={farben.textLeise} />
      </Pressable>
    </View>
  );
}
