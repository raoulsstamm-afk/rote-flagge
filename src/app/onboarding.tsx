import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { erlaubnisAnfragen } from '@/benachrichtigung';
import { Zeitrad } from '@/components/Drehrad';
import { Figur, KleineFlagge, Pose } from '@/components/Figur';
import { Leuchten } from '@/components/Licht';
import { Haken, KartenIcon, Schloss, Zurueck } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Chip, Einblenden, Karte, Knopf, NurAufDemHandy, useFeder } from '@/components/ui';
import { formen, PRONOMEN_WAHL, Pronomen } from '@/data/person';
import { Phase, PHASEN } from '@/data/phasen';
import { ERINNERUNG_TAG, GRATIS_TAGE, PREIS_JAHR, PREIS_JAHR_PRO_MONAT, PREIS_MONAT } from '@/data/preise';
import { deinMuster, FRAGEN, liste, quizSchwerpunkte, ZIELE } from '@/data/quiz';
import { useApp } from '@/state/store';
import { farben, schatten, schrift, verlaeufe } from '@/theme';

// Onboarding (Redesign 23.11.2026, Raoul): ein Modus für alle Phasen. Zwei bewegte Intro-Szenen, "Wo stehst du?",
// "Um wen geht's?", 5 Fragen in gemischten Formaten, Ziel, Auswertung, Ergebnis mit deinem Muster,
// SOS ausprobieren (echte Nachricht parken), erste Flagge, Plan, Erinnerung, harte Paywall.
// Regeln: kein Scrollen auf 390 x 844, höchstens 4 Antwortkarten, Weiter-Knopf auf jedem Bildschirm, kein Auto-Weiter.
// Jede Antwort pflanzt eine kleine Flagge in die Leiste oben.

type Schritt =
  | 'intro1'
  | 'intro2'
  | 'phase'
  | 'person'
  | `frage${number}`
  | 'ziel'
  | 'auswertung'
  | 'ergebnis'
  | 'ausprobieren'
  | 'flagge'
  | 'plan'
  | 'erinnerung'
  | 'paywall';

const ABLAUF: Schritt[] = ['intro1', 'intro2', 'phase', 'person', ...FRAGEN.map((_, i) => `frage${i}` as Schritt), 'ziel', 'auswertung', 'ergebnis', 'ausprobieren', 'flagge', 'plan', 'erinnerung', 'paywall'];
const MIT_LEISTE: Schritt[] = ['phase', 'person', ...FRAGEN.map((_, i) => `frage${i}` as Schritt), 'ziel'];

