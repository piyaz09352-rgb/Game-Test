/* VAYRATHEN — js/sys/patch257.js — (v257) the server opens in patches (the owner's design)
   Five patches, each with a top Base Level and the highest job tier that can be taken:
     patch 1: Lv 70  · up to the first class (tier 2)
     patch 2: Lv 130 · the second class (tier 3)
     patch 3: Lv 180 · the third class (tier 4)
     patch 4: Lv 240
     patch 5: Lv 300 (everything open)
   · The GM opens the next patch by hand (GM window → «แพตช์เซิร์ฟเวอร์»): db server/patch {p}. Everyone reads it live.
   · A hero at the cap keeps earning Base EXP; it is stored. When the next patch opens the stored EXP turns into levels
     at once, up to the new cap (what is left stays stored for the patch after).
   · Heroes already above the cap keep their level (nothing is taken away); they just cannot go higher yet.
   · Offline, on claude.ai, or while the server has never set a patch: everything is open (patch 5), so turning this on
     is the GM's choice and never locks anyone by surprise. */
'use strict';
const PATCH_CAP = [70, 130, 180, 240, 300], PATCH_TIER = [2, 3, 4, 4, 4];
const PATCH = {p:5, set:false, sub:null};
const patchNo = () => clamp(PATCH.p | 0 || 5, 1, PATCH_CAP.length);
function patchCap(){ return Math.min(typeof LV_MAX !== 'undefined' ? LV_MAX : 300, PATCH_CAP[patchNo() - 1]); }
function patchTier(){ return PATCH_TIER[patchNo() - 1]; }
const patchTierName = t => ({2:L('อาชีพขั้นที่ 1', 'first class'), 3:L('อาชีพขั้นที่ 2', 'second class'), 4:L('อาชีพขั้นที่ 3', 'third class')}[t] || '');
const patchLine = (p = patchNo()) => L(`แพตช์ ${p} · เลเวลสูงสุด ${PATCH_CAP[p - 1]}`, `Patch ${p} · max Lv ${PATCH_CAP[p - 1]}`);

/* the server's patch, live */
function patchApply(p, quiet){
  const old = patchNo(); PATCH.p = clamp(p | 0 || 5, 1, PATCH_CAP.length);
  if (PATCH.p > old && !quiet){
    const t = PATCH_TIER[PATCH.p - 1], newTier = t > PATCH_TIER[old - 1];
    banner(L(`🎉 เปิดแพตช์ ${PATCH.p} แล้ว! เลเวลสูงสุด ${patchCap()}${newTier ? ' · ' + patchTierName(t) + 'เปิดแล้ว' : ''}`, `🎉 Patch ${PATCH.p} is open! Max Lv ${patchCap()}${newTier ? ' · the ' + patchTierName(t) + ' is open' : ''}`));
    if (typeof S !== 'undefined' && S && S.lvl && typeof gainExp === 'function') gainExp(0, 0);   // the stored EXP becomes levels now
  }
  if (typeof reWin === 'function'){ reWin('gm'); reWin('stat'); }
}
EV.on('netready', () => {
  if (typeof NET === 'undefined' || !NET.db || PATCH.sub) return;
  try { PATCH.sub = NET.db.doc('server/patch').onSnapshot(s => { const v = s && s.exists ? s.data() : null;
    const first = !PATCH.set; PATCH.set = !!(v && v.p); patchApply(v && v.p ? v.p : 5, first); }, () => {}); } catch (e) {}
});
async function patchSave(p){
  if (typeof NET === 'undefined' || !NET.db) return toast(L('ต้องออนไลน์', 'Go online first'));
  try { await NET.db.doc('server/patch').set({p:clamp(p | 0, 1, PATCH_CAP.length), at:Date.now(), by:NET.uid || ''}); toast(L(`ตั้งเป็น${patchLine(p)}แล้ว`, `Set to ${patchLine(p)}`)); }
  catch (e) { toast(L('บันทึกไม่ได้ (ต้องเป็น GM)', 'Could not save (GM only)')); }
}

