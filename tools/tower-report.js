/* VAYRATHEN — tools/tower-report.js — (v224) how far does each class climb the Vayra Tower?
   Each class line is set up at a few levels like a player would have it (the same set-up as tools/balance-report.js:
   job tier, stat points on the main stats + VIT, every skill, the best shop gear, 300 potions), starts at the
   checkpoint about 20 levels below its own and climbs on Auto (blessings: the first one offered) until it falls, runs
   out of time on a floor, or MAX_SEC of game time passes. Reports the floor reached, the monster level there and why
   the run ended → docs/TOWER.md (Thai).
   Run:  CHROMIUM_PATH=/opt/pw-browsers/chromium node tools/tower-report.js [maxSec=1500]   (LINES=blade,rune · LEVELS=45,80 · NOCLEAVE=1 turns the close-range sweep off) */
'use strict';
const fs = require('fs'), path = require('path');
const { openGame, enterWorld } = require('../tests/browser');
const MAX_SEC = +process.argv[2] || 1500;
const LEVELS = (process.env.LEVELS || '30,60,100,150').split(',').map(Number);

function towerHero(line, lv){
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
  return job;
}

function climbOne({ line, lv, max, noAvoid }){
  if (P.dead && typeof dthTown === 'function') dthTown(); P.dead = false;   // (v241) a fall waits on the death sign: get up first
  const job = towerHero(line, lv);
  if (TW.active) twQuit('leave');
  loadMap(0); twSt().best = 400;
  const lvToF = L0 => Math.max(1, Math.floor(L0 / 3));   // (v255) floor f = Lv 3f
  let f0 = 1; for (const c of twCks()) if (c <= lvToF(lv - 20)) f0 = c;
  twStart(f0); setBot(true); if (typeof botSet === 'function') botSet(); if (noAvoid && S.bot) S.bot.avoidBoss = false;
  let t = 0, why = '', pots0 = Object.values(S.inv).reduce((a, b) => a + (+b || 0), 0), floors = [];
  const end = () => !TW.active;
  while (t < max){
    advance(.05, false); t += .05;
    if (!BOT.on) setBot(true);
    if (P.dead && typeof dthTown === 'function') dthTown();   // (v241) the player presses «leave the Tower» on the death sign
    if (DG3.boonOpen){ const b = document.querySelector('[data-boon]'); if (b) b.click(); else DG3.boonOpen = false; }
    if (end()){ why = TW.end ? TW.end.why : 'end'; break; }
  }
  const reached = TW.end ? TW.end.reached : Math.max(f0, TW.f - 1);
  if (TW.active){ why = 'cap'; twQuit('leave'); }
  return {line, job, jobName:JOBS[job].name, lv, start:f0, reached, failF:reached + 1, failBoss:(reached + 1) % 5 === 0, climbed:reached - f0 + 1, mobLv:twLvC(reached + 1), gap:twLvC(reached + 1) - lv, why, sec:Math.round(t)};
}
async function main(){
  const { page, errors, close } = await openGame({ width: 1280, height: 720 }); const rows = [];
  try {
    await enterWorld(page, 'Tower', 'towerbal'); await page.evaluate(`window.towerHero = ${towerHero.toString()}`);
    if (process.env.NOCLEAVE) await page.evaluate(() => { meleeCleave = () => {}; });   // (v242) compare without the close-range sweep
    let lines = await page.evaluate(() => Object.keys(JOBS).filter(k => JOBS[k].parent === 'novice'));
    if (process.env.LINES) lines = lines.filter(l => process.env.LINES.split(',').includes(l));
    for (const line of lines) for (const lv of LEVELS){ const r = await page.evaluate(climbOne, {line, lv, max:MAX_SEC, noAvoid:!!process.env.NOAVOID}); rows.push(r); console.log(JSON.stringify(r)); }
  } finally { await close(); }
  const why = w => ({fell:'ตาย', time:'หมดเวลา', cap:'ครบเวลาทดสอบ', leave:'ออก', top:'ถึงยอด (ชั้น 100)'}[w] || w);
  const md = ['# หอคอยวายรา · แต่ละอาชีพปีนได้ถึงชั้นไหน', '', `Auto ปีนจากเช็คพอยต์ที่มอนเลเวลต่ำกว่าตัวเองประมาณ 20 จนตาย/หมดเวลาชั้น (สูงสุด ${MAX_SEC} วินาทีเกม) · ชุด สเตตัส สกิล ยา เหมือน docs/BALANCE.md`, '',
    '| สาย | อาชีพ | Lv | เริ่มชั้น | ถึงชั้น | ปีนได้ | มอนชั้นที่จบ | ห่างจากเลเวลเรา | จบเพราะ |', '|---|---|---|---|---|---|---|---|---|',
    ...rows.map(r => `| ${r.line} | ${r.jobName} | ${r.lv} | ${r.start} | ${r.reached} | ${r.climbed} | Lv ${r.mobLv} | ${r.gap >= 0 ? '+' : ''}${r.gap} | ${why(r.why)} |`)];
  fs.writeFileSync(path.join(__dirname, '..', 'docs', 'TOWER.md'), md.join('\n') + '\n'); if (errors.length) console.log(errors);
}
main().catch(e => { console.error(e); process.exit(1); });
