/* VAYRATHEN — js/sys/smith.js — the blacksmith: refining every piece of gear, and a full equipment shop
   ช่างตีเหล็กเพชร (Blacksmith Phet) stands by the forge in Aren. Talking to him opens the Forge window:
   · ตีบวก (Refine): weapons, armour and headgear each carry their OWN refine level, +0 to +15, saved on the piece
     itself (it travels with the item through trades, the market and the account bank). Accessories cannot be refined.
       – weapons use หินวายรา (Vayra Ore), armour and headgear use หินผนึกเกราะ (Aegis Ore); 2 ore from +11
       – cost in Bia grows with the item's level and the step; success: +1–+4 100%, +5–+7 70%, +8–+10 40%, +11–+15 15%
       – a failure from +5 up drops the piece one level; a ยันต์คุ้มครองตีบวก (Refine Ward) keeps the level,
         a หินนำโชค (Lucky Stone) adds +10% success; both are used up on the attempt they were added to
       – bonuses: weapon ATK (and MATK for weapons that have it) per level by weapon level, doubled past +7;
         armour DEF per level and Max HP +1% per level past +7; headgear MDEF per level and DEF every 2 levels
     The class's starting weapon (when no weapon item is worn) keeps its old refine (+5 ATK per level).
   · ร้านอุปกรณ์ (Shop): every weapon of your class, armour, headgear, accessories, arrows and refine materials.
     Bought gear is a fresh piece with a small chance to come out Rare or better.
   · ขายคืน (Sell back): sell pieces you no longer need (worn pieces are never listed). */
'use strict';

/* ---------- materials ---------- */
Object.assign(ITEMS, {
  ore_a:{name:'หินผนึกเกราะ', en:'Aegis Ore', kind:'mat', buy:1200, sell:120, desc:['แร่สำหรับตีบวกเกราะและหมวก', 'Ore for refining armour and headgear']},
  rf_luck:{name:'หินนำโชคช่างเหล็ก', en:"Smith's Lucky Stone", kind:'mat', buy:8000, sell:400, desc:['ใส่ตอนตีบวก: โอกาสสำเร็จ +10% (ใช้ไป 1 ก้อนต่อครั้ง)', 'Add when refining: +10% success (1 used per attempt)']},
  rf_guard:{name:'ยันต์คุ้มครองตีบวก', en:'Refine Ward', kind:'mat', buy:25000, sell:1000, desc:['ใส่ตอนตีบวก +5 ขึ้นไป: ล้มเหลวไม่ลดขั้น (ใช้ไป 1 แผ่นต่อครั้ง)', 'Add when refining to +5 or more: a failure keeps the level (1 used per attempt)']}
});
ITEMS.ore.buy = ITEMS.ore.buy || 1200; ITEMS.ore.sell = ITEMS.ore.sell || 120;
/* their pictures */
{ const _pick = iaPick;
  iaPick = function(id){
    const p = 'ia' + id.replace(/\W/g, '') + '§';
    if (id === 'ore_a') return {p, frame:1, glow:'#ffb848', art:[lg(p + 'r', ['#a89a90', '#6a5c54', '#3a302a'], 0, 0, 1, 1) + lg(p + 'c', ['#ffffff', '#ffd36a', '#c46a1a'], 0, 0, 1, 1),
      `<path d="M6 30l4-10 8-4 10 2 6 8-2 6H8z" fill="url(#${p}r)" ${OL}/>
       <path d="M12 24l3-12 4 3-1 10zM19 24l4-15 4 5-3 11zM25 26l4-8 2.6 4-2 5z" fill="url(#${p}c)" ${OL} style="filter:drop-shadow(0 0 2.4px #ffb848)"/>
       <path d="M20 26.5c-2.6-1-4-2.6-4-5.2v-3.2l4-1.6 4 1.6v3.2c0 2.6-1.4 4.2-4 5.2z" fill="#7a2e14" stroke="#ffe6a0" stroke-width="1.1"/>
       <path d="M21.6 11.6l-1.6 7" stroke="#fff" stroke-width="1" opacity=".8"/>`]};
    if (id === 'rf_luck') return {p, frame:2, glow:'#7fe08a', art:[rg(p + 'g', ['#f4fff0', '#7fe08a', '#1e7a3a', '#0c3a1c'], .4, .35, .75),
      `<path d="M20 5l11 9-4 17H13L9 14z" fill="url(#${p}g)" ${OL} style="filter:drop-shadow(0 0 3px #7fe08a)"/>
       <path d="M9 14h22M20 5l-4 9 4 17 4-17z" fill="none" stroke="#e8ffe0" stroke-width=".9" opacity=".7"/>
       <path d="M30.5 4.5l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1zM8 27l.8 1.8 1.8.8-1.8.8L8 32.2l-.8-1.8-1.8-.8 1.8-.8z" fill="#fff8c0"/>`]};
    if (id === 'rf_guard') return {p, frame:3, glow:'#c77dff', art:[lg(p + 'p', ['#fff8e4', '#f2e0b0', '#d8b878']) + rg(p + 's', ['#ffd0f0', '#c77dff', '#5a1a8a'], .4, .35, .7),
      `<path d="M11 4h18l-1 32H12z" fill="url(#${p}p)" ${OL}/>
       <path d="M14 8h12M14 11h12M15 30h10M15 33h10" stroke="#b8323a" stroke-width="1.2" stroke-linecap="round"/>
       <circle cx="20" cy="21" r="6.6" fill="url(#${p}s)" ${OL} style="filter:drop-shadow(0 0 3px #c77dff)"/>
       <path d="M20 16.5c-2 .8-3.2 2.4-3.2 4.6 0 2.4 1.6 3.8 3.2 4.6 1.6-.8 3.2-2.2 3.2-4.6 0-2.2-1.2-3.8-3.2-4.6z" fill="none" stroke="#fff4c0" stroke-width="1.1"/>`]};
    return _pick(id);
  };
}

