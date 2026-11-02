/* VAYRATHEN — tests/stress.test.js — walks every map, plays every job with every skill maxed,
   opens every window, and lets the Auto bot hunt. Any uncaught error or console.error fails the test. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

/* give the hero a job with every skill at max, full HP/SP, a high level and plenty of arrows */
const SETUP_JOB = job => {
  S.job = job; S.lvl = 99; S.jlvl = JOBS[job].jobMax; S.skills = S.skills || {};
  for (const [id, sk] of Object.entries(SKILLS)) if (sk.job === job || sk.job === 'novice' || sk.job === JOBS[job].parent || sk.job === (JOBS[JOBS[job].parent] || {}).parent) S.skills[id] = sk.max;
  for (const g of GEAR_LIST) if (g[1] === 'ammo') S.inv[g[0]] = 999;
  S.gear = S.gear || {}; S.gear.ammo = 'q_wood';
  derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; renderHotbar(); dirty = true;
};

test('every map loads and runs', { skip, timeout: 600000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const n = await page.evaluate(() => MAPS.length);
    for (let i = 0; i < n; i++){
      await page.evaluate(id => { P.dead = false; S.hp = DER.maxhp; loadMap(id); P.x = VSPAWN.x; P.y = VSPAWN.y; }, i);   // full HP: a death would send the hero back to town mid-test
      await page.waitForTimeout(700);
      const st = await page.evaluate(() => ({ id: MAP_ID, x: P.x, y: P.y }));
      assert.strictEqual(st.id, i, 'map ' + i + ' became current');
      assert.ok(Number.isFinite(st.x), 'player position after map ' + i);
    }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('every job can use every skill', { skip, timeout: 600000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const jobs = await page.evaluate(() => Object.keys(JOBS));
    // a hunting map, so skills hit real monsters (town only has the training dummy); add the dummy-like
    // monsters with no drops too, since several skills (Pickpocket) read the target's drop list
    await page.evaluate(() => { loadMap(1); });
    await page.waitForTimeout(800);
    for (const job of jobs){
      await page.evaluate(`(${SETUP_JOB})(${JSON.stringify(job)})`);
      const ids = await page.evaluate(() => Object.keys(S.skills).filter(id => SKILLS[id] && SKILLS[id].type !== 'passive' && (typeof ownedSkillIds !== 'function' || ownedSkillIds().includes(id))));   // only this job's own skills (S.skills keeps the ones learned for the jobs tested before)
      const silent = [];
      for (const id of ids){
        // several casts on different monsters, so random branches (steal rolls, procs) get exercised;
        // the last one hits a target with nothing to drop
        const fired = await page.evaluate(sid => {
          let fired = false;
          for (let rep = 0; rep < 6; rep++){
            let live = mobs.filter(m => !m.dead && !m.vanish);
            if (live.length < 3){ loadMap(1); live = mobs.filter(m => !m.dead && !m.vanish); }   // a Lv 99 hero clears the map fast
            const m = live[rep % Math.max(1, live.length)]; if (m){ P.x = m.x - 20; P.y = m.y; P.target = m; }
            if (m && rep === 5) m.def = Object.assign({}, m.def, { drops: [] });
            S.hp = Math.max(1, Math.round(DER.maxhp * .5)); S.sp = DER.maxsp; P.cds = {}; P.acd = 0; P.cast = null; P.dead = false; P.stunT = 0; P.pending = null; P.channel = null;
            const sp0 = S.sp;
            if (typeof GT !== 'undefined') GT.forced = true;   // PC ground aiming (groundtarget.js) would wait for a click
            try { trySkill(sid); } finally { if (typeof GT !== 'undefined') GT.forced = false; }
            if (P.cast){ const c = P.cast; P.cast = null; fireSkill(c.id, c.lv, c.target); }   // skip the cast bar
            if ((P.cds[sid] || 0) > 0 || S.sp < sp0) fired = true;
          }
          return fired;
        }, id);
        if (!fired && id !== 'callpet') silent.push(id);   // callpet needs a tamed pet first
        await page.waitForTimeout(80);
      }
      assert.deepStrictEqual(silent, [], `${job}: every active skill goes off`);
      await page.waitForTimeout(1500);   // let casts, DoTs, traps and summons play out
      const st = await page.evaluate(() => ({ hp: S.hp, sp: S.sp, x: P.x }));
      assert.ok(Number.isFinite(st.hp) && Number.isFinite(st.sp) && Number.isFinite(st.x), `numbers stay valid for ${job}: ` + JSON.stringify(st));
    }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('every window opens and closes, in Thai and in English', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    for (const lang of ['th', 'en']){
      await page.evaluate(l => { if (typeof setLang === 'function') setLang(l); else if (typeof LANG !== 'undefined') { LANG = l; applyStaticLang(); } }, lang);
      const ids = await page.evaluate(() => WIN_IDS.slice());
      for (const id of ids){
        await page.evaluate(w => openWin(w), id);
        await page.waitForTimeout(250);
        await page.evaluate(w => closeWin(w), id);
      }
    }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('Auto bot hunts for a while', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(`(${SETUP_JOB})('ranger')`);
    await page.evaluate(() => { S.lvl = 20; derive(); S.hp = DER.maxhp; loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; });   // sturdy enough not to fall on the first hunting map
    const kills0 = await page.evaluate(() => (S.st && S.st.kills) || 0);
    await page.evaluate(() => setBot(true));
    await page.waitForFunction(k0 => ((S.st && S.st.kills) || 0) > k0, kills0, { timeout: 60000 }).catch(() => {});   // a busy machine runs the game slower
    const st = await page.evaluate(() => ({ on: BOT.on, hp: S.hp, exp: S.exp, x: P.x, kills: (S.st && S.st.kills) || 0 }));
    assert.ok(Number.isFinite(st.x) && Number.isFinite(st.hp) && Number.isFinite(st.exp), 'numbers stay valid: ' + JSON.stringify(st));
    assert.ok(st.kills > kills0, 'the bot killed something: ' + JSON.stringify(st));
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('hero falls in battle and wakes up in town', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { loadMap(1); P.x = VSPAWN.x; P.y = VSPAWN.y; S.exp = 50; playerDie(); });
    await page.waitForFunction(() => P.dead && el('dth') && !el('dth').hidden, null, { timeout: 15000 });   // (v241) the death sign: the player gets up
    await page.click('[data-dth="town"]');
    await page.waitForFunction(() => !P.dead, null, { timeout: 15000 });
    const st = await page.evaluate(() => ({ map: MAP_ID, hp: S.hp, exp: S.exp }));
    assert.strictEqual(st.map, 0, 'respawned in town');
    assert.ok(st.hp > 0, 'has HP again');
    assert.ok(st.exp >= 0, 'EXP never goes negative');
    await page.waitForTimeout(1000);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});
