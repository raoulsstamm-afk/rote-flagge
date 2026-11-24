// Bewertungs-Karte im Onboarding (Raoul 24.11.2026: "jedes Onboarding sollte das schnelle Review ermöglichen,
// so wie bei Gedankenpflanzen"). Einmal direkt nach dem Ergebnis: Maskottchen, fünf Sterne, eine Zeile,
// "Ja, bewerten" öffnet Apples eigenes Bewertungsfenster (expo-store-review), "Vielleicht später" geht einfach weiter.
// Vorlage: claude-wissen wissen/app-fabrik/vorlagen/bewertung/ (README dort). Nur THEMA und BILD pro App anpassen.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';

// ---- pro App anpassen ----
const THEMA = {
  app: 'Rote Flagge',
  titelSchrift: 'Fraunces_700Bold',
  textSchrift: 'Nunito_600SemiBold',
  karte: '#17101E',
  text: '#FFFFFF',
  akzent: '#FF7A63',
  aufAkzent: '#1A0B0B',
};
const BILD = require('../../assets/figur/jubeln.png');
// ---- Ende ----

const STERN = '#F5B301';

// Apples Bewertungsfenster. expo-store-review steckt erst ab dem nächsten Build im Handy: vorher (und im Browser)
// passiert beim Tippen einfach nichts, das Onboarding geht trotzdem weiter. Apple zeigt das Fenster höchstens
// dreimal im Jahr und in Test-Apps (TestFlight, Ad-hoc) oft gar nicht.
export async function bewertungAnfragen() {
  if (Platform.OS === 'web' || !requireOptionalNativeModule('ExpoStoreReview')) return;
  try {
    const StoreReview = require('expo-store-review') as typeof import('expo-store-review');
    if (await StoreReview.isAvailableAsync()) await StoreReview.requestReview();
  } catch {}
}

function vibriere(art: 'tick' | 'mittel') {
  if (Platform.OS === 'web') return;
  (art === 'tick' ? Haptics.selectionAsync() : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)).catch(() => {});
}

// Pro App-Start nur einmal fragen (wer zurück und wieder vor geht, sieht die Karte nicht nochmal)
let schonGefragt = false;

/**
 * Im Onboarding: const bewertung = useBewertung(weiter);
 * Den Ergebnis-Schritt mit bewertung.weiter statt weiter weitergehen lassen und {bewertung.karte} mit rendern.
 */
export function useBewertung(weiter: () => void) {
  const [offen, setOffen] = useState(false);
  const weiterMitBewertung = () => {
    if (schonGefragt) return weiter();
    schonGefragt = true;
    setOffen(true);
  };
  const karte = (
    <BewertungsKarte
      offen={offen}
      onFertig={() => {
        setOffen(false);
        weiter();
      }}
    />
  );
  return { weiter: weiterMitBewertung, karte };
}

function Stern({ i, offen }: { i: number; offen: boolean }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!offen) return s.setValue(0);
    const t = setTimeout(() => {
      vibriere('tick');
      Animated.spring(s, { toValue: 1, friction: 4, tension: 160, useNativeDriver: true }).start();
    }, 350 + i * 110);
    return () => clearTimeout(t);
  }, [offen, i, s]);
  const dreh = s.interpolate({ inputRange: [0, 1], outputRange: ['-40deg', '0deg'] });
  return (
    <Animated.View style={{ transform: [{ scale: s }, { rotate: dreh }], marginHorizontal: 3 }}>
      <Svg width={34} height={34} viewBox="0 0 24 24">
        <Path
          d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"
          fill={STERN}
          stroke={STERN}
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}

export function BewertungsKarte({ offen, onFertig }: { offen: boolean; onFertig: () => void }) {
  const ein = useRef(new Animated.Value(0)).current;
  const schweben = useRef(new Animated.Value(0)).current;
  const [laeuft, setLaeuft] = useState(false);

  useEffect(() => {
    if (!offen) return;
    ein.setValue(0);
    Animated.spring(ein, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(schweben, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(schweben, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [offen, ein, schweben]);

  const ja = async () => {
    if (laeuft) return;
    setLaeuft(true);
    vibriere('mittel');
    await bewertungAnfragen();
    setLaeuft(false);
    onFertig();
  };
  const spaeter = () => {
    vibriere('tick');
    onFertig();
  };

  const hoch = ein.interpolate({ inputRange: [0, 1], outputRange: [420, 0] });
  const wippen = schweben.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Modal visible={offen} transparent animationType="none" statusBarTranslucent onRequestClose={spaeter}>
      <Animated.View style={[st.grund, { opacity: ein }]}>
        <Animated.View style={[st.karte, { backgroundColor: THEMA.karte, transform: [{ translateY: hoch }] }]}>
          <Animated.View style={{ transform: [{ translateY: wippen }] }}>
            <Image source={BILD} style={st.bild} resizeMode="contain" />
          </Animated.View>
          <View style={st.sterne}>
            {[0, 1, 2, 3, 4].map((i) => (
              <Stern key={i} i={i} offen={offen} />
            ))}
          </View>
          <Text style={[st.titel, { color: THEMA.text, fontFamily: THEMA.titelSchrift }]}>
            Gefällt dir {THEMA.app} bisher?
          </Text>
          <Text style={[st.zeile, { color: THEMA.text, fontFamily: THEMA.textSchrift }]}>
            Eine kurze Bewertung hilft anderen, uns zu finden.
          </Text>
          <Pressable
            onPress={ja}
            style={({ pressed }) => [st.knopf, { backgroundColor: THEMA.akzent, transform: [{ scale: pressed ? 0.96 : 1 }] }]}
          >
            <Text style={[st.knopfText, { color: THEMA.aufAkzent, fontFamily: THEMA.titelSchrift }]}>Ja, bewerten</Text>
          </Pressable>
          <Pressable onPress={spaeter} hitSlop={12} style={st.spaeter}>
            <Text style={[st.spaeterText, { color: THEMA.text, fontFamily: THEMA.textSchrift }]}>Vielleicht später</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const st = StyleSheet.create({
  grund: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', padding: 16, paddingBottom: 34 },
  karte: { borderRadius: 30, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 16, alignItems: 'center', maxWidth: 440, width: '100%', alignSelf: 'center' },
  bild: { width: 120, height: 120 },
  sterne: { flexDirection: 'row', marginTop: 6, marginBottom: 12 },
  titel: { fontSize: 24, lineHeight: 34, textAlign: 'center' },
  zeile: { fontSize: 15, lineHeight: 22, textAlign: 'center', opacity: 0.75, marginTop: 6 },
  knopf: { marginTop: 20, alignSelf: 'stretch', height: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  knopfText: { fontSize: 18 },
  spaeter: { marginTop: 12, paddingVertical: 6 },
  spaeterText: { fontSize: 15, opacity: 0.7 },
});