export default function Onboarding() {
  const { z, setze, vibriere, parken, eintragSpeichern, kontaktpauseStarten } = useApp();
  const [i, setI] = useState(0);
  const schritt = ABLAUF[i];
  const f = formen(z.person);
  const weiter = () => {
    vibriere('mittel');
    setI((x) => Math.min(ABLAUF.length - 1, x + 1));
  };
  const zurueck = () => setI((x) => Math.max(0, x - 1));
  const leisteWert = MIT_LEISTE.indexOf(schritt);

  const rahmen = (inhalt: ReactNode, knopf: ReactNode) => (
    <Bildschirm>
      {leisteWert >= 0 ? <FlaggenLeiste anzahl={MIT_LEISTE.length} gesetzt={leisteWert} onZurueck={zurueck} /> : null}
      <View style={{ flex: 1, gap: 14 }}>{inhalt}</View>
      {knopf}
    </Bildschirm>
  );

  // 1 und 2: bewegte Szenen wie in den Reels
  if (schritt === 'intro1' || schritt === 'intro2') {
    const erste = schritt === 'intro1';
    return (
      <Bildschirm>
        <Pressable style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }} onPress={weiter} accessibilityRole="button">
          <Zoom key={schritt}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Leuchten groesse={320} farbe={erste ? '#9CC4FF' : farben.morgen} staerke={erste ? 0.22 : 0.35} />
              <Figur pose={erste ? 'handy' : 'entwirren'} groesse={150} />
            </View>
          </Zoom>
          <Einblenden verz={300}>
            <Txt groesse={34} gewicht="serifFett" mitte>
              {erste ? 'Tippen. Löschen.\nWieder tippen.' : 'Du musst nicht\nantworten.'}
            </Txt>
          </Einblenden>
          <Einblenden verz={500}>
            <Txt groesse={16} farbe={farben.textLeise} mitte>
              {erste ? 'Kennst du das?' : 'Rote Flagge hilft dir, klar zu sehen.'}
            </Txt>
          </Einblenden>
        </Pressable>
        <Knopf text={erste ? 'Kenn ich' : "Los geht's"} onPress={weiter} />
        {!erste ? <NurAufDemHandy text="Ab 16. Alles bleibt nur auf deinem Handy." /> : null}
      </Bildschirm>
    );
  }

  if (schritt === 'phase') {
    return rahmen(
      <>
        <Titel>Wo stehst du gerade?</Titel>
        <View style={{ gap: 10 }}>
          {PHASEN.map((p, k) => (
            <Einblenden key={p.id} verz={80 * k}>
              <AntwortKarte text={p.text} icon={p.icon} an={z.phase === p.id} onPress={() => setze({ phase: p.id as Phase })} />
            </Einblenden>
          ))}
        </View>
      </>,
      <Knopf text="Weiter" aus={!z.phase} onPress={weiter} />,
    );
  }

  if (schritt === 'person') {
    return (
      <Bildschirm>
        <FlaggenLeiste anzahl={MIT_LEISTE.length} gesetzt={leisteWert} onZurueck={zurueck} />
        <KeyboardAvoidingView style={{ flex: 1, gap: 12 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Titel>Um wen geht's?</Titel>
          <View style={{ gap: 10 }}>
            {PRONOMEN_WAHL.map((p, k) => (
              <Einblenden key={p.id} verz={80 * k}>
                <AntwortKarte
                  text={p.text}
                  icon={p.id === 'er' ? 'mann' : p.id === 'sie' ? 'frau' : 'offen'}
                  an={z.person?.pronomen === p.id}
                  onPress={() => setze({ person: { name: z.person?.name ?? '', pronomen: p.id as Pronomen } })}
                />
              </Einblenden>
            ))}
          </View>
          <Karte stil={{ paddingVertical: 4, paddingHorizontal: 18 }}>
            <TextInput
              value={z.person?.name ?? ''}
              onChangeText={(t) => setze({ person: { pronomen: z.person?.pronomen ?? 'er', name: t.slice(0, 24) } })}
              placeholder="Name oder Spitzname (freiwillig)"
              placeholderTextColor={farben.textHell}
              style={s.feld}
            />
          </Karte>
          <View style={{ flex: 1 }} />
          <Knopf text="Weiter" aus={!z.person?.pronomen} onPress={weiter} />
        </KeyboardAvoidingView>
      </Bildschirm>
    );
  }

  if (schritt.startsWith('frage')) {
    const q = FRAGEN[Number(schritt.slice(5))];
    const wert = z.quiz[q.id];
    const setzeWert = (v: string | string[] | number) => setze({ quiz: { ...z.quiz, [q.id]: v } });
    if (q.art === 'karten') {
      return rahmen(
        <>
          <Titel>{q.titel(f)}</Titel>
          <View style={{ gap: 10 }}>
            {q.optionen.map((o, k) => (
              <Einblenden key={o.id} verz={80 * k}>
                <AntwortKarte text={o.text(f)} icon={o.icon} an={wert === o.id} onPress={() => setzeWert(o.id)} />
              </Einblenden>
            ))}
          </View>
        </>,
        <Knopf text="Weiter" aus={!wert} onPress={weiter} />,
      );
    }
    if (q.art === 'chips') {
      const gewaehlt = liste(z.quiz, q.id);
      return rahmen(
        <>
          <Titel>{q.titel(f)}</Titel>
          <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: -6 }}>
            {q.unter}
          </Txt>
          <View style={s.chips}>
            {q.optionen.map((o, k) => (
              <Einblenden key={o.id} verz={50 * k}>
                <Chip text={o.text(f)} an={gewaehlt.includes(o.id)} onPress={() => setzeWert(gewaehlt.includes(o.id) ? gewaehlt.filter((x) => x !== o.id) : [...gewaehlt, o.id])} />
              </Einblenden>
            ))}
          </View>
        </>,
        <Knopf text="Weiter" aus={gewaehlt.length === 0} onPress={weiter} />,
      );
    }
    const stufe = typeof wert === 'number' ? wert : 2;
    return rahmen(
      <>
        <Titel>{q.titel(f)}</Titel>
        <View style={{ flex: 1, justifyContent: 'center', gap: 28 }}>
          <View style={{ alignItems: 'center', height: 180, justifyContent: 'center' }}>
            <Leuchten groesse={200 + stufe * 30} staerke={0.18 + stufe * 0.05} />
            <Figur pose={stufe >= 3 ? 'handy' : stufe >= 2 ? 'denken' : 'stehen'} groesse={100} />
          </View>
          <Txt groesse={30} gewicht="serifFett" mitte farbe={farben.akzent}>
            {q.stufen[stufe]}
          </Txt>
          <Regler stufen={q.stufen.length} wert={stufe} onWechsel={(v) => setzeWert(v)} />
        </View>
      </>,
      <Knopf
        text="Weiter"
        onPress={() => {
          if (typeof wert !== 'number') setzeWert(stufe);
          weiter();
        }}
      />,
    );
  }

  if (schritt === 'ziel') {
    return rahmen(
      <>
        <Titel>Wie viele Tage willst du dir geben?</Titel>
        <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: -6 }}>
          {z.phase === 'getrennt' ? 'Tage Kontaktpause. Du kannst jederzeit sanft neu anfangen.' : 'Tage, an denen du bei dir bleibst.'}
        </Txt>
        <View style={{ gap: 10 }}>
          {ZIELE.map((t, k) => (
            <Einblenden key={t} verz={80 * k}>
              <AntwortKarte text={`${t} Tage`} icon="ziel" an={z.ziel === t} onPress={() => setze({ ziel: t })} />
            </Einblenden>
          ))}
        </View>
      </>,
      <Knopf text="Weiter" onPress={weiter} />,
    );
  }

  if (schritt === 'auswertung') return <Auswertung onWeiter={weiter} />;

  if (schritt === 'ergebnis') {
    const m = deinMuster(z.quiz);
    const danach = FRAGEN[0].art === 'karten' ? FRAGEN[0].optionen.find((o) => o.id === z.quiz.danach)?.text(f) : null;
    const schwer = FRAGEN.find((q) => q.id === 'schwer');
    const schwerText = schwer && schwer.art === 'chips' ? liste(z.quiz, 'schwer').map((id) => schwer.optionen.find((o) => o.id === id)?.text(f)).filter(Boolean)[0] : null;
    const phase = PHASEN.find((p) => p.id === z.phase)?.text;
    return (
      <Bildschirm>
        <Einblenden>
          <Txt groesse={14} gewicht="extra" farbe={farben.akzent} style={{ letterSpacing: 1 }}>
            DEIN MUSTER
          </Txt>
        </Einblenden>
        <Einblenden verz={120}>
          <Txt groesse={38} gewicht="serifFett">
            {m.name}
          </Txt>
        </Einblenden>
        <Einblenden verz={240}>
          <Txt groesse={17} farbe={farben.textLeise}>
            {m.satz}
          </Txt>
        </Einblenden>
        <View style={s.bento}>
          <Einblenden verz={380} stil={{ width: '100%' }}>
            <Kachel titel="Gerade" text={phase ?? ''} />
          </Einblenden>
          <Einblenden verz={480} stil={{ width: '48.5%' }}>
            <Kachel titel="Danach" text={danach ?? 'Mal so, mal so'} gross />
          </Einblenden>
          <Einblenden verz={580} stil={{ width: '48.5%' }}>
            <Kachel titel="Am schwersten" text={schwerText ?? 'Abends'} gross />
          </Einblenden>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Leuchten groesse={240} staerke={0.25} />
          <Figur pose="verheddert" groesse={140} />
        </View>
        <Txt groesse={12} farbe={farben.textHell} mitte>
          Kein Test und keine Diagnose. Nur ein ehrlicher Blick auf das, was du erlebst.
        </Txt>
        <Knopf text="Weiter" onPress={weiter} />
      </Bildschirm>
    );
  }

  if (schritt === 'ausprobieren') return <Ausprobieren f={f} onParken={(t) => parken(t)} onWeiter={weiter} />;

  if (schritt === 'flagge')
    return (
      <ErsteFlagge
        onSpeichern={(t) => {
          eintragSpeichern({ text: t, gefuehle: [], kategorien: quizSchwerpunkte(z.quiz).slice(0, 1), waerme: null });
        }}
        onWeiter={weiter}
      />
    );

  if (schritt === 'plan') {
    const zurueckWunsch = FRAGEN.find((q) => q.id === 'zurueck');
    const wunsch = zurueckWunsch && zurueckWunsch.art === 'chips' ? liste(z.quiz, 'zurueck').map((id) => zurueckWunsch.optionen.find((o) => o.id === id)?.text(f)).filter(Boolean)[0] : null;
    const schwer = FRAGEN.find((q) => q.id === 'schwer');
    const schwerText = schwer && schwer.art === 'chips' ? liste(z.quiz, 'schwer').map((id) => schwer.optionen.find((o) => o.id === id)?.text(f)).filter(Boolean)[0] : null;
    const etappen = [
      { wann: 'Heute', text: 'Deine erste Flagge steht. Die Nacht beginnt.' },
      { wann: 'Tag 7', text: schwerText ? `${schwerText}: du schreibst hier statt ${f.ihm}.` : `Du schreibst hier statt ${f.ihm}.` },
      { wann: 'Tag 14', text: 'Deine Heiß-kalt-Kurve zeigt, was sich wiederholt.' },
      { wann: `Tag ${z.ziel}`, text: wunsch ? `${wunsch} ist wieder da.` : 'Du siehst wieder klar.' },
    ];
    return (
      <Bildschirm>
        <Titel>Dein Weg</Titel>
        <View style={{ gap: 0, marginTop: 4 }}>
          {etappen.map((e, k) => (
            <Einblenden key={e.wann} verz={150 + k * 220} stil={{ flexDirection: 'row', gap: 14 }}>
              <View style={{ alignItems: 'center', width: 26 }}>
                <View style={[s.punkt, k === 0 && { backgroundColor: farben.akzent, boxShadow: schatten.leuchten }]} />
                {k < etappen.length - 1 ? <View style={{ width: 2, flex: 1, backgroundColor: farben.karteRand, marginVertical: 4 }} /> : null}
              </View>
              <View style={{ flex: 1, paddingBottom: 22, gap: 2 }}>
                <Txt groesse={18} gewicht="extra" farbe={k === 0 ? farben.akzent : farben.text}>
                  {e.wann}
                </Txt>
                <Txt groesse={15} farbe={farben.textLeise}>
                  {e.text}
                </Txt>
              </View>
            </Einblenden>
          ))}
        </View>
        <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <Figur pose="zeigen" groesse={80} />
        </View>
        <Knopf text="Weiter" onPress={weiter} />
      </Bildschirm>
    );
  }

  if (schritt === 'erinnerung') return <Erinnerung onWeiter={weiter} />;

  return (
    <Paywall
      onFertig={() => {
        vibriere('erfolg');
        if (z.phase === 'getrennt' && !z.kontaktpause.start) kontaktpauseStarten();
        setze({ onboardingFertig: true });
        router.replace('/heute');
      }}
    />
  );
}

