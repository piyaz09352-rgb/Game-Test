/* VAYRATHEN — tools/playtest.js — (v333) a crowd of bot testers that play the game like people
   The owner: «add about 100 bot IDs to try the game, simulated to be like humans». Each bot is its own browser with
   its own account and save (nothing touches the live game or real players). It signs up and makes a character through
   the real screens, then plays with a personality of its own, through the real windows and buttons:
     · walks out of town through a gate, picks monsters (careful ones near its level, bold ones higher), clicks them;
     · reacts with a human delay, uses skills now and then, drinks potions when HP is low — or forgets;
     · spends stat and skill points in the Status and Skill windows (+ and confirm), changes job at the teacher;
     · wanders into windows (bag, map, quests, settings…), goes AFK for a while, some just turn Auto on and leave it;
     · when it dies it presses a respawn button; when the monsters are too easy or too hard it warps to another field.
   Game time runs fast (the same stepping the balance report uses), with real frames between decisions so the HUD and
   windows draw. It records everything that goes wrong: script errors, getting stuck, dying again and again, no EXP for
   a long while, windows that fail to open or do not fit the screen, and how far each bot got.
   Usage:  node tools/playtest.js            100 bots × 20 game minutes, 6 at a time
           START_LV=50,100,150 BOTS=30 node tools/playtest.js   heroes that start high (mid and late game)
           BOTS=20 MIN=10 CONC=4 SEED=7 node tools/playtest.js
   Report: docs/PLAYTEST.md (in Thai) and docs/playtest-rows.json */
'use strict';
const fs = require('fs'), path = require('path');
const { serve } = require('../tests/serve');
let chromium; try { ({ chromium } = require('playwright')); } catch (e) { console.error('playwright is needed'); process.exit(1); }

const START = String(process.env.START_LV || '1').split(',').map(Number).filter(n => n >= 1);   // START_LV=50,100,150: heroes start at these levels (spread over the bots), set up like the balance report
const BOTS = +(process.env.BOTS || 100), MIN = +(process.env.MIN || 20), CONC = +(process.env.CONC || 6), SEED = +(process.env.SEED || 1);
const rng = s => () => (s = (s * 16807 + 11) % 2147483647) / 2147483647;
const FIRST = ['สมชาย', 'มะลิ', 'ต้นข้าว', 'ปลายฟ้า', 'นภา', 'กิ่งแก้ว', 'ภูผา', 'ดาวเหนือ', 'ใบเตย', 'เมฆา', 'Ken', 'Mint', 'Bank', 'Ice', 'Fern', 'Boss', 'Toey', 'Nut', 'Pim', 'Beam', 'Gun', 'May', 'Jay', 'Ploy', 'Tar'];
const LAST = ['', 'Zz', '99', 'TH', '_x', 'คุง', 'จัง', '007', 'Pro', 'Noob', 'Lv1', 'za', 'GG', ''];
const KINDS = [   // personality types, with how many of 100 are like this
  {k:'careful', n:22, risk:[-3, 1], react:[.5, 1.1], skill:[.5, .8], potAt:[.45, .6], forget:.05, auto:.05, afk:.04, curious:.25, statPlan:'job'},
  {k:'casual', n:30, risk:[-1, 4], react:[.6, 1.4], skill:[.2, .6], potAt:[.25, .45], forget:.2, auto:.35, afk:.1, curious:.4, statPlan:'random'},
  {k:'grinder', n:18, risk:[0, 6], react:[.3, .7], skill:[.6, .95], potAt:[.35, .5], forget:.05, auto:.6, afk:.02, curious:.1, statPlan:'job'},
  {k:'explorer', n:15, risk:[-2, 8], react:[.5, 1.2], skill:[.3, .7], potAt:[.3, .5], forget:.15, auto:.1, afk:.06, curious:.8, statPlan:'random'},
  {k:'reckless', n:10, risk:[5, 15], react:[.25, .6], skill:[.4, .9], potAt:[.1, .25], forget:.4, auto:.05, afk:.02, curious:.2, statPlan:'one'},
  {k:'newbie', n:5, risk:[-1, 10], react:[.9, 2.0], skill:[.05, .3], potAt:[.15, .4], forget:.5, auto:.1, afk:.15, curious:.6, statPlan:'none'}];
const SIZES = [['phone', 844, 390, true, .45], ['ipad', 1024, 768, true, .1], ['laptop', 1366, 768, false, .3], ['pc', 1920, 1080, false, .15]];

function makePersonas(){ const r = rng(SEED * 7919 + 3), out = [], pool = [];
  for (const K of KINDS) for (let i = 0; i < Math.round(K.n * BOTS / 100); i++) pool.push(K);
  while (pool.length < BOTS) pool.push(KINDS[1]);
  const span = ([a, b]) => a + r() * (b - a);
  for (let i = 0; i < BOTS; i++){ const K = pool[i]; let s = r(), d = SIZES[0]; for (const z of SIZES){ if (s < z[4]){ d = z; break; } s -= z[4]; }
    out.push({id:i + 1, acc:'pt' + String(i + 1).padStart(3, '0') + Math.floor(r() * 1e5), name:FIRST[Math.floor(r() * FIRST.length)] + LAST[Math.floor(r() * LAST.length)], kind:K.k,
      risk:Math.round(span(K.risk)), react:span(K.react), skill:span(K.skill), potAt:span(K.potAt), forget:K.forget, auto:r() < K.auto, afk:K.afk, curious:K.curious, statPlan:K.statPlan,
      device:d[0], w:d[1], h:d[2], touch:d[3], seed:Math.floor(r() * 1e9), startLv:START[i % START.length]}); }
  return out; }

