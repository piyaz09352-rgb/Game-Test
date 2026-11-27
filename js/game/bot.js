/* VAYRATHEN — js/game/bot.js
   Player auto-play (ออโต้): hunts suitable monsters, uses skills and potions, rests when low,
   retreats to the village when out of potions. Stat and skill points are always spent by the player.
   Toggle with B or the dock button. Any manual click pauses it for a few seconds. */
'use strict';

const BOT = {on:false, think:0, pause:0, roam:null, state:'idle', skip:new Map()};   // skip: mobs it could not reach
const BOT_CFG = {
  hpPot:.45, spPot:.2, retreatHp:.25, restUntilHp:.9, restUntilSp:.6, seek:650
};
const BOT_TH = {hunt:['ล่ามอน', 'Hunting'], rest:['นั่งพัก', 'Resting'], retreat:['กลับเมือง', 'Returning'], roam:['หาเป้าหมาย', 'Searching'], idle:['พร้อม', 'Ready'], flee:['หลบบอส', 'Avoiding boss']};

function setBot(on){
  BOT.on = on; BOT.pause = 0; BOT.state = 'idle'; BOT.resting = false;
  if (!on){ P.tx = null; }
  toast(on ? L('เปิด Auto · กดสั่งเองเมื่อไหร่จะหยุดชั่วคราว 5 วิ', 'Auto ON · any manual input pauses it for 5s') : L('ปิด Auto', 'Auto OFF'));
  renderHotbar(); renderBotChip(); if (UIS.open.auto) renderAuto();
}
/* the Auto button only turns Auto on and off; the Auto settings window (G, or the ⚙ button) is only for the setup */
function botButton(){ setBot(!BOT.on); }
function botSettings(){ if (UIS.open.auto){ renderAuto(); winEl('auto').style.zIndex = ++zTop; } else openWin('auto'); }
function botPauseFromManual(){ if (BOT.on){ BOT.pause = 5; renderBotChip(); } }

function threats(){ return mobs.filter(m => !m.dead && m.aggro && dist(m, P) < 160 && !botShun(m)); }
/* "avoid bosses" (on by default): Auto never hits a boss, keeps away from monsters standing near one,
   never wanders near one, and runs away when a boss comes close. Pack alphas (หัวหน้าฝูง) are NOT avoided: Auto fights them. */
const BOT_BOSS = {near:300, flee:260};
const botAvoid = () => (!S.bot || S.bot.avoidBoss !== false) && !(typeof aicFieldOn === 'function' && aicFieldOn());   // (v349) not with an AI party called for a story boss
const botBosses = () => mobs.filter(m => !m.dead && !m.vanish && m.def.boss);   // real bosses only
const botSafeSpot = () => (MAP_ID === 0 ? {x:VSPAWN.x, y:VSPAWN.y} : CAMP ? {x:CAMP.x, y:CAMP.y} : null);
function botShun(m){
  if (botDanger(m) || botDangers().some(d => d !== m && dist(m, d) < BOT_DANGER.near)) return true;   // (v348) on every map
  if (!botAvoid()) return false;
  if (m.def.boss) return true;
  for (const b of botBosses()) if (dist(m, b) < BOT_BOSS.near) return true;
  return false;
}
/* (v348) Auto buys potions in town (see the town branch of updBot) */
const BOT_POTS = [['redpot', 1], ['orangepot', 15], ['whitepot', 50], ['elixirpot', 100]];
const botPotCount = () => BOT_POTS.reduce((a, [id]) => a + (S.inv[id] | 0), 0);
const botPotBest = () => { let b = null; for (const [id, lv] of BOT_POTS) if (ITEMS[id] && ITEMS[id].buy && S.lvl >= lv) b = id; return b; };
const botBuyWant = () => { const B = S.bot || {}; if (B.autoBuy === false || BOT.boughtT > T - 30) return false; const id = botPotBest(); return !!id && botPotCount() < 10 && S.bia * .3 >= ITEMS[id].buy * 5; };
function botBuy(){ const id = botPotBest(); BOT.boughtT = T; if (!id) return; const price = ITEMS[id].buy, n = Math.min(30 - botPotCount(), Math.floor(S.bia * .3 / price)); if (n < 1) return;
  S.bia -= price * n; addItem(id, n); log(L(`Auto ซื้อ ${nm(ITEMS[id])} ×${n}`, `Auto bought ${nm(ITEMS[id])} ×${n}`), 'g'); toast(L(`Auto ซื้อยา ${nm(ITEMS[id])} ×${n}`, `Auto bought ${nm(ITEMS[id])} ×${n}`)); dirty = true; }
/* (v348) monsters a hero must not wander into: they attack on sight and are more than 3 levels above it (a pack leader
   counts 8 more). The first-play bot (tools/first-play.js) saw Auto walk a Lv 8 newcomer into Lv 13 night lanterns. Auto
   does not pick them, does not fight right beside one (a fight there pulls it in) and does not roam towards them; one that
   attacks is still fought back (threats() come first). Not bosses — those have their own rules above. */
