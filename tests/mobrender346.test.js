/* VAYRATHEN — tests/mobrender346.test.js — (v346) every kind of monster, drawn in every action it has
   The hurt, death and rest poses (v340–v342) are drawn by code in each body model; a slip there (a comment that ate a line,
   a limb thrown outside the picture) once showed only when someone looked. Every version this test draws one monster of
   each kind (model × kind × boss or not), from the side and from the front, every frame of idle, walk, attack, hurt, die,
   fidget and sleep, and checks:
   · it draws without an error
   · there is a body in the picture (not an empty or nearly empty frame) — a dying spirit may fade and a jelly melt, nothing else
   · nothing is cut off at the picture's edge (a limb or wing thrown outside the frame) */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed';

test('every kind of monster draws every frame of every action, whole and inside its frame', { skip, timeout: 900000 }, async () => {
  const { page, errors, close } = await openGame({ width: 800, height: 600 });
  try {
    const r = await page.evaluate(() => {
      const kinds = {}; for (const k in MOB){ const mb = SPR.MOBS[k]; if (!mb) continue; const sp = mb.spec || {};
        const key = (mb.human ? 'human' : (sp.arch || mb.dplan || 'old')) + ':' + (sp.kind || sp.form || (sp.tree ? 'tree' : sp.coral ? 'coral' : '') || sp.head || mb.dplan || '') + (MOB[k].boss ? ' B' : '');
        if (!kinds[key]) kinds[key] = k; }
      const ACTS = ['idle', 'walk', 'attack', 'hurt', 'die', 'fidget', 'sleep'].filter(a => SPR.MOB_ACTIONS[a]);
      const count = img => { let n = 0, edge = 0; const W = img.width, H = img.height, D = img.data;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (D[(y * W + x) * 4 + 3] > 40){ n++; if (x === 0 || y === 0 || x === W - 1) edge++; } return {n, edge}; };
      const bad = []; let frames = 0;
      for (const [kind, k] of Object.entries(kinds)){ const fade = /floater|human|slime|blob/.test(kind) || /wisp|ghost|wraith|phantom|spirit|shade|slime|blob/.test(k) || k === 'boss';   // spirits fade, jellies melt into a puddle
        for (const dir of [2, 0]){ let base = 0;
          for (const act of ACTS){ const n = SPR.MOB_ACTIONS[act].n;
            for (let f = 0; f < n; f++){ let img; try { img = SPR.renderFrame('mob', k, act, dir, f, 1); } catch (e) { bad.push(`${kind} ${k} ${act}${f} d${dir}: ${e.message}`); continue; }
              frames++; const c = count(img); if (act === 'idle' && f === 0) base = c.n;
              if (base && c.n < base * (act === 'die' && fade ? .05 : .25)) bad.push(`${kind} ${k} ${act}${f} d${dir}: almost empty (${c.n} of ${base} px)`);
              if (c.edge > 6) bad.push(`${kind} ${k} ${act}${f} d${dir}: cut off at the edge (${c.edge} px)`); } } } }
      return {kinds:Object.keys(kinds).length, frames, bad}; });
    assert.ok(r.kinds >= 80, 'all kinds found: ' + r.kinds);
    assert.deepStrictEqual(r.bad, [], `${r.kinds} kinds, ${r.frames} frames`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