/* ---------- refine levels live on each piece ---------- */
const RF_MAX = 15;
const rfKind = it => (it && it.kind === 'gear' && ['weapon', 'armor', 'head', 'shoes', 'shield', 'pants', 'acc', 'acc2'].includes(it.slot) ? (it.slot === 'acc2' ? 'acc' : it.slot) : null);   // v56: every slot refines into its own stat
const rfLvOf = it => (it && it.lv) || 1;
/* the stats a refine level adds to a piece (v56): weapon ATK or MATK by its line, body DEF, legs MDEF, head HP + SP,
   feet HIT + FLEE, shield a ward against elemental hits, accessories more damage. Past +7 every step counts double or adds a % */
const rfMagic = it => !!(it && it.st && (it.st.wmatk || it.st.wtype === 'staff' || it.wtype === 'staff'));
function rfBonus(it, rf){
  const k = rfKind(it), lv = rfLvOf(it), o = {}; if (!k || !rf) return o; const hi = Math.max(0, rf - 7);
  if (k === 'weapon'){ const per = 3 + Math.floor(lv / 30), v = per * rf + per * hi; if (rfMagic(it)) o.wmatk = v; else o.watk = v; }
  else if (k === 'armor'){ o.def = rf * (1 + Math.floor(lv / 50)); if (hi) o.hpPct = +(hi * .01).toFixed(3); }
  else if (k === 'pants'){ o.mdef = rf * (1 + Math.floor(lv / 50)); if (hi) o.mdef += hi * (1 + Math.floor(lv / 60)); }
  else if (k === 'head'){ o.hp = rf * (8 + Math.floor(lv / 6)); o.sp = rf * (2 + Math.floor(lv / 25)); if (hi){ o.hpPct = +(hi * .006).toFixed(3); o.spPct = +(hi * .006).toFixed(3); } }
  else if (k === 'shoes'){ o.hit = rf * (1 + Math.floor(lv / 60)) + hi; o.flee = rf * (1 + Math.floor(lv / 60)) + hi; }
  else if (k === 'shield'){ o.elemAllPct = +(rf * .008 + hi * .008).toFixed(3); }
  else if (k === 'acc'){ o.atkPct = o.matkPct = +(rf * .004 + hi * .004).toFixed(3); }
  return o;
}
const rfBonusText = (it, rf) => { const b = rfBonus(it, rf), out = [], pc = v => +(v * 100).toFixed(1) + '%';
  if (b.watk) out.push(`ATK +${b.watk}`); if (b.wmatk) out.push(`MATK +${b.wmatk}`); if (b.def) out.push(`DEF +${b.def}`); if (b.mdef) out.push(`MDEF +${b.mdef}`);
  if (b.hp) out.push(`Max HP +${b.hp}`); if (b.sp) out.push(`Max SP +${b.sp}`); if (b.hpPct) out.push(`Max HP +${pc(b.hpPct)}`); if (b.spPct) out.push(`Max SP +${pc(b.spPct)}`);
  if (b.hit) out.push(`HIT +${b.hit}`); if (b.flee) out.push(`FLEE +${b.flee}`);
  if (b.elemAllPct) out.push(L(`ลดดาเมจธาตุ ${pc(b.elemAllPct)}`, `Elemental damage −${pc(b.elemAllPct)}`));
  if (b.atkPct) out.push(`ATK +${pc(b.atkPct)} · MATK +${pc(b.matkPct)}`); return out.join(' · '); };
/* the shield's elemental ward: hits from an element other than neutral land softer (at most 40%) */
{ const _ma = mobAttack;
  mobAttack = function(m, mult = 1, noDodge){
    if (m && m.def && m.def.elem && m.def.elem !== 'neutral'){ const id = S.gear && S.gear.shield, it = id && ITEMS[id];
      const w = it && it.st && it.st.elemAllPct && (typeof shieldOk !== 'function' || shieldOk()) ? Math.min(.4, it.st.elemAllPct) : 0; if (w > 0) mult *= 1 - w; }
    return _ma.call(this, m, mult, noDodge); }; }
if (typeof gearStatText === 'function'){ const _g = gearStatText; gearStatText = function(st){ const s = _g.apply(this, arguments); if (!st || !st.elemAllPct) return s;
  const t = L(`ลดดาเมจธาตุ ${+(st.elemAllPct * 100).toFixed(1)}%`, `Elemental damage −${+(st.elemAllPct * 100).toFixed(1)}%`); return s ? `${s} · ${t}` : t; }; }
