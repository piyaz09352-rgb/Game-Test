/* VAYRATHEN — tests/csp284.test.js — (v284) the website's Content-Security-Policy (_headers, firebase.json)
   The game is played under the same headers the website sends: nothing the game does may be refused by the policy,
   and markup smuggled into the page (an <img onerror=…>, an inline <script>) must not run. The two inline scripts of
   index.html are allowed by hash: when one changes, this test prints the hashes to put in _headers and firebase.json. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { chromium, openGame, enterWorld, siteHeaders } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';
const ROOT = path.join(__dirname, '..');

test('the inline scripts match the policy, and Netlify and Firebase send the same headers', () => {
  const H = siteHeaders(), csp = H['Content-Security-Policy'] || '';
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => `'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
  for (const h of hashes) assert.ok(csp.includes(h), `put ${h} in script-src of _headers and firebase.json (an inline script of index.html changed)`);
  assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp) && !/'unsafe-eval'/.test(csp), 'no unsafe-inline / unsafe-eval for scripts');
  const fb = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8')).hosting.headers.find(h => h.source === '**');
  assert.ok(fb, 'firebase.json has the site headers');
  assert.deepStrictEqual(Object.fromEntries(fb.headers.map(h => [h.key, h.value])), H, 'firebase.json carries exactly the headers of _headers');
  // every outside host the game's code loads from is allowed
  const shim = fs.readFileSync(path.join(ROOT, 'js/net/firebase-shim.js'), 'utf8');
  assert.ok(/https:\/\/www\.gstatic\.com\/firebasejs\//.test(shim) && csp.includes('https://www.gstatic.com'), 'the Firebase SDK host');
  assert.ok(csp.includes('https://fonts.googleapis.com') && csp.includes('https://fonts.gstatic.com'), 'the web fonts');
});

test('the game runs under the policy, and smuggled markup does not', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame({ headers: siteHeaders() });
  try {
    await page.evaluate(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', e => window.__csp.push(`${e.violatedDirective} ${e.blockedURI} ${e.sourceFile}:${e.lineNumber}`)); });
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      // play a little: windows, a fight, sound, the save
      for (const w of ['stat', 'skill', 'bag', 'equip', 'quest', 'world', 'settings', 'ach', 'wiki', 'log', 'market', 'mail', 'guild']) try { openWin(w); await new Promise(res => setTimeout(res, 120)); } catch (e) {}
      try { closeAll && closeAll(); } catch (e) {}
      const m = mobs.find(o => !o.dead); if (m){ P.x = m.x - 30; P.y = m.y; for (let i = 0; i < 20; i++){ try { basicAttack && basicAttack(m); } catch (e) {} await new Promise(res => setTimeout(res, 50)); } }
      save(); await new Promise(res => setTimeout(res, 600));
      // smuggled markup
      const d = document.createElement('div'); document.body.appendChild(d);
      d.innerHTML = '<img src="x-missing.png" onerror="window.__ran=1"><a href="javascript:window.__ran=2" id="jsl">x</a>';
      const s = document.createElement('script'); s.textContent = 'window.__ran = 3'; document.body.appendChild(s);
      try { document.getElementById('jsl').click(); } catch (e) {}
      await new Promise(res => setTimeout(res, 500)); d.remove(); s.remove();
      return { ran:window.__ran || 0, csp:window.__csp.slice() };
    });
    assert.strictEqual(r.ran, 0, 'no smuggled script ran');
    const blockedSmuggled = r.csp.filter(v => /inline|javascript/.test(v));
    assert.ok(blockedSmuggled.length >= 2, 'the policy refused the smuggled handlers: ' + JSON.stringify(r.csp));
    assert.deepStrictEqual(r.csp.filter(v => !/inline|javascript/.test(v)), [], 'the game itself is never refused');
  } finally { await close(); }
  // Chrome reports every refusal in the console, from the first byte (load time included): only the smuggled ones may be there
  assert.deepStrictEqual(errors.filter(e => !/inline (event handler|script)|JavaScript URL/i.test(e)), [], 'no runtime errors, nothing of the game refused');
});
