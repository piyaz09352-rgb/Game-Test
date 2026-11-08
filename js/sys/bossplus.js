/* VAYRATHEN — js/sys/bossplus.js — bosses worth fearing (v27)
   · Crowd control does not work on a boss: stun, flinch/knockback, silence and holds (freeze, stop, root) slide off
     ("ต้าน CC"). Everything else sticks: poison, burn, slow (shorter, weaker), DEF/ATK down, taunt.
   · Strength grows with level: HP and hits climb in tiers (Lv 40 · 80 · 120 · 150 · 200). Every hit takes at least 4–8% of
     your Max HP (by phase), so no armour makes a boss harmless.
   · Every boss fights like what it is. Its nature (tiger, elephant, naga, bird, yaksha, ghost, golem, jelly …) gives it a
     kit of class-style moves on top of its own list: a yaksha whirls a Blade Storm and roars a War Cry, a tiger Pounces and
     Rends, a naga floods a Torrent, a bird calls a Feather Storm and a Gale, a ghost Shadow-Steps and casts bolts, a golem
     hurls Boulders behind its Stone Guard, a jelly Splits and leaves Acid … every one telegraphed, so you can dodge.
   · Its minions come stronger with its level (an elite among them from Lv 150).
   · CATACLYSMS (อภิมหาภัยพิบัติ): only bosses of Lv 150 and up, 2–4 each (more the higher they are), taken from the grand
     spells of the classes and bent to the boss: Solar Cataclysm, Great Deluge, Thunder Tempest, Earth Swallow,
     Heaven's Judgement, Abyssal Night. A huge red field marks it 2 s ahead; get out or roll through. One every 16 s at most.
   Telegraphs go to every player on the map (netboss.js), so a boss threatens the whole party. */
'use strict';

const BP = {
  tier:lv => (lv >= 200 ? [2.6, 1.65, 1.35] : lv >= 150 ? [2.3, 1.5, 1.25] : lv >= 120 ? [2.1, 1.4, 1.15] : lv >= 80 ? [2, 1.35, 1.1] : lv >= 40 ? [1.8, 1.3, 1.05] : [1.6, 1.25, 1]),   // [HP, hit, skill pace] · tuned with a solo simulation (v27h): ~1–3 min per boss at your level
  name:{bladestorm:['พายุคมดาบ', 'Blade Storm'], warcry:['โห่ร้องศึก', 'War Cry'], boltvolley:['ห่ากระสุนเวท', 'Bolt Volley'], healaura:['รัศมีฟื้นฟู', 'Healing Aura'],
    pounce:['ตะครุบเหยื่อ', 'Pounce'], rend:['กรงเล็บฉีก', 'Rend'], stampede:['ตะลุยเหยียบ', 'Stampede'], trample:['กระทืบปฐพี', 'Trample'],
    feather:['พายุขนนก', 'Feather Storm'], gust:['ลมกรด', 'Gale'], torrent:['ธารน้ำเชี่ยว', 'Torrent'], venom:['พ่นพิษ', 'Venom Spit'], web:['ใยรัด', 'Binding Web'],
    shell:['เกราะหิน', 'Stone Guard'], shadowstep:['ก้าวเงา', 'Shadow Step'], split:['แตกร่าง', 'Split'], acid:['บ่อกรด', 'Acid Pool'], boulder:['ขว้างศิลา', 'Boulder Throw'],
    g_solar:['สุริยาถล่ม', 'Solar Cataclysm'], g_deluge:['มหาอุทกภัย', 'Great Deluge'], g_tempest:['พายุอสนีบาต', 'Thunder Tempest'], g_quake:['ธรณีสูบ', 'Earth Swallow'],
    g_judge:['ทัณฑ์สวรรค์', "Heaven's Judgement"], g_abyss:['ราตรีอเวจี', 'Abyssal Night']},
  grandOf:{fire:'g_solar', water:'g_deluge', wind:'g_tempest', earth:'g_quake', holy:'g_judge', shadow:'g_abyss', poison:'g_abyss', neutral:'g_quake'}
};
const bpGrand = id => id.startsWith('g_');
if (typeof BOSS_SKILL_TH !== 'undefined') for (const k in BP.name) if (!BOSS_SKILL_TH[k]) BOSS_SKILL_TH[k] = BP.name[k];   // the wiki and the world map list every boss skill by name