function Titel({ children }: { children: ReactNode }) {
  return (
    <Einblenden>
      <Txt groesse={30} gewicht="serifFett">
        {children}
      </Txt>
    </Einblenden>
  );
}

// Fortschritt als Flaggen: jede beantwortete Frage pflanzt eine kleine Flagge
function FlaggenLeiste({ anzahl, gesetzt, onZurueck }: { anzahl: number; gesetzt: number; onZurueck: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 34 }}>
      <Pressable onPress={onZurueck} hitSlop={14} accessibilityRole="button" accessibilityLabel="Zurück" style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
        <Zurueck farbe={farben.textLeise} />
      </Pressable>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 30 }}>
        {Array.from({ length: anzahl }, (_, k) =>
          k < gesetzt ? (
            <Einblenden key={k}>
              <KleineFlagge groesse={16} wehen={k === gesetzt - 1} />
            </Einblenden>
          ) : (
            <View key={k} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: k === gesetzt ? farben.akzent : farben.karteRand, marginBottom: 2 }} />
          ),
        )}
      </View>
    </View>
  );
}

function AntwortKarte({ text, icon, an, onPress }: { text: string; icon: string; an: boolean; onPress: () => void }) {
  const feder = useFeder();
  return (
    <Animated.View style={feder.stil}>
      <Pressable
        onPressIn={feder.rein}
        onPressOut={feder.raus}
        onPress={() => {
          feder.vibriere('mittel');
          onPress();
        }}
        accessibilityRole="radio"
        accessibilityState={{ selected: an }}
        style={[s.karte, an && s.karteAn]}
      >
        <View style={s.icon}>
          <KartenIcon name={icon} groesse={28} farbe={an ? farben.akzent : farben.textLeise} />
        </View>
        <Txt groesse={18} gewicht="extra" style={{ flex: 1 }}>
          {text}
        </Txt>
        <View style={[s.haken, an && { backgroundColor: farben.akzent, borderColor: farben.akzent }]}>{an ? <Haken groesse={15} farbe={farben.dunkel} /> : null}</View>
      </Pressable>
    </Animated.View>
  );
}

