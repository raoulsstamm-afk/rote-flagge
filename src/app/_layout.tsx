import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, useFonts } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { planeTaeglich } from '@/benachrichtigung';
import { Sperre } from '@/components/Sperre';
import { StoreProvider, useApp } from '@/state/store';
import { farben } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Test-App: beim Start nach neuem Stand suchen (EAS Update, Kanal "preview"), solange der Splash zu sehen ist.
// Neu geladen wird nur, wenn das in den ersten Sekunden klappt. Ohne EAS-Projekt (noch kein eas init) passiert nichts.
const UPDATE_WARTEZEIT = 3000;
let updateFertig: () => void = () => {};
const updatePruefung = new Promise<void>((fertig) => {
  updateFertig = fertig;
  setTimeout(fertig, UPDATE_WARTEZEIT);
});
async function neuesUpdateLaden() {
  const start = Date.now();
  try {
    if (__DEV__ || !Updates.isEnabled) return;
    const pruefung = await Updates.checkForUpdateAsync();
    if (!pruefung.isAvailable) return;
    await Updates.fetchUpdateAsync();
    if (Date.now() - start < UPDATE_WARTEZEIT) await Updates.reloadAsync();
  } catch {
    // ohne Internet einfach mit dem gespeicherten Stand weitermachen
  } finally {
    updateFertig();
  }
}
neuesUpdateLaden();

function Inhalt() {
  const { geladen, z } = useApp();
  const [fontsDa] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold, Fraunces_600SemiBold, Fraunces_700Bold });
  const [updateGeprueft, setUpdateGeprueft] = useState(false);
  useEffect(() => {
    updatePruefung.then(() => setUpdateGeprueft(true));
  }, []);
  const bereit = geladen && fontsDa && updateGeprueft;

  useEffect(() => {
    if (bereit) SplashScreen.hideAsync().catch(() => {});
  }, [bereit]);

  // Tägliche Erinnerung immer passend zur gewählten Uhrzeit planen
  useEffect(() => {
    if (geladen && z.onboardingFertig) planeTaeglich(z.erinnerung);
  }, [geladen, z.onboardingFertig, z.erinnerung]);

  if (!bereit) return null;
  return (
    <Sperre>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: farben.creme } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="eintrag" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="ansehen" />
        <Stack.Screen name="geparkt" />
        <Stack.Screen name="einstellungen" />
      </Stack>
    </Sperre>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Inhalt />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
