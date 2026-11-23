// Drehrad wie beim iPhone-Wecker (Fabrik-Vorlage, Raoul 22.11.2026).
// Zahlen laufen auf einer Walze, oben und unten blenden sie aus und kippen nach hinten,
// bei jeder Stufe gibt es einen kleinen Klick (Haptik "Auswahl", fühlt sich an wie ein Zahnrad).
// Braucht nur react-native und expo-haptics, geht also per EAS Update in alte Builds.
// Vorlage: claude-wissen wissen/app-fabrik/vorlagen/drehrad/ (README dort). In allen Apps gleich halten.
import * as Haptics from 'expo-haptics';
import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';

type Wert = number | string;

export type DrehradStil = {
  /** Farbe der gewählten Zahl */
  farbe: string;
  /** Schriftfamilie (lokal geladen, nie Google-CDN) */
  schrift?: string;
  /** Schriftgröße der Zahlen */
  groesse?: number;
  /** Hintergrund des Auswahlbands in der Mitte (z. B. halbtransparentes Weiß oder Akzent mit wenig Deckkraft) */
  band?: string;
  /** Randfarbe des Bands (optional) */
  bandRand?: string;
  /** zusätzlicher Textstil, z. B. Leuchten über textShadow */
  text?: StyleProp<TextStyle>;
};

export type DrehradProps = {
  werte: readonly Wert[];
  wert: Wert;
  onWechsel: (w: Wert) => void;
  stil: DrehradStil;
  /** Anzeige je Wert, z. B. (w) => String(w).padStart(2, '0') */
  format?: (w: Wert) => string;
  /** Höhe einer Zeile (Standard 44) */
  zeile?: number;
  /** sichtbare Zeilen, ungerade (Standard 5) */
  sichtbar?: number;
  breite?: number;
  /** eigener Klick statt der Standard-Haptik (z. B. App-eigene Haptik mit ruhigem Modus) */
  klick?: () => void;
  /** Ton bei jeder Stufe, z. B. () => ton('drehen', 0.5) aus dem Dopamin-Baukasten */
  ton?: () => void;
  /** Band selbst zeichnen (aus, wenn mehrere Räder ein gemeinsames Band haben) */
  ohneBand?: boolean;
  label?: string;
  /** Walze läuft im Kreis (nach 23 kommt 00), wie beim Wecker */
  endlos?: boolean;
};

const KOPIEN = 5; // so oft wiederholt sich eine endlose Walze, gedreht wird immer in der Mitte

const nativ = Platform.OS !== 'web';

