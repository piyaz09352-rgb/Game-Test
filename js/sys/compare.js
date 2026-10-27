/* VAYRATHEN — js/sys/compare.js — automatic comparison: gear in the bag vs what you wear now
   For each piece in the bag the game quietly "tries it on": it swaps it into the slot it would go to (the same rules
   as wearing it: accessories fill an empty ring slot first, ), runs the real
   derive() so refining, cards, set bonuses, hands and every system's bonus are counted, then puts everything back.
   · Bag (E) and the Equipment window: a green ▲ on upgrades, a red ▼ on downgrades.
   · Selecting a piece shows each stat that would change: ATK +12 · DEF −3 …, and what it would replace. */
'use strict';

const CMP = {cache:new Map(), sig:''};
const CMP_STATS = [['atk', 'ATK'], ['matk', 'MATK'], ['def', 'DEF'], ['mdef', 'MDEF'], ['maxhp', 'Max HP'], ['maxsp', 'Max SP'],
  ['hit', 'HIT'], ['flee', 'FLEE'], ['crit', 'CRIT', '%'], ['aspd', 'ASPD'], ['block', 'Block', '%'], ['move', 'Move Speed', 'x']];
const cmpName = n => (typeof n === 'string' ? n : L(...n));
/* how much each stat matters for the class: the attack stat it actually uses counts most */
function cmpWeights(){
  const j = JOBS[S.job] || {}, magic = !!j.caster;
  return {atk:magic ? .4 : 3, matk:magic ? 3 : .2, def:1, mdef:.8, maxhp:1, maxsp:magic ? .8 : .3, hit:.5, flee:.6, crit:magic ? .2 : .6, aspd:magic ? .4 : 1.2, block:.5, move:.6};
}
/* where this piece would go if you wore it now (no side effects) */
function cmpSlot(it){
  if (!it || it.kind !== 'gear' || !it.slot) return null;
  if (!canWield(it)) return null;
  if (it.slot === 'acc') return !S.gear.acc ? 'acc' : !S.gear.acc2 ? 'acc2' : 'acc';
  return it.slot;
}
const cmpPick = D => { const o = {}; for (const [k] of CMP_STATS) o[k] = +D[k] || 0; return o; };
/* try the piece on and read the stats; everything is restored afterwards */
function cmpTry(id){
  const it = ITEMS[id], slot = cmpSlot(it); if (!slot || !DER || !S.gear) return null;
  const g0 = S.gear, D0 = DER, hp = S.hp, sp = S.sp, set = ITEMS.__set ? ITEMS.__set.st : null;
  let after = null;
  try {
    const g = {...g0, [slot]:id};
    S.gear = g; derive(); after = cmpPick(DER);
  } catch (e) { after = null; }
  finally { S.gear = g0; DER = D0; S.hp = hp; S.sp = sp; if (ITEMS.__set && set) ITEMS.__set.st = set; }
  if (!after) return null;
  const before = cmpPick(DER), d = {}, w = cmpWeights(); let score = 0;
  for (const [k] of CMP_STATS){ const v = +(after[k] - before[k]).toFixed(k === 'crit' || k === 'move' ? 2 : 0); if (v) d[k] = v; score += (w[k] || 0) * v / Math.max(1, Math.abs(before[k]) || 1); }
  return {slot, worn:g0[slot] || null, d, score, lvOk:S.lvl >= (it.lv || 0)};
}
/* cached per item until anything about the hero changes */
function cmpOf(id){
  const sig = `${S.job}|${S.lvl}|${JSON.stringify(S.gear)}|${JSON.stringify(S.stats)}|${JSON.stringify(S.slots || {})}|${JSON.stringify(S.skills || {})}`;
  if (sig !== CMP.sig){ CMP.sig = sig; CMP.cache.clear(); }
  if (!CMP.cache.has(id)) CMP.cache.set(id, cmpTry(id));
  return CMP.cache.get(id);
}
const cmpMark = c => !c ? '' : c.score > .004 ? 'up' : c.score < -.004 ? 'dn' : 'eq';
const cmpBadge = c => { const m = cmpMark(c); if (!m || m === 'eq') return '';
  return `<i class="cmpB ${m}${c.lvOk ? '' : ' lv'}" title="${m === 'up' ? L('ดีกว่าที่สวมอยู่', 'Better than what you wear') : L('แย่กว่าที่สวมอยู่', 'Worse than what you wear')}">${m === 'up' ? '▲' : '▼'}</i>`; };
