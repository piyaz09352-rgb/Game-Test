/* VAYRATHEN — tests/naraka296.test.js — (v296) the second land, นรกอเวจี: a lava cavern
   · maps 65 and 66 are one cavern: dark, lava pools, nothing green (no trees, bushes, flowerbeds or mossy rocks);
   · its new creatures are bodies of their own (not recoloured copies) and draw in every pose;
   · the way in from map 64 is a cave mouth; the story's targets live on the map;
   · the helper robots MIDAS and PULSE show the owner's animated GIFs and play their animation on every graphics level */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('นรกอเวจี: a lava cavern with nothing green, creatures of its own, a cave mouth; animated helper robots', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => {
      const out = {};
      for (const id of [65, 66]){ loadMap(id); await new Promise(res => setTimeout(res, 300));
        out[id] = {cav:cavernHere(), green:PROPS.filter(p => NRK_PLANTS.has(p.type)).map(p => p.type), mossy:PROPS.filter(p => p.type === 'rock' && p.variant % 1000 < 100).length,
          lava:WATERS.filter(w => w.k === 'pond').every(w => w.kind === 'lava'), mobs:MAPS[id].mobs.slice(), wx:wxRoll()}; }
      const fresh = ['lavamole', 'obsidianmantis', 'volcanosnail'];
      out.draws = fresh.filter(k => { try { for (const a of ['idle', 'walk', 'attack', 'die']) for (let f = 0; f < 4; f++) SPR.renderFrame('mob', k, a, f % 3, f, 1); return true; } catch (e) { return false; } });
      out.arch = fresh.map(k => SPECIES_ARCH[k]);
      const ch = MS_CH[65]; out.targets = ch.steps.filter(s => s.k === 'kill' || s.k === 'elite').map(s => s.t); out.items = ch.steps.filter(s => s.k === 'item').map(s => s.t.replace(/^m_/, ''));
      loadMap(64); out.ribs = PROPS.filter(p => p.type === 'ribcage').length; out.mouth = GATES.filter(g => g.to === 65).map(cavernGate);
      out.gif = ['midas', 'pulse'].map(k => /\.gif/.test(botPic(k)));
      const was = GFX.preset; GFX.preset = 'low'; const sig = (k, t) => { const c = document.createElement('canvas'); c.width = c.height = 60; const g = c.getContext('2d'); g.translate(30, 30); drawBotImg(g, k, t, {size:50}); return c.toDataURL(); };
      out.moves = !HLP_FR.pulse || sig('pulse', 0) !== sig('pulse', HLP_ANIM.pulse.dt * 2.2); GFX.preset = was;
      return out; });
    for (const id of [65, 66]){ const m = r[id];
      assert.ok(m.cav, `map ${id} is the cavern`); assert.deepStrictEqual(m.green, [], `nothing green grows on map ${id}`); assert.strictEqual(m.mossy, 0, `no mossy rocks on map ${id}`);
      assert.ok(m.lava, `its pools are lava (map ${id})`); assert.strictEqual(m.wx, 'clear', 'no weather underground'); }
    assert.deepStrictEqual(r.draws.length, 3, 'the new creatures draw in every pose');
    assert.deepStrictEqual(r.arch, ['cave', 'cave', 'cave'], 'they are bodies of their own, not recoloured copies');
    for (const t of [...r.targets, ...r.items]) assert.ok(r[65].mobs.includes(t), 'story monster lives on map 65: ' + t);
    assert.strictEqual(r.ribs, 0, 'no dragon skeleton (ribcage) left');
    assert.ok(r.mouth.length && r.mouth.every(Boolean), 'the way in from map 64 is a cave mouth');
    assert.deepStrictEqual(r.gif, [true, true], 'MIDAS and PULSE show the owner\'s animated GIF');
    assert.ok(r.moves, 'the helper animation plays even on Low graphics');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
