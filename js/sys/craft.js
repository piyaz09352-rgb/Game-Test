/* VAYRATHEN — js/sys/craft.js
   Crafting (หลอมของ), window I or Master Smith In at the Aren forge:
   · Forge gear: every armour, headgear, accessory and your class's weapons, from monster materials of the
     item's level band + Vayra Ore + Bia. A forged piece rolls its rarity with better odds than a drop.
   · Ore: Vayra Ore from monster loot or Dust (potions and talismans: Herbalist Pheng, sys/cooking.js).
   · Salvage: break unwanted gear into Vayra Dust (more for higher level and rarity).
   · Reforge: spend Dust and Bia to re-roll the bonus lines of a Rare / Epic / Legendary piece.
   Recipes are generated from the game data, so they are the same for everyone and always match the world. */
'use strict';

ITEMS.dust = {name:'ผงวายรา', en:'Vayra Dust', kind:'mat', sell:0, forgeOnly:1, desc:['ผงจากการย่อยอุปกรณ์ · ใช้เป็นวัตถุดิบหลอมของเท่านั้น (ขายไม่ได้)', 'Dust from salvaged gear · only for forging (cannot be sold)']};
const MAT_MOBS = Object.keys(MOB).filter(k => !MOB[k].boss && ITEMS['m_' + k]).sort((a, b) => MOB[a].lvl - MOB[b].lvl);
function matsNear(lv, seed, n){
  let pool = MAT_MOBS.filter(k => MOB[k].lvl >= lv - 10 && MOB[k].lvl <= lv + 15); if (pool.length < n) pool = MAT_MOBS.slice().sort((a, b) => Math.abs(MOB[a].lvl - lv) - Math.abs(MOB[b].lvl - lv)).slice(0, 6);
  const out = []; let h = hashS(seed); while (out.length < n && pool.length){ const k = pool[h % pool.length]; if (!out.includes(k)) out.push(k); h = Math.imul(h ^ (h >>> 13), 2654435761) >>> 0; if (out.length >= pool.length) break; }
  return out.map(k => 'm_' + k);
}
const RECIPES = [];
for (const [id, slot, , , lv] of GEAR_LIST){ if (slot === 'ammo') continue; const tier = Math.min(5, Math.floor(lv / 20));
  const mats = matsNear(lv, id, 2), need = [[mats[0], 4 + tier * 2], [mats[1] || mats[0], 3 + tier]];
  if (lv >= 10) need.push(['ore', 1 + Math.floor(lv / 30)]);
  if (lv >= 10) need.push(['dust', 1 + Math.floor(lv / 25)]);   // salvaged gear goes back into forging
  RECIPES.push({id:'f_' + id, out:id, n:1, kind:'gear', slot, lv, need:need.filter(x => x[0]), bia:200 + Math.round(lv * lv * 2.5)}); }
