/* VAYRATHEN — tests/unique283.test.js — (v283) no two skills share an effect or a picture, anywhere in the game
   · signatures (js/sys/skillsig283.js): every active skill a player can learn has a motif, no two share (motif, element,
     hue), and every motif draws at every stage without throwing;
   · icons (js/ui/skicons283.js): every skill a class lists has a glyph that exists, and no two share (glyph, colour). */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('every skill has its own signature and its own icon', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const shown = [...new Set(Object.values(JOBS).flatMap(j => j.skills || []))].filter(id => SKILLS[id]), act = shown.filter(id => SKILLS[id].type !== 'passive');
      sigAssign(); const noSig = act.filter(id => !SIGFX.of[id] || !SIG_DRAW[SIGFX.of[id].mo]);
      const perMo = {}; for (const id of act) perMo[SIGFX.of[id].mo] = (perMo[SIGFX.of[id].mo] || 0) + 1;
      const cv = document.createElement('canvas'); cv.width = cv.height = 300; const g = cv.getContext('2d'), drawErr = [];
      for (const mo of SIG_MOTIFS) for (const k of [.05, .3, .6, .95]) for (const layer of ['under', 'over']){ try { SIG_DRAW[mo](g, 150, 160, k, {pal:['255,120,40', '255,232,150', '150,30,10'], r:60, v:{n:1, spin:1, tilt:.06, seed:17}, q:1, mo}, layer); } catch (e){ drawErr.push(`${mo}:${layer}:${e.message}`); } }
      const noGlyph = shown.filter(id => !GLYPH[skillGlyph(SKILLS[id])]), glyphs = new Set(shown.map(id => skillGlyph(SKILLS[id]))).size;
      return {n:shown.length, act:act.length, noSig, sig:sigReport(), motifs:SIG_MOTIFS.length, maxPerMotif:Math.max(...Object.values(perMo)), drawErr, noGlyph, glyphs, ico:skiReport()}; });
    assert.deepStrictEqual(r.noSig, [], 'every active skill has a motif that draws');
    assert.deepStrictEqual(r.sig, [], 'no two skills share motif + element + hue');
    assert.ok(r.motifs >= 22 && r.maxPerMotif <= Math.ceil(r.act / r.motifs) + 2, `motifs spread evenly: ${r.motifs} motifs, at most ${r.maxPerMotif} skills each`);
    assert.deepStrictEqual(r.drawErr, [], 'every motif draws at every stage');
    assert.deepStrictEqual(r.noGlyph, [], 'every skill has a glyph that exists');
    assert.deepStrictEqual(r.ico, [], 'no two skills share a picture');
    assert.ok(r.glyphs >= r.n * .9, `nearly every skill has a glyph of its own, not just a sigil: ${r.glyphs} glyphs for ${r.n} skills`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
