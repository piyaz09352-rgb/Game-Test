/* VAYRATHEN — js/sys/tgticons.js — (v55) the target's states sit UNDER the target frame as icon chips
   Each chip: an icon that says what it is, a short Thai/English word and the seconds left, dark text on a light pill
   with a coloured edge. Hover (or long-press) shows what it does. */
'use strict';

const TI = {   // match on the chip's text → [icon, Thai, English, what it does (th, en)]
  STUN:['💫', 'มึน', 'Stun', 'ขยับและโจมตีไม่ได้', 'Cannot move or attack'], FROZEN:['❄️', 'แช่แข็ง', 'Frozen', 'ขยับและโจมตีไม่ได้', 'Cannot move or attack'],
  SLEEP:['💤', 'หลับ', 'Sleep', 'หยุดนิ่งจนกว่าจะโดนตี', 'Stopped until hit'], ROOT:['🌿', 'ตรึง', 'Root', 'เดินไม่ได้ แต่ยังโจมตีได้', 'Cannot move, can still attack'],
  SLOW:['🐌', 'ช้าลง', 'Slow', 'เดินและโจมตีช้าลง', 'Moves and attacks slower'], SHOCK:['⚡', 'ช็อต', 'Shock', 'ชะงักเป็นระยะ', 'Twitches now and then'],
  POISON:['☠️', 'พิษ', 'Poison', 'เสียเลือดทุกวินาที', 'Loses HP every second'], BURN:['🔥', 'ไหม้', 'Burn', 'เสียเลือดทุกวินาที', 'Loses HP every second'],
  WET:['💧', 'เปียก', 'Wet', 'โดนธาตุลมแรงขึ้น 30%', 'Takes 30% more Wind damage'], 'MDEF↓':['🔮', 'MDEF ลด', 'MDEF down', 'โดนเวทแรงขึ้น 25%', 'Takes 25% more magic damage'],
  'DEF↓':['🛡️', 'DEF ลด', 'DEF down', 'เกราะอ่อนลง โดนกายภาพแรงขึ้น', 'Weaker armour, takes more physical damage'], 'ATK↓':['⚔️', 'ATK ลด', 'ATK down', 'ตีเบาลง', 'Hits softer'],
  TAUNTED:['🎯', 'ถูกยั่วยุ', 'Taunted', 'หันมาตีคนที่ยั่ว', 'Attacks whoever taunted it'], PHASE:['🔺', 'เฟส', 'Phase', 'บอสโหดขึ้นตามเฟส', 'The boss grows fiercer each phase'],
  RAMPAGE:['💢', 'อาละวาด', 'Rampage', 'ตีเร็วและแรง สกิลถี่ขึ้น', 'Faster, harder hits and more skills'], RAGE:['😤', 'โกรธ', 'Rage', 'ตีแรงขึ้น 50%', 'Hits 50% harder'],
  'CC IMMUNE':['🚫', 'กันควบคุม', 'CC immune', 'ไม่ติดมึน แช่แข็ง หลับ ตรึง ใบ้', 'Immune to stun, freeze, sleep, root and silence'],
  'หลบเก่ง':['💨', 'หลบเก่ง', 'Evasive', 'ตีกายภาพพลาด 20% (ยกเว้นคริ)', '20% of non-critical physical hits miss'], Evasive:0,
  'ว่องไว':['🏃', 'ว่องไว', 'Swift', 'ตีและเดินเร็วขึ้น 30%', 'Attacks and moves 30% faster'], Swift:0,
  'ช้าแต่แรง':['💪', 'ช้าแต่แรง', 'Brute', 'ตีแรงขึ้น 45% แต่ช้า', 'Hits 45% harder but slower'], Brute:0,
  'ต้านคริ':['🎲', 'ต้านคริ', 'Crit-proof', 'คริทำดาเมจเพิ่มได้แค่ 1/3', 'Crits do a third of their extra damage'], 'Crit-proof':0,
  'เกราะหนา':['🪨', 'เกราะหนา', 'Armoured', 'กายภาพ −30% · เวท +15%', 'Physical −30% · magic +15%'], Armoured:0,
  'ต้านเวท':['✨', 'ต้านเวท', 'Warded', 'เวท −35% · กายภาพ +10%', 'Magic −35% · physical +10%'], Warded:0,
  'อึด':['🧱', 'อึด', 'Tough', 'เลือด +35% ตีเบาลง 10%', 'HP +35%, hits 10% softer'], Tough:0,
  'ฟื้นตัว':['💚', 'ฟื้นตัว', 'Regenerates', 'ฟื้นเลือด 0.8% ทุกวินาที', 'Regains 0.8% HP a second'], Regenerates:0};
{ const al = {Evasive:'หลบเก่ง', Swift:'ว่องไว', Brute:'ช้าแต่แรง', 'Crit-proof':'ต้านคริ', Armoured:'เกราะหนา', Warded:'ต้านเวท', Tough:'อึด', Regenerates:'ฟื้นตัว'}; for (const k in al) TI[k] = TI[al[k]]; }
const tiEsc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'})[c]);
/* (v57) a chip is now just the icon and a + or − : green with + for anything that makes the monster stronger,
   red with − for anything that weakens or holds it. The icon sits on a tile in its own colour (fire orange, water blue,
   wind green, earth brown, poison purple, ice cyan …), a thin bar under it runs down with the time left, and the name
   with what it does shows on hover or a long press. Like the debuff borders of classic MMOs: colour says good or bad at a glance. */