function Kachel({ titel, text, gross }: { titel: string; text: string; gross?: boolean }) {
  return (
    <Karte stil={{ gap: 4, padding: 16, minHeight: gross ? 120 : 0 }}>
      <Txt groesse={12} gewicht="extra" farbe={farben.textHell} style={{ letterSpacing: 1 }}>
        {titel.toUpperCase()}
      </Txt>
      <Txt groesse={18} gewicht="extra">
        {text}
      </Txt>
    </Karte>
  );
}

// Regler mit 5 Stufen: antippen oder ziehen
function Regler({ stufen, wert, onWechsel }: { stufen: number; wert: number; onWechsel: (v: number) => void }) {
  const { vibriere } = useApp();
  const [breite, setBreite] = useState(0);
  const setzeAus = (x: number) => {
    if (!breite) return;
    const v = Math.max(0, Math.min(stufen - 1, Math.round((x / breite) * (stufen - 1))));
    if (v !== wert) {
      vibriere('tick');
      onWechsel(v);
    }
  };
  return (
    <View
      onLayout={(e) => setBreite(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => setzeAus(e.nativeEvent.locationX)}
      onResponderMove={(e) => setzeAus(e.nativeEvent.locationX)}
      style={{ height: 48, justifyContent: 'center' }}
    >
      <View style={{ height: 10, borderRadius: 5, backgroundColor: farben.karteRand }}>
        <LinearGradient colors={verlaeufe.knopf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 10, borderRadius: 5, width: `${(wert / (stufen - 1)) * 100}%` }} />
      </View>
      <View pointerEvents="none" style={{ position: 'absolute', left: breite ? (wert / (stufen - 1)) * breite - 18 : 0, width: 36, height: 36, borderRadius: 18, backgroundColor: farben.weiss, boxShadow: schatten.leuchten }} />
    </View>
  );
}

