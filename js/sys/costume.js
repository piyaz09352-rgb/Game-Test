/* VAYRATHEN — js/sys/costume.js
   Wardrobe (ชุดแฟชั่น). A costume changes only how the hero looks, never the stats:
   · a costume top replaces the look of the worn armour (colours, trims, cape, skirt for heroines);
   · a costume headpiece replaces the look of the worn headgear (or hides it).
   Costumes belong to the whole account (every character on it can wear them). They come from the tailor in
   Aren (for Bia or Vayra Coins), achievements, dailies, the side story and the world boss.
   The wardrobe is the second tab of the Equipment window (Q): try on any costume, wear, take off. */
'use strict';

const CM = SPR.M;
/* topTex helpers: trims on the jacket (n = surface normal, x across, y up, z front) */
const tx = {
  zip:(m, z = .5) => n => (n[2] > z && Math.abs(n[0]) < .045 && n[1] > -.4 ? {m} : undefined),
  hem:(m, y = .44) => n => (n[1] > y ? {m} : undefined),
  lapel:(a, b) => n => (n[2] > .45 && Math.abs(n[0]) < .15 && n[1] > -.38 ? (Math.abs(n[0]) < .04 ? {m:b} : {m:a}) : undefined),
  stripes:(m, f = 9) => n => (Math.sin(n[1] * f) > .55 ? {m} : undefined),
  sash:(m) => n => (Math.abs(n[0] * .78 + n[1] * .62 - .02) < .16 ? {m} : undefined),
  dots:(m) => n => (Math.sin(n[0] * 18) * Math.sin(n[1] * 18 + 1) > .62 ? {m} : undefined),
  apron:(a, b) => n => (n[2] > .35 && Math.abs(n[0]) < .26 && n[1] < .3 ? {m:a} : n[1] > .44 ? {m:b} : undefined),
  combo:(...fs) => n => { for (const f of fs){ const r = f(n); if (r) return r; } }
};
const TOP0 = {chest:null, chestTex:null, chestTrim:null, pauldron:null, cape:null, capeTex:null, runeLines:false, armband:null, cosTop:true};
/* id: slot, th/en name, src (how to get it), price ({z: Bia} or {c: coins}), look overrides */
const COSTUME = {
  c_school:{slot:'top', th:'ชุดนักเรียนเวทมนตร์', en:'Arcane Academy Uniform', src:'shop', price:{z:4000}, look:{top:'navy', sleeve:'navy', forearm:'tech', pants:'charcoal', bootCuff:'gold', belt:'charcoal', skirtM:'navy', skirtT:'gold', necklace:true, neckMat:'scarlet', topTex:tx.combo(tx.lapel(CM.tech, CM.scarlet), tx.hem(CM.gold, .46))}},
  c_summer:{slot:'top', th:'ชุดฤดูร้อนริมทะเล', en:'Seaside Summer Set', src:'shop', price:{z:6000}, look:{top:'sky', sleeve:'skin', forearm:'skin', pants:'tech', bootCuff:'sky', belt:'tech', skirtM:'tech', skirtT:'sky', topTex:tx.combo(tx.hem(CM.tech, .4), tx.dots(CM.tech))}},
  c_street:{slot:'top', th:'ชุดสตรีทราตรี', en:'Night Street Hoodie', src:'shop', price:{z:9000}, look:{top:'midnight', sleeve:'midnight', forearm:'mint', handWrap:'mint', pants:'charcoal', bootCuff:'mint', belt:'mint', skirtM:'midnight', skirtT:'mint', topTex:tx.combo(tx.zip(CM.mint), tx.hem(CM.mint, .5))}},
  c_songkran:{slot:'top', th:'ชุดสงกรานต์ลายดอก', en:'Songkran Flower Shirt', src:'shop', price:{z:12000}, look:{top:'sunset', sleeve:'sunset', forearm:'skin', pants:'tech', bootCuff:'sunset', belt:'tech', skirtM:'sunset', skirtT:'tech', topTex:tx.combo(tx.dots(CM.tech), tx.hem(CM.sakura, .48))}},
  c_knight:{slot:'top', th:'ชุดอัศวินเงินจันทรา', en:'Moon-silver Knight', src:'shop', price:{z:20000}, look:{top:'tech', sleeve:'tech', forearm:'steel', pants:'navy', bootCuff:'steel', belt:'sky', pauldron:'steel', cape:'sky', capeTex:'gold', skirtM:'tech', skirtT:'sky', topTex:tx.combo(tx.lapel(CM.sky, CM.gold), tx.hem(CM.sky))}},
  c_idol:{slot:'top', th:'ชุดไอดอลดาวรุ่ง', en:'Rising Star Idol', src:'coin', price:{c:30}, look:{top:'sakura', sleeve:'tech', forearm:'tech', pants:'tech', bootCuff:'sakura', belt:'gold', ribbon:'sakura', skirtM:'sakura', skirtT:'tech', necklace:true, neckMat:'gold', topTex:tx.combo(tx.stripes(CM.tech, 12), tx.hem(CM.gold, .46))}},
  c_maid:{slot:'top', th:'ชุดคาเฟ่ราชินี', en:'Royal Café Uniform', src:'coin', price:{c:30}, look:{top:'charcoal', sleeve:'charcoal', forearm:'tech', pants:'charcoal', bootCuff:'tech', belt:'tech', skirtM:'charcoal', skirtT:'tech', ribbon:'charcoal', topTex:tx.apron(CM.tech, CM.tech)}},
  c_ninja:{slot:'top', th:'ชุดนินจาเงาจันทร์', en:'Moonshadow Ninja', src:'coin', price:{c:45}, look:{top:'midnight', sleeve:'midnight', forearm:'midnight', handWrap:'scarlet', pants:'midnight', bootCuff:'scarlet', belt:'scarlet', skirtM:'midnight', skirtT:'scarlet', mask:'midnight', topTex:tx.combo(tx.sash(CM.scarlet), tx.hem(CM.scarlet, .5))}},
  c_sakura:{slot:'top', th:'ชุดไทยประยุกต์ซากุระ', en:'Sakura Thai Modern', src:'coin', price:{c:60}, look:{top:'sakura', sleeve:'sakura', forearm:'ivory', pants:'ivory', bootCuff:'gold', belt:'gold', skirtM:'sakura', skirtT:'gold', necklace:true, topTex:tx.combo(tx.sash(CM.gold), tx.hem(CM.ivory, .5))}},
  c_royal:{slot:'top', th:'ชุดราชสำนักสยาม', en:'Siamese Court Regalia', src:'story', look:{top:'ivory', sleeve:'scarlet', forearm:'ivory', armband:'gold', pants:'scarlet', bootCuff:'gold', belt:'gold', pauldron:'gold', cape:'scarlet', capeTex:'gold', skirtM:'scarlet', skirtT:'gold', necklace:true, topTex:tx.combo(tx.sash(CM.gold), tx.lapel(CM.scarlet, CM.gold))}},
  c_dragon:{slot:'top', th:'ชุดจอมทัพนาคา', en:'Naga Warlord Armour', src:'wb', look:{top:'teal', sleeve:'teal', forearm:'gold', armband:'gold', pants:'midnight', bootCuff:'gold', belt:'gold', chest:'teal', chestTex:'scale', chestTrim:'gold', pauldron:'gold', cape:'midnight', capeTex:'gold', skirtM:'teal', skirtT:'gold'}},
  c_starlight:{slot:'top', th:'ชุดเทพธิดาดวงดาว', en:'Starlight Celestial', src:'ach', look:{top:'lilac', sleeve:'ivory', forearm:'ivory', armband:'sun', pants:'ivory', bootCuff:'sun', belt:'sun', cape:'lilac', capeTex:'gold', skirtM:'lilac', skirtT:'sun', necklace:true, pendant:'sun', neckMat:'gold', topTex:tx.combo(tx.dots(CM.sun), tx.hem(CM.sun, .44))}},
  c_daily:{slot:'top', th:'ชุดนักผจญภัยขยัน', en:'Diligent Adventurer', src:'daily', look:{top:'mint', sleeve:'mint', forearm:'tech', pants:'brownCl', bootCuff:'mint', belt:'leather', pouch:true, skirtM:'mint', skirtT:'leather', topTex:tx.combo(tx.zip(CM.leather), tx.hem(CM.leather, .46))}},
  hc_hide:{slot:'head', th:'ซ่อนหมวก', en:'Hide Headgear', src:'free', look:{hat:null}},
  hc_ribbon:{slot:'head', th:'โบว์ซากุระ', en:'Sakura Bow', src:'shop', price:{z:2500}, look:{hat:null, ribbon:'sakura'}},
  hc_flower:{slot:'head', th:'ปิ่นดอกไม้', en:'Flower Hairpin', src:'shop', price:{z:2500}, look:{hat:null, hairpin:'sakura'}},
  hc_leaf:{slot:'head', th:'ใบไม้นำโชค', en:'Lucky Leaf', src:'shop', price:{z:1500}, look:{hat:'leaf'}},
  hc_beret:{slot:'head', th:'หมวกเบเรต์กุหลาบ', en:'Rose Beret', src:'coin', price:{c:20}, look:{hat:'cap', capMat:'rose'}},
  hc_witch:{slot:'head', th:'หมวกแม่มดราตรี', en:'Midnight Witch Hat', src:'coin', price:{c:35}, look:{hat:'wizard'}},
  hc_lomphok:{slot:'head', th:'ลอมพอกราชทูต', en:"Envoy's Lomphok", src:'story', look:{hat:'lomphok', hatMat:'ivory'}},
  hc_mala:{slot:'head', th:'มาลาทองศึก', en:'Golden War Mala', src:'wb', look:{hat:'mala'}},
  hc_tiara:{slot:'head', th:'มงกุฎเทพธิดา', en:'Celestial Tiara', src:'ach', look:{hat:'crest', bandMat:'ivory', crestMat:'sun', crestN:5, crestGem:true}},
  hc_headset:{slot:'head', th:'คาดผมสายรุ้ง', en:'Rainbow Headband', src:'daily', look:{hat:'band', bandMat:'lilac'}}
};
const COS_SRC = {free:['ฟรี', 'Free'], shop:['ร้านช่างตัดชุด (เบี้ย)', 'Tailor (Bia)'], coin:['ร้านช่างตัดชุด (เหรียญ)', 'Tailor (Coins)'], story:['เนื้อเรื่องเสริม', 'Side story'], wb:['บอสโลก', 'World boss'], ach:['ความสำเร็จ', 'Achievement'], daily:['ภารกิจรายวัน', 'Dailies']};
for (const id in COSTUME){ const c = COSTUME[id]; SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...TOP0, ...c.look} : {...c.look}; }
const cosOwned = id => COSTUME[id] && (COSTUME[id].src === 'free' || !!(ACC.wardrobe || {})[id]);
function cosGrant(id, quiet){
  if (!COSTUME[id] || cosOwned(id)) return false; (ACC.wardrobe = ACC.wardrobe || {})[id] = 1; accSave();
  if (!quiet){ banner(L(`ได้ชุดแฟชั่น: ${COSTUME[id].th}`, `New costume: ${COSTUME[id].en}`)); log(L(`ได้ชุดแฟชั่น ${COSTUME[id].th} (ใส่ได้ทุกตัวละครในบัญชี)`, `Costume unlocked: ${COSTUME[id].en} (for every character)`), 'g'); SFX.play('ach'); }
  bump('costumes', 0); EV.emit('costume', id); return true;
}
function cosWear(id){
  S.cos = S.cos || {top:null, head:null};
  if (!id) return; const c = COSTUME[id]; if (!c || !cosOwned(id)) return;
  const k = c.slot; S.cos[k] = S.cos[k] === id ? null : id; dirty = true; save(); renderEquip(); if (typeof NET !== 'undefined') NET.presT = 0;
}
const cosName = id => (COSTUME[id] ? L(COSTUME[id].th, COSTUME[id].en) : '');
const cosCount = () => Object.keys(COSTUME).filter(cosOwned).length;