/* every instance is registered with its refine: stats, name "+7 ดาบ…" and sell price */
{ const _reg = regInst;
  regInst = function(key, d){
    const ok = _reg(key, d); if (!ok) return ok;
    const it = ITEMS[key], rf = rfKind(it) ? clamp(d.rf | 0, 0, RF_MAX) : 0; it.rf = rf; if (!rf) return ok;
    const st = {...it.st}, b = rfBonus(it, rf);
    for (const k in b) st[k] = k.endsWith('Pct') ? +((st[k] || 0) + b[k]).toFixed(3) : (st[k] || 0) + b[k];
    Object.assign(it, {st, name:`+${rf} ${it.name}`, en:`+${rf} ${it.en}`, sell:Math.round((it.sell || 0) * (1 + rf * .15))});
    return ok;
  };
}
{ const _san = sanitizeInst;
  sanitizeInst = function(d){ const r = _san(d); if (r && d && d.rf) r.rf = clamp(d.rf | 0, 0, RF_MAX); return r; };
}
/* tooltips and the equipment window show the refine line */
{ const _gl = gearLines;
  gearLines = function(id){ const s = _gl(id), it = ITEMS[id]; return it && it.rf ? `${s}<span class="rfl">✦ ${L('ตีบวก', 'Refine')} +${it.rf} · ${rfBonusText(it, it.rf)}</span>` : s; };
}
/* the icon wears its "+7" */
{ const _art = itemArt;
  itemArt = function(id, bare = false){
    const s = _art(id, bare), it = ITEMS[id]; if (!it || !it.rf) return s;
    const c = it.rf >= 10 ? '#ffd36a' : it.rf >= 7 ? '#ffe6a0' : '#fff6e0';
    return s.replace(/<\/svg>$/, `<text x="3.4" y="36.4" font-family="Mali,sans-serif" font-size="10.5" font-weight="800" fill="${c}" stroke="#2a1204" stroke-width="2.6" paint-order="stroke"${it.rf >= 10 ? ' style="filter:drop-shadow(0 0 2px #ffb830)"' : ''}>+${it.rf}</text></svg>`);
  };
}
/* the highest refine you hold anywhere (for the refine achievements) */
function maxRefine(){
  let m = S.refine || 0; const st = S.inst || {};
  for (const k in st) m = Math.max(m, st[k].rf | 0);
  return m;
}
/* old saves: the single weapon refine moves onto the weapon you are wearing (once) */
function rfMigrate(){
  if (!S || S.rfv === 1) return; S.rfv = 1;
  const w = S.gear && S.gear.weapon, it = w && ITEMS[w], d = w && instStore()[w];
  if ((S.refine || 0) > 0 && it && d && canWield(it)){ d.rf = Math.max(d.rf | 0, S.refine); regInst(w, d); S.refine = 0; derive();
    log(L(`ระดับตีบวกย้ายไปอยู่บน ${nm(ITEMS[w])} แล้ว`, `Your refine level now lives on ${nm(ITEMS[w])}`), 'g'); dirty = true; save(); }
}
EV.on('tick', () => { if (!PAUSED && S && S.lvl && S.rfv !== 1) rfMigrate(); });

/* ---------- what can be refined, and what it costs ---------- */
const RF = {tab:'refine', sel:null, shop:'weapon', luck:false, guard:false, busy:false, last:null};
const jobWeaponWorn = () => { const w = S.gear && S.gear.weapon, it = w && ITEMS[w]; return !!(it && canWield(it)); };
function rfInfo(id){
  if (id === 'job'){ if (jobWeaponWorn()) return null; const w = JOBS[S.job].weapon, pic = GEAR['w_' + w.type + '0'] ? 'w_' + w.type + '0' : null;
    return {id, job:true, name:nm(w), icon:pic ? itemIcon(pic) : '', rf:S.refine || 0, lv:1, kind:'weapon', worn:true, it:null}; }
  const it = ITEMS[id], k = rfKind(it); if (!k || !it.base) return null;
  const worn = !!(S.gear && Object.values(S.gear).includes(id)); if (!worn && !S.inv[id]) return null;
  return {id, name:nm(it), icon:itemIcon(id), rf:it.rf || 0, lv:rfLvOf(it), kind:k, worn, it};
}
function rfTargets(){
  const out = []; if (!jobWeaponWorn()) out.push('job');
  for (const sl of ['weapon', 'shield', 'head', 'armor', 'pants', 'shoes', 'acc', 'acc2']){ const id = S.gear && S.gear[sl]; if (id && rfInfo(id)) out.push(id); }
  const bag = Object.keys(S.inv).filter(k => rfKind(ITEMS[k]) && ITEMS[k].base).sort((a, b) => (ITEMS[b].rf || 0) - (ITEMS[a].rf || 0) || rfLvOf(ITEMS[b]) - rfLvOf(ITEMS[a]));
  return out.concat(bag);
}
const rfMat = info => (info.kind === 'weapon' ? 'ore' : 'ore_a');   // accessories use armour ore
const rfCost = (info, nx) => ({mat:rfMat(info), n:nx >= 11 ? 2 : 1, z:Math.round((150 + info.lv * 25) * nx * (nx >= 11 ? 2 : 1))});
const rfRate = nx => Math.min(100, REFINE_RATE(nx) + (RF.luck && haveN('rf_luck') > 0 && REFINE_RATE(nx) < 100 ? 10 : 0));
const rfGain = (info, rf) => (info.job ? (rf ? (JOBS[S.job].weapon.type === 'staff' ? `MATK +${rf * 5}` : `ATK +${rf * 5}`) : '—') : rfBonusText(info.it, rf) || '—');

