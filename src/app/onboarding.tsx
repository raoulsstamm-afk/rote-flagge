import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { erlaubnisAnfragen } from '@/benachrichtigung';
import { Flagge, Haken, Zurueck } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Chip, Einblenden, HilfeKarte, Karte, Knopf, Leiste, Marke, NurAufDemHandy, useFeder } from '@/components/ui';
import { kategorieKurz } from '@/data/kategorien';
import { ERINNERUNG_TAG, GRATIS_TAGE, PREIS_JAHR, PREIS_MONAT } from '@/data/preise';
import { Antwort, antwortTexte, ergebnisText, quizAussagen, quizSchwerpunkte, quizTreffer } from '@/data/quiz';
import { useApp } from '@/state/store';
import { farben, verlaeufe } from '@/theme';

// Onboarding: Start, Quiz "Ist das noch normal?", Ergebnis, persönlicher Plan, Erinnerung, harte Paywall.
// Regel: Jeder Schritt passt ohne Scrollen auf 390 x 844. Kein Auto-Weiter außer bei Quiz-Antworten.

type Schritt = 'start' | 'quiz' | 'ergebnis' | 'plan' | 'erinnerung' | 'paywall';
const UHRZEITEN = ['08:00', '12:00', '18:00', '20:00', '21:00', '22:00'];