/* ---------- wardrobe tab (Equipment window) ---------- */
EQ.tab = 'gear'; EQ.try = null;
function renderWardrobe(){
  const pane = document.getElementById('pane-equip'); if (!pane) return;
  S.cos = S.cos || {top:null, head:null};
  const sel = EQ.try, c = sel && COSTUME[sel];
  const tile = id => { const k = COSTUME[id], own = cosOwned(id), on = S.cos[k.slot] === id;
    return `<button class="cosit${own ? '' : ' lock'}${on ? ' on' : ''}${sel === id ? ' sel' : ''}" data-costry="${id}"><i class="cosw" data-cth="${id}" style="--c1:${cosSwatch(id, 0)};--c2:${cosSwatch(id, 1)}"></i><b>${cosName(id)}</b><small>${on ? L('สวมอยู่', 'Wearing') : own ? L('มีแล้ว', 'Owned') : L(...COS_SRC[k.src])}</small></button>`; };
  pane.innerHTML = eqTabs() + `<div class="cosw2">
    <div class="eqstage"><div class="eqaura"><i></i><canvas id="eqPrev"></canvas></div>
      <div class="eqplate"><b>${escH(S.name || nm(JOBS[S.job]))}</b><small>${sel ? `${L('ลองสวม', 'Trying on')}: ${cosName(sel)}` : L('ชุดแฟชั่นไม่เปลี่ยนค่าพลัง', 'Costumes never change stats')}</small></div>
      <div class="eqrot"><button class="ibtn" data-eqrot="-1" aria-label="${L('หมุนซ้าย', 'Turn left')}">‹</button><button class="ibtn" data-eqrot="1" aria-label="${L('หมุนขวา', 'Turn right')}">›</button></div>
      ${c ? `<div class="cosact">${cosOwned(sel) ? `<button class="btn gold" data-coswear="${sel}">${S.cos[c.slot] === sel ? L('ถอดชุดนี้', 'Take off') : L('สวมชุดนี้', 'Wear')}</button>` : `<p class="hint">${L('ได้จาก', 'From')}: ${L(...COS_SRC[c.src])}${c.price ? ` · ${c.price.z ? fmtN(c.price.z) + ' ' + CUR() : c.price.c + ' ' + L('เหรียญ', 'coins')}` : ''}</p>`}</div>` : ''}
    </div>
    <div class="cosgrid"><div class="sec">${L('เสื้อผ้า', 'Outfits')} <span class="ct">${Object.keys(COSTUME).filter(i => COSTUME[i].slot === 'top' && cosOwned(i)).length}/${Object.keys(COSTUME).filter(i => COSTUME[i].slot === 'top').length}</span></div>
      <div class="coslist">${Object.keys(COSTUME).filter(i => COSTUME[i].slot === 'top').map(tile).join('')}</div>
      <div class="sec">${L('เครื่องประดับศีรษะ', 'Headpieces')}</div>
      <div class="coslist">${Object.keys(COSTUME).filter(i => COSTUME[i].slot === 'head').map(tile).join('')}</div>
      <p class="hint">${L('ชุดแฟชั่นเป็นของทั้งบัญชี ทุกตัวละครใส่ได้ · ซื้อได้ที่ช่างตัดชุดในนครอาเรน', 'Costumes belong to your account: every character can wear them · buy more from the tailor in Aren')}</p></div></div>`;
  drawEquipPrev();
}
function cosSwatch(id, i){ const lk = COSTUME[id].look, m = i ? (lk.cape || lk.belt || lk.bootCuff || lk.ribbon || lk.hairpin || lk.crestMat || lk.capMat || lk.hatMat || 'gold') : (lk.top || lk.ribbon || lk.hairpin || lk.bandMat || lk.capMat || lk.hatMat || (lk.hat === 'wizard' ? 'indigo' : lk.hat === 'mala' ? 'gold' : lk.hat === 'leaf' ? 'green' : 'charcoal'));
  const mt = SPR.MATS[SPR.M[m]]; return mt ? mt.hex[1] : '#888'; }