const BOT_DANGER = {near:240, roam:300};
const botDanger = m => !!(m && !m.dead && !m.vanish && m.def && !m.def.boss && m.def.aggro && !m.aggro && !m.calm && (m.def.lvl | 0) + (m.elite ? 8 : 0) > (S.lvl | 0) + 3);
let BOT_DCACHE = {t:-1, list:[]};
const botDangers = () => { if (BOT_DCACHE.t !== T){ BOT_DCACHE = {t:T, list:mobs.filter(botDanger)}; } return BOT_DCACHE.list; };
const botNearDanger = (x, y, r = BOT_DANGER.roam) => botDangers().some(d => Math.hypot(d.x - x, d.y - y) < r);
const botOk = m => !(m.dead || m.vanish || m.dummy || inVillage(m) || BOT.skip.has(m) || (m.def.boss && S.lvl < 22 && !(typeof DG !== 'undefined' && DG.active) && !(typeof aicFieldOn === 'function' && aicFieldOn())) || botShun(m));
/* who comes first: the closest; two about as close (within TGT_TIE px) → the one with less HP (v30) */
const TGT_TIE = 20;
function tgtCmp(a, b){ const da = dist(a, P), db = dist(b, P); return Math.abs(da - db) <= TGT_TIE ? (a.hp - b.hp) || (da - db) : da - db; }
function pickTarget(){
  const th = threats().filter(m => !BOT.skip.has(m));
  if (th.length) return th.sort(tgtCmp)[0];
  const all = mobs.filter(m => botOk(m) && dist(m, P) < BOT_CFG.seek && botInZone(m) && (!m.evb || botFits(m))), fit = all.filter(botFits);
  return (fit.length ? fit : all).sort(tgtCmp)[0] || null;   // (v320) monsters near its own level first
}
/* (v320) Auto picks a fight it can win: a monster more than 5 levels above the hero is left alone while others are about
   (one that attacks is still fought back: threats() come first) */
const botFits = m => !m.def || !m.def.lvl || m.def.lvl + (m.evb ? 12 : m.elite ? 8 : 0) <= S.lvl + 5;   // a pack leader (4× HP, harder hits) counts as 8 levels higher, a festival spirit (8× HP) as 12 — (v347) at +5 an alpha Lv 9 boar «fitted» a Lv 9 newcomer and killed it
/* (v347) in the starter fields Auto keeps to the part that suits its level (f306Zone): it used to walk to «the nearest
   monster it would fight, wherever it is», and at night that led a Lv 8 hero into the Lv 13 lanterns (tools/first-play.js) */
const botInZone = m => { const z = typeof f306Zone === 'function' && f306Zone(); return !z || (m.x >= z.x0 - 150 && m.x <= z.x1 + 150); };
/* ---------- Auto skill set (saved per character in S.bot) ----------
   list: the player's own priority order of active skills, each on/off. basic: use normal attacks.
   buff: keep the ticked buffs up. heal: heal skills fire below this HP %. spKeep: SP % kept in reserve. */
const BOT_SKIP = ['passive', 'blink', 'backstep'];
const botKind = sk => sk.type === 'heal' ? 'heal' : sk.type === 'restore' ? 'sp' : (sk.type === 'buff' || sk.type === 'petcall' || sk.type === 'conjure' || sk.type === 'bond' || sk.type === 'summon') ? 'buff' : 'atk';
/* (v108) buffs and summons are cast again only when they are nearly over (the last 10% of their time, at least 2 s),
   or at once when a summoned beast dies — never while they are still running */
const botRefresh = dur => Math.max(2, (dur || 0) * .1);
const BOT_KIND = {atk:['โจมตี', 'Attack'], buff:['Buff', 'Buff'], heal:['ฟื้น', 'Heal'], sp:['ฟื้น SP', 'SP']};
function botSet(){
  const b = S.bot || (S.bot = {list:[], basic:true, buff:true, heal:60, spKeep:10});
  if (b.sit == null) Object.assign(b, {sit:true, sitHp:50, sitSp:15});
  if (b.avoidBoss == null) b.avoidBoss = true;
  if (b.autoBuy == null) b.autoBuy = true;   // (v348)
  if (b.potHpOn == null) Object.assign(b, {potHpOn:true, potHp:(typeof SETTINGS !== 'undefined' && SETTINGS.botHp) || 45, potSpOn:true, potSp:20});
  const owned = ownedSkillIds().filter(id => skl(id) && !BOT_SKIP.includes(SKILLS[id].type));
  b.list = b.list.filter(e => owned.includes(e.id));
  const have = new Set(b.list.map(e => e.id));
  const fresh = [...S.hot.filter(id => id && owned.includes(id)), ...owned].filter((id, i, a) => a.indexOf(id) === i && !have.has(id));
  for (const id of fresh) b.list.push({id, on:SKILLS[id].type !== 'trap'});
  return b;
}
function botReady(id, keep){
  const sk = SKILLS[id], lv = skl(id);
  return lv && (P.cds[id] || 0) <= 0 && !(P.acd > 0) && S.sp >= sk.sp(lv) + keep;
}
/* order of checks: heal (HP low) → restore SP (SP low) → buffs that ran out → attacks.
   Attacks rotate: of the ticked skills that are ready, the one used longest ago goes first (ties follow
   the player's list order), so every ticked skill gets used instead of the top one hogging every turn.
   A skill that hits around you (aoeSelf) waits until the target is inside its radius. */