export function Drehrad({ werte: basis, wert, onWechsel, stil, format, zeile = 44, sichtbar = 5, breite = 96, klick, ton, ohneBand, label, endlos }: DrehradProps) {
  const n = basis.length;
  const werte = useMemo(() => (endlos ? Array.from({ length: n * KOPIEN }, (_, i) => basis[i % n]) : basis), [basis, endlos, n]);
  const mitte = endlos ? Math.floor(KOPIEN / 2) * n : 0;
  const y = useRef(new Animated.Value(0)).current;
  const scroll = useRef<ScrollViewRef>(null);
  const aktuell = useRef(mitte + Math.max(0, basis.indexOf(wert)));
  const bereit = useRef(false);
  // Ziel einer Drehung, die die App selbst auslöst (Vorschlag angetippt): unterwegs keine Wechsel melden
  const ziel = useRef<number | null>(null);
  const zielTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dreheZu = (i: number, animiert: boolean) => {
    aktuell.current = i;
    if (animiert) {
      ziel.current = i;
      if (zielTimer.current) clearTimeout(zielTimer.current);
      zielTimer.current = setTimeout(() => (ziel.current = null), 700);
    }
    scroll.current?.scrollTo({ y: i * zeile, animated: animiert });
  };
  const rand = ((sichtbar - 1) / 2) * zeile;
  const hoehe = sichtbar * zeile;
  const groesse = stil.groesse ?? 26;

  // Wert von außen geändert (z. B. Vorschlag-Chip angetippt): Walze dorthin drehen
  useEffect(() => {
    const b = basis.indexOf(wert);
    if (b < 0 || b === aktuell.current % n) return;
    // nächste Kopie des Werts in der Nähe der jetzigen Stelle
    let i = aktuell.current - (aktuell.current % n) + b;
    if (endlos && i - aktuell.current > n / 2) i -= n;
    if (endlos && aktuell.current - i > n / 2) i += n;
    dreheZu(i, bereit.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wert, basis, n, endlos, zeile]);

  // immer die neuesten Rückrufe benutzen (die Zeilen werden nur einmal gebaut)
  const rueckruf = useRef({ onWechsel, klick, ton });
  rueckruf.current = { onWechsel, klick, ton };
  const melde = (w: Wert) => rueckruf.current.onWechsel(w);
  const tick = () => {
    // Raoul 22.11.2026: selectionAsync war zu schwach. Rigid = kurzer, harter Schlag wie ein Zahnrad.
    if (rueckruf.current.klick) rueckruf.current.klick();
    else if (nativ) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
    rueckruf.current.ton?.();
  };

  const ruhe = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beimScrollen = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!bereit.current) return;
    if (!nativ) {
      // Browser: nach kurzer Ruhe auf die nächste Zahl einrasten (Mausrad, Trackpad)
      const yy = e.nativeEvent.contentOffset.y;
      if (ruhe.current) clearTimeout(ruhe.current);
      ruhe.current = setTimeout(() => einrasten({ nativeEvent: { contentOffset: { y: yy } } } as NativeSyntheticEvent<NativeScrollEvent>), 140);
    }
    const i = Math.min(werte.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / zeile)));
    if (ziel.current !== null) {
      if (i === ziel.current) ziel.current = null;
      return;
    }
    if (i !== aktuell.current) {
      aktuell.current = i;
      tick();
      melde(basis[i % n]);
    }
  };

  // Ereignis nur einmal anlegen (sonst hängt der native Treiber bei jedem Rendern neu an)
  const zuletzt = useRef(beimScrollen);
  zuletzt.current = beimScrollen;
  const onScroll = useMemo(() => Animated.event([{ nativeEvent: { contentOffset: { y } } }], { useNativeDriver: nativ, listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => zuletzt.current(e) }), [y]);

  // Im Browser rastet die Walze nach dem Loslassen nicht immer selbst ein
  const einrasten = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yy = e.nativeEvent.contentOffset.y;
    const i = Math.min(werte.length - 1, Math.max(0, Math.round(yy / zeile)));
    if (Math.abs(yy - i * zeile) > 1) scroll.current?.scrollTo({ y: i * zeile, animated: true });
    else if (endlos && Math.abs(i - mitte) > n) {
      // unbemerkt zurück in die mittlere Kopie springen, damit es nie ein Ende gibt
      const j = mitte + (i % n);
      aktuell.current = j;
      scroll.current?.scrollTo({ y: j * zeile, animated: false });
    }
  };

  const zeilen = useMemo(
    () =>
      werte.map((w, i) => {
        const ein = [(i - 3) * zeile, (i - 2) * zeile, (i - 1) * zeile, i * zeile, (i + 1) * zeile, (i + 2) * zeile, (i + 3) * zeile];
        const deckkraft = y.interpolate({ inputRange: ein, outputRange: [0, 0.18, 0.45, 1, 0.45, 0.18, 0], extrapolate: 'clamp' });
        const kippen = y.interpolate({ inputRange: ein, outputRange: ['-72deg', '-48deg', '-24deg', '0deg', '24deg', '48deg', '72deg'], extrapolate: 'clamp' });
        const skala = y.interpolate({ inputRange: ein, outputRange: [0.8, 0.86, 0.93, 1, 0.93, 0.86, 0.8], extrapolate: 'clamp' });
        return (
          <Pressable
            key={`${w}-${i}`}
            accessibilityRole="adjustable"
            onPress={() => {
              // Zahl antippen dreht sie in die Mitte, wie beim Wecker
              if (i === aktuell.current) return;
              tick();
              dreheZu(i, true);
              melde(basis[i % n]);
            }}
            style={{ height: zeile, justifyContent: 'center' }}
          >
            <Animated.View style={{ opacity: deckkraft, transform: [{ perspective: 600 }, { rotateX: kippen }, { scale: skala }] }}>
              <Text
                allowFontScaling={false}
                style={[{ fontFamily: stil.schrift, fontSize: groesse, color: stil.farbe, textAlign: 'center', fontVariant: ['tabular-nums'], includeFontPadding: false }, stil.text]}
              >
                {format ? format(w) : String(w)}
              </Text>
            </Animated.View>
          </Pressable>
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [werte, zeile, groesse, stil.farbe, stil.schrift, stil.text, format, y],
  );

  return (
    <View style={{ width: breite, height: hoehe }} accessibilityLabel={label}>
      {!ohneBand && <DrehradBand zeile={zeile} sichtbar={sichtbar} stil={stil} />}
      <Animated.ScrollView
        ref={scroll as never}
        showsVerticalScrollIndicator={false}
        snapToInterval={zeile}
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled
        contentContainerStyle={{ paddingVertical: rand }}
        onLayout={() => {
          // Startposition ohne Animation setzen, erst danach zählen Bewegungen als Klick
          scroll.current?.scrollTo({ y: aktuell.current * zeile, animated: false });
          y.setValue(aktuell.current * zeile);
          setTimeout(() => (bereit.current = true), 80);
        }}
        onScroll={onScroll}
        onMomentumScrollEnd={einrasten}
      >
        {zeilen}
      </Animated.ScrollView>
    </View>
  );
}

/** Auswahlband in der Mitte. Für mehrere Räder nebeneinander einmal hinter alle legen. */
export function DrehradBand({ zeile = 44, sichtbar = 5, stil, style }: { zeile?: number; sichtbar?: number; stil: DrehradStil; style?: StyleProp<ViewStyle> }) {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: ((sichtbar - 1) / 2) * zeile,
          height: zeile,
          borderRadius: zeile / 2.6,
          backgroundColor: stil.band ?? 'rgba(127,127,127,0.12)',
          borderWidth: stil.bandRand ? 1 : 0,
          borderColor: stil.bandRand,
        },
        style,
      ]}
    />
  );
}