const eqTabs = () => `<div class="eqtabs"><button class="${EQ.tab === 'gear' ? 'on' : ''}" data-eqtab="gear">${L('อุปกรณ์', 'Equipment')}</button><button class="${EQ.tab === 'cos' ? 'on' : ''}" data-eqtab="cos">${L('ชุดแฟชั่น', 'Wardrobe')} <span class="ct">${cosCount()}</span></button></div>`;
/* the preview: the worn look, or the costume being tried on */
function eqPreviewSheet(){
  if (EQ.tab !== 'cos' || !EQ.try || !COSTUME[EQ.try]) return heroSheet();
  const g = {...visGear(S.gear)}; g[COSTUME[EQ.try].slot === 'top' ? 'armor' : 'head'] = EQ.try; return heroSheet(S.job, g, S.look);
}
document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-eqtab],[data-costry],[data-coswear]'); if (!t) return; const d = t.dataset;
  if (d.eqtab){ EQ.tab = d.eqtab; EQ.try = null; renderEquip(); }
  else if (d.costry){ EQ.try = EQ.try === d.costry ? null : d.costry; renderWardrobe(); }
  else if (d.coswear){ cosWear(d.coswear); }
});

/* ---------- tailor in Aren ---------- */
addTownNpc({id:'tailor', name:'ช่างพิมพ์ลดา', en:'Tailor Pimlada', role:'ช่างตัดชุดแฟชั่น', roleEn:'Costume Tailor', x:330, y:1010},
  {job:'healer', look:{sex:'f', hair:1, color:'hairPink'}, gear:{armor:'c_idol', head:'hc_flower'}});