const TI_EC = typeof TF_EC !== 'undefined' ? TF_EC : {neutral:'#8a8478', earth:'#a2682a', water:'#1f74c9', fire:'#d8401f', wind:'#1f9a6a', holy:'#c9971a', shadow:'#6b3fb0', poison:'#7a9a1a'};
const TI_TONE = {STUN:['-', '#d8a200'], FROZEN:['-', '#3fb6e6'], SLEEP:['-', '#6a5acd'], ROOT:['-', TI_EC.earth], SLOW:['-', '#5f7a8c'], SHOCK:['-', TI_EC.wind],
  POISON:['-', '#7a3fb0'], BURN:['-', TI_EC.fire], WET:['-', TI_EC.water], 'MDEF↓':['-', '#7a3fd0'], 'DEF↓':['-', '#8a6a2a'], 'ATK↓':['-', '#b8322a'], TAUNTED:['-', '#d4553a'],
  PHASE:['+', '#c0392b'], RAMPAGE:['+', '#d8401f'], RAGE:['+', '#c0392b'], 'CC IMMUNE':['+', '#6a6280'],
  'หลบเก่ง':['+', '#3a9ad6'], 'ว่องไว':['+', '#1f9a6a'], 'ช้าแต่แรง':['+', '#b8322a'], 'ต้านคริ':['+', '#c9971a'], 'เกราะหนา':['+', '#8a6a2a'], 'ต้านเวท':['+', '#7a3fd0'], 'อึด':['+', '#a2682a'], 'ฟื้นตัว':['+', '#2a9a4a']};
