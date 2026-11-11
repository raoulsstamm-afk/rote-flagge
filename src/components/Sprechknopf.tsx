import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useApp } from '@/state/store';
import { farben, schatten, verlaeufe } from '@/theme';

const nativ = Platform.OS !== 'web';

// Runder Sprechknopf (nach Kopfkiste src/components/Sprechknopf.tsx): antippen, erzählen, nochmal antippen.
// Im Ruhezustand atmet ein weicher Ring, beim Zuhören laufen Wellen nach außen.
export function Sprechknopf({ hoert, onStart, onEnde, groesse = 92 }: { hoert: boolean; onStart: () => void; onEnde: () => void; groesse?: number }) {
  const { vibriere } = useApp();
  const atem = useRef(new Animated.Value(0)).current;
  const welle1 = useRef(new Animated.Value(0)).current;
  const welle2 = useRef(new Animated.Value(0)).current;
  const druck = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (hoert) {
      atem.setValue(0);
      return;
    }
    const s = Animated.loop(
      Animated.sequence([
        Animated.timing(atem, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(atem, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    s.start();
    return () => s.stop();
  }, [atem, hoert]);

  useEffect(() => {
    if (!hoert) {
      welle1.setValue(0);
      welle2.setValue(0);
      return;
    }
    const welle = (w: Animated.Value, verz: number) =>
      Animated.loop(Animated.sequence([Animated.delay(verz), Animated.timing(w, { toValue: 1, duration: 1100, easing: Easing.out(Easing.quad), useNativeDriver: nativ }), Animated.timing(w, { toValue: 0, duration: 0, useNativeDriver: nativ })]));
    const a = welle(welle1, 0);
    const b = welle(welle2, 550);
    a.start();
    b.start();
    return () => {
      a.stop();
      b.stop();
    };
  }, [hoert, welle1, welle2]);

  const ring = (w: Animated.Value) => (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: groesse,
        height: groesse,
        borderRadius: groesse / 2,
        borderWidth: 3,
        borderColor: farben.akzentHell,
        opacity: w.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
        transform: [{ scale: w.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
      }}
    />
  );

  return (
    <View style={{ width: groesse * 1.7, height: groesse * 1.7, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width: groesse,
          height: groesse,
          borderRadius: groesse / 2,
          backgroundColor: 'rgba(224,112,90,0.18)',
          transform: [{ scale: atem.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1.32] }) }],
        }}
      />
      {ring(welle1)}
      {ring(welle2)}
      <Pressable
        onPressIn={() => Animated.spring(druck, { toValue: 0.9, useNativeDriver: nativ, speed: 40, bounciness: 0 }).start()}
        onPressOut={() => Animated.spring(druck, { toValue: 1, useNativeDriver: nativ, speed: 14, bounciness: 12 }).start()}
        onPress={() => {
          vibriere(hoert ? 'leicht' : 'mittel');
          if (hoert) onEnde();
          else onStart();
        }}
        accessibilityRole="button"
        accessibilityLabel={hoert ? 'Fertig erzählt' : 'Antippen und erzählen'}
      >
        <Animated.View style={{ transform: [{ scale: druck }] }}>
          <LinearGradient
            colors={hoert ? [farben.akzentDunkel, farben.akzent] : verlaeufe.grossKnopf}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: groesse, height: groesse, borderRadius: groesse / 2, alignItems: 'center', justifyContent: 'center', boxShadow: schatten.knopf }}
          >
            <Svg width={groesse * 0.42} height={groesse * 0.42} viewBox="0 0 24 24">
              {hoert ? (
                <Rect x="5" y="5" width="14" height="14" rx="3.5" fill={farben.weiss} />
              ) : (
                <>
                  <Rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill={farben.weiss} />
                  <Path d="M5 11.5a7 7 0 0 0 14 0M12 18.5v3" stroke={farben.weiss} strokeWidth={2.2} strokeLinecap="round" fill="none" />
                </>
              )}
            </Svg>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );
}
