import { Redirect } from 'expo-router';
import { useApp } from '@/state/store';

export default function Start() {
  const { z } = useApp();
  return <Redirect href={z.onboardingFertig ? '/tagebuch' : '/onboarding'} />;
}