/* ---------- the anvil: sound (original synthesis) ---------- */
function rfSound(kind){
  const r = SFX.raw && SFX.raw(); if (!r) return; const {ac, out} = r, t = ac.currentTime + .01;
  const tone = (f, t0, dur, g0, type = 'sine', to) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(g0, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur); o.connect(g); g.connect(out); o.start(t0); o.stop(t0 + dur + .05); };
  const clang = (t0, k = 1) => { [1, 2.76, 5.4, 8.93].forEach((m, i) => tone(470 * k * m, t0, .9 / (i + 1), .22 / (i + 1))); tone(90, t0, .12, .35, 'triangle', 50); };
  if (kind === 'hit') clang(t, 1 + Math.random() * .06);
  else if (kind === 'ok'){ clang(t, 1.12); [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + .12 + i * .08, .7, .16)); tone(2093, t + .45, 1.1, .08); }
  else { clang(t, .86); tone(196, t + .14, .5, .2, 'triangle', 150); tone(147, t + .32, .7, .22, 'triangle', 98); }
}

/* ---------- refining ---------- */
function rfGo(id){
  if (RF.busy) return; const info = rfInfo(id); if (!info) return; const nx = info.rf + 1;
  if (nx > RF_MAX){ toast(L('ตีบวกสูงสุดแล้ว', 'Already at the maximum')); return; }
  const c = rfCost(info, nx);
  if (haveN(c.mat) < c.n){ toast(L(`${nm(ITEMS[c.mat])} ไม่พอ`, `Not enough ${nm(ITEMS[c.mat])}`)); return; }
  if (S.bia < c.z){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; }
  const luck = RF.luck && haveN('rf_luck') > 0 && REFINE_RATE(nx) < 100, guard = RF.guard && haveN('rf_guard') > 0 && nx >= 5, rate = rfRate(nx);
  const take = (k, n) => { S.inv[k] -= n; if (S.inv[k] <= 0) delete S.inv[k]; };
  take(c.mat, c.n); S.bia -= c.z; if (luck) take('rf_luck', 1); if (guard) take('rf_guard', 1);
  RF.busy = true; RF.last = null; const st = el('rfStage'); if (st){ st.classList.remove('ok', 'fail'); st.classList.add('hammer'); }
  rfSound('hit'); setTimeout(() => rfSound('hit'), 220); setTimeout(() => rfSound('hit'), 440);
  setTimeout(() => {
    const ok = Math.random() * 100 < rate, to = ok ? nx : (nx >= 5 && !guard ? info.rf - 1 : info.rf);
    if (info.job) S.refine = to; else { const d = instStore()[id]; if (d){ d.rf = to; regInst(id, d); } }
    derive(); bump('refines'); EV.emit('refine', to);
    const nm2 = info.job ? nm(JOBS[S.job].weapon) : nm(ITEMS[id]);
    if (ok){ rfSound('ok'); VFX.play('refine', {x:P.x, y:P.y, ok:true}); banner(L(`ตีบวกสำเร็จ! ${nm2}`, `Refine success! ${nm2}`)); log(L(`ตีบวกสำเร็จ: ${nm2}`, `Refine success: ${nm2}`), 'g'); if (to >= 10) VFX.shake && VFX.shake(2); }
    else { rfSound('fail'); VFX.play('refine', {x:P.x, y:P.y, ok:false});
      const msg = guard ? L('ล้มเหลว · ยันต์คุ้มครองรักษาขั้นไว้ได้', 'Failed · the ward kept the level') : to < info.rf ? L(`ล้มเหลว · ลดเหลือ +${to}`, `Failed · dropped to +${to}`) : L('ล้มเหลว', 'Failed');
      banner(msg); log(`${msg} (${nm2})`, 'r'); }
    RF.last = {ok, from:info.rf, to, guard}; RF.busy = false; dirty = true; save(); fgKeepList();
    if (typeof renderEquip === 'function' && !el('win-equip').hidden) renderEquip(); if (typeof renderBag === 'function') renderBag();
  }, 680);
}

