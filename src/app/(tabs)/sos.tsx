import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { planeGeparkt } from '@/benachrichtigung';
import { Txt } from '@/components/Txt';
import { Bildschirm, Einblenden, Karte, Knopf, Marke, Rueckfrage } from '@/components/ui';
import { kalenderTage } from '@/data/muster';
import { useApp } from '@/state/store';
import { farben, LEISTE_PLATZ, schrift, verlaeufe } from '@/theme';

// SOS "Schreib's hier statt ihm": Nachricht schreiben, 24 Stunden parken, danach entscheiden. Die App schickt nie etwas ab.
// Oben der Kontaktpause-Zähler mit sanftem Neustart.
export default function Sos() {
  const { z, parken, vibriere, kontaktpauseStarten, kontaktGehabt } = useApp();
  const [text, setText] = useState('');
  const [bestaetigung, setBestaetigung] = useState<string | null>(null);
  const [frage, setFrage] = useState(false);
  const { start, laengste } = z.kontaktpause;
  const tag = start ? kalenderTage(start) + 1 : 0;
  const bereit = z.geparkt.filter((g) => g.status === 'wartet' && g.bis <= Date.now()).length;

  const parkenJetzt = () => {
    const g = parken(text.trim());
    planeGeparkt(g.id, g.bis);
    vibriere('erfolg');
    setText('');
    const d = new Date(g.bis);
    setBestaetigung(`Geparkt bis morgen, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} Uhr. Gut gemacht.`);
  };

  return (
    <Bildschirm verlauf={verlaeufe.sos} unten={LEISTE_PLATZ}>
      <KeyboardAvoidingView style={{ flex: 1, gap: 14 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Marke text="Schreib's hier statt ihm" />
        {start ? (
          <View style={{ gap: 2 }}>
            <Txt groesse={30} gewicht="serifFett">
              {tag === 1 ? 'Tag 1 ohne Kontakt. Jeder Anfang zählt.' : `Tag ${tag} ohne Kontakt. Stark.`}
            </Txt>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              {laengste > 0 ? (
                <Txt groesse={14} farbe={farben.textLeise}>
                  Längste Pause: {laengste} {laengste === 1 ? 'Tag' : 'Tage'}
                </Txt>
              ) : null}
              <Pressable onPress={() => setFrage(true)} hitSlop={8} accessibilityRole="button">
                <Txt groesse={14} gewicht="fett" farbe={farben.akzent}>
                  Ich hatte Kontakt
                </Txt>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Txt groesse={30} gewicht="serifFett">
              Erst hier schreiben. Dann entscheiden.
            </Txt>
            <Pressable
              onPress={() => {
                vibriere('mittel');
                kontaktpauseStarten();
              }}
              style={s.pause}
              accessibilityRole="button"
            >
              <Txt groesse={14} gewicht="extra" farbe={farben.akzent}>
                Kontaktpause zählen
              </Txt>
            </Pressable>
          </View>
        )}

        <Karte stil={{ flex: 1, padding: 18, minHeight: 150 }}>
          <TextInput
            value={text}
            onChangeText={(t) => {
              setText(t);
              if (bestaetigung) setBestaetigung(null);
            }}
            multiline
            placeholder="Ich weiß, ich sollte nicht schreiben, aber ..."
            placeholderTextColor={farben.textHell}
            style={s.feld}
            textAlignVertical="top"
          />
        </Karte>
        {bestaetigung ? (
          <Einblenden>
            <Txt groesse={15} gewicht="extra" farbe={farben.akzent}>
              {bestaetigung}
            </Txt>
          </Einblenden>
        ) : (
          <Txt groesse={15} farbe={farben.textLeise}>
            Die Nachricht wird 24 Stunden geparkt. Danach entscheidest du mit klarem Kopf.
          </Txt>
        )}
        <Knopf text="24 Stunden parken" aus={!text.trim()} onPress={parkenJetzt} />
        <Pressable onPress={() => router.push('/geparkt')} style={{ alignItems: 'center' }} hitSlop={8} accessibilityRole="button">
          <Txt groesse={14} farbe={farben.textLeise} mitte>
            Bisher geparkt: {z.geparktGesamt} {z.geparktGesamt === 1 ? 'Nachricht' : 'Nachrichten'}
          </Txt>
          {z.geparkt.length ? (
            <Txt groesse={14} gewicht="extra" farbe={farben.akzent} mitte>
              {bereit ? `${bereit} bereit zum Entscheiden` : 'Geparkte ansehen'}
            </Txt>
          ) : null}
        </Pressable>
      </KeyboardAvoidingView>
      <Rueckfrage
        sichtbar={frage}
        titel="Das passiert. Kein Drama."
        text="Wir fangen sanft neu an. Deine längste Pause bleibt gespeichert, nichts geht verloren."
        ja="Sanft neu anfangen"
        onJa={() => {
          setFrage(false);
          vibriere('mittel');
          kontaktGehabt();
        }}
        onNein={() => setFrage(false)}
      />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  feld: { flex: 1, fontFamily: schrift.halbfett, fontSize: 17, lineHeight: 25, color: farben.text, outlineStyle: 'none' } as object,
  pause: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.85)' },
});