/* ---------- 1. no crowd control on bosses, everything else sticks ---------- */
{ const _as = applyStatus;
  applyStatus = function(m, st, lv){
    if (!m || m.dead || !st || !m.def || !m.def.boss) return _as.apply(this, arguments);
    const s = m.st || (m.st = {}); let cc = !!(st.stun || st.freeze || st.stop || st.root || st.knock || st.silence);
    if (st.slow){ s.slow = Math.max(s.slow || 0, st.slow[1] * .6); s.slowAmt = Math.max(s.slowAmt || 0, st.slow[0] * .5); }
    if (st.poison){ s.poison = st.poison[1]; s.poisonDps = st.poison[0] * (st.poison[2] ? DER.matk : DER.atk); s.poisonT = 1; }
    if (st.defDown){ s.defDown = st.defDown[1]; s.defDownPct = st.defDown[0]; }
    if (st.atkDown){ s.atkDown = st.atkDown[1]; s.atkDownPct = st.atkDown[0]; }
    if (st.shock){ s.shock = Math.max(s.shock || 0, st.shock); cc = true; VFX.play('shocked', {m}); }   // the shock lands, its stun does not
    if (st.taunt){ m.aggro = true; m.taunt = 3; }
    if (cc && T - (m.immT || -9) > .8){ m.immT = T; addText(m.x, m.y - MOB_H[m.type] - 14, L('ต้าน CC', 'CC immune'), '#d8c8ff', 13); }
  };
}

/* ---------- 2. tiers by level ---------- */
HK.spawn.push(m => { if (!m.def || !m.def.boss || m.def.wb || m.dg) return; const t = BP.tier(m.def.lvl || 1);
  m.maxhp = Math.round(m.maxhp * t[0]); m.hp = Math.round(m.hp * t[0]); m.tierAtk = t[1]; m.tierPace = t[2]; if (m.fz) m.fz.lastHp = m.hp; });
{ const _ma = mobAttack;
  mobAttack = function(m, mult = 1, noDodge){ const k = (m && m.tierAtk || 1) * (m && m.cryT > T ? 1.3 : 1); return _ma.call(this, m, mult * k, noDodge); }; }
/* Stone Guard: half damage while it stands */
{ const _ad = applyDamage;
  applyDamage = function(m, res, ...rest){ if (m && m.guardT > T && res && res.dmg > 0) res = {...res, dmg:Math.max(1, Math.round(res.dmg * .5))}; return _ad.call(this, m, res, ...rest); }; }   // (v27h) keep every argument (the skill) for the wrappers inside

