/* VAYRATHEN — tools/load-time.js — (v346) how long a new player waits before they can play, on a phone's network
   Opens the game with an empty cache through Chrome's network emulation (Fast 3G: 1.6 Mbit/s, 560 ms; 4G: 9 Mbit/s,
   170 ms) and measures: seconds until the title screen can be used, the bytes downloaded by then, and the biggest files
   in them; then the seconds until a new hero stands in the world. Writes docs/LOADTIME.md.
   Usage: node tools/load-time.js           NETS=3g,4g (default both) · local server, offline (no Firebase, no web fonts) */
'use strict';
const path = require('path'), fs = require('fs');
const http = require('http'), zlib = require('zlib');
/* a static server that compresses text files (gzip) as a real web host does — the test server sends them raw */
function serve(){ const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };
  const srv = http.createServer((req, res) => { let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
    fs.readFile(f, (err, buf) => { if (err){ res.writeHead(404); return res.end(); } const ext = path.extname(f), type = TYPES[ext] || 'application/octet-stream';
      if (process.env.GZIP !== '0' && /text|json|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] || '')){ res.writeHead(200, { 'Content-Type': type, 'Content-Encoding': 'gzip' }); return res.end(zlib.gzipSync(buf, { level: 6 })); }
      res.writeHead(200, { 'Content-Type': type }); res.end(buf); }); });
  // H2=key.pem,cert.pem: HTTP/2 over TLS (as a CDN serves it: many files at once on one connection)
  if (process.env.H2){ const [k, c] = process.env.H2.split(','), h2 = require('http2').createSecureServer({ key: fs.readFileSync(k), cert: fs.readFileSync(c), allowHTTP1: true }, srv.listeners('request')[0]);
    return new Promise(ok => h2.listen(0, '127.0.0.1', () => ok({ srv: h2, url: `https://127.0.0.1:${h2.address().port}/` }))); }
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}/` }))); }
const { chromium, TEST_PASS } = require('../tests/browser');
const ROOT = path.join(__dirname, '..');
const NET = { '3g': { latency: 562, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 }, '4g': { latency: 170, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 } };

(async () => {
  const { srv, url } = await serve(); const out = [];
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  try {
    for (const net of (process.env.NETS || '3g,4g').split(',')){
      const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
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
  let md = `# VAYRATHEN — load time on a phone's network (tools/load-time.js)\n\nEmpty cache, phone screen 844×390, text files gzip-compressed as a web host sends them (GZIP=0: raw), served over HTTP/1.1 (6 files at a time) or, with H2=key,cert, over HTTP/2 as a CDN such as itch.io's serves it (many files at once). Fast 3G = 1.6 Mbit/s, 560 ms · 4G = 9 Mbit/s, 170 ms.\n\n| เน็ต | ถึงหน้าแรก (วิ) | โหลดก่อนหน้าแรก | กดสร้างตัว → อยู่ในโลก (วิ) | โหลดทั้งหมด | ไฟล์ |\n|---|---|---|---|---|---|\n`;
  for (const r of out) md += `| ${r.net} | ${r.tTitle.toFixed(1)} | ${mb(r.bTitle)} | ${r.tWorld.toFixed(1)} | ${mb(r.bWorld)} | ${r.n} |\n`;
  const r0 = out[0]; if (r0){ md += `\n## ไฟล์ใหญ่สุดก่อนหน้าแรก (${r0.net})\n\n| ไฟล์ | ขนาด |\n|---|---|\n`; for (const f of r0.top) md += `| ${f.url.slice(0, 80)} | ${mb(f.n)} |\n`;
    md += `\n## แยกตามชนิด (ทั้งหมด)\n\n| ชนิด | ขนาด |\n|---|---|\n`; for (const [k, v] of Object.entries(r0.kinds).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${mb(v)} |\n`; }
  md = `**${process.env.H2 ? 'HTTP/2 (แบบ CDN ของ itch.io)' : 'HTTP/1.1'}** · gzip ${process.env.GZIP === '0' ? 'ปิด' : 'เปิด'}\n\n` + md;
  fs.writeFileSync(process.env.OUT || path.join(ROOT, 'docs', 'LOADTIME.md'), md); console.log('DONE');
})();
