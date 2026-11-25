import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { alleAbsagen, erlaubnisAnfragen } from '@/benachrichtigung';
import { Zurueck } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Chip, HilfeKarte, Karte, Knopf, Rueckfrage } from '@/components/ui';
import { entsperren, sperreVerfuegbar } from '@/sperre';
import { PRONOMEN_WAHL } from '@/data/person';
import { PHASEN } from '@/data/phasen';
import { useApp } from '@/state/store';
import { testApp } from '@/testApp';
import { farben, verlaeufe } from '@/theme';

const UHRZEITEN = ['08:00', '12:00', '18:00', '20:00', '21:00', '22:00'];

// Einstellungen: Erinnerung, App-Sperre, Hilfe, alle Daten löschen
export default function Einstellungen() {
  const { z, setze, vibriere, allesLoeschen } = useApp();
  const [sperreHinweis, setSperreHinweis] = useState<string | null>(null);
  const [loeschFrage, setLoeschFrage] = useState(false);

  const sperreUmschalten = async (an: boolean) => {
    vibriere('mittel');
    if (!an) {
      setze({ appSperre: false });
      setSperreHinweis(null);
      return;
    }
    if (!(await sperreVerfuegbar())) {
      setSperreHinweis('Auf diesem Gerät gibt es kein Face ID oder keinen Code. Die Sperre geht nur auf dem iPhone mit eingerichtetem Face ID.');
      return;
    }
    // Einmal bestätigen lassen, damit sich niemand aus Versehen aussperrt
    if (await entsperren()) {
      setze({ appSperre: true });
      setSperreHinweis(null);
    }
  };

  const erinnerungSetzen = async (u: string | null) => {
    if (u) await erlaubnisAnfragen();
    setze({ erinnerung: u });
  };

  return (
    <Bildschirm verlauf={verlaeufe.tagebuch} scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.zurueck} accessibilityRole="button" accessibilityLabel="Zurück">
          <Zurueck />
        </Pressable>
        <Txt groesse={26} gewicht="serifFett">
          Einstellungen
        </Txt>
      </View>

      <Karte stil={{ gap: 12 }}>
        <Txt groesse={18} gewicht="serif">
          Wo stehst du gerade?
        </Txt>
        <View style={s.chips}>
          {PHASEN.map((p) => (
            <Chip
              key={p.id}
              text={p.text}
              an={z.phase === p.id}
              onPress={() => {
                setze({ phase: p.id });
                if (p.id === 'getrennt' && !z.kontaktpause.start) setze({ phase: p.id, kontaktpause: { ...z.kontaktpause, start: Date.now() } });
              }}
            />
          ))}
        </View>
        <Txt groesse={14} farbe={farben.textLeise}>
          Um wen geht's?
        </Txt>
        <View style={s.chips}>
          {PRONOMEN_WAHL.map((p) => (
            <Chip key={p.id} text={p.text} an={(z.person?.pronomen ?? 'er') === p.id} onPress={() => setze({ person: { name: z.person?.name ?? '', pronomen: p.id } })} />
          ))}
        </View>
      </Karte>

      <Karte stil={{ gap: 12 }}>
        <Txt groesse={18} gewicht="serif">
          Tägliche Erinnerung
        </Txt>
        <Txt groesse={14} farbe={farben.textLeise}>
          Die Nachricht lautet nur "Kurzer Moment für dich" und verrät nichts.
        </Txt>
        <View style={s.chips}>
          {UHRZEITEN.map((u) => (
            <Chip key={u} text={u} an={z.erinnerung === u} onPress={() => erinnerungSetzen(u)} />
          ))}
          <Chip text="Aus" an={!z.erinnerung} onPress={() => erinnerungSetzen(null)} />
        </View>
      </Karte>

      <Karte stil={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt groesse={18} gewicht="serif">
              App-Sperre mit Face ID
            </Txt>
            <Txt groesse={14} farbe={farben.textLeise}>
              Nur du kannst dein Tagebuch öffnen.
            </Txt>
          </View>
          <Switch
            value={z.appSperre}
            onValueChange={sperreUmschalten}
            trackColor={{ true: farben.akzent, false: '#E5D8D0' }}
            thumbColor={farben.weiss}
            accessibilityLabel="App-Sperre mit Face ID"
          />
        </View>
        {sperreHinweis ? (
          <Txt groesse={13} farbe={farben.akzent}>
            {sperreHinweis}
          </Txt>
        ) : null}
      </Karte>

      <HilfeKarte titel="Hilfe, wenn es zu viel wird" />

      <Karte stil={{ gap: 10 }}>
        <Txt groesse={18} gewicht="serif">
          Wunsch-Wand
        </Txt>
        <Txt groesse={14} farbe={farben.textLeise}>
          Was soll Rote Flagge noch können? Wünsch dir etwas oder stimm für die Ideen anderer.
        </Txt>
        <Knopf text="Zur Wunsch-Wand" art="glas" klein onPress={() => router.push('/wunschwand')} />
      </Karte>

      <Karte stil={{ gap: 10 }}>
        <Txt groesse={18} gewicht="serif">
          Deine Daten
        </Txt>
        <Txt groesse={14} farbe={farben.textLeise}>
          Alles bleibt nur auf deinem Handy. Kein Konto, keine Statistik. Nur wenn du den KI-Musterbericht einschaltest, gehen deine Einträge kurz an einen Server in der EU und werden nicht gespeichert. Rote Flagge ist ein Tagebuch, keine Therapie und keine Beratung.
        </Txt>
        <Knopf text="Alle Daten löschen" art="glas" klein onPress={() => setLoeschFrage(true)} />
      </Karte>

      {/* Nur in der Test-App (Raoul 20.11.2026): Onboarding jederzeit neu durchklicken. Einträge und Geparktes bleiben,
          am Ende geht es wie gewohnt zurück ins Tagebuch. */}
      {testApp ? (
        <Karte stil={{ gap: 10 }}>
          <Txt groesse={18} gewicht="serif">
            Test
          </Txt>
          <Txt groesse={14} farbe={farben.textLeise}>
            Nur in der Test-App sichtbar. Deine Einträge bleiben erhalten.
          </Txt>
          <Knopf
            text="Onboarding nochmal durchklicken"
            art="glas"
            klein
            onPress={() => {
              setze({ onboardingFertig: false });
              router.replace('/onboarding');
            }}
          />
        </Karte>
      ) : null}

      <Txt groesse={12} farbe={farben.textHell} mitte>
        Rote Flagge {Constants.expoConfig?.version ?? ''} · Test-Version
      </Txt>

      <Rueckfrage
        sichtbar={loeschFrage}
        titel="Wirklich alles löschen?"
        text="Alle Einträge, geparkten Nachrichten und Einstellungen sind dann für immer weg. Das geht nicht rückgängig."
        ja="Ja, alles löschen"
        onJa={async () => {
          setLoeschFrage(false);
          vibriere('mittel');
          await alleAbsagen();
          await allesLoeschen();
          router.replace('/onboarding');
        }}
        onNein={() => setLoeschFrage(false)}
      />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  zurueck: { width: 40, height: 40, borderRadius: 20, backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
