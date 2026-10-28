/* VAYRATHEN — js/sys/classswap.js — one hero, many classes (v29)
   · An account plays one character (game/save.js). Instead of making alts, a hero switches class.
   · Switching is done only with Master Vayra in Aren (v57: no longer at the camp cooks / quartermasters): her dialog has a
     "สลับอาชีพ" (switch class) section once the hero has a class of their own.
   · A new class must be unlocked first. The first one is free; every other one costs Vayra Coins (v57: CS_COINS, no longer Bia).
     A class unlocked once is kept for good, and switching between unlocked classes is free.
   · Base Lv, gear, bag, money and pets stay with the hero. Job Lv, Job EXP, skills, Skill Points, stats (v150) and the
     hotbar belong to each class: a new class starts at Job Lv 1 of its first job and is raised from there (its own
     job changes, trials and tiers as usual); coming back to an old class finds it as it was left.
   · Class gear that the new class can't use (another line's weapon or set) goes back into the bag. */
'use strict';

const CS_LINES = ['blade', 'rune', 'ranger', 'muay', 'healer', 'rogue', 'summoner'];
const CS_COINS = 100;   // (v57) unlocking a class costs Vayra Coins, not Bia
const csFee = () => CS_COINS;
const csCoins = () => (typeof ACC !== 'undefined' && ACC.coins) || 0;
const csFeeTxt = () => `${fmtN(csFee())} ${L('เหรียญวายรา', 'Vayra Coins')}`;
const csLine = () => jobChain()[1] || null;
const csData = () => { if (!S.cls) S.cls = {have:{}, free:1}; if (!S.cls.have) S.cls.have = {}; const c = csLine(); if (c && !S.cls.have[c]) S.cls.have[c] = {job:S.job}; if (!S.cls.statsV && typeof csStatsMigrate === 'function') csStatsMigrate(); return S.cls; };
const csNovice = () => JOBS.novice.skills;
const csWhere = () => (typeof DG !== 'undefined' && DG.active) ? L('ออกจากดันเจี้ยนก่อน', 'Leave the dungeon first')
  : !inVillage(P) ? L('สลับอาชีพได้ที่ครูวายราในนครอาเรนเท่านั้น', 'Classes are switched only with Master Vayra in Aren') : P.dead ? L('ฟื้นก่อน', 'Revive first') : '';
function csSwitch(line){
  if (!S || S.job === 'novice' || !CS_LINES.includes(line) || line === csLine()) return;
  const why = csWhere(); if (why){ toast(why); return; }
  const C = csData(), cur = csLine();
  if (!C.have[line]){
    const free = (C.free || 0) > 0, fee = csFee();
    if (!free && csCoins() < fee){ toast(L(`ต้องใช้ ${csFeeTxt()} เพื่อปลดอาชีพนี้ (มี ${fmtN(csCoins())})`, `Unlocking this class costs ${csFeeTxt()} (you have ${fmtN(csCoins())})`)); return; }
    sysPrompt(free ? L(`ปลดอาชีพ${nm(JOBS[line])}ฟรี (สิทธิ์ฟรีมีครั้งเดียว)?`, `Unlock ${nm(JOBS[line])} for free (your one free unlock)?`)
      : L(`ปลดอาชีพ${nm(JOBS[line])} ราคา ${csFeeTxt()}?`, `Unlock ${nm(JOBS[line])} for ${csFeeTxt()}?`), () => {
      if (csWhere()) return; if (free) C.free--; else { if (csCoins() < fee) return; ACC.coins -= fee; if (typeof accSave === 'function') accSave(); }
      C.have[line] = {job:line, jlvl:1, jexp:0, skills:{}, skPts:0, hot:null};
      log(L(`ปลดอาชีพ${nm(JOBS[line])}แล้ว`, `${nm(JOBS[line])} unlocked`), 'g'); csGo(line, cur); });
    return;
  }
  csGo(line, cur);
}
/* (v150) stats belong to each class too. Total points earned come from Base Lv (shared); how they are placed is the class's:
   leaving a class keeps its placement, coming back restores it (plus any points earned since, as free points); a class
   met for the first time starts with every stat at 1 and all points free to place. */
const csSpent = st => { let n = 0; for (const k in st) for (let v = 1; v < (st[k] | 0); v++) n += statCost(v); return n; };
const csTotal = () => (S.statPts || 0) + csSpent(S.stats || {});
function csStatsMigrate(){ const C = S.cls; if (!C || C.statsV) return; C.statsV = 1;
  // classes unlocked before this change all shared the one placement: each keeps it as its own
  for (const l in C.have) if (C.have[l] && !C.have[l].stats) Object.assign(C.have[l], {stats:{...S.stats}, statPts:S.statPts || 0, statTot:csTotal()}); }
