# Rote Flagge: App-Code

Beziehungs-App für jede Phase (Kennenlernen, Es ist kompliziert/warmgehalten, Zusammen, Getrennt) nach dem Drangduell-Prinzip: eine große Zahl ("Tage Kontaktpause" nach der Trennung, sonst "Tage bei dir"), ein großer SOS-Knopf ("Ich will ihm schreiben"), Tagebuch mit Spracheingabe (jeder Eintrag = eine rote Flagge auf dem Hügel) und Musterbericht mit Bildern (Heiß-kalt-Kurve, Muster-Karten, "Was gesagt wird / was passiert"). Kernversprechen: "Wieder klar sehen."
Neuaufbau seit 23.11.2026. Konzept: Claude Doc https://claude.ai/artifact/MPF8eHZue6B6xwbvyPPboQ. Fabrik-Regeln: claude-wissen `wissen/app-fabrik/README.md`, Raouls Design-Regeln `wissen/app-fabrik/ui-ux-muster.md` (oben), alter Konzept-Ordner `apps/knaeuel/`.
**Verlauf und alle Details mit Datum:** `docs/claude-verlauf.md` (Archiv seit 24.11.2026, enthält auch den alten MVP-Stand vom 11.11.). Diese Datei enthält nur, was heute gilt. Neue Entscheidungen hier einarbeiten (Veraltetes ersetzen, nicht darunter stapeln), Verlaufsnotizen ins Archiv.

## Für jeden Claude, der hier arbeitet
- Raoul programmiert nicht. Einfach erklären, Dashboard-Schritte klickgenau. Antworten und App-Texte auf Deutsch, keine Gedankenstriche.
- Vorher lesen: claude-wissen `wissen/app-entwicklung-lektionen.md` (auch "Test-App-Update zurückrollen") und `konten-und-zugaenge.md`.
- Pushen auf `main` erlaubt. Updates an die Test-App erlaubt. Builds (Expo-Kontingent kostet extra), Store, Käufe nur nach Raouls OK.
- Git-Autor "Raoul", raouls.stamm@gmail.com (nie eine andere Adresse). Commits auf Deutsch. Keine Secrets in Dateien.

## Rote Linien
- **Keine Ferndiagnosen.** Nie "Narzisst", "toxischer Mensch", Störungen oder andere Etiketten für die andere Person. Immer Verhalten beschreiben ("hat mich ignoriert", "Schuld umgedreht").
- **Keine Heilversprechen**, keine Therapie-Versprechen. Tagebuch, keine Therapie und keine Beratung. Kein Rat "trenn dich" oder "bleib".
- **Daten nur lokal** (AsyncStorage). Keine Konten, keine Statistik. Beziehungsinhalte sind Gesundheitsdaten (Art. 9 DSGVO) und Daten Dritter. KI nur mit Einwilligung (`z.kiEinwilligung`).
- **Sicherheit:** Hilfe-Nummern sichtbar (Ergebnis, Einstellungen, bei Kategorie "Bedroht oder angefasst"): Hilfetelefon 116 016, Notruf 110 (Liste DE/AT/CH in `src/data/hilfe.ts`, Kurzliste im Ergebnis nur DE). Benachrichtigungen verraten nie Inhalte ("Kurzer Moment für dich"). App-Sperre per Face ID optional.
- Die App schickt nie selbst eine Nachricht ab.
- Warm statt Alarm: Koralle ist Akzent und Symbol, keine Warnfarbe. Die rote Flagge ist Symbol und Belohnung, das Maskottchen ist das Knäuel.