BOT.used = BOT.used || {}; BOT.castT = BOT.castT || {};
function botUsable(id, t){
  const sk = SKILLS[id];
  if (sk.bia && (S.bia || 0) < sk.bia(skl(id) || 1)) return false;   // (v323) a skill paid in Bia, and not enough Bia
  if (sk.type === 'aoeSelf') return t && dist(t, P) < (sk.radius || 60) + t.def.r;
  if (sk.type === 'command') return SUMMONS.some(s => s.kind === 'beast' && s.beast !== 'kinnaree');
  if (sk.type === 'debuff' && t && t.st && Object.keys(sk.st ? sk.st(1) : {}).some(k => t.st[k] > 0)) return false;   // already afflicted
  return true;
}
function botPick(t){
  const b = botSet(), keep = Math.round(DER.maxsp * b.spKeep / 100), hp = S.hp / DER.maxhp, sp = S.sp / DER.maxsp;
  for (const e of b.list){
    if (!e.on) continue; const sk = SKILLS[e.id];
    if (botKind(sk) === 'heal' && hp * 100 < b.heal && !botWeak(e.id) && botReady(e.id, 0)) return e.id;
  }
  for (const e of b.list) if (e.on && botKind(SKILLS[e.id]) === 'sp' && sp < .5 && botReady(e.id, 0)) return e.id;
  if (b.buff) for (const e of b.list){
    if (!e.on) continue; const sk = SKILLS[e.id];
    if (botKind(sk) !== 'buff' || !botReady(e.id, keep)) continue;
    if (sk.type === 'petcall'){ if (S.pet && t && !(P.petBuff > 0)) return e.id; continue; }
    if (sk.type === 'bond'){ if (S.bound && !SUMMONS.some(s => s.beast === 'bound') && !(typeof bondRest === 'function' && bondRest() > 0) && !P.cds[e.id]) return e.id; continue; }   // (v274) not while it rests
    if (sk.type === 'conjure' || sk.type === 'summon'){
      // a summoned beast: out and not nearly over → wait; gone (died or ran out) → call it again right away
      const live = SUMMONS.filter(s => (sk.type === 'summon' ? s.kind === 'tiger' : s.kind === 'beast' && s.beast === sk.beast) && !s.dead && s.dur - s.t > 0);
      if (live.some(s => s.dur - s.t > botRefresh(s.dur))) continue;
      return e.id; }
    { const cur = P.buffs[e.id], lv = skl(e.id), dur = (sk.buff && (sk.buff(lv) || {}).t) || 30;
      if (cur && cur.t > botRefresh(cur.max || dur)) continue;   // still on: refresh only near the end
      // a buff that does not show on me (it lands on others or works another way): go by when I last cast it
      if (!cur && BOT.castT[e.id] != null && T - BOT.castT[e.id] < dur - botRefresh(dur)) continue; }
    if ((e.id === 'stealth' || e.id === 'smokebomb') && hideBuff()) continue;
    if ((e.id === 'stealth' || e.id === 'smokebomb') && !t) continue;
    return e.id;
  }
  if (!t) return null;
  let best = null, bt = Infinity;
  b.list.forEach((e, i) => {
    if (!e.on || botKind(SKILLS[e.id]) !== 'atk' || botWeak(e.id) || !botReady(e.id, keep) || !botUsable(e.id, t)) return;
    const when = (BOT.used[e.id] || 0) + i * 1e-3;          // oldest use first, list order breaks ties
    if (when < bt){ bt = when; best = e.id; }
  });
  return best;
}
/* (v323) the novice's own skills are left alone once they no longer matter: Stone Throw once the hero has an attack
   skill of its job (it was cast as often as the job's best skills, a third of a Lv 115 hunter's casts), First Aid once it
   heals less than 5 % of Max HP (45 HP to a hero of thousands: a Lv 115 merchant cast it 28 times in 2 minutes) */
function botWeak(id){ const sk = SKILLS[id]; if (!sk || sk.job !== 'novice') return false;
  if (sk.type === 'heal') return typeof sk.heal === 'function' && sk.heal(skl(id) || 1) < DER.maxhp * .05;
  return S.job !== 'novice' && ownedSkillIds().some(o => SKILLS[o] && SKILLS[o].job !== 'novice' && botKind(SKILLS[o]) === 'atk' && skl(o)); }
