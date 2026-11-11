import { Platform } from 'react-native';

// App-Sperre per Face ID bzw. Code (expo-local-authentication). Optional, in den Einstellungen.
// Im Browser oder ohne Modul gibt es keine Sperre: dann meldet verfuegbar() false.

type L = typeof import('expo-local-authentication');
let l: L | null | undefined;
function lade(): L | null {
  if (l !== undefined) return l;
  l = null;
  if (Platform.OS === 'web') return l;
  try {
    const { requireOptionalNativeModule } = require('expo');
    if (!requireOptionalNativeModule('ExpoLocalAuthentication')) return l;
    l = require('expo-local-authentication') as L;
  } catch {
    l = null;
  }
  return l;
}

export async function sperreVerfuegbar(): Promise<boolean> {
  const m = lade();
  if (!m) return false;
  try {
    return (await m.hasHardwareAsync()) && (await m.isEnrolledAsync());
  } catch {
    return false;
  }
}

export async function entsperren(): Promise<boolean> {
  const m = lade();
  if (!m) return true;
  try {
    const r = await m.authenticateAsync({ promptMessage: 'Rote Flagge entsperren', cancelLabel: 'Abbrechen', fallbackLabel: 'Code eingeben' });
    return r.success;
  } catch {
    return false;
  }
}
