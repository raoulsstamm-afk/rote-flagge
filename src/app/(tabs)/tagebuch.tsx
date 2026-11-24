import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { KleineFlagge } from '@/components/Figur';
import { Mikro, Stift } from '@/components/Symbole';
import { TabKopf } from '@/components/TabKopf';
import { Txt } from '@/components/Txt';
import { Bildschirm, Einblenden, Knopf, NurAufDemHandy, useFeder } from '@/components/ui';
import { kategorieName, kategorieKurz } from '@/data/kategorien';
import { datumText, erkannteMuster } from '@/data/muster';
import { formen } from '@/data/person';
import { useApp } from '@/state/store';
import { farben, LEISTE_PLATZ, schatten, verlaeufe } from '@/theme';

// Start der App: ein großer Knopf zum Erzählen, darunter das stärkste Muster und die Einträge.
export default function Tagebuch() {
  const { z } = useApp();
  const muster = erkannteMuster(z.eintraege)[0];
  const feder = useFeder();
  const leer = z.eintraege.length === 0;
  const f = formen(z.person);
  const wartend = z.geparkt.length;

  return (
    <Bildschirm verlauf={verlaeufe.tagebuch} scroll unten={LEISTE_PLATZ}>
      <TabKopf schritt={1} was="Anzeichen festhalten" titel="Tagebuch" />
      {!leer ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -10 }}>
          <KleineFlagge groesse={16} wehen={false} />
          <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>
            {z.eintraege.length} festgehalten
          </Txt>
        </View>
      ) : null}

      <Einblenden>
        <Animated.View style={feder.stil}>
          <Pressable
            onPressIn={feder.rein}
            onPressOut={feder.raus}
            onPress={() => {
              feder.vibriere('mittel');
              router.push({ pathname: '/eintrag', params: { sprechen: '1' } });
            }}
            accessibilityRole="button"
            accessibilityLabel="Was ist passiert? Erzähl's mir."
          >
            <LinearGradient colors={verlaeufe.grossKnopf} locations={[0, 0.7, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.gross, { boxShadow: schatten.knopf }]}>
              <View style={s.mikroKreis}>
                <Mikro groesse={40} farbe={farben.dunkel} />
              </View>
              <Txt groesse={22} gewicht="serifFett" farbe={farben.dunkel} mitte>
                Was ist passiert? Erzähl's mir.
              </Txt>
              <Txt groesse={13} gewicht="extra" farbe={farben.dunkel} mitte>
                Antippen und einfach losreden
              </Txt>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </Einblenden>
      <Pressable onPress={() => router.push({ pathname: '/eintrag', params: { tippen: '1' } })} style={s.tippen} hitSlop={8} accessibilityRole="button">
        <Stift />
        <Txt groesse={15} gewicht="fett" farbe={farben.textLeise}>
          Lieber tippen
        </Txt>
      </Pressable>

      {muster ? (
        <Einblenden verz={150}>
          <Pressable onPress={() => router.navigate('/muster')}>
            <LinearGradient colors={farben.musterVerlauf} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.muster}>
              <Txt groesse={12} gewicht="extra" style={{ letterSpacing: 1 }}>
                MUSTER DER LETZTEN 4 WOCHEN
              </Txt>
              <Txt groesse={18} gewicht="serif">
                {muster.anzahl} Mal "{kategorieKurz(muster.id)}". Du bildest dir das nicht ein.
              </Txt>
            </LinearGradient>
          </Pressable>
        </Einblenden>
      ) : null}

      {leer ? (
        <Einblenden verz={200} stil={{ gap: 8, alignItems: 'center', paddingVertical: 18 }}>
          <Txt groesse={19} gewicht="serif" mitte>
            Noch nichts festgehalten.
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 16 }}>
            Fang mit dem an, was zuletzt passiert ist. Ein Satz reicht.
          </Txt>
        </Einblenden>
      ) : (
        <View style={{ gap: 10 }}>
          {z.eintraege.map((e, i) => (
            <Einblenden key={e.id} verz={Math.min(i, 6) * 70}>
              <Pressable onPress={() => router.push({ pathname: '/ansehen', params: { id: e.id } })} style={s.eintrag} accessibilityRole="button">
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {e.waerme ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: e.waerme === 'warm' ? farben.warm : e.waerme === 'kalt' ? farben.kalt : farben.textLeise }} /> : null}
                  <Txt groesse={13} farbe={farben.textHell}>
                    {datumText(e.zeit)}
                  </Txt>
                </View>
                <Txt groesse={15} gewicht="fett" numberOfLines={2}>
                  {e.text || 'Ohne Text'}
                </Txt>
                {e.kategorien.length ? (
                  <Txt groesse={13} gewicht="fett" farbe={farben.akzent} numberOfLines={1}>
                    {e.kategorien.map(kategorieName).join(' · ')}
                  </Txt>
                ) : null}
              </Pressable>
            </Einblenden>
          ))}
        </View>
      )}

      {wartend ? (
        <Knopf text={`Geparkte Nachrichten (${wartend})`} art="glas" klein onPress={() => router.push('/geparkt')} />
      ) : null}
      <Knopf text={`SOS: Ich will ${f.ihm} schreiben`} art="glas" klein onPress={() => router.push('/sos')} />
      <NurAufDemHandy />
    </Bildschirm>
  );
}

const s = StyleSheet.create({
  gross: { alignItems: 'center', gap: 10, paddingVertical: 28, paddingHorizontal: 22, borderRadius: 28 },
  mikroKreis: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(26,11,11,0.12)', alignItems: 'center', justifyContent: 'center' },
  tippen: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, marginTop: -4 },
  muster: { padding: 16, borderRadius: 20, gap: 4 },
  eintrag: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: farben.karte, borderWidth: 1, borderColor: farben.karteRand, gap: 2 },
});
