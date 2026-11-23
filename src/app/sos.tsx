import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { planeGeparkt } from '@/benachrichtigung';
import { Figur, KleineFlagge } from '@/components/Figur';
import { Leuchten, SOS_LICHT } from '@/components/Licht';
import { Kreuz } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Einblenden, HilfeKarte, Karte, Knopf, Rueckfrage } from '@/components/ui';
import { kategorieKurz } from '@/data/kategorien';
import { kalenderTage } from '@/data/muster';
import { formen } from '@/data/person';
import { FRAGEN, liste } from '@/data/quiz';
import { berechne, useApp } from '@/state/store';
import { farben, schrift, verlaeufe } from '@/theme';

// SOS "Ich will ihm schreiben" (Kernmoment, wie das Drang-Duell bei Drangduell):
// 1. Schreib's hier statt ihm. 2. Deine eigenen roten Flaggen erscheinen, die Schattenfigur verblasst.
// 3. Atemrunde. 4. Die Nachricht ist 24 Stunden geparkt. Die App schickt nie etwas ab.
type Schritt = 'schreiben' | 'flaggen' | 'atmen' | 'fertig';
const nativ = Platform.OS !== 'web';

export default function Sos() {
  const { z, parken, vibriere, sosGeschafftZaehlen, kontaktGehabt } = useApp();
  const f = formen(z.person);
  const [schritt, setSchritt] = useState<Schritt>('schreiben');
  const [text, setText] = useState('');
  const [frage, setFrage] = useState(false);
  const [bis, setBis] = useState<number | null>(null);

  // Deine Flaggen: die letzten Einträge in deinen eigenen Worten. Ohne Einträge: was du im Quiz angetippt hast.
  const eigene = z.eintraege.slice(0, 3).map((e) => ({ text: e.text || e.kategorien.map(kategorieKurz).join(', '), wann: kalenderTage(e.zeit) }));
  const kennst = FRAGEN.find((q) => q.id === 'kennst');
  const ausQuiz = kennst && kennst.art === 'chips' ? liste(z.quiz, 'kennst').slice(0, 3).map((id) => kennst.optionen.find((o) => o.id === id)?.text(f) ?? '') : [];
  const flaggen = eigene.length ? eigene : ausQuiz.filter(Boolean).map((t) => ({ text: t, wann: -1 }));

  const schliessen = () => (router.canGoBack() ? router.back() : router.replace('/heute'));

  const kopf = (
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <Pressable onPress={schliessen} hitSlop={12} style={s.zu} accessibilityRole="button" accessibilityLabel="Schließen">
        <Kreuz farbe={farben.text} />
      </Pressable>
    </View>
  );

  if (schritt === 'schreiben') {
    return (
      <Bildschirm verlauf={verlaeufe.sos} licht={SOS_LICHT}>
        <KeyboardAvoidingView style={{ flex: 1, gap: 14 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {kopf}
          <Einblenden>
            <Txt groesse={34} gewicht="serifFett" mitte>
              {`Schreib's hier.\nNicht ${f.ihm}.`}
            </Txt>
          </Einblenden>
          <Karte stil={{ flex: 1, padding: 18, minHeight: 150, maxHeight: 260 }}>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              autoFocus={Platform.OS !== 'web'}
              placeholder="Ich weiß, ich sollte nicht schreiben, aber ..."
              placeholderTextColor={farben.textHell}
              style={s.feld}
              textAlignVertical="top"
            />
          </Karte>
          <Txt groesse={14} farbe={farben.textHell} mitte>
            {`${f.Er} bekommt davon nichts. Versprochen.`}
          </Txt>
          <View style={{ flex: 1 }} />
          <Knopf
            text="Weiter"
            onPress={() => {
              vibriere('mittel');
              setSchritt('flaggen');
            }}
          />
          <Pressable onPress={() => setFrage(true)} style={{ alignSelf: 'center', padding: 6 }} accessibilityRole="button">
            <Txt groesse={14} gewicht="fett" farbe={farben.textHell}>
              Ich habe schon geschrieben
            </Txt>
          </Pressable>
        </KeyboardAvoidingView>
        <Rueckfrage
          sichtbar={frage}
          titel="Das passiert. Kein Drama."
          text="Du bist nicht schwach. Wir fangen sanft neu an, alle Flaggen und deine längste Pause bleiben."
          ja="Sanft neu anfangen"
          onJa={() => {
            setFrage(false);
            if (berechne(z).kontakt) kontaktGehabt();
            schliessen();
          }}
          onNein={() => setFrage(false)}
        />
      </Bildschirm>
    );
  }

  if (schritt === 'flaggen') {
    return (
      <Bildschirm verlauf={verlaeufe.sos} licht={SOS_LICHT}>
        {kopf}
        <Einblenden>
          <Txt groesse={30} gewicht="serifFett" mitte>
            Erinnerst du dich?
          </Txt>
        </Einblenden>
        <View style={{ alignItems: 'center', height: 130, justifyContent: 'center' }}>
          <Verblassen />
        </View>
        <View style={{ gap: 10 }}>
          {flaggen.length ? (
            flaggen.map((fl, i) => (
              <Einblenden key={i} verz={500 + i * 650}>
                <Karte stil={{ flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' }}>
                  <KleineFlagge groesse={18} />
                  <Txt groesse={16} gewicht="fett" style={{ flex: 1 }} numberOfLines={3}>
                    {fl.text}
                  </Txt>
                </Karte>
              </Einblenden>
            ))
          ) : (
            <Karte stil={{ padding: 16 }}>
              <Txt groesse={16} gewicht="fett">
                Noch keine Flaggen. Halte fest, was dir wehtut, dann zeige ich es dir genau hier.
              </Txt>
            </Karte>
          )}
          {flaggen.length ? (
            <Einblenden verz={500 + flaggen.length * 650}>
              <Txt groesse={14} farbe={farben.textHell} mitte>
                {eigene.length ? 'Deine eigenen Worte.' : 'Das hast du selbst angetippt.'}
              </Txt>
            </Einblenden>
          ) : null}
        </View>
        <View style={{ flex: 1 }} />
        <Knopf
          text={text.trim() ? '24 Stunden parken' : 'Weiter'}
          onPress={() => {
            if (text.trim()) {
              const g = parken(text.trim());
              planeGeparkt(g.id, g.bis);
              setBis(g.bis);
            }
            vibriere('mittel');
            setSchritt('atmen');
          }}
        />
      </Bildschirm>
    );
  }

  if (schritt === 'atmen') {
    return (
      <Bildschirm verlauf={verlaeufe.sos} licht={SOS_LICHT}>
        {kopf}
        <Atmen
          onFertig={() => {
            vibriere('erfolg');
            sosGeschafftZaehlen();
            setSchritt('fertig');
          }}
        />
      </Bildschirm>
    );
  }

  const uhr = bis ? `${String(new Date(bis).getHours()).padStart(2, '0')}:${String(new Date(bis).getMinutes()).padStart(2, '0')}` : null;
  return (
    <Bildschirm verlauf={verlaeufe.sos} licht={SOS_LICHT}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <Leuchten groesse={320} staerke={0.3} farbe={farben.morgen} />
        <Figur pose="flagge" groesse={130} />
        <Einblenden verz={150}>
          <Txt groesse={34} gewicht="serifFett" mitte>
            Du bist bei dir geblieben.
          </Txt>
        </Einblenden>
        <Einblenden verz={300}>
          <Txt groesse={16} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 16 }}>
            {uhr ? `Deine Nachricht liegt sicher hier bis morgen, ${uhr} Uhr. Dann entscheidest du mit klarem Kopf.` : 'Der schwerste Moment ist vorbei. Er kommt wieder, und du weißt jetzt, was hilft.'}
          </Txt>
        </Einblenden>
        <Einblenden verz={450}>
          <Txt groesse={15} gewicht="extra" farbe={farben.akzent} mitte>
            {z.sosGeschafft === 1 ? 'Dein erster SOS-Moment geschafft' : `${z.sosGeschafft} SOS-Momente geschafft`}
          </Txt>
        </Einblenden>
      </View>
      {flaggen.length === 0 ? <HilfeKarte kurz titel="Hast du Angst oder wirst bedroht?" /> : null}
      <Knopf text="Fertig" onPress={schliessen} />
    </Bildschirm>
  );
}

// Die Schattenfigur verblasst und schrumpft, während deine Flaggen erscheinen
function Verblassen() {
  const a = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: 0.15, duration: 3200, easing: Easing.inOut(Easing.cubic), useNativeDriver: nativ }).start();
  }, [a]);
  return (
    <Animated.View style={{ opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0.15, 1], outputRange: [0.7, 1] }) }] }}>
      <Figur art="schatten" pose="handy" groesse={96} />
    </Animated.View>
  );
}

