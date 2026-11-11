import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Sprechknopf } from '@/components/Sprechknopf';
import { Haken, Kreuz } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Chip, Einblenden, HilfeKarte, Karte, Knopf, Marke, NurAufDemHandy } from '@/components/ui';
import { gefuehle, KategorieId, kategorieKurz, kategorien } from '@/data/kategorien';
import { datumText, erkannteMuster } from '@/data/muster';
import { quizSchwerpunkte } from '@/data/quiz';
import { ordneEin } from '@/ki/einordnenKI';
import { spracheVerfuegbar, starteZuhoeren, stoppeZuhoeren } from '@/sprache';
import { Eintrag, useApp } from '@/state/store';
import { farben, schrift, verlaeufe } from '@/theme';

// Geführter Eintrag: 1. Was ist passiert? (sprechen oder tippen) 2. Wie ging's dir danach? 3. Was davon trifft zu? 4. Festgehalten.
// Ein Bildschirm, eine Frage. Das Datum kommt automatisch.

type Schritt = 'erzaehlen' | 'gefuehl' | 'kategorie' | 'fertig';

export default function NeuerEintrag() {
  const { sprechen, tippen } = useLocalSearchParams<{ sprechen?: string; tippen?: string }>();
  const { z, eintragSpeichern, vibriere } = useApp();
  const [schritt, setSchritt] = useState<Schritt>('erzaehlen');
  const [text, setText] = useState('');
  const [liveText, setLiveText] = useState('');
  const [hoert, setHoert] = useState(false);
  const [gewaehltGefuehle, setGefuehle] = useState<string[]>([]);
  const [gewaehltKat, setKat] = useState<KategorieId[]>([]);
  const [gespeichert, setGespeichert] = useState<{ eintrag: Eintrag; muster: { id: KategorieId; anzahl: number } | null; nummer: number } | null>(null);
  const kannSprechen = useRef(spracheVerfuegbar()).current;
  const feld = useRef<TextInput>(null);
  const [jetzt] = useState(Date.now());

  const sprechenStart = async () => {
    setLiveText('');
    setHoert(true);
    const ok = await starteZuhoeren(setLiveText, (fertig) => {
      setHoert(false);
      setLiveText('');
      if (fertig) setText((alt) => (alt ? `${alt.trim()} ${fertig}` : fertig));
    });
    if (!ok) {
      setHoert(false);
      feld.current?.focus();
    }
  };

  // Vom großen Knopf kommend gleich zuhören, vom "Lieber tippen" gleich die Tastatur öffnen
  useEffect(() => {
    if (sprechen && kannSprechen) sprechenStart();
    else if (tippen || (sprechen && !kannSprechen)) setTimeout(() => feld.current?.focus(), 350);
    return () => stoppeZuhoeren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const umschalten = <T,>(liste: T[], wert: T) => (liste.includes(wert) ? liste.filter((x) => x !== wert) : [...liste, wert]);

  const speichern = () => {
    const eintrag = eintragSpeichern({ text: text.trim(), gefuehle: gewaehltGefuehle, kategorien: gewaehltKat });
    const alle = [eintrag, ...z.eintraege];
    const muster = erkannteMuster(alle).find((m) => gewaehltKat.includes(m.id)) ?? null;
    setGespeichert({ eintrag, muster, nummer: alle.length });
    // KI-Einordnung: im MVP aus (Platzhalter, ruft keinen Server an)
    ordneEin(eintrag.text, eintrag.kategorien).catch(() => null);
    vibriere('erfolg');
    setSchritt('fertig');
  };

  const kopf = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Marke text={schritt === 'fertig' ? 'Gespeichert' : 'Neuer Eintrag'} />
        <Txt groesse={13} farbe={farben.textLeise}>
          {datumText(gespeichert?.eintrag.zeit ?? jetzt)}
        </Txt>
      </View>
      {schritt !== 'fertig' ? (
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.zu} accessibilityRole="button" accessibilityLabel="Schließen">
          <Kreuz />
        </Pressable>
      ) : null}
    </View>
  );

  if (schritt === 'erzaehlen') {
    const anzeige = hoert ? [text, liveText].filter(Boolean).join(' ') : text;
    return (
      <Bildschirm verlauf={verlaeufe.tagebuch}>
        <KeyboardAvoidingView style={{ flex: 1, gap: 14 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {kopf}
          <Txt groesse={28} gewicht="serifFett">
            Was ist passiert?
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise}>
            Erzähl es so, wie du es erlebt hast. Niemand bewertet dich hier.
          </Txt>
          {kannSprechen ? (
            <View style={{ alignItems: 'center', marginVertical: -8 }}>
              <Sprechknopf hoert={hoert} onStart={sprechenStart} onEnde={stoppeZuhoeren} />
              <Txt groesse={14} gewicht="fett" farbe={hoert ? farben.akzent : farben.textLeise} style={{ marginTop: -10 }}>
                {hoert ? 'Ich höre zu. Tippen, wenn du fertig bist.' : 'Antippen und erzählen'}
              </Txt>
            </View>
          ) : (
            <Txt groesse={13} farbe={farben.textLeise}>
              Sprechen geht in dieser Version noch nicht. Schreib einfach los.
            </Txt>
          )}
          <Karte stil={{ flex: 1, padding: 16, minHeight: 140 }}>
            <TextInput
              ref={feld}
              value={anzeige}
              onChangeText={setText}
              editable={!hoert}
              multiline
              placeholder="Zum Beispiel: Er hat meine Nachricht gelesen und zwei Tage nicht geantwortet."
              placeholderTextColor={farben.textHell}
              style={s.feld}
              textAlignVertical="top"
            />
          </Karte>
          <Knopf
            text="Weiter"
            aus={!text.trim() || hoert}
            onPress={() => {
              stoppeZuhoeren();
              setSchritt('gefuehl');
            }}
          />
          <NurAufDemHandy text="Bleibt nur auf deinem Handy." />
        </KeyboardAvoidingView>
      </Bildschirm>
    );
  }

  if (schritt === 'gefuehl') {
    return (
      <Bildschirm verlauf={verlaeufe.tagebuch}>
        {kopf}
        <Einblenden>
          <Txt groesse={28} gewicht="serifFett">
            Wie ging's dir danach?
          </Txt>
        </Einblenden>
        <Txt groesse={15} farbe={farben.textLeise}>
          Tipp alles an, was passt.
        </Txt>
        <Einblenden verz={120} stil={s.chips}>
          {gefuehle.map((g) => (
            <Chip key={g} text={g} an={gewaehltGefuehle.includes(g)} onPress={() => setGefuehle((alt) => umschalten(alt, g))} />
          ))}
        </Einblenden>
        <View style={{ flex: 1 }} />
        <Knopf text="Weiter" onPress={() => setSchritt('kategorie')} />
        <Knopf text="Zurück" art="leise" onPress={() => setSchritt('erzaehlen')} />
      </Bildschirm>
    );
  }

  if (schritt === 'kategorie') {
    // Was im Quiz am stärksten vorkam, steht vorne
    const vorne = quizSchwerpunkte(z.quiz);
    const sortiert = [...kategorien].sort((a, b) => (vorne.includes(b.id) ? 1 : 0) - (vorne.includes(a.id) ? 1 : 0));
    return (
      <Bildschirm verlauf={verlaeufe.tagebuch}>
        {kopf}
        <Einblenden>
          <Txt groesse={28} gewicht="serifFett">
            Was davon trifft zu?
          </Txt>
        </Einblenden>
        <Txt groesse={15} farbe={farben.textLeise}>
          Daraus entstehen später deine Muster.
        </Txt>
        <Einblenden verz={120} stil={s.chips}>
          {sortiert.map((k) => (
            <Chip key={k.id} text={k.name} an={gewaehltKat.includes(k.id)} onPress={() => setKat((alt) => umschalten(alt, k.id))} />
          ))}
        </Einblenden>
        <View style={{ flex: 1 }} />
        <Knopf text="Festhalten" onPress={speichern} />
        <Knopf text="Zurück" art="leise" onPress={() => setSchritt('gefuehl')} />
      </Bildschirm>
    );
  }

  return <Fertig gespeichert={gespeichert} kopf={kopf} />;
}

function Fertig({ gespeichert, kopf }: { gespeichert: { eintrag: Eintrag; muster: { id: KategorieId; anzahl: number } | null; nummer: number } | null; kopf: React.ReactNode }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(a, { toValue: 1, useNativeDriver: Platform.OS !== 'web', speed: 10, bounciness: 14 }).start();
  }, [a]);
  if (!gespeichert) return null;
  const { eintrag, muster, nummer } = gespeichert;
  const bedroht = eintrag.kategorien.includes('bedroht');
  return (
    <Bildschirm verlauf={verlaeufe.muster}>
      {kopf}
      <View style={{ alignItems: 'center', gap: 12, marginTop: 20 }}>
        <Animated.View style={[s.haken, { transform: [{ scale: a }] }]}>
          <Haken groesse={44} />
        </Animated.View>
        <Einblenden verz={200}>
          <Txt groesse={32} gewicht="serifFett" mitte>
            Festgehalten.
          </Txt>
        </Einblenden>
        <Einblenden verz={320}>
          <Txt groesse={16} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 20 }}>
            {nummer === 1 ? 'Dein erster Eintrag. Ab jetzt zählt, was wirklich passiert ist.' : `Eintrag Nr. ${nummer}. Jeder Eintrag macht das Bild klarer.`}
          </Txt>
        </Einblenden>
      </View>
      {muster ? (
        <Einblenden verz={480}>
          <Karte verlauf={farben.musterVerlauf} stil={{ gap: 4 }}>
            <Txt groesse={12} gewicht="extra" style={{ letterSpacing: 1 }}>
              MUSTER DER LETZTEN 4 WOCHEN
            </Txt>
            <Txt groesse={19} gewicht="serif">
              {muster.anzahl} Mal "{kategorieKurz(muster.id)}". Du bildest dir das nicht ein.
            </Txt>
          </Karte>
        </Einblenden>
      ) : null}
      {bedroht ? (
        <Einblenden verz={560}>
          <HilfeKarte kurz titel="Das ist nicht in Ordnung. Du verdienst Schutz." />
        </Einblenden>
      ) : null}
      <View style={{ flex: 1 }} />
      <Knopf text="Fertig" onPress={() => router.back()} />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  zu: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  feld: { flex: 1, fontFamily: schrift.halbfett, fontSize: 17, lineHeight: 25, color: farben.text, outlineStyle: 'none' } as object,
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  haken: { width: 92, height: 92, borderRadius: 46, backgroundColor: farben.akzent, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 12px 28px rgba(184,70,60,0.3)' },
});