/* ---------- shop and sell-back ---------- */
function fgBuy(id, n = 1){
  const it = ITEMS[id], gr = typeof GEAR !== 'undefined' && GEAR[id];
  if (gr){ if (S.lvl < gr.lv){ toast(L(`ต้อง Lv ${gr.lv}`, `Needs Lv ${gr.lv}`)); return; } if (S.bia < gr.buy){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; }
    S.bia -= gr.buy;
    if (gr.slot === 'ammo'){ addItem(id, gr.pack || 1); if (ammoFits(id) && (!S.gear.ammo || !S.inv[S.gear.ammo] || !ammoFits(S.gear.ammo))){ S.gear.ammo = id; derive(); } }
    else { const key = rollGear(id, 'shop', P.x, P.y - 20); addItem(key, 1); }
    SFX.play('coin'); log(L(`ซื้อ ${nm(gr)}`, `Bought ${nm(gr)}`), 'g'); toast(L('ซื้อแล้ว · สวมได้ในหน้าต่างอุปกรณ์ (Q)', 'Bought · wear it from the Equipment window (Q)'));
  } else if (it && it.buy){ const cost = it.buy * n; if (S.bia < cost){ toast(L('เงินไม่พอ', 'Not enough Bia')); return; } S.bia -= cost; addItem(id, n); SFX.play('coin'); log(L(`ซื้อ ${nm(it)} ×${n}`, `Bought ${nm(it)} ×${n}`)); }
  dirty = true; save(); fgKeepList();
}
function fgSell(id){
  const it = ITEMS[id]; if (!it || it.kind !== 'gear' || !S.inv[id]) return;
  const go = () => { if (!S.inv[id]) return; const p = Math.round((it.sell || 0) * (1 + ((DER && DER.pas.biaPct) || 0))); S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; S.bia += p;
    if (typeof instPrune === 'function') instPrune(); SFX.play('coin'); VFX.play('coins', {x:P.x, y:P.y - 30}); log(L(`ขาย ${nm(it)} ได้ ${fmtN(p)} เบี้ย`, `Sold ${nm(it)} for ${fmtN(p)} Bia`), 'g'); dirty = true; save(); WIN_RENDER.forge(); };
  if ((it.rar || 0) >= 2 || (it.rf || 0) >= 7) askConfirm(L('ขายของดี', 'Sell a fine piece'), L(`ขาย ${nm(it)} ใช่ไหม? ขายแล้วเอาคืนไม่ได้`, `Sell ${nm(it)}? This cannot be undone.`), L('ขาย', 'Sell'), go);
  else go();
}