/* ---------- 3. a kit for every nature ---------- */
const BP_INFO = {};
if (typeof BOSSES !== 'undefined') for (const b of BOSSES) BP_INFO[b[0]] = {arch:b[4], look:b[5] || {}, elem:b[6], race:b[7]};
function bpKit(id){
  const d = MOB[id], I = BP_INFO[id] || {arch:typeof SPECIES_ARCH !== 'undefined' && SPECIES_ARCH[id] || '', look:{}, elem:d.elem, race:d.race}, a = I.arch, lk = I.look || {}, kit = [];
  const en = (d.en || '') + ' ' + id, race = I.race || d.race;
  if (a === 'human') kit.push(...(lk.weapon === 'bow' ? ['feather', 'shadowstep'] : lk.weapon === 'sword' ? ['bladestorm', 'warcry']
    : race === 'undead' ? ['shadowstep', 'boltvolley'] : lk.weapon === 'staff' && race !== 'brute' && race !== 'demon' ? ['boltvolley', 'healaura'] : ['bladestorm', 'warcry']));
  else if (!a && /jelly|slime|blob|ooze/i.test(en)) kit.push('split', 'acid');
  else if (!a && /turtle|crab|shell|clam/i.test(en)) kit.push('shell', 'torrent');
  else if (!a && /naga|serpent|snake|eel/i.test(en)) kit.push('torrent', 'venom');
  else if (!a && /bird|garuda|hawk|eagle|crow|raven/i.test(en)) kit.push('feather', 'gust');
  else if (!a && /tiger|lion|singha|wolf|bear/i.test(en)) kit.push('pounce', 'rend');
  else if (a === 'quad') kit.push(...(lk.head === 'cat' || lk.head === 'dog' || lk.head === 'bear' ? ['pounce', 'rend'] : ['stampede', 'trample']));
  else if (a === 'bird') kit.push('feather', 'gust');
  else if (a === 'serpent') kit.push('torrent', 'venom');
  else if (a === 'bug') kit.push(/^(hornet|wasp|bee)$/.test(lk.kind || '') ? 'gust' : 'web', 'venom');   // (v274) a hornet or bee queen beats up a gale with her wings instead of spinning webs
  else if (a === 'squat') kit.push('shell', 'torrent');
  else if (a === 'floater') kit.push('shadowstep', 'boltvolley');
  else if (a === 'slime') kit.push('split', 'acid');
  else if (a === 'rock') kit.push('boulder', 'shell');
  else kit.push(d.race === 'undead' ? 'shadowstep' : 'pounce', 'boltvolley');
  // cataclysms: Lv 150+ only, 2–4
  const lv = d.lvl || 1;
  if (lv >= 150){ const n = lv >= 200 ? 4 : lv >= 180 ? 3 : 2, own = BP.grandOf[I.elem || d.elem] || 'g_quake', pool = ['g_solar', 'g_deluge', 'g_tempest', 'g_quake', 'g_judge', 'g_abyss'].filter(g => g !== own);
    const h = [...id].reduce((s, c) => s * 31 + c.charCodeAt(0) | 0, 7) >>> 0, g = [own]; for (let i = 0; g.length < n; i++) g.push(pool.splice((h >> (i * 3)) % pool.length, 1)[0]); kit.push(...g); }
  return kit;
}
for (const k in MOB){ const d = MOB[k]; if (!d || !d.boss || d.wb || !Array.isArray(d.bossSkills)) continue; const kit = bpKit(k); d.bpKit = kit; for (const s of kit) if (!d.bossSkills.includes(s)) d.bossSkills.push(s); }
if (typeof NB_MUL !== 'undefined') Object.assign(NB_MUL, {bladestorm:.8, boltvolley:1.1, pounce:1.8, rend:1.4, stampede:2.2, trample:1.6, feather:.9, gust:1.1, torrent:1.7, venom:.8, web:.6, shadowstep:1.6, acid:.35, boulder:1.8,
  g_solar:1, g_deluge:1, g_tempest:1, g_quake:1.2, g_judge:1.1, g_abyss:1});

