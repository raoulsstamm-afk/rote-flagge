// Fotografiert jeden Bildschirm der Web-Version bei 390 x 844 (iPhone-Größe) und meldet Konsolenfehler.
//   npm run web-export   (baut dist-web)
//   npm run screenshots  (Fotos nach docs/screenshots/)
// Im Web fehlen Spracheingabe, Face ID und Benachrichtigungen. Die App fängt das ab.
const { chromium } = require('playwright');
const { createServer } = require('http');
const { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } = require('fs');
const { extname, join, resolve } = require('path');

const APP = resolve(__dirname, '..');
const WEB = join(APP, 'dist-web');
const AUSGABE = join(APP, 'docs', 'screenshots');
const TYPEN = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.json': 'application/json', '.ico': 'image/x-icon' };

const TAG = 24 * 60 * 60 * 1000;
// Beispieldaten für die Fotos der vollen App (nur im Test-Browser)
function beispiel() {
  const jetzt = Date.now();
  const e = (tage, std, text, kategorien, gefuehle) => ({ id: `e${tage}${std}`, zeit: jetzt - tage * TAG - std * 3600000, text, kategorien, gefuehle });
  return {
    onboardingFertig: true,
    quiz: { luft: 2, schuld: 2, 'nie-passiert': 1, spass: 2, 'wo-bist-du': 1, laut: 0, aendern: 2, eierschalen: 2, kleiner: 1, freunde: 0 },
    erinnerung: '20:00',
    appSperre: false,
    eintraege: [
      e(0, 2, 'Hat meine Nachricht gelesen und zwei Tage nicht geantwortet. Als ich nachgefragt habe, meinte er, ich sei zu anstrengend.', ['ignoriert', 'schuld'], ['Klein', 'Verwirrt']),
      e(3, 5, 'Vor seinen Freunden hat er sich über meinen Job lustig gemacht. Später hieß es, das war doch nur Spaß.', ['laecherlich'], ['Klein', 'Traurig']),
      e(6, 1, 'Nach dem Streit am Sonntag wieder kein Wort, bis ich mich entschuldigt habe.', ['ignoriert'], ['Schuldig', 'Leer']),
      e(11, 3, 'Er hat gesagt, er hätte nie versprochen, zum Geburtstag meiner Mama mitzukommen.', ['angezweifelt', 'versprechen'], ['Verwirrt']),
      e(17, 4, 'Wollte wissen, mit wem ich schreibe, und hat nach meinem Handy gegriffen.', ['kontrolliert'], ['Ängstlich']),
      e(20, 2, 'Den ganzen Abend ignoriert, weil ich mit einer Freundin telefoniert habe.', ['ignoriert', 'kontrolliert'], ['Klein', 'Wütend']),
    ],
    geparkt: [
      { id: 'g1', text: 'Ich vermisse dich. Können wir nicht einfach reden? Ich weiß, ich war auch schuld.', zeit: jetzt - 26 * 3600000, bis: jetzt - 2 * 3600000, status: 'wartet' },
      { id: 'g2', text: 'Warum antwortest du nicht? Du weißt genau, wie mich das fertig macht.', zeit: jetzt - 3 * 3600000, bis: jetzt + 21 * 3600000, status: 'wartet' },
    ],
    geparktGesamt: 6,
    kontaktpause: { start: jetzt - 8 * TAG, laengste: 4 },
  };
}