function csGo(line, cur){
  const C = csData(), nov = {}; for (const id of csNovice()) if (S.skills[id]) nov[id] = S.skills[id];
  // put the current class away
  const mine = {}; for (const id in S.skills) if (!(id in nov)) mine[id] = S.skills[id];
  C.have[cur] = {job:S.job, jlvl:S.jlvl, jexp:S.jexp, skills:mine, skPts:S.skPts || 0, hot:(S.hot || []).slice(), stats:{...S.stats}, statPts:S.statPts || 0, statTot:csTotal()};
  // take the other one out
  const st = C.have[line];
  S.job = JOBS[st.job] ? st.job : line; S.jlvl = st.jlvl || 1; S.jexp = st.jexp || 0; S.skPts = st.skPts || 0;
  { const tot = csTotal();
    if (st.stats){ S.stats = {...st.stats}; S.statPts = (st.statPts || 0) + Math.max(0, tot - (st.statTot || tot)); }   // as you left it, + points earned since
    else { const one = {}; for (const k in S.stats) one[k] = 1; S.stats = one; S.statPts = tot;                        // a new class: start again
      setTimeout(() => toast(L(`อาชีพใหม่: สเตตัสเริ่มใหม่ ได้แต้ม ${fmtN(tot)} แต้มไปลงได้เลย`, `A new class: stats start over, ${fmtN(tot)} points to place`)), 1200); }
    if (typeof STP !== 'undefined' && typeof stpClear === 'function') stpClear(); }
  S.skills = {...nov, ...(st.skills || {})};
  S.hot = Array.isArray(st.hot) && st.hot.length === 6 ? st.hot.slice() : (S.hot || []).map(h => (h && csNovice().includes(h) ? h : null));
  while (S.hot.length < 6) S.hot.push(null);
  // gear the new class can't use goes back into the bag
  for (const sl in S.gear){ const id = S.gear[sl], it = id && ITEMS[id]; if (!it) continue;
    if ((sl === 'weapon' && !canWield(it)) || !lineOk(it.st)){ addItem(id, 1); S.gear[sl] = null; } }
  if (usesArrows() && !arrowCount()){ const a0 = ammoStarter(); addItem(a0, 1000); S.gear.ammo = a0; }
  csClearClass();
  derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; if (typeof skTab !== 'undefined') skTab = S.job;
  banner(L(`สลับเป็น${nm(JOBS[S.job])} · Job Lv ${S.jlvl}`, `Now a ${nm(JOBS[S.job])} · Job Lv ${S.jlvl}`));
  VFX.play('jobChange', {x:P.x, y:P.y}); SFX.play('jobUp');
  if (typeof renderHotbar === 'function') renderHotbar(); if (typeof renderSkills === 'function') try { renderSkills(); } catch (e) {}
  dirty = true; EV.emit('job', S.job); save(); csReopen();
}
/* (v57) nothing from the old class comes along: its summoned beasts, the bound boss, the spirit tiger, traps,
   skill buffs, a cast in progress and a hidden state all end, so only the new class's own skills are in play */
