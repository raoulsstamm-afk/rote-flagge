// Erzeugt App-Icon, Splash-Bild und Favicon aus einer SVG-Flagge (einmalig: node werkzeuge/icons.js)
const { chromium } = require('playwright');
const path = require('path');

const flagge = (stab, fahne) => `
  <path d="M5 21V3" stroke="${stab}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M5 4h12l-2.5 4L17 12H5z" fill="${fahne}" stroke="${stab}" stroke-width="1.8" stroke-linejoin="round"/>`;

const seiten = [
  {
    datei: 'assets/icon.png',
    groesse: 1024,
    html: `<div style="width:1024px;height:1024px;background:linear-gradient(160deg,#FFF3EA 0%,#FBE1D6 55%,#F3D3D2 100%);display:flex;align-items:center;justify-content:center">
      <svg width="600" height="600" viewBox="0 0 24 24" style="margin-left:60px">${flagge('#4A3D35', '#B8463C')}</svg></div>`,
  },
  {
    datei: 'assets/splash.png',
    groesse: 512,
    html: `<div style="width:512px;height:512px;background:transparent;display:flex;align-items:center;justify-content:center">
      <svg width="420" height="420" viewBox="0 0 24 24" style="margin-left:30px">${flagge('#4A3D35', '#B8463C')}</svg></div>`,
  },
  {
    datei: 'assets/favicon.png',
    groesse: 64,
    html: `<div style="width:64px;height:64px;background:#FFF3EA;border-radius:14px;display:flex;align-items:center;justify-content:center">
      <svg width="48" height="48" viewBox="0 0 24 24" style="margin-left:4px">${flagge('#4A3D35', '#B8463C')}</svg></div>`,
  },
];

(async () => {
  const browser = await chromium.launch();
  for (const s of seiten) {
    const page = await browser.newPage({ viewport: { width: s.groesse, height: s.groesse } });
    await page.setContent(`<html><body style="margin:0;background:transparent">${s.html}</body></html>`);
    await page.screenshot({ path: path.join(__dirname, '..', s.datei), omitBackground: true });
    await page.close();
    console.log('erzeugt', s.datei);
  }
  await browser.close();
})();
