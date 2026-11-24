# Rote Flagge: Verlauf (Archiv der alten CLAUDE.md)

Am 24.11.2026 aus CLAUDE.md hierher verschoben (Raoul: CLAUDE.md-Widersprüche aufräumen wie bei Mikropolis). Die alte CLAUDE.md mischte den Neuaufbau vom 23.11. mit dem MVP vom 11.11. (heller Creme-Look, 10 Aussagen, Speicher v1, `einordnenKI.ts`). Hier steht alles mit Datum. Neuere Abschnitte gelten vor älteren. Neue Stand-Notizen kommen oben unter "Neu" dazu, die CLAUDE.md enthält nur, was heute gilt.

## Neu
- 24.11.2026: Bewertungs-Karte im Onboarding nach dem Ergebnis (wie Gedankenpflanzen). Vor dem Test-App-Update stand preview auf Update-Gruppe cd80b044-8613-4f07-aa54-1a9fe044c2ee, zum Zurückrollen mit `update:republish --group cd80b044-8613-4f07-aa54-1a9fe044c2ee`.
- 24.11.2026: Onboarding neu (Willkommen mit Knäuel, Flaggen zählen, Plan in 3 Schritten) und App mit 3 Tabs. Vor dem Test-App-Update stand preview auf Update-Gruppe 9c3b3479-a8ee-4618-af4b-ad591a862a52, zum Zurückrollen mit `update:republish --group 9c3b3479-a8ee-4618-af4b-ad591a862a52`.
- 24.11.2026: Paywall: Monatsabo immer sichtbar (beide Abos ohne "Alle Pläne"). Vor dem Test-App-Update stand preview auf Update-Gruppe da40faad-17b0-46c8-8bf5-6f83d2614e19, zum Zurückrollen mit `update:republish --group da40faad-17b0-46c8-8bf5-6f83d2614e19`.
- 24.11.2026: Paywall nach Split-Test-Bibliothek: Jahresabo als Monatspreis (3,33 €), Monatsabo hinter "Alle Pläne", "Heute 0 €. Jederzeit kündbar.", Knäuel größer.
- 23.11.2026: Erster Preview-Build 1.0.0 mit Symbol Variante B: https://expo.dev/accounts/raoul1998/projects/rote-flagge/builds/c5561692-571a-4cac-b11f-be77e88daf98

---

# Alte CLAUDE.md (Stand 24.11.2026 morgens)

# Rote Flagge: App-Code

**Neuaufbau seit 23.11.2026 (Raoul):** Rote Flagge ist eine Beziehungs-App für jede Phase (Kennenlernen, Es ist kompliziert/warmgehalten, Zusammen, Getrennt) nach dem Drangduell-Prinzip: große Zahl ("Tage Kontaktpause" nach der Trennung, sonst "Tage bei dir"), großer SOS-Knopf "Ich will ihm schreiben", Tagebuch mit Spracheingabe (jede Eintragung = eine rote Flagge auf dem Hügel) und KI-Musterbericht mit Bildern (Heiß-kalt-Kurve, Muster-Karten, "Was gesagt wird / was passiert"). Konzept: Claude Doc https://claude.ai/artifact/MPF8eHZue6B6xwbvyPPboQ.
Kernversprechen: "Wieder klar sehen." Fabrik-App (Hintergrund: `claude-wissen/wissen/app-fabrik/README.md`, alter Konzept-Ordner `apps/knaeuel/`).

## Aufbau heute (23.11.2026)
- Design: warme Nacht (Pflaume, `src/theme.ts`), Halation in Koralle/Morgenrot (`src/components/Licht.tsx`), Koralle `#FF7A63` nur für Flagge, Hauptknopf, Fortschritt, auf Koralle dunkle Schrift. Überschriften Fraunces weiß mit dunkler Kontur, Text Nunito.
- **Maskottchen: das Knäuel** (Raoul 23.11.2026, Vorlage `docs/maskottchen-ideen/2-knaeuel-entwirren.png`): koralle Wollknäuel, am Anfang verheddert, entwirrt sich mit den Tagen ("Wieder klar sehen"). 12 KI-Posen (Nano Banana am Mac mini) in `assets/figur/<pose>.png` (stehen, winken, jubeln, troesten, entwirren, verheddert, denken, schlafen, flagge, atmen, handy, zeigen; 368 px, transparent, Füße unten), Übersicht `docs/maskottchen-ideen/knaeuel-posen.jpg`. Eingebaut über `Figur` (`src/components/Figur.tsx`, art "du"). Heute: Stufe Nacht = verheddert, Morgengrauen = entwirren. Die andere Person = graue Strichfigur ohne Gesicht (art "schatten"). Die rote Flagge bleibt Symbol und Belohnung (`KleineFlagge`), das Knäuel hält sie hoch.
- Szene (`Szene.tsx`, Stufen `src/data/stufen.ts`): Nacht, Morgengrauen (3), Sonnenaufgang (7), Neuer Tag (14), Weites Land (30). Flaggen = Einträge.
- Onboarding (`src/app/onboarding.tsx`, Ablauf `ABLAUF`): 2 Intro-Szenen, Phase (`src/data/phasen.ts`), Person mit Pronomen und Name (`src/data/person.ts`, `formen()` für alle Texte er/sie/neutral), 5 Fragen (`src/data/quiz.ts`: Karten, Chips, Regler), Ziel 30/60/90, Auswertung, Ergebnis ("Dein Muster"), SOS ausprobieren (echte Nachricht parken), erste Flagge, Plan, Erinnerung (Zeitrad), Paywall (Optik, 39,99/7,99).
- Tabs (`src/app/(tabs)/`): Heute, Tagebuch, SOS-Knopf Mitte (öffnet `src/app/sos.tsx`: schreiben, eigene Flaggen + verblassende Schattenfigur, parken, Atemrunde 4/2/6, geschafft), Muster, Profil (= `einstellungen.tsx`).
- Eintrag (`eintrag.tsx`): erzählen, warm/kalt (`waerme`), Gefühl, Kategorien (neu `warmkalt`).
- KI: `src/ki/musterKI.ts` mit `KI_AKTIV = false`, sonst rechnet `lokalerBericht()` selbst. Server-Funktion vorbereitet in `supabase/functions/rote-flagge-muster/` (nicht hochgeladen, Limit-Tabelle fehlt). Einwilligung per Schalter in Muster (`z.kiEinwilligung`).
- Speicher `rote-flagge-v2` (alte v1-Einträge werden übernommen, Onboarding startet neu).
- Töne fehlen noch (expo-audio braucht neuen Build, dann Dopamin-Baukasten aus Drangduell mit `requireOptionalNativeModule`-Schutz).

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
- Warm statt Alarm: Rot ist Akzent und Symbol, keine Warnfarbe. Die rote Flagge ist nur Symbol, das Maskottchen ist das Knäuel.

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
- Bundle-ID `com.raoulstamm.roteflagge` ist ein **Platzhalter** (vor dem ersten Build mit Raoul klären; Kopfkiste nutzt `com.raoulstamm.…`).

