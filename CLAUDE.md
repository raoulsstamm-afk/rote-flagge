# Rote Flagge: App-Code

Rote Flagge ist ein Beweis-Tagebuch für Menschen in Beziehungen, die sie verunsichern (Partner, Ex, Familie).
Kernversprechen: "Halte fest, was passiert. Damit du dir selbst wieder glaubst." Vorfälle mit Datum festhalten (sprechen oder tippen), nach ein paar Wochen zeigt die App das Muster. Zweiter Baustein: "Schreib's hier statt ihm" (Nachricht 24 Stunden parken, Kontaktpause-Zähler).
Fabrik-App Nr. 3 (Hintergrund: `claude-wissen/wissen/app-fabrik/README.md`, Konzept `apps/knaeuel/konzept-entwurf.md`, Arbeitstitel war "Knäuel").

## Für jeden Claude, der hier arbeitet
- Raoul programmiert nicht selbst. Erklärungen einfach halten, Dashboard-Schritte klickgenau. Antworten und App-Texte auf Deutsch, keine Gedankenstriche (em-dashes).
- Vorher lesen: `claude-wissen/wissen/app-entwicklung-lektionen.md` und `konten-und-zugaenge.md`.
- Raoul hat erlaubt, in dieses Repo (Branch `main`) direkt zu pushen. Builds, Store, Käufe weiter nur nach Rückfrage.
- Git-Autor: Name "Raoul", Mail raouls.stamm@gmail.com (öffentliche Adresse, nie eine andere).

## Rote Linien
- **Keine Ferndiagnosen.** Nie "Narzisst", "toxischer Mensch", Störungen oder andere Etiketten für die andere Person. Immer Verhalten beschreiben ("hat mich ignoriert", "Schuld umgedreht").
- **Keine Heilversprechen**, keine Therapie-Versprechen. Rote Flagge ist ein Tagebuch, keine Therapie und keine Beratung. Kein Rat "trenn dich" oder "bleib".
- **Daten nur lokal** (AsyncStorage). Keine Konten, kein Server, keine Statistik. Beziehungsinhalte sind Gesundheitsdaten (Art. 9 DSGVO) und Daten Dritter.
- **Sicherheit:** Hilfe-Nummern sichtbar (Ergebnis, Einstellungen, bei Kategorie "Bedroht oder angefasst"): Hilfetelefon 116 016, Notruf 110 (Liste in `src/data/hilfe.ts`). Benachrichtigungen verraten nie Inhalte ("Kurzer Moment für dich"). App-Sperre per Face ID optional.
- Die App schickt nie selbst eine Nachricht ab.
- Warm statt Alarm: Rot ist Akzent und Symbol, keine Warnfarbe. Die rote Flagge ist nur Symbol, kein Maskottchen.

## Design (aus dem Fabrik-Entwurf, Kopfkiste-Stil)
- Verläufe pro Bildschirm: Creme `#FFF3EA`, Pfirsich `#FBE1D6`, Rose `#F3D3D2`, Flieder `#EADBE6` (`src/theme.ts`, `verlaeufe`).
- Akzent `#B8463C` mit Verlauf zu `#E0705A`. Text `#4A3D35`, leise `#6E6057`.
- Überschriften in Serifen **Fraunces** (`gewicht="serif"` / `"serifFett"`), Text **Nunito**. Alles über `Txt` (Zeilenhöhe 1,45, Umlaute).
- Weiße Karten mit weichem Schatten (`Karte`), Pillen-Knöpfe mit Verlauf (`Knopf`), Chips (`Chip`), alles federt beim Drücken und vibriert (mittel bei Hauptknöpfen und Auswahl, leicht bei Kleinem, Erfolg beim Speichern).
- Inhalte erscheinen nacheinander (`Einblenden`), Balken füllen sich (`Balken`).
- Ein Bildschirm macht eine Sache. Onboarding ohne Scrollen auf 390 x 844. Kein Auto-Weiter außer bei Quiz-Antworten.
- UI/UX-Regeln der Fabrik (`app-fabrik/ui-ux-muster.md`, Vorschläge 1 bis 5 und 9): eine große Zahl plus ein Knopf, harte Paywall direkt nach Ergebnis und Plan, Quiz-Antworten tauchen im Plan wieder auf, erster Erfolg in der ersten Minute, sanfte Streaks (Kontaktpause mit sanftem Neustart, längste Pause bleibt).