NPC_OPEN.tailor = n => {
  const row = id => { const c = COSTUME[id], own = cosOwned(id), p = c.price, can = p.z ? S.bia >= p.z : (ACC.coins || 0) >= p.c;
    return `<div class="srow${own ? ' owned' : ''}"><span class="ic"><i class="cosw" data-cth="${id}" style="--c1:${cosSwatch(id, 0)};--c2:${cosSwatch(id, 1)}"></i></span><div class="nm"><b>${cosName(id)}</b><small>${c.slot === 'top' ? L('เสื้อผ้า', 'Outfit') : L('ศีรษะ', 'Head')}${own ? ' · ' + L('มีแล้ว', 'owned') : ''}</small></div>
      <span class="pr">${p.z ? fmtN(p.z) : `${p.c} <small>${L('เหรียญ', 'coins')}</small>`}</span><button class="btn sm" data-cosbuy="${id}" ${own || !can ? 'disabled' : ''}>${own ? '✓' : L('ซื้อ', 'Buy')}</button></div>`; };
  const ids = Object.keys(COSTUME).filter(i => COSTUME[i].price);
  npcFrame(n, L('ชุดสวย ๆ ตัดใหม่ทุกวันจ้ะ ซื้อครั้งเดียวใส่ได้ทุกตัวละครในบัญชีเลยนะ ลองสวมดูได้ในหน้าต่างอุปกรณ์ แท็บชุดแฟชั่น', 'Fresh designs every day, darling. Buy once and every character on your account can wear it. Try them on in the Equipment window, Wardrobe tab.'),
    `<div class="sec">${L('ชุดแฟชั่น (เบี้ย)', 'Costumes (Bia)')}</div><div class="shop">${ids.filter(i => COSTUME[i].price.z).map(row).join('')}</div>
     <div class="sec">${L('ชุดพิเศษ (เหรียญวายรา)', 'Premium (Vayra Coins)')} <span class="ct">${L('มี', 'have')} ${ACC.coins || 0}</span></div><div class="shop">${ids.filter(i => COSTUME[i].price.c).map(row).join('')}</div>
     <button class="btn wide" data-win-open="equip" data-eqtabgo="cos">${L('เปิดตู้เสื้อผ้า', 'Open wardrobe')}</button>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-cosbuy],[data-eqtabgo]'); if (!b) return;
  if (b.dataset.eqtabgo){ EQ.tab = b.dataset.eqtabgo; setTimeout(() => renderEquip(), 0); return; }
  const id = b.dataset.cosbuy, c = COSTUME[id]; if (!c || cosOwned(id)) return;
  if (c.price.z){ if (S.bia < c.price.z) return; S.bia -= c.price.z; } else { if ((ACC.coins || 0) < c.price.c) return; ACC.coins -= c.price.c; }
  cosGrant(id); SFX.play('coin'); save(); const n = NPCS.find(x => x.id === 'tailor'); if (n) NPC_OPEN.tailor(n);
});