## Design (warme Nacht)
- Dunkle Pflaume-Verläufe (`src/theme.ts`: `nachtOben` #120C1C, `nachtMitte` #1B1027, `nachtUnten` #2A1426, `verlaeufe` je Bildschirm). Die Namen `creme`, `pfirsich`, `rose`, `flieder` sind historisch und enthalten heute dunkle Töne. Farben nur aus `src/theme.ts`.
- Halation (Lichtschein) in Koralle/Morgenrot (`src/components/Licht.tsx`). Akzent Koralle `#FF7A63` nur für Flagge, Hauptknopf und Fortschritt, auf Koralle dunkle Schrift. Text weiß bzw. `textLeise` #E6DCE8.
- Überschriften **Fraunces** (`gewicht="serif"`/`"serifFett"`) weiß mit dunkler Kontur, Text **Nunito**, alles über `Txt` (Zeilenhöhe 1,45 wegen Umlauten).
- Dunkle Karten (`karte` #17101E), Pillen-Knöpfe, Chips, `Einblenden`, `Balken` in `src/components/ui.tsx`. Alles federt und vibriert (mittel bei Hauptknöpfen und Auswahl, leicht bei Kleinem, Erfolg beim Speichern). Zahlen und Uhrzeiten über `Drehrad.tsx` (`Zeitrad`).
- Ein Bildschirm macht eine Sache. Onboarding ohne Scrollen auf 390 x 844. Eine große Zahl plus ein Knopf, harte Paywall direkt nach Ergebnis und Plan, Quiz-Antworten tauchen im Plan wieder auf, erster Erfolg in der ersten Minute, sanfte Streaks (Kontaktpause mit sanftem Neustart, längste Pause bleibt).
- **Maskottchen: das Knäuel** (Raoul 23.11.2026, Vorlage `docs/maskottchen-ideen/2-knaeuel-entwirren.png`): koralle Wollknäuel, am Anfang verheddert, entwirrt sich mit den Tagen. 12 KI-Posen (Nano Banana am Mac mini) in `assets/figur/<pose>.png` (stehen, winken, jubeln, troesten, entwirren, verheddert, denken, schlafen, flagge, atmen, handy, zeigen; 368 px, transparent, Füße unten), Übersicht `docs/maskottchen-ideen/knaeuel-posen.jpg`. Eingebaut über `Figur` (`src/components/Figur.tsx`, art "du"). Die andere Person = graue Strichfigur ohne Gesicht (art "schatten"). Das Knäuel hält die Flagge (`KleineFlagge`) hoch.
- App-Symbol: lebendiges Fähnchen mit Funkeln (Variante B, `docs/maskottchen-ideen/icon-variante-B.png`). Startbild schwarz mit Aurorealis-Intro (`MarkenIntro.tsx`).

## Aufbau heute
- **Szene** (`Szene.tsx`, Stufen `src/data/stufen.ts`): Nacht, Morgengrauen (3), Sonnenaufgang (7), Neuer Tag (14), Weites Land (30). Flaggen = Einträge. Stufe Nacht = Knäuel verheddert, Morgengrauen = entwirren.
- **Onboarding** (`src/app/onboarding.tsx`, Ablauf `ABLAUF`, Raoul 24.11.2026): Willkommen (Knäuel schwenkt die Fahne, Flaggen steigen auf), "Wie viele rote Flaggen zählst du?" (5 Nachrichten antippen, auflösen, `NACHRICHTEN`), Phase (`src/data/phasen.ts`), Person mit Pronomen und Name (`src/data/person.ts`, `formen()` für er/sie/neutral), 6 Fragen (`src/data/quiz.ts`: Karten, 2 Regler mit Knäuel-Posen je Stufe, Chips), Ziel 30/60/90 als Regler, Auswertung, Ergebnis ("Dein Muster"), SOS ausprobieren (echte Nachricht parken), erste Flagge, Plan in 3 Schritten mit bewegten Bildern (Anzeichen festhalten, Muster erkennen, Muster auflösen; kein Tag-30-Weg), Erinnerung (`Zeitrad`), Paywall. Das Knäuel steht neben den Überschriften und reagiert auf jede Antwort (`TitelMitFigur`, `PopFigur`: ploppt und vibriert).
- **Paywall** (im Onboarding, nur Optik): Jahresabo als Monatspreis (3,33 €, 39,99 €/Jahr, 7 Tage gratis), Monatsabo 7,99 € erst hinter "Alle Pläne", "Heute 0 €. Jederzeit kündbar.", Zeitleiste Heute/Tag 5/Tag 7. Preise in `src/data/preise.ts`. Knopf "Weiter (Test)" führt in die App. Noch kein RevenueCat.
- **Tabs** (Raoul 24.11.2026: 3 Tabs, je eine klare Funktion = die 3 Schritte aus dem Plan; schwebende Leiste in `src/app/(tabs)/_layout.tsx`): Tagebuch (Schritt 1, festhalten), Heute in der Mitte (Schritt 3, auflösen: große Zahl, Szene, SOS-Knopf öffnet `src/app/sos.tsx`), Muster (Schritt 2, erkennen). Kopf jedes Tabs mit Schritt-Zeile und Zahnrad zu den Einstellungen: `src/components/TabKopf.tsx`.
- **Eintrag** (`src/app/eintrag.tsx`): erzählen, warm/kalt (`waerme`), Gefühl, Kategorien (`src/data/kategorien.ts`, darunter `warmkalt`). Dazu `ansehen.tsx` (ansehen, löschen) und `geparkt.tsx` (geparkte Nachricht nach 24 Stunden löschen oder behalten).
- **Musterbericht:** `src/ki/musterKI.ts` mit `KI_AKTIV = false`, dann rechnet `lokalerBericht()` selbst (Grundlage `src/data/muster.ts`). Server-Funktion vorbereitet in `supabase/functions/rote-flagge-muster/` (nicht hochgeladen, Limit-Tabelle fehlt). Später im Kopfkiste-Projekt mit Einwilligung, Tageslimit, nur für Zahlende.
- **Zustand:** `src/state/store.tsx` (`useApp`), gespeichert unter `rote-flagge-v2`. Alte Einträge aus `rote-flagge-v1` werden übernommen, das Onboarding startet neu.
- Töne fehlen noch (expo-audio braucht neuen Build, dann Dopamin-Baukasten aus Drangduell mit `requireOptionalNativeModule`-Schutz).

- **Wunsch-Wand** (seit 25.11.2026, Eingang neben "Feedback geben"): Nutzer schlagen Funktionen vor und stimmen ab. `src/wunschwand/` (nur `look.tsx` ist app-eigen), Route `src/app/wunschwand.tsx`, Server-Funktion `wunschwand` im Kopfkiste-Supabase. Neue Wünsche erst nach Freigabe sichtbar. Doku und Freigeben: claude-wissen `wissen/app-fabrik/vorlagen/wunschwand/README.md`. Browser-Foto: `/wunschwand?wunschprobe=1`.
## Technik
- Expo SDK 57, React Native 0.86, TypeScript, Expo Router (`src/app/`). Neue Pakete mit `npx expo install`.
- Spracheingabe `src/sprache.ts` und `src/components/Sprechknopf.tsx` (expo-speech-recognition, braucht Build; im Browser und ohne Modul fällt sie aufs Tippen zurück). App-Sperre `src/sperre.ts` (expo-local-authentication), Bildschirm `src/components/Sperre.tsx`. Lokale Benachrichtigungen `src/benachrichtigung.ts` (tägliche Erinnerung, geparkte Nachricht nach 24 Stunden bereit). `src/testApp.ts` für die Test-App.
- Bundle-ID `com.raoulstamm.roteflagge`, Version 1.0.0. EAS-Projekt @raoul1998/rote-flagge (ID af819422-dc2d-40ab-bfd0-6280a2336cca), Kanal `preview`. Credentials liegen bei Expo, Builds laufen `--non-interactive`.
- Neue Stände an die Test-App: `npx -y eas-cli@latest update --channel preview --environment preview --platform ios --message "..." --non-interactive`. Vorher die Update-Gruppe des aktuellen Stands in `docs/claude-verlauf.md` notieren (Zurückrollen mit `update:republish`, siehe Lektionen).

## Prüfen und Testen
- Vor "fertig": `npx tsc --noEmit` und `npx expo install --check` (`npx expo-doctor` braucht Internet zu exp.host). Einen Design-Prüfer gibt es hier noch nicht.
- Browser-Test: `npm run web-export`, dann `npm run screenshots` (Playwright, 390 x 844, in der Cloud `NODE_PATH=/opt/node22/lib/node_modules`). Fotos nach `docs/screenshots/`, Konsolenfehler werden gemeldet. Fotos selbst ansehen. Im Web fehlen Sprache, Face ID und Benachrichtigungen.

## Offen
- Raoul: App in App Store Connect anlegen, Abos, RevenueCat-Schlüssel. Dann RevenueCat einbauen (harte Paywall).
- KI-Musterbericht über Supabase (Kopfkiste-Projekt) mit Einwilligung, Tageslimit-Tabelle.
- Töne (siehe oben), Design-Prüfer aus der Fabrik-Vorlage (`wissen/app-fabrik/vorlagen/design-pruefer/`).
- Pronomen: Texte haben er/sie/neutral über `formen()`, Werbe- und Store-Texte sprechen noch von "ihm" (Raoul 11.11.: nach Recherche der US-Nische entscheiden).
- Hilfe-Nummern DE/AT/CH vor Veröffentlichung prüfen, Kurzliste später nach Land.
- PDF-Export der Einträge als Premium-Grund (später).
- Datenschutzerklärung, Store-Texte, Support-Adresse aurorealis.apps@gmail.com. Einwilligung und PostHog erst, wenn Statistik gewollt ist (Eventnamen aus `wissen/werkzeuge.md`, nie Eintragstexte).
