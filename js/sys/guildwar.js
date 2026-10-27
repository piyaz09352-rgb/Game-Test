/* VAYRATHEN — js/sys/guildwar.js — (v85) guild-vs-guild fighting in the castle siege, war skills and guild skills
   · During the siege (Sat/Sun 20:00–20:30, Khmer Sanctuary) heroes of OTHER guilds can be tapped and attacked like a
     duel target: 60% damage, damage reduction counts (max 40%). A fallen hero is not killed: they wake at the map's
     warp stone with 40% HP and 3 s of protection, and the guild that felled them scores siege points.
   · War skills (one per class line, from the 3rd job; stronger at the 4th) — a ⚔ button by the hotbar while you are in
     the siege or a training siege:
       Blade  · Shield Wall      you −50% damage, guildmates within 120 −30%, 5 s (4th: +30% crystal damage 8 s)
       Rune   · Spell Seal       a circle at your target: enemies inside cannot use skills 3 s (4th: wider, 4 s)
       Ranger · Medic Hunter     a long shot ×3 ATK, ×1.5 more on a caster (4th: breaks the cast, reveals the hidden)
       Muay   · Into the Ring    drag one enemy to you; they cannot leave a small ring 4 s (4th: 5 s)
       Healer · Battle Incense   a circle where your guild shakes off stuns 4 s (4th: + 3% HP a second, 5 s)
       Rogue  · Cut the Supply   the target cannot drink potions and heals half for 5 s (4th: 7 s)
       Summon · Gate Guardian    a Singha guardian for 15 s that pulls enemies onto itself
     Against monsters (training siege, guardians) they work too: the seal stuns, the shot and the cut hit hard.
   · Guild skills (the guild leader, while in a siege): Rally (guildmates on the map come to you), War Banner
     (+15% ATK, +15% DEF for 60 s), Army Revival (60 s: guildmates who fall get back up where they stand).
   Everything travels as room events ('gwp'); the receiver checks the siege, the map and the guilds, and clamps every
   number. Nothing here runs per frame except a light check of a few buffs. */
'use strict';

const GW = {cd:0, gcd:{}, ui:0, kos:0, zones:[]};
const GW_LINE = {blade:'wall', rune:'seal', ranger:'snipe', muay:'ring', healer:'incense', rogue:'cut', summoner:'gate'};
const GW_SK = {
  wall:{th:'กำแพงโล่', en:'Shield Wall', cd:30, sp:30, ic:'🛡'}, seal:{th:'ผนึกเวท', en:'Spell Seal', cd:28, sp:40, ic:'✴'},
  snipe:{th:'ศรสังหารหมอ', en:'Medic Hunter', cd:14, sp:30, ic:'➹'}, ring:{th:'ลากเข้าสังเวียน', en:'Into the Ring', cd:24, sp:30, ic:'⛓'},
  incense:{th:'กำยานสนามรบ', en:'Battle Incense', cd:30, sp:40, ic:'♨'}, cut:{th:'ตัดเสบียง', en:'Cut the Supply', cd:20, sp:25, ic:'✂'},
  gate:{th:'อัญเชิญทวารบาล', en:'Gate Guardian', cd:40, sp:50, ic:'⛩'}
};
const GW_GSK = {rally:{th:'เรียกรวมพล', en:'Rally', cd:120}, banner:{th:'ธงชัย', en:'War Banner', cd:180}, army:{th:'ฟื้นฟูกองทัพ', en:'Army Revival', cd:300}};
const gwTier = () => (JOBS[S.job] || {}).tier || 1;
const gwSkill = () => { if (gwTier() < 3) return null; const ch = jobChain(); for (const j of ch) if (GW_LINE[j]) return GW_LINE[j]; return null; };
const gwLv = () => gwTier() >= 4 ? 2 : 1;
const gwPrac = () => !!(typeof SG !== 'undefined' && SG.prac && SG.prac.map === MAP_ID);
const gwLive = () => typeof siegeLive === 'function' && siegeLive() && MAP_ID === SIEGE_MAP;   // fighting other guilds
const gwOn = () => gwLive() || gwPrac();                                                        // war skills usable
const gwMyG = () => (S.guild && S.guild.name) || '';
const gwLead = () => !!(S.guild && (S.guild.leader || (NET.uid && typeof GUI !== 'undefined' && GUI.leader === NET.uid)));
function gwFoe(gh){ const q = (gh && gh.q) || {}; return gwLive() && !!gwMyG() && !!q.gn && clean(q.gn, 24) !== gwMyG() && !q.dead; }
function gwEmit(k, extra = {}){ if (NET.room && NET.on) NET.room.emit('gwp', {k, n:netName(), g:gwMyG(), m:MAP_ID, ...extra}).catch(() => {}); }

