/* VAYRATHEN — tests/jobs.test.js — the Herbalist / Royal Physician can fight on their own, and the Hunter can get
   an animal: rent one from the beast keeper in Aren (it fights, runs out, gives back a caught pet), with a guide
   pointing a petless Hunter there. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

/* a job with every skill of its chain at max, at a given level, with INT/DEX like a caster would build */
const SETUP = (job, lvl) => {
  S.job = job; S.lvl = lvl; S.jlvl = JOBS[job].jobMax; S.skills = {};
  for (const [id, sk] of Object.entries(SKILLS)) if (jobChain(job).includes(sk.job)) S.skills[id] = sk.max;
  S.stats = {str:1, agi:10, vit:20, int:Math.round(lvl * 1.1), dex:Math.round(lvl * .6), luk:1};
  derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; P.cds = {}; P.acd = 0; P.cast = null; P.dead = false; renderHotbar(); dirty = true;
};
/* the next living monster, with the hero standing next to it */
const FOE = () => { let live = mobs.filter(m => !m.dead && !m.vanish && !m.dummy); if (live.length < 2){ loadMap(1); live = mobs.filter(m => !m.dead && !m.vanish && !m.dummy); }
  const m = live[0]; m.maxhp = m.hp = 1e7; m.st = {root:30}; P.x = m.x - 60; P.y = m.y; P.target = m; return m; };