/* the class change waits for its patch */
if (typeof jobChangeBlock === 'function'){ const _jb = jobChangeBlock;
  jobChangeBlock = function(){ const j = JOBS[S.job], nt = ((j && j.tier) || 1) + 1;
    if (j && j.next && nt > patchTier()){ const need = PATCH_TIER.findIndex(t => t >= nt) + 1;
      return L(`${patchTierName(nt)}จะเปิดในแพตช์ ${need} (ตอนนี้แพตช์ ${patchNo()})`, `The ${patchTierName(nt)} opens in patch ${need} (now patch ${patchNo()})`); }
    return _jb.apply(this, arguments); }; }

/* reaching the cap: one message a patch */
EV.on('tick', () => {
  if (typeof S === 'undefined' || !S || !S.lvl || PATCH.p >= PATCH_CAP.length || S.lvl < patchCap()) return;
  if (S._patchMsg === PATCH.p) return; S._patchMsg = PATCH.p;
  log(L(`ถึงเลเวลสูงสุดของ${patchLine()}แล้ว · EXP ยังสะสมไว้ จะกลายเป็นเลเวลทันทีเมื่อเปิดแพตช์ถัดไป`, `You reached the top of ${patchLine()} · EXP is still stored and turns into levels the moment the next patch opens`), 'g');
});

/* GM window: the server's patch */
if (typeof WIN_RENDER !== 'undefined' && WIN_RENDER.gm){ const _g = WIN_RENDER.gm;
  WIN_RENDER.gm = function(){ const r = _g.apply(this, arguments); const pane = el('pane-gm'); if (!pane) return r;
    const old = pane.querySelector('#patchBox'); if (old){ old.remove(); const rw = pane.querySelector('#patchRow'); if (rw) rw.remove(); }
    pane.insertAdjacentHTML('beforeend', `<div class="sec" id="patchBox">${L('แพตช์เซิร์ฟเวอร์', 'Server patch')} · <b>${PATCH.set ? patchLine() : L('ยังไม่ได้ตั้ง (เปิดหมด)', 'not set (all open)')}</b></div>
      <div class="row gmrow" id="patchRow" style="flex-wrap:wrap;gap:4px">${PATCH_CAP.map((c, i) => `<button class="btn sm${PATCH.set && patchNo() === i + 1 ? ' gold' : ''}" data-patch="${i + 1}">${i + 1}<small> · Lv ${c}</small></button>`).join('')}</div>`);
    return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-patch]'); if (!b) return;
  const p = +b.dataset.patch; if (typeof askConfirm === 'function') askConfirm(L('แพตช์เซิร์ฟเวอร์', 'Server patch'), L(`ตั้งเซิร์ฟเป็น${patchLine(p)}? ทุกคนในเซิร์ฟจะได้เพดานนี้ทันที`, `Set the server to ${patchLine(p)}? Everyone gets this cap at once`), L('ตั้งเลย', 'Set'), () => patchSave(p)); else patchSave(p); });

if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'patch', t:['แพตช์เซิร์ฟเวอร์', 'Server patches'], b:() => `<p>${L('เซิร์ฟเปิดเป็นช่วง ๆ แต่ละแพตช์มีเลเวลสูงสุดและขั้นอาชีพที่เปลี่ยนได้', 'The server opens in patches; each has a top level and the class tiers you can take')}</p>
  <ul>${PATCH_CAP.map((c, i) => `<li${patchNo() === i + 1 ? ' style="font-weight:bold"' : ''}>${L(`แพตช์ ${i + 1}: เลเวลสูงสุด ${c}`, `Patch ${i + 1}: max Lv ${c}`)}${i < 3 ? ' · ' + L(`เปลี่ยนได้ถึง${patchTierName(PATCH_TIER[i])}`, `up to the ${patchTierName(PATCH_TIER[i])}`) : ''}</li>`).join('')}</ul>
  <p>${L('ชนเพดานแล้ว EXP ยังสะสมไว้ พอเปิดแพตช์ถัดไปก็อัปเลเวลทันที', 'At the cap your EXP is still stored; it turns into levels as soon as the next patch opens')} · ${L('ตอนนี้', 'Now')}: <b>${patchLine()}</b></p>`});
