/* VAYRATHEN — tools/load-time.js — (v346) how long a new player waits before they can play, on a phone's network
   Opens the game with an empty cache through Chrome's network emulation (Fast 3G: 1.6 Mbit/s, 560 ms; 4G: 9 Mbit/s,
   170 ms) and measures: seconds until the title screen can be used, the bytes downloaded by then, and the biggest files
   in them; then the seconds until a new hero stands in the world. Writes docs/LOADTIME.md.
   Usage: node tools/load-time.js           NETS=3g,4g (default both) · local server, offline (no Firebase, no web fonts) */
'use strict';
const path = require('path'), fs = require('fs');
const { serve } = require('../tests/serve');
const { chromium, TEST_PASS } = require('../tests/browser');
const ROOT = path.join(__dirname, '..');
const NET = { '3g': { latency: 562, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }, '4g': { latency: 170, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 } };

(async () => {
  const { srv, url } = await serve(); const out = [];
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    for (const net of (process.env.NETS || '3g,4g').split(',')){
      const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
      const page = await ctx.newPage(), cdp = await ctx.newCDPSession(page);
      await page.route(u => !u.href.startsWith(url), r => r.abort());
      await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...NET[net] });
      const files = new Map(); let bytes = 0;
      cdp.on('Network.responseReceived', e => files.set(e.requestId, { url: e.response.url.replace(url, ''), n: 0 }));
      cdp.on('Network.loadingFinished', e => { const f = files.get(e.requestId); if (f){ f.n = e.encodedDataLength; bytes += e.encodedDataLength; } });
      const t0 = Date.now(); await page.goto(url, { waitUntil: 'commit' });
      await page.waitForFunction(() => !!window.__vay && !!document.querySelector('#auBox, [data-make], [data-play]'), null, { timeout: 600000, polling: 200 });
      const tTitle = (Date.now() - t0) / 1000, bTitle = bytes, top = [...files.values()].sort((a, b) => b.n - a.n).slice(0, 12);
      // sign up, make a hero, stand in the world
      await page.click('#auBox [data-autab="reg"][role="tab"]'); await page.fill('#auId', 'loadt_' + net + Date.now().toString(36)); await page.fill('#auPw', TEST_PASS); await page.fill('#auPw2', TEST_PASS);
      await page.click('#auBox [data-auth="go"]'); await page.waitForSelector('[data-make]', { timeout: 60000 }); await page.click('[data-make]'); await page.waitForSelector('[data-mkgo]'); await page.fill('#mkName', 'Load'); 
      const t1 = Date.now(); await page.click('[data-mkgo]'); await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, { timeout: 600000, polling: 200 });
      const tWorld = (Date.now() - t1) / 1000, bWorld = bytes;
      const kinds = {}; for (const f of files.values()){ const k = (f.url.match(/\.(\w+)(\?|$)/) || [, 'other'])[1]; kinds[k] = (kinds[k] || 0) + f.n; }
      out.push({ net, tTitle, bTitle, tWorld, bWorld, top, kinds, n: files.size }); console.log(net, tTitle, 's to title,', (bTitle / 1e6).toFixed(2), 'MB ·', tWorld, 's to the world,', (bWorld / 1e6).toFixed(2), 'MB total');
      await ctx.close(); }
  } finally { await browser.close(); srv.close(); }
  const mb = b => (b / 1e6).toFixed(2) + ' MB';
  let md = `# VAYRATHEN — load time on a phone's network (tools/load-time.js)\n\nEmpty cache, phone screen 844×390. Fast 3G = 1.6 Mbit/s, 560 ms · 4G = 9 Mbit/s, 170 ms.\n\n| เน็ต | ถึงหน้าแรก (วิ) | โหลดก่อนหน้าแรก | กดสร้างตัว → อยู่ในโลก (วิ) | โหลดทั้งหมด | ไฟล์ |\n|---|---|---|---|---|---|\n`;
  for (const r of out) md += `| ${r.net} | ${r.tTitle.toFixed(1)} | ${mb(r.bTitle)} | ${r.tWorld.toFixed(1)} | ${mb(r.bWorld)} | ${r.n} |\n`;
  const r0 = out[0]; if (r0){ md += `\n## ไฟล์ใหญ่สุดก่อนหน้าแรก (${r0.net})\n\n| ไฟล์ | ขนาด |\n|---|---|\n`; for (const f of r0.top) md += `| ${f.url.slice(0, 80)} | ${mb(f.n)} |\n`;
    md += `\n## แยกตามชนิด (ทั้งหมด)\n\n| ชนิด | ขนาด |\n|---|---|\n`; for (const [k, v] of Object.entries(r0.kinds).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${mb(v)} |\n`; }
  fs.writeFileSync(process.env.OUT || path.join(ROOT, 'docs', 'LOADTIME.md'), md); console.log('DONE');
})();
