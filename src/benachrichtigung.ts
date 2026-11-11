import { Platform } from 'react-native';

// Lokale Benachrichtigungen (kein Server): tägliche Erinnerung und "geparkte Nachricht ist bereit".
// Die Texte verraten bewusst nichts über den Inhalt, falls jemand anderes aufs Handy schaut.
// Im Browser gibt es das nicht, deshalb wird das Paket vorsichtig geladen und jeder Fehler geschluckt.

type N = typeof import('expo-notifications');
let n: N | null | undefined;
function lade(): N | null {
  if (n !== undefined) return n;
  n = null;
  if (Platform.OS === 'web') return n;
  try {
    n = require('expo-notifications') as N;
    n.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
  } catch {
    n = null;
  }
  return n;
}

export async function erlaubnisAnfragen(): Promise<boolean> {
  const m = lade();
  if (!m) return false;
  try {
    const jetzt = await m.getPermissionsAsync();
    if (jetzt.granted) return true;
    return (await m.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// Tägliche sanfte Erinnerung zur gewählten Uhrzeit ("20:00"). null schaltet sie ab.
export async function planeTaeglich(uhrzeit: string | null) {
  const m = lade();
  if (!m) return;
  try {
    await m.cancelScheduledNotificationAsync('taeglich').catch(() => {});
    if (!uhrzeit) return;
    const [stunde, minute] = uhrzeit.split(':').map(Number);
    await m.scheduleNotificationAsync({
      identifier: 'taeglich',
      content: { title: 'Kurzer Moment für dich', body: 'Ist heute etwas passiert, das du festhalten willst?' },
      trigger: { type: m.SchedulableTriggerInputTypes.DAILY, hour: stunde, minute },
    });
  } catch {
    // Erinnerungen sind freundlich gemeint, aber nicht lebenswichtig
  }
}

// Nach 24 Stunden: geparkte Nachricht wartet auf eine Entscheidung
export async function planeGeparkt(id: string, bis: number) {
  const m = lade();
  if (!m || bis <= Date.now() + 5000) return;
  try {
    await m.scheduleNotificationAsync({
      identifier: `geparkt-${id}`,
      content: { title: 'Kurzer Moment für dich', body: 'Etwas wartet auf deine Entscheidung.' },
      trigger: { type: m.SchedulableTriggerInputTypes.DATE, date: new Date(bis) },
    });
  } catch {
    // siehe oben
  }
}

export async function absagenGeparkt(id: string) {
  const m = lade();
  if (!m) return;
  await m.cancelScheduledNotificationAsync(`geparkt-${id}`).catch(() => {});
}

export async function alleAbsagen() {
  const m = lade();
  if (!m) return;
  await m.cancelAllScheduledNotificationsAsync().catch(() => {});
}
