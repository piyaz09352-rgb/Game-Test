/* VAYRATHEN — js/sys/autoquest220.js — (v220) Auto quests: Auto plays the story through to the end
   The owner asked for an Auto that does the quests all the way. With «ออโต้เควสต์» on (quest window, or the Auto
   window's chip), Auto follows the quest being guided (or picks one: the map-story chapter in hand, else the main
   story, else the next map-story chapter your level allows) and each moment decides:
     travel — the goal is on another map: ride to the gate on the shortest way there (the gates carry you through)
     talk   — walk to the NPC and accept, or hand in, by itself (the lines go to the log)
     spot   — walk onto the glowing spots of a find step
     elite  — go to the named monster and fight it
     hunt   — fight only the monsters the step wants (or the one that drops the item), roaming to the nearest of them
   It still fights back when attacked, drinks potions, rests and steers clear of region bosses as usual. It stops,
   with a message, when the next chapter needs a higher level, or when the main story asks for a region boss (a fight
   for a party). Saved per character: S.aq = true/false. */
'use strict';

BOT_TH.quest = ['ทำเควสต์', 'Questing'];
const AQ = {plan:null, types:null, msg:'', lastMsg:0};
const aqOn = () => !!(S && S.aq);
function aqStop(th, en){ S.aq = false; dirty = true; if (T - AQ.lastMsg > 2){ AQ.lastMsg = T; toast(L(`ออโต้เควสต์หยุด: ${th}`, `Auto quest stopped: ${en}`)); log(L(`ออโต้เควสต์หยุด: ${th}`, `Auto quest stopped: ${en}`), 'g'); } if (typeof renderBotChip === 'function') renderBotChip(); }
/* which story to follow */
function aqTrack(){
  const s = msS(), g = qgS();
  if (s.cur) return {kind:'arc', id:(msArcOf(s.cur.map) || {}).id};
  if (g && g.kind === 'arc'){ const a = MS_ARCS.find(x => x.id === g.id), nx = a && a.maps.find(m => !s.done[m]); if (nx != null && msLvOk(nx)) return g; }
  if (g && g.kind === 'main' && curMain()) return g;
  const q = qState(); if (q.active || (curMain() && S.lvl >= curMain().lv - 2)) return {kind:'main'};
  for (const a of MS_ARCS){ const nx = a.maps.find(m => !s.done[m]); if (nx != null && msLvOk(nx)) return {kind:'arc', id:a.id}; }
  return null;
}
/* the monster that drops an item on this map */
function aqSource(item, map){ const mp = MAPS[map]; if (!mp) return null; if (item === 'jelly') return 'dewblob';
  return mp.mobs.find(k => MOB[k] && (MOB[k].drops || []).some(d => d[0] === item)) || (item.startsWith('m_') && MOB[item.slice(2)] ? item.slice(2) : null); }
/* (v220) a map-story step that needs a night monster (Aren's lanterns, their wicks) would otherwise wait for real-time
   night: while the step is in hand on its map, that monster comes out by day too */
function msDayWant(type){ const c = S && S.ms && S.ms.cur; if (!c || c.map !== MAP_ID) return false; const st = msStep(); if (!st || msReady()) return false;
  return st.k === 'kill' ? st.t === type : st.k === 'item' ? aqSource(st.t, c.map) === type : false; }