## Technik
- Expo SDK 57, React Native 0.86, TypeScript, Expo Router (Routen in `src/app/`). Versionen wie Kopfkiste. Neue Pakete immer mit `npx expo install`.
- Spracheingabe: `src/sprache.ts` (übernommen aus Kopfkiste) und `src/components/Sprechknopf.tsx`. Braucht einen eigenen Build (expo-speech-recognition). Im Browser und ohne Modul fällt sie sauber aufs Tippen zurück.
- App-Sperre: `src/sperre.ts` (expo-local-authentication), Sperrbildschirm in `src/components/Sperre.tsx`.
- Benachrichtigungen (lokal): `src/benachrichtigung.ts` (tägliche Erinnerung, geparkte Nachricht nach 24 Stunden bereit).
- **KI-Einordnung ist nur vorbereitet:** `src/ki/einordnenKI.ts` mit `KI_AKTIV = false`, ruft keinen Server an. Später Supabase-Funktion im Kopfkiste-Projekt (Muster `kopfkiste/src/ki/sortierenKI.ts`), mit Einwilligung, Tageslimit, nur für Zahlende.
- Paywall ist nur Optik. Preise sind Platzhalter in `src/data/preise.ts`. Knopf "Weiter (Test)" führt in die App.
- Bundle-ID `com.raoulsstamm.roteflagge` ist ein **Platzhalter** (vor dem ersten Build mit Raoul klären; Kopfkiste nutzt `com.raoulstamm.…`).

## Aufbau
- `src/app/onboarding.tsx`: Start, Quiz "Ist das noch normal?" (10 Aussagen in `src/data/quiz.ts`), Ergebnis, Plan, Erinnerung, Paywall.
- `src/app/(tabs)/`: `tagebuch.tsx` (Start mit großem Sprechen-Knopf und Liste), `muster.tsx` (Auswertung ohne KI, `src/data/muster.ts`), `sos.tsx` (Schreib's hier statt ihm, Kontaktpause). Schwebende Leiste mit Zahnrad in `_layout.tsx`.
- `src/app/eintrag.tsx`: geführter Eintrag (Was ist passiert? Wie ging's dir danach? Was davon trifft zu? Festgehalten). Kategorien und Gefühle in `src/data/kategorien.ts`.
- `src/app/ansehen.tsx` (Eintrag ansehen, löschen), `src/app/geparkt.tsx` (nach 24 Stunden löschen oder behalten), `src/app/einstellungen.tsx`.
- `src/state/store.tsx`: gesamter Zustand (`useApp`), gespeichert unter `rote-flagge-v1`.

## Prüfen und Testen
- Vor "fertig": `npx tsc --noEmit` und `npx expo-doctor`.
- Browser-Test: `npm run web-export` und danach `npm run screenshots` (Playwright, 390 x 844). Fotos landen in `docs/screenshots/`, Konsolenfehler werden gemeldet. Fotos selbst ansehen. Im Web fehlen Sprache, Face ID und Benachrichtigungen.
- Test-App auf dem iPhone: **noch nicht eingerichtet.** Es gibt noch kein EAS-Projekt (kein `eas init`, kein Build). Ablauf wie bei Kopfkiste: `npx eas-cli init` (legt `extra.eas.projectId` und `owner` an), in `app.json` `updates.url` ergänzen, Preview-Build (`eas build --profile preview --platform ios`, Kanal "preview"), danach neue Stände per `npx eas-cli update --channel preview --environment preview --platform ios --message "..."`. Build und Login macht Raoul bzw. nur nach seinem OK.

## Offene Punkte
- Bundle-ID, Apple-App und EAS-Projekt anlegen (Raoul).
- Preise festlegen, RevenueCat einbauen (harte Paywall: Jahresabo mit 7 Tagen gratis, Monatsabo).
- KI-Einordnung über Supabase (Kopfkiste-Projekt) mit Einwilligung.
- PDF-Export der Einträge als Premium-Grund (gewünscht, später).
- Texte sprechen von "er/ihm". Prüfen, ob es eine neutrale Variante braucht (Eltern, Freundin, Chefin).
- Hilfe-Nummern vor Veröffentlichung prüfen, Österreich und Schweiz ergänzen.
- Datenschutzerklärung, App-Icon (derzeit Platzhalter-Flagge), Store-Texte, Support-Adresse aurorealis.apps@gmail.com.
- Einwilligung und PostHog erst, wenn Statistik gewollt ist (Eventnamen aus `wissen/werkzeuge.md`, nie Eintragstexte).