/* potions and talismans are brewed by Herbalist Pheng in Aren (sys/cooking.js); only ore is made here */
const BREW = [['ore', 1, [[matsNear(35, 'ore1', 1)[0], 6]], 300, 20], ['ore', 2, [['dust', 6]], 100, 1]];
BREW.forEach(([out, n, need, bia, lv], i) => RECIPES.push({id:'b_' + out + i, out, n, kind:'use', lv, need, bia}));
const RCP = Object.fromEntries(RECIPES.map(r => [r.id, r]));
const CRAFT = {tab:'gear', slot:'all', sel:null, q:''};
const haveN = id => S.inv[id] || 0;
const canCraft = r => S.bia >= r.bia && r.need.every(([id, n]) => haveN(id) >= n);
function doCraft(rid){
  const r = RCP[rid]; if (!r || !canCraft(r)) return;
  for (const [id, n] of r.need){ S.inv[id] -= n; if (S.inv[id] <= 0) delete S.inv[id]; } S.bia -= r.bia;
  let got = r.out;
  if (r.kind === 'gear'){ got = rollGear(r.out, 'craft', P.x, P.y - 40); addItem(got, 1); }
  else addItem(r.out, r.n);
  const rr = rarOf(got); bump('crafts'); EV.emit('craft', got);
  SFX.play(rr >= 2 ? 'drop' + rr : 'craft'); VFX.play('refine', {x:P.x, y:P.y, ok:true});
  log(L(`หลอมสำเร็จ: ${nm(ITEMS[got])}${r.n > 1 ? ' ×' + r.n : ''}${rr ? ` (${RAR[rr].th})` : ''}`, `Crafted ${nm(ITEMS[got])}${r.n > 1 ? ' ×' + r.n : ''}${rr ? ` (${RAR[rr].en})` : ''}`), 'g');
  CRAFT.last = got; dirty = true; save(); WIN_RENDER.craft();
}
const dustOf = id => { const it = ITEMS[id]; return 1 + Math.floor((it.lv || 1) / 20) + (it.rar || 0) * 3; };
function salvage(id){
  const it = ITEMS[id]; if (!it || it.kind !== 'gear' || !S.inv[id]) return;
  const n = dustOf(id); S.inv[id]--; if (!S.inv[id]) delete S.inv[id]; addItem('dust', n); SFX.play('craft');
  log(L(`แยกชิ้นส่วน ${nm(it)} ได้ผงวายรา ×${n}`, `Salvaged ${nm(it)} into ${n} Vayra Dust`)); dirty = true; save(); WIN_RENDER.craft();
}
const reforgeCost = id => { const it = ITEMS[id]; return {dust:4 * (it.rar || 1) + Math.floor((it.lv || 1) / 25), bia:500 + (it.lv || 1) * 60 * (it.rar || 1)}; };
function reforge(id){
  const it = ITEMS[id], d = instStore()[id]; if (!it || !it.base || !d) return; const c = reforgeCost(id); if (haveN('dust') < c.dust || S.bia < c.bia) return;
  S.inv.dust -= c.dust; if (!S.inv.dust) delete S.inv.dust; S.bia -= c.bia;
  const nd = rerollOpts(id); derive(); SFX.play('drop' + d.r); VFX.play('refine', {x:P.x, y:P.y, ok:true});
  log(L(`หลอมใหม่ ${nm(it)}: ${optText(id)}`, `Reforged ${nm(it)}: ${optText(id)}`), 'g'); CRAFT.sel = id; dirty = true; save(); WIN_RENDER.craft();
}