/* an enemy hero as a light target that follows their ghost (like a duel opponent) */
function gwProxy(peer){
  const gh = NET.ghosts && [...NET.ghosts.values()].find(g => g.peer === peer); if (!gh) return null; const q = gh.q || {}, pv = String(q.pv || '').split(',').map(Number);
  const def = {name:clean(q.n, 18) || L('ศัตรู', 'Enemy'), en:clean(q.n, 18) || 'Enemy', lvl:clamp(q.l | 0, 1, 300), def:clamp(pv[0] | 0, 0, 3000), mdef:clamp(pv[1] | 0, 0, 3000), r:12, size:'m', elem:'neutral', race:'human', defPct:0, boss:false, aggro:false, hp:1e9, exp:0, jexp:0, drops:[]};
  return {pvp:true, gw:true, peer, type:'__pvp', def, hp:1e9, maxhp:1e9, get dead(){ return !gwFoe(gh) || !NET.ghosts.has(gh.peer); }, set dead(v){}, get x(){ return gh.x; }, get y(){ return gh.y; }, st:{}, dir:0, atkT:9, flash:0, hurtT:0, zone:MAPZ, q};
}
const gwNearFoe = (r = 340) => { let best = null, bd = r; if (NET.ghosts) for (const gh of NET.ghosts.values()){ if (!gwFoe(gh)) continue; const d = Math.hypot(gh.x - P.x, gh.y - P.y); if (d < bd){ bd = d; best = gh; } } return best; };
{ const _pm = playerMenu; playerMenu = function(gh){ if (gwFoe(gh)){ const t = gwProxy(gh.peer); if (t){ P.target = t; P.npc = null; return; } } _pm(gh); }; }
/* hitting an enemy hero: 60% damage travels to them */
{ const _pd = pvpDeal; pvpDeal = function(t, res, sk){ if (!t || !t.gw) return _pd(t, res, sk);
    const y = t.y - 56; if (res.miss){ addText(t.x, y, 'Miss', '#cfcfcf'); return; }
    const dmg = Math.max(1, Math.round(res.dmg * .6)); addText(t.x + rand(-8, 8), y, String(dmg) + (res.crit ? '!' : ''), res.crit ? '#ffd56a' : '#ffb0e0', res.crit ? 20 : 16);
    SFX.hit(JOBS[S.job].weapon.type); gwEmit('hit', {to:t.peer, d:dmg, c:res.crit ? 1 : 0}); }; }

