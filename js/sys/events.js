/* VAYRATHEN — js/sys/events.js — seasonal festivals (เทศกาลตามฤดูกาล)
   The calendar runs on Thailand time. While a festival is on:
   · the world is decorated (lantern boats on the water and sky lanterns at Loy Krathong, fireworks at New Year,
     water splashes at Songkran, drifting temple lanterns at the end of Buddhist Lent);
   · every kill gives +10% EXP, and festival tokens drop (3% from anything, 1 from an alpha, 5 from a boss);
   · every 15 minutes a FESTIVAL SPIRIT (a glowing alpha) appears on a field map and drops 5 tokens;
   · Mae Nang Thetsakan in Aren trades tokens for LIMITED costumes, sold only during their own festival
     (no free trial for these). Tokens belong to the account and reset when the next festival starts.
   Settings → "Preview festival" shows any festival's decorations now (looks only, no tokens). */
'use strict';
/* (v97) one warm glow picture stamped for every lantern, instead of a new gradient for each one every frame */
let EV_GLOW = null;
function evGlow(){ if (EV_GLOW) return EV_GLOW; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,195,95,1)'); gr.addColorStop(1, 'rgba(255,155,50,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (EV_GLOW = c); }

const EVENTS = {
  okpansa:{th:'ออกพรรษา · ตักบาตรเทโว', en:'End of Buddhist Lent', from:[10, 1], to:[10, 31], col:'#ffd27a', tok:['เหรียญเทโว', 'Tevo token'], sp:['ภูตประทีปเทโว', 'Tevo Lamp Spirit']},
  loykrathong:{th:'ลอยกระทง', en:'Loy Krathong', from:[11, 1], to:[11, 30], col:'#ffb24a', tok:['เหรียญกระทง', 'Krathong token'], sp:['ภูตโคมยี่เป็ง', 'Yi Peng Lantern Spirit']},
  newyear:{th:'ปีใหม่', en:'New Year', from:[12, 28], to:[1, 3], col:'#ffe066', tok:['เหรียญพลุ', 'Firework token'], sp:['ภูตพลุเคาท์ดาวน์', 'Countdown Spirit']},
  songkran:{th:'สงกรานต์', en:'Songkran', from:[4, 10], to:[4, 16], col:'#6ad0ff', tok:['เหรียญสาดน้ำ', 'Splash token'], sp:['ภูตขันเงิน', 'Silver Bowl Spirit']}
};
const EVENT_EXP = 1.1;
/* limited costumes (src 'event': never on free trial, only from the festival trader during their festival) */
{
  const ev = {
    c_ev_tevo:{slot:'top', ev:'okpansa', th:'ชุดผ้าไหมเทโว', en:'Tevo Silk Raiment', tok:40, look:{top:'pearl', sleeve:'pearl', forearm:'goldLight', armband:'goldLight', pants:'ivory', bootCuff:'goldLight', belt:'goldLight', skirtM:'pearl', skirtT:'goldLight', necklace:true, neckMat:'goldLight', topTex:tx.combo(tx.sash(CM.gold), tx.hem(CM.gold, .46))}},
    hc_ev_tevo:{slot:'head', ev:'okpansa', th:'ปิ่นประทีปทอง', en:'Golden Lamp Pin', tok:20, look:{hat:null, hairpin:'goldLight'}},
    c_ev_krathong:{slot:'top', ev:'loykrathong', th:'ชุดไทยจักรีลอยกระทง', en:'Loy Krathong Chakri Dress', tok:40, look:{top:'roseGold', sleeve:'pearl', forearm:'goldLight', armband:'goldLight', pants:'sakura', bootCuff:'goldLight', belt:'goldLight', skirtM:'roseGold', skirtT:'goldLight', necklace:true, pendant:'gem', neckMat:'goldLight', topTex:tx.combo(tx.sash(CM.gold), tx.dots(CM.gold))}},
    hc_ev_krathong:{slot:'head', ev:'loykrathong', th:'มงกุฎดอกบัวกระทง', en:'Lotus Krathong Crown', tok:20, look:{hat:'crest', bandMat:'goldLight', crestMat:'sakura', crestN:5}},
    c_ev_newyear:{slot:'top', ev:'newyear', th:'ชุดราตรีเคาท์ดาวน์', en:'Countdown Gala Suit', tok:40, look:{top:'midnight', sleeve:'midnight', forearm:'goldLight', armband:'goldLight', pants:'midnight', bootCuff:'goldLight', belt:'goldLight', cape:'midnight', capeTex:'gold', skirtM:'midnight', skirtT:'goldLight', necklace:true, neckMat:'goldLight', topTex:tx.combo(tx2.stars(CM2.goldLight), tx.hem(CM2.goldLight, .46))}},
    hc_ev_newyear:{slot:'head', ev:'newyear', th:'มงกุฎดาวปีใหม่', en:'New Year Star Crown', tok:20, look:{hat:'crest', bandMat:'midnight', crestMat:'goldLight', crestN:7, crestGem:true}},
    c_ev_songkran:{slot:'top', ev:'songkran', th:'ชุดลายดอกสาดน้ำ', en:'Splash Festival Shirt', tok:40, look:{top:'sky', sleeve:'sky', forearm:'skin', pants:'tech', bootCuff:'sky', belt:'sun', skirtM:'sky', skirtT:'sun', topTex:tx.combo(tx.dots(CM.sun), tx.hem(CM.sakura, .48))}},
    hc_ev_songkran:{slot:'head', ev:'songkran', th:'มาลัยดอกมะลิ', en:'Jasmine Garland', tok:20, look:{hat:'band', bandMat:'pearl'}}
  };
  for (const id in ev){ const c = {...ev[id], src:'event'}; COSTUME[id] = c; SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...TOP0, ...c.look} : {...c.look}; (window.EV_COS = window.EV_COS || {})[id] = c; }   // (v213) kept aside: the new wardrobe (fashion30.js) clears COSTUME
  COS_SRC.event = ['เทศกาล (เหรียญเทศกาล)', 'Festival (tokens)'];
}
/* which festival is on (Thai date) */
function evOnDate(d){
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  for (const id in EVENTS){ const E = EVENTS[id], a = E.from[0] * 100 + E.from[1], b = E.to[0] * 100 + E.to[1]; if (a <= b ? md >= a && md <= b : md >= a || md <= b) return id; }
  return null;
}
const evLive = () => evOnDate(thNow());                                          // the real festival (tokens, shop, EXP)
const evShow = () => (SETTINGS.evPreview && EVENTS[SETTINGS.evPreview] ? SETTINGS.evPreview : evLive());   // what the world looks like
const evName = id => (EVENTS[id] ? L(EVENTS[id].th, EVENTS[id].en) : '');
function evTok(){ const id = evLive(); ACC.evt = ACC.evt || {}; if (ACC.evt.id !== id){ ACC.evt = {id, n:0}; } return ACC.evt; }
function evGive(n, x, y){
  const id = evLive(); if (!id || n <= 0) return; const t = evTok(); t.n += n; accSave();
  if (typeof addText === 'function') addText(x || P.x, (y || P.y) - 64, `+${n} ${L(...EVENTS[id].tok)}`, EVENTS[id].col, 12);
}
/* +10% EXP while a festival is on */
{ const _g = gainExp; gainExp = function(b, j){ if (evLive()){ b = Math.round(b * EVENT_EXP); j = Math.round(j * EVENT_EXP); } return _g(b, j); }; }
/* tokens */
EV.on('kill', m => {
  if (!evLive() || !m || !m.def || m.minion || m.type === 'crowncrystal') return;
  const n = m.evb ? 5 : m.def.boss ? 5 : m.elite ? 1 : Math.random() < .03 ? 1 : 0; if (n) evGive(n, m.x, m.y);
  if (m.evb){ banner(L(`ปราบ${L(...EVENTS[m.evb].sp)}! ได้เหรียญเทศกาล 5`, `${EVENTS[m.evb].sp[1]} defeated! +5 festival tokens`)); SFX.play('quest'); }
});
/* the festival spirit: every 15 minutes (Thai clock) on a field map */
const EVB = {slot:-1, m:null};
EV.on('tick', () => {
  const id = evLive(); if (!id || MAP_ID === 0 || P.dead || (typeof DG !== 'undefined' && DG.active) || (typeof nmSlave === 'function' && nmSlave())) return;
  const c = thaiClock(), slot = Math.floor((c.h * 60 + c.m) / 15); if (slot === EVB.slot) return;
  if (EVB.m && !EVB.m.dead) return; EVB.slot = slot;
  const pool = (MAPS[MAP_ID].mobs || []).filter(t => MOB[t] && !MOB[t].boss); if (!pool.length) return;
  const a = Math.random() * 6.28, x = clamp(P.x + Math.cos(a) * 260, 60, W - 60), y = clamp(P.y + Math.sin(a) * 200, 60, H - 60);
  const m = spawnMob(pool[(Math.random() * pool.length) | 0], x, y, {zone:MAPZ}); if (typeof makeElite === 'function') makeElite(m);
  m.maxhp *= 2; m.hp = m.maxhp; m.evb = id; m.tagTxt = EVENTS[id].sp; EVB.m = m;
  VFX.play('bossArrive', {x, y}); banner(L(`${EVENTS[id].sp[0]} ปรากฏตัวใกล้ ๆ เจ้า!`, `A ${EVENTS[id].sp[1]} appears nearby!`));
});

