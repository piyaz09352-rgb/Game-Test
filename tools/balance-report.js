/* VAYRATHEN — tools/balance-report.js — (v192) how hard is the game for each class?
   Every class line is set up at a few levels the way a player would have it (its job tier for that level, stat points
   spent on the class's main stats + VIT, every skill learned, the best shop gear it can wield, ammo loaded, 300 potions),
   sent to the field map whose monsters are closest to its level, and left on Auto for SIM_SEC seconds of game time
   (the real game loop, stepped without drawing). The report counts kills per minute, EXP per minute, deaths and
   potions, and says whether the class has an area skill to hunt groups with.
   Run:  CHROMIUM_PATH=/opt/pw-browsers/chromium node tools/balance-report.js [seconds]   → docs/BALANCE.md (Thai)
         BOSS=1 … → each line alone against the map's boss → docs/BALANCE_BOSS.md · LINES=rune,occult limits the lines */
'use strict';
const fs = require('fs'), path = require('path');
const { openGame, enterWorld } = require('../tests/browser');
const SIM_SEC = +process.argv[2] || 300;
const LEVELS = [15, 45, 80, 115];

async function main(){
  const { page, errors, close } = await openGame({ width: 1280, height: 720 });
  const rows = [];
  try {
    await enterWorld(page, 'Balance', 'balance');
    let lines = await page.evaluate(() => Object.keys(JOBS).filter(k => JOBS[k].parent === 'novice'));
    if (process.env.LINES) lines = lines.filter(l => process.env.LINES.split(',').includes(l));   // e.g. LINES=rune,occult
    for (const line of lines) for (const lv of (process.env.BOSS ? [45, 80, 115] : LEVELS)){
      const r = await page.evaluate(simOne, { line, lv, sec: SIM_SEC, boss: !!process.env.BOSS });
      rows.push(r); console.log(JSON.stringify(r));
    }
  } finally { await close(); }
  if (process.env.BOSS) fs.writeFileSync(path.join(__dirname, '..', 'docs', 'BALANCE_BOSS.md'), bossReport(rows));
  else fs.writeFileSync(path.join(__dirname, '..', 'docs', 'BALANCE.md'), report(rows));
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
}