/* ---------- receiving ---------- */
function gwFall(by){
  const army = P.buffs.gw_army;
  if (!army){ const k = NPCS.find(n => n.id === 'warp'); if (k){ P.x = k.x + 30; P.y = k.y + 50; pushOut(P, 12); } }
  S.hp = Math.round(DER.maxhp * (army ? .6 : .4)); P.target = null; P.cast = null; P.tx = null;
  gwBuff('gw_safe', {t:3, invuln:1}); delete P.buffs.gw_ring; VFX.play('jobChange', {x:P.x, y:P.y});
  banner(army ? L('ฟื้นฟูกองทัพ! ลุกขึ้นสู้ต่อ', 'Army Revival! Back on your feet') : L(`ถูก ${by} ล้ม · กลับมาที่จุดวาร์ป`, `Felled by ${by} · back at the warp stone`));
}
function onGwp(msg){
  const d = msg.data || {}; if (msg.isMe || !S || !S.lvl) return; const who = clean(d.n, 18) || L('นักผจญภัย', 'Adventurer'), g = clean(d.g, 24), same = !!g && g === gwMyG(), here = (d.m | 0) === MAP_ID;
  // guild skills from my own leader
  if (d.k === 'gsk' && same && here && gwOn()){
    if (d.id === 'banner'){ gwBuff('gw_banner', {t:60, atkPct:.15, def:Math.round(DER.def * .15)}); toast(L(`${who} ชูธงชัย! ATK/DEF +15%`, `${who} raised the War Banner! ATK/DEF +15%`)); }
    else if (d.id === 'army'){ gwBuff('gw_army', {t:60}); toast(L(`${who} ใช้ฟื้นฟูกองทัพ`, `${who} used Army Revival`)); }
    else if (d.id === 'rally') sysPrompt(L(`${who} เรียกรวมพล · ไปหาหัวหน้ากิลด์ไหม?`, `${who} calls a Rally · go to your leader?`), () => { P.x = clamp(+d.x || P.x, 20, W - 20) + rand(-30, 30); P.y = clamp(+d.y || P.y, 30, H - 20) + rand(-20, 20); pushOut(P, 12); VFX.play('jobChange', {x:P.x, y:P.y}); }, () => {});
    return; }
  // a guildmate's war skill that helps me
  if (same && here && gwOn()){
    const near = Math.hypot((+d.x || 0) - P.x, (+d.y || 0) - P.y) < clamp(+d.r || 0, 0, 160);
    if (d.k === 'wall' && near) gwBuff('gw_wall2', {t:5, dmgRed:.3});
    if (d.k === 'zone'){ GW.zones.push({x:+d.x, y:+d.y, r:clamp(+d.r || 0, 0, 160), t:clamp(+d.t || 0, 0, 6), heal:!!d.h, mine:true}); }
    return; }
  // from an enemy guild during the war
  if (!gwLive() || !here || !g || same || !gwMyG()) return;
  if (d.k === 'seal' && Math.hypot((+d.x || 0) - P.x, (+d.y || 0) - P.y) < clamp(+d.r || 0, 0, 160)){ gwBuff('gw_seal', {t:clamp(+d.t || 3, 0, 4)}); toast(L('ถูกผนึกเวท ใช้สกิลไม่ได้ชั่วครู่', 'Spell-sealed: no skills for a moment')); return; }
  if (d.to !== myPeer()) return;
  if (d.k === 'hit'){ if (P.buffs.gw_safe) return; const dmg = Math.round(clamp(d.d | 0, 0, Math.max(1, DER.maxhp)) * (1 - Math.min(.4, typeof clRed === 'function' ? clRed() : 0)));
    S.hp -= dmg; P.hurt = .25; SFX.play('hurt'); addText(P.x, P.y - 48, String(dmg), '#ff8a80', d.c ? 20 : 16);
    if (S.hp <= 0){ gwEmit('ko', {to:msg.peer}); gwFall(who); } return; }
  if (d.k === 'ko'){ GW.kos++; if (typeof SG !== 'undefined') SG.my += 900; bump('gwkos'); banner(L(`⚔ ล้ม ${who} ได้! +แต้มกิลด์`, `⚔ Felled ${who}! +guild points`)); SFX.play('crit'); return; }
  if (d.k === 'break'){ if (P.cast){ P.cast = null; toast(L('การร่ายถูกขัด!', 'Your cast was broken!')); } for (const k in P.buffs) if (P.buffs[k].stealth) delete P.buffs[k]; return; }
  if (d.k === 'ring'){ P.x = clamp(+d.x || P.x, 20, W - 20); P.y = clamp(+d.y || P.y, 30, H - 20); pushOut(P, 12); P.tx = null; gwBuff('gw_ring', {t:clamp(+d.t || 4, 0, 5), cx:P.x, cy:P.y}); toast(L(`${who} ลากคุณเข้าสังเวียน!`, `${who} dragged you into the ring!`)); return; }
  if (d.k === 'cut'){ gwBuff('gw_cut', {t:clamp(+d.t || 5, 0, 7)}); toast(L('ถูกตัดเสบียง: ใช้ยาไม่ได้ ฟื้นเลือดครึ่งเดียว', 'Supply cut: no potions, half healing')); return; }
}
EV.on('netready', () => { if (NET.room) NET.room.on('gwp', onGwp, () => {}); });

