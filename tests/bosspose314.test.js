/* VAYRATHEN — tests/bosspose314.test.js — (v314) a boss acts every move with its own body: every move (its own list,
   fury moves, the nature kit) starts a pose timed to the warning; four-legged bosses fold their front legs and throw
   the head up; a boss on the ground is not lifted into the air; a new phase reels then roars; heroes leave afterimages
   when they flash or dash */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('boss moves: a pose for every move, limbs that act, no floating, phase stagger; hero flash and dash afterimages', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(async () => { const o = {}; loadMap(1); P.x = W * .4; P.y = H * .4; derive(); S.hp = DER.maxhp; const keep = setInterval(() => { S.hp = DER.maxhp; P.dead = false; }, 100);
      const b = spawnMob('saming', P.x + 140, P.y, {zone:MAPZ}); b.hp = b.maxhp = 1e12; b.bcd = 99;
      // every kind of move starts a pose through bossact's baStart
      o.moves = {}; for (const [id, kind] of [['trample', 'heavy'], ['rend', 'dash'], ['bladestorm', 'spin'], ['warcry', 'roar'], ['shadowstep', 'blink'], ['venom', 'spell'], ['healaura', 'power'], ['curse', 'spell']]){
        b.bp = null; b.ba = null; baStart(b, id, kind, .9, 'x'); o.moves[id] = b.bp ? b.bp.act : null; }
      // the plan and the native limbs
      o.plan = SPR.bpPlan(SPR.MOBS.saming); o.native = !!SPR.MOBS.saming.native;
      const sig = img => { let h = 0; for (let i = 3; i < img.data.length; i += 8) h = (h * 31 + img.data[i] + img.data[i - 1]) >>> 0; return h; };
      o.roarDiffers = sig(SPR.renderFrame('mob', 'saming', 'broar', 2, 4, 1)) !== sig(SPR.renderFrame('mob', 'saming', 'idle', 2, 0, 1));
      o.bpxCleared = globalThis.BPX === null;
      // no lift for a boss on the ground while a heavy move winds up
      b.bp = null; baStart(b, 'slam', 'heavy', 1, 'x'); const fz = b.fz, z0 = fz ? fz.z || 0 : 0; let seen = 0; const g = document.createElement('canvas').getContext('2d');
      if (fz){ const d = Object.getOwnPropertyDescriptor(fz, 'z'); let v = fz.z || 0; Object.defineProperty(fz, 'z', {configurable:true, get(){ return v; }, set(x){ v = x; seen = Math.max(seen, x - z0); }}); b.ba.t0 = T - .8; drawMobW(g, b); delete fz.z; fz.z = v; }
      o.lift = seen;
      // a new phase: reel then roar
      if (typeof furyPhaseUp === 'function'){ const F = furyOf(b); F.phase = 2; b.bp = null; furyPhaseUp(b, F); o.phase = b.bp && b.bp.act; }
      // hero afterimages
      const wait = async () => { const n0 = MFX.n || 0; for (let i = 0; i < 40 && (MFX.n || 0) === n0; i++) await new Promise(res => setTimeout(res, 50)); };
      P.x = W * .4; P.y = H * .4; await new Promise(res => setTimeout(res, 300)); MFX.g = []; MFX.sk = {type:'blink', t:T}; P.x += 140; await wait(); o.flash = MFX.g.length;
      MFX.g = []; MFX.sk = {type:'dash', t:T}; P.x -= 160; await wait(); o.dash = MFX.g.length;
      SETTINGS.classFx = false; MFX.g = []; MFX.sk = {type:'blink', t:T}; P.x += 140; await new Promise(res => setTimeout(res, 600)); o.off = MFX.g.length; SETTINGS.classFx = true;
      clearInterval(keep); b.dead = true; return o; });
    assert.deepStrictEqual(r.moves, {trample:'bslam', rend:'bcharge', bladestorm:'bspin', warcry:'broar', shadowstep:'bvanish', venom:'bbreath', healaura:'bcast', curse:'bcast'}, 'every move has a pose: ' + JSON.stringify(r.moves));
    assert.strictEqual(r.plan, 'quad'); assert.ok(r.native, 'a four-legged boss acts with its own limbs');
    assert.ok(r.roarDiffers, 'the roar is its own picture'); assert.ok(r.bpxCleared, 'the pose data is cleared after drawing');
    assert.ok(r.lift < .5, 'a boss on the ground is not lifted into the air while it winds up: ' + r.lift);
    if (r.phase !== undefined) assert.strictEqual(r.phase, 'bphase', 'a new phase reels then roars');
    assert.ok(r.flash >= 4, 'a flash leaves afterimages along its path: ' + r.flash);
    assert.ok(r.dash >= 3, 'a dash leaves afterimages: ' + r.dash);
    assert.strictEqual(r.off, 0, 'the class-effects switch turns them off');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no page errors');
});
