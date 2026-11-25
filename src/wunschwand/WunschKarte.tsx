// Wunsch-Wand als ruhige Karte auf einem passenden Bildschirm (Raoul 25.11.2026: nie als eigener Tab,
// sondern als Karte, wo es passt, z. B. bei Fortschritt oder Statistik). Gleiche Datei in allen Apps.
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { APP_NAME, haptik, useLook, WText } from './look';

export function WunschKarte({ stil }: { stil?: object }) {
  const LOOK = useLook();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Wunsch-Wand öffnen"
      onPress={() => {
        haptik('leicht');
        router.push('/wunschwand');
      }}
      style={({ pressed }) => [
        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 20, borderWidth: 1, padding: 14, backgroundColor: LOOK.karte, borderColor: LOOK.rand, transform: [{ scale: pressed ? 0.98 : 1 }] },
        stil,
      ]}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: LOOK.akzent, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={20} height={20} viewBox="0 0 24 24">
          <Path d="M5 15.5 L12 8.5 L19 15.5" stroke={LOOK.aufAkzent} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </Svg>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <WText rolle="fett">Wunsch-Wand</WText>
        <WText rolle="klein">Was soll {APP_NAME} noch können? Wünsch dir was oder stimm ab.</WText>
      </View>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path d="M9 5 L16 12 L9 19" stroke={LOOK.leise} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
    </Pressable>
  );
}
