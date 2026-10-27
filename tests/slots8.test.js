/* VAYRATHEN — tests/slots8.test.js — v29: the eight-place paper doll
   Weapon, shield, head, armour, legs, feet and two accessories (+ arrows for bows); earrings, eyewear, masks and
   mouth pieces (retired in v28) are gone from the game,
   an old save holding them is refunded once (bia + cards back), class-set legguards become talismans; plus the
   v28 menu changes, the Golden Jelly King card at 3 %, and white text with a black edge. */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed (run npm install)';

test('eight places, nothing retired left, old saves refunded', { skip, timeout: 240000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page);
    const r = await page.evaluate(() => {
      const GONE = ['ear', 'eye', 'face', 'mouth'];
      const out = {};
      out.goneItems = Object.keys(ITEMS).filter(k => GONE.includes(ITEMS[k].slot) || /^(sw|er|ey|fc|mo)_\d+$/.test(k) || /_pants$/.test(k));
      out.goneList = GEAR_LIST.filter(g => GONE.includes(g[1])).length;
      out.goneCos = Object.keys(COSTUME).filter(k => GONE.includes(COSTUME[k].slot));
      out.goneCards = Object.keys(CARDS).filter(k => !['weapon', 'shield', 'head', 'armor', 'pants', 'acc', 'shoes'].includes(CARDS[k].slot));   // v29: cards for seven places (sys/cards8.js)
      out.sock = EQ_SOCKET.join(',');
      out.recipes = typeof RCP !== 'undefined' ? Object.values(RCP).filter(x => x.slot && GONE.includes(x.slot)).length : 0;
      openWin('equip'); renderEquip();
      out.doll = [...document.querySelectorAll('#pane-equip .eqdoll2 .eqsl')].map(e => [...e.classList].find(c => c.startsWith('eqsl-')).slice(5)).join(',');
      out.shields = GEAR_LIST.filter(g => g[1] === 'shield').length; out.legs = GEAR_LIST.filter(g => g[1] === 'pants').length;
      out.jelly = JELLY_DRAIN; out.jellyDesc = CARDS.c_boss.desc[0];
      // an old save: a worn shield with cards, legs, a mask in the bag, a class-set legguard, an off-hand blade
      const card = Object.keys(CARDS).find(k => CARDS[k].slot === 'armor'), card2 = Object.keys(CARDS).find(k => CARDS[k].slot === 'head');
      const s = {v:1, bia:100, cards:{}, inv:{'fc_4~zz01':1, pt_0:2, 'cs_blade_pants~zz02':1, 'w_sword1~zz03':0}, gear:{shield:'sd_3~zz04', pants:'pt_2~zz05', head:null, ear:'er_1', eye:null, weapon:null}, cos:{shoes:null, ear:'fe_pearl'},
        inst:{'fc_4~zz01':{b:'fc_4', r:3, q:{}, o:[]}, 'cs_blade_pants~zz02':{b:'cs_blade_pants', r:1, q:{}, o:[], k:1, c:[card]}, 'sd_3~zz04':{b:'sd_3', r:2, q:{}, o:[], k:2, c:[card, card2]}, 'pt_2~zz05':{b:'pt_2', r:0, q:{}, o:[]}}};
      instReg(s);
      out.mig = {bia:s.bia, cards:s.cards, inv:Object.keys(s.inv), gear:s.gear, cos:s.cos, note:s.v28note, v28:s.v28};
      const z1 = s.bia; instReg(s); out.again = s.bia === z1;
      // menu
      out.market = el('rail') ? [...document.querySelectorAll('#rail .mb')].map(b => b.textContent).join('|') : '';
      out.hidden = ['arena', 'bounty'].map(w => { const b = document.querySelector(`#rail .mb[data-win="${w}"]`); return !b || getComputedStyle(b).display === 'none'; });
      out.photo = !document.querySelector('#rail .mb[data-photo]');
      out.bounty = typeof WIN_RENDER.bounty;
      return out;
    });
    assert.deepEqual(r.goneItems, [], 'retired items still in ITEMS');
    assert.equal(r.goneList, 0); assert.deepEqual(r.goneCos, []); assert.deepEqual(r.goneCards, []); assert.equal(r.recipes, 0);
    assert.deepEqual(r.sock.split(',').sort(), ['acc', 'acc2', 'armor', 'head', 'pants', 'shield', 'shoes', 'weapon']);
    assert.deepEqual(r.doll.split(',').sort(), ['acc', 'acc2', 'armor', 'head', 'pants', 'shield', 'shoes', 'weapon']);
    assert.ok(r.shields === 11 && r.legs === 11, 'shields and legs: 11 tiers each');
    assert.equal(r.jelly, .03); assert.match(r.jellyDesc, /3%/);
    assert.ok(r.mig.v28 && r.mig.bia > 100, 'refund paid');
    assert.ok(r.mig.inv.some(k => k.startsWith('cs_blade_acc~')), 'class legguard → talisman');
    assert.ok(!r.mig.inv.some(k => /^(fc|er)_/.test(k)), 'retired pieces gone from the bag');
    assert.ok(r.mig.inv.includes('pt_0'), 'legs stay in the bag');
    assert.ok(r.mig.gear.shield === 'sd_3~zz04' && r.mig.gear.pants === 'pt_2~zz05', 'worn shield and legs kept');
    assert.ok(!('ear' in r.mig.gear) && !('eye' in r.mig.gear));
    assert.ok(!('ear' in r.mig.cos));
    assert.equal(Object.values(r.mig.cards).reduce((a, b) => a + b, 0), 1, 'the legguard card back (the shield keeps its own)');
    assert.equal(r.mig.note.n, 1 + 1);
    assert.ok(r.again, 'refund only once');
    assert.ok(!/ตลาดผู้เล่น|Player market/.test(r.market), 'market renamed'); assert.ok(r.market.includes('ตลาดกลาง') || r.market.includes('Market'));
    assert.deepEqual(r.hidden, [true, true]); assert.ok(r.photo); assert.equal(r.bounty, 'undefined');
    // white text gets a black edge
    const w = await page.evaluate(async () => { const d = document.createElement('div'); d.textContent = 'TEST'; d.style.color = '#fff'; d.id = 'woT'; document.body.appendChild(d);
      await new Promise(res => setTimeout(res, 300)); const has = d.classList.contains('wout'), sh = getComputedStyle(d).textShadow; d.remove(); return {has, sh}; });
    assert.ok(w.has && /0px 1px 0px|rgb\(0, 0, 0\)/.test(w.sh), 'white text outlined: ' + w.sh);
    assert.deepEqual(errors, []);
  } finally { await close(); }
});
