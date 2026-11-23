import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { Leuchten } from '@/components/Licht';
import { Haken, Stift } from '@/components/Symbole';
import { Szene } from '@/components/Szene';
import { Txt } from '@/components/Txt';
import { Balken, Bildschirm, Einblenden, Knopf, Rueckfrage } from '@/components/ui';
import { formen } from '@/data/person';
import { stufeZu } from '@/data/stufen';
import { berechne, useApp } from '@/state/store';
import { farben, LEISTE_PLATZ } from '@/theme';

// Heute: eine große Zahl, die Szene (wird mit den Tagen heller, deine Flaggen stehen auf dem Hügel)
// und ein großer Knopf für den schwersten Moment. Quittr/Drangduell-Prinzip.
export default function Heute() {
  const { z, vibriere, heuteBeiMir, kontaktGehabt, kontaktpauseStarten } = useApp();
  const { width } = useWindowDimensions();
  const [frage, setFrage] = useState(false);
  const f = formen(z.person);
  const b = berechne(z);
  const st = stufeZu(b.zahl);
  const breite = Math.min(width, 520) - 40;

  return (
    <Bildschirm scroll unten={LEISTE_PLATZ} stil={{ gap: 12 }}>
      <View style={{ alignItems: 'center', marginTop: 6 }}>
        <Leuchten groesse={260} staerke={0.3} />
        <Einblenden>
          <Txt groesse={104} gewicht="serifFett" mitte style={{ lineHeight: 112, textShadowColor: 'rgba(255,140,110,0.55)', textShadowRadius: 24, textShadowOffset: { width: 0, height: 0 } }}>
            {b.zahl}
          </Txt>
        </Einblenden>
        <Txt groesse={18} gewicht="fett" farbe={farben.textLeise} mitte>
          {b.einheit}
        </Txt>
      </View>

      <Einblenden verz={120}>
        <Szene stufe={st.index} flaggen={z.eintraege.length} breite={breite} pose={b.heuteGezaehlt ? 'winken' : 'stehen'} />
      </Einblenden>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt groesse={14} gewicht="fett" farbe={farben.textLeise}>
            {st.stufe.name}
          </Txt>
          <Txt groesse={14} farbe={farben.textHell}>
            {st.naechste ? `noch ${st.fehlt} ${st.fehlt === 1 ? 'Tag' : 'Tage'} bis ${st.naechste.name}` : `Ziel: ${z.ziel} Tage`}
          </Txt>
        </View>
        <Balken wert={st.anteil} />
      </View>

      {b.kontakt ? (
        !z.kontaktpause.start ? (
          <Knopf text="Kontaktpause starten" art="glas" klein onPress={() => kontaktpauseStarten()} />
        ) : null
      ) : b.heuteGezaehlt ? (
        <View style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: farben.akzent, alignItems: 'center', justifyContent: 'center' }}>
            <Haken groesse={15} farbe={farben.dunkel} />
          </View>
          <Txt groesse={15} gewicht="fett" farbe={farben.textLeise}>
            Heute bei dir geblieben
          </Txt>
        </View>
      ) : (
        <Knopf
          text="Heute bin ich bei mir geblieben"
          art="glas"
          klein
          onPress={() => {
            vibriere('erfolg');
            heuteBeiMir();
          }}
        />
      )}

      <Knopf text={`SOS: Ich will ${f.ihm} schreiben`} onPress={() => router.push('/sos')} />

      <Pressable onPress={() => router.push({ pathname: '/eintrag', params: { sprechen: '1' } })} style={{ flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 6, paddingVertical: 6 }} accessibilityRole="button">
        <Stift farbe={farben.akzent} />
        <Txt groesse={15} gewicht="extra" farbe={farben.akzent}>
          Etwas festhalten
        </Txt>
      </Pressable>

      {b.kontakt && z.kontaktpause.start ? (
        <Pressable onPress={() => setFrage(true)} style={{ alignSelf: 'center', paddingVertical: 4 }} accessibilityRole="button">
          <Txt groesse={13} farbe={farben.textHell}>
            Ich hatte Kontakt · Längste Pause {b.laengste} {b.laengste === 1 ? 'Tag' : 'Tage'}
          </Txt>
        </Pressable>
      ) : null}

      <Rueckfrage
        sichtbar={frage}
        titel="Das passiert. Kein Drama."
        text="Wir fangen sanft neu an. Deine längste Pause und alle Flaggen bleiben."
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