/* sealed: no skills · cut: no potions, half healing · ring: stay put · incense zones: shake off stuns */
{ const _ts = trySkill; trySkill = function(id){ if (P.buffs.gw_seal){ toast(L('ถูกผนึกเวทอยู่', 'You are spell-sealed')); return; } return _ts(id); }; }
{ const _ui = useItem; useItem = function(id){ const it = ITEMS[id]; if (P.buffs.gw_cut && it && it.heal){ toast(L('ถูกตัดเสบียง ใช้ยาไม่ได้', 'Supply cut: no potions')); return; } return _ui(id); }; }
{ let hp0 = null; EV.on('tick', dt => {
    if (P.buffs.gw_cut && hp0 != null && S.hp > hp0) S.hp = Math.round(hp0 + (S.hp - hp0) / 2); hp0 = S.hp;
    const rg = P.buffs.gw_ring; if (rg){ const dx = P.x - rg.cx, dy = P.y - rg.cy, d = Math.hypot(dx, dy); if (d > 60){ P.x = rg.cx + dx / d * 60; P.y = rg.cy + dy / d * 60; } }
    if (GW.zones.length){ for (const z of GW.zones){ z.t -= dt; if (Math.hypot(z.x - P.x, z.y - P.y) < z.r){ if (P.stunT > 0) P.stunT = 0; if (z.heal){ z.ht = (z.ht || 0) + dt; if (z.ht >= 1){ z.ht = 0; S.hp = Math.min(DER.maxhp, S.hp + Math.round(DER.maxhp * .03)); } } } }
      GW.zones = GW.zones.filter(z => z.t > 0); }
    if (GW.cd > 0) GW.cd -= dt;
    if ((GW.ui -= dt) <= 0){ GW.ui = .5; gwHud(); }
  }); }
/* Shield Wall's crystal bonus (4th job) */
HK.outMul.push((mult, elem, kind, m) => (P.buffs.gw_crys && m && m.type === 'crowncrystal' ? mult * 1.3 : mult));

/* ---------- casting a war skill ---------- */
function gwCast(){
  const id = gwSkill(); if (!id) return toast(L('สกิลสงครามเปิดเมื่อเปลี่ยนเป็นอาชีพขั้นที่ 3', 'War skills open at your 3rd job'));
  if (!gwOn()) return toast(L('ใช้ได้ในสงครามปราสาทหรือการฝึกซ้อมสงคราม', 'Only in the castle siege or a training siege'));
  const sk = GW_SK[id], lv = gwLv(); if (GW.cd > 0) return toast(L(`${sk.th} ยังติด Cooldown`, `${sk.en} is on cooldown`));
  if (P.dead || P.stunT > 0 || P.buffs.gw_seal) return; if (S.sp < sk.sp) return toast(L('SP ไม่พอ', 'Not enough SP'));
  const t = P.target && !P.target.dead ? P.target : null, foe = t && t.gw ? t : (() => { const gh = gwNearFoe(); return gh ? gwProxy(gh.peer) : null; })();
  const mob = t && !t.gw && !t.pvp ? t : null, atk = Math.max(DER.atk || 0, DER.matk || 0);
  const need = id === 'snipe' || id === 'ring' || id === 'cut'; if (need && !foe && !mob) return toast(L('เลือกเป้าหมายก่อน', 'Pick a target first'));
  S.sp -= sk.sp; GW.cd = sk.cd; P.act = 'skill'; SFX.play('jobUp');
  if (id === 'wall'){ gwBuff('gw_wall', {t:5, dmgRed:.5}); if (lv > 1) gwBuff('gw_crys', {t:8}); gwEmit('wall', {x:P.x, y:P.y, r:120}); VFX.play('goldshield', {x:P.x, y:P.y}); }
  else if (id === 'seal'){ const c = foe || mob || P, r = lv > 1 ? 120 : 90, tt = lv > 1 ? 4 : 3; gwEmit('seal', {x:c.x, y:c.y, r, t:tt}); VFX.play('warnCircle', {x:c.x, y:c.y, r, t:.6});
    for (const m of mobs) if (!m.dead && !m.def.boss && Math.hypot(m.x - c.x, m.y - c.y) < r){ m.st = m.st || {}; m.st.stun = Math.max(m.st.stun || 0, 1.5); } }
  else if (id === 'snipe'){ const tg = foe || mob, cast = foe && foe.q && foe.q.a === 'cast'; applyDamage(tg, {dmg:Math.round(atk * 3 * (cast ? 1.5 : 1)), crit:cast});
    if (lv > 1 && foe) gwEmit('break', {to:foe.peer}); VFX.play('critBurst', {x:tg.x, y:tg.y - 30}); }
  else if (id === 'ring'){ const tg = foe || mob, fx = P.x + (P.face || 1) * 28; if (foe) gwEmit('ring', {to:foe.peer, x:fx, y:P.y, t:lv > 1 ? 5 : 4}); else { tg.x = fx; tg.y = P.y; tg.aggro = true; }
    gwBuff('gw_ring', {t:lv > 1 ? 5 : 4, cx:P.x, cy:P.y}); VFX.play('provoke', {m:tg}); }
  else if (id === 'incense'){ const r = 110, tt = lv > 1 ? 5 : 4; GW.zones.push({x:P.x, y:P.y, r, t:tt, heal:lv > 1}); gwEmit('zone', {x:P.x, y:P.y, r, t:tt, h:lv > 1 ? 1 : 0}); VFX.play('heal', {x:P.x, y:P.y}); }
  else if (id === 'cut'){ const tg = foe || mob; if (foe) gwEmit('cut', {to:foe.peer, t:lv > 1 ? 7 : 5}); applyDamage(tg, {dmg:Math.round(atk * (foe ? 1.2 : 2.2))}); }
  else if (id === 'gate'){ const base = SKILLS.callsingha; if (base){ const s = {...base, dur:() => 15}; conjure(s, Math.max(1, skl('callsingha') || 3)); } }
  addText(P.x, P.y - 70, `${sk.ic} ${L(sk.th, sk.en)}`, '#ffe7a0', 18); gwHud();
}
function gwGuild(id){
  const g = GW_GSK[id]; if (!g || !gwLead() || !gwOn()) return; const left = (GW.gcd[id] || 0) - T; if (left > 0) return toast(L(`${g.th} ใช้ได้อีกใน ${Math.ceil(left)} วิ`, `${g.en} ready in ${Math.ceil(left)} s`));
  GW.gcd[id] = T + g.cd; gwEmit('gsk', {id, x:P.x, y:P.y});
  if (id === 'banner') gwBuff('gw_banner', {t:60, atkPct:.15, def:Math.round(DER.def * .15)}); if (id === 'army') gwBuff('gw_army', {t:60});
  banner(L(`⚜ ${g.th}!`, `⚜ ${g.en}!`)); SFX.play('wbhorn'); gwHud();
}