/* what to do now */
function aqPlan(){
  const tr = aqTrack(); if (!tr) return {mode:'stop', th:'ไม่มีเควสต์ที่ทำได้ตอนนี้ (ลองเพิ่มเลเวล)', en:'no quest you can do right now (level up a little)'};
  const p = aqPlanFor(tr); if (p.mode !== 'stop' || tr.kind !== 'main') return p;
  // the main story waits (a region boss, a higher level): carry on with a side-story chapter your level allows
  const s = msS(); for (const a of MS_ARCS){ const nx = a.maps.find(m => !s.done[m]); if (nx != null && msLvOk(nx)){ const p2 = aqPlanFor({kind:'arc', id:a.id}); if (p2.mode !== 'stop') return p2; } }
  return p;
}
function aqPlanFor(tr){
  if (!qgS() || qgS().kind !== tr.kind || qgS().id !== tr.id) S.guide = tr;   // the arrow follows what Auto is doing
  if (tr.kind === 'main'){
    const q = qState(), Q = QUESTS.find(x => x.id === q.active) || curMain(); if (!Q) return {mode:'stop', th:'จบเนื้อเรื่องหลักแล้ว', en:'the main story is complete'};
    const giver = Q.giver === 'job' ? 'job' : 'warp';
    if (!q.active){ if (S.lvl < Q.lv - 2) return {mode:'stop', th:`บทต่อไปต้อง Lv ${Q.lv}`, en:`the next chapter needs Lv ${Q.lv}`}; return {mode:'talk', map:Q.map, npc:giver, act:() => questAccept(Q.id)}; }
    if (questReady(Q)) return {mode:'talk', map:Q.map, npc:giver, act:() => questTurnIn()};
    const g = Q.goals.find(x => goalNow(x) < x.n);
    if (g.k === 'boss') return {mode:'stop', th:`ต้องปราบบอส ${nm(MOB[g.t])} (แนะนำไปกับปาร์ตี้)`, en:`the boss ${nm(MOB[g.t])} must fall (bring a party)`};
    const t = g.k === 'item' ? aqSource(g.t, Q.map) : g.t; return {mode:'hunt', map:Q.map, types:t ? [t] : null, item:g.k === 'item' ? g.t : null};
  }
  const s = msS(), c = s.cur, arc = MS_ARCS.find(a => a.id === tr.id);
  if (!c){ const nx = arc.maps.find(m => !s.done[m]); if (nx == null) return {mode:'stop', th:'จบสายนี้แล้ว', en:'this road is complete'};
    if (!msLvOk(nx)) return {mode:'stop', th:`บทต่อไปต้อง Lv ${Math.max(1, msLv(nx) - 5)}`, en:`the next chapter needs Lv ${Math.max(1, msLv(nx) - 5)}`};
    return {mode:'talk', map:nx, npc:nx === arc.maps[0] ? arc.comp.id : MS_CH[nx].npc.id, act:() => msAccept(nx)}; }
  const st = msStep(), ch = MS_CH[c.map];
  if (msReady()) return {mode:'talk', map:c.map, npc:ch.npc.id, act:() => msHandIn()};
  if (st.k === 'find') return {mode:'spot', map:c.map};
  if (st.k === 'elite') return {mode:'elite', map:c.map, types:[st.t]};
  return {mode:'hunt', map:c.map, types:[st.k === 'item' ? aqSource(st.t, c.map) : st.t].filter(Boolean), item:st.k === 'item' ? st.t : null};
}
/* Auto picks only the step's monsters (anything attacking you still comes first) */
{ const _pt = pickTarget;
  pickTarget = function(){ if (!BOT.on || !aqOn() || !AQ.types || !AQ.types.length) return _pt.apply(this, arguments);
    const th = threats().filter(m => !BOT.skip.has(m)); if (th.length) return th.sort(tgtCmp)[0];
    if (AQ.plan && AQ.plan.mode === 'elite' && MS.eliteM && !MS.eliteM.dead) return MS.eliteM;
    return mobs.filter(m => !m.dead && !m.vanish && AQ.types.includes(m.type) && !BOT.skip.has(m) && !botShun(m) && dist(m, P) < BOT_CFG.seek * 1.6).sort(tgtCmp)[0] || null; }; }   // (v269) not one Auto keeps away from (by a gate): picking it again and again froze Auto
function aqGo(x, y){ if (P.sit){ P.sit = false; renderHotbar(); } BOT.resting = false; P.target = null; P.pending = null; BOT.roam = null; P.tx = x; P.ty = y;
  if (!P.ride && canRideNow() && Math.hypot(x - P.x, y - P.y) > 260 && !threats().length){ P.ride = true; renderHotbar(); } }
{ const _ub = updBot;
  updBot = function(dt){
    if (!BOT.on || !aqOn() || BOT.pause > 0 || P.dead || (typeof DG !== 'undefined' && DG.active)) { AQ.types = null; return _ub.apply(this, arguments); }
    AQ.tk = (AQ.tk || 0) - dt; if (AQ.tk <= 0){ AQ.tk = .3; try { AQ.plan = aqPlan(); } catch (e) { AQ.plan = null; } }
    const p = AQ.plan; if (!p){ AQ.types = null; return _ub.apply(this, arguments); }
    if (p.mode === 'stop'){ aqStop(p.th, p.en); AQ.types = null; return _ub.apply(this, arguments); }
    const low = S.hp / DER.maxhp < .45, fighting = threats().length > 0;
    // on the right map and hunting / fighting the elite: the usual Auto, narrowed to the step's monsters
    if (p.map === MAP_ID && (p.mode === 'hunt' || p.mode === 'elite')){ AQ.types = p.types;
      // Auto never picks things up on its own (there is no Auto Loot), but the quest's own item it walks over to and takes
      if (p.item && !fighting){ if (P.loot && P.loot.id === p.item && LOOT.includes(P.loot)) return;
        const l = LOOT.filter(q => q.id === p.item && Math.hypot(q.x - P.x, q.y - P.y) < 420).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
        if (l){ if (P.sit){ P.sit = false; renderHotbar(); } BOT.resting = false; P.target = null; P.pending = null; P.tx = null; P.loot = l; BOT.state = 'quest'; renderBotChip(); return; } }
      if (!P.target || P.target.dead){ const want = mobs.filter(m => !m.dead && p.types && p.types.includes(m.type) && !BOT.skip.has(m) && !botShun(m)).sort((a, b) => dist(a, P) - dist(b, P))[0] || (p.mode === 'elite' ? MS.elite : null);
        if (want && dist(want, P) > BOT_CFG.seek * 1.5 && !fighting){ BOT.roam = {x:want.x, y:want.y}; } }
      const r = _ub.apply(this, arguments); if (BOT.state === 'roam' || BOT.state === 'hunt') BOT.state = 'quest'; renderBotChip(); return r; }
    AQ.types = null;
    if (fighting || low || BOT.resting) return _ub.apply(this, arguments);   // fight back, drink, rest first
    BOT.think -= dt; if (BOT.think > 0) return; BOT.think = .25; closeDialog();
    BOT.state = 'quest';
    if (p.map !== MAP_ID){ const hop = qgNextHop(MAP_ID, p.map), gt = hop != null && GATES.find(x => x.to === hop);
      if (!gt){ aqStop('หาทางไปไม่เจอ', 'cannot find the way'); return; }
      // Auto normally never steps through a gate (botgate.js); on a quest trip it does, on purpose
      if (Math.hypot(P.x - gt.x, P.y - gt.y) < 30 && T >= (P.gateLock || 0) && !P.roll && !(P.capT > 0)){ P.tx = null; travel(gt.to, MAP_ID); AQ.tk = 0; return; }
      aqGo(gt.x, gt.y); renderBotChip(); return; }
    if (p.mode === 'talk'){ const n = NPCS.find(x => x.id === p.npc); if (!n){ aqStop('ไม่พบ NPC', 'NPC not found'); return; }
      if (Math.hypot(n.x - P.x, n.y - P.y) > 46){ aqGo(n.x, n.y + 30); renderBotChip(); return; }
      P.tx = null; P.ride = false; p.act(); AQ.tk = 0; renderBotChip(); return; }
    if (p.mode === 'spot'){ const c = msS().cur, left = MS.spots.map((q, i) => ({...q, i})).filter(q => !(c.found || []).includes(q.i)).sort((a, b) => Math.hypot(a.x - P.x, a.y - P.y) - Math.hypot(b.x - P.x, b.y - P.y))[0];
      if (left) aqGo(left.x, left.y); renderBotChip(); return; }
    return _ub.apply(this, arguments);
  }; }
