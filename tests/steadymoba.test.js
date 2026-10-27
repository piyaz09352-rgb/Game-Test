/* VAYRATHEN — tests/steadymoba.test.js — (v112) under Auto the touch skill buttons are not rebuilt or darkened
   on every cast (they used to jump and blink) */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('touch buttons stay put and only the cast skill shows its cooldown', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame({ width:844, height:390, ctx:{ isMobile:true, hasTouch:true, deviceScaleFactor:3 } });
  try {
    await enterWorld(page, 'St');
    const r = await page.evaluate(async () => {
      const c = el('confirm'); if (c) c.hidden = true;
      S.job = 'sovereign'; S.lvl = 163; for (const id of [...JOBS.summoner.skills, ...JOBS.sovereign.skills]) S.skills[id] = 5;
      S.hot = [...JOBS.sovereign.skills, ...JOBS.summoner.skills].filter(id => SKILLS[id] && SKILLS[id].type !== 'passive').slice(0, 8);
      derive(); SETTINGS.control = 'joy'; applyControlMode(); renderMoba(); loadMap(1); P.x = W / 2; P.y = H / 2;
      for (let i = 0; i < 5; i++){ const m = spawnMob(MAPS[1].mobs[0], P.x + 60 + i * 15, P.y + (i - 2) * 20, {zone:MAPZ}); m.hp = m.maxhp = 1e9; m.def = {...m.def, atk:[0, 0]}; }
      const box = el('mobaAct'); let rebuilt = 0, moved = 0; const mo = new MutationObserver(l => { for (const m of l) if (m.type === 'childList' && m.target === box) rebuilt++; }); mo.observe(box, {childList:true});
      const first = [...box.querySelectorAll('.mo.sk')].map(e => e.getBoundingClientRect().left | 0);
      S.bot = null; const bb = botSet(); bb.list.forEach(e => e.on = true); BOT.on = true;
      const casts = {}, _ts = trySkill; trySkill = function(id){ casts[id] = 1; return _ts.apply(this, arguments); };
      const dark = new Set(); const t = setInterval(() => { S.sp = DER.maxsp; S.hp = DER.maxhp; dirty = true;
        box.querySelectorAll('.mo.sk .cdv').forEach(cv => { if (+getComputedStyle(cv).getPropertyValue('--cd') > 0) dark.add(cv.dataset.cd); }); }, 50);
      await new Promise(r => setTimeout(r, 5000)); clearInterval(t); BOT.on = false; trySkill = _ts;
      const last = [...box.querySelectorAll('.mo.sk')].map(e => e.getBoundingClientRect().left | 0);
      return {rebuilt, same:JSON.stringify(first) === JSON.stringify(last), darkNotCast:[...dark].filter(id => !casts[id])};
    });
    assert.strictEqual(r.rebuilt, 0, 'the buttons are not rebuilt while fighting');
    assert.ok(r.same, 'the buttons do not move');
    assert.deepStrictEqual(r.darkNotCast, [], 'only skills that were cast show a cooldown');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