function cmpHTML(id){
  const it = ITEMS[id]; if (!it || it.kind !== 'gear') return '';
  if (!canWield(it)) return `<div class="cmp"><small>${L('อาชีพนี้ใช้ไม่ได้ จึงไม่เปรียบเทียบ', 'Not for this class, so no comparison')}</small></div>`;
  const c = cmpOf(id); if (!c) return '';
  const vs = c.worn && ITEMS[c.worn] ? `<span class="rar r${ITEMS[c.worn].rar || 0}">${nm(ITEMS[c.worn])}</span>` : L('ช่องว่าง', 'an empty slot');
  const parts = CMP_STATS.filter(([k]) => c.d[k]).map(([k, n, u]) => { const v = c.d[k], s = (v > 0 ? '+' : '−') + (u === 'x' ? Math.round(Math.abs(v) * 100) + '%' : Math.abs(v).toLocaleString() + (u || ''));
    return `<span class="${v > 0 ? 'up' : 'dn'}">${cmpName(n)} ${s}</span>`; });
  const head = cmpMark(c) === 'up' ? `<b class="up">▲ ${L('ดีกว่า', 'Upgrade')}</b>` : cmpMark(c) === 'dn' ? `<b class="dn">▼ ${L('แย่กว่า', 'Downgrade')}</b>` : `<b>${L('พอ ๆ กัน', 'About the same')}</b>`;
  return `<div class="cmp">${head} <small>${L('เทียบกับ', 'vs')} ${vs}${c.lvOk ? '' : ` · ${L(`ต้อง Lv ${it.lv}`, `needs Lv ${it.lv}`)}`}</small><div class="cmpd">${parts.length ? parts.join('') : `<small>${L('ค่าสถานะไม่เปลี่ยน', 'No stat changes')}</small>`}</div></div>`;
}
{
  const st = document.createElement('style');
  st.textContent = `.cmpB{position:absolute;left:2px;top:1px;font:700 11px/1 sans-serif;font-style:normal;pointer-events:none;text-shadow:0 1px 2px #000,0 0 2px #000;z-index:2}
    .cmpB.up{color:#7dff8a}.cmpB.dn{color:#ff6b5b}.cmpB.lv{opacity:.5}
    .bslot,.eqbox{position:relative}
    .cmp{margin-top:4px;padding:5px 8px;border-radius:8px;background:rgba(0,0,0,.25);border:1px solid rgba(227,176,75,.18);font-size:12px;line-height:1.5}
    .cmp b.up,.cmpd .up{color:#7dff8a}.cmp b.dn,.cmpd .dn{color:#ff7b6b}
    .cmpd{display:block;line-height:1.5}.cmpd span{display:inline-block;white-space:nowrap;font-weight:600;margin-right:10px}
    #bagInfo .nm .cmp{display:block}`;
  document.head.appendChild(st);
}
/* the bag: badges on the grid / list, details for the selected piece */
{
  const _draw = bagDraw;
  bagDraw = function(){ _draw();
    for (const b of document.querySelectorAll('#bagGrid [data-bagsel]')){ const id = b.dataset.bagsel, it = ITEMS[id]; if (!it || it.kind !== 'gear' || BAG.tab === 'card') continue;
      const bd = cmpBadge(cmpOf(id)); if (!bd) continue; const tgt = b.querySelector('.bico') || b; tgt.insertAdjacentHTML('beforeend', bd); if (tgt !== b) tgt.style.position = 'relative'; }
  };
  const _info = bagInfo;
  bagInfo = function(){ _info(); const id = BAG.sel, box = el('bagInfo'); if (!id || !box || BAG.tab === 'card' || !ITEMS[id] || ITEMS[id].kind !== 'gear') return;
    const nmBox = box.querySelector('.nm'); if (nmBox) nmBox.insertAdjacentHTML('beforeend', cmpHTML(id)); };
}
/* the Equipment window's "gear in your bag" list */
{
  const _re = renderEquip;
  renderEquip = function(){ _re();
    for (const b of document.querySelectorAll('.eqbag .eqit')){ const w = b.querySelector('[data-wear]'), id = w && w.dataset.wear; if (!id || !ITEMS[id] || ITEMS[id].kind !== 'gear') continue;
      const c = cmpOf(id), box = b.querySelector('.eqbox'), tx = b.querySelector('.eqtx');
      const bd = cmpBadge(c); if (bd && box) box.insertAdjacentHTML('beforeend', bd);
      if (tx && c && Object.keys(c.d).length) tx.insertAdjacentHTML('beforeend', `<i class="cmpd">${CMP_STATS.filter(([k]) => c.d[k]).slice(0, 5).map(([k, n, u]) => { const v = c.d[k];
        return `<span class="${v > 0 ? 'up' : 'dn'}">${cmpName(n)} ${v > 0 ? '+' : '−'}${u === 'x' ? Math.round(Math.abs(v) * 100) + '%' : Math.abs(v).toLocaleString() + (u || '')}</span>`; }).join('')}</i>`); }
  };
}
