import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { farben, schrift } from '@/theme';

type Props = TextProps & {
  groesse?: number;
  gewicht?: keyof typeof schrift;
  farbe?: string;
  mitte?: boolean;
};

// Alle Texte laufen über Txt. Zeilenhöhe großzügig, damit Umlaut-Punkte nie abgeschnitten werden
// (Lektion aus Gedankenpflanzen: mindestens 1,45 bei Nunito; Fraunces-Überschriften 1,3 wegen großer Größen).
export function Txt({ groesse = 16, gewicht = 'normal', farbe, mitte, style, children, ...rest }: Props) {
  const flat = (StyleSheet.flatten(style) as TextStyle | undefined) ?? {};
  const size = flat.fontSize ?? groesse;
  const serif = gewicht === 'serif' || gewicht === 'serifFett';
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: schrift[gewicht],
          fontSize: size,
          lineHeight: Math.round(size * (serif ? 1.3 : 1.45)),
          color: farbe ?? farben.text,
          includeFontPadding: false,
          textAlign: mitte ? 'center' : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