/* ---------- the moves ---------- */
const bpAt = () => ({x:P.x, y:P.y});
const bpSay = (m, id, big) => addText(m.x, m.y - MOB_H[m.type] - (big ? 44 : 28), (big ? '☄ ' : '') + L(...BP.name[id]), big ? '#ff5a3a' : '#ffb0a0', big ? 24 : 16);
const bpShot = el => ({fire:'fire', water:'ice', holy:'holy', wind:'bolt', shadow:'dark', poison:'dart', earth:'dart'}[el] || 'dark');
function bpCast(m, id){
  const d = m.def, e = d.elem, at = bpAt(), lv = d.lvl || 1;
  switch (id){
    case 'bladestorm': { bpSay(m, id); VFX.play('warnCircle', {x:m.x, y:m.y, r:140, t:.8});
      later(.8, () => { if (m.dead) return; VFX.play('bladestorm', {x:m.x, y:m.y, r:140}); for (let i = 0; i < 4; i++) later(i * .25, () => { if (!m.dead && inHit(m.x, m.y, 140)) mobAttack(m, .7, true); }); }); return 1.9; }
    case 'warcry': { bpSay(m, id); VFX.play('roar', {x:m.x, y:m.y}); SFX.play('roar'); m.cryT = T + 8; VFX.play('enrage', {m});
      if (lv >= 100) bossCast(m, 'summon'); return 1; }
    case 'boltvolley': { bpSay(m, id);
      for (let i = 0; i < 3; i++){ const x = at.x + (i ? rand(-60, 60) : 0), y = at.y + (i ? rand(-35, 35) : 0), w = .8 + i * .2; VFX.play('warnCircle', {x, y, r:50, t:w});
        later(w - .3, () => { if (!m.dead) VFX.play('mobShot', {x:m.x, y:m.y - MOB_H[m.type] * .6, tx:x, ty:y - 16, t:.3, kind:bpShot(e)}); });
        later(w, () => { if (!m.dead && inHit(x, y, 50)) mobAttack(m, 1, true); }); } return 1.6; }
    case 'healaura': { if (m.hp > m.maxhp * .85) return 0; bpSay(m, id); const h = Math.round(m.maxhp * .04); m.hp = Math.min(m.maxhp, m.hp + h); VFX.play('heal', {x:m.x, y:m.y}); addText(m.x, m.y - MOB_H[m.type] - 8, `+${h.toLocaleString()}`, '#c4ffe0', 16); return 1; }
    case 'pounce': { bpSay(m, id); const x = at.x, y = at.y; VFX.play('warnCircle', {x, y, r:72, t:.7});
      later(.7, () => { if (m.dead) return; VFX.play('dustPuff', {x:m.x, y:m.y}); m.x = clamp(x, 40, W - 40); m.y = clamp(y, 60, H - 40); VFX.play('earthsplitBoom', {x, y, r:72}); VFX.shake(4);
        if (inHit(x, y, 72) && !P.roll){ mobAttack(m, 1.8, true); if (typeof applyMobFx === 'function') applyMobFx(m, 'bleed', 1); } }); return 1.3; }
    case 'rend': case 'torrent': case 'gust': { bpSay(m, id); const dx = at.x - m.x, dy = at.y - m.y, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, len = id === 'rend' ? 150 : id === 'gust' ? 320 : 380, w = id === 'rend' ? 70 : id === 'gust' ? 80 : 50, t = id === 'rend' ? .55 : .8;
      VFX.play('warnLine', {x:m.x, y:m.y, ux, uy, len, w, t});
      later(t, () => { if (m.dead) return; VFX.play(id === 'rend' ? 'clawHit' : 'bossWave', {x:m.x + ux * 60, y:m.y + uy * 60, ux, uy, len, elem:id === 'torrent' ? 'water' : id === 'gust' ? 'wind' : e});
        const px = P.x - m.x, py = P.y - m.y, al = px * ux + py * uy, off = Math.abs(px * uy - py * ux);
        if (al > 0 && al < len && off < w / 2 + 8 && !P.roll){ mobAttack(m, id === 'rend' ? 1.4 : id === 'gust' ? 1.1 : 1.7, true);
          if (typeof applyMobFx === 'function') applyMobFx(m, id === 'rend' ? 'bleed' : id === 'torrent' ? 'slow' : null, 1);
          if (id === 'gust'){ P.x = clamp(P.x + ux * 90, 40, W - 40); P.y = clamp(P.y + uy * 60, 60, H - 40); pushOut(P, 12); } } }); return 1.4; }
    case 'stampede': return bossCast(m, 'charge');
    case 'trample': { bpSay(m, id); VFX.play('warnCircle', {x:m.x, y:m.y, r:125, t:.9});
      later(.9, () => { if (m.dead) return; VFX.play('quake', {x:m.x, y:m.y, r:125}); VFX.shake(5); if (inHit(m.x, m.y, 125) && !P.roll){ mobAttack(m, 1.6, true); if (typeof applyMobFx === 'function') applyMobFx(m, 'slow', 1); } }); return 1.4; }
    case 'feather': case 'venom': { bpSay(m, id); const n = id === 'feather' ? 6 : 3;
      for (let i = 0; i < n; i++){ const x = at.x + rand(-80, 80), y = at.y + rand(-45, 45), w = .8 + i * .12; VFX.play('warnCircle', {x, y, r:id === 'venom' ? 48 : 40, t:w});
        later(w, () => { if (m.dead) return; VFX.play(id === 'venom' ? 'poisonHit' : 'arrowHit', {x, y}); if (inHit(x, y, id === 'venom' ? 48 : 40) && !P.roll){ mobAttack(m, id === 'venom' ? .8 : .9, true); if (id === 'venom' && typeof applyMobFx === 'function') applyMobFx(m, 'poison', 1); } }); } return 1.6; }
    case 'web': { bpSay(m, id); const x = at.x, y = at.y; VFX.play('warnCircle', {x, y, r:70, t:.7});
      later(.7, () => { if (m.dead) return; VFX.play('net', {x, y}); if (inHit(x, y, 70) && !P.roll){ mobAttack(m, .6, true); if (typeof applyMobFx === 'function') applyMobFx(m, 'root', 1); } }); return 1.1; }
    case 'shell': { bpSay(m, id); m.guardT = T + 6; VFX.play('goldshield', {x:m.x, y:m.y}); SFX.play('buff'); return .8; }
    case 'shadowstep': { bpSay(m, id); const x = at.x, y = at.y; VFX.play('warnCircle', {x, y, r:55, t:.55});
      later(.55, () => { if (m.dead) return; const a = Math.atan2(P.y - m.y, P.x - m.x); VFX.play('shadowBlink', {x:m.x, y:m.y, x2:x, y2:y}); m.x = clamp(x - Math.cos(a) * 30, 40, W - 40); m.y = clamp(y - Math.sin(a) * 18, 60, H - 40);
        VFX.play('shadowSlash', {x, y}); if (inHit(x, y, 55) && !P.roll){ mobAttack(m, 1.6, true); if (typeof applyMobFx === 'function') applyMobFx(m, 'blind', 1); } }); return 1.1; }
    case 'split': { bpSay(m, id); const pool = MAP_ID === 0 ? [d.summon || 'dewblob'] : (MAPS[MAP_ID].mobs || []).filter(t => MOB[t] && !MOB[t].night);
      if (mobs.filter(o => o.minion && !o.dead).length >= 6 || !pool.length) return .5;
      for (let i = 0; i < 3; i++){ const a = i / 3 * 6.28, c = spawnMob(pool[i % pool.length], m.x + Math.cos(a) * 50, m.y + Math.sin(a) * 30, {zone:m.zone, minion:true}); c.aggro = true; VFX.play('bossSummon', {x:c.x, y:c.y}); } return 1.1; }
    case 'acid': return bossCast(m, 'field');
    case 'boulder': { bpSay(m, id);
      for (let i = 0; i < 2; i++){ const x = at.x + (i ? rand(-70, 70) : 0), y = at.y + (i ? rand(-40, 40) : 0), w = .9 + i * .3; VFX.play('warnCircle', {x, y, r:60, t:w});
        later(w - .35, () => { if (!m.dead) VFX.play('mobShot', {x:m.x, y:m.y - MOB_H[m.type] * .7, tx:x, ty:y - 10, t:.35, kind:'dart'}); });
        later(w, () => { if (m.dead) return; VFX.play('stoneHit', {x, y}); VFX.play('earthsplitBoom', {x, y, r:60}); if (inHit(x, y, 60) && !P.roll){ mobAttack(m, 1.8, true); if (typeof applyMobFx === 'function') applyMobFx(m, 'stun', 1.6); } }); } return 1.6; }
  }
  if (bpGrand(id)) return bpGrandCast(m, id);
  return 0;
}
/* a cataclysm: a wide red field around you, 2 s to get out, then the sky falls */
function bpGrandCast(m, id){
  if ((m.gcd || 0) > T) return 0; m.gcd = T + 16;
  const at = bpAt(), R = 210, fx = {g_solar:'cataclysm', g_deluge:'frostsea', g_tempest:'tempest', g_quake:'earthfall', g_judge:'wrath', g_abyss:'meteor'}[id];
  bpSay(m, id, true); if (typeof bossShout === 'function') bossShout(m, 'fury', L(...BP.name[id])); else banner(L(`☄ ${m.def.name}: ${BP.name[id][0]}!`, `☄ ${m.def.en}: ${BP.name[id][1]}!`)); SFX.play('roar'); VFX.play('enrage', {m});
  VFX.play('warnCircle', {x:at.x, y:at.y, r:R, t:2});
  for (let i = 0; i < 4; i++){ const x = at.x + rand(-R * .55, R * .55), y = at.y + rand(-R * .35, R * .35); VFX.play('warnCircle', {x, y, r:60, t:2 + i * .3}); later(2 + i * .3, () => { if (!m.dead && inHit(x, y, 60) && !P.roll) mobAttack(m, .8, true); }); }
  later(2, () => { if (m.dead) return; VFX.play(fx, {x:at.x, y:at.y, r:R, hits:4, every:.3, lv:10, elem:m.def.elem}); VFX.shake(8); SFX.play('boom');
    if (id === 'g_deluge' && typeof DELUGE_START === 'function') DELUGE_START(at.x, at.y, R);
    for (let i = 0; i < 4; i++) later(i * .3, () => { if (!m.dead && inHit(at.x, at.y, R) && !P.roll){ mobAttack(m, .9, true);
      const fxk = {g_solar:'burn', g_deluge:'slow', g_tempest:'stun', g_quake:'stun', g_judge:'blind', g_abyss:'curse'}[id]; if (i === 0 && typeof applyMobFx === 'function') applyMobFx(m, fxk, id === 'g_tempest' || id === 'g_quake' ? 1.4 : 1); } }); });
  return 2.6;
}
{ const _bc = bossCast;
  bossCast = function(m, id){
    if (!BP.name[id]) return _bc.apply(this, arguments);
    if (bpGrand(id) && (m.gcd || 0) > T){ const alt = (m.def.bpKit || []).filter(s => !bpGrand(s)); id = alt.length ? alt[Math.floor(Math.random() * alt.length)] : 'slam'; if (!BP.name[id]) return _bc.call(this, m, id); }
    const keep = typeof NB !== 'undefined' ? [NB.ctx, NB.sk] : null; if (keep){ NB.ctx = m; NB.sk = id; }   // the telegraphs go to the other players too
    try { return bpCast(m, id); } finally { if (keep){ NB.ctx = keep[0]; NB.sk = keep[1]; } } };
}
/* minions come stronger with the boss's level; from Lv 150 one of each call is an elite */
{ const _bc2 = bossCast;
  bossCast = function(m, id){ if (id !== 'summon') return _bc2.apply(this, arguments); const before = new Set(mobs); const r = _bc2.apply(this, arguments);
    const lv = m.def.lvl || 1, fresh = mobs.filter(o => !before.has(o) && o.minion), k = 1 + lv / 100;
    fresh.forEach((o, i) => { o.maxhp = Math.round(o.maxhp * k); o.hp = o.maxhp; o.tierAtk = 1 + lv / 250; if (i === 0 && lv >= 150 && typeof makeElite === 'function') makeElite(o); });
    return r; }; }