/* runs inside the game page */
async function simOne({ line, lv, sec, boss: bossMode }){
  const kids = j => Object.keys(JOBS).filter(k => JOBS[k].parent === j);
  let job = line; const tier = lv < 40 ? 1 : lv < 70 ? 2 : lv < 100 ? 3 : 4;
  for (let t = 1; t < tier; t++){ const k = kids(job)[0]; if (!k) break; job = k; }
  // a fresh hero of this class and level
  S.job = job; S.lvl = lv; S.jlvl = JOBS[job].jobMax || 50; S.exp = S.jexp = 0;
  S.stats = { str: 1, agi: 1, vit: 1, int: 1, dex: 1, luk: 1 };
  let pts = 48; for (let l = 2; l <= lv; l++) pts += statGain(l);
  const main = String(JOBS[job].stat || JOBS[line].stat || 'STR · VIT').toLowerCase().match(/str|agi|vit|int|dex|luk/g) || ['str'];
  const plan = [[main[0], .45], [main[1] || 'vit', .3], ['vit', .25]], cap = typeof STAT_CAP === 'function' ? STAT_CAP() : 99;
  const want = {}; for (const [k, f] of plan) want[k] = (want[k] || 0) + f;
  for (let guard = 0; guard < 2000 && pts > 0; guard++){
    // raise the stat furthest below its share of the points spent so far
    let best = null, gap = -1e9; for (const k in want){ const g = want[k] - (S.stats[k] - 1) / Math.max(1, guard); if (S.stats[k] < cap && statCost(S.stats[k]) <= pts && g > gap){ gap = g; best = k; } }
    if (!best) break; pts -= statCost(S.stats[best]); S.stats[best]++;
  }
  S.statPts = pts;
  S.skills = {}; for (const j of jobChain()) for (const id of (JOBS[j].skills || [])) if (SKILLS[id]) S.skills[id] = SKILLS[id].max;
  S.skPts = 0; S.bot = null;
  // gear: the best shop piece of each slot it can use at this level
  S.gear = { weapon: null, armor: null, head: null, ammo: null, acc: null, shield: null, pants: null, shoes: null };
  S.inv = {};
  const pick = slot => GEAR_LIST.filter(g => g[1] === slot && g[4] <= lv && ITEMS[g[0]] && (slot !== 'weapon' || canWield(ITEMS[g[0]])) && lineOk(ITEMS[g[0]].st)).sort((a, b) => b[4] - a[4])[0];
  for (const sl of ['weapon', 'armor', 'head', 'pants', 'shoes', 'acc']){ const g = pick(sl); if (g) S.gear[sl] = g[0]; }
  const w = S.gear.weapon && ITEMS[S.gear.weapon], twoH = w && w.st && w.st.hands === '2h';
  if (!twoH){ const g = pick('shield'); if (g) S.gear.shield = g[0]; }
  if (usesArrows()){ const a = GEAR_LIST.filter(g => g[1] === 'ammo' && g[4] <= lv && ammoFits(g[0])).sort((a, b) => b[4] - a[4])[0]; if (a){ S.inv[a[0]] = 99999; S.gear.ammo = a[0]; } }
  // the potions Auto knows (game/bot.js): HP by level, and SP for everyone
  const potId = lv < 30 ? 'orangepot' : lv < 70 ? 'whitepot' : 'elixirpot', spId = lv < 70 ? 'bluepot' : 'bigbluepot';
  S.inv[potId] = 300; if (ITEMS[spId]) S.inv[spId] = 300;
  derive(); S.hp = DER.maxhp; S.sp = DER.maxsp;
  // the field map whose monsters are closest to this level
  let mapId = 1, gapBest = 1e9;
  MAPS.forEach((m, i) => { if (!i || !m.mobs || !m.mobs.length) return; const ls = m.mobs.map(k => MOB[k] && MOB[k].lvl).filter(Boolean); if (!ls.length) return; const avg = ls.reduce((a, b) => a + b, 0) / ls.length; const g = Math.abs(avg - lv); if (g < gapBest){ gapBest = g; mapId = i; } });
  warpTo(mapId);
  // boss mode: the map's boss next to you, nothing else around
  let bossM = null;
  if (bossMode){ const bt = MAPS[mapId].boss;
    // away from the camp (a boss hit from a safe zone teleports away with full HP: sys/bosssafe.js)
    const safe = typeof CAMP !== 'undefined' && CAMP ? CAMP : {x: P.x, y: P.y};
    const far = mobs.filter(m => !m.def.boss).sort((a, b) => Math.hypot(b.x - safe.x, b.y - safe.y) - Math.hypot(a.x - safe.x, a.y - safe.y))[0];
    if (far){ P.x = far.x; P.y = far.y; }
    for (const m of mobs) if (!m.def.boss){ m.dead = true; m.deadT = 99; } mobs = mobs.filter(m => !m.dead);
    if (bt && MOB[bt]){ bossM = spawnMob(bt, P.x + 120, P.y); bossM.aggro = true; boss = bossM; } }
  const mobLv = (() => { const ls = (MAPS[mapId].mobs || []).map(k => MOB[k] && !MOB[k].boss && MOB[k].lvl).filter(Boolean); return ls.length ? Math.round(ls.reduce((a, b) => a + b, 0) / ls.length) : 0; })();
  // run
  let kills = 0, deaths = 0, exp0 = 0; const onKill = m => { if (!m.minion && !m.def.dummy) kills++; };
  EV.on('kill', onKill);
  const expNow = () => { let e = S.exp; for (let l = lv; l < S.lvl; l++) e += nextBase(l); return e; };
  exp0 = expNow();
  setBot(true); if (bossMode && S.bot) S.bot.avoidBoss = false;   // Auto avoids bosses by default
  const stepT = .05; let t = 0, hpLowest = 1; const tm = {cast:0, sit:0, move:0, other:0};
  while (t < sec && !(bossM && bossM.dead)){
    advance(stepT, false); t += stepT;
    if (!BOT.on) setBot(true);
    hpLowest = Math.min(hpLowest, S.hp / DER.maxhp);
    tm[P.cast ? 'cast' : P.sit ? 'sit' : P.moving ? 'move' : 'other'] += stepT;
    if (P.dead || S.hp <= 0){ deaths++; P.dead = false; S.hp = DER.maxhp; S.sp = DER.maxsp; if (typeof MAP_ID !== 'undefined' && MAP_ID !== mapId) warpTo(mapId); setBot(true); if (bossMode && S.bot) S.bot.avoidBoss = false; if (bossM){ P.x = bossM.x - 120; P.y = bossM.y; } }
    if (MAP_ID !== mapId){ warpTo(mapId); setBot(true); }
    if (bossM && !bossM.dead){ P.target = bossM; if (bossMode) for (const m of mobs) if (m !== bossM && !m.minion && !m.def.boss && !m.dead) { m.dead = true; m.deadT = 99; } }
    if ((S.inv[potId] || 0) < 300) { /* counted below */ }
  }
  setBot(false);
  EV.h.kill = (EV.h.kill || []).filter(f => f !== onKill);
  const types = new Set(); for (const id in S.skills){ const sk = SKILLS[id]; if (sk && skl(id)) types.add(sk.type); }
  const aoe = ['aoeSelf', 'aoeTarget', 'fieldDot', 'line', 'nova', 'cone'].filter(x => types.has(x));
  return { line, lineName: JOBS[line].name, job, jobName: JOBS[job].name, lv, map: mapId, mapName: MAPS[mapId].name, mobLv,
    kpm: +(kills / (sec / 60)).toFixed(1), expPm: Math.round((expNow() - exp0) / (sec / 60)), deaths, pots: 300 - (S.inv[potId] || 0), spPots: ITEMS[spId] ? 300 - (S.inv[spId] || 0) : 0,
    hpLow: Math.round(hpLowest * 100), boss: bossM ? {name: bossM.def.name, lvl: bossM.def.lvl, won: !!bossM.dead, hpLeft: bossM.dead ? 0 : Math.round(bossM.hp / bossM.maxhp * 100), sec: Math.round(t), dps: Math.round((bossM.maxhp - Math.max(0, bossM.hp)) / Math.max(1, t)), maxhp: bossM.maxhp} : null, castPct: Math.round(tm.cast / sec * 100), sitPct: Math.round(tm.sit / sec * 100), movePct: Math.round(tm.move / sec * 100), aoe: aoe.join(',') || '-', atk: DER.atk, matk: DER.matk, maxhp: DER.maxhp };
}

