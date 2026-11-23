import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { KleineFlagge } from '@/components/Figur';
import { Txt } from '@/components/Txt';
import { Balken, Bildschirm, Einblenden, HilfeKarte, Karte, Knopf, NurAufDemHandy } from '@/components/ui';
import { kategorieName } from '@/data/kategorien';
import { haeufigkeiten, haeufigstesGefuehl, letzteVierWochen, proWoche } from '@/data/muster';
import { formen } from '@/data/person';
import { KI_AKTIV, kurve, MusterBericht, musterBericht, wechsel } from '@/ki/musterKI';
import { useApp } from '@/state/store';
import { farben, LEISTE_PLATZ, schatten } from '@/theme';

// Muster: der Musterbericht der letzten 4 Wochen als Bilder. Heiß-kalt-Kurve (Warmhalten auf einen Blick),
// Kernsatz, Muster-Karten im Bento, "Was gesagt wird / was passiert" (nur mit KI), Gefühl danach, pro Woche.
// Ohne KI rechnet die App den Bericht selbst. Nur Verhalten, nie ein Etikett für die Person.
export default function Muster() {
  const { z, setze, vibriere } = useApp();
  const { width } = useWindowDimensions();
  const f = formen(z.person);
  const vier = letzteVierWochen(z.eintraege);
  const [bericht, setBericht] = useState<MusterBericht | null>(null);
  useEffect(() => {
    let aktiv = true;
    musterBericht(z.eintraege, z.kiEinwilligung).then((b) => aktiv && setBericht(b));
    return () => {
      aktiv = false;
    };
  }, [z.eintraege, z.kiEinwilligung]);

  const punkte = kurve(z.eintraege);
  const w = wechsel(punkte);
  const liste = haeufigkeiten(z.eintraege);
  const wochen = proWoche(z.eintraege);
  const gefuehl = haeufigstesGefuehl(z.eintraege);
  const max = Math.max(1, ...liste.map((l) => l.anzahl));
  const breite = Math.min(width, 520) - 40;

  return (
    <Bildschirm scroll unten={LEISTE_PLATZ}>
      <Txt groesse={30} gewicht="serifFett">
        Deine Muster
      </Txt>
      <Txt groesse={14} farbe={farben.textHell} style={{ marginTop: -10 }}>
        Letzte 4 Wochen · {vier.length} {vier.length === 1 ? 'Flagge' : 'Flaggen'}
      </Txt>

      {vier.length === 0 ? (
        <Einblenden stil={{ gap: 12, alignItems: 'center', paddingVertical: 24 }}>
          <KleineFlagge groesse={48} />
          <Txt groesse={22} gewicht="serif" mitte>
            Hier wird es mit der Zeit klar.
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} mitte style={{ paddingHorizontal: 12 }}>
            Halte fest, was passiert. Ab drei Flaggen zeige ich dir, was sich wiederholt.
          </Txt>
          <Knopf text="Erste Flagge setzen" klein onPress={() => router.push({ pathname: '/eintrag', params: { sprechen: '1' } })} stil={{ alignSelf: 'stretch', marginTop: 8 }} />
        </Einblenden>
      ) : (
        <>
          {bericht ? (
            <Einblenden>
              <Karte verlauf={farben.musterVerlauf} stil={{ gap: 6, boxShadow: schatten.leuchten }}>
                <Txt groesse={12} gewicht="extra" farbe={farben.akzent} style={{ letterSpacing: 1 }}>
                  {bericht.quelle === 'ki' ? 'DEIN MUSTERBERICHT' : 'WAS SICH ZEIGT'}
                </Txt>
                <Txt groesse={22} gewicht="serif">
                  {bericht.kernsatz}
                </Txt>
              </Karte>
            </Einblenden>
          ) : null}

          <Einblenden verz={120}>
            <Karte stil={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <Txt groesse={18} gewicht="serif">
                  Heiß und kalt
                </Txt>
                <Txt groesse={13} gewicht="fett" farbe={farben.textHell}>
                  {w > 0 ? `${w} Mal gekippt` : ''}
                </Txt>
              </View>
              {punkte.length >= 2 ? (
                <HeissKalt punkte={punkte} breite={breite - 42} />
              ) : (
                <Txt groesse={14} farbe={farben.textLeise}>
                  {`Sag bei jeder Flagge, ob ${f.er} warm oder kalt war. Ab zwei Flaggen siehst du hier die Kurve.`}
                </Txt>
              )}
            </Karte>
          </Einblenden>

          {bericht && bericht.muster.length ? (
            <View style={s.bento}>
              {bericht.muster.map((m, i) => (
                <Einblenden key={m.name} verz={220 + i * 110} stil={{ width: i === 0 ? '100%' : '48.5%' }}>
                  <Karte stil={{ gap: 4, padding: 16, minHeight: i === 0 ? 0 : 150 }}>
                    <Txt groesse={i === 0 ? 40 : 30} gewicht="serifFett" farbe={farben.akzent}>
                      {`${m.anzahl}x`}
                    </Txt>
                    <Txt groesse={i === 0 ? 19 : 16} gewicht="extra">
                      {m.name}
                    </Txt>
                    <Txt groesse={14} farbe={farben.textLeise}>
                      {m.satz}
                    </Txt>
                  </Karte>
                </Einblenden>
              ))}
            </View>
          ) : null}

          {bericht && bericht.sagtTut.length ? (
            <Einblenden verz={420}>
              <Karte stil={{ gap: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                  <Txt groesse={13} gewicht="extra" farbe={farben.warm} style={{ flex: 1 }}>
                    WAS GESAGT WIRD
                  </Txt>
                  <Txt groesse={13} gewicht="extra" farbe={farben.kalt} style={{ flex: 1 }}>
                    WAS PASSIERT
                  </Txt>
                </View>
                {bericht.sagtTut.map((p, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
                    <Txt groesse={15} style={{ flex: 1 }}>{`"${p.sagt}"`}</Txt>
                    <Txt groesse={15} farbe={farben.textLeise} style={{ flex: 1 }}>
                      {p.tut}
                    </Txt>
                  </View>
                ))}
              </Karte>
            </Einblenden>
          ) : null}

          {bericht?.hilfeHinweis ? <HilfeKarte kurz titel="Du verdienst Schutz." /> : null}

          <View style={s.bento}>
            <Einblenden verz={500} stil={{ width: '48.5%' }}>
              <Karte stil={{ gap: 4, minHeight: 150 }}>
                <Txt groesse={13} gewicht="extra" farbe={farben.textHell}>
                  DANACH MEIST
                </Txt>
                <Txt groesse={24} gewicht="serif">
                  {gefuehl ? gefuehl.gefuehl : 'Noch offen'}
                </Txt>
                <Txt groesse={13} farbe={farben.textLeise}>
                  Dein Gefühl ist ein Hinweis, kein Fehler.
                </Txt>
              </Karte>
            </Einblenden>
            <Einblenden verz={580} stil={{ width: '48.5%' }}>
              <Karte stil={{ gap: 8, minHeight: 150 }}>
                <Txt groesse={13} gewicht="extra" farbe={farben.textHell}>
                  PRO WOCHE
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, flex: 1 }}>
                  {wochen.map((wo, i) => (
                    <View key={i} style={{ flex: 1, height: 70, justifyContent: 'flex-end' }}>
                      <View style={{ height: Math.max(6, (wo / Math.max(1, ...wochen)) * 70), borderRadius: 6, backgroundColor: i === 3 ? farben.akzent : farben.karteRand }} />
                    </View>
                  ))}
                </View>
              </Karte>
            </Einblenden>
          </View>

          <Einblenden verz={650}>
            <Karte stil={{ gap: 12 }}>
              <Txt groesse={18} gewicht="serif">
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
                    <Balken wert={l.anzahl / max} verz={700 + i * 90} />
                  </View>
                ))
              )}
            </Karte>
          </Einblenden>
        </>
      )}

      <Karte stil={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt groesse={17} gewicht="serif">
              KI-Musterbericht
            </Txt>
            <Txt groesse={13} farbe={farben.textLeise}>
              {KI_AKTIV
                ? 'Eine KI liest deine Einträge der letzten 4 Wochen und zeigt dir Muster. Nichts wird gespeichert.'
                : 'Kommt bald: eine KI liest deine Einträge und zeigt dir Muster in Bildern. Bis dahin rechnet die App selbst.'}
            </Txt>
          </View>
          <Switch
            value={z.kiEinwilligung}
            onValueChange={(an) => {
              vibriere('mittel');
              setze({ kiEinwilligung: an });
            }}
            trackColor={{ true: farben.akzent, false: farben.karteRand }}
            thumbColor={farben.weiss}
          />
        </View>
        <Txt groesse={12} farbe={farben.textHell}>
          Mit dem Schalter willigst du ein, dass deine Einträge dafür an einen Server in der EU geschickt werden. Jederzeit widerrufbar.
        </Txt>
      </Karte>
      <NurAufDemHandy />
    </Bildschirm>
  );
}

