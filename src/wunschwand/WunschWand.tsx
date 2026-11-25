// Wunsch-Wand (Raoul 25.11.2026): Nutzer schlagen Funktionen vor und stimmen für Wünsche anderer.
// Gleiche Datei in allen Apps. Farben, Schrift, Knopf und Haptik kommen aus look.tsx der jeweiligen App.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { abstimmen, Fehler, Wunsch, wuenscheLaden, wunschSchicken } from './api';
import { APP_NAME, haptik, useLook, WKnopf, WText } from './look';

const MAX = 200;

function Pfeil({ farbe, groesse = 18 }: { farbe: string; groesse?: number }) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M5 15.5 L12 8.5 L19 15.5" stroke={farbe} strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function Stimme({ w, onPress }: { w: Wunsch; onPress: () => void }) {
  const LOOK = useLook();
  const an = w.gestimmt;
  const aus = w.status !== 'frei';
  return (
    <Pressable
      onPress={onPress}
      disabled={aus}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={an ? 'Stimme zurücknehmen' : 'Dafür stimmen'}
      style={({ pressed }) => [
        s.stimme,
        { backgroundColor: an ? LOOK.akzent : LOOK.feld, borderColor: an ? LOOK.akzent : LOOK.rand, opacity: aus ? 0.55 : 1, transform: [{ scale: pressed ? 0.92 : 1 }] },
      ]}
    >
      <Pfeil farbe={an ? LOOK.aufAkzent : LOOK.text} />
      <WText rolle="fett" farbe={an ? LOOK.aufAkzent : LOOK.text}>
        {w.stimmen}
      </WText>
    </Pressable>
  );
}

const FEHLER_TEXT: Record<Fehler, string> = {
  netz: 'Gerade keine Verbindung. Versuch es gleich nochmal.',
  limit: 'Für heute ist genug gewünscht. Morgen geht wieder was.',
  laenge: 'Schreib deinen Wunsch in 3 bis 200 Zeichen.',
};