function botFire(id){ const cd0 = P.cds[id] || 0; trySkill(id); if ((P.cds[id] || 0) > cd0 || P.cast){ BOT.used[id] = performance.now(); BOT.castT[id] = T; }
  else BOT.used[id] = performance.now();   /* (v323) it did not go off (no Bia, blocked, out of reach…): it goes to the back of the turn instead of being
     chosen again at once — a Lv 115 merchant without Bia tried Gold Rush 158 times a minute and its other skills never got a turn */ }
/* range the auto stands at when normal attacks are off: the shortest ticked attack skill */
function botHoldRange(){
  const b = S.bot; if (!b || b.basic) return 0;
  let r = 0;
  for (const e of b.list) if (e.on && botKind(SKILLS[e.id]) === 'atk'){ const x = skillRange(e.id); r = r ? Math.min(r, x) : x; }
  return r || 0;
}
function updBot(dt){
  if (!BOT.on) return;
  if (BOT.pause > 0){ BOT.pause -= dt; if (BOT.pause <= 0) renderBotChip(); return; }
  for (const [m, t] of BOT.skip){ if (t - dt <= 0 || m.dead) BOT.skip.delete(m); else BOT.skip.set(m, t - dt); }
  BOT.think -= dt; if (BOT.think > 0) return; BOT.think = .25;
  if (P.dead || P.roll || P.capT > 0 || P.cast) return;
  closeDialog();
  const hp = S.hp / DER.maxhp, sp = S.sp / DER.maxsp, th = threats();
  // potions
  const B = S.bot || {}, hpPot = S.inv[potPick('hp')] ? potPick('hp') : null, spPot = S.inv[potPick('sp')] ? potPick('sp') : null;   // (v290) the slot's own potion, or the strongest in the bag
  if (B.potHpOn !== false && hp < (B.potHp ?? 45) / 100 && hpPot && P.itemCd <= 0){ useItem(hpPot); return; }
  if (B.potSpOn !== false && sp < (B.potSp ?? 20) / 100 && spPot && P.itemCd <= 0){ useItem(spPot); return; }
  { const h = botPick(null); if (h && (botKind(SKILLS[h]) === 'heal' || botKind(SKILLS[h]) === 'sp')){ botFire(h); return; } }
  // a boss is close → run the other way
  if (botAvoid()){
    const near = botBosses().filter(m => dist(m, P) < BOT_BOSS.flee || (m.aggro && dist(m, P) < 700)).sort((a, b) => dist(a, P) - dist(b, P))[0];
    // a boss hunting you never gives up out in the field, so run all the way to the village / camp (it can't follow
    // you in, and one that does teleports away: bosssafe.js); a calm one nearby you just step away from
    const safe = near && near.aggro && !inVillage(P) ? botSafeSpot() : null;
    if (safe){
      if (P.sit){ P.sit = false; renderHotbar(); } BOT.resting = false;
      P.target = null; P.pending = null; BOT.roam = null; P.tx = safe.x; P.ty = safe.y;
      if (!P.ride && canRideNow()){ P.ride = true; renderHotbar(); }
      BOT.state = 'flee'; renderBotChip(); return;
    }
    if (near && !inVillage(P) && dist(near, P) < 140 && !th.some(m => m !== near)){   // a calm boss only makes Auto step away when it is right on top of you, and never in the middle of a fight
      if (P.sit){ P.sit = false; renderHotbar(); } BOT.resting = false;
      P.target = null; P.pending = null; BOT.roam = null;
      const d = Math.max(1, dist(near, P)), ux = (P.x - near.x) / d, uy = (P.y - near.y) / d;
      let go = null;
      for (const a of [0, .6, -.6, 1.2, -1.2, 1.8, -1.8]){ const c = Math.cos(a), s2 = Math.sin(a), q = {x:P.x + (ux * c - uy * s2) * 260, y:P.y + (ux * s2 + uy * c) * 260};
        if (walkable(q.x, q.y, 18)){ go = q; break; } }
      if (go){ P.tx = go.x; P.ty = go.y; if (!P.ride && canRideNow()){ P.ride = true; renderHotbar(); } }
      BOT.state = 'flee'; renderBotChip(); return;
    }
  }
  // out of potions and hurt → back to the village
  // (v273) no Return Talisman any more: walk to this map's Shrine Keeper and warp home for free
  if (hp < BOT_CFG.retreatHp && !hpPot && MAP_ID !== 0){ const k = NPCS.find(x => x.id === 'warp');
    // (v333) also with monsters on you: the 100-bot playtest saw Auto stand and fight to the death at 4% HP with no potions
    // left (a pack and its leader). Now it breaks off and runs for the keeper; the warp takes it home.
    if (k && (!threats().length || hp < BOT_CFG.retreatHp * .6)){ BOT.state = 'retreat'; if (P.sit) P.sit = false; P.target = null; P.pending = null;
      if (Math.hypot(k.x - P.x, k.y - P.y) < 70){ warpTo(0); return; }
      if (!P.ride && canRideNow()){ P.ride = true; renderHotbar(); } P.tx = k.x; P.ty = k.y + 40; renderBotChip(); return; } }
  /* (v348) home in Aren with fewer than 10 HP potions: Auto walks to Auntie Buakham and buys the best potion for its level
     (red → orange Lv 15 → white Lv 50 → elixir Lv 100) with at most 30% of its money. Newcomers on Auto ran out, and
     only ever rested. Setting «ซื้อยาเองในเมือง» (S.bot.autoBuy), on by default. */
  if (MAP_ID === 0 && !th.length && botBuyWant()){ const n = NPCS.find(x => x.id === 'shop');
    if (n){ BOT.state = 'shop'; if (P.sit){ P.sit = false; renderHotbar(); } P.target = null; P.pending = null;
      if (Math.hypot(n.x - P.x, n.y - P.y) < 60){ botBuy(); P.tx = null; } else { P.npc = null; P.tx = n.x; P.ty = n.y + 30; }
      renderBotChip(); return; } }
  /* (v347) home in Aren, hurt and out of potions: sit down right here and rest until topped up. Aren has had no monsters
     since v306, but Auto still walked to the old village corner (300, 860) — now beside the gate to the fields — went out
     at 7% HP, warped home again, and round and round for minutes (tools/first-play.js) */
  if (MAP_ID === 0 && !th.length && (BOT.resting || (hp < BOT_CFG.retreatHp * 2 && !hpPot))){
    if (hp < BOT_CFG.restUntilHp){ BOT.resting = true; if (!P.sit){ P.ride = false; P.target = null; P.tx = null; P.npc = null; P.sit = true; renderHotbar(); } BOT.state = 'rest'; renderBotChip(); return; }
    BOT.resting = false;
  }
  // rest until topped up
  const bs = botSet();
  const spGoal = JOBS[S.job].caster ? BOT_CFG.restUntilSp : 0;   // fighters live on normal attacks: they never sit just for SP
  if (BOT.resting && (th.length || !bs.sit || (hp >= BOT_CFG.restUntilHp && sp >= spGoal))) BOT.resting = false;
  if (bs.sit && !th.length && (hp * 100 < bs.sitHp || (JOBS[S.job].caster && sp * 100 < bs.sitSp))) BOT.resting = true;
  if (BOT.resting){
    if (!P.sit){ P.ride = false; P.target = null; P.tx = null; P.sit = true; renderHotbar(); }
    BOT.state = 'rest'; renderBotChip(); return;
  }
  if (P.sit){ P.sit = false; renderHotbar(); }
  // hunt
  let t = P.target;
  if (!t || t.dead || botShun(t) || dist(t, P) > BOT_CFG.seek) t = P.target = pickTarget();   // out of range: pick again, closest first
  if (t){
    if (P.ride) P.ride = false;
    BOT.state = 'hunt'; BOT.roam = null; P.tx = null;
    if (!P.pending){ const sk = botPick(t); if (sk) botFire(sk); }
    renderBotChip(); return;
  }
  // nothing around → roam to the right hunting ground
  BOT.state = 'roam';
  const zone = MAP_ID === 0 ? (S.lvl < 8 ? ZA : ZB) : (typeof f306Zone === 'function' && f306Zone()) || MAPZ;
  if (!BOT.roam || Math.hypot(BOT.roam.x - P.x, BOT.roam.y - P.y) < 30){
    BOT.roam = null;
    {   // head for the nearest monster Auto would fight, wherever it is on the map
      const ok = mobs.filter(m => botOk(m) && botInZone(m)), fit = ok.filter(botFits), near = (fit.length ? fit : ok).sort((a, b) => dist(a, P) - dist(b, P)).slice(0, 4);
      const bm = near.find(m => !botNearDanger(m.x, m.y) && findPath(P.x, P.y, m.x, m.y)); if (bm) BOT.roam = {x:bm.x, y:bm.y}; }
    for (let i = 0; i < 6 && !BOT.roam; i++){ const q = randIn(zone, 18); if (botAvoid() && botBosses().some(m => Math.hypot(m.x - q.x, m.y - q.y) < BOT_BOSS.near + 100)) continue; if (botNearDanger(q.x, q.y)) continue; if (walkable(q.x, q.y, 18) && findPath(P.x, P.y, q.x, q.y)) BOT.roam = q; }
    if (!BOT.roam){ renderBotChip(); return; }
  }
  P.tx = BOT.roam.x; P.ty = BOT.roam.y;
  if (!P.ride && canRideNow() && Math.hypot(BOT.roam.x - P.x, BOT.roam.y - P.y) > 400){ P.ride = true; renderHotbar(); }
  renderBotChip();
}
function renderBotChip(){
  const c = document.getElementById('botChip'); if (!c) return;
  // (v91) Auto calls this every step: write only what changed
  if (c.hidden !== !BOT.on) c.hidden = !BOT.on;
  if (c.classList.contains('paused') !== BOT.pause > 0) c.classList.toggle('paused', BOT.pause > 0);
  const full = BOT.pause > 0 ? L('Auto · หยุดชั่วคราว', 'Auto · Paused') : `Auto · ${BOT_TH[BOT.state] ? L(...BOT_TH[BOT.state]) : ''}`;
  const sp = c.querySelector('span'), tx = BOT.pause > 0 ? 'Auto ⏸' : 'Auto';
  if (sp && sp.textContent !== tx) sp.textContent = tx; if (c.title !== full) c.title = full;   // short pill; the full state is in the tooltip
}