test('Herbalist and Royal Physician: the new damage skills hurt monsters', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { loadMap(1); });
    await page.waitForTimeout(800);
    for (const [job, ids] of [['healer', ['holywater']], ['physician', ['holycircle']]]){   // (v76) each healer line keeps one damage skill
      await page.evaluate(`(${SETUP})('${job}', ${job === 'healer' ? 40 : 90})`);
      for (const id of ids){
        await page.evaluate(`window.__m = (${FOE})(); window.__hp = __m.hp; S.sp = DER.maxsp; P.cds = {}; P.acd = 0;
          trySkill('${id}'); if (P.cast){ const c = P.cast; P.cast = null; fireSkill(c.id, c.lv, c.target); }`);
        await page.waitForTimeout(1600);   // projectiles fly, area hits land
        const lost = await page.evaluate(() => window.__hp - window.__m.hp);
        assert.ok(lost > 0, `${job} · ${id} damaged the monster (${lost})`);
      }
    }
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('healer damage per second stays a fair share of the Mage (healers heal, mages blast)', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    // MATK per second of the best single-target skill: hits × multiplier / (cast × cast speed + after-cast delay, at least the cooldown)
    const r = await page.evaluate(`(() => { const best = (job, lvl) => { (${SETUP})(job, lvl); let b = 0;
        for (const id of ownedSkillIds()){ const sk = SKILLS[id], lv = skl(id); if (!lv || !['bolt', 'aoeTarget'].includes(sk.type) || !sk.magic) continue;
          const per = (sk.hits ? sk.hits(lv) : 1) * sk.dmg(lv), t = Math.max(skCd(sk, lv), (sk.cast ? sk.cast(lv) : 0) * DER.castMul + skAcd(sk, lv)); b = Math.max(b, per / t); }
        return b; };
      return {healer:best('healer', 50), rune:best('rune', 50), physician:best('physician', 90), astro:best('astro', 90)}; })()`);
    assert.ok(r.healer >= r.rune * .6, `Herbalist ${r.healer.toFixed(2)} vs Mage ${r.rune.toFixed(2)} MATK/s`);
    assert.ok(r.physician >= r.astro * .55, `Royal Physician ${r.physician.toFixed(2)} vs Astromancer ${r.astro.toFixed(2)} MATK/s`);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('the beast keeper rents helper animals: they fetch the most important drop first, one a second, give a buff and never fight', { skip, timeout: 180000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const rent = await page.evaluate(`(() => { (${SETUP})('blade', 30); S.bia = 100000; S.helper = null; derive();
      const n = NPCS.find(x => x.id === 'beastkeeper'); P.x = n.x + 30; P.y = n.y + 10; openNpc(n);
      const rows = document.querySelectorAll('#dialog .rentrow').length, atk0 = DER.atk;
      const b = document.querySelector('#dialog [data-rentpet="ridgeback"][data-rt="0"]'), price = rentPrice('ridgeback', 0); b.click();
      return {rows, helper:S.helper, atk0, atk1:DER.atk, paid:100000 - S.bia, price, pet:S.pet, dialog:document.getElementById('dialog').dataset.npc, saved:JSON.parse(localStorage.getItem(slotKey(SLOT))).helper}; })()`);
    assert.strictEqual(rent.rows, 10, 'ten animals to rent');
    assert.strictEqual(rent.helper.k, 'ridgeback');
    assert.ok(rent.helper.left > 86300 && rent.helper.left <= 86400 && rent.helper.until > Date.now(), 'rented for one day on the real clock (daily plan)');
    assert.strictEqual(rent.paid, rent.price, 'paid the listed price');
    assert.ok(rent.atk1 > rent.atk0, `the ridgeback's ATK buff applies (${rent.atk0} → ${rent.atk1})`);
    assert.ok(!rent.pet, 'it is not a fighting pet');
    assert.strictEqual(rent.dialog, 'beastkeeper', 'the dialog stays open');
    assert.ok(rent.saved && rent.saved.k === 'ridgeback', 'the rental is in the save');
    // on a hunting map: three drops around the hero; the gear comes first, one item per second
    const ids = await page.evaluate(() => { closeDialog(); loadMap(1); const gear = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'gear' && ITEMS[k].slot === 'weapon'), cheap = Object.keys(ITEMS).find(k => ITEMS[k].kind === 'etc' && ITEMS[k].sell > 0);
      LOOT.length = 0; dropLoot(cheap, P.x + 90, P.y); dropLoot(cheap, P.x - 90, P.y); dropLoot(gear, P.x + 140, P.y + 40); HLP.cd = 0; HLP.tgt = null; S.inv = {}; return {gear, cheap}; });
    await page.waitForFunction(() => Object.keys(S.inv).length > 0, null, { timeout: 8000 });
    const first = await page.evaluate(() => ({inv:{...S.inv}, left:LOOT.length, t:performance.now()}));
    assert.ok(Object.keys(first.inv).length === 1 && Object.keys(first.inv)[0].split('~')[0] === ids.gear, 'the weapon was fetched first: ' + Object.keys(first.inv));
    await page.waitForTimeout(600);
    assert.ok(await page.evaluate(() => LOOT.length) >= 1, 'not faster than one item a second');
    await page.waitForFunction(() => LOOT.length === 0, null, { timeout: 8000 }).catch(async e => { console.log(await page.evaluate(() => JSON.stringify({L:LOOT.map(l => [l.id, Math.round(l.x), Math.round(l.y)]), P:[P.x, P.y, P.dead], H:[HLP.x, HLP.y, HLP.cd, !!HLP.tgt, HLP.picks], h:S.helper}))); throw e; });
    assert.strictEqual(await page.evaluate(id => S.inv[id], ids.cheap), 2, 'then the rest');
    // handing it back drops the buff
    const end = await page.evaluate(() => { const a = DER.atk; endHelper('return'); return {a, b:DER.atk, h:S.helper}; });
    assert.ok(end.b < end.a && !end.h, 'the buff goes with it');
    // running out of time
    await page.evaluate(() => { S.bia = 100000; rentHelper('hawk', 0); S.helper.left = .3; S.helper.until = Date.now() + 300; });
    await page.waitForTimeout(1200);
    const exp = await page.evaluate(() => ({h:S.helper, banner:document.getElementById('banner').textContent}));
    assert.ok(!exp.h, 'the rental is over');
    assert.ok(/หมดเวลาเช่า|rental is over/.test(exp.banner), 'a notice says the rental ended: ' + exp.banner);
    // there is no auto loot: a drop stays on the ground
    const auto = await page.evaluate(() => { LOOT.length = 0; S.inv = {}; dropLoot(Object.keys(ITEMS).find(k => ITEMS[k].kind === 'etc'), P.x + 60, P.y); return {loot:LOOT.length, inv:Object.keys(S.inv).length, set:!!document.querySelector('#set-autoLoot'), chip:!!document.getElementById('lootChip')}; });
    assert.deepStrictEqual(auto, {loot:1, inv:0, set:false, chip:false}, 'drops land on the ground and no auto loot switch exists');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('a Hunter with no pet is told how to catch one', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(`(() => { (${SETUP})('ranger', 20); S.pet = null; S.petd = null; renderGoal();
      const g = document.querySelector('#goal .pethint');
      return {hint:g && g.textContent, tip:SKILLS.callpet.desc(1)}; })()`);
    assert.ok(r.hint && /T/.test(r.hint), 'a line under the tracker says how to catch one: ' + r.hint);
    assert.ok(/\(T\)/.test(r.tip), 'pet skill tooltips say how to get a pet');
    await page.evaluate(() => { P.cds = {}; P.acd = 0; S.sp = DER.maxsp; toastMsg = ''; trySkill('callpet'); });
    assert.ok(/T/.test(await page.evaluate(() => toastMsg)), 'Pipe Call tells how to get a pet');
    await page.evaluate(() => { S.pet = 'hare'; S.petd = null; petEnsure(); renderGoal(); });
    assert.strictEqual(await page.evaluate(() => !!document.querySelector('#goal .pethint')), false, 'no hint once the hunter has a pet');
    await page.evaluate(`(() => { (${SETUP})('blade', 20); S.pet = null; S.petd = null; renderGoal(); })()`);
    assert.strictEqual(await page.evaluate(() => !!document.querySelector('#goal .pethint')), false, 'no pet hint for a Swordsman');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('old saves without the new skill tables or rentals load and refund points', { skip, timeout: 60000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      // a Royal Physician saved under the old tables: Herbalism 10, Remedy 10, Compress 10, Resilience 5 · Elixir 10, Sleep 5 …
      const old = {v:2, job:'physician', skPts:0, skills:{herbalism:10, herbheal:10, poultice:10, holywater:5, smoke:5, resist:5, calm:3, thread:1, elixir:10, royaltext:10, holycircle:5, sleep:5, lifeelixir:5, toxiccloud:5, remedybody:5, mercy:3, ward:1}, pet:'hare', petd:null};
      const s = migrateSave(old);
      const over = Object.entries(old.skills).reduce((t, [k, v]) => t + (SKILLS[k] ? Math.max(0, v - SKILLS[k].max) : 0), 0), kept = Object.entries(s.skills).every(([k, v]) => !SKILLS[k] || v <= SKILLS[k].max);
      return {pts:s.skPts, over, kept, stash:s.petStash};
    });
    // (v159) the skill tables changed again (eight skills a tier); whatever the maximums are now, nothing stays above one
    // and the levels above it come back as points
    assert.ok(r.kept, 'no skill stays above its maximum');
    assert.ok(r.pts >= r.over, `the levels above the maximums come back as points (${r.pts} ≥ ${r.over})`);
    assert.strictEqual(r.stash, undefined);
    assert.strictEqual(await page.evaluate(() => { S.pet = 'hare'; S.petd = null; petEnsure(); S.helper = null; return helperOf(); }), null, 'a caught pet is not a rented helper');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('summoner: the Sming Tiger replaces the Singha, drawn from its sheet in every pose', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { beastArtUse(true); S.job = 'summoner'; S.lvl = 60; S.skills = S.skills || {}; S.skills.callsingha = 10; derive(); S.sp = DER.maxsp; fireSkill('callsingha', 10, null); });
    await page.waitForFunction(() => SMING.ready && SUMMONS.some(s => s.beast === 'singha'), null, { timeout: 15000 });
    const r = await page.evaluate(() => { const s = SUMMONS.find(s => s.beast === 'singha'), poses = [];
      for (const set of [{}, { moving: true }, { atkT: .3 }, { skT: .4 }, { hurt: .2 }]){ const keep = { ...s }; Object.assign(s, set); poses.push(smingPose(s)); drawBeast(ctx, s); Object.assign(s, keep); }
      return { name: HIMMA.singha.name, skill: [SKILLS.callsingha.name, SKILLS.callsingha.en], roar: HIMMA.singha.skill.name[0], desc: SKILLS.callsingha.desc(5), poses }; });
    assert.deepStrictEqual(r.name, ['เสือสมิง', 'Sming Tiger']);
    assert.deepStrictEqual(r.skill, ['อัญเชิญเสือสมิง', 'Call the Sming Tiger']);
    assert.strictEqual(r.roar, 'คำรามเสือสมิง');
    assert.ok(!/ราชสีห์/.test(r.desc), 'no Singha left in the tooltip');
    assert.deepStrictEqual(r.poses, ['idle', 'walk', 'attack', 'roar', 'hit']);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('sovereign: Erawan is drawn from its sheet (idle, walk, sweep, blessing, fall)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { beastArtUse(true); S.job = 'sovereign'; S.lvl = 150; S.skills = S.skills || {}; S.skills.callerawan = 5; derive(); S.sp = DER.maxsp; fireSkill('callerawan', 5, null); });
    await page.waitForFunction(() => BEAST_ART.erawan.ready && SUMMONS.some(s => s.beast === 'erawan'), null, { timeout: 15000 });
    const poses = await page.evaluate(() => { const s = SUMMONS.find(s => s.beast === 'erawan'), out = [];
      for (const set of [{}, { moving: true }, { atkT: .3 }, { skT: .4 }, { t: s.dur - .3 }]){ const keep = { ...s }; Object.assign(s, set); out.push(beastPose(s, BEAST_ART.erawan)); drawBeast(ctx, s); Object.assign(s, keep); }
      return out; });
    assert.deepStrictEqual(poses, ['idle', 'walk', 'attack', 'skill', 'dead']);
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('summoner: the Kinnaree is drawn from her sheet (idle, flight, feather slash, golden dance, fall)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { beastArtUse(true); S.job = 'summoner'; S.lvl = 150; S.skills = S.skills || {}; S.skills.callkinnaree = 3; derive(); S.sp = DER.maxsp; fireSkill('callkinnaree', 3, null); });
    await page.waitForFunction(() => BEAST_ART.kinnaree.ready && SUMMONS.some(s => s.beast === 'kinnaree'), null, { timeout: 15000 });
    const poses = await page.evaluate(() => { const s = SUMMONS.find(s => s.beast === 'kinnaree'), out = [];
      for (const set of [{}, { moving: true, dir: 2 }, { atkT: .3, dir: 6 }, { skT: .4 }, { t: s.dur - .3 }]){ const keep = { ...s }; Object.assign(s, set); out.push(kinPose(s)); drawBeast(ctx, s); Object.assign(s, keep); }
      return out; });
    assert.deepStrictEqual(poses, ['idle', 'walk', 'attack', 'skill', 'dead']);
    assert.strictEqual(await page.evaluate(() => HIMMA.kinnaree.mob), 'kinnareeart');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('summoner: the Naga is drawn from its sheet (coil, slither, tail-lash, water pillar, fall)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { beastArtUse(true); S.job = 'summoner'; S.lvl = 150; S.skills = S.skills || {}; S.skills.callnaga = 3; derive(); S.sp = DER.maxsp; fireSkill('callnaga', 3, null); });
    await page.waitForFunction(() => BEAST_ART.naga.ready && SUMMONS.some(s => s.beast === 'naga'), null, { timeout: 15000 });
    const poses = await page.evaluate(() => { const s = SUMMONS.find(s => s.beast === 'naga'), out = [];
      for (const set of [{}, { moving: true, dir: 3 }, { atkT: .3 }, { skT: .4 }, { t: s.dur - .3 }]){ const keep = { ...s }; Object.assign(s, set); out.push(nagaPose(s)); drawBeast(ctx, s); Object.assign(s, keep); }
      return out; });
    assert.deepStrictEqual(poses, ['idle', 'walk', 'attack', 'skill', 'dead']);
    assert.strictEqual(await page.evaluate(() => HIMMA.naga.mob), 'nagaart');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('sovereign: the Garuda is drawn from its sheet (stance, stride, talon dash, golden pillar, fall)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    await page.evaluate(() => { beastArtUse(true); S.job = 'sovereign'; S.lvl = 150; S.skills = S.skills || {}; S.skills.callgaruda = 1; derive(); S.sp = DER.maxsp; fireSkill('callgaruda', 1, null); });
    await page.waitForFunction(() => BEAST_ART.garuda.ready && SUMMONS.some(s => s.beast === 'garuda'), null, { timeout: 15000 });
    const poses = await page.evaluate(() => { const s = SUMMONS.find(s => s.beast === 'garuda'), out = [];
      for (const set of [{}, { moving: true, dir: 5 }, { atkT: .3, dir: 2 }, { skT: .4, diveT: .2 }, { t: s.dur - .3 }]){ const keep = { ...s }; Object.assign(s, set); out.push(garudaPose(s)); drawBeast(ctx, s); Object.assign(s, keep); }
      return out; });
    assert.deepStrictEqual(poses, ['idle', 'walk', 'attack', 'skill', 'dead']);
    assert.strictEqual(await page.evaluate(() => HIMMA.garuda.mob), 'garudaart');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('summoner: summons use their old look by default (drawn sheets switched off)', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => { S.job = 'summoner'; S.lvl = 150; S.skills = S.skills || {}; S.skills.callsingha = 10; S.skills.callnaga = 3; derive(); S.sp = DER.maxsp;
      fireSkill('callsingha', 10, null); S.sp = DER.maxsp; fireSkill('callnaga', 3, null);
      for (const s of SUMMONS) drawBeast(ctx, s);
      return { on: BEAST_ART_ON, mobs: Object.keys(BEAST_ART).map(k => HIMMA[k].mob), sheets: Object.keys(BEAST_ART).every(k => !!SHEETS[HIMMA[k].mob]), name: HIMMA.singha.name[0] }; });
    assert.strictEqual(r.on, false);
    assert.deepStrictEqual(r.mobs, ['misttiger', 'youngerawan', 'goldkinnaree', 'lakenaga', 'goldgaruda']);
    assert.ok(r.sheets, 'every summon has its old sprite');
    assert.strictEqual(r.name, 'เสือสมิง');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('switching class leaves nothing of the old class behind: no beasts, no bound boss, no skill buffs', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      S.job = 'sovereign'; S.lvl = 99; S.jlvl = 50; S.skills = {royalbond:1, callgaruda:5};
      S.cls = {have:{summoner:{job:'sovereign'}, blade:{job:'blade', jlvl:5, jexp:0, skills:{}, skPts:0, hot:null}}, free:0};
      derive(); S.bound = {type:'whitemonkeyking', hp:1}; spawnBound();
      conjure(SKILLS.callgaruda, 5); addBuff('callgaruda', {t:30}); addBuff('food', {t:30, atk:5});
      const before = {summons:SUMMONS.length, buffs:Object.keys(P.buffs).sort().join(',')};
      P.x = VSPAWN.x; P.y = VSPAWN.y; csGo('blade', 'summoner');
      for (let i = 0; i < 30; i++) EV.emit('tick', .05);
      updSkills(.1);
      return {before, job:S.job, summons:SUMMONS.length, buffs:Object.keys(P.buffs).join(','), bond:skl('royalbond')};
    });
    assert.ok(r.before.summons >= 2, 'a beast and the bound boss were out');
    assert.equal(r.job, 'blade');
    assert.equal(r.summons, 0, 'no summons follow the Swordsman');
    assert.equal(r.buffs, 'food', 'only the food buff stays');
    assert.equal(r.bond, 0);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});

test('unlocking another class costs Vayra Coins, not Bia', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      S.job = 'blade'; S.jlvl = 10; S.skills = {}; derive(); P.x = VSPAWN.x; P.y = VSPAWN.y;
      S.cls = {have:{blade:{job:'blade'}}, free:0}; S.bia = 5e6; ACC.coins = 20;
      csSwitch('rune'); const poor = {job:S.job, bia:S.bia, coins:ACC.coins};
      ACC.coins = 150; window.sysPrompt = (q, yes) => yes(); csSwitch('rune');
      return {poor, job:S.job, bia:S.bia, coins:ACC.coins};
    });
    assert.deepStrictEqual(r.poor, {job:'blade', bia:5e6, coins:20}, 'not enough coins: nothing happens');
    assert.equal(r.job, 'rune'); assert.equal(r.bia, 5e6, 'Bia untouched'); assert.ok(r.coins >= 50 && r.coins < 60, '100 coins spent (an achievement may pay a few back)');
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