function bossReport(rows){
  let s = `# รายงานบอส: คนเดียวสู้บอสประจำแผนที่ (tools/balance-report.js · BOSS=1)\n\nสร้างเมื่อ ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ตัวละครเลเวลเท่าแผนที่ อุปกรณ์ร้านดีสุด ยา 300 ขวด สู้ได้สูงสุด ${SIM_SEC} วินาที · เป้าหมาย: คนเดียวไม่ควรชนะ\n\n| สาย | อาชีพ | Lv | บอส (Lv) | ผล | บอสเหลือเลือด | เวลา | ตาย | ยา HP | ถ้ามา 4 คน (ประมาณ) |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of rows) if (r.boss) s += `| ${r.lineName} | ${r.jobName} | ${r.lv} | ${r.boss.name} (${r.boss.lvl}) | ${r.boss.won ? 'ชนะ' : 'แพ้/ไม่ทัน'} | ${r.boss.hpLeft}% | ${r.boss.sec} วิ | ${r.deaths} | ${r.pots} | ${r.boss.dps ? Math.round(r.boss.maxhp / (4 * r.boss.dps)) + ' วิ' : 'ตีไม่เข้า'} |\n`;
  return s;
}
function report(rows){
  const byLv = {}; for (const r of rows) (byLv[r.lv] = byLv[r.lv] || []).push(r);
  let s = `# รายงานความสมดุลของคลาส (เครื่องมือ tools/balance-report.js)\n\nสร้างเมื่อ ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ให้ Auto เล่นแทน ${SIM_SEC} วินาทีเวลาเกมต่อแถว · อัตรา EXP/ดรอปตามค่าในเกมตอนนั้น\n\n`;
  s += 'วิธีจัดตัวละคร: อาชีพขั้นตามเลเวล (ต่ำกว่า 40 = ขั้น 1 · 40–69 = ขั้น 2 · 70–99 = ขั้น 3 · 100+ = ขั้น 4) · แต้มสถานะลงค่าหลักของอาชีพ + VIT · เรียนสกิลครบ · อุปกรณ์ร้านดีสุดที่ใส่ได้ · ยา 300 ขวด · แผนที่ที่มอนเลเวลใกล้ที่สุด\n\n';
  s += '**ฆ่า/นาที** ยิ่งมากยิ่งเก็บเลเวลเร็ว · **ตาย** ควรเป็น 0 ในแผนที่เลเวลเท่าตัว · **HP ต่ำสุด** ต่ำมาก = เสี่ยงตาย · **สกิลหมู่** ไม่มี = ฆ่าได้ทีละตัว · **เวลาร่าย / นั่งพัก / เดิน** = สัดส่วนเวลาที่ใช้ไปกับสิ่งนั้น\n\n';
  for (const lv of Object.keys(byLv)){
    const rs = byLv[lv].slice().sort((a, b) => b.kpm - a.kpm), avg = rs.reduce((a, r) => a + r.kpm, 0) / rs.length;
    s += `## Lv ${lv} (เฉลี่ย ${avg.toFixed(1)} ตัว/นาที)\n\n| สาย | อาชีพ | แผนที่ (มอน Lv) | ฆ่า/นาที | เทียบเฉลี่ย | EXP/นาที | ตาย | ยา HP | ยา SP | HP ต่ำสุด | เวลาร่าย | นั่งพัก | เดิน | สกิลหมู่ |\n|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;
    for (const r of rs) s += `| ${r.lineName} | ${r.jobName} | ${r.mapName} (${r.mobLv}) | ${r.kpm} | ${avg ? Math.round(r.kpm / avg * 100) : 0}% | ${r.expPm.toLocaleString()} | ${r.deaths} | ${r.pots} | ${r.spPots} | ${r.hpLow}% | ${r.castPct}% | ${r.sitPct}% | ${r.movePct}% | ${r.aoe} |\n`;
    s += '\n';
  }
  return s;
}

main().catch(e => { console.error(e); process.exit(1); });
