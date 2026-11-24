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
function beispiel(phase = 'kompliziert') {
  const jetzt = Date.now();
  const e = (tage, std, text, kategorien, gefuehle, waerme) => ({ id: `e${tage}${std}`, zeit: jetzt - tage * TAG - std * 3600000, text, kategorien, gefuehle, waerme });
  const tage = Array.from({ length: 9 }, (_, i) => new Date(jetzt - i * TAG).toISOString().slice(0, 10)).slice(1);
  return {
    onboardingFertig: true,
    phase,
    person: { name: 'Jonas', pronomen: 'er' },
    ziel: 30,
    quiz: { danach: 'verwirrt', kennst: ['warmkalt', 'schuld', 'warten'], gedanken: 3, handy: 3, schwer: ['abends', 'still'], zurueck: ['ruhe', 'selbstwert'] },
    erinnerung: '21:30',
    appSperre: false,
    tageBeiDir: tage,
    sosGeschafft: 3,
    kiEinwilligung: false,
    kiBericht: null,
    eintraege: [
      e(0, 2, 'Hat meine Nachricht gelesen und zwei Tage nicht geantwortet. Als ich nachgefragt habe, hieß es, ich sei zu anstrengend.', ['ignoriert', 'schuld'], ['Klein', 'Verwirrt'], 'kalt'),
      e(2, 5, 'Plötzlich wieder total süß, langer Anruf, will mich am Wochenende sehen.', ['warmkalt'], ['Hoffnungsvoll'], 'warm'),
      e(4, 1, 'Treffen abgesagt, eine Stunde vorher. Danach kein Wort.', ['versprechen', 'warmkalt'], ['Leer'], 'kalt'),
      e(7, 3, 'Sprachnachricht mitten in der Nacht: er vermisst mich.', ['warmkalt'], ['Verwirrt', 'Hoffnungsvoll'], 'warm'),
      e(10, 4, 'Ich habe angesprochen, dass mich das verletzt. Am Ende habe ich mich entschuldigt.', ['schuld'], ['Schuldig'], 'kalt'),
      e(14, 2, 'Er sagt, er hätte nie versprochen, zum Geburtstag meiner Mama mitzukommen.', ['angezweifelt', 'versprechen'], ['Verwirrt'], 'beides'),
      e(18, 2, 'Wochenende zusammen, alles wie am Anfang.', ['warmkalt'], ['Ruhig'], 'warm'),
    ],
    geparkt: [
      { id: 'g1', text: 'Ich vermisse dich. Können wir nicht einfach reden?', zeit: jetzt - 26 * 3600000, bis: jetzt - 2 * 3600000, status: 'wartet' },
    ],
    geparktGesamt: 4,
    kontaktpause: phase === 'getrennt' ? { start: jetzt - 12 * TAG, laengste: 4 } : { start: null, laengste: 0 },
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
  await warte(3500);
  await warte(1200);
  await foto('willkommen');
  await knopf("Los geht's");
  await warte(900);
  await knopf('Du bist echt zu empfindlich.');
  await knopf('Wer schreibt dir da die ganze Zeit?');
  await foto('zaehlen');
  await knopf('Auflösen (2 Flaggen)');
  await foto('zaehlen_aufgeloest');
  await knopf('Weiter');
  await knopf('Es ist kompliziert');
  await foto('phase');
  await knopf('Weiter');
  await knopf('Ein Mann');
  await seite.locator('input').first().fill('Jonas');
  await foto('person');
  await knopf('Weiter');
  await knopf('Verwirrt');
  await foto('frage_danach');
  await knopf('Weiter');
  await foto('frage_gedanken');
  await knopf('Weiter');
  await knopf('Erst ganz nah, dann tagelang still');
  await knopf('Am Ende bin ich schuld');
  await knopf('Ich warte ständig auf eine Nachricht');
  await foto('frage_kennst');
  await knopf('Weiter');
  await foto('frage_handy');
  await knopf('Weiter');
  await knopf('Abends im Bett');
  await knopf('Wenn er nicht antwortet');
  await foto('frage_schwer');
  await knopf('Weiter');
  await knopf('Ruhe im Kopf');
  await foto('frage_zurueck');
  await knopf('Weiter');
  await foto('ziel');
  await knopf('Weiter');
  await warte(2600);
  await foto('auswertung');
  await knopf('Mein Ergebnis');
  await warte(400);
  await foto('ergebnis');
  await knopf('Weiter');
  await seite.locator('textarea').first().fill('Ich vermiss dich. Können wir reden?');
  await foto('ausprobieren');
  await knopf('24 Stunden parken');
  await foto('ausprobieren_geparkt');
  await knopf('Weiter');
  await seite.locator('textarea').first().fill('Drei Tage keine Antwort, dann so getan, als wäre nichts.');
  await knopf('Flagge setzen');
  await foto('erste_flagge');
  await knopf('Weiter');
  await warte(600);
  await foto('plan');
  await knopf('Weiter');
  await foto('erinnerung');
  await knopf('Lieber ohne');
  await warte(500);
  await foto('paywall');
  await knopf('Weiter (Test)');
  await warte(800);
  await foto('heute_erster_tag');

  // Volle App mit Beispieldaten (Phase "kompliziert")
  await seite.evaluate((d) => localStorage.setItem('rote-flagge-v2', JSON.stringify(d)), beispiel());
  await seite.goto(`${basis}/heute`);
  await warte(2500);
  await foto('heute');
  await seite.mouse.move(195, 400);
  await seite.mouse.wheel(0, 600);
  await foto('heute_unten');
  await seite.getByLabel('Muster', { exact: true }).first().click();
  await foto('muster');
  await seite.mouse.move(195, 400);
  await seite.mouse.wheel(0, 700);
  await foto('muster_mitte');
  await seite.mouse.wheel(0, 900);
  await foto('muster_unten');
  await seite.getByLabel('Tagebuch', { exact: true }).first().click();
  await foto('tagebuch');
  await knopf('Lieber tippen');
  await seite.locator('textarea').first().fill('Wieder zwei Tage nichts, dann ein Herz unter meiner Story.');
  await knopf('Weiter');
  await knopf('Beides auf einmal');
  await foto('eintrag_waerme');
  await knopf('Weiter');
  await knopf('Verwirrt');
  await knopf('Weiter');
  await knopf('Erst nah, dann weg');
  await knopf('Festhalten');
  await foto('eintrag_fertig');
  await knopf('Fertig');
  await seite.getByLabel('Heute', { exact: true }).first().click();
  await warte(600);
  await seite.getByText(/^SOS: Ich will/).last().click();
  await warte(600);
  await seite.locator('textarea').first().fill('Hey, ich muss die ganze Zeit an dich denken.');
  await foto('sos_schreiben');
  await knopf('Weiter');
  await warte(3000);
  await foto('sos_flaggen');
  await knopf('24 Stunden parken');
  await warte(1500);
  await foto('sos_atmen');
  await knopf('Überspringen');
  await foto('sos_fertig');
  await knopf('Fertig');
  await warte(600);

  // Nach der Trennung: große Zahl = Kontaktpause
  await seite.evaluate((d) => localStorage.setItem('rote-flagge-v2', JSON.stringify(d)), beispiel('getrennt'));
  await seite.goto(`${basis}/heute`);
  await warte(2500);
  await foto('heute_getrennt');
  await seite.getByLabel('Einstellungen', { exact: true }).last().click();
  await foto('einstellungen');

  // Leer nach dem Onboarding
  await seite.evaluate(() => localStorage.setItem('rote-flagge-v2', JSON.stringify({ onboardingFertig: true, phase: 'kennenlernen', person: { name: '', pronomen: 'sie' } })));
  await seite.goto(`${basis}/muster`);
  await warte(2000);
  await foto('muster_leer');

  await browser.close();
  server.close();
  console.log(`\n${readdirSync(AUSGABE).length} Fotos in ${AUSGABE}`);
  if (fehler.length) {
    console.log('\nFehler:');
    [...new Set(fehler)].forEach((f) => console.log(' ', f));
    process.exitCode = 1;
  } else console.log('Keine Fehler in der Konsole.');
})();
