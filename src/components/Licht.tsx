import { useId, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import { farben } from '@/theme';

// Weiche Lichtflecken (Halation) mit react-native-svg. React Native kann kein CSS-blur,
// deshalb sind die Flecken radiale Verläufe, die nach außen durchsichtig werden. Nie abgeschnitten:
// die Flecken liegen über die ganze Fläche verteilt und laufen weich aus.
export type Fleck = { x: number; y: number; r: number; farbe: string; staerke: number };

export const STANDARD_LICHT: Fleck[] = [
  { x: 0.85, y: 0.05, r: 260, farbe: farben.akzent, staerke: 0.14 },
  { x: 0.1, y: 0.95, r: 280, farbe: farben.morgen, staerke: 0.1 },
];
export const SOS_LICHT: Fleck[] = [{ x: 0.5, y: 0.45, r: 300, farbe: farben.akzent, staerke: 0.16 }];
export const LEISES_LICHT: Fleck[] = [{ x: 0.5, y: 0.0, r: 280, farbe: farben.akzent, staerke: 0.1 }];

export function Halation({ flecken }: { flecken: Fleck[] }) {
  const id = useId().replace(/:/g, '');
  const [g, setG] = useState({ b: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (Math.abs(width - g.b) > 1 || Math.abs(height - g.h) > 1) setG({ b: width, h: height });
  };
  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      {g.b > 0 && flecken.length > 0 ? (
        <Svg width={g.b} height={g.h}>
          <Defs>
            {flecken.map((f, i) => (
              <RadialGradient key={i} id={`l${id}${i}`} cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={f.farbe} stopOpacity={f.staerke} />
                <Stop offset="0.5" stopColor={f.farbe} stopOpacity={f.staerke * 0.45} />
                <Stop offset="1" stopColor={f.farbe} stopOpacity={0} />
              </RadialGradient>
            ))}
          </Defs>
          {flecken.map((f, i) => (
            <Ellipse key={i} cx={f.x * g.b} cy={f.y * g.h} rx={f.r} ry={f.r} fill={`url(#l${id}${i})`} />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

// Lichtschein hinter einem Element (Zahl, Figur, Knopf)
export function Leuchten({ groesse = 240, farbe = farben.akzent, staerke = 0.35 }: { groesse?: number; farbe?: string; staerke?: number }) {
  const id = useId().replace(/:/g, '');
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width: groesse, height: groesse, alignSelf: 'center' }}>
      <Svg width={groesse} height={groesse}>
        <Defs>
          <RadialGradient id={`g${id}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={farbe} stopOpacity={staerke} />
            <Stop offset="0.55" stopColor={farbe} stopOpacity={staerke * 0.35} />
            <Stop offset="1" stopColor={farbe} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Ellipse cx={groesse / 2} cy={groesse / 2} rx={groesse / 2} ry={groesse / 2} fill={`url(#g${id})`} />
      </Svg>
    </View>
  );
}
