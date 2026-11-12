/* VAYRATHEN — tests/xss284.test.js — (v284) what other players send can never become markup
   clean() is the funnel every name, guild name, letter and listing from someone else passes through. It used to cut
   control characters only, so a hero named <img src=x onerror=…> ran code in the game of everyone whose log, banner or
   list showed the name (the log and banners are HTML). Now the characters HTML is made of become look-alikes. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('names and letters from others never run as code', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const evil = '<img src=x onerror="window.__xss=1">', evil2 = "'><svg/onload=window.__xss=2>";
      const c = clean(evil, 60), c2 = clean(evil2, 60);
      // where remote names end up: the log, a banner, the market purchase line, a guild notice
      log(L(`ซื้อจาก ${clean(evil, 18)}`, `Bought from ${clean(evil, 40)}`), 'g'); openWin('log');
      banner(L(`⚔ กิลด์ ⟨${clean(evil2, 16)}⟩`, `⚔ ⟨${clean(evil2, 40)}⟩`));
      await new Promise(res => setTimeout(res, 400));
      return { c, c2, special:/[<>&"'`]/.test(c + c2), xss:window.__xss || 0, imgs:document.querySelectorAll('#pane-log img, #banner img, #banner svg').length,
        thai:clean('สวัสดี ชาวอาเรน!', 40), ctrl:clean('a\u0000b‮c', 10), dbClaim:typeof dbClaim === 'function' };
    });
    assert.ok(!r.special, 'no HTML characters survive clean(): ' + r.c + ' · ' + r.c2);
    assert.strictEqual(r.xss, 0, 'nothing ran'); assert.strictEqual(r.imgs, 0, 'no element was made from a name');
    assert.strictEqual(r.thai, 'สวัสดี ชาวอาเรน!', 'ordinary text is untouched'); assert.strictEqual(r.ctrl, 'abc', 'control and direction characters still go');
    assert.ok(r.dbClaim, 'the shared claim helper is there');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