// Zoom-Auftritt für die ersten Bildschirme
function Zoom({ children }: { children: ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start();
  }, [a]);
  return <Animated.View style={{ opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [1.35, 1] }) }] }}>{children}</Animated.View>;
}

// Auswertung: der Kreis füllt sich, dann erscheint Weiter
function Auswertung({ onWeiter }: { onWeiter: () => void }) {
  const { vibriere } = useApp();
  const [prozent, setProzent] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProzent((p) => (p >= 100 ? 100 : p + 2)), 40);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (prozent === 100) vibriere('erfolg');
    else if (prozent % 10 === 0) vibriere('tick');
  }, [prozent, vibriere]);
  const r = 80;
  const u = 2 * Math.PI * r;
  const zeilen = ['Deine Antworten', 'Deine schwersten Momente', 'Dein Muster'];
  return (
    <Bildschirm>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Leuchten groesse={300} staerke={0.15 + prozent / 400} />
          <Svg width={200} height={200} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={100} cy={100} r={r} stroke={farben.karteRand} strokeWidth={10} fill="none" />
            <Circle cx={100} cy={100} r={r} stroke={farben.akzent} strokeWidth={10} fill="none" strokeDasharray={`${u}`} strokeDashoffset={u * (1 - prozent / 100)} strokeLinecap="round" />
          </Svg>
          <View style={{ position: 'absolute' }}>
            <Txt groesse={42} gewicht="serifFett">{`${prozent}%`}</Txt>
          </View>
        </View>
        <Txt groesse={26} gewicht="serifFett" mitte>
          {prozent < 100 ? 'Ich schaue mir das an' : 'Fertig.'}
        </Txt>
        <View style={{ gap: 8 }}>
          {zeilen.map((t, k) => (
            <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', opacity: prozent > (k + 1) * 30 ? 1 : 0.35 }}>
              <View style={[s.haken, prozent > (k + 1) * 30 && { backgroundColor: farben.akzent, borderColor: farben.akzent }]}>{prozent > (k + 1) * 30 ? <Haken groesse={14} farbe={farben.dunkel} /> : null}</View>
              <Txt groesse={16} gewicht="fett">
                {t}
              </Txt>
            </View>
          ))}
        </View>
      </View>
      <Knopf text="Mein Ergebnis" aus={prozent < 100} onPress={onWeiter} />
    </Bildschirm>
  );
}

