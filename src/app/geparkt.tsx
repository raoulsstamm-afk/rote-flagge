import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { absagenGeparkt } from '@/benachrichtigung';
import { Schloss, Zurueck } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, Einblenden, Karte, Knopf, Marke } from '@/components/ui';
import { datumText } from '@/data/muster';
import { Geparkt, useApp } from '@/state/store';
import { farben, verlaeufe } from '@/theme';

// Geparkte Nachrichten: 24 Stunden gesperrt, danach löschen oder behalten. Nie selbst senden.
export default function GeparkteNachrichten() {
  const { z, entscheiden, vibriere } = useApp();
  const [jetzt, setJetzt] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setJetzt(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Was schon entschieden werden kann, steht oben
  const wartend = z.geparkt.filter((g) => g.status === 'wartet').sort((a, b) => a.bis - b.bis);
  const behalten = z.geparkt.filter((g) => g.status === 'behalten');

  const waehle = (g: Geparkt, wahl: 'loeschen' | 'behalten') => {
    vibriere(wahl === 'loeschen' ? 'erfolg' : 'mittel');
    absagenGeparkt(g.id);
    entscheiden(g.id, wahl);
  };

  return (
    <Bildschirm verlauf={verlaeufe.sos} scroll>
      <Pressable onPress={() => router.back()} hitSlop={12} style={s.zurueck} accessibilityRole="button" accessibilityLabel="Zurück">
        <Zurueck />
      </Pressable>
      <Marke text="Geparkt" />
      <Txt groesse={28} gewicht="serifFett">
        Mit klarem Kopf entscheiden
      </Txt>
      <Txt groesse={15} farbe={farben.textLeise}>
        Rote Flagge schickt nie etwas ab. Behalten heißt: Es bleibt nur hier.
      </Txt>

      {z.geparkt.length === 0 ? (
        <Txt groesse={16} gewicht="serif" mitte style={{ marginTop: 30 }}>
          Gerade ist nichts geparkt.
        </Txt>
      ) : null}

      {wartend.map((g, i) => {
        const offen = g.bis - jetzt;
        const fertig = offen <= 0;
        const stunden = Math.max(1, Math.ceil(offen / 3_600_000));
        return (
          <Einblenden key={g.id} verz={i * 80}>
            <Karte stil={{ gap: 10 }}>
              <Txt groesse={13} farbe={farben.textLeise}>
                Geparkt {datumText(g.zeit)}
              </Txt>
              <Txt groesse={16} numberOfLines={fertig ? undefined : 3} style={fertig ? undefined : { opacity: 0.55 }}>
                {g.text}
              </Txt>
              {fertig ? (
                <View style={{ gap: 8 }}>
                  <Txt groesse={17} gewicht="serif">
                    Bereit. Wie fühlt es sich jetzt an?
                  </Txt>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Knopf text="Löschen" klein onPress={() => waehle(g, 'loeschen')} stil={{ flex: 1 }} />
                    <Knopf text="Behalten" art="glas" klein onPress={() => waehle(g, 'behalten')} stil={{ flex: 1 }} />
                  </View>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Schloss />
                  <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>
                    Noch {stunden} {stunden === 1 ? 'Stunde' : 'Stunden'} geparkt
                  </Txt>
                </View>
              )}
            </Karte>
          </Einblenden>
        );
      })}

      {behalten.length ? (
        <View style={{ gap: 10, marginTop: 10 }}>
          <Txt groesse={13} gewicht="extra" farbe={farben.textLeise}>
            AUFBEWAHRT (NUR HIER)
          </Txt>
          {behalten.map((g) => (
            <View key={g.id} style={s.behalten}>
              <Txt groesse={13} farbe={farben.textLeise}>
                {datumText(g.zeit)}
              </Txt>
              <Txt groesse={15}>{g.text}</Txt>
              <Pressable onPress={() => waehle(g, 'loeschen')} hitSlop={8} style={{ alignSelf: 'flex-end' }} accessibilityRole="button">
                <Txt groesse={14} gewicht="fett" farbe={farben.akzent}>
                  Löschen
                </Txt>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  zurueck: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  behalten: { padding: 14, borderRadius: 18, backgroundColor: farben.glas, gap: 4 },
});