/* ---------- the Forge window ---------- */
mkWin('forge', 'โรงตีเหล็ก', 'Forge', '', '<path d="M3 9h11l-2 3H6z"/><path d="M8 12v3M5 16h7"/><path d="M13 3l3 3-4 4-3-3z"/>', false);
WIN_RENDER.forge = function(){
  const pane = el('pane-forge'); if (!pane) return;
  const tabs = [['refine', 'ตีบวก', 'Refine'], ['buy', 'ร้านอุปกรณ์', 'Shop'], ['sell', 'ขายคืน', 'Sell back']];
  const wallet = `<span class="fgwal">${fmtN(S.bia)} <small>${CUR()}</small></span>`;
  let body = '';
  if (RF.tab === 'refine'){
    const list = rfTargets(); if (!list.includes(RF.sel)) RF.sel = list[0] || null;
    const tile = id => { const i = rfInfo(id); return `<button class="rftile${RF.sel === id ? ' on' : ''}${i.worn ? ' worn' : ''} rr${i.it ? rarOf(id) : 0}" data-rfsel="${id}"><span class="ic">${i.icon}</span>${i.job && i.rf ? `<em>+${i.rf}</em>` : ''}<small>${i.name}</small>${i.worn ? `<i>${L('สวมอยู่', 'worn')}</i>` : ''}</button>`; };
    const worn = list.filter(id => rfInfo(id).worn), bag = list.filter(id => !rfInfo(id).worn);
    const info = RF.sel && rfInfo(RF.sel);
    let stage = `<p class="hint">${L('ยังไม่มีอุปกรณ์ที่ตีบวกได้ · ซื้อได้ที่แท็บร้านอุปกรณ์', 'No gear to refine yet · buy some in the Shop tab')}</p>`;
    if (info){
      const nx = info.rf + 1, max = info.rf >= RF_MAX, c = rfCost(info, Math.min(nx, RF_MAX)), rate = max ? 0 : rfRate(nx), hm = haveN(c.mat);
      const lvc = info.rf >= 10 ? 'l3' : info.rf >= 7 ? 'l2' : info.rf >= 4 ? 'l1' : 'l0';
      const res = RF.last ? `<div class="rfres ${RF.last.ok ? 'ok' : 'fail'}">${RF.last.ok ? `✦ ${L('สำเร็จ', 'Success')} +${RF.last.from} → +${RF.last.to} ✦` : RF.last.guard ? L('ล้มเหลว · ยันต์รักษาขั้นไว้', 'Failed · the ward kept the level') : RF.last.to < RF.last.from ? L(`ล้มเหลว · +${RF.last.from} → +${RF.last.to}`, `Failed · +${RF.last.from} → +${RF.last.to}`) : L('ล้มเหลว · ขั้นเท่าเดิม', 'Failed · level kept')}</div>` : '';
      const tog = (k, item, txt) => { const have = haveN(item); return `<label class="rftog${have ? '' : ' off'}"><input type="checkbox" data-rftog="${k}" ${RF[k] && have ? 'checked' : ''} ${have ? '' : 'disabled'}><span class="ic">${itemIcon(item)}</span><span><b>${nm(ITEMS[item])} <em>×${have}</em></b><small>${txt}</small></span></label>`; };
      stage = `<div class="rfstage ${lvc}${RF.last ? (RF.last.ok ? ' ok' : ' fail') : ''}" id="rfStage">
        <div class="rfhead"><div class="rfanvil"><i class="rfray"></i><i class="rfring"></i><div class="rfbig">${info.icon}</div><i class="rfspark"></i><b class="rflv">+${info.rf}</b></div>
        <div class="rfhinfo"><b class="rfname rar r${info.it ? rarOf(info.id) : 0}">${info.name}</b>${res}
        ${max ? `<p class="rfmax">${L('ตีบวกสูงสุด +15 แล้ว · หัตถ์เทวะ!', 'Maxed at +15 · Hand of the Gods!')}</p></div></div>` : `
        <div class="rfstep"><span>+${info.rf}</span><i>➜</i><span class="nx">+${nx}</span></div>
        <div class="rfgain"><span>${rfGain(info, info.rf)}</span><i>➜</i><b>${rfGain(info, nx)}</b></div></div></div>
        <div class="pbar rate rfrate"><i style="width:${rate}%"></i><span>${L('โอกาสสำเร็จ', 'Success')} ${rate}%</span></div>
        <div class="rfneed"><span class="cneed${hm >= c.n ? ' ok' : ''}"><i>${itemIcon(c.mat)}</i>${nm(ITEMS[c.mat])} ${fmtN(hm)}/${c.n}</span><span class="cneed${S.bia >= c.z ? ' ok' : ''}"><i class="cz"><i class="biaI"></i></i>${fmtN(c.z)} ${CUR()}</span></div>
        <div class="rftogs">${REFINE_RATE(nx) < 100 ? tog('luck', 'rf_luck', L('+10% โอกาสสำเร็จ', '+10% success')) : ''}${nx >= 5 ? tog('guard', 'rf_guard', L('ล้มเหลวไม่ลดขั้น', 'Failure keeps the level')) : ''}</div>
        <p class="hint">${nx >= 5 ? L('ขั้นนี้ถ้าล้มเหลวจะลดลง 1 ขั้น (ยกเว้นใส่ยันต์คุ้มครอง)', 'At this step a failure drops one level (unless warded)') : L('ขั้นนี้สำเร็จแน่นอน 100%', 'This step always succeeds')}</p>
        <button class="btn gold rfgo" data-rfgo="${info.id}" ${hm >= c.n && S.bia >= c.z && !RF.busy ? '' : 'disabled'}>🔨 ${L('ตีบวก', 'Refine')}</button>`}
      </div>`;
    }
    body = `<div class="rfwrap"><div class="rflist">
        ${worn.length ? `<div class="sec">${L('สวมอยู่', 'Worn')}</div><div class="rftiles">${worn.map(tile).join('')}</div>` : ''}
        <div class="sec">${L('ในกระเป๋า', 'In your bag')} <span class="ct">${bag.length}</span></div><div class="rftiles">${bag.length ? bag.map(tile).join('') : `<p class="hint">${L('ไม่มี', 'None')}</p>`}</div>
        <p class="hint">${L('ตีบวกได้: อาวุธ · โล่ · หมวก · เสื้อ · กางเกง · รองเท้า (หู ตา หน้า ปาก และเครื่องประดับตีบวกไม่ได้) · ระดับตีบวกติดไปกับชิ้นนั้นเสมอ', 'Refinable: weapon · shield · head · body · legs · feet (not ears, eyes, face, mouth or accessories) · the level stays on that piece')}</p>
      </div>${stage}</div>`;
  } else if (RF.tab === 'buy'){
    const wt = JOBS[S.job].weapon.type, bow = wt === 'bow' || S.job === 'novice';
    const subs = [['weapon', 'อาวุธ', 'Weapons'], ammoWant() === 'star' ? ['ammo', 'ดาวกระจาย', 'Stars'] : ['ammo', 'ลูกธนู', 'Arrows'], ['head', 'หมวก', 'Head'], ['shield', 'โล่', 'Shields'], ['armor', 'เสื้อเกราะ', 'Body'], ['pants', 'กางเกง', 'Legs'], ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessories'], ['mat', 'วัสดุตีบวก', 'Refine materials']];
    if (!subs.some(s => s[0] === RF.shop)) RF.shop = 'weapon';
    const gearRow = ([id]) => { const gr = GEAR[id], ok = S.lvl >= gr.lv;
      return `<div class="srow fgrow${ok ? '' : ' locked'}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(gr)}</b><small>${gearStatText(gr.st)} · <span class="${ok ? '' : 'bad'}">Lv ${gr.lv}</span>${gr.pack > 1 ? ` · ×${gr.pack}` : ''}</small></div>
        <span class="pr">${fmtN(gr.buy)}</span><button class="btn sm${ok && S.bia >= gr.buy ? ' gold' : ''}" data-fgbuy="${id}" ${ok && S.bia >= gr.buy ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button></div>`; };
    const matRow = id => { const it = ITEMS[id]; return `<div class="srow fgrow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(it)} <span class="ct">${L('มี', 'have')} ${haveN(id)}</span></b><small>${itemDesc(id)}</small></div>
        <span class="pr">${fmtN(it.buy)}</span>${qtyBox(id, 'fg')}</div>`; };
    let rows = '';
    const ammoRow = ([id]) => { const gr = GEAR[id], ok = S.lvl >= gr.lv;
      return `<div class="srow fgrow${ok ? '' : ' locked'}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(gr)} <span class="ct">${L('มี', 'have')} ${(S.inv[id] || 0).toLocaleString()}</span></b><small>${gearStatText(gr.st)} · <span class="${ok ? '' : 'bad'}">Lv ${gr.lv}</span> · ${L(`ห่อละ ${gr.pack || 1} ${ammoKind(id) === 'star' ? 'ดวง' : 'ดอก'}`, `${gr.pack || 1} per pack`)}</small></div>
        <span class="pr">${fmtN(gr.buy)}<small> /${L('ห่อ', 'pack')}</small></span>${qtyBox(id, 'pack')}</div>`; };
    if (RF.shop === 'ammo') rows = GEAR_LIST.filter(g => g[1] === 'ammo' && ammoKind(g[0]) === ammoWant()).sort((a, b) => a[4] - b[4]).map(ammoRow).join('');
    else if (RF.shop === 'mat') rows = ['ore', 'ore_a', 'rf_luck', 'rf_guard'].map(matRow).join('');
    else rows = GEAR_LIST.filter(g => g[1] === RF.shop && lineOk(g[6]) && (RF.shop !== 'weapon' || (g[6] && g[6].wtype === wt && !(g[6].hands === '2h' && wt === 'dagger' && !jobChain().includes('rogue'))))).sort((a, b) => a[4] - b[4]).map(gearRow).join('') || `<p class="hint">${L('ไม่มีสินค้าสำหรับอาชีพนี้', 'Nothing for this class')}</p>`;
    body = `<div class="fgsub">${subs.map(([k, th, en]) => `<button class="${RF.shop === k ? 'on' : ''}" data-fgshop="${k}">${L(th, en)}</button>`).join('')}</div>
      ${RF.shop === 'weapon' ? `<p class="hint">${L(`อาวุธสำหรับ${nm(JOBS[S.job])} (${L(...WTYPE[wt])})`, `Weapons for ${nm(JOBS[S.job])} (${WTYPE[wt][1]})`)} · ${L('ของจากร้านมีโอกาสออกหายากขึ้นไป', 'shop pieces can come out Rare or better')}</p>` : ''}
      <div class="shop">${rows}</div>`;
  } else {
    const worn = new Set(Object.values(S.gear || {}));
    const list = Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].kind === 'gear' && !worn.has(k)).sort((a, b) => (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0));
    const zb = 1 + ((DER && DER.pas.biaPct) || 0);
    body = `<div class="shop">${list.length ? list.map(id => { const it = ITEMS[id]; return `<div class="srow fgrow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b class="rar r${rarOf(id)}">${nm(it)}</b><small>${gearLines(id)}</small></div>
        <span class="pr plus">+${fmtN(Math.round((it.sell || 0) * zb))}</span><button class="btn sm" data-fgsell="${id}">${L('ขาย', 'Sell')}</button></div>`; }).join('')
      : `<p class="hint">${L('ไม่มีอุปกรณ์ในกระเป๋าที่ขายได้ (ชิ้นที่สวมอยู่จะไม่แสดง)', 'No gear in your bag to sell (worn pieces are not listed)')}</p>`}</div>`;
  }
  pane.innerHTML = `<div class="fghead"><div class="fgtabs">${tabs.map(([k, th, en]) => `<button class="${RF.tab === k ? 'on' : ''}" data-fgtab="${k}">${L(th, en)}</button>`).join('')}</div>${wallet}</div>${body}`;
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-fgtab],[data-fgshop],[data-rfsel],[data-rfgo],[data-fgbuy],[data-fgsell],[data-fgopen]'); if (!b || b.disabled) return; const d = b.dataset;
  if (d.fgopen){ RF.tab = d.fgopen; RF.last = null; closeDialog(); openWin('forge'); return; }
  if (d.fgtab){ RF.tab = d.fgtab; RF.last = null; }
  else if (d.fgshop) RF.shop = d.fgshop;
  else if (d.rfsel){ RF.sel = d.rfsel; RF.last = null; fgKeepList(); return; }
  else if (d.rfgo){ rfGo(d.rfgo); return; }
  else if (d.fgbuy){ fgBuy(d.fgbuy, +(d.n || 1)); return; }
  else if (d.fgsell){ fgSell(d.fgsell); return; }
  WIN_RENDER.forge();
});
document.addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.rftog; if (!k) return; RF[k] = e.target.checked; fgKeepList(); });
/* (v100) picking a piece or ticking a charm redraws only the anvil side: the list of pieces stays the same nodes (no
   icon is drawn again, the scroll stays put), so the window does not blink on every tap */