export default function Onboarding() {
  const { z, setze, vibriere } = useApp();
  const [schritt, setSchritt] = useState<Schritt>('start');
  const [frage, setFrage] = useState(0);
  const [gewaehlt, setGewaehlt] = useState<Antwort | null>(null);
  const [uhrzeit, setUhrzeit] = useState('20:00');
  const [plan, setPlan] = useState<'jahr' | 'monat'>('jahr');
  const [kaufHinweis, setKaufHinweis] = useState(false);

  const treffer = quizTreffer(z.quiz);
  const schwerpunkte = quizSchwerpunkte(z.quiz);

  if (schritt === 'start') {
    return (
      <Bildschirm verlauf={verlaeufe.start}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <Einblenden>
            <View style={s.flaggeKreis}>
              <Flagge groesse={72} />
            </View>
          </Einblenden>
          <Einblenden verz={150}>
            <Txt groesse={40} gewicht="serifFett" mitte>
              Rote Flagge
            </Txt>
          </Einblenden>
          <Einblenden verz={300}>
            <Txt groesse={19} gewicht="serif" mitte style={{ paddingHorizontal: 12 }}>
              Halte fest, was passiert. Damit du dir selbst wieder glaubst.
            </Txt>
          </Einblenden>
          <Einblenden verz={450}>
            <Txt groesse={15} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 20 }}>
              Dein Beweis-Tagebuch für Beziehungen, die dich verunsichern.
            </Txt>
          </Einblenden>
        </View>
        <Einblenden verz={600} stil={{ gap: 12 }}>
          <Knopf text="Los geht's" onPress={() => setSchritt('quiz')} />
          <NurAufDemHandy text="Alles bleibt nur auf deinem Handy. Kein Konto nötig." />
        </Einblenden>
      </Bildschirm>
    );
  }

  if (schritt === 'quiz') {
    const a = quizAussagen[frage];
    const antworten = (wert: Antwort) => {
      if (gewaehlt !== null) return;
      setGewaehlt(wert);
      setze({ quiz: { ...z.quiz, [a.id]: wert } });
      setTimeout(() => {
        setGewaehlt(null);
        if (frage + 1 < quizAussagen.length) setFrage(frage + 1);
        else {
          vibriere('erfolg');
          setSchritt('ergebnis');
        }
      }, 320);
    };
    return (
      <Bildschirm verlauf={verlaeufe.start}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => (frage > 0 ? setFrage(frage - 1) : setSchritt('start'))}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Zurück"
          >
            <Zurueck />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Leiste wert={(frage + 1) / quizAussagen.length} />
          </View>
        </View>
        <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>
          Ist das noch normal? · {frage + 1} von {quizAussagen.length}
        </Txt>
        <Einblenden key={a.id}>
          <Karte>
            <Txt groesse={23} gewicht="serif">
              "{a.text}"
            </Txt>
          </Karte>
        </Einblenden>
        <Txt groesse={15} farbe={farben.textLeise}>
          Kennst du das?
        </Txt>
        <View style={{ gap: 10 }}>
          {antwortTexte.map((t) => (
            <AntwortKnopf key={t.wert} text={t.text} an={gewaehlt === t.wert} onPress={() => antworten(t.wert)} />
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <NurAufDemHandy text="Deine Antworten bleiben auf deinem Handy." />
      </Bildschirm>
    );
  }

  if (schritt === 'ergebnis') {
    const e = ergebnisText(treffer);
    return (
      <Bildschirm verlauf={verlaeufe.muster}>
        <Einblenden>
          <Marke text={`Dein Ergebnis: ${treffer} von ${quizAussagen.length}`} />
        </Einblenden>
        <Einblenden verz={120} stil={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Txt groesse={72} gewicht="serifFett" farbe={farben.akzent}>
            {treffer}
          </Txt>
          <Txt groesse={20} gewicht="serif" farbe={farben.textLeise}>
            von {quizAussagen.length} kennst du
          </Txt>
        </Einblenden>
        <Einblenden verz={260}>
          <Txt groesse={27} gewicht="serifFett">
            {e.titel}
          </Txt>
        </Einblenden>
        <Einblenden verz={400}>
          <Txt groesse={16} farbe={farben.textLeise}>
            {e.text}
          </Txt>
        </Einblenden>
        <Einblenden verz={520}>
          <Txt groesse={13} farbe={farben.textLeise}>
            Kein Test und keine Diagnose. Nur ein ehrlicher Blick auf das, was du erlebst.
          </Txt>
        </Einblenden>
        <View style={{ flex: 1 }} />
        <Einblenden verz={640}>
          <HilfeKarte kurz />
        </Einblenden>
        <Knopf text="Zu meinem Plan" onPress={() => setSchritt('plan')} />
      </Bildschirm>
    );
  }

  if (schritt === 'plan') {
    const fokus = schwerpunkte.length ? schwerpunkte.map(kategorieKurz).join(', ') : 'alles, was dich verunsichert';
    const etappen = [
      { wann: 'Ab heute', titel: 'Festhalten', text: 'Erzähl in einer Minute, was passiert ist. Das Datum kommt automatisch.' },
      { wann: 'Nach 4 Wochen', titel: 'Muster sehen', text: `Wir achten besonders auf: ${fokus}.` },
      { wann: 'Wenn es brennt', titel: "Schreib's hier statt ihm", text: 'Nachricht 24 Stunden parken, dann mit klarem Kopf entscheiden.' },
    ];
    return (
      <Bildschirm verlauf={verlaeufe.tagebuch}>
        <Einblenden>
          <Marke text="Dein persönlicher Plan" />
        </Einblenden>
        <Einblenden verz={100}>
          <Txt groesse={28} gewicht="serifFett">
            So wird es wieder klar.
          </Txt>
        </Einblenden>
        <View style={{ gap: 12, marginTop: 4 }}>
          {etappen.map((e, i) => (
            <Einblenden key={e.titel} verz={250 + i * 180}>
              <Karte stil={{ flexDirection: 'row', gap: 14, padding: 16 }}>
                <View style={s.nummer}>
                  <Txt groesse={16} gewicht="extra" farbe={farben.weiss}>
                    {i + 1}
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt groesse={13} gewicht="extra" farbe={farben.akzent}>
                    {e.wann.toUpperCase()}
                  </Txt>
                  <Txt groesse={19} gewicht="serif">
                    {e.titel}
                  </Txt>
                  <Txt groesse={15} farbe={farben.textLeise}>
                    {e.text}
                  </Txt>
                </View>
              </Karte>
            </Einblenden>
          ))}
        </View>
        <View style={{ flex: 1 }} />
        <NurAufDemHandy />
        <Knopf text="Klingt gut" onPress={() => setSchritt('erinnerung')} />
      </Bildschirm>
    );
  }

  if (schritt === 'erinnerung') {
    const weiter = async (mit: boolean) => {
      if (mit) await erlaubnisAnfragen();
      setze({ erinnerung: mit ? uhrzeit : null });
      setSchritt('paywall');
    };
    return (
      <Bildschirm verlauf={verlaeufe.start}>
        <Einblenden>
          <Marke text="Erinnerung" />
        </Einblenden>
        <Einblenden verz={100}>
          <Txt groesse={28} gewicht="serifFett">
            Wann soll ich dich kurz erinnern?
          </Txt>
        </Einblenden>
        <Einblenden verz={220}>
          <Txt groesse={16} farbe={farben.textLeise}>
            Einmal am Tag, ganz leise. Was nicht festgehalten wird, verschwimmt schnell.
          </Txt>
        </Einblenden>
        <Einblenden verz={340} stil={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
          {UHRZEITEN.map((u) => (
            <Chip key={u} text={`${u} Uhr`} an={u === uhrzeit} onPress={() => setUhrzeit(u)} />
          ))}
        </Einblenden>
        <Einblenden verz={460}>
          <Karte stil={{ padding: 16, gap: 4 }}>
            <Txt groesse={13} gewicht="extra" farbe={farben.textLeise}>
              SO SIEHT DIE NACHRICHT AUS
            </Txt>
            <Txt groesse={16} gewicht="extra">
              Kurzer Moment für dich
            </Txt>
            <Txt groesse={15} farbe={farben.textLeise}>
              Ist heute etwas passiert, das du festhalten willst?
            </Txt>
          </Karte>
        </Einblenden>
        <Txt groesse={13} farbe={farben.textLeise}>
          Die Nachricht verrät nichts über deine Einträge, falls jemand auf dein Handy schaut.
        </Txt>
        <View style={{ flex: 1 }} />
        <Knopf text="Erinnerung einschalten" onPress={() => weiter(true)} />
        <Knopf text="Lieber ohne" art="leise" onPress={() => weiter(false)} />
      </Bildschirm>
    );
  }

  // Harte Paywall (nur Optik, noch keine echten Käufe)
  const fertig = () => {
    vibriere('erfolg');
    setze({ onboardingFertig: true });
    router.replace('/tagebuch');
  };
  const zeitleiste = [
    { farbe: farben.akzent, fett: 'Heute:', text: 'alles freigeschaltet' },
    { farbe: farben.korall, fett: `Tag ${ERINNERUNG_TAG}:`, text: 'wir erinnern dich' },
    { farbe: farben.lavendel, fett: `Tag ${GRATIS_TAGE}:`, text: 'dein Abo startet' },
  ];
  return (
    <Bildschirm verlauf={verlaeufe.muster} stil={{ gap: 12 }}>
      <Marke text={`Dein Ergebnis: ${treffer} von ${quizAussagen.length}`} />
      <Txt groesse={26} gewicht="serifFett">
        Du bildest dir das nicht ein. Lass es uns festhalten.
      </Txt>
      <View style={{ gap: 8 }}>
        {['Beweis-Tagebuch mit Sprache', 'Deine Muster der letzten 4 Wochen', "Schreib's hier statt ihm, wenn es brennt"].map((t) => (
          <View key={t} style={s.vorteil}>
            <View style={s.hakenKlein}>
              <Haken groesse={14} />
            </View>
            <Txt groesse={15}>{t}</Txt>
          </View>
        ))}
      </View>
      <LinearGradient colors={farben.musterVerlauf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.zeitleiste}>
        {zeitleiste.map((p) => (
          <View key={p.fett} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: p.farbe }} />
            <Txt groesse={14}>
              <Txt groesse={14} gewicht="extra">
                {p.fett}
              </Txt>{' '}
              {p.text}
            </Txt>
          </View>
        ))}
      </LinearGradient>
      <PlanKarte
        an={plan === 'jahr'}
        titel="Jährlich"
        text={`${GRATIS_TAGE} Tage gratis, dann ${PREIS_JAHR}/Jahr`}
        marke="Beliebt"
        onPress={() => setPlan('jahr')}
      />
      <PlanKarte an={plan === 'monat'} titel="Monatlich" text={`${PREIS_MONAT}/Monat`} onPress={() => setPlan('monat')} />
      <View style={{ flex: 1 }} />
      {kaufHinweis ? (
        <Txt groesse={13} farbe={farben.akzent} mitte>
          Echte Käufe kommen später. Zum Testen: Weiter (Test).
        </Txt>
      ) : null}
      <Knopf text={plan === 'jahr' ? `${GRATIS_TAGE} Tage gratis starten` : 'Monatlich starten'} onPress={() => setKaufHinweis(true)} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt groesse={12} farbe={farben.textLeise}>
          Jederzeit kündbar · Wiederherstellen
        </Txt>
        <Pressable onPress={fertig} hitSlop={10} accessibilityRole="button">
          <Txt groesse={14} gewicht="extra" farbe={farben.akzent}>
            Weiter (Test)
          </Txt>
        </Pressable>
      </View>
    </Bildschirm>
  );
}

function AntwortKnopf({ text, an, onPress }: { text: string; an: boolean; onPress: () => void }) {
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
        accessibilityRole="button"
      >
        {an ? (
          <LinearGradient colors={verlaeufe.knopf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.antwort}>
            <Txt groesse={17} gewicht="extra" farbe={farben.weiss} mitte>
              {text}
            </Txt>
          </LinearGradient>
        ) : (
          <View style={[s.antwort, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
            <Txt groesse={17} gewicht="fett" mitte>
              {text}
            </Txt>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function PlanKarte({ an, titel, text, marke, onPress }: { an: boolean; titel: string; text: string; marke?: string; onPress: () => void }) {
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
        style={[s.plan, an ? s.planAn : null]}
      >
        <View style={{ flex: 1 }}>
          <Txt groesse={16} gewicht="extra">
            {titel}
          </Txt>
          <Txt groesse={13} farbe={farben.textLeise}>
            {text}
          </Txt>
        </View>
        {marke ? (
          <View style={s.marke}>
            <Txt groesse={12} gewicht="extra" farbe={farben.weiss}>
              {marke}
            </Txt>
          </View>
        ) : null}
        <View style={[s.radio, an && { borderColor: farben.akzent }]}>{an ? <View style={s.radioPunkt} /> : null}</View>
      </Pressable>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  flaggeKreis: { width: 132, height: 132, borderRadius: 66, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center', boxShadow: '0px 12px 30px rgba(184,70,60,0.15)' },
  antwort: { borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  nummer: { width: 32, height: 32, borderRadius: 16, backgroundColor: farben.akzent, alignItems: 'center', justifyContent: 'center' },
  vorteil: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.85)' },
  hakenKlein: { width: 22, height: 22, borderRadius: 11, backgroundColor: farben.akzent, alignItems: 'center', justifyContent: 'center' },
  zeitleiste: { gap: 8, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18 },
  plan: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 2, borderColor: 'transparent' },
  planAn: { backgroundColor: farben.weiss, borderColor: farben.akzent, boxShadow: '0px 10px 24px rgba(184,70,60,0.15)' },
  marke: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, backgroundColor: farben.akzent },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: farben.textHell, alignItems: 'center', justifyContent: 'center' },
  radioPunkt: { width: 11, height: 11, borderRadius: 6, backgroundColor: farben.akzent },
});