export function WunschWand() {
  const LOOK = useLook();
  const [liste, setListe] = useState<Wunsch[] | null>(null);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState<Fehler | null>(null);
  const [text, setText] = useState('');
  const [schickt, setSchickt] = useState(false);
  const [danke, setDanke] = useState(false);

  const holen = useCallback(async () => {
    setLaden(true);
    setFehler(null);
    try {
      setListe(await wuenscheLaden());
    } catch (e) {
      setFehler(e as Fehler);
    } finally {
      setLaden(false);
    }
  }, []);
  useEffect(() => {
    holen();
  }, [holen]);

  async function schicken() {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length < 3 || schickt) return;
    haptik('mittel');
    setSchickt(true);
    setFehler(null);
    try {
      const w = await wunschSchicken(t);
      setListe((l) => [...(l ?? []), w]);
      setText('');
      setDanke(true);
      haptik('erfolg');
    } catch (e) {
      setFehler(e as Fehler);
    } finally {
      setSchickt(false);
    }
  }

  async function stimmen(w: Wunsch) {
    haptik('leicht');
    const vorher = liste;
    const neu = { gestimmt: !w.gestimmt, stimmen: w.stimmen + (w.gestimmt ? -1 : 1) };
    setListe((l) => (l ?? []).map((x) => (x.id === w.id ? { ...x, ...neu } : x)));
    try {
      const r = await abstimmen(w.id);
      setListe((l) => (l ?? []).map((x) => (x.id === w.id ? { ...x, ...r } : x)));
    } catch (e) {
      setListe(vorher);
      setFehler(e as Fehler);
    }
  }

  const eigeneNeu = (liste ?? []).filter((w) => w.status === 'neu');
  const offen = (liste ?? []).filter((w) => w.status === 'frei').sort((a, b) => b.stimmen - a.stimmen);
  const erledigt = (liste ?? []).filter((w) => w.status === 'erledigt');
  const kurz = text.trim().length < 3;

  return (
    <View style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <WText rolle="titel">Wunsch-Wand</WText>
        <WText rolle="leise">Was soll {APP_NAME} noch können? Wünsch dir etwas oder stimm für die Ideen anderer. Die beliebtesten bauen wir zuerst.</WText>
      </View>

      <View style={[s.karte, { backgroundColor: LOOK.karte, borderColor: LOOK.rand }]}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t.slice(0, MAX));
            setDanke(false);
          }}
          placeholder="Ich wünsche mir ..."
          placeholderTextColor={LOOK.leise}
          multiline
          maxLength={MAX}
          style={[s.eingabe, { backgroundColor: LOOK.feld, color: LOOK.text, fontFamily: LOOK.schrift, borderColor: LOOK.rand }]}
        />
        <WText rolle="klein">
          {danke ? 'Danke! Dein Wunsch hängt an der Wand, sobald wir ihn kurz angesehen haben.' : `${text.length} von ${MAX} Zeichen`}
        </WText>
        <WKnopf text={schickt ? 'Wird geschickt ...' : 'An die Wand hängen'} aus={kurz || schickt} onPress={schicken} />
      </View>

      {fehler ? (
        <View style={[s.karte, { backgroundColor: LOOK.karte, borderColor: LOOK.rand }]}>
          <WText rolle="text">{FEHLER_TEXT[fehler]}</WText>
          {fehler === 'netz' && !liste ? <WKnopf text="Nochmal versuchen" leise onPress={holen} /> : null}
        </View>
      ) : null}

      {laden && !liste ? <ActivityIndicator color={LOOK.akzent} style={{ marginTop: 20 }} /> : null}

      {eigeneNeu.length ? (
        <View style={{ gap: 8 }}>
          <WText rolle="fett">Deine neuen Wünsche</WText>
          {eigeneNeu.map((w) => (
            <View key={w.id} style={[s.zeile, { backgroundColor: LOOK.karte, borderColor: LOOK.rand }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <WText rolle="text">{w.text}</WText>
                <WText rolle="klein">Wartet auf Freigabe</WText>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {liste ? (
        <View style={{ gap: 8 }}>
          <WText rolle="fett">Beliebteste Wünsche</WText>
          {offen.length === 0 ? <WText rolle="leise">Noch hängt hier nichts. Dein Wunsch kann der erste sein.</WText> : null}
          {offen.map((w) => (
            <View key={w.id} style={[s.zeile, { backgroundColor: LOOK.karte, borderColor: LOOK.rand }]}>
              <View style={{ flex: 1 }}>
                <WText rolle="text">{w.text}</WText>
              </View>
              <Stimme w={w} onPress={() => stimmen(w)} />
            </View>
          ))}
        </View>
      ) : null}

      {erledigt.length ? (
        <View style={{ gap: 8 }}>
          <WText rolle="fett">Schon eingebaut</WText>
          {erledigt.map((w) => (
            <View key={w.id} style={[s.zeile, { backgroundColor: LOOK.karte, borderColor: LOOK.rand, opacity: 0.8 }]}>
              <View style={{ flex: 1 }}>
                <WText rolle="text">{w.text}</WText>
              </View>
              <Stimme w={w} onPress={() => {}} />
            </View>
          ))}
        </View>
      ) : null}

      <WText rolle="klein">Bitte keine Namen oder privaten Dinge. Wünsche erscheinen ohne Namen und erst nach einer kurzen Prüfung.</WText>
    </View>
  );
}

const s = StyleSheet.create({
  karte: { borderRadius: 20, padding: 14, gap: 10, borderWidth: 1 },
  eingabe: { minHeight: 84, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, fontSize: 16, textAlignVertical: 'top' },
  zeile: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, borderWidth: 1, paddingVertical: 12, paddingLeft: 14, paddingRight: 10 },
  stimme: { width: 56, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 0 },
});