/* ---------- what each bot does, inside its own page ---------- */
async function playInPage(p, simMin){
  const R = (() => { let s = p.seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; })(), pick = a => a[Math.floor(R() * a.length)];
  const out = {kills:0, deaths:0, stuck:[], issues:[], winsOpened:0, winsBad:[], maps:new Set(), lvLog:[], potions:0, skillsUsed:0, statUps:0, skillUps:0, jobs:[S.job], warps:0, autoOn:0, afkSec:0, firstKillAt:null, walkedOut:null, noExpLongest:0};
  const frame = () => new Promise(r => requestAnimationFrame(() => r()));
  const realWait = ms => new Promise(r => setTimeout(r, ms));
  let t = 0; const step = .05, run = sec => { for (let i = 0, n = Math.round(sec / step); i < n; i++){ advance(step, false); t += step; } };
  EV.on('kill', m => { if (m && !m.minion){ out.kills++; if (out.firstKillAt == null) out.firstKillAt = Math.round(t); } });
  const issue = (k, d) => { if (out.issues.length < 40) out.issues.push({k, t:Math.round(t), map:MAP_ID, lvl:S.lvl, ...d}); };
  const mapAvg = id => { const ls = (MAPS[id].mobs || []).map(k => MOB[k] && !MOB[k].boss && MOB[k].lvl).filter(Boolean); return ls.length ? ls.reduce((a, b) => a + b, 0) / ls.length : null; };
  const goodMap = () => { let best = 1, gap = 1e9; MAPS.forEach((m, i) => { const a = mapAvg(i); if (a == null || MAPS[i].town) return; const g = Math.abs(a - (S.lvl + Math.max(0, p.risk) * .5)); if (g < gap){ gap = g; best = i; } }); return best; };
  const potId = () => ['redpot', 'orangepot', 'yellowpot', 'whitepot', 'elixirpot'].filter(k => S.inv[k]).pop();

  // ---------- (v334) system checks: what a careful tester would notice is wrong ----------
  out.sys = []; const sysSeen = new Set(); let lastAct = 'start', prev = null;
  const sysBug = (k, msg, d) => { const key = k + '|' + msg; if (sysSeen.has(key) || out.sys.length >= 40) return; sysSeen.add(key); out.sys.push({k, msg, t:Math.round(t), map:MAP_ID, lvl:S.lvl, job:S.job, after:lastAct, ...(d || {})}); };
  const fin = v => typeof v === 'number' && Number.isFinite(v);
  const audit = () => {
    if (!fin(S.bia) || S.bia < 0 || !Number.isInteger(S.bia)) sysBug('money', 'เงิน (เบี้ย) ผิดปกติ', {v:String(S.bia)});
    for (const [k, v] of Object.entries(S.inv || {})){ if (!fin(v) || v < 1 || !Number.isInteger(v)) sysBug('inv', 'จำนวนของในกระเป๋าผิดปกติ', {id:k, v:String(v)}); if (!ITEMS[k] && !(typeof GEAR !== 'undefined' && GEAR[k])) sysBug('inv-unknown', 'มีของที่ไม่มีอยู่จริงในกระเป๋า', {id:k}); }
    for (const [k, v] of Object.entries(S.cards || {})){ if (!fin(v) || v < 1 || !Number.isInteger(v)) sysBug('cards', 'จำนวนการ์ดผิดปกติ', {id:k, v:String(v)}); if (!CARDS[k]) sysBug('cards-unknown', 'มีการ์ดที่ไม่มีอยู่จริง', {id:k}); }
    if (!fin(S.hp) || !fin(DER.maxhp) || S.hp > DER.maxhp + 1 || S.hp < 0) sysBug('hp', 'HP เกินค่าสูงสุดหรือผิดปกติ', {hp:String(S.hp), max:String(DER.maxhp)});
    if (!fin(S.sp) || !fin(DER.maxsp) || S.sp > DER.maxsp + 1 || S.sp < 0) sysBug('sp', 'SP เกินค่าสูงสุดหรือผิดปกติ', {sp:String(S.sp), max:String(DER.maxsp)});
    for (const k of ['maxhp', 'maxsp', 'atk', 'matk', 'def', 'mdef', 'hit', 'flee', 'crit', 'aspd']) if (k in DER && (!fin(DER[k]) || DER[k] < 0)) sysBug('stat', 'ค่าสเตตัสคำนวณผิด (NaN/ติดลบ)', {k, v:String(DER[k])});
    for (const [k, v] of Object.entries(S.stats || {})) if (!Number.isInteger(v) || v < 1) sysBug('stats', 'ค่าสเตตัสพื้นฐานผิดปกติ', {k, v:String(v)});
    if (!Number.isInteger(S.statPts) || S.statPts < 0) sysBug('statpts', 'แต้มสเตตัสคงเหลือผิดปกติ', {v:String(S.statPts)});
    if (S.skPts != null && (!Number.isInteger(S.skPts) || S.skPts < 0)) sysBug('skpts', 'แต้มสกิลคงเหลือผิดปกติ', {v:String(S.skPts)});
    if (!fin(S.exp) || S.exp < 0) sysBug('exp', 'EXP ผิดปกติ', {v:String(S.exp)});
    else if (typeof nextBase === 'function' && S.lvl < 300 && S.exp >= nextBase(S.lvl) * 1.5) sysBug('exp-stuck', 'EXP เกินแต่เลเวลไม่ขึ้น', {exp:S.exp, need:nextBase(S.lvl)});
    for (const [sl, id] of Object.entries(S.gear || {})){ if (!id) continue; if (!ITEMS[id] && !(typeof GEAR !== 'undefined' && GEAR[id])) sysBug('gear', 'สวมของที่ไม่มีอยู่จริง', {sl, id}); }
    if (!fin(P.x) || !fin(P.y) || P.x < -50 || P.y < -50 || P.x > W + 50 || P.y > H + 50) sysBug('pos', 'ตัวละครหลุดออกนอกแผนที่', {x:String(P.x), y:String(P.y)});
    for (const m of mobs){ if (m.dead) continue; if (!fin(m.hp) || !fin(m.x) || !fin(m.y) || m.hp > m.maxhp * 1.01 + 1){ sysBug('mob', 'มอนสเตอร์มีค่า HP/ตำแหน่งผิดปกติ', {type:m.type, hp:String(m.hp), max:String(m.maxhp)}); break; } }
    if (prev){ const dz = S.bia - prev.bia, dl = S.lvl - prev.lvl;
      if (dz > Math.max(60000, S.lvl * S.lvl * 60) && !/sell|reward|dungeon|tower/.test(lastAct)) sysBug('money-jump', 'เงินเพิ่มพรวดผิดสังเกต', {gain:dz, in:Math.round(t - prev.t) + 's'});
      if (dl > 3) sysBug('level-jump', 'เลเวลขึ้นพรวดผิดสังเกต', {from:prev.lvl, to:S.lvl}); }
    prev = {bia:S.bia, lvl:S.lvl, t}; };
  const saveCheck = () => { try { save(); const raw = localStorage.getItem(slotKey(SLOT)); const o = JSON.parse(raw);
      if (!o || o.lvl !== S.lvl || o.bia !== S.bia || o.job !== S.job || Object.keys(o.inv || {}).length !== Object.keys(S.inv || {}).length) sysBug('save', 'บันทึกเกมไม่ตรงกับสถานะจริง', {lvl:[o && o.lvl, S.lvl], bia:[o && o.bia, S.bia]}); }
    catch (e) { sysBug('save', 'บันทึกเกมล้มเหลว', {e:String(e).slice(0, 100)}); } };
  // ---------- (v334) things players do besides fighting, each checked for the right result ----------
  out.acts = {};
  const did = k => { out.acts[k] = (out.acts[k] || 0) + 1; lastAct = k; };
  const near = id => { const n = NPCS.find(x => x.id === id); if (n && MAP_ID === 0){ P.x = n.x + 30; P.y = n.y + 10; } return n; };
  const ACT = {
    buyPots: async () => { const id = S.lvl < 30 ? 'orangepot' : S.lvl < 70 ? 'whitepot' : 'elixirpot', unit = qtyUnit(id, 'item'); if (!unit) return; const n = 1 + Math.floor(R() * 10), z0 = S.bia, i0 = S.inv[id] || 0;
      did('buy'); qtyBuy(id, 'item', n); const paid = z0 - S.bia, got = (S.inv[id] || 0) - i0;
      if (z0 >= unit * n){ if (paid !== unit * n || got !== n) sysBug('buy', 'ซื้อของแล้วเงิน/ของไม่ตรง', {id, n, unit, paid, got}); }
      else if (paid !== 0 || got !== 0) sysBug('buy-poor', 'เงินไม่พอแต่ยังซื้อได้/เงินถูกหัก', {id, n, unit, have:z0, paid, got}); },
    sellLoot: async () => { const id = Object.keys(S.inv).find(k => /^m_/.test(k) && typeof bslOk === 'function' && bslOk(k)); if (!id) return; const n = Math.max(1, Math.floor(S.inv[id] / 2)), unit = bslUnit(id), z0 = S.bia, i0 = S.inv[id];
      did('sell'); const p0 = bslSellRaw(id, n); const gain = S.bia - z0, gone = i0 - (S.inv[id] || 0);
      if (gain !== unit * n || gone !== n || p0 !== gain) sysBug('sell', 'ขายของแล้วเงิน/ของไม่ตรง', {id, n, unit, gain, gone}); if (unit > (ITEMS[id].sell || 0) * 3 + 5) sysBug('sell-price', 'ราคาขายสูงผิดปกติ', {id, unit, base:ITEMS[id].sell}); },
    craft: async () => { const ok = RECIPES.filter(r => r.lv <= S.lvl && canCraft(r)); if (!ok.length) return; const r = pick(ok), z0 = S.bia, need = r.need.map(([id, n]) => [id, n, S.inv[id] || 0]), inv0 = new Set(Object.keys(S.inv)), o0 = S.inv[r.out] || 0;
      did('craft'); doCraft(r.id);
      if (z0 - S.bia !== r.bia) sysBug('craft-money', 'หลอมของแล้วเงินถูกหักไม่ตรง', {rid:r.id, want:r.bia, paid:z0 - S.bia});
      for (const [id, n, h] of need) if (h - (S.inv[id] || 0) !== n) sysBug('craft-mats', 'หลอมของแล้ววัตถุดิบถูกใช้ไม่ตรง', {rid:r.id, id, want:n, used:h - (S.inv[id] || 0)});
      const newKeys = Object.keys(S.inv).filter(k => !inv0.has(k)); if (r.kind === 'gear' ? !newKeys.some(k => ITEMS[k] && (ITEMS[k].base === r.out || k === r.out)) && (S.inv[r.out] || 0) <= o0 : (S.inv[r.out] || 0) - o0 !== r.n) sysBug('craft-out', 'หลอมของแล้วไม่ได้ของ', {rid:r.id}); },
    refine: async () => { if (typeof rfTargets !== 'function') return; const ts = rfTargets().filter(id => id !== 'job'); if (!ts.length) return; const id = ts[0], info = rfInfo(id); if (!info || info.rf >= (typeof RF_MAX !== 'undefined' ? RF_MAX : 10)) return;
      const c = rfCost(info, info.rf + 1); if (haveN(c.mat) < c.n){ const z = S.bia; fgBuy(c.mat, c.n); did('buy-ore'); if (S.bia === z) return; }
      if (S.bia < c.z) return; const z0 = S.bia, m0 = haveN(c.mat), rf0 = info.rf; RF.luck = false; RF.guard = false; did('refine'); rfGo(id); await realWait(800);
      const after = rfInfo(id), rf1 = after ? after.rf : null;
      if (z0 - S.bia !== c.z || m0 - haveN(c.mat) !== c.n) sysBug('refine-cost', 'ตีบวกแล้วเงิน/แร่ถูกหักไม่ตรง', {want:[c.z, c.n], paid:[z0 - S.bia, m0 - haveN(c.mat)]});
      if (!(rf1 === rf0 + 1 || rf1 === rf0 || rf1 === rf0 - 1)) sysBug('refine-result', 'ผลตีบวกผิดปกติ', {from:rf0, to:rf1}); },
    card: async () => { if (typeof sockPut !== 'function') return; for (const [sl, key] of Object.entries(S.gear || {})){ if (!key || !ITEMS[key] || typeof sockData !== 'function') continue; const d = sockData(key); if (!d || (d.c || []).length >= (d.k | 0)) continue;
        const c = Object.keys(S.cards || {}).find(c => CARDS[c] && CARDS[c].slot === ITEMS[key].slot && S.cards[c] > 0); if (!c) continue; const n0 = S.cards[c], k0 = (d.c || []).length;
        did('card'); sockPut(c, key); const d1 = sockData(key); if ((S.cards[c] || 0) !== n0 - 1 || (d1.c || []).length !== k0 + 1) sysBug('card', 'ใส่การ์ดแล้วการ์ด/ช่องไม่ตรง', {c, key}); return; } },
    tower: async () => { if (typeof twStart !== 'function' || S.lvl < (typeof TW_MIN !== 'undefined' ? TW_MIN : 10) || DG.active) return; const back = MAP_ID; did('tower'); if (!twStart(1)) return; await loadingWait(); run(1);
      const f0 = TW.f, z0 = S.bia; let guard = 0; while (TW.active && t < simMin * 60 && guard++ < 120){ if (!P.target || P.target.dead){ const c = mobs.filter(m => !m.dead).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)); P.target = c[0] || null; }
        if (S.hp < DER.maxhp * .4){ const id = potId(); if (id && P.itemCd <= 0) useItem(id); } run(1); if (P.dead) break; audit(); }
      const reached = TW.f; if (TW.active) twQuit(); await loadingWait(); run(1); if (P.dead){ const b = document.querySelector('[data-dth="town"]'); if (b) b.click(); run(1); }
      if (!TW.active && DG.active) sysBug('tower-exit', 'ออกจากหอคอยแล้วยังค้างสถานะดันเจียน', {});
      if (!P.dead && MAP_ID !== back && MAP_ID !== 0) sysBug('tower-return', 'ออกจากหอคอยแล้วไม่กลับที่เดิม', {back, now:MAP_ID});
      out.towerFloors = Math.max(out.towerFloors || 0, reached - f0); },
    dungeon: async () => { if (typeof dgEnter !== 'function' || DG.active || TW.active) return; const ok = DUNGEONS.filter(d => d.id !== 'tower' && d.min <= S.lvl); if (!ok.length) return; const D = ok[ok.length - 1], back = MAP_ID;
      did('dungeon'); dgEnter(D.id, 'pt' + Math.floor(R() * 1e6), S.lvl, 1); await loadingWait(); run(1); if (!DG.active){ sysBug('dungeon-enter', 'เข้าดันเจียนไม่ได้', {did:D.id}); return; }
      let guard = 0; while (DG.active && !DG.done && guard++ < 240){ if (!P.target || P.target.dead){ const c = mobs.filter(m => !m.dead).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y)); P.target = c[0] || null; }
        if (S.hp < DER.maxhp * .4){ const id = potId(); if (id && P.itemCd <= 0) useItem(id); } run(1); if (P.dead) break; audit(); }
      out.dungeons = (out.dungeons || 0) + (DG.done ? 1 : 0); if (DG.active && guard >= 240 && !P.dead) sysBug('dungeon-slow', 'ดันเจียนไม่จบใน 4 นาที (ตันหรือมอนไม่เกิด)', {did:D.id, wave:DG.wave, mobs:mobs.filter(m => !m.dead).length});
      if (DG.active) dgExit(); await loadingWait(); run(1); if (P.dead){ const b = document.querySelector('[data-dth="town"]'); if (b) b.click(); run(1); }
      if (DG.active) sysBug('dungeon-exit', 'ออกจากดันเจียนไม่ได้', {did:D.id}); if (!P.dead && MAP_ID !== back && MAP_ID !== 0) sysBug('dungeon-return', 'ออกจากดันเจียนแล้วไม่กลับที่เดิม', {back, now:MAP_ID}); },
    market: async () => { if (typeof mkFee !== 'function') return; did('market'); for (const pz of [1, 100, 12345, 999999]){ const f = mkFee(pz); if (!fin(f) || f < 10 || f > pz * .02 + 10) sysBug('market-fee', 'ค่าธรรมเนียมตลาดคำนวณผิด', {price:pz, fee:f}); }
      if (typeof mkValid === 'function'){ if (mkValid({i:'redpot', n:-1, p:10}) || mkValid({i:'redpot', n:1, p:0}) || mkValid({i:'__nope__', n:1, p:10})) sysBug('market-valid', 'ตลาดรับรายการขายที่ไม่ถูกต้อง', {}); } },
  };
  const winFits = id => { const w = document.getElementById('win-' + (id === 'bag' ? 'equip' : id));   // the bag opens inside the equipment window
  if (!w || w.hidden) return 'not open'; const r = w.getBoundingClientRect(), u = el('ui').getBoundingClientRect();
    if (r.width < 40 || r.height < 40) return 'empty'; if (r.left < u.left - 3 || r.right > u.right + 3 || r.top < u.top - 3 || r.bottom > u.bottom + 3) return 'off screen'; return ''; };
  const clickAll = sel => { const e = document.querySelector(sel); if (e && !e.disabled){ e.click(); return true; } return false; };
  // the tutorial and pop-ups: read for a moment, then press on
  const dismiss = async () => { for (const sel of ['#tutBox button', '#confirm:not([hidden]) button[data-ok], #confirm:not([hidden]) .ok', '.achpop.show']){ const b = document.querySelector(sel); if (b && b.offsetWidth){ await realWait(30); try { b.click(); } catch (e) {} } } };
  // ---------- town: walk out through the gate to the easiest field ----------
  const loadingWait = async () => { for (let i = 0; i < 60 && typeof LD !== 'undefined' && LD.busy; i++) await realWait(100); };   // gate travel shows a loading screen on the real clock
  const leaveTown = async () => { if (!MAPS[MAP_ID].town && MAP_ID !== 0) return true; let gate = null, gl = 1e9; for (const g of GATES){ const a = mapAvg(g.to); if (a != null && a < gl){ gl = a; gate = g; } }
    if (!gate){ warpTo(goodMap()); out.warps++; return true; } const m0 = MAP_ID; P.tx = gate.x; P.ty = gate.y; P.target = null;
    for (let i = 0; i < 90 && MAP_ID === m0; i++){ run(.5); if (typeof LD !== 'undefined' && LD.busy){ await loadingWait(); break; } if (MAP_ID === m0 && !P.moving && Math.hypot(P.x - gate.x, P.y - gate.y) > 20){ P.tx = gate.x; P.ty = gate.y; } }
    await loadingWait(); run(.2);
    if (MAP_ID === m0){ issue('walk-out-failed', {gate:gate.side, x:Math.round(P.x), y:Math.round(P.y)}); warpTo(gate.to); out.warps++; } out.walkedOut = out.walkedOut ?? Math.round(t); return true; };
  // ---------- spending points through the windows ----------
  const JOBSTAT = {blade:['str', 'vit', 'agi'], rune:['int', 'dex'], ranger:['dex', 'agi'], muay:['str', 'agi'], healer:['int', 'vit'], rogue:['agi', 'str'], summoner:['int', 'dex'], occult:['int', 'dex'], merchant:['str', 'vit', 'luk'], catfolk:['agi', 'luk'], dogfolk:['str', 'vit'], ninja:['int', 'agi']};
  const spendStats = async () => { if (!(S.statPts > 0) || p.statPlan === 'none' && R() < .7) return; openWin('stat'); out.winsOpened++; await frame();
    const line = (jobChain()[1] || 'blade'), prefs = p.statPlan === 'job' ? (JOBSTAT[line] || ['str']) : p.statPlan === 'one' ? [(JOBSTAT[line] || ['str'])[0]] : ['str', 'agi', 'vit', 'int', 'dex', 'luk'];
    for (let n = 0; n < 12 && S.statPts > 0; n++){ const k = pick(prefs), b = document.querySelector(`#win-stat [data-stat="${k}"]`); if (!b || b.disabled) break; b.click(); }
    await frame(); const before = S.statPts; clickAll('#win-stat [data-stpok]'); await frame(); if (S.statPts < before || true) out.statUps++; closeWin('stat'); };
  const spendSkills = async () => { if (!(S.skPts > 0)) return; openWin('skill'); out.winsOpened++; await frame();
    const btns = [...document.querySelectorAll('#win-skill [data-skill]')].filter(b => !b.disabled && b.offsetWidth); for (let n = 0; n < 5 && btns.length && S.skPts > 0; n++) pick(btns).click();
    await frame(); clickAll('#win-skill [data-skok]'); await frame(); out.skillUps++;
    const fit = winFits('skill'); if (fit) out.winsBad.push('skill:' + fit); closeWin('skill'); };
  const changeJob = async () => { const j = JOBS[S.job]; if (!j.next || jobChangeBlock()) return; const back = MAP_ID; warpTo(0); out.warps++; await loadingWait(); run(1);
    const n = NPCS.find(x => x.id === 'job'); if (!n){ issue('no-job-npc', {}); return; } openNpc(n); await frame(); await realWait(40);
    const bs = [...document.querySelectorAll('#dialog [data-job]')]; if (!bs.length){ issue('job-dialog-no-choices', {job:S.job, jlvl:S.jlvl}); } else { pick(bs).click(); await frame(); await realWait(40); clickAll('#confirm:not([hidden]) [data-ok]'); }
    await frame(); if (JOBS[S.job] !== j) out.jobs.push(S.job); else if (bs.length) issue('job-change-did-not-happen', {job:S.job}); const d = el('dialog'); if (d) d.hidden = true;
    warpTo(back || goodMap()); out.warps++; await loadingWait(); };
  // ---------- the play loop ----------
  // (v334) START_LV: a hero of that level — its class line, job tier, stats by the class, every skill, the best shop gear it
  // can wield, 40 potions — then off to the field of its level. Without it every bot starts at Lv 1.
  if (p.startLv > 1){ const lv = p.startLv, LINES = ['blade', 'rune', 'ranger', 'muay', 'healer', 'rogue', 'summoner', 'occult', 'merchant', 'catfolk', 'dogfolk', 'ninja'].filter(k => JOBS[k]);
    const kids = j => Object.keys(JOBS).filter(k => JOBS[k].parent === j); const line = pick(LINES); let job = line; const tier = lv < 40 ? 1 : lv < 70 ? 2 : lv < 100 ? 3 : 4;
    for (let tt = 1; tt < tier; tt++){ const k = kids(job); if (!k.length) break; job = pick(k); }
    S.job = job; S.lvl = lv; S.jlvl = JOBS[job].jobMax || 50; S.exp = S.jexp = 0; S.stats = {str:1, agi:1, vit:1, int:1, dex:1, luk:1};
    let pts = 48; for (let l = 2; l <= lv; l++) pts += statGain(l);
    const main = String(JOBS[job].stat || JOBS[line].stat || 'STR · VIT').toLowerCase().match(/str|agi|vit|int|dex|luk/g) || ['str'], cap = typeof STAT_CAP === 'function' ? STAT_CAP() : 99;
    const want = {}; for (const [k, f] of [[main[0], .45], [main[1] || 'vit', .3], ['vit', .25]]) want[k] = (want[k] || 0) + f;
    for (let g = 0; g < 2000 && pts > 0; g++){ let best = null, gap = -1e9; for (const k in want){ const d = want[k] - (S.stats[k] - 1) / Math.max(1, g); if (S.stats[k] < cap && statCost(S.stats[k]) <= pts && d > gap){ gap = d; best = k; } } if (!best) break; pts -= statCost(S.stats[best]); S.stats[best]++; }
    S.statPts = pts; S.skills = {}; for (const j of jobChain()) for (const id of (JOBS[j].skills || [])) if (SKILLS[id]) S.skills[id] = SKILLS[id].max; S.skPts = 0;
    S.hot = Object.keys(S.skills).filter(id => SKILLS[id].type !== 'passive').slice(-6);
    const gp = slot => GEAR_LIST.filter(g => g[1] === slot && g[4] <= lv && ITEMS[g[0]] && (slot !== 'weapon' || canWield(ITEMS[g[0]])) && lineOk(ITEMS[g[0]].st)).sort((a, b) => b[4] - a[4])[0];
    S.gear = {weapon:null, armor:null, head:null, ammo:null, acc:null, shield:null, pants:null, shoes:null};
    for (const sl of ['weapon', 'armor', 'head', 'pants', 'shoes', 'acc']){ const g = gp(sl); if (g) S.gear[sl] = g[0]; }
    const w = S.gear.weapon && ITEMS[S.gear.weapon]; if (!(w && w.st && w.st.hands === '2h')){ const g = gp('shield'); if (g) S.gear.shield = g[0]; }
    if (typeof usesArrows === 'function' && usesArrows()){ const a = GEAR_LIST.filter(g => g[1] === 'ammo' && g[4] <= lv && ammoFits(g[0])).sort((a, b) => b[4] - a[4])[0]; if (a){ S.inv[a[0]] = 99999; S.gear.ammo = a[0]; } }
    // like a real player of this level: gear from drops (random rarity), refined +0..+7, a card or two in its sockets, some materials and ore
    for (const sl of Object.keys(S.gear)){ const b = S.gear[sl]; if (!b || sl === 'ammo' || !ITEMS[b] || ITEMS[b].kind !== 'gear') continue; const key = makeInst(b, Math.min(3, Math.floor(R() * R() * 4))); S.gear[sl] = key;
      const d = instStore()[key]; if (d){ d.rf = Math.floor(R() * (lv >= 100 ? 8 : lv >= 50 ? 6 : 4)); regInst(key, d); if (typeof sockRoll === 'function') try { sockRoll(key, 'mob'); } catch (e) {} } }
    S.cards = S.cards || {}; const cs = Object.keys(CARDS); for (let i = 0; i < 4; i++){ const c = pick(cs); S.cards[c] = (S.cards[c] || 0) + 1; }
    for (const k of (MAPS[goodMap()].mobs || [])) if (ITEMS['m_' + k]) S.inv['m_' + k] = 5 + Math.floor(R() * 20);
    S.inv.ore = 3 + Math.floor(R() * 5); S.inv.ore_a = 3 + Math.floor(R() * 5);
    S.inv[lv < 30 ? 'orangepot' : lv < 70 ? 'whitepot' : 'elixirpot'] = 40; S.inv[lv < 70 ? 'bluepot' : 'bigbluepot'] = 20; S.bia = Math.max(S.bia || 0, lv * 2000);
    derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; out.jobs = [S.job]; renderHotbar && renderHotbar();
    warpTo(goodMap()); out.warps++; await loadingWait(); run(.5); }
  out.lvLog.push([0, S.lvl]); let lastExp = S.exp + S.lvl * 1e7, lastExpT = 0, nextLook = 30 + R() * 60, nextAfk = 120 + R() * 300, nextMapCheck = 60, lastTarget = null, tgtSince = 0, tgtHp = 0, posAt = {x:P.x, y:P.y, t:0}, deathsRecent = [];
  await dismiss(); await leaveTown();
  if (p.auto){ setBot(true); out.autoOn++; }
  while (t < simMin * 60){
    run(p.react * (.7 + R() * .6)); out.maps.add(MAP_ID);
    if (Math.floor(t) % 6 === 0){ await frame(); await dismiss(); }
    const xp = S.exp + S.lvl * 1e7; if (xp !== lastExp){ out.noExpLongest = Math.max(out.noExpLongest, t - lastExpT); lastExp = xp; lastExpT = t; }
    if (out.lvLog[out.lvLog.length - 1][1] !== S.lvl) out.lvLog.push([Math.round(t), S.lvl]);
    // dead: wait a moment, then press a button on the death screen
    if (P.dead){ out.deaths++; deathsRecent.push(t); deathsRecent = deathsRecent.filter(x => t - x < 180); if (deathsRecent.length >= 3) { issue('death-loop', {mob:lastTarget && lastTarget.type, mobLv:lastTarget && lastTarget.def && lastTarget.def.lvl}); deathsRecent = []; }
      run(2 + R() * 4); await frame(); const ok = clickAll(R() < .5 ? '[data-dth="town"]' : '[data-dth="here"]') || clickAll('[data-dth="town"]'); run(.5);
      if (P.dead){ if (!ok) issue('death-screen-no-button', {}); respawn(); } if (MAPS[MAP_ID].town || MAP_ID === 0) await leaveTown(); continue; }
    // AFK
    if (t > nextAfk){ const s = 15 + R() * 60; P.target = null; P.tx = null; run(s); out.afkSec += s; nextAfk = t + 120 + R() * 400 / Math.max(.05, p.afk * 10); continue; }
    // potions
    if (S.hp < DER.maxhp * p.potAt && R() > p.forget){ const id = potId(); if (id){ useItem(id); out.potions++; } }
    // (v334) system checks every few seconds, a save check now and then, and a non-fighting activity every couple of minutes
    if (t - (out._aT || 0) > 5){ out._aT = t; audit(); }
    if (t - (out._sT || 0) > 120){ out._sT = t; saveCheck(); }
    if (t > (out._nextAct || 60)){ out._nextAct = t + 50 + R() * 80; const w = p.startLv > 1 ? ['buyPots', 'sellLoot', 'craft', 'refine', 'card', 'tower', 'dungeon', 'market'] : ['buyPots', 'sellLoot', 'craft', 'market', 'card'];
      const a = pick(w); try { await ACT[a](); } catch (e) { issue('act-error', {a, e:String(e).slice(0, 140)}); } audit(); }
    // points, job
    if (S.statPts > 0 && R() < .15) await spendStats();
    if (S.skPts > 0 && R() < .1) await spendSkills();
    if (R() < .02) await changeJob();
    // a look at a window
    if (t > nextLook && R() < p.curious){ const id = pick(['bag', 'stat', 'skill', 'quest', 'settings', 'world', 'auto', 'equip', 'wiki', 'social']); try { openWin(id); out.winsOpened++; await frame(); await realWait(20);
        const fit = winFits(id); if (fit) out.winsBad.push(id + ':' + fit); } catch (e) { issue('window-error', {id, e:String(e).slice(0, 120)}); } run(2 + R() * 6); try { closeWin(id); } catch (e) {} nextLook = t + 40 + R() * 120; }
    // the right field for this level
    if (t > nextMapCheck){ nextMapCheck = t + 90; const a = mapAvg(MAP_ID); if (a == null || a < S.lvl - 8 || a > S.lvl + 10 + p.risk){ const to = goodMap(); if (to !== MAP_ID){ warpTo(to); out.warps++; await loadingWait(); posAt = {x:P.x, y:P.y, t}; } } }
    if (MAPS[MAP_ID].town || MAP_ID === 0){ await leaveTown(); continue; }
    if (p.auto && BOT.on) continue;   // Auto does the fighting
    // (v334) a boss warns before it charges (fix334.js): most people back off; the reckless often stay and fight
    { const bz = mobs.find(m => !m.dead && m.def.boss && (m.warnT > 0 || m.aggro) && Math.hypot(m.x - P.x, m.y - P.y) < 700);
      if (bz && (p.kind !== 'reckless' || R() < .3) && R() > p.forget * .5){ P.target = null; const d = Math.max(1, Math.hypot(P.x - bz.x, P.y - bz.y)); P.tx = clamp(P.x + (P.x - bz.x) / d * 400, 60, W - 60); P.ty = clamp(P.y + (P.y - bz.y) / d * 400, 60, H - 60);
        if (!out.bossDodges) out.bossDodges = 0; out.bossDodges++; run(p.react); continue; } }
    // fight: keep the target, or pick one
    if (!P.target || P.target.dead){ let cand = mobs.filter(m => !m.dead && !m.def.boss && m.def.lvl <= S.lvl + Math.max(1, p.risk) && Math.hypot(m.x - P.x, m.y - P.y) < 900);
      if (!cand.length){ const near = mobs.filter(m => !m.dead && !m.def.boss && Math.hypot(m.x - P.x, m.y - P.y) < 900).sort((a, b) => a.def.lvl - b.def.lvl); if (near.length) cand = [near[0]]; }   // nothing that easy here: the weakest one in sight
      const m = cand.length ? (R() < .75 ? cand.sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0] : pick(cand)) : null;
      if (m){ P.target = m; lastTarget = m; tgtSince = t; tgtHp = m.hp; } else { P.target = null; P.tx = clamp(P.x + (R() - .5) * 600, 60, W - 60); P.ty = clamp(P.y + (R() - .5) * 400, 60, H - 60); } }
    else if (P.target === lastTarget){ if (P.target.hp < tgtHp){ tgtHp = P.target.hp; tgtSince = t; }
      else if (t - tgtSince > 20){ out.stuck.push({map:MAP_ID, x:Math.round(P.x), y:Math.round(P.y), mob:P.target.type, d:Math.round(Math.hypot(P.target.x - P.x, P.target.y - P.y))}); P.target = null; tgtSince = t; } }
    if (P.target && !P.target.dead && R() < p.skill * .5){ const hot = (S.hot || []).filter(id => id && SKILLS[id] && skl(id) && !(P.cds[id] > 0) && SKILLS[id].type !== 'passive'); if (hot.length){ try { trySkill(pick(hot)); out.skillsUsed++; } catch (e) { issue('skill-error', {e:String(e).slice(0, 120)}); } } }
    if (t - posAt.t > 30){ if (Math.hypot(P.x - posAt.x, P.y - posAt.y) < 15 && (P.target || P.tx != null) && !P.dead && !(typeof LD !== 'undefined' && LD.busy)) out.stuck.push({map:MAP_ID, x:Math.round(P.x), y:Math.round(P.y), why:'not moving'}); posAt = {x:P.x, y:P.y, t}; }
  }
  if (t - lastExpT > out.noExpLongest) out.noExpLongest = t - lastExpT;
  return {...out, maps:[...out.maps], lvl:S.lvl, jlvl:S.jlvl, job:S.job, bia:S.bia, noExpLongest:Math.round(out.noExpLongest)};
}