function fgKeepList(){
  const pane = el('pane-forge'), old = pane && pane.querySelector('.rflist'), sc = old ? old.scrollTop : 0, psc = pane ? pane.scrollTop : 0;
  const ids = n => [...n.querySelectorAll('[data-rfsel]')].map(t => t.dataset.rfsel + '|' + t.textContent).join(',');
  const was = old && ids(old); WIN_RENDER.forge(); if (!pane) return;
  if (typeof NOFL !== 'undefined') NOFL.flush(pane);   // (v161) merge the redraw now, so the list below is compared with what is on screen
  const nu = pane.querySelector('.rflist');
  if (old && nu && was === ids(nu)){ for (const t of old.querySelectorAll('[data-rfsel]')) t.classList.toggle('on', t.dataset.rfsel === RF.sel); nu.replaceWith(old); old.scrollTop = sc; }
  pane.scrollTop = psc;
}

/* ---------- the blacksmith ---------- */
addTownNpc({id:'smith', name:'ช่างตีเหล็กเพชร', en:'Blacksmith Phet', role:'ตีบวก · ร้านอาวุธและอุปกรณ์', roleEn:'Refine · Weapons & gear', x:600, y:820},
  {job:'warlord', look:{sex:'m', hair:3, color:''}, gear:{armor:'a_padded', weapon:'w_sword3'}});