// Atemrunde: Ein 4, Halten 2, Aus 6. Drei Runden, dann geht es weiter. Der Knopf ist immer sichtbar.
const PHASEN = [
  { name: 'Einatmen', s: 4, ziel: 1 },
  { name: 'Halten', s: 2, ziel: 1 },
  { name: 'Ausatmen', s: 6, ziel: 0 },
];
const RUNDEN = 3;

function Atmen({ onFertig }: { onFertig: () => void }) {
  const { vibriere } = useApp();
  const kreis = useRef(new Animated.Value(0)).current;
  const [phase, setPhase] = useState(0);
  const [runde, setRunde] = useState(1);
  const [fertig, setFertig] = useState(false);
  useEffect(() => {
    if (fertig) return;
    const p = PHASEN[phase];
    vibriere('tick');
    Animated.timing(kreis, { toValue: p.ziel, duration: p.s * 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: nativ }).start();
    const t = setTimeout(() => {
      if (phase < PHASEN.length - 1) setPhase(phase + 1);
      else if (runde < RUNDEN) {
        setRunde(runde + 1);
        setPhase(0);
      } else setFertig(true);
    }, p.s * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, runde, fertig]);
  return (
    <View style={{ flex: 1, gap: 18 }}>
      <Txt groesse={30} gewicht="serifFett" mitte>
        Atme mit.
      </Txt>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Leuchten groesse={330} staerke={0.32} />
        <Animated.View style={{ width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: farben.akzent, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 0px 40px rgba(255,122,99,0.5)', transform: [{ scale: kreis.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }) }] }}>
          <Figur pose="atmen" groesse={96} />
        </Animated.View>
      </View>
      <Txt groesse={24} gewicht="serif" mitte>
        {fertig ? 'Gut gemacht.' : PHASEN[phase].name}
      </Txt>
      <Txt groesse={14} farbe={farben.textHell} mitte>
        {fertig ? 'Spürst du den Unterschied?' : `Runde ${runde} von ${RUNDEN}`}
      </Txt>
      <Knopf text={fertig ? 'Weiter' : 'Überspringen'} art={fertig ? 'voll' : 'glas'} onPress={onFertig} />
    </View>
  );
}

const s = StyleSheet.create({
  zu: { width: 44, height: 44, borderRadius: 22, backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand, alignItems: 'center', justifyContent: 'center' },
  feld: { flex: 1, fontFamily: schrift.halbfett, fontSize: 18, lineHeight: 26, color: farben.text, outlineStyle: 'none' } as object,
});
