import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Saeulen } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Balken, Bildschirm, Einblenden, Karte, Knopf, Marke, NurAufDemHandy } from '@/components/ui';
import { kategorieKurz, kategorieName } from '@/data/kategorien';
import { erkannteMuster, haeufigkeiten, haeufigstesGefuehl, letzteVierWochen, MUSTER_AB, proWoche } from '@/data/muster';
import { KI_AKTIV } from '@/ki/einordnenKI';
import { useApp } from '@/state/store';
import { farben, LEISTE_PLATZ, verlaeufe } from '@/theme';

// Muster: einfache Auswertung ohne KI. Wie oft kam was in den letzten 4 Wochen vor?
export default function Muster() {
  const { z } = useApp();
  const vier = letzteVierWochen(z.eintraege);
  const liste = haeufigkeiten(z.eintraege);
  const muster = erkannteMuster(z.eintraege);
  const wochen = proWoche(z.eintraege);
  const gefuehl = haeufigstesGefuehl(z.eintraege);
  const max = Math.max(1, ...liste.map((l) => l.anzahl));
  const maxWoche = Math.max(1, ...wochen);

  return (
    <Bildschirm verlauf={verlaeufe.muster} scroll unten={LEISTE_PLATZ}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Saeulen groesse={26} farbe={farben.akzent} />
        <Txt groesse={26} gewicht="serifFett">
          Deine Muster
        </Txt>
      </View>
      <Marke text="Letzte 4 Wochen" farbe={farben.textLeise} />

      {vier.length === 0 ? (
        <Einblenden stil={{ gap: 12, alignItems: 'center', paddingVertical: 30 }}>
          <Txt groesse={20} gewicht="serif" mitte>
            Hier wird es mit der Zeit klar.
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 12 }}>
            Sobald du ein paar Dinge festgehalten hast, siehst du hier, was sich wiederholt.
          </Txt>
          <Knopf text="Ersten Eintrag machen" klein onPress={() => router.push({ pathname: '/eintrag', params: { sprechen: '1' } })} stil={{ alignSelf: 'stretch', marginTop: 8 }} />
        </Einblenden>
      ) : (
        <>
          <Einblenden stil={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Txt groesse={64} gewicht="serifFett" farbe={farben.akzent}>
              {vier.length}
            </Txt>
            <Txt groesse={18} gewicht="serif" farbe={farben.textLeise} style={{ flex: 1 }}>
              {vier.length === 1 ? 'Moment festgehalten' : 'Momente festgehalten'}
            </Txt>
          </Einblenden>

          {muster.map((m, i) => (
            <Einblenden key={m.id} verz={120 + i * 120}>
              <Karte verlauf={farben.musterVerlauf} stil={{ gap: 4, padding: 16 }}>
                <Txt groesse={12} gewicht="extra" style={{ letterSpacing: 1 }}>
                  MUSTER ERKANNT
                </Txt>
                <Txt groesse={19} gewicht="serif">
                  {m.anzahl} Mal "{kategorieKurz(m.id)}". Du bildest dir das nicht ein.
                </Txt>
              </Karte>
            </Einblenden>
          ))}
          {muster.length === 0 ? (
            <Txt groesse={14} farbe={farben.textLeise}>
              Ab {MUSTER_AB} gleichen Einträgen in 4 Wochen zeigen wir dir das Muster.
            </Txt>
          ) : null}

          <Einblenden verz={250}>
            <Karte stil={{ gap: 12 }}>
              <Txt groesse={17} gewicht="serif">
                Was am häufigsten passiert ist
              </Txt>
              {liste.length === 0 ? (
                <Txt groesse={14} farbe={farben.textLeise}>
                  Bisher ohne Kategorie festgehalten.
                </Txt>
              ) : (
                liste.map((l, i) => (
                  <View key={l.id} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Txt groesse={14} gewicht="fett" style={{ flex: 1 }}>
                        {kategorieName(l.id)}
                      </Txt>
                      <Txt groesse={14} gewicht="extra" farbe={farben.akzent}>
                        {l.anzahl}x
                      </Txt>
                    </View>
                    <Balken wert={l.anzahl / max} verz={300 + i * 90} />
                  </View>
                ))
              )}
            </Karte>
          </Einblenden>

          <Einblenden verz={350}>
            <Karte stil={{ gap: 12 }}>
              <Txt groesse={17} gewicht="serif">
                Pro Woche
              </Txt>
              <View style={s.wochen}>
                {wochen.map((w, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
                    <Txt groesse={13} gewicht="extra" farbe={farben.akzent}>
                      {w}
                    </Txt>
                    <View style={{ height: 70, justifyContent: 'flex-end', width: 28 }}>
                      <View style={{ height: Math.max(6, (w / maxWoche) * 70), borderRadius: 8, backgroundColor: i === 3 ? farben.akzent : farben.akzentHell, opacity: i === 3 ? 1 : 0.55 }} />
                    </View>
                    <Txt groesse={12} farbe={farben.textLeise}>
                      {i === 3 ? 'diese' : `vor ${3 - i}`}
                    </Txt>
                  </View>
                ))}
              </View>
            </Karte>
          </Einblenden>

          {gefuehl ? (
            <Einblenden verz={450}>
              <Karte stil={{ gap: 4 }}>
                <Txt groesse={13} gewicht="extra" farbe={farben.textLeise}>
                  SO GING ES DIR DANACH AM HÄUFIGSTEN
                </Txt>
                <Txt groesse={20} gewicht="serif">
                  {gefuehl.gefuehl} ({gefuehl.anzahl}x)
                </Txt>
                <Txt groesse={14} farbe={farben.textLeise}>
                  Dein Gefühl ist ein Hinweis, kein Fehler.
                </Txt>
              </Karte>
            </Einblenden>
          ) : null}

          {!KI_AKTIV ? (
            <View style={s.bald}>
              <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>
                Bald: eine ruhige Einordnung deiner Einträge. Ohne Urteil über die andere Person.
              </Txt>
            </View>
          ) : null}
        </>
      )}
      <NurAufDemHandy />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  wochen: { flexDirection: 'row', alignItems: 'flex-end' },
  bald: { padding: 14, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(184,70,60,0.25)' },
});