## Aufbau
- `src/app/onboarding.tsx`: Start, Quiz "Ist das noch normal?" (10 Aussagen in `src/data/quiz.ts`), Ergebnis, Plan, Erinnerung, Paywall.
- `src/app/(tabs)/`: `tagebuch.tsx` (Start mit großem Sprechen-Knopf und Liste), `muster.tsx` (Auswertung ohne KI, `src/data/muster.ts`), `sos.tsx` (Schreib's hier statt ihm, Kontaktpause). Schwebende Leiste mit Zahnrad in `_layout.tsx`.
- `src/app/eintrag.tsx`: geführter Eintrag (Was ist passiert? Wie ging's dir danach? Was davon trifft zu? Festgehalten). Kategorien und Gefühle in `src/data/kategorien.ts`.
- `src/app/ansehen.tsx` (Eintrag ansehen, löschen), `src/app/geparkt.tsx` (nach 24 Stunden löschen oder behalten), `src/app/einstellungen.tsx`.
- `src/state/store.tsx`: gesamter Zustand (`useApp`), gespeichert unter `rote-flagge-v1`.

## Prüfen und Testen
- Vor "fertig": `npx tsc --noEmit` und `npx expo-doctor`.
- Browser-Test: `npm run web-export` und danach `npm run screenshots` (Playwright, 390 x 844). Fotos landen in `docs/screenshots/`, Konsolenfehler werden gemeldet. Fotos selbst ansehen. Im Web fehlen Sprache, Face ID und Benachrichtigungen.
- Test-App auf dem iPhone: EAS-Projekt @raoul1998/rote-flagge (ID af819422-dc2d-40ab-bfd0-6280a2336cca). Erster Preview-Build 23.11.2026 (Version 1.0.0, Symbol Variante B): https://expo.dev/accounts/raoul1998/projects/rote-flagge/builds/c5561692-571a-4cac-b11f-be77e88daf98 . Credentials liegen bei Expo, Builds laufen `--non-interactive`. Neue Stände per `npx -y eas-cli@latest update --channel preview --environment preview --platform ios --message "..." --non-interactive`. Builds nur nach Raouls OK (Expo-Kontingent kostet extra, wenn verbraucht).

## Offene Punkte
- Apple-App in App Store Connect anlegen (für Store). Bundle-ID und EAS-Projekt sind erledigt (23.11.2026).
- Preise festlegen, RevenueCat einbauen (harte Paywall: Jahresabo mit 7 Tagen gratis, Monatsabo).
- KI-Einordnung über Supabase (Kopfkiste-Projekt) mit Einwilligung.
- PDF-Export der Einträge als Premium-Grund (gewünscht, später).
- Texte sprechen von "er/ihm". Raoul (11.11.2026): Entscheidung nach Recherche, welche Pronomen die viralen US-Skripte der Nische nutzen.
- Hilfe-Nummern für DE, AT, CH in `src/data/hilfe.ts` (Stand 11.11.2026), vor Veröffentlichung prüfen. Kurzliste im Ergebnis zeigt nur DE-Nummern, später nach Land wählen.
- Datenschutzerklärung, App-Icon = lebendiges Fähnchen mit Funkeln (Variante B, `docs/maskottchen-ideen/icon-variante-B.png`, Raoul 23.11.2026: Symbol Fähnchen, in der App das Knäuel), Store-Texte, Support-Adresse aurorealis.apps@gmail.com.
- Einwilligung und PostHog erst, wenn Statistik gewollt ist (Eventnamen aus `wissen/werkzeuge.md`, nie Eintragstexte).