(async () => {
  if (!existsSync(join(WEB, 'index.html'))) throw new Error('Erst "npm run web-export" ausführen');
  const server = createServer((req, res) => {
    const pfad = decodeURIComponent((req.url || '/').split('?')[0]);
    let datei = join(WEB, pfad);
    if (!datei.startsWith(WEB) || !existsSync(datei) || pfad.endsWith('/')) datei = join(WEB, 'index.html');
    res.writeHead(200, { 'Content-Type': TYPEN[extname(datei)] || 'application/octet-stream' });
    res.end(readFileSync(datei));
  });
  await new Promise((r) => server.listen(0, r));
  const basis = `http://localhost:${server.address().port}`;

  rmSync(AUSGABE, { recursive: true, force: true });
  mkdirSync(AUSGABE, { recursive: true });
  const browser = await chromium.launch();
  const seite = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const fehler = [];
  const harmlos = (t) => /navigator\.vibrate|useNativeDriver|play\(\) failed/.test(t);
  seite.on('pageerror', (e) => fehler.push(`Absturz: ${e.message}`));
  seite.on('console', (m) => {
    if (m.type() === 'error' && !harmlos(m.text())) fehler.push(`Konsole: ${m.text().slice(0, 300)}`);
  });

  let nr = 0;
  const warte = (ms) => seite.waitForTimeout(ms);
  const foto = async (name) => {
    nr += 1;
    await warte(900);
    // Passt der Inhalt ohne Scrollen? (wichtig fürs Onboarding)
    const zuHoch = await seite.evaluate(() => [...document.querySelectorAll('div')].some((d) => d.scrollHeight > d.clientHeight + 4 && getComputedStyle(d).overflowY === 'auto' && d.clientHeight > 300));
    await seite.screenshot({ path: join(AUSGABE, `${String(nr).padStart(2, '0')}_${name}.png`) });
    console.log(`Foto ${nr} ${name}${zuHoch ? '  (scrollt)' : ''}`);
  };
  const knopf = async (text) => {
    await seite.getByText(text, { exact: true }).last().click();
    await warte(450);
  };

  // Onboarding
  await seite.goto(basis);
  await warte(2500);
  await foto('onboarding_start');
  await knopf("Los geht's");
  await foto('quiz_frage1');
  const antworten = ['Ja, oft', 'Ja, oft', 'Manchmal', 'Ja, oft', 'Manchmal', 'Nein', 'Ja, oft', 'Ja, oft', 'Manchmal', 'Nein'];
  for (let i = 0; i < antworten.length; i++) {
    await knopf(antworten[i]);
    if (i === 4) await foto('quiz_frage6');
  }
  await foto('quiz_ergebnis');
  await knopf('Zu meinem Plan');
  await foto('plan');
  await knopf('Klingt gut');
  await foto('erinnerung');
  await knopf('Erinnerung einschalten');
  await foto('paywall');
  await knopf('7 Tage gratis starten');
  await foto('paywall_kaufhinweis');
  await knopf('Weiter (Test)');
  await foto('tagebuch_leer');

  // Erster Eintrag (Tippen, weil Sprechen im Web fehlt)
  await knopf("Was ist passiert? Erzähl's mir.");
  await foto('eintrag_1_was_ist_passiert');
  await seite.locator('textarea').first().fill('Er hat meine Nachricht gelesen und zwei Tage nicht geantwortet.');
  await warte(200);
  await foto('eintrag_1_mit_text');
  await knopf('Weiter');
  await knopf('Klein');
  await knopf('Verwirrt');
  await foto('eintrag_2_gefuehl');
  await knopf('Weiter');
  await knopf('Ignoriert');
  await foto('eintrag_3_kategorie');
  await knopf('Festhalten');
  await foto('eintrag_4_festgehalten');
  await knopf('Fertig');
  await foto('tagebuch_ein_eintrag');

  // Volle App mit Beispieldaten
  await seite.evaluate((d) => localStorage.setItem('rote-flagge-v1', JSON.stringify(d)), beispiel());
  await seite.goto(`${basis}/tagebuch`);
  await warte(2000);
  await foto('tagebuch_mit_eintraegen');
  await seite.getByText('Vor seinen Freunden', { exact: false }).first().click();
  await foto('eintrag_ansehen');
  await seite.getByLabel('Zurück', { exact: true }).first().click();
  await warte(500);
  await seite.getByLabel('Muster', { exact: true }).first().click();
  await foto('muster');
  await seite.mouse.move(195, 400);
  await seite.mouse.wheel(0, 700);
  await foto('muster_unten');
  await seite.getByLabel('SOS', { exact: true }).first().click();
  await foto('sos');
  await seite.locator('textarea').first().fill('Ich will dir nur sagen, dass ...');
  await warte(200);
  await knopf('24 Stunden parken');
  await foto('sos_geparkt');
  await knopf('Ich hatte Kontakt');
  await foto('sos_kontakt_rueckfrage');
  await knopf('Abbrechen');
  await seite.getByText('bereit zum Entscheiden', { exact: false }).first().click();
  await warte(600);
  await foto('geparkte_nachrichten');
  await seite.getByLabel('Zurück', { exact: true }).first().click();
  await warte(500);
  await seite.getByLabel('Einstellungen', { exact: true }).first().click();
  await foto('einstellungen');
  await seite.mouse.move(195, 400);
  await seite.mouse.wheel(0, 900);
  await foto('einstellungen_unten');

  // Muster leer (frischer Zustand nach dem Onboarding)
  await seite.evaluate(() => localStorage.setItem('rote-flagge-v1', JSON.stringify({ onboardingFertig: true })));
  await seite.goto(`${basis}/muster`);
  await warte(2000);
  await foto('muster_leer');
  await seite.goto(`${basis}/sos`);
  await warte(2000);
  await foto('sos_ohne_kontaktpause');

  await browser.close();
  server.close();
  console.log(`\n${readdirSync(AUSGABE).length} Fotos in ${AUSGABE}`);
  if (fehler.length) {
    console.log('\nFehler:');
    [...new Set(fehler)].forEach((f) => console.log(' ', f));
    process.exitCode = 1;
  } else console.log('Keine Fehler in der Konsole.');
})();