/** Mehrere Räder nebeneinander mit einem gemeinsamen Band, dazwischen z. B. ":" oder eine Einheit. */
export function DrehradReihe({ children, zeile = 44, sichtbar = 5, stil, breite }: { children: ReactNode; zeile?: number; sichtbar?: number; stil: DrehradStil; breite?: number }) {
  return (
    <View style={{ alignSelf: 'center', width: breite, height: zeile * sichtbar, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
      <DrehradBand zeile={zeile} sichtbar={sichtbar} stil={stil} />
      {children}
    </View>
  );
}

/** Feste Beschriftung in der Mitte der Reihe, z. B. ":" oder "cm". */
export function DrehradZeichen({ text, stil, groesse }: { text: string; stil: DrehradStil; groesse?: number }) {
  return (
    <Text allowFontScaling={false} style={[{ fontFamily: stil.schrift, fontSize: groesse ?? stil.groesse ?? 26, color: stil.farbe, marginHorizontal: 2, includeFontPadding: false }, stil.text]}>
      {text}
    </Text>
  );
}

// Hilfen
export const zahlen = (von: number, bis: number, schritt = 1) => Array.from({ length: Math.floor((bis - von) / schritt) + 1 }, (_, i) => von + i * schritt);
export const zweistellig = (w: Wert) => String(w).padStart(2, '0');

/** Uhrzeit-Rad: Stunden und Minuten (Schritt 5) mit einem gemeinsamen Band. uhr = "HH:MM". */
export function Zeitrad({ uhr, onWechsel, stil, minutenSchritt = 5, zeile = 44, sichtbar = 5, klick, ton, endlos = true }: { uhr: string; onWechsel: (uhr: string) => void; stil: DrehradStil; minutenSchritt?: number; zeile?: number; sichtbar?: number; klick?: () => void; ton?: () => void; endlos?: boolean }) {
  const [h, m] = uhr.split(':').map((x) => parseInt(x, 10) || 0);
  const minuten = useMemo(() => zahlen(0, 60 - minutenSchritt, minutenSchritt), [minutenSchritt]);
  const stunden = useMemo(() => zahlen(0, 23), []);
  const mm = minuten.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a), 0);
  const breite = (stil.groesse ?? 26) * 2.6;
  return (
    <DrehradReihe zeile={zeile} sichtbar={sichtbar} stil={stil}>
      <Drehrad endlos={endlos} label="Stunde" werte={stunden} wert={h} format={zweistellig} breite={breite} zeile={zeile} sichtbar={sichtbar} stil={stil} klick={klick} ton={ton} ohneBand onWechsel={(w) => onWechsel(`${zweistellig(w)}:${zweistellig(mm)}`)} />
      <DrehradZeichen text=":" stil={stil} />
      <Drehrad endlos={endlos} label="Minute" werte={minuten} wert={mm} format={zweistellig} breite={breite} zeile={zeile} sichtbar={sichtbar} stil={stil} klick={klick} ton={ton} ohneBand onWechsel={(w) => onWechsel(`${zweistellig(h)}:${zweistellig(w)}`)} />
    </DrehradReihe>
  );
}

type ScrollViewRef = { scrollTo: (o: { y: number; animated?: boolean }) => void };