const CS_KEEP_BUFF = ['tonic', 'food', 'petHowl'];
function csClearClass(){
  if (typeof SUMMONS !== 'undefined') for (const s of SUMMONS.splice(0)) VFX.play(s.kind === 'beast' ? 'beastFade' : 'tigerFade', {x:s.x, y:s.y, col:s.kind === 'beast' && typeof beastDef === 'function' && beastDef(s) ? beastDef(s).aura : null});
  if (typeof TRAPS !== 'undefined') TRAPS.length = 0;
  P.cast = null; P.pending = null; P.act = null;
  P.buffs = P.buffs || {}; for (const k in P.buffs) if (!CS_KEEP_BUFF.includes(k) && !k.startsWith('food_')) delete P.buffs[k];
  if (typeof unhide === 'function') unhide();
  if (typeof renderBuffs === 'function') renderBuffs();
}
/* the bound boss only walks beside a hero who has Royal Bond in the class being played */
{ const _sb = spawnBound; spawnBound = function(){ if (!skl('royalbond')) return; return _sb.apply(this, arguments); }; }
function csHTML(){
  if (!S || S.job === 'novice') return '';
  const C = csData(), cur = csLine(), why = csWhere(), fee = csFee(), free = (C.free || 0) > 0;
  const row = line => { const j = JOBS[line], st = C.have[line], on = line === cur, open = !!st;
    const now = on ? JOBS[S.job] : open && JOBS[st.job] ? JOBS[st.job] : j, jl = on ? S.jlvl : open ? st.jlvl || 1 : 0;
    const btn = on ? `<span class="pr">${L('กำลังเล่น', 'Playing')}</span>`
      : open ? `<button class="btn sm gold" data-csgo="${line}" ${why ? 'disabled' : ''}>${L('สลับ', 'Switch')}</button>`
      : `<button class="btn sm" data-csgo="${line}" ${why || (!free && csCoins() < fee) ? 'disabled' : ''}>${free ? L('ปลดฟรี', 'Unlock free') : `${L('ปลด', 'Unlock')} ◈ ${fmtN(fee)}`}</button>`;
    return `<div class="srow${on ? ' owned' : open ? '' : ' locked'}"><span class="ic">${on ? '★' : open ? '⚔' : '🔒'}</span><div class="nm"><b>${nm(now)}</b><small>${open ? `Job Lv ${jl}` : L('ยังไม่ปลด', 'Locked')} · ${j.stat || ''}</small></div>${btn}</div>`; };
  return `<div class="sec">${L('สลับอาชีพ', 'Switch class')} <span class="ct">${Object.keys(C.have).length}/${CS_LINES.length}</span></div><div class="shop">${CS_LINES.map(row).join('')}</div>
    <p class="hint">${why ? `<b>${why}</b> · ` : ''}${L(`เลเวล สเตตัส ของ และเงินติดตัวไปทุกอาชีพ · Job Lv และสกิลแยกตามอาชีพ อาชีพใหม่เริ่ม Job Lv 1 · ปลดฟรีได้ 1 อาชีพ${free ? ' (ยังเหลือ)' : ' (ใช้แล้ว)'} อาชีพต่อไป ${csFeeTxt()} (มี ${fmtN(csCoins())}) · สลับไปมาระหว่างอาชีพที่ปลดแล้วฟรี`,
      `Level, stats, gear and money go with you · Job Lv and skills belong to each class, a new one starts at Job Lv 1 · one free unlock${free ? ' (unused)' : ' (used)'}, then ${csFeeTxt()} each (you have ${fmtN(csCoins())}) · switching between unlocked classes is free`)}</p>`;
}
function csAppend(){ const d = document.getElementById('dialog'), db = d && !d.hidden && d.querySelector('.db'); if (!db || db.querySelector('.cswap')) return; const h = csHTML(); if (!h) return;
  const box = document.createElement('div'); box.className = 'cswap'; box.innerHTML = h; const say = db.querySelector('.say'); if (say) say.after(box); else db.prepend(box); }
function csReopen(){ const d = document.getElementById('dialog'), n = d && !d.hidden && NPCS.find(x => x.id === d.dataset.npc); if (!n) return; if (NPC_OPEN[n.id]) NPC_OPEN[n.id](n); else openNpc(n); csAppend(); }
{ const _o = openNpc; openNpc = function(n){ const r = _o.apply(this, arguments); if (n && n.id === 'job') csAppend(); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-csgo]'); if (!b || b.disabled) return; e.stopPropagation(); csSwitch(b.dataset.csgo); }, true);
EV.on('job', () => { if (S && S.job !== 'novice') csData(); });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'classswap', t:['ตัวละครเดียว สลับอาชีพได้', 'One hero, switch classes'], b:() => `<p>${L(
  'หนึ่งบัญชีมีตัวละครเดียว แต่สลับอาชีพได้ที่ครูวายราในนครอาเรนเท่านั้น · ปลดอาชีพใหม่ได้ฟรี 1 อาชีพ อาชีพต่อไปใช้เหรียญวายรา · Base Lv สเตตัส ของ เงิน สัตว์เลี้ยงใช้ร่วมกัน · Job Lv สกิล Skill Point และแถบสกิลแยกตามอาชีพ อาชีพใหม่เริ่มที่ Job Lv 1 · ของประจำสายที่อาชีพใหม่ใช้ไม่ได้จะถูกถอดเข้ากระเป๋า',
  'One character per account, but it can switch class only with Master Vayra in Aren · the first extra class unlocks free, later ones cost Vayra Coins · Base Lv, stats, gear, money and pets are shared · Job Lv, skills, Skill Points and the hotbar belong to each class; a new class starts at Job Lv 1 · line gear the new class can\'t use goes back to the bag')}</p>`});
