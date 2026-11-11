import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { farben } from '@/theme';

// Einfache, runde Symbole. Die rote Flagge ist nur Symbol der App, kein Maskottchen.
type P = { groesse?: number; farbe?: string };

export function Flagge({ groesse = 28, farbe = farben.akzent, rand = farben.text }: P & { rand?: string }) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M5 21V3" stroke={rand} strokeWidth={2.4} strokeLinecap="round" />
      <Path d="M5 4h12l-2.5 4L17 12H5z" fill={farbe} stroke={rand} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function Mikro({ groesse = 44, farbe = farben.weiss }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Rect x="9" y="3" width="6" height="11" rx="3" fill={farbe} />
      <Path d="M6 11a6 6 0 0 0 12 0M12 17v4" stroke={farbe} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function Buch({ groesse = 26, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v16H5.5C4.7 20 4 19.3 4 18.5z" stroke={farbe} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5c.8 0 1.5-.7 1.5-1.5z" stroke={farbe} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

export function Saeulen({ groesse = 26, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M5 20v-6M12 20V5M19 20v-9" stroke={farbe} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

export function Sprechblase({ groesse = 26, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M4 6.5C4 5.1 5.1 4 6.5 4h11C18.9 4 20 5.1 20 6.5v7c0 1.4-1.1 2.5-2.5 2.5H11l-4.5 4v-4h0C5.1 16 4 14.9 4 13.5z" stroke={farbe} strokeWidth={2} fill="none" strokeLinejoin="round" />
      <Path d="M9 10h6" stroke={farbe} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function Zahnrad({ groesse = 24, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path
        d="M12 2.8l1.6 2.2 2.6-.7.6 2.6 2.6.6-.7 2.6 2.2 1.6-2.2 1.6.7 2.6-2.6.6-.6 2.6-2.6-.7L12 21.2l-1.6-2.2-2.6.7-.6-2.6-2.6-.6.7-2.6L3.1 12l2.2-1.6-.7-2.6 2.6-.6.6-2.6 2.6.7z"
        stroke={farbe}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3.2" stroke={farbe} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function Schloss({ groesse = 20, farbe = farben.textLeise }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Rect x="5" y="10.5" width="14" height="10" rx="3" stroke={farbe} strokeWidth={2} fill="none" />
      <Path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke={farbe} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function Haken({ groesse = 22, farbe = farben.weiss }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" stroke={farbe} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Zurueck({ groesse = 22, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" stroke={farbe} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function Kreuz({ groesse = 20, farbe = farben.text }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M6 6l12 12M18 6L6 18" stroke={farbe} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

export function Stift({ groesse = 18, farbe = farben.textLeise }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" stroke={farbe} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </Svg>
  );
}

export function Telefon({ groesse = 18, farbe = farben.akzent }: P) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path
        d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"
        stroke={farbe}
        strokeWidth={2}
        fill="none"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