// Heiß-kalt-Kurve: warm oben (Morgenrot), kalt unten (Blau). Weiche Linie durch die Punkte.
function HeissKalt({ punkte, breite }: { punkte: { zeit: number; wert: number }[]; breite: number }) {
  const h = 150;
  const oben = 22;
  const unten = h - 22;
  const n = punkte.length;
  const xy = punkte.map((p, i) => [14 + (i * (breite - 28)) / Math.max(1, n - 1), oben + ((1 - p.wert) / 2) * (unten - oben)] as const);
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1];
    const [x1, y1] = xy[i];
    const mx = (x0 + x1) / 2;
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`;
  }
  return (
    <Svg width={breite} height={h}>
      <Defs>
        <LinearGradient id="hk" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={farben.warm} />
          <Stop offset="1" stopColor={farben.kalt} />
        </LinearGradient>
      </Defs>
      <Line x1={0} x2={breite} y1={h / 2} y2={h / 2} stroke={farben.karteRand} strokeDasharray="4 6" />
      <SvgText x={2} y={12} fill={farben.warm} fontSize={11} fontWeight="700">
        warm
      </SvgText>
      <SvgText x={2} y={h - 2} fill={farben.kalt} fontSize={11} fontWeight="700">
        kalt
      </SvgText>
      <Path d={d} stroke="url(#hk)" strokeWidth={7} fill="none" opacity={0.25} strokeLinecap="round" />
      <Path d={d} stroke="url(#hk)" strokeWidth={3} fill="none" strokeLinecap="round" />
      {xy.map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={5} fill={punkte[i].wert > 0 ? farben.warm : punkte[i].wert < 0 ? farben.kalt : farben.textLeise} />
      ))}
    </Svg>
  );
}

const s = StyleSheet.create({
  bento: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
});
