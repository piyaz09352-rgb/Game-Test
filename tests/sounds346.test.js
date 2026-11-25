/* VAYRATHEN — tests/sounds346.test.js — (v346) no moment of the game asks for a sound that does not exist
   SFX.play(name) stays silent when no sound has that name — a typo, or a sound renamed or removed — and nobody notices
   a missing sound until they listen for it. Checked every version:
   · every sound name written in the code (SFX.play('…'), including each choice of a ternary) exists, or is one a later
     layer answers itself (sfx301 / skillsfx / sfxsamples)
   · every job's weapon has a swing and a hit sound; every element has a spell and an impact sound
   · every monster has an attack voice and a hurt voice, and ranged monsters a shot */
const test = require('node:test'), assert = require('node:assert'), fs = require('fs'), path = require('path');
const { chromium, openGame } = require('./browser');
const skip = !chromium && 'playwright not installed';
const ROOT = path.join(__dirname, '..');

test('every sound the game asks for exists: written names, weapons, elements, every monster voice', { skip, timeout: 120000 }, async () => {
  const files = [...fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').matchAll(/src="(js\/[^"?]+)/g)].map(m => m[1]);
  const names = new Map(), answered = new Set();
  for (const f of files){ const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/SFX\.play\(([^;]{0,300})/g)){ const arg = m[1], cmp = new Set([...arg.matchAll(/===\s*'([\w]+)'/g)].map(x => x[1])), add = n => (names.get(n) || names.set(n, new Set()).get(n)).add(f);
      // 'mh_' + (P.mt || 'jab') → the fallback is the sound mh_jab, not jab
      for (const x of arg.matchAll(/'(\w+_)'\s*\+\s*\([^)]*\|\|\s*'(\w+)'\)/g)){ add(x[1] + x[2]); cmp.add(x[2]); }
      for (const x of arg.matchAll(/'([A-Za-z0-9_]+)'/g)) if (!cmp.has(x[1]) && !/_$/.test(x[1])) add(x[1]); }
    if (/sfx301|skillsfx|sfxsamples/.test(f)) for (const x of src.matchAll(/name === '([\w]+)'/g)) answered.add(x[1]); }
  const { page, errors, close } = await openGame({ width: 800, height: 600 });
  try {
    const r = await page.evaluate(([list, ok]) => { const bad = [];
      for (const [n, where] of list) if (!SFX.has(n) && !ok.includes(n)) bad.push(`'${n}' (${where.join(', ')}) is not a sound`);
      const wps = new Set(Object.values(JOBS).map(j => j.weapon && j.weapon.type).filter(Boolean));
      for (const w of wps) for (const n of ['atk_' + SFX.WPN(w), 'hit_' + SFX.WPN(w)]) if (!SFX.has(n)) bad.push(`weapon ${w}: no sound ${n}`);
      for (const e of [...ELEM, 'neutral']) for (const n of ['sp_' + SFX.EL(e), 'im_' + SFX.EL(e)]) if (!SFX.has(n)) bad.push(`element ${e}: no sound ${n}`);
      for (const k in MOB){ const m = {type:k, def:MOB[k]};
        for (const kind of ['atk', 'hurt', ...(MOB[k].ranged || MOB[k].shot ? ['shot'] : [])]){ const n = SFX.voice(kind, m); if (!SFX.has(n)) bad.push(`${k}: no ${kind} voice ${n}`); } }
      return {n:list.length, w:wps.size, bad}; }, [[...names].map(([n, s]) => [n, [...s]]), [...answered]]);
    assert.ok(r.n >= 40 && r.w >= 5, `${r.n} names, ${r.w} weapons`);
    assert.deepStrictEqual(r.bad, [], `${r.n} sound names, ${r.w} weapon types`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