/* the Auto chip says what the quest step is */
{ const _rc = renderBotChip; renderBotChip = function(){ const r = _rc.apply(this, arguments); try { const c = document.getElementById('botChip'); if (c && BOT.on && !(BOT.pause > 0) && aqOn() && AQ.plan && AQ.plan.mode !== 'stop'){ const g = qgGoal(), t = `Auto · 📖 ${g ? L(...g.label) : L(...BOT_TH.quest)}`; if (c.title !== t) c.title = t; const sp = c.querySelector('span'); if (sp && sp.textContent !== 'Auto 📖') sp.textContent = 'Auto 📖'; } } catch (e) {} return r; }; }
/* switches: in the quest window (and it turns Auto on) */
function aqHTML(){ const on = aqOn();
  return `<div class="qgauto${on ? ' on' : ''}"><div><b>📖 ${L('ออโต้เควสต์', 'Auto quest')}</b><small>${L('Auto เดินทาง คุยกับ NPC ล่า ตามหา และส่งเควสต์เองจนจบ (หยุดเองถ้าเลเวลไม่ถึงหรือต้องสู้บอสประจำแคว้น)', 'Auto travels, talks, hunts, searches and hands in by itself (stops if your level is too low or a region boss is needed)')}</small></div>
    <button class="btn${on ? '' : ' gold'}" data-aq="${on ? 0 : 1}">${on ? L('ปิด', 'Turn off') : L('เปิด', 'Turn on')}</button></div>`; }
{ const _rq = renderQuestLog; renderQuestLog = function(){ const r = _rq.apply(this, arguments); const pane = el('pane-quest'); if (pane){ const o = pane.querySelector('.qgauto'); if (o) o.remove(); pane.insertAdjacentHTML('afterbegin', aqHTML()); } return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-aq]'); if (!b) return; S.aq = b.dataset.aq === '1'; dirty = true; save();
  if (S.aq){ if (!BOT.on) setBot(true); toast(L('เปิดออโต้เควสต์แล้ว', 'Auto quest on')); } else toast(L('ปิดออโต้เควสต์แล้ว', 'Auto quest off'));
  if (typeof renderQuestLog === 'function') renderQuestLog(); renderBotChip(); });
{ const st = document.createElement('style'); st.textContent = `#pane-quest .qgauto{display:flex;align-items:center;gap:10px;justify-content:space-between;padding:8px 10px;margin:2px 0 8px;border-radius:12px;background:linear-gradient(#eef8ff,#dcefff);border:1px solid #9ac8f0}
  #pane-quest .qgauto.on{background:linear-gradient(#eaffef,#cff3da);border-color:#7ad09a}#pane-quest .qgauto b{display:block;color:#1a4a7a;font-size:14px}#pane-quest .qgauto.on b{color:#1a6a3a}#pane-quest .qgauto small{display:block;font-size:11px;color:#4a6a8a;line-height:1.3}`;
  document.head.appendChild(st); }