/* faster skills at higher tiers (the cooldown after each cast shrinks) */
{ const _ub = updBoss;
  updBoss = function(m, dt){ const r = _ub.apply(this, arguments); if (m.tierPace > 1 && m.bcd > 0) m.bcd -= dt * (m.tierPace - 1); return r; }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'bossplus', t:['บอส: ความโหดและภัยพิบัติ', 'Bosses: ferocity and cataclysms'], b:() => `<ul>
  <li>${L('บอสไม่ติด CC: สตัน ชะงัก/กระเด็น ใบ้ นิ่ง (แช่แข็ง หยุด ตรึง) · สถานะอื่นติด: พิษ ไหม้ ช้า (สั้นลง) ลด DEF/ATK ยั่วยุ', 'Bosses ignore crowd control: stun, flinch/knockback, silence, holds · other effects stick: poison, burn, slow (shorter), DEF/ATK down, taunt')}</li>
  <li>${L('ยิ่งเลเวลสูงยิ่งโหด: เลือด แรงตี ความถี่สกิล เพิ่มเป็นขั้นที่ Lv 40/80/120/150/200', 'Higher level, harder: HP, hits and skill pace climb at Lv 40/80/120/150/200')}</li>
  <li>${L('แต่ละบอสมีชุดท่าตามธรรมชาติของมัน (ยักษ์ เสือ ช้าง นาค นก ผี หิน เมือก …) ยืมแบบมาจากสกิลอาชีพ', 'Each boss has moves that fit its nature (yaksha, tiger, elephant, naga, bird, ghost, golem, jelly …), borrowed from the classes')}</li>
  <li>${L('อภิมหาภัยพิบัติ: เฉพาะบอส Lv 150 ขึ้นไป ตัวละ 2–4 ท่า · วงแดงใหญ่เตือน 2 วินาที ออกจากวงหรือกลิ้งผ่าน', 'Cataclysms: Lv 150+ bosses only, 2–4 each · a huge red field warns you 2 s ahead: get out or roll through')}</li></ul>`});

/* (v27h) a boss always hurts: at least 4 / 5 / 6 / 8 % of your Max HP per hit by phase (was 2 / 2.5 / 3 / 4) */
if (typeof FURY !== 'undefined') FURY.minHit = [.04, .05, .06, .08];
