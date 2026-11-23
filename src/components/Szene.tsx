import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { STUFEN } from '@/data/stufen';
import { Figur, KleineFlagge, Pose } from './Figur';

// Szene auf "Heute": Nacht bis weites Land. Je mehr Tage, desto heller. Deine festgehaltenen roten Flaggen
// stehen auf dem Hügel (höchstens 8 sichtbar), oben steht "Du". Sterne funkeln, die Sonne atmet.
const nativ = Platform.OS !== 'web';
// Plätze der Flaggen auf dem Hügel (Anteil der Breite, Höhe über dem Boden in Punkten)
const PLAETZE: [number, number][] = [
  [0.18, 62],
  [0.8, 58],
  [0.3, 82],
  [0.68, 80],
  [0.08, 44],
  [0.9, 40],
  [0.4, 96],
  [0.58, 95],
];

function Funkeln({ x, y, r, verz }: { x: number; y: number; r: number; verz: number }) {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const s = Animated.loop(
      Animated.sequence([
        Animated.delay(verz),
        Animated.timing(a, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(a, { toValue: 0.3, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    s.start();
    return () => s.stop();
  }, [a, verz]);
  return <Animated.View style={{ position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, backgroundColor: '#FFFFFF', opacity: a }} />;
}

export function Szene({ stufe, flaggen, breite, hoehe = 330, pose = 'stehen' }: { stufe: number; flaggen: number; breite: number; hoehe?: number; pose?: Pose }) {
  const s = STUFEN[Math.min(stufe, STUFEN.length - 1)];
  const sonne = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(
      Animated.sequence([
        Animated.timing(sonne, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
        Animated.timing(sonne, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }),
      ]),
    );
    l.start();
    return () => l.stop();
  }, [sonne]);
  const sterne = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ x: ((i * 73) % 97) / 100, y: ((i * 37) % 45) / 100 + 0.03, r: i % 3 === 0 ? 1.6 : 1, verz: (i * 260) % 2000 })),
    [],
  );
  const b = breite;
  const h = hoehe;
  const boden = h - 70;
  const sonneY = boden - 30 - s.sonne * 90;
  return (
    <View style={{ width: b, height: h, overflow: 'hidden', borderRadius: 28 }}>
      <Svg width={b} height={h} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="himmel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={s.himmel[0]} />
            <Stop offset="0.6" stopColor={s.himmel[1]} />
            <Stop offset="1" stopColor={s.himmel[2]} />
          </LinearGradient>
          <RadialGradient id="sonne" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFD3A0" stopOpacity={0.9 * Math.max(0.25, s.sonne)} />
            <Stop offset="0.35" stopColor="#FFB37A" stopOpacity={0.45 * Math.max(0.25, s.sonne)} />
            <Stop offset="1" stopColor="#FF7A63" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={b} height={h} fill="url(#himmel)" />
        <Ellipse cx={b * 0.74} cy={sonneY} rx={b * 0.55} ry={b * 0.55} fill="url(#sonne)" />
        {s.sonne > 0.5 ? <Circle cx={b * 0.74} cy={sonneY + 10} r={22} fill="#FFD9B0" opacity={0.85} /> : null}
        <Path d={`M0 ${boden + 10} Q${b * 0.3} ${boden - 60} ${b * 0.5} ${boden - 50} T${b} ${boden + 0} V${h} H0Z`} fill="#1A1020" opacity={0.95} />
        <Path d={`M0 ${boden + 40} Q${b * 0.4} ${boden + 5} ${b * 0.65} ${boden + 22} T${b} ${boden + 30} V${h} H0Z`} fill="#110A16" />
      </Svg>
      {sterne.map((st, i) => (s.sterne > 0 ? <View key={i} style={{ position: 'absolute', left: 0, top: 0, opacity: s.sterne }}><Funkeln x={st.x * b} y={st.y * h} r={st.r} verz={st.verz} /></View> : null))}
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: b * 0.74 - 90, top: sonneY - 90, width: 180, height: 180, borderRadius: 90, backgroundColor: '#FFB37A', opacity: sonne.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.1] }) }}
      />
      {PLAETZE.slice(0, Math.min(flaggen, PLAETZE.length)).map(([x, y], i) => (
        <View key={i} style={{ position: 'absolute', left: x * b - 4, top: boden - 50 + (100 - y) * 0.55 - 10 }}>
          <KleineFlagge groesse={20} />
        </View>
      ))}
      <View style={{ position: 'absolute', left: b / 2 - 55, top: boden - 50 - 128 }}>
        <Figur pose={pose} groesse={110} />
      </View>
    </View>
  );
}