NPC_OPEN.smith = n => {
  const w = S.gear && S.gear.weapon && ITEMS[S.gear.weapon];
  npcFrame(n, L(`ค้อนพร้อม ทั่งร้อน! ${w && w.rf ? `${nm(w)} ของเจ้าดูดีนี่ ` : ''}จะตีบวกอาวุธ เกราะ หมวก หรือจะซื้ออุปกรณ์ใหม่ ข้ามีครบทุกอย่าง`, `Hammer ready, anvil hot! ${w && w.rf ? `Fine ${nm(w)} you have. ` : ''}Refine a weapon, armour or helm, or buy new gear: I have it all.`),
    `<div class="fgnpc"><button class="btn gold wide" data-fgopen="refine">🔨 ${L('ตีบวกอุปกรณ์', 'Refine gear')}</button>
     <button class="btn wide" data-fgopen="buy">⚔ ${L('ร้านอาวุธและอุปกรณ์', 'Weapons & gear shop')}</button>
     <button class="btn wide" data-fgopen="sell">💰 ${L('ขายอุปกรณ์คืน', 'Sell gear back')}</button></div>
     <p class="hint">${L('หินวายรา = ตีบวกอาวุธ · หินผนึกเกราะ = ตีบวกเกราะ/หมวก · หินนำโชค +10% · ยันต์คุ้มครองกันลดขั้น', 'Vayra Ore = weapons · Aegis Ore = armour/headgear · Lucky Stone +10% · Refine Ward stops the drop')}</p>`);
};
/* Auntie Buakham sends refiners to the smith now */
{ const b = (typeof NPCS_HOME !== 'undefined' ? NPCS_HOME : NPCS).find(x => x.id === 'shop'); if (b){ b.role = 'ร้านยา · ของใช้'; b.roleEn = 'Potions · Supplies'; } }

/* ---------- the wiki ---------- */
if (typeof WIKI_SYS !== 'undefined'){
  const i = WIKI_SYS.findIndex(a => a.id === 'refine'), entry = {id:'refine', t:['ตีบวกอุปกรณ์', 'Refining gear'], b:() => `<p>${L('ตีบวกกับช่างตีเหล็กเพชรในนครอาเรน (ข้างเตาหลอม) · ตีบวกได้ทั้งอาวุธ เกราะ และหมวก แต่ละชิ้นเก็บระดับของตัวเอง +0 ถึง +15 และติดไปกับชิ้นนั้นเวลาเทรด ขายในตลาด หรือฝากคลัง · เครื่องประดับตีบวกไม่ได้', 'Refine with Blacksmith Phet in Aren (by the forge) · weapons, armour and headgear each keep their own level, +0 to +15, which travels with the piece through trades, the market and the bank · accessories cannot be refined')}</p>
    <table class="wkt"><tr><th>${L('ขั้น', 'Level')}</th><th>${L('โอกาสสำเร็จ', 'Success')}</th><th>${L('ล้มเหลว', 'On failure')}</th></tr>${[[1, 4], [5, 7], [8, 10], [11, 15]].map(([a, b]) => `<tr><td>+${a}–+${b}</td><td>${REFINE_RATE(a)}%</td><td>${a >= 5 ? L('ลด 1 ขั้น', '−1 level') : '—'}</td></tr>`).join('')}</table>
    <p>${L('วัสดุ: หินวายรา (อาวุธ) · หินผนึกเกราะ (เกราะ/หมวก) · ใช้ 2 ก้อนตั้งแต่ +11 · ค่าตีบวกขึ้นกับเลเวลของชิ้นและขั้น · หินนำโชค +10% · ยันต์คุ้มครองทำให้ล้มเหลวไม่ลดขั้น (ใช้ไปทุกครั้งที่ใส่)', 'Materials: Vayra Ore (weapons) · Aegis Ore (armour/headgear) · 2 ore from +11 · the Bia cost grows with the piece level and the step · Lucky Stone +10% · Refine Ward keeps the level on failure (used up whenever added)')}</p>
    <p>${L('โบนัส: อาวุธ ATK ต่อขั้นตามเลเวลอาวุธ (และ MATK ถ้าอาวุธมี) เกิน +7 ได้สองเท่า · เกราะ DEF ต่อขั้น เกิน +7 ได้ Max HP +1% ต่อขั้น · หมวก MDEF ต่อขั้นและ DEF ทุก 2 ขั้น', 'Bonus: weapons ATK per level by weapon level (and MATK if the weapon has it), doubled past +7 · armour DEF per level, Max HP +1% per level past +7 · headgear MDEF per level and DEF every 2 levels')}</p>`};
  if (i >= 0) WIKI_SYS[i] = entry; else WIKI_SYS.push(entry);
}