/* ---------- Auto setup window ---------- */
/* (v274) the owner: the skill set as tables, one per group (heal → SP → buff → attack, the order Auto uses them);
   ↑↓ move a skill within its own group */
const BOT_GROUPS = [['heal', 'ฟื้นฟู HP', 'Healing'], ['sp', 'ฟื้นฟู SP', 'SP'], ['buff', 'บัฟ · เรียกสัตว์', 'Buffs · summons'], ['atk', 'โจมตี', 'Attacks']];
function botTables(b){
  return BOT_GROUPS.map(([k, th, en]) => { const rows = b.list.filter(e => SKILLS[e.id] && botKind(SKILLS[e.id]) === k); if (!rows.length) return '';
    const up = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10l4-4 4 4"/></svg>', dn = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6l4 4 4-4"/></svg>';
    return `<table class="atab atab-${k}"><caption><em class="ak ak-${k}">${L(th, en)}</em> <small>${rows.filter(e => e.on).length}/${rows.length}</small></caption>
      <thead><tr><th class="c-n">#</th><th class="c-on">${L('ใช้', 'On')}</th><th class="c-sk">${L('สกิล', 'Skill')}</th><th class="c-lv">Lv</th><th class="c-sp">SP</th><th class="c-or">${L('ลำดับ', 'Order')}</th></tr></thead>
      <tbody>${rows.map((e, i) => { const sk = SKILLS[e.id];
        return `<tr class="${e.on ? '' : 'off'}"><td class="c-n">${i + 1}</td><td class="c-on"><label class="achk"><input type="checkbox" data-aon="${e.id}" ${e.on ? 'checked' : ''}><i class="sw"></i></label></td>
          <td class="c-sk"><span class="aico">${skillIcon(e.id)}</span><b>${skName(sk)}</b></td><td class="c-lv">${skl(e.id)}</td><td class="c-sp">${sk.sp(skl(e.id))}</td>
          <td class="c-or"><button class="ibtn" data-agmove="${e.id}" data-d="-1" ${i ? '' : 'disabled'} aria-label="${L('เลื่อนขึ้น', 'Move up')}">${up}</button><button class="ibtn" data-agmove="${e.id}" data-d="1" ${i < rows.length - 1 ? '' : 'disabled'} aria-label="${L('เลื่อนลง', 'Move down')}">${dn}</button></td></tr>`; }).join('')}</tbody></table>`; }).join('');
}
document.addEventListener('click', e => { const t = e.target.closest && e.target.closest('[data-agmove]'); if (!t || t.disabled) return;
  const b = botSet(), id = t.dataset.agmove, d = +t.dataset.d, i = b.list.findIndex(x => x.id === id); if (i < 0) return; const k = botKind(SKILLS[id]);
  for (let j = i + d; j >= 0 && j < b.list.length; j += d) if (SKILLS[b.list[j].id] && botKind(SKILLS[b.list[j].id]) === k){ [b.list[i], b.list[j]] = [b.list[j], b.list[i]]; break; }
  dirty = true; renderAuto(); });
{ const st = document.createElement('style'); st.textContent = `
#pane-auto .atab{width:100%;border-collapse:separate;border-spacing:0;margin:6px 0 10px;background:#fffaf0;border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1.5px #e3c486;font-size:13px}
#pane-auto .atab caption{text-align:left;padding:2px 2px 5px;font-weight:800}#pane-auto .atab caption small{color:#8a6a3a;font-weight:700}
#pane-auto .atab th{background:linear-gradient(#f6e2b4,#ecd096);color:#5a3a10;font-size:11px;font-weight:800;padding:5px 6px;text-align:center;white-space:nowrap}
#pane-auto .atab td{padding:4px 6px;border-top:1px solid rgba(201,154,58,.25);text-align:center;vertical-align:middle;color:#3a2206}
#pane-auto .atab tbody tr:nth-child(even) td{background:rgba(246,226,180,.28)}
#pane-auto .atab tr.off td{opacity:.55}#pane-auto .atab tr.off td.c-on{opacity:1}
#pane-auto .atab .c-n{width:26px;color:#8a6a3a;font-weight:800}#pane-auto .atab .c-on{width:52px}#pane-auto .atab .c-lv,#pane-auto .atab .c-sp{width:44px;font-variant-numeric:tabular-nums}
#pane-auto .atab td.c-sk{text-align:left}#pane-auto .atab td.c-sk b{font-weight:700;vertical-align:middle}
#pane-auto .atab .aico{display:inline-block;width:26px;height:26px;vertical-align:middle;margin-right:6px}#pane-auto .atab .aico svg{width:100%;height:100%}
#pane-auto .atab .c-or{width:72px;white-space:nowrap}#pane-auto .atab .c-or .ibtn{display:inline-grid}#pane-auto .atab .c-or .ibtn{width:28px;height:28px}
#pane-auto .atab .achk{display:inline-flex}`; document.head.appendChild(st); }
function renderAuto(){
  if (typeof PHI_WIDE !== 'undefined' && !PHI_WIDE.includes('auto')) PHI_WIDE.push('auto');   // (v274) the standard wide window (phi237.js): room for the table
  const pane = document.getElementById('pane-auto'); if (!pane) return;
  const b = botSet();
  const row = (e, i) => { const sk = SKILLS[e.id], k = botKind(sk);
    return `<div class="arow ${e.on ? '' : 'off'}"><label class="achk"><input type="checkbox" data-aon="${e.id}" ${e.on ? 'checked' : ''}><i class="sw"></i></label>
      <span class="anm"><b>${skName(sk)}</b><small><em class="ak ak-${k}">${L(...BOT_KIND[k])}</em> Lv ${skl(e.id)} · SP ${sk.sp(skl(e.id))}</small></span>
      <span class="aord"><button class="ibtn" data-aup="${i}" ${i ? '' : 'disabled'} aria-label="${L('เลื่อนขึ้น', 'Move up')}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 10l4-4 4 4"/></svg></button><button class="ibtn" data-adn="${i}" ${i < b.list.length - 1 ? '' : 'disabled'} aria-label="${L('เลื่อนลง', 'Move down')}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 6l4 4 4-4"/></svg></button></span></div>`; };
  const tg = (k, label, sub) => `<label class="set"><span><b>${label}</b><small>${sub}</small></span><input type="checkbox" data-aset="${k}" ${b[k] ? 'checked' : ''}><i class="sw"></i></label>`;
  const noAtk = !b.basic && !b.list.some(e => e.on && botKind(SKILLS[e.id]) === 'atk');
  pane.innerHTML = `
    <p class="astate ${BOT.on ? 'on' : ''}"><i></i>${BOT.on ? L('Auto กำลังทำงาน · ปรับค่าได้ทันที', 'Auto is running · changes apply right away') : L('Auto ปิดอยู่ · ตั้งค่าไว้ แล้วกดปุ่ม Auto (B) เพื่อเริ่ม', 'Auto is off · set it up, then press the Auto button (B)')}</p>
    <div class="sec">${L('การโจมตี', 'Attacks')}</div>
    ${tg('basic', L('โจมตีปกติ (Basic Attack)', 'Basic Attack'), L('ตีปกติระหว่างรอ Cooldown · ปิด = ใช้แต่สกิล', 'Swing between skills · off = skills only'))}
    ${tg('buff', L('ใช้ Buff อัตโนมัติ', 'Keep buffs up'), L('ร่าย Buff ที่ติ๊กไว้เมื่อหมดเวลา', 'Recast ticked buffs when they run out'))}
    <label class="set"><span><b>${L('ใช้สกิลฟื้นเมื่อ HP ต่ำกว่า', 'Heal skills below HP')}</b><small id="a-heal-v">${b.heal}%</small></span><input type="range" data-arng="heal" min="20" max="95" step="5" value="${b.heal}"></label>
    <label class="set"><span><b>${L('เก็บ SP สำรองไว้', 'Keep SP in reserve')}</b><small id="a-spKeep-v">${b.spKeep}%</small></span><input type="range" data-arng="spKeep" min="0" max="60" step="5" value="${b.spKeep}"></label>
    ${tg('avoidBoss', L('ไม่ตีบอส · หลบหนี', 'Skip bosses · flee'), L('ไม่ตีบอส ไม่เข้าใกล้ ถ้าบอสไล่ตามจะวิ่งกลับเขตปลอดภัยแล้วค่อยฟาร์มต่อ', 'Never fights bosses and keeps away; if one hunts you, runs to the safe zone, then farms again'))}
    ${tg('autoStat', L('อัปสเตตัสให้อัตโนมัติ', 'Spend stat points for me'), L('ระหว่างเปิด Auto ใช้แต้มสเตตัสที่เหลือกับสเตตัสหลักของอาชีพ (ปิดไว้ถ้าอยากอัปเอง)', 'While Auto is on, spend leftover stat points on your class\'s main stats (leave off to spend them yourself)'))}
    <div class="sec">${L('กินยาอัตโนมัติ', 'Potions')}</div>
    ${tg('potHpOn', L('กินยา HP อัตโนมัติ', 'Drink HP potions'), L('ใช้ยาแดง/ส้ม/ขาว/อีลิกเซอร์ที่ดีที่สุดในกระเป๋า', 'Uses the best red/orange/white/elixir in your bag'))}
    ${tg('autoBuy', L('ซื้อยาเองในเมือง', 'Buy potions in town'), L('ยาเหลือไม่ถึง 10 ขวด Auto ไปซื้อที่ป้าบัวคำ (ใช้เงินไม่เกิน 30%)', 'Under 10 potions: Auto buys from Auntie Buakham (at most 30% of your money)'))}
    ${b.potHpOn ? `<label class="set"><span><b>${L('กินยา HP เมื่อต่ำกว่า', 'Drink below HP')}</b><small id="a-potHp-v">${b.potHp}%</small></span><input type="range" data-arng="potHp" min="10" max="90" step="5" value="${b.potHp}"></label>` : ''}
    ${tg('potSpOn', L('กินยา SP อัตโนมัติ', 'Drink SP potions'), L('ใช้ยาฟ้าที่ดีที่สุดในกระเป๋า', 'Uses the best blue potion in your bag'))}
    ${b.potSpOn ? `<label class="set"><span><b>${L('กินยา SP เมื่อต่ำกว่า', 'Drink below SP')}</b><small id="a-potSp-v">${b.potSp}%</small></span><input type="range" data-arng="potSp" min="5" max="90" step="5" value="${b.potSp}"></label>` : ''}
    <div class="sec">${L('นั่งพัก', 'Resting')}</div>
    ${tg('sit', L('นั่งพักอัตโนมัติ', 'Auto sit'), L('นั่งฟื้นตัวเมื่อไม่มีมอนรอบตัว จนกว่า HP 75% (นานสุด 12 วิ)', 'Sit to recover when no monster is near, until 75% HP (12 s at most)'))}
    ${b.sit ? `<label class="set"><span><b>${L('นั่งเมื่อ HP ต่ำกว่า', 'Sit below HP')}</b><small id="a-sitHp-v">${b.sitHp}%</small></span><input type="range" data-arng="sitHp" min="10" max="90" step="5" value="${b.sitHp}"></label>
    <label class="set"><span><b>${L('นั่งเมื่อ SP ต่ำกว่า', 'Sit below SP')}</b><small id="a-sitSp-v">${b.sitSp}%</small></span><input type="range" data-arng="sitSp" min="0" max="90" step="5" value="${b.sitSp}"></label>` : ''}
    <div class="sec">${L('ชุดสกิล · เรียงตามลำดับที่ใช้', 'Skill set · used top to bottom')}</div>
    ${noAtk ? `<p class="awarn">${L('ยังไม่ได้ติ๊กสกิลโจมตี และปิดตีปกติ — Auto จะตีปกติแทน', 'No attack skill ticked and Basic Attack is off — Auto will swing normally')}</p>` : ''}
    ${b.list.length ? botTables(b) : `<p class="empty">${L('ยังไม่มีสกิลกดใช้ · ลงแต้มในหน้าต่างสกิล (S) ก่อน', 'No active skills yet · learn some in the Skill window (S)')}</p>`}
    <p class="hint">${L('Auto ฟื้นก่อน → Buff → สกิลโจมตีตัวแรกที่พร้อม', 'Auto heals first → buffs → the first ready attack skill')}</p>
    <p class="hint">${L('เปิด/ปิด Auto ที่ปุ่ม Auto บนแถบล่าง (B)', 'Turn Auto on/off with the Auto button on the bar (B)')}</p>`;
}
document.addEventListener('change', e => {
  const t = e.target, b = S.bot; if (!b || !t.closest || !t.closest('#pane-auto')) return;
  if (t.dataset.aon){ const x = b.list.find(v => v.id === t.dataset.aon); if (x) x.on = t.checked; }
  else if (t.dataset.aset) b[t.dataset.aset] = t.checked;
  else if (t.dataset.arng) b[t.dataset.arng] = +t.value;
  dirty = true; renderAuto();
});
document.addEventListener('input', e => { const t = e.target; if (!t.dataset || !t.dataset.arng) return; const v = document.getElementById(`a-${t.dataset.arng}-v`); if (v) v.textContent = t.value + '%'; });
document.addEventListener('click', e => {
  const t = e.target.closest('[data-aup],[data-adn],[data-atoggle],[data-openauto]'); if (!t) return;
  if (t.dataset.openauto){ openWin('auto'); return; }
  if (t.dataset.atoggle){ const on = !BOT.on; setBot(on); if (on) closeWin('auto'); else renderAuto(); return; }
  const b = botSet(), i = +(t.dataset.aup ?? t.dataset.adn), j = t.dataset.aup != null ? i - 1 : i + 1;
  if (j < 0 || j >= b.list.length) return;
  [b.list[i], b.list[j]] = [b.list[j], b.list[i]]; dirty = true; renderAuto();
});
