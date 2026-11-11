import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View } from 'react-native';
import { entsperren } from '@/sperre';
import { useApp } from '@/state/store';
import { farben, verlaeufe } from '@/theme';
import { Flagge } from './Symbole';
import { Txt } from './Txt';
import { Knopf } from './ui';

// App-Sperre: Ist sie in den Einstellungen an, liegt beim Start und nach jeder Rückkehr aus dem Hintergrund
// ein Sperrbildschirm über allem, bis Face ID (oder der Code) bestätigt ist.
export function Sperre({ children }: { children: ReactNode }) {
  const { z } = useApp();
  const [gesperrt, setGesperrt] = useState(z.appSperre);
  const laeuft = useRef(false);

  const versuchen = useCallback(async () => {
    if (laeuft.current) return;
    laeuft.current = true;
    const ok = await entsperren();
    laeuft.current = false;
    if (ok) setGesperrt(false);
  }, []);

  useEffect(() => {
    if (!z.appSperre) {
      setGesperrt(false);
      return;
    }
    const abo = AppState.addEventListener('change', (stand) => {
      if (stand === 'background') setGesperrt(true);
    });
    return () => abo.remove();
  }, [z.appSperre]);

  useEffect(() => {
    if (gesperrt) versuchen();
  }, [gesperrt, versuchen]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {gesperrt ? (
        <LinearGradient colors={verlaeufe.start} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}>
          <Flagge groesse={64} />
          <Txt groesse={26} gewicht="serifFett" mitte>
            Rote Flagge ist gesperrt
          </Txt>
          <Txt groesse={15} farbe={farben.textLeise} mitte>
            Nur du kannst dein Tagebuch öffnen.
          </Txt>
          <Knopf text="Entsperren" onPress={versuchen} stil={{ alignSelf: 'stretch' }} />
        </LinearGradient>
      ) : null}
    </View>
  );
}