/* ---------- the buttons (redrawn twice a second, only while they show) ---------- */
function gwHud(){
  const show = gwOn() && !!gwSkill(), lead = gwOn() && gwLead(); let b = el('gwBar');
  if (!show && !lead){ if (b) b.hidden = true; return; }
  if (!b){ el('ui').insertAdjacentHTML('beforeend', '<div id="gwBar" class="gwbar"></div>'); b = el('gwBar'); }
  b.hidden = false; const id = gwSkill(), sk = id && GW_SK[id];
  const h = (show ? `<button class="gwb main" data-gw="cast">${sk.ic}<b>${L(sk.th, sk.en)}</b>${GW.cd > 0 ? `<i>${Math.ceil(GW.cd)}</i>` : ''}</button>` : '')
    + (lead ? Object.entries(GW_GSK).map(([k, g]) => { const l = Math.ceil((GW.gcd[k] || 0) - T); return `<button class="gwb" data-gw="${k}">⚜<b>${L(g.th, g.en)}</b>${l > 0 ? `<i>${l}</i>` : ''}</button>`; }).join('') : '');
  if (b._h !== h){ b._h = h; b.innerHTML = h; }
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-gw]'); if (!b) return; e.stopPropagation(); const k = b.dataset.gw; if (k === 'cast') gwCast(); else gwGuild(k); }, true);
/* buff names on the buff bar (gw_ buffs carry their own name) */
const GW_BN = () => ({gw_wall:L('กำแพงโล่', 'Shield Wall'), gw_wall2:L('กำแพงโล่จากเพื่อน', 'Shield Wall (ally)'), gw_seal:L('ถูกผนึกเวท: ใช้สกิลไม่ได้', 'Spell-sealed: no skills'), gw_cut:L('ถูกตัดเสบียง: ใช้ยาไม่ได้', 'Supply cut: no potions'), gw_ring:L('อยู่ในสังเวียน', 'In the ring'), gw_banner:L('ธงชัย', 'War Banner'), gw_army:L('ฟื้นฟูกองทัพ', 'Army Revival'), gw_safe:L('ป้องกันหลังฟื้น', 'Revival guard'), gw_crys:L('ตีผลึก +30%', 'Crystal damage +30%')});
function gwBuff(id, o){ addBuff(id, {...o, gwn:id}); }
{ const _be = buffEffect; buffEffect = function(b){ const s = _be.apply(this, arguments); if (!b || !b.gwn) return s; const n = GW_BN()[b.gwn]; return [n, s].filter(Boolean).join(' · '); }; }
