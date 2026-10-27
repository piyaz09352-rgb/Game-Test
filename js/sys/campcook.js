/* VAYRATHEN — js/sys/campcook.js — Mae Saijai cooks at every camp
   The quartermaster (ลุงเสบียง) is gone from the camps. In his place stands แม่ครัวสายใจ, the same cook as in Aren,
   with one rule: at a camp she only cooks with what THIS map's monsters drop (the dishes that need anything else are
   not on her list there). The cook in Aren takes ingredients from every map. Camp jobs and grilling your catch
   moved to her as well (a button at the bottom of her list). */
'use strict';

NPC_LOOKS.campcook = NPC_LOOKS.cook;
{
  const _s = setupNpcs;
  setupNpcs = function(id){
    _s.apply(this, arguments);
    const i = NPCS.findIndex(n => n.id === 'quarter'); if (i < 0) return;
    const q = NPCS[i];
    NPCS[i] = {id:'campcook', name:'แม่ครัวสายใจ', en:'Cook Saijai', role:'ทำอาหาร · วัตถุดิบแมพนี้', roleEn:'Cooking · this map\'s ingredients', x:q.x, y:q.y};
  };
}
/* the drops of this map's monsters */
function ccLocal(){
  const set = new Set(), mobs = (MAPS[MAP_ID] && MAPS[MAP_ID].mobs) || [];
  for (const t of mobs){ set.add('m_' + t); for (const k in CK_SRC) if (CK_SRC[k] === t) set.add(k); }
  return set;
}
NPC_OPEN.campcook = n => {
  CK_ONLY = ccLocal(); ckOpen('cook', n);
  const db = document.querySelector('#dialog .db'); if (!db) return;
  const any = CK_RCP.some(r => r.who === 'cook' && ckOkR(r));
  db.insertAdjacentHTML('beforeend', `${any ? '' : `<p class="hint">${L('แมพนี้ไม่มีวัตถุดิบที่ทำอาหารได้ · ไปทำกับแม่ครัวในนครอาเรนได้ทุกอย่าง', 'Nothing here can be cooked · the cook in Aren takes every ingredient')}</p>`}
    <p class="hint">${L('ที่แคมป์ ป้ารับเฉพาะวัตถุดิบที่ดรอปในแมพนี้ · แม่ครัวในนครอาเรนรับวัตถุดิบจากทุกแมพ', 'At a camp she only uses ingredients dropped on this map · the cook in Aren takes them from every map')}</p>
    <button class="btn wide" data-ccjobs="1">${L('งานแคมป์วันนี้ · ย่างปลา', "Today's camp jobs · grill fish")}</button>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-ccjobs],[data-ccback]'); if (!b) return;
  const n = NPCS.find(x => x.id === 'campcook'); if (!n) return;
  if (b.dataset.ccjobs) NPC_OPEN.quarter(n); else NPC_OPEN.campcook(n);
});
{ const _q = NPC_OPEN.quarter;
  NPC_OPEN.quarter = function(n){ CK_ONLY = null; _q.apply(this, arguments); if (!n || n.id !== 'campcook') return;
    const db = document.querySelector('#dialog .db'); if (db) db.insertAdjacentHTML('beforeend', `<button class="btn wide" data-ccback="1">${L('กลับไปทำอาหาร', 'Back to cooking')}</button>`); }; }
