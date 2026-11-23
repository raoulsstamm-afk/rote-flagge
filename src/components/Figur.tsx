import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, G, Polyline, Rect } from 'react-native-svg';
import { farben } from '@/theme';

// "Du": weißes, leuchtendes Strichmännchen wie in den Reels (eigene Figur, kein Ritter, keine Ausrüstung).
// Die andere Person ist dieselbe Form als blasse, graue Schattenfigur ohne Gesicht (Art "schatten").
// Platzhalter aus SVG, bis die KI-Posen (Nano Banana) da sind. Immer in leichter Bewegung.
export type Pose = 'stehen' | 'jubeln' | 'winken' | 'handy' | 'denken' | 'atmen' | 'zeigen';

type P = [number, number];
const KOPF: Record<Pose, P> = {
  stehen: [50, 22],
  jubeln: [50, 22],
  winken: [50, 22],
  handy: [53, 25],
  denken: [51, 22],
  atmen: [50, 22],
  zeigen: [50, 22],
};
// Arme als Linienzüge ab der Schulter (50, 46), Beine ab der Hüfte (50, 80)
const ARME: Record<Pose, [P[], P[]]> = {
  stehen: [[[50, 46], [40, 60], [37, 74]], [[50, 46], [60, 60], [63, 74]]],
  jubeln: [[[50, 46], [38, 34], [31, 18]], [[50, 46], [62, 34], [69, 18]]],
  winken: [[[50, 46], [40, 60], [37, 74]], [[50, 46], [64, 40], [72, 24]]],
  handy: [[[50, 46], [46, 58], [57, 58]], [[50, 46], [56, 56], [61, 56]]],
  denken: [[[50, 46], [40, 60], [37, 74]], [[50, 46], [64, 50], [57, 36]]],
  atmen: [[[50, 46], [38, 56], [30, 66]], [[50, 46], [62, 56], [70, 66]]],
  zeigen: [[[50, 46], [40, 60], [37, 74]], [[50, 46], [66, 44], [82, 40]]],
};
const BEINE: Record<Pose, [P[], P[]]> = {
  stehen: [[[50, 80], [44, 100], [41, 120]], [[50, 80], [56, 100], [59, 120]]],
  jubeln: [[[50, 80], [42, 100], [37, 120]], [[50, 80], [58, 100], [63, 120]]],
  winken: [[[50, 80], [44, 100], [41, 120]], [[50, 80], [56, 100], [59, 120]]],
  handy: [[[50, 80], [45, 100], [43, 120]], [[50, 80], [55, 100], [57, 120]]],
  denken: [[[50, 80], [44, 100], [41, 120]], [[50, 80], [56, 100], [59, 120]]],
  atmen: [[[50, 80], [44, 100], [41, 120]], [[50, 80], [56, 100], [59, 120]]],
  zeigen: [[[50, 80], [44, 100], [41, 120]], [[50, 80], [56, 100], [59, 120]]],
};

const punkte = (l: P[]) => l.map((p) => p.join(',')).join(' ');

function Form({ pose, farbe, dicke, deckkraft }: { pose: Pose; farbe: string; dicke: number; deckkraft: number }) {
  const [kx, ky] = KOPF[pose];
  return (
    <G stroke={farbe} strokeWidth={dicke} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={deckkraft}>
      <Circle cx={kx} cy={ky} r={11} fill={farbe} />
      <Polyline points={punkte([[kx, ky + 11], [50, 46], [50, 80]])} />
      {ARME[pose].map((a, i) => (
        <Polyline key={`a${i}`} points={punkte(a)} />
      ))}
      {BEINE[pose].map((b, i) => (
        <Polyline key={`b${i}`} points={punkte(b)} />
      ))}
    </G>
  );
}

const nativ = Platform.OS !== 'web';

export function Figur({ pose = 'stehen', groesse = 150, art = 'du', deckkraft = 1 }: { pose?: Pose; groesse?: number; art?: 'du' | 'schatten'; deckkraft?: number }) {
  const wippen = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const dauer = pose === 'atmen' ? 2600 : pose === 'jubeln' ? 520 : 1700;
    const schleife = Animated.loop(
      Animated.sequence([
        Animated.timing(wippen, { toValue: 1, duration: dauer, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(wippen, { toValue: 0, duration: dauer, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    schleife.start();
    return () => schleife.stop();
  }, [pose, wippen]);
  const hoch = pose === 'jubeln' ? -10 : -3;
  const schatten = art === 'schatten';
  const farbe = schatten ? farben.schatten : farben.weiss;
  return (
    <Animated.View
      style={{
        width: groesse,
        height: groesse * 1.3,
        transform: [
          { translateY: wippen.interpolate({ inputRange: [0, 1], outputRange: [0, hoch] }) },
          { scale: pose === 'atmen' ? wippen.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) : 1 },
        ],
      }}
    >
      <Svg width={groesse} height={groesse * 1.3} viewBox="0 0 100 130">
        {/* Leuchten: dieselbe Form dicker und durchsichtig dahinter (Halation) */}
        {!schatten ? <Form pose={pose} farbe={farben.akzentHell} dicke={11} deckkraft={0.14 * deckkraft} /> : null}
        {!schatten ? <Form pose={pose} farbe={farbe} dicke={7} deckkraft={0.25 * deckkraft} /> : null}
        <Form pose={pose} farbe={farbe} dicke={4} deckkraft={(schatten ? 0.55 : 1) * deckkraft} />
        {pose === 'handy' ? <Rect x={55} y={49} width={9} height={14} rx={2} fill="#CFE3FF" opacity={0.95 * deckkraft} /> : null}
      </Svg>
    </Animated.View>
  );
}

// Kleine rote Flagge (Symbol, Belohnung). wehen = flattert leicht
export function KleineFlagge({ groesse = 26, wehen = true }: { groesse?: number; wehen?: boolean }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!wehen) return;
    const s = Animated.loop(
      Animated.sequence([
        Animated.timing(w, { toValue: 1, duration: 900 + Math.random() * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(w, { toValue: 0, duration: 900 + Math.random() * 500, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    s.start();
    return () => s.stop();
  }, [w, wehen]);
  return (
    <View style={{ width: groesse, height: groesse * 1.4 }}>
      <View style={{ position: 'absolute', left: 1, top: 0, width: 2, height: groesse * 1.4, backgroundColor: '#E6DCE8', borderRadius: 1 }} />
      <Animated.View
        style={{
          position: 'absolute',
          left: 3,
          top: 1,
          width: groesse * 0.75,
          height: groesse * 0.5,
          transform: [{ scaleX: w.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) }, { skewY: w.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '6deg'] }) as unknown as string }],
          transformOrigin: 'left center',
        }}
      >
        <Svg width={groesse * 0.75} height={groesse * 0.5} viewBox="0 0 30 20">
          <Polyline points="0,0 30,5 22,10 30,15 0,20" fill={farben.flaggeRot} stroke={farben.flaggeRot} strokeWidth={1} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
    </View>
  );
}