/* ---------- window (I) ---------- */
mkWin('craft', 'หลอมของ', 'Crafting', 'I', '<path d="M3 14h9l2-3H5z"/><path d="M8 11V8M12 4l4 4-2 2-4-4z"/><path d="M4 17h10"/>');
WIN_RENDER.craft = function(){
  const pane = el('pane-craft'); if (!pane) return;
  const tabs = [['gear', 'หลอมอุปกรณ์', 'Forge gear'], ['use', 'แร่วายรา', 'Ore'], ['salvage', 'แยกชิ้นส่วน', 'Salvage'], ['reforge', 'หลอมใหม่', 'Reforge']];
  const need = r => r.need.map(([id, n]) => `<span class="cneed${haveN(id) >= n ? ' ok' : ''}"><i>${itemIcon(id)}</i>${nm(ITEMS[id])} ${fmtN(haveN(id))}/${n}</span>`).join('') + `<span class="cneed${S.bia >= r.bia ? ' ok' : ''}"><i class="cz"><i class="biaI"></i></i>${fmtN(r.bia)}</span>`;
  let body = '';
  if (CRAFT.tab === 'gear' || CRAFT.tab === 'use'){
    let list = RECIPES.filter(r => r.kind === CRAFT.tab);
    if (CRAFT.tab === 'gear') list = list.filter(r => (CRAFT.slot === 'all' || r.slot === CRAFT.slot) && canWield(ITEMS[r.out]) && r.lv <= S.lvl + 15);
    if (CRAFT.q) list = list.filter(r => (ITEMS[r.out].name + ITEMS[r.out].en).toLowerCase().includes(CRAFT.q));
    list.sort((a, b) => (canCraft(b) - canCraft(a)) || b.lv - a.lv);
    if (!list.some(r => r.id === CRAFT.sel)) CRAFT.sel = list[0] && list[0].id;
    const r = RCP[CRAFT.sel];
    body = `${CRAFT.tab === 'gear' ? `<div class="cslots">${[['all', 'ทั้งหมด', 'All'], ['weapon', 'อาวุธ', 'Weapon'], ['head', 'หมวก', 'Head'], ['armor', 'เสื้อเกราะ', 'Body'], ['shoes', 'รองเท้า', 'Feet'], ['acc', 'เครื่องประดับ', 'Accessory']].map(([k, th, en]) => `<button class="${CRAFT.slot === k ? 'on' : ''}" data-cslot="${k}">${L(th, en)}</button>`).join('')}</div>` : ''}
      <div class="crw"><div class="crlist">${list.map(x => `<button class="crrow${x.id === CRAFT.sel ? ' on' : ''}${canCraft(x) ? ' can' : ''}" data-csel="${x.id}"><span class="bico">${itemIcon(x.out)}</span><span class="wn"><b>${nm(ITEMS[x.out])}${x.n > 1 ? ' ×' + x.n : ''}</b><small>Lv ${x.lv}${canCraft(x) ? ' · ' + L('หลอมได้', 'ready') : ''}</small></span></button>`).join('') || `<p class="empty">${L('ไม่มีสูตร', 'No recipes')}</p>`}</div>
      ${r ? `<div class="crdet"><div class="wkhead"><span class="wkpic big">${itemIcon(r.out)}</span><div><h3>${nm(ITEMS[r.out])}${r.n > 1 ? ' ×' + r.n : ''}</h3><p class="wksub">${r.kind === 'gear' ? `${L(...GEAR_SLOT[r.slot])} · Lv ${r.lv} · ${gearStatText(ITEMS[r.out].st)}` : itemDesc(r.out) || ''}</p></div></div>
        <div class="sec">${L('วัตถุดิบ', 'Materials')}</div><div class="cneeds">${need(r)}</div>
        ${r.kind === 'gear' ? `<div class="codds">${RAR.map((R, i) => `<span style="--rc:${R.c}"><b>${Math.round(RAR_ODDS.craft[i] * 100)}%</b>${L(R.th, R.en)}</span>`).join('')}</div>` : ''}
        <button class="btn gold wide" data-craft="${r.id}" ${canCraft(r) ? '' : 'disabled'}>${L('หลอม', 'Craft')}</button>
        ${CRAFT.last ? `<p class="hint">${L('ล่าสุด', 'Last')}: ${rarName(CRAFT.last)}</p>` : ''}
        <p class="hint">${L('วัสดุได้จากมอนเลเวลใกล้เคียงอุปกรณ์ · ดูว่าใครดรอปได้ในวิกิ (K)', 'Materials drop from monsters near the item level · see who drops them in the Wiki (K)')}</p></div>` : ''}</div>`;
  } else if (CRAFT.tab === 'salvage'){
    const gs = Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].kind === 'gear' && S.inv[k] > 0);
    body = `<p class="hint">${L('ย่อยอุปกรณ์ที่ไม่ใช้เป็นผงวายรา วัตถุดิบสำหรับหลอมของเท่านั้น (หลอมอุปกรณ์ Lv 10 ขึ้นไป หลอมใหม่ และทำแร่) · ขายไม่ได้ · ของที่สวมอยู่จะไม่ถูกย่อย', 'Break unused gear into Vayra Dust, a forging-only material (forging gear Lv 10+, reforging and making ore) · cannot be sold · worn gear is never touched')} · ${L('มีผง', 'Dust')} <b>${fmtN(haveN('dust'))}</b></p>
      <div class="shop">${gs.map(k => `<div class="srow"><span class="ic">${itemIcon(k)}</span><div class="nm"><b class="rar r${ITEMS[k].rar || 0}">${nm(ITEMS[k])}</b><small>Lv ${ITEMS[k].lv} · ×${S.inv[k]}</small></div><span class="pr">+${dustOf(k)} ${L('ผง', 'dust')}</span><button class="btn sm" data-salv="${k}">${L('แยก', 'Salvage')}</button></div>`).join('') || `<p class="empty">${L('ไม่มีอุปกรณ์ในกระเป๋า', 'No gear in your bag')}</p>`}</div>`;
  } else {
    const gs = [...new Set([...Object.keys(S.inv), ...Object.values(S.gear || {})])].filter(k => k && ITEMS[k] && ITEMS[k].base);
    if (!gs.includes(CRAFT.sel)) CRAFT.sel = gs[0]; const id = CRAFT.sel, c = id && reforgeCost(id);
    body = gs.length ? `<div class="crw"><div class="crlist">${gs.map(k => `<button class="crrow${k === id ? ' on' : ''}" data-csel="${k}"><span class="bico">${itemIcon(k)}</span><span class="wn"><b class="rar r${ITEMS[k].rar}">${nm(ITEMS[k])}</b><small>${L(RAR[ITEMS[k].rar].th, RAR[ITEMS[k].rar].en)}${Object.values(S.gear || {}).includes(k) ? ' · ' + L('สวมอยู่', 'worn') : ''}</small></span></button>`).join('')}</div>
      <div class="crdet"><div class="wkhead"><span class="wkpic big">${itemIcon(id)}</span><div><h3 class="rar r${ITEMS[id].rar}">${nm(ITEMS[id])}</h3><p class="wksub">${gearLines(id)}</p></div></div>
        <p class="hint">${L('สุ่มออฟชั่นใหม่ทั้งหมด ความหายากเท่าเดิม', 'Re-rolls every random option; rarity stays the same')}</p>
        <div class="cneeds"><span class="cneed${haveN('dust') >= c.dust ? ' ok' : ''}"><i>${itemIcon('dust')}</i>${nm(ITEMS.dust)} ${haveN('dust')}/${c.dust}</span><span class="cneed${S.bia >= c.bia ? ' ok' : ''}"><i class="cz"><i class="biaI"></i></i>${fmtN(c.bia)}</span></div>
        <button class="btn gold wide" data-reforge="${id}" ${haveN('dust') >= c.dust && S.bia >= c.bia ? '' : 'disabled'}>${L('หลอมใหม่', 'Reforge')}</button></div></div>`
      : `<p class="empty">${L('ยังไม่มีอุปกรณ์', 'No equipment yet')}</p>`;
  }
  pane.innerHTML = `<div class="wktabs">${tabs.map(([k, th, en]) => `<button class="wktab${CRAFT.tab === k ? ' on' : ''}" data-ctab="${k}"><span>${L(th, en)}</span></button>`).join('')}</div>
    ${CRAFT.tab === 'gear' || CRAFT.tab === 'use' ? `<label class="wkq">${tabIcon('eye')}<input id="crQ" placeholder="${L('ค้นหาสูตร…', 'Search recipes…')}" value="${escH(CRAFT.q)}" autocomplete="off"></label>` : ''}${body}${CRAFT.tab === 'use' ? `<p class="hint">${L('ยาฟื้นฟู ให้หมอเพ็งที่ตลาดกลางปรุงให้ · ยาบำรุงก็ที่นั่น', 'Potions: Herbalist Pheng at the central market brews them, and tonics too')}</p>` : ''}`;
  const q = el('crQ'); if (q){ q.addEventListener('input', () => { CRAFT.q = q.value.toLowerCase(); const p = q.selectionStart; WIN_RENDER.craft(); const n = el('crQ'); n.focus(); n.setSelectionRange(p, p); }); q.addEventListener('keydown', e => e.stopPropagation()); }
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ctab],[data-cslot],[data-csel],[data-craft],[data-salv],[data-reforge]'); if (!b || b.disabled) return; const d = b.dataset;
  if (d.ctab){ CRAFT.tab = d.ctab; CRAFT.sel = null; CRAFT.q = ''; } else if (d.cslot){ CRAFT.slot = d.cslot; CRAFT.sel = null; } else if (d.csel){ CRAFT.sel = d.csel; }
  else if (d.craft){ doCraft(d.craft); return; } else if (d.salv){ salvage(d.salv); return; } else if (d.reforge){ reforge(d.reforge); return; }
  WIN_RENDER.craft();
});
addTownNpc({id:'forger', name:'ช่างหลอมอินทร์', en:'Master Smith In', role:'หลอมของ · แยกชิ้นส่วน', roleEn:'Crafting · Salvage', x:510, y:790},
  {job:'warlord', look:{sex:'m', hair:2, color:'hairAuburn'}, gear:{armor:'a_padded', head:'h_cloth', weapon:'w_sword2'}});
NPC_OPEN.forger = n => { npcFrame(n, L('เตาไฟพร้อมแล้ว เอาวัสดุจากมอนมา ข้าจะหลอมให้ ของที่หลอมมีโอกาสออกมาล้ำค่ากว่าของดรอปนะ', 'The forge is hot. Bring me monster materials and I will make you something; forged pieces come out rare more often than drops.'),
  `<button class="btn gold wide" data-win-open="craft">${L('เปิดหน้าหลอมของ', 'Open crafting')} <kbd>I</kbd></button>`); };