async function oneBot(browser, url, p){
  const ctx = await browser.newContext({viewport:{width:p.w, height:p.h}, ...(p.touch ? {isMobile:true, hasTouch:true} : {})});
  const page = await ctx.newPage(), errors = [];
  page.on('pageerror', e => errors.push((e.message || String(e)).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  await page.route(u => !u.href.startsWith(url), r => r.abort());
  await page.addInitScript(() => { window.__VTEST__ = 1; });
  const t0 = Date.now(); let res = null, fail = null;
  try {
    await page.goto(url); await page.waitForFunction(() => !!window.__vay, null, {timeout:60000});
    // sign up and make a character through the title screens
    await page.waitForSelector('#auBox, [data-make]', {timeout:30000});
    if (await page.$('#auBox')){ await page.click('#auBox [data-autab="reg"][role="tab"]'); await page.fill('#auId', p.acc); await page.fill('#auPw', 'pt-pass-1'); await page.fill('#auPw2', 'pt-pass-1'); await page.click('#auBox [data-auth="go"]'); }
    await page.waitForSelector('[data-make]', {timeout:30000}); await page.click('[data-make]'); await page.waitForSelector('[data-mkgo]');
    // a few looks tried before choosing (hair, colours…)
    const opts = await page.$$('#mk button:not([data-mkgo]), .mk button:not([data-mkgo])'); for (let i = 0; i < Math.min(opts.length, 2 + (p.seed % 4)); i++){ const b = opts[(p.seed >> i) % opts.length]; try { await b.click({timeout:800}); } catch (e) {} }
    await page.fill('#mkName', p.name); await page.click('[data-mkgo]');
    await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, {timeout:30000});
    res = await page.evaluate(new Function('a', `return (${playInPage.toString()})(a.p, a.simMin);`), {p, simMin:MIN});
  } catch (e) { fail = String(e.message || e).split('\n')[0].slice(0, 200); }
  await ctx.close();
  return {...p, ok:!fail, fail, errors:[...new Set(errors)].slice(0, 12), realSec:Math.round((Date.now() - t0) / 1000), ...(res || {})};
}

(async () => {
  const personas = makePersonas(), { srv, url } = await serve();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {});
  const rows = []; let next = 0; const t0 = Date.now();
  const worker = async () => { while (next < personas.length){ const p = personas[next++]; const r = await oneBot(browser, url, p); rows.push(r);
    console.log(`${rows.length}/${personas.length} #${r.id} ${r.kind} ${r.device} ${r.ok ? `Lv${r.lvl} ${r.job} kills ${r.kills} deaths ${r.deaths}` : 'FAILED ' + r.fail} errors ${r.errors.length} (${r.realSec}s)`); } };
  await Promise.all(Array.from({length:CONC}, worker));
  await browser.close(); srv.close();
  rows.sort((a, b) => a.id - b.id);
  fs.writeFileSync(path.resolve(__dirname, '..', 'docs', process.env.OUT ? process.env.OUT + '-rows.json' : 'playtest-rows.json'), JSON.stringify(rows, null, 1));
  fs.writeFileSync(path.resolve(__dirname, '..', 'docs', process.env.OUT ? process.env.OUT + '.md' : 'PLAYTEST.md'), report(rows, Math.round((Date.now() - t0) / 60000)));
  console.log('report: docs/PLAYTEST.md');
})();