/* ---------- decorations ---------- */
const EVD = {p:[], fw:[], t:0};
function evNightK(){ const h = thHour(); return h >= 18 || h < 6 ? 1 : h >= 17 ? h - 17 : h < 7 ? 7 - h : 0; }
EV.on('tick', dt => {
  const id = evShow(); EVD.t += dt; if (!id || PAUSED){ EVD.p.length = 0; EVD.fw.length = 0; return; }
  const low = typeof GFX !== 'undefined' && GFX.preset === 'low', cap = low ? 10 : 24, nk = evNightK();   // (v213) fewer sky lanterns: the festival was switched off for stutter in v104
  // sky lanterns (Loy Krathong / Yi Peng and Ok Phansa) rise at dusk and night; Songkran: water drops in the wind
  if ((id === 'loykrathong' || id === 'okpansa') && nk > 0 && EVD.p.length < cap * nk && Math.random() < dt * 2.2)
    EVD.p.push({k:'lan', x:Math.random() * SW, y:SH + 20, vx:(Math.random() - .5) * 8, vy:-(14 + Math.random() * 16), s:.7 + Math.random() * .6, ph:Math.random() * 6});
  if (id === 'songkran' && EVD.p.length < cap && Math.random() < dt * 5) EVD.p.push({k:'drop', x:Math.random() * SW, y:-10, vx:-30 - Math.random() * 30, vy:220 + Math.random() * 120, s:.6 + Math.random() * .6, ph:0});
  for (const p of EVD.p){ p.x += p.vx * dt + (p.k === 'lan' ? Math.sin(EVD.t * .6 + p.ph) * 6 * dt : 0); p.y += p.vy * dt; }
  EVD.p = EVD.p.filter(p => p.y > -40 && p.y < SH + 30 && p.x > -40 && p.x < SW + 40);
  // fireworks at night (New Year every night, Loy Krathong now and then)
  const fwRate = id === 'newyear' ? 1.1 : id === 'cny' ? .6 : id === 'bungfai' ? .5 : id === 'loykrathong' ? .25 : 0;
  if (fwRate && nk > .5 && !low && Math.random() < dt * fwRate && EVD.fw.length < 3){
    const hue = [45, 0, 200, 300, 120, 30][(Math.random() * 6) | 0], n = 20 + ((Math.random() * 10) | 0), cx = SW * (.15 + Math.random() * .7), cy = SH * (.12 + Math.random() * .25);
    EVD.fw.push({cx, cy, hue, t:0, sp:[...Array(n)].map((_, i) => ({a:i / n * 6.283 + Math.random() * .2, v:60 + Math.random() * 50}))});
    if (typeof SFX !== 'undefined' && Math.random() < .5) SFX.play('coin');
  }
  for (const f of EVD.fw) f.t += dt; EVD.fw = EVD.fw.filter(f => f.t < 1.8);
});
/* screen layer: lanterns, drops, fireworks */
EV.on('draw', () => {
  const id = evShow(); if (!id || (EVD.p.length === 0 && EVD.fw.length === 0)) return; const z = typeof TAG_Z === 'function' ? TAG_Z() : 1;
  ctx.save();
  for (const p of EVD.p){
    if (p.k === 'lan'){ const s = p.s * z * 1.4, fl = .8 + Math.sin(EVD.t * 9 + p.ph) * .2;
      ctx.globalAlpha = .35 * fl; ctx.drawImage(evGlow(), p.x - 16 * s, p.y - 16 * s, 32 * s, 32 * s); ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(255,${200 + 30 * fl | 0},140,.95)`; ctx.beginPath(); ctx.moveTo(p.x - 4 * s, p.y - 6 * s); ctx.lineTo(p.x + 4 * s, p.y - 6 * s); ctx.lineTo(p.x + 3 * s, p.y + 5 * s); ctx.lineTo(p.x - 3 * s, p.y + 5 * s); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,220,.9)'; ctx.fillRect(p.x - 1 * s, p.y + 3 * s, 2 * s, 2 * s); }
    else { ctx.strokeStyle = 'rgba(190,235,255,.55)'; ctx.lineWidth = 1.2 * z; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .03, p.y - p.vy * .03); ctx.stroke(); }
  }
  ctx.globalCompositeOperation = 'lighter';
  for (const f of EVD.fw){ const k = f.t / 1.8, a = Math.max(0, 1 - k);
    if (f.t < .25){ ctx.fillStyle = `hsla(${f.hue},100%,80%,.9)`; ctx.fillRect(f.cx - 1, f.cy + (1 - f.t / .25) * SH * .3, 2, 6); continue; }
    ctx.fillStyle = f.col || (f.col = `hsl(${f.hue},100%,78%)`); ctx.globalAlpha = a;   // (v213) one colour per burst, not a new colour string per spark
    for (const s of f.sp){ const r = s.v * Math.min(1, (f.t - .25) * 1.6) * z, x = f.cx + Math.cos(s.a) * r, y = f.cy + Math.sin(s.a) * r + (f.t - .25) * (f.t - .25) * 26;
      ctx.fillRect(x - 1.2 * z, y - 1.2 * z, 2.4 * z, 2.4 * z); }
    ctx.globalAlpha = 1; }
  ctx.restore();
});
/* world layer: lantern boats (krathong) on the water at Loy Krathong, splash rings at Songkran, temple lamps at Ok Phansa */
function evKrathong(g, x, y, t, s){
  const fl = .8 + Math.sin(t * 8 + x) * .2; g.globalAlpha = .45 * fl; g.drawImage(evGlow(), x - 18, y - 22, 36, 36); g.globalAlpha = 1;   // (v213) the cached glow, not a new gradient each frame
  g.fillStyle = 'rgba(30,60,30,.9)'; g.beginPath(); g.ellipse(x, y, 7 * s, 3 * s, 0, 0, 7); g.fill();
  g.fillStyle = '#5aa04a'; for (let i = 0; i < 6; i++){ const a = i / 6 * 6.28; g.beginPath(); g.moveTo(x + Math.cos(a) * 6 * s, y + Math.sin(a) * 2.5 * s); g.lineTo(x + Math.cos(a) * 3 * s, y - 4 * s); g.lineTo(x + Math.cos(a + .5) * 6 * s, y + Math.sin(a + .5) * 2.5 * s); g.fill(); }
  g.fillStyle = '#ffd0e0'; g.beginPath(); g.ellipse(x, y - 4 * s, 3 * s, 2 * s, 0, 0, 7); g.fill();
  g.fillStyle = '#fffbe8'; g.fillRect(x - .5, y - 9 * s, 1, 4 * s); g.fillStyle = `rgba(255,${210 + 40 * fl | 0},120,1)`; g.beginPath(); g.ellipse(x, y - 10 * s, 1.3, 2 * fl, 0, 0, 7); g.fill();
}
{
  const _ents = LIVE.ents;
  LIVE.ents = function(list, g){ _ents(list, g);
    const id = evShow(); if (!id || typeof WATERS === 'undefined') return;
    if (id === 'loykrathong') WATERS.forEach((w, i) => { if (w.kind && w.kind !== 'water') return;
      const n = w.k === 'band' ? 7 : 3;
      for (let k = 0; k < n; k++){ const ph = hashS(`kt${MAP_ID}${i}${k}`) % 1000 / 1000;
        let x, y; if (w.k === 'band'){ x = ((ph * W + T * (6 + ph * 5)) % W); y = w.y0 + (w.y1 - w.y0) * (.25 + .5 * ((ph * 7) % 1)); }
        else { const a = ph * 6.28 + T * .08; x = w.x + Math.cos(a) * w.rx * .55; y = w.y + Math.sin(a) * w.ry * .55; }
        y += Math.sin(T * 1.6 + k) * 1.2; const sx0 = x - cam.x, sy0 = y - cam.y; if (sx0 < -30 || sx0 > VW + 30 || sy0 < -30 || sy0 > VH + 30) continue;
        list.push({y, f:() => evKrathong(g, x - cam.x, y - cam.y, T, .9 + (k % 3) * .1)}); } });
    if ((id === 'okpansa' || id === 'loykrathong') && MAP_ID === 0) for (let k = 0; k < 7; k++){ const x = VX + 120 + k * 64, y = 700 + (k % 2) * 40;   // paper lamps strung over Aren
      list.push({y:y + 1, f:() => { const X = x - cam.x, Y = y - cam.y; if (X < -30 || X > VW + 30) return; g.strokeStyle = 'rgba(80,50,20,.8)'; g.lineWidth = 1; g.beginPath(); g.moveTo(X, Y); g.lineTo(X, Y - 40); g.stroke();
        const fl = .85 + Math.sin(T * 5 + k) * .15; g.globalAlpha = .45 * fl; g.drawImage(evGlow(), X - 16, Y - 62, 32, 32); g.globalAlpha = 1;
        g.fillStyle = k % 2 ? '#e8503a' : '#f0b030'; g.beginPath(); g.ellipse(X, Y - 46, 5, 7, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,240,200,.8)'; g.fillRect(X - 5, Y - 47, 10, 1.2); } }); }
  };
  const _under = LIVE.drawUnder;
  LIVE.drawUnder = function(g, ...a){ const r = _under.call(this, g, ...a);
    if (evShow() === 'songkran'){ for (let k = 0; k < 5; k++){ const ph = (T * .5 + k / 5) % 1, sd = hashS(`sk${k}${Math.floor(T * .5 + k / 5)}`), x = P.x + (sd % 400) - 200 - cam.x, y = P.y + ((sd >> 9) % 260) - 130 - cam.y;
      g.strokeStyle = `rgba(170,230,255,${(1 - ph) * .6})`; g.lineWidth = 1; g.beginPath(); g.ellipse(x, y, 4 + ph * 16, (4 + ph * 16) * .4, 0, 0, 7); g.stroke();
      if (ph < .3) for (let i = 0; i < 5; i++){ g.fillStyle = 'rgba(210,245,255,.8)'; g.fillRect(x + Math.cos(i * 1.3) * ph * 30, y - Math.sin(i * .9) * ph * 40 - 4, 1.4, 1.4); } } }
    return r; };
}

/* ---------- the festival trader in Aren ---------- */
addTownNpc({id:'festival', name:'แม่นางเทศกาล', en:'Mae Nang Thetsakan', role:'เทศกาล · แลกชุดลิมิเต็ด', roleEn:'Festivals · Limited costumes', x:390, y:905},
  {job:'healer', look:{sex:'f', hair:2, color:'hairPink'}, gear:{armor:'c_ev_krathong', head:'hc_ev_krathong'}});
const EV_SAY = {okpansa:['ออกพรรษาแล้ว มาตักบาตรเทโวกันจ้ะ ล่ามอนสเตอร์ได้เหรียญเทโว เอามาแลกชุดผ้าไหมได้นะ', 'Lent is over: alms for the Tevo! Hunt for Tevo tokens and trade them for silk.'],
  loykrathong:['วันเพ็ญเดือนสิบสอง น้ำนองเต็มตลิ่ง~ ไปลอยกระทงด้วยกันไหมจ๊ะ', 'Full moon of the twelfth month: shall we float a krathong together?'],
  newyear:['สวัสดีปีใหม่จ้า! คืนนี้มีพลุทั้งคืน', 'Happy New Year! Fireworks all night long.'],
  songkran:['สุขสันต์วันสงกรานต์! ระวังเปียกนะจ๊ะ', 'Happy Songkran! Mind the water.']};
function evNext(){ const d = thNow(); for (let i = 1; i < 400; i++){ const x = new Date(d.getTime() + i * 864e5), id = evOnDate(x); if (id) return {id, d:x}; } return null; }
NPC_OPEN.festival = n => {
  const id = evLive(), t = evTok(), nx = evNext();
  const rows = Object.keys(COSTUME).filter(k => COSTUME[k].src === 'event').map(k => { const c = COSTUME[k], own = cosHave(k), on = c.ev === id, can = on && t.n >= c.tok;
    return `<div class="srow${own ? ' owned' : ''}${on ? '' : ' evoff'}"><span class="ic"><i class="cosw" data-cth="${k}" style="--c1:${cosSwatch(k, 0)};--c2:${cosSwatch(k, 1)}"></i></span><div class="nm"><b>${cosName(k)}</b><small>${evName(c.ev)} · ${c.slot === 'top' ? L('เสื้อผ้า', 'Outfit') : L('ศีรษะ', 'Head')}${own ? ' · ' + L('มีแล้ว', 'owned') : on ? '' : ' · ' + L('รอเทศกาลหน้า', 'next festival')}</small></div>
      <span class="pr">${c.tok} <small>${L('เหรียญ', 'tokens')}</small></span><button class="btn sm" data-evbuy="${k}" ${own || !can ? 'disabled' : ''}>${own ? '✓' : L('แลก', 'Trade')}</button></div>`; }).join('');
  npcFrame(n, id ? L(...EV_SAY[id]) : L(`ตอนนี้ยังไม่มีเทศกาล เทศกาลถัดไปคือ${nx ? evName(nx.id) : ''} อย่าลืมมานะจ๊ะ`, `No festival right now. Next up: ${nx ? evName(nx.id) : ''}. Don't miss it!`),
    `${id ? `<div class="evcard" style="--ec:${EVENTS[id].col}"><b>${evName(id)}</b><small>${L('ถึง', 'until')} ${EVENTS[id].to[1]}/${EVENTS[id].to[0]} · EXP +10% · ${L('มี', 'you have')} <b>${t.n}</b> ${L(...EVENTS[id].tok)}</small><small>${L('ได้เหรียญจากการล่า (3%) หัวหน้าฝูง (1) บอส (5) และภูตเทศกาลที่โผล่ทุก 15 นาทีในแผนที่ล่า (5)', 'Tokens: any kill (3%), alphas (1), bosses (5), and the festival spirit that appears every 15 minutes on field maps (5)')}</small></div>` : ''}
     <div class="sec">${L('ชุดลิมิเต็ดเทศกาล', 'Limited festival costumes')}</div><div class="shop">${rows}</div>
     <p class="hint">${L('ชุดเทศกาลไม่มีทดลองใช้ แลกได้เฉพาะช่วงเทศกาลของมัน · ได้แล้วเป็นของทั้งบัญชี · เหรียญรีเซ็ตเมื่อเทศกาลใหม่เริ่ม', 'Festival costumes have no free trial and trade only during their festival · once yours, the whole account keeps them · tokens reset when a new festival begins')}</p>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-evbuy]'); if (!b || b.disabled) return; const k = b.dataset.evbuy, c = COSTUME[k], t = evTok();
  if (!c || c.src !== 'event' || c.ev !== evLive() || cosHave(k) || t.n < c.tok) return;
  t.n -= c.tok; accSave(); cosGrant(k); save(); const n = NPCS.find(x => x.id === 'festival'); if (n) NPC_OPEN.festival(n);
});
/* a banner when you log in during a festival */
{ let shown = false; EV.on('tick', () => { if (shown || PAUSED || !S || !S.job) return; shown = true; const id = evLive(); if (id) setTimeout(() => { banner(L(`🎉 เทศกาล${evName(id)}! EXP +10% · ล่าเหรียญเทศกาลแลกชุดลิมิเต็ดกับแม่นางเทศกาลในอาเรน`, `🎉 ${evName(id)}! EXP +10% · hunt festival tokens for limited costumes from Mae Nang Thetsakan in Aren`)); }, 4200); }); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'events', t:['เทศกาลตามฤดูกาล', 'Seasonal festivals'], b:() => `<p>${L('ตามปฏิทินไทย: <b>ออกพรรษา</b> (ต.ค.) <b>ลอยกระทง</b> (15–30 พ.ย.) <b>ปีใหม่</b> (28 ธ.ค.–3 ม.ค.) <b>สงกรานต์</b> (10–16 เม.ย.) · ช่วงเทศกาล EXP +10% ฉากเปลี่ยนตามเทศกาล (กระทงลอยน้ำ โคมลอย พลุ สาดน้ำ) ได้เหรียญเทศกาลจากการล่า และมี <b>ภูตเทศกาล</b> โผล่ทุก 15 นาทีในแผนที่ล่า · แลกชุดลิมิเต็ดกับแม่นางเทศกาลในอาเรน (ไม่มีทดลองใช้) · เทศกาลเริ่มและจบเองตามวันเวลาจริง ไม่มีการตั้งค่า', 'On the Thai calendar: <b>End of Lent</b> (Oct), <b>Loy Krathong</b> (Nov 15–30), <b>New Year</b> (Dec 28–Jan 3), <b>Songkran</b> (Apr 10–16) · EXP +10%, festive scenery (floating krathongs, sky lanterns, fireworks, splashes), festival tokens from hunting and a <b>festival spirit</b> every 15 minutes on field maps · trade tokens for limited costumes with Mae Nang Thetsakan in Aren (no free trial) · festivals start and end by themselves on the real calendar; there is no setting for them')}</p>`});