// SOS ausprobieren (Pfotenpost-Prinzip): echte Nachricht parken, erster Erfolg in der ersten Minute
function Ausprobieren({ f, onParken, onWeiter }: { f: ReturnType<typeof formen>; onParken: (t: string) => void; onWeiter: () => void }) {
  const { vibriere } = useApp();
  const [text, setText] = useState('');
  const [geparkt, setGeparkt] = useState(false);
  return (
    <Bildschirm>
      <KeyboardAvoidingView style={{ flex: 1, gap: 14 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Titel>{geparkt ? 'Liegt sicher hier.' : `Was würdest du ${f.ihm} gerade schreiben?`}</Titel>
        {geparkt ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Leuchten groesse={280} staerke={0.28} />
            <Einblenden>
              <View style={s.schloss}>
                <Schloss groesse={44} farbe={farben.dunkel} />
              </View>
            </Einblenden>
            <Einblenden verz={200}>
              <Txt groesse={18} gewicht="fett" mitte style={{ paddingHorizontal: 20 }}>
                {`${f.Er} bekommt nichts. Morgen entscheidest du mit klarem Kopf.`}
              </Txt>
            </Einblenden>
            <Einblenden verz={350}>
              <Txt groesse={14} farbe={farben.textHell} mitte>
                Genau so funktioniert dein SOS-Knopf.
              </Txt>
            </Einblenden>
          </View>
        ) : (
          <>
            <Karte stil={{ padding: 16, minHeight: 140 }}>
              <TextInput value={text} onChangeText={setText} multiline placeholder="Ich vermiss dich. Können wir reden?" placeholderTextColor={farben.textHell} style={[s.feld, { minHeight: 110 }]} textAlignVertical="top" />
            </Karte>
            <Txt groesse={14} farbe={farben.textHell}>
              Probier es aus. Die App schickt nie etwas ab.
            </Txt>
            <View style={{ flex: 1 }} />
          </>
        )}
        {geparkt ? (
          <Knopf text="Weiter" onPress={onWeiter} />
        ) : (
          <>
            <Knopf
              text="24 Stunden parken"
              aus={!text.trim()}
              onPress={() => {
                onParken(text.trim());
                vibriere('erfolg');
                setGeparkt(true);
              }}
            />
            <Knopf text="Überspringen" art="leise" onPress={onWeiter} />
          </>
        )}
      </KeyboardAvoidingView>
    </Bildschirm>
  );
}

// Erste Flagge: ein Satz, der wehgetan hat. Erscheint später im SOS in deinen eigenen Worten.
function ErsteFlagge({ onSpeichern, onWeiter }: { onSpeichern: (t: string) => void; onWeiter: () => void }) {
  const { vibriere } = useApp();
  const [text, setText] = useState('');
  const [fertig, setFertig] = useState(false);
  return (
    <Bildschirm>
      <KeyboardAvoidingView style={{ flex: 1, gap: 14 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Titel>{fertig ? 'Deine erste Flagge steht.' : 'Was hat dir zuletzt wehgetan?'}</Titel>
        {fertig ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <Leuchten groesse={280} staerke={0.3} />
            <Einblenden>
              <Figur pose="flagge" groesse={140} />
            </Einblenden>
            <Einblenden verz={250}>
              <Txt groesse={16} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 20 }}>
                Wenn du schwach wirst, zeige ich sie dir. In deinen eigenen Worten.
              </Txt>
            </Einblenden>
          </View>
        ) : (
          <>
            <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: -6 }}>
              Ein Satz reicht.
            </Txt>
            <Karte stil={{ padding: 16, minHeight: 130 }}>
              <TextInput value={text} onChangeText={setText} multiline placeholder="Zum Beispiel: Drei Tage keine Antwort, dann so getan, als wäre nichts." placeholderTextColor={farben.textHell} style={[s.feld, { minHeight: 100 }]} textAlignVertical="top" />
            </Karte>
            <View style={{ flex: 1 }} />
          </>
        )}
        {fertig ? (
          <Knopf text="Weiter" onPress={onWeiter} />
        ) : (
          <>
            <Knopf
              text="Flagge setzen"
              aus={!text.trim()}
              onPress={() => {
                onSpeichern(text.trim());
                vibriere('erfolg');
                setFertig(true);
              }}
            />
            <Knopf text="Später" art="leise" onPress={onWeiter} />
          </>
        )}
      </KeyboardAvoidingView>
    </Bildschirm>
  );
}