function report(rows, mins){
  const ok = rows.filter(r => r.ok), L = [], avg = (a, f) => a.length ? a.reduce((s, r) => s + f(r), 0) / a.length : 0, med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  L.push(`# รายงานบอทเทสเกม (${rows.length} บอท × ${MIN} นาทีในเกม${START.some(v => v > 1) ? ` · เริ่มที่ Lv ${START.join('/')}` : ''})`, '', `รันเมื่อ ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ใช้เวลาจริง ${mins} นาที · \`node tools/playtest.js\``, '');
  L.push('## สรุป', '', `- เล่นจบ ${ok.length}/${rows.length} บอท · ล้มตั้งแต่ตอนเข้าเกม ${rows.length - ok.length}`, `- เลเวลเฉลี่ยตอนจบ ${avg(ok, r => r.lvl).toFixed(1)} (กลาง ${med(ok.map(r => r.lvl))}) · ฆ่ามอนเฉลี่ย ${avg(ok, r => r.kills).toFixed(0)} · ตายเฉลี่ย ${avg(ok, r => r.deaths).toFixed(1)}`,
    `- ฆ่าตัวแรกได้ที่ ${med(ok.filter(r => r.firstKillAt != null).map(r => r.firstKillAt))} วินาทีในเกม (กลาง) · ${ok.filter(r => r.firstKillAt == null).length} บอทไม่ได้ฆ่าเลย`, `- เปลี่ยนอาชีพสำเร็จ ${ok.filter(r => r.jobs && r.jobs.length > 1).length} บอท`, '');
  L.push('## แยกตามนิสัย', '', '| นิสัย | จำนวน | เลเวลเฉลี่ย | ฆ่า | ตาย | ใช้ยา | ใช้สกิล | ไม่ได้ EXP นานสุด (วิ) |', '|---|---|---|---|---|---|---|---|');
  for (const k of [...new Set(rows.map(r => r.kind))]){ const a = ok.filter(r => r.kind === k); L.push(`| ${k} | ${a.length} | ${avg(a, r => r.lvl).toFixed(1)} | ${avg(a, r => r.kills).toFixed(0)} | ${avg(a, r => r.deaths).toFixed(1)} | ${avg(a, r => r.potions).toFixed(0)} | ${avg(a, r => r.skillsUsed).toFixed(0)} | ${avg(a, r => r.noExpLongest).toFixed(0)} |`); }
  L.push('', '## แยกตามเครื่อง', '', '| เครื่อง | จำนวน | เลเวลเฉลี่ย | error |', '|---|---|---|---|');
  for (const d of ['phone', 'ipad', 'laptop', 'pc']){ const a = rows.filter(r => r.device === d); if (a.length) L.push(`| ${d} | ${a.length} | ${avg(a.filter(r => r.ok), r => r.lvl).toFixed(1)} | ${a.reduce((s, r) => s + r.errors.length, 0)} |`); }
  const errs = {}; for (const r of rows) for (const e of r.errors) (errs[e] = errs[e] || []).push(r.id);
  L.push('', `## Error ในเกม (${Object.keys(errs).length} แบบ)`, '');
  for (const [e, ids] of Object.entries(errs).sort((a, b) => b[1].length - a[1].length)) L.push(`- **${ids.length} บอท**: \`${e.replace(/`/g, "'")}\``);
  if (!Object.keys(errs).length) L.push('- ไม่มี');
  const fails = rows.filter(r => !r.ok); if (fails.length){ L.push('', '## ล้มตอนเข้าเกม', ''); for (const r of fails) L.push(`- #${r.id} (${r.device}): ${r.fail}`); }
  const iss = {}; for (const r of ok) for (const i of r.issues || []) (iss[i.k] = iss[i.k] || []).push(i);
  L.push('', '## ปัญหาที่เจอระหว่างเล่น', '');
  for (const [k, a] of Object.entries(iss)) L.push(`- **${k}** ${a.length} ครั้ง · เช่น ${JSON.stringify(a[0])}`);
  if (!Object.keys(iss).length) L.push('- ไม่มี');
  const st = ok.flatMap(r => r.stuck || []), byMap = {}; for (const s of st) byMap[s.map] = (byMap[s.map] || 0) + 1;
  L.push('', `## ติด (เดินไม่ถึงเป้า/ตีไม่โดน 20 วิขึ้นไป): ${st.length} ครั้ง`, '');
  for (const [m, n] of Object.entries(byMap).sort((a, b) => b[1] - a[1]).slice(0, 10)){ const ex = st.find(s => String(s.map) === m); L.push(`- แมพ ${m}: ${n} ครั้ง · เช่น ${JSON.stringify(ex)}`); }
  const wb = {}; for (const r of ok) for (const w of r.winsBad || []) wb[w] = (wb[w] || 0) + 1;
  L.push('', '## หน้าต่างที่เปิดไม่ขึ้นหรือล้นจอ', ''); for (const [w, n] of Object.entries(wb)) L.push(`- ${w}: ${n} ครั้ง`); if (!Object.keys(wb).length) L.push('- ไม่มี');
  // (v334) system checks and activities
  const sys = {}; for (const r of ok) for (const b of (r.sys || [])){ const k = b.k + ' · ' + b.msg; (sys[k] = sys[k] || {n:0, ex:b}).n++; }
  L.push('', `## บัคระบบที่บอทตรวจเจอ (${Object.keys(sys).length} แบบ)`, '');
  if (!Object.keys(sys).length) L.push('- ไม่มี: เงิน ของในกระเป๋า การ์ด HP/SP สเตตัส EXP อุปกรณ์ ตำแหน่ง มอน การบันทึกเกม การซื้อ-ขาย หลอม ตีบวก ใส่การ์ด หอคอย ดันเจียน และค่าธรรมเนียมตลาด ถูกต้องทั้งหมด');
  for (const [k, v] of Object.entries(sys).sort((a, b) => b[1].n - a[1].n)) L.push(`- **${k}** ${v.n} ครั้ง · เช่น ${JSON.stringify(v.ex)}`);
  const acts = {}; for (const r of ok) for (const [k, n] of Object.entries(r.acts || {})) acts[k] = (acts[k] || 0) + n;
  const ACTN = {buy:'ซื้อยา', sell:'ขายของ', craft:'หลอมของ', refine:'ตีบวก', 'buy-ore':'ซื้อแร่', card:'ใส่การ์ด', tower:'ลงหอคอย', dungeon:'ลงดันเจียน', market:'ตรวจตลาด'};
  L.push('', '## กิจกรรมนอกการต่อสู้ที่บอททำ (ทุกครั้งถูกตรวจผล)', '', Object.entries(acts).map(([k, n]) => `${ACTN[k] || k} ${n}`).join(' · ') || '-');
  const tf = ok.filter(r => r.towerFloors != null), dg = ok.reduce((a, r) => a + (r.dungeons || 0), 0), bd = ok.reduce((a, r) => a + (r.bossDodges || 0), 0);
  if (tf.length) L.push(`- หอคอย: ขึ้นได้เฉลี่ย ${avg(tf, r => r.towerFloors).toFixed(1)} ชั้นต่อรอบ (${tf.length} บอท)`); if (dg) L.push(`- ดันเจียนผ่าน ${dg} ครั้ง`); if (bd) L.push(`- ถอยหนีเมื่อบอสเตือน ${bd} ครั้ง`);
  return L.join('\n') + '\n';
}