for (const [en, th] of [['Evasive', 'หลบเก่ง'], ['Swift', 'ว่องไว'], ['Brute', 'ช้าแต่แรง'], ['Crit-proof', 'ต้านคริ'], ['Armoured', 'เกราะหนา'], ['Warded', 'ต้านเวท'], ['Tough', 'อึด'], ['Regenerates', 'ฟื้นตัว']]) TI_TONE[en] = TI_TONE[th];
function tiChip(t, m){
  const s = String(t), key = Object.keys(TI).sort((a, b) => b.length - a.length).find(k => s === k || s.startsWith(k + ' ') || s.startsWith(k)), d = key && TI[key];
  if (!d) return s;
  const rest = s.slice(key.length).trim(), secs = /s$/.test(rest) ? parseFloat(rest) : 0, extra = rest && !/s$/.test(rest) ? rest : '', [sg, tint] = TI_TONE[key] || ['-', '#8a8478'];
  let bar = '';
  if (secs > 0 && m){ const mx = m._tiMax || (m._tiMax = {}); if (!mx[key] || secs > mx[key] + .25) mx[key] = secs; bar = `<i class="tib"><i style="width:${Math.max(4, Math.min(100, secs / mx[key] * 100)).toFixed(0)}%"></i></i>`; }
  else if (m && m._tiMax) delete m._tiMax[key];
  const tip = L(d[1], d[2]) + (extra ? ' ' + extra : '') + ': ' + L(d[3], d[4]) + (secs ? ` (${secs.toFixed(1)}s)` : '');
  return `<span class="tic ${sg === '+' ? 'pos' : 'neg'}" style="--tc:${tint}" title="${tiEsc(tip)}" aria-label="${tiEsc(tip)}"><em>${d[0]}</em><b>${sg === '+' ? '+' : '−'}</b>${extra ? `<small>${tiEsc(extra)}</small>` : ''}${bar}</span>`;
}
if (typeof tsChips === 'function'){ const _ts = tsChips; tsChips = function(m){ return _ts.apply(this, arguments).map(([t, c]) => [tiChip(t, m), c]); }; }
/* the row hangs under the frame instead of inside it */
{ const _ut = updTarget;
  updTarget = function(){ const r = _ut.apply(this, arguments); const box = el('target'), row = el('tSt'); if (box && row && row.parentElement !== box){ box.appendChild(row); } return r; }; }
{ const st = document.createElement('style');
  st.textContent = `html body #target{overflow:visible !important}
  html body #target #tSt.tst{position:absolute !important;left:0;right:0;top:calc(100% + 6px);display:flex;flex-wrap:nowrap;justify-content:center;gap:2px;overflow:hidden;margin:0 !important;pointer-events:auto;z-index:5}
  html body #target #tSt.tst[hidden]{display:none !important}
  html body #target #tSt.tst > i{display:inline-flex;padding:0 !important;background:none !important;border:0 !important;box-shadow:none !important;font-style:normal}
  html body #target #tSt .tic{position:relative;display:inline-flex;align-items:center;gap:0;padding:1px 2px 3px 1px;border-radius:6px;flex:0 0 auto;cursor:help;white-space:nowrap;
    border:1.5px solid var(--pc);background:var(--pb);box-shadow:0 1px 2px rgba(0,0,0,.2)}
  html body #target #tSt .tic.pos{--pc:#1a8a3a;--pb:#e8f8ec}
  html body #target #tSt .tic.neg{--pc:#c42a1a;--pb:#fde9e5}
  html body #target #tSt .tic em{display:inline-grid;place-items:center;width:14px;height:14px;border-radius:4px;font-style:normal;font-size:9px;line-height:1;
    background:radial-gradient(circle at 35% 30%,#fff 0,color-mix(in srgb,var(--tc) 35%,#fff) 45%,var(--tc) 100%);border:1px solid color-mix(in srgb,var(--tc) 70%,#000)}
  html body #target #tSt .tic b{font:900 11px/1 Sarabun,sans-serif;color:var(--pc) !important;-webkit-text-fill-color:var(--pc) !important;min-width:7px;text-align:center}
  html body #target #tSt .tic small{font:800 8px Sarabun,sans-serif;color:#141414 !important}
  html body #target #tSt .tic .tib{position:absolute;left:2px;right:2px;bottom:0;height:2px;border-radius:2px;background:rgba(0,0,0,.12);overflow:hidden;display:block}
  html body #target #tSt .tic .tib > i{display:block;height:100%;background:var(--pc);border-radius:2px}`;
  document.head.appendChild(st); }