function Erinnerung({ onWeiter }: { onWeiter: () => void }) {
  const { setze, vibriere } = useApp();
  const [uhr, setUhr] = useState('21:30');
  const weiter = async (mit: boolean) => {
    if (mit) await erlaubnisAnfragen();
    setze({ erinnerung: mit ? uhr : null });
    onWeiter();
  };
  return (
    <Bildschirm>
      <Titel>Wann ist es am schwersten?</Titel>
      <Txt groesse={15} farbe={farben.textLeise} style={{ marginTop: -6 }}>
        Dann melde ich mich kurz. Die Nachricht verrät nichts.
      </Txt>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Zeitrad uhr={uhr} onWechsel={setUhr} klick={() => vibriere('tick')} stil={{ farbe: farben.text, schrift: schrift.extra, groesse: 34, band: farben.akzentZart, bandRand: farben.akzent }} />
      </View>
      <Karte stil={{ padding: 14, gap: 2 }}>
        <Txt groesse={15} gewicht="extra">
          Kurzer Moment für dich
        </Txt>
        <Txt groesse={14} farbe={farben.textLeise}>
          Wie geht es dir gerade?
        </Txt>
      </Karte>
      <Knopf text="Erinnerung einschalten" onPress={() => weiter(true)} />
      <Knopf text="Lieber ohne" art="leise" onPress={() => weiter(false)} />
    </Bildschirm>
  );
}

// Harte Paywall (nur Optik bis RevenueCat): baut sich Stück für Stück auf, persönlicher Titel aus dem Quiz,
// kleine Feature-Karten, Zeitleiste Heute/Tag 5/Tag 7, Jahr und Monat immer nebeneinander, Figur guckt hinter der Jahreskarte vor.
function Paywall({ onFertig }: { onFertig: () => void }) {
  const { z, vibriere } = useApp();
  const [plan, setPlan] = useState<'jahr' | 'monat'>('jahr');
  const [hinweis, setHinweis] = useState(false);
  // Kleine iPhones (375 x 667): Knäuel und Abstände kleiner, damit nichts über der Zeitleiste liegt (Raoul 24.11.2026)
  const klein = useWindowDimensions().height < 740;
  const titel = z.phase === 'getrennt' ? `Dein Weg raus.\nIn ${z.ziel} Tagen.` : `Wieder klar sehen.\nIn ${z.ziel} Tagen.`;
  const zeit = [
    { fett: 'Heute', text: 'Alles frei. Dein Weg startet.' },
    { fett: `Tag ${ERINNERUNG_TAG}`, text: 'Wir erinnern dich.' },
    { fett: `Tag ${GRATIS_TAGE}`, text: 'Abo startet, jederzeit kündbar.' },
  ];
  return (
    <Bildschirm stil={{ gap: 12 }}>
      <Einblenden>
        <Txt groesse={klein ? 27 : 32} gewicht="serifFett" mitte>
          {titel}
        </Txt>
      </Einblenden>
      <Einblenden verz={150} stil={s.chipsMitte}>
        {['SOS', 'Kontaktpause', 'Flaggen', 'Muster'].map((t) => (
          <View key={t} style={s.mini}>
            <Txt groesse={13} gewicht="extra">
              {t}
            </Txt>
          </View>
        ))}
      </Einblenden>
      <Einblenden verz={300} stil={{ alignSelf: 'center', width: '82%', gap: klein ? 6 : 12, marginTop: klein ? 0 : 6 }}>
        {zeit.map((p, k) => (
          <View key={p.fett} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[s.zeitPunkt, k === 0 && { backgroundColor: farben.akzent, boxShadow: schatten.leuchten }]} />
            <View>
              <Txt groesse={16} gewicht="extra">
                {p.fett}
              </Txt>
              <Txt groesse={14} farbe={farben.textLeise}>
                {p.text}
              </Txt>
            </View>
          </View>
        ))}
      </Einblenden>
      <View style={{ flex: 1 }} />
      <Einblenden verz={480} stil={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', right: 12, top: klein ? -50 : -104, zIndex: 0 }}>
            <Figur pose={'winken' as Pose} groesse={klein ? 50 : 100} />
          </View>
          {/* Raoul 24.11.2026 (nachmittags): beide Abos immer sichtbar, Jahresabo mit Jahrespreis und "jährlich abgerechnet" */}
          <PlanKarte an={plan === 'jahr'} marke={`${GRATIS_TAGE} Tage gratis`} titel="Jahresabo" preis={PREIS_JAHR} unter={`jährlich abgerechnet\nnur ${PREIS_JAHR_PRO_MONAT} im Monat`} onPress={() => setPlan('jahr')} />
        </View>
        <View style={{ flex: 1 }}>
          <PlanKarte an={plan === 'monat'} titel="Monatsabo" preis={PREIS_MONAT} unter="monatlich abgerechnet" onPress={() => setPlan('monat')} />
        </View>
      </Einblenden>
      {hinweis ? (
        <Txt groesse={13} farbe={farben.akzent} mitte>
          Echte Käufe kommen später. Zum Testen: Weiter (Test).
        </Txt>
      ) : null}
      <Einblenden verz={600}>
        <Knopf text={plan === 'jahr' ? `${GRATIS_TAGE} Tage gratis testen` : 'Monatlich starten'} onPress={() => setHinweis(true)} />
      </Einblenden>
      <Txt groesse={13} gewicht="extra" farbe={farben.textLeise} mitte style={{ marginTop: -4 }}>
        {plan === 'jahr' ? `Heute 0 €, ab Tag ${GRATIS_TAGE + 1} ${PREIS_JAHR} pro Jahr. Jederzeit kündbar.` : 'Jederzeit kündbar.'}
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt groesse={12} farbe={farben.textHell}>
          Wiederherstellen · Bedingungen
        </Txt>
        <Pressable
          onPress={() => {
            vibriere('mittel');
            onFertig();
          }}
          hitSlop={12}
          accessibilityRole="button"
        >
          <Txt groesse={14} gewicht="extra" farbe={farben.akzent}>
            Weiter (Test)
          </Txt>
        </Pressable>
      </View>
    </Bildschirm>
  );
}

