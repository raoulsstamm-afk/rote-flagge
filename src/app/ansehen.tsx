import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Zurueck } from '@/components/Symbole';
import { Txt } from '@/components/Txt';
import { Bildschirm, HilfeKarte, Karte, Knopf, Marke, Rueckfrage } from '@/components/ui';
import { kategorieName } from '@/data/kategorien';
import { datumText } from '@/data/muster';
import { useApp } from '@/state/store';
import { farben, verlaeufe } from '@/theme';

// Ein Eintrag in Ruhe ansehen (und bei Bedarf löschen)
export default function Ansehen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { z, eintragLoeschen } = useApp();
  const [frage, setFrage] = useState(false);
  const e = z.eintraege.find((x) => x.id === id);

  return (
    <Bildschirm verlauf={verlaeufe.tagebuch} scroll>
      <Pressable onPress={() => router.back()} hitSlop={12} style={s.zurueck} accessibilityRole="button" accessibilityLabel="Zurück">
        <Zurueck />
      </Pressable>
      {!e ? (
        <Txt groesse={18} gewicht="serif">
          Dieser Eintrag ist nicht mehr da.
        </Txt>
      ) : (
        <>
          <Marke text="Eintrag" />
          <Txt groesse={15} gewicht="fett" farbe={farben.textLeise}>
            {datumText(e.zeit)}
          </Txt>
          <Karte>
            <Txt groesse={19} gewicht="serif">
              {e.text || 'Ohne Text'}
            </Txt>
          </Karte>
          {e.gefuehle.length ? (
            <View style={{ gap: 6 }}>
              <Txt groesse={13} gewicht="extra" farbe={farben.textLeise}>
                SO GING ES DIR DANACH
              </Txt>
              <View style={s.reihe}>
                {e.gefuehle.map((g) => (
                  <View key={g} style={s.pille}>
                    <Txt groesse={14} gewicht="fett">
                      {g}
                    </Txt>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {e.kategorien.length ? (
            <View style={{ gap: 6 }}>
              <Txt groesse={13} gewicht="extra" farbe={farben.textLeise}>
                WAS PASSIERT IST
              </Txt>
              <View style={s.reihe}>
                {e.kategorien.map((k) => (
                  <View key={k} style={[s.pille, { backgroundColor: farben.akzentZart }]}>
                    <Txt groesse={14} gewicht="fett" farbe={farben.akzent}>
                      {kategorieName(k)}
                    </Txt>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          {e.kategorien.includes('bedroht') ? <HilfeKarte kurz titel="Du verdienst Schutz." /> : null}
          <Knopf text="Eintrag löschen" art="leise" onPress={() => setFrage(true)} stil={{ marginTop: 20 }} />
          <Rueckfrage
            sichtbar={frage}
            titel="Eintrag löschen?"
            text="Er ist dann für immer weg, auch aus deinen Mustern."
            ja="Ja, löschen"
            onJa={() => {
              setFrage(false);
              eintragLoeschen(e.id);
              router.back();
            }}
            onNein={() => setFrage(false)}
          />
        </>
      )}
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  zurueck: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
  reihe: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pille: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: farben.glas },
});
