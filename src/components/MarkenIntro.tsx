// Aurorealis-Intro beim Kaltstart (Raoul 22.11.2026): schwarzer Bildschirm, das Nordlicht-Zeichen
// blendet weich ein, leuchtet kurz und dann blendet alles in die App über. Gesamt etwa 1,1 Sekunden.
// Das native Startbild ist nur schwarz (app.json, expo-splash-screen ohne Bild), damit es nahtlos wirkt.
// Vorlage: claude-wissen wissen/marke/aurorealis/ (README). Ins Root-Layout als letztes Kind legen.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

let schonGezeigt = false; // nur einmal pro Kaltstart, nicht nach jedem Neu-Rendern

export function MarkenIntro({ bild, groesse = 110 }: { bild: number; groesse?: number }) {
  const [an, setAn] = useState(!schonGezeigt);
  const zeichen = useRef(new Animated.Value(0)).current;
  const ganz = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!an) return;
    schonGezeigt = true;
    Animated.sequence([
      Animated.timing(zeichen, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(260),
      Animated.timing(ganz, { toValue: 0, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => setAn(false));
  }, [an, zeichen, ganz]);

  if (!an) return null;
  const skala = zeichen.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const schein = zeichen.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.5, 0.35] });
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', opacity: ganz }]}>
      {/* weicher Lichtschein hinter dem Zeichen */}
      <Animated.Image source={bild} blurRadius={18} style={{ position: 'absolute', width: groesse * 1.6, height: groesse * 1.6, opacity: schein }} resizeMode="contain" />
      <Animated.Image source={bild} style={{ width: groesse, height: groesse, opacity: zeichen, transform: [{ scale: skala }] }} resizeMode="contain" />
    </Animated.View>
  );
}
