/* VAYRATHEN — js/sys/netsummon.js — other players see a Summoner's beasts
   Summoned beasts (Singha, Naga, Kinnaree, Garuda, Erawan, the bound boss) and the Warden's Spirit Tiger only existed
   on the caster's own screen. Now they travel in the caster's presence as one short string (`sm`):
     kind,id,x,y,dir,flags,seconds-left,hp% ; …        kind b = beast · o = bound boss (id = monster key) · t = spirit tiger
     flags: 1 moving · 2 attacking · 4 using its skill
   Sent about 5 times a second at most. The receiving side rebuilds each beast as a harmless look-alike that glides to
   the latest position and is drawn with the same code as your own beasts (hand-painted art included). Nothing is
   trusted: only known beast ids, clamped numbers, at most 6 entries. Purely visual: it never fights or takes damage here. */
'use strict';

const NSM = {t:-9, str:'', max:6};

/* ---------- sending ---------- */
function sumPres(){
  if (typeof SUMMONS === 'undefined') return {sm:''};
  if (T - NSM.t < .2 && NSM.t <= T) return {sm:NSM.str};
  NSM.t = T; const out = [];
  for (const s of SUMMONS){
    if (s.dead || out.length >= NSM.max) continue;
    if (P.dead && s.beast !== 'bound') continue;                            // like your own screen: beasts leave with a fallen caster
    const left = s.dur === Infinity ? -1 : Math.max(0, Math.round(s.dur - s.t));
    const fl = (s.moving ? 1 : 0) | ((s.atkT > 0 || s.pounce > 0) ? 2 : 0) | (s.skT > 0 ? 4 : 0);
    const hp = s.maxhp ? Math.round(clamp(s.hp / s.maxhp, 0, 1) * 100) : 100;
    if (s.kind === 'tiger') out.push(['t', 'tiger', Math.round(s.x), Math.round(s.y), s.dir & 7, fl, left, 100].join(','));
    else if (s.beast === 'bound'){ const id = S.bound && S.bound.type; if (id && /^[A-Za-z0-9_]{1,24}$/.test(id)) out.push(['o', id, Math.round(s.x), Math.round(s.y), s.dir & 7, fl, left, hp].join(',')); }
    else if (HIMMA[s.beast]) out.push(['b', s.beast, Math.round(s.x), Math.round(s.y), s.dir & 7, fl, left, hp].join(','));
  }
  return {sm:NSM.str = out.join(';')};
}

/* ---------- receiving ---------- */
function nsmBoundDef(id){
  const d = MOB[id]; if (!d) return null;
  return {mob:id, name:[nm(d), nm(d)], role:'tank', elem:d.elem || 'neutral', scale:Math.min(.75, 44 / Math.max(30, MOB_H[id] || 40)), aura:'auraViolet', bound:true};
}
function nsmParse(str){
  const out = []; if (typeof str !== 'string' || !str || str.length > 500) return out;
  for (const part of str.split(';').slice(0, NSM.max)){
    const [k, id, x, y, d, f, r, h] = part.split(','), px = +x, py = +y;
    if (!(px >= 0 && px <= W + 50 && py >= 0 && py <= H + 50)) continue;
    const e = {key:k + ':' + id, kind:k, id, x:px, y:py, dir:clamp(d | 0, 0, 7), fl:f | 0, left:+r < 0 ? Infinity : clamp(+r || 0, 0, 3600), hp:clamp(+h || 0, 0, 100)};
    if (k === 'b' && HIMMA[id]) out.push(e);
    else if (k === 't' && id === 'tiger') out.push(e);
    else if (k === 'o' && MOB[id] && /^[A-Za-z0-9_]{1,24}$/.test(id)) out.push(e);
  }
  return out;
}
function nsmSync(gh, dt){
  const q = gh.q || {};
  if (typeof q.sm !== 'string' || q.dead && !/^o:/.test(q.sm)){ if (gh.sums) gh.sums = null; gh.smStr = ''; return; }
  if (q.sm !== gh.smStr){
    gh.smStr = q.sm; const list = nsmParse(q.sm), old = gh.sums || new Map(), next = new Map();
    for (const e of list){
      let o = old.get(e.key);
      if (!o){
        o = {kind:e.kind === 't' ? 'tiger' : 'beast', beast:e.kind === 'b' ? e.id : e.kind === 'o' ? 'bound' : undefined, x:e.x, y:e.y, t:0, dur:Infinity, dir:e.dir, moving:false, atkT:0, skT:0, hurt:0, guard:0, pounce:0, target:null, lv:1};
        if (e.kind === 'o'){ o.def = nsmBoundDef(e.id); if (!o.def) continue; }
      }
      o.tx = e.x; o.ty = e.y; o.fl = e.fl; o.hp = e.hp; o.maxhp = 100; o.dur = o.t + e.left; o.wantDir = e.dir; next.set(e.key, o);
    }
    gh.sums = next.size ? next : null;
  }
  if (!gh.sums) return;
  for (const o of gh.sums.values()){
    const d = Math.hypot(o.tx - o.x, o.ty - o.y);
    if (d > 400){ o.x = o.tx; o.y = o.ty; }
    else { const k = Math.min(1, dt * (d > 60 ? 6 : 3.5)); o.x += (o.tx - o.x) * k; o.y += (o.ty - o.y) * k; }
    o.t += dt; o.moving = d > 3 || !!(o.fl & 1);
    if (d > 2) o.dir = SPR.dirFromVec(o.tx - o.x, o.ty - o.y); else o.dir = o.wantDir;
    o.atkT = o.fl & 2 ? .3 : 0; o.pounce = o.kind === 'tiger' && (o.fl & 2) ? .2 : 0; o.skT = o.fl & 4 ? .35 : 0;
  }
}
EV.on('tick', dt => { if (typeof NET === 'undefined' || !NET.ghosts) return; for (const gh of NET.ghosts.values()) nsmSync(gh, dt); });
EV.on('map', () => { if (typeof NET !== 'undefined' && NET.ghosts) for (const gh of NET.ghosts.values()){ gh.sums = null; gh.smStr = ''; } });

{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){
    _ents(list, g);
    if (typeof NET === 'undefined' || !NET.ghosts) return;
    for (const gh of NET.ghosts.values()){
      if (!gh.sums || SETTINGS.oSum === false || (typeof gmHidden === 'function' && gmHidden(gh))) continue;
      for (const o of gh.sums.values()) list.push({y:o.y, f:() => { try { o.kind === 'beast' ? drawBeast(g, o) : VFX.drawTiger(g, o, cam.x, cam.y); } catch (e) {} }});
    }
  };
}
