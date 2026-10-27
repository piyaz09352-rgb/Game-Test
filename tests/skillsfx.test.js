/* VAYRATHEN — tests/skillsfx.test.js — weapon skills sound by their pattern, apart from the basic attack. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('each weapon skill has a pattern sound, basic attacks keep the weapon voice', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const pats = {}, bad = [];
      for (const [id, sk] of Object.entries(SKILLS)){ if (sk.magic || sk.passive || /buff|heal|restore|summon|petcall|conjure|command|debuff|bond/.test(sk.type)) continue;
        const p = skPattern(sk); pats[p] = (pats[p] || 0) + 1; if (!SK_CAST[p] || !SK_HIT[p]) bad.push(id); }
      // routing: a skill's cast and hit go to its pattern, a plain hit does not
      const seen = []; const _sp = skPlay; skPlay = (set, k) => seen.push((set === SK_CAST ? 'cast:' : 'hit:') + k);
      SKSFX.cast = {type:'aoeSelf'}; SFX.play('skill_phys', {w:'sword'}); SKSFX.cast = null;
      SKSFX.hit = {type:'dash'}; SFX.play('skill_hit'); SKSFX.hit = null;
      SFX.play('skill_hit'); skPlay = _sp;
      return {pats, bad, seen};
    });
    assert.deepStrictEqual(r.bad, []);
    assert.ok(Object.keys(r.pats).length >= 8, 'many patterns: ' + JSON.stringify(r.pats));
    assert.deepStrictEqual(r.seen, ['cast:spin', 'hit:dash']);
    assert.deepStrictEqual(errors, []);
  } finally { await close(); }
});