function PlanKarte({ an, titel, preis, unter, marke, onPress }: { an: boolean; titel: string; preis: string; unter: string; marke?: string; onPress: () => void }) {
  const feder = useFeder();
  return (
    <Animated.View style={feder.stil}>
      <Pressable
        onPressIn={feder.rein}
        onPressOut={feder.raus}
        onPress={() => {
          feder.vibriere('mittel');
          onPress();
        }}
        accessibilityRole="radio"
        accessibilityState={{ selected: an }}
        style={[s.plan, an && s.planAn]}
      >
        <Txt groesse={12} gewicht="extra" farbe={farben.akzent} mitte>
          {marke ?? ' '}
        </Txt>
        <Txt groesse={16} gewicht="fett" mitte>
          {titel}
        </Txt>
        <Txt groesse={24} gewicht="extra" mitte>
          {preis}
        </Txt>
        <Txt groesse={12} farbe={farben.textHell} mitte>
          {unter}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  feld: { fontFamily: schrift.halbfett, fontSize: 17, lineHeight: 25, color: farben.text, paddingVertical: 12, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chipsMitte: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  bento: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 8 },
  karte: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16, paddingHorizontal: 16, borderRadius: 22, backgroundColor: farben.karte, borderWidth: 1.5, borderColor: farben.karteRand },
  karteAn: { borderColor: farben.akzent, boxShadow: schatten.leuchten },
  icon: { width: 46, height: 46, borderRadius: 23, backgroundColor: farben.feld, alignItems: 'center', justifyContent: 'center' },
  haken: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: farben.karteRand, alignItems: 'center', justifyContent: 'center' },
  punkt: { width: 16, height: 16, borderRadius: 8, backgroundColor: farben.karteRand, marginTop: 4 },
  schloss: { width: 96, height: 96, borderRadius: 48, backgroundColor: farben.akzent, alignItems: 'center', justifyContent: 'center', boxShadow: schatten.knopf },
  mini: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand },
  zeitPunkt: { width: 14, height: 14, borderRadius: 7, backgroundColor: farben.textHell, marginTop: 4 },
  plan: { borderRadius: 20, paddingVertical: 16, paddingHorizontal: 8, gap: 2, backgroundColor: farben.karte, borderWidth: 2, borderColor: farben.karteRand },
  planAn: { borderColor: farben.akzent, boxShadow: schatten.leuchten },
});
