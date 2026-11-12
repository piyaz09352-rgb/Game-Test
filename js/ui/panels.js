/* VAYRATHEN — js/ui/panels.js
   Status, Skill (tree by tier with confirm-before-spend and slot assignment), Bag, Log windows and the hotbar
   (6 skill slots on keys 1–6, potions on 7–8, then dodge / ride / capture / auto / sit). */
'use strict';

let tab = 'stat', skTab = null, skAssign = null, SKSEL = null;
const SKP = {};                                   // Skill Points placed but not confirmed yet: {id: levels}
const skPending = () => Object.values(SKP).reduce((a, b) => a + b, 0);
const sklP = id => skl(id) + (SKP[id] || 0);       // level including unconfirmed points
const ELEM_COL = {fire:'#ff8a4c', water:'#6cc6ff', wind:'#a8f0c0', earth:'#d9b46a', holy:'#fff1a8', shadow:'#b48aff', neutral:'#e8dcc0'};

function reqMet(id, lvOf = sklP){ const r = SKILLS[id].req || {}; return Object.keys(r).every(k => lvOf(k) >= r[k]); }
function canRaise(id){
  const s = SKILLS[id];
  return jobChain().includes(s.job) && sklP(id) < s.max && S.skPts - skPending() > 0 && reqMet(id);
}
const typeLabel = s => s.kind === 'passive' || s.type === 'passive' ? L('พาสซีฟ · Passive', 'Passive') : s.kind === 'buff' ? L('บัพ · Buff', 'Buff') : L('กดใช้ · Active', 'Active');
const reqText = s => Object.keys(s.req || {}).map(k => `${skName(SKILLS[k])} Lv ${s.req[k]}`).join(', ');

function renderPanel(){
  const j = JOBS[S.job], D = DER;
  // ---------- status ----------
  let rows = '';
  for (const k of Object.keys(STAT_TH)){
    const v = S.stats[k], c = statCost(v), bon = D.bonus[k];
    rows += `<tr><th>${k.toUpperCase()}<small>${L(STAT_TH[k], STAT_EN[k])}</small></th><td class="v">${v}${bon ? `<em>+${bon}</em>` : ''}</td><td class="c">${L('ใช้', 'cost')} ${c}</td><td style="text-align:right"><button class="btn plus" data-stat="${k}" aria-label="+ ${k.toUpperCase()}" ${S.statPts >= c && v < STAT_CAP() ? '' : 'disabled'}>+</button></td></tr>`;
  }
  const dd = [['ATK', D.atk], ['MATK', D.matk], ['DEF', D.def], ['MDEF', D.mdef], ['HIT', D.hit], ['FLEE', D.flee], ['CRIT', D.crit + '%'], ['ASPD', `${D.aspd} (${D.interval.toFixed(2)}s)`], [L('เวลาร่าย', 'Cast'), Math.round(D.castMul * 100) + '%'], [L('ระยะ', 'Range'), D.range]];
  $('#pane-stat').innerHTML = `<div class="who"><div class="job">${nm(j)}<span>${LANG === 'en' ? L('', '') : j.en}</span></div><div class="lv">Base Lv ${S.lvl} · Job Lv ${S.jlvl}/${j.jobMax}</div></div>
    <div class="pts${S.statPts >= 2 ? ' has' : ''}"><span>${L('Stat Point คงเหลือ', 'Stat Points left')}</span><b>${S.statPts}</b></div>
    <table class="stats">${rows}</table>
    <dl class="derived">${dd.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
    <div class="bia">${S.bia.toLocaleString()} ${CUR()}</div>`;
  renderSkills();
  renderBag();

  $('#pane-log').innerHTML = LOG.length ? `<ul class="log">${LOG.map(l => `<li class="${l.cls}"><span class="ct">${l.tm}</span> ${l.s}</li>`).join('')}</ul>` : `<p class="empty">${L('ยังไม่มีเหตุการณ์', 'Nothing yet')}</p>`;
  el('dotStat').hidden = S.statPts < 2; el('dotSkill').hidden = !(S.skPts > 0 && ownedSkillIds().some(canRaise)); el('dotBag').hidden = true; el('dotEquip').hidden = !Object.keys(S.cards).some(c => S.cards[c] > 0 && (typeof sockFree === 'function' ? sockFree(c) : !S.slots[CARDS[c].slot]));
  renderEquip(); if (UIS.open.quest) renderQuestLog(); renderHotbar(); renderGoal(); renderBuffs();
  // (v132) an open shop or smith is not rebuilt on every change any more (that blanked and redrew the whole box: a blink,
  // and on the anvil a freeze after each blow); only its purse is brought up to date — boxes refresh their own parts
  const d = $('#dialog'); if (!d.hidden){ const w = d.querySelector('.wallet'); if (w) w.innerHTML = `${S.bia.toLocaleString()} <small>${CUR()}</small>`; }
}

/* ---------- skill window ---------- */
/* connector lines of the skill tree: from each prerequisite's node down to the skill that needs it (gold once met) */
function drawSkLines(){
  const tree = document.getElementById('skTree'), svg = document.getElementById('skLines'); if (!tree || !svg) return;
  const W0 = tree.clientWidth, H0 = tree.clientHeight; svg.setAttribute('viewBox', `0 0 ${W0} ${H0}`); svg.setAttribute('width', W0); svg.setAttribute('height', H0);
  const pos = id => { const n = tree.querySelector(`[data-node="${id}"]`); return n ? [n.offsetLeft + n.offsetWidth / 2, n.offsetTop, n.offsetTop + n.offsetHeight] : null; };
  let out = '';
  for (const n of tree.querySelectorAll('[data-node]')){ const id = n.dataset.node, r = SKILLS[id].req || {}, b = pos(id);
    for (const k in r){ const a = pos(k); if (!a) continue; const met = sklP(k) >= r[k], y1 = a[2] - 2, y2 = b[1] + 2, my = (y1 + y2) / 2;
      out += `<path d="M${a[0]} ${y1}C${a[0]} ${my} ${b[0]} ${my} ${b[0]} ${y2}" class="${met ? 'met' : ''}"/><text x="${(a[0] + b[0]) / 2}" y="${my - 2}" class="${met ? 'met' : ''}">${r[k]}</text>`; } }
  svg.innerHTML = out;
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-sksel]'); if (!b) return; SKSEL = b.dataset.sksel; skAssign = null; renderSkills(); });
window.addEventListener('resize', () => requestAnimationFrame(drawSkLines));
function renderSkills(){
  const chain = jobChain(), nextJobs = JOBS[S.job].next || [];
  const tabs = [...chain, ...nextJobs.map(j => '>' + j)];
  if (!skTab || !tabs.includes(skTab)) skTab = S.job;
  const preview = skTab.startsWith('>'), jid = preview ? skTab.slice(1) : skTab, jb = JOBS[jid];
  const left = S.skPts - skPending();
  let h = `<div class="sktop"><div class="pts${left > 0 ? ' has' : ''}"><span>Skill Point</span><b>${left}</b></div>
    <div class="sktabs" role="tablist">${tabs.map((t, i) => { const id = t.replace('>', ''), pv = t.startsWith('>'), first = pv && !(tabs[i - 1] || '').startsWith('>');   // (v247) one «Next ›» label before the next jobs, each next tab one line (12 of them for a villager ran off the window)
      return `${first ? `<span class="sknx" aria-hidden="true">${L('ถัดไป', 'Next')} ›</span>` : ''}<button role="tab" class="skt${t === skTab ? ' on' : ''}${pv ? ' pv' : ''}" data-sktab="${t}" aria-selected="${t === skTab}"${pv ? ` aria-label="${L('ถัดไป', 'Next')}: ${nm(JOBS[id])}"` : ''}>${pv ? '' : `<small>Tier ${JOBS[id].tier}</small>`}${nm(JOBS[id])}</button>`; }).join('')}</div></div>`;
  if (preview) h += `<p class="empty">${L(`ดูล่วงหน้า: สกิลของ${nm(jb)} (เปลี่ยน Job ที่ครูวายรา)`, `Preview: ${nm(jb)} skills (change Job with Master Vayra)`)}</p>`;
  // ---- skill tree: rows by prerequisite depth, each skill under the one it needs, lines drawn between them ----
  const ids = jb.skills, inJob = new Set(ids), depth = {};
  const dOf = id => depth[id] ?? (depth[id] = Math.max(0, ...Object.keys(SKILLS[id].req || {}).filter(k => inJob.has(k)).map(k => dOf(k) + 1)));
  ids.forEach(dOf);
  const rows = []; ids.forEach(id => (rows[depth[id]] = rows[depth[id]] || []).push(id));
  const cols = Math.max(3, ...rows.map(r => r.length)), col = {};
  rows.forEach(r => { const used = new Set(); for (const id of r){ const par = Object.keys(SKILLS[id].req || {}).find(k => inJob.has(k)); let want = par != null ? col[par] : 0;
    for (let d = 0; d < cols * 2; d++){ const c = want + (d % 2 ? -1 : 1) * Math.ceil(d / 2); if (c >= 0 && c < cols && !used.has(c)){ want = c; break; } }
    if (used.has(want)) want = [...Array(cols).keys()].find(c => !used.has(c)); used.add(want); col[id] = want; } });
  if (!SKSEL || !inJob.has(SKSEL)) SKSEL = ids.find(id => !preview && canRaise(id)) || ids[0];
  // (v166) the tree and the chosen skill's card side by side (one above the other on a narrow screen); nothing above the tree
  // changes size while points are placed, so the + under your finger stays where it is
  h += `<div class="skmain"><div class="sktree" id="skTree" style="--cols:${cols};--rows:${rows.length}"><svg class="sklines" id="skLines"></svg>`;
  for (const id of ids){
    const s = SKILLS[id], lv = preview ? 0 : sklP(id), pend = SKP[id] || 0, ok = preview || reqMet(id), act = s.type !== 'passive', slot = S.hot.indexOf(id);
    h += `<div class="skn${act ? '' : ' pas'}${ok ? '' : ' lock'}${lv >= s.max ? ' max' : ''}${lv ? ' got' : ''}${SKSEL === id ? ' sel' : ''}" data-node="${id}" style="grid-row:${depth[id] + 1};grid-column:${col[id] + 1}">
      <button class="sknb" data-sksel="${id}" title="${skName(s)}"><span class="ski ico">${skillIcon(id)}</span>${slot >= 0 ? `<i class="sks">${slot + 1}</i>` : ''}<b>${skShort(s)}</b><span class="ct">${lv}/${s.max}${pend ? `<em>+${pend}</em>` : ''}</span></button>
      ${preview ? '' : `<button class="btn plus" data-skill="${id}" aria-label="+ ${skName(s)}" ${canRaise(id) ? '' : 'disabled'}>+</button>`}${pend ? `<button class="btn minus" data-skminus="${id}" aria-label="− ${skName(s)}">−</button>` : ''}</div>`;
  }
  h += `</div>`;
  { const id = SKSEL, s = SKILLS[id], lv = preview ? 0 : sklP(id), pend = SKP[id] || 0, ok = !preview && reqMet(id), act = s.type !== 'passive', slot = S.hot.indexOf(id);
    const meta = act ? `${typeLabel(s)} · SP ${s.sp(Math.max(1, lv))} · Cooldown ${skCd(s, Math.max(1, lv))}s · Delay ${skAcd(s, Math.max(1, lv)).toFixed(1)}s${s.cast ? ` · Cast ${s.cast(Math.max(1, lv)).toFixed(1)}s` : ''}${s.elem ? ` · ${elemName(s.elem)}` : ''}` : 'Passive';
    h += `<div class="skrow skdetail${act ? '' : ' pas'}${ok || preview ? '' : ' lock'}${lv >= s.max ? ' max' : ''}">
      <span class="ski ico">${skillIcon(id)}</span>
      <div class="nm"><b>${skName(s)}</b> <span class="ct">Lv ${lv}/${s.max}${pend ? ` <em>+${pend}</em>` : ''}</span>
        <small class="meta">${meta}</small>
        <small>${lv ? s.desc(lv) : s.desc(1)}</small>
        ${lv && lv < s.max ? `<small class="nx">${L('Lv ถัดไป', 'Next Lv')}: ${s.desc(lv + 1)}</small>` : ''}
        ${s.req ? `<small class="rq${ok || preview ? ' met' : ''}">${L('ต้องมี', 'Requires')}: ${reqText(s)}</small>` : ''}
        ${skAssign === id ? `<div class="slotpick">${[0, 1, 2, 3, 4, 5].map(i => `<button class="btn sm${S.hot[i] === id ? ' gold' : ''}" data-slot="${i}" data-sid="${id}">${i + 1}${S.hot[i] && S.hot[i] !== id ? `<small>${skShort(SKILLS[S.hot[i]]).slice(0, 4)}</small>` : ''}</button>`).join('')}</div>` : ''}
      </div>
      <div class="ska">${preview ? '' : `${pend ? `<button class="btn minus" data-skminus="${id}" aria-label="− ${skName(s)}">−</button>` : ''}<button class="btn plus" data-skill="${id}" aria-label="+ ${skName(s)}" ${canRaise(id) ? '' : 'disabled'}>+</button>`}
        ${!preview && act && skl(id) ? `<button class="btn sm slotb${slot >= 0 ? ' on' : ''}" data-assign="${id}" title="${L('ใส่ช่องลัด', 'Put on hotbar')}">${slot >= 0 ? L(`ช่อง ${slot + 1}`, `Slot ${slot + 1}`) : L('ใส่ช่อง', 'Slot')}</button>` : ''}</div>
    </div>`; }
  h += `</div><p class="empty">${L('แตะสกิลในทรีเพื่อดูรายละเอียด · กด + เพื่อลงแต้ม (− เพื่อเอาคืน) แล้วกดยืนยัน · เส้นเชื่อม = สกิลที่ต้องมีก่อน', 'Tap a skill in the tree for details · press + to place points (− takes one back), then Confirm · lines show prerequisites')}</p>`;
  if (!preview){ const n = skPending();   // always there, pinned to the bottom of the window
    h += `<div class="skconfirm skbar${n ? ' on' : ''}"><span>${n ? L(`ลงแต้ม ${n} แต้ม · เหลือ ${left}`, `${n} point${n > 1 ? 's' : ''} placed · ${left} left`) : L(`Skill Point เหลือ ${left} · กด + ที่สกิล`, `${left} Skill Point${left === 1 ? '' : 's'} left · press + on a skill`)}</span><button class="btn" data-skcancel="1" ${n ? '' : 'disabled'}>${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" data-skok="1" ${n ? '' : 'disabled'}>${L('ยืนยัน', 'Confirm')}</button></div>`; }
  $('#pane-skill').innerHTML = h;
  requestAnimationFrame(drawSkLines);
  if (UIS.open.auto) renderAuto();
}
function confirmSkills(){
  for (const id in SKP){
    const was = skl(id); S.skills[id] = was + SKP[id]; S.skPts -= SKP[id];
    const s = SKILLS[id];
    if (!was && s.type !== 'passive' && !S.hot.includes(id)){ const i = S.hot.indexOf(null); if (i >= 0) S.hot[i] = id; }   // first time learned: drop it in a free slot
    log(L(`${skName(s)} Lv ${S.skills[id]}`, `${skName(s)} Lv ${S.skills[id]}`), 'j');
    delete SKP[id];
  }
  derive(); dirty = true; save();
}

/* ---------- hotbar ---------- */
function hotbarDef(){
  const list = S.hot.map(id => (id && skl(id) ? {k:'skill', id} : null));
  list.push({k:'item', id:potPick('hp')}, {k:'item', id:potPick('sp')});
  return list;
}
/* (v290) the two potion slots: every HP / SP potion, strongest first (the old lists stopped at the Elixir and the Dark
   Blue Potion, so the Divine Potion and the Sky Blue Potion were never put in the slot nor drunk by Auto). The owner
   can hold a slot and pick one (S.potSel, js/sys/potslot290.js); that one is used while the bag has it, else the strongest. */
const POT_LIST = k => Object.keys(ITEMS).filter(id => ITEMS[id].kind === 'use' && (k === 'hp' ? ITEMS[id].heal > 0 && !ITEMS[id].spheal : ITEMS[id].spheal > 0))
  .sort((a, b) => (k === 'hp' ? ITEMS[b].heal - ITEMS[a].heal : ITEMS[b].spheal - ITEMS[a].spheal));
function potPick(k){ const c = S.potSel && S.potSel[k], L = POT_LIST(k);
  if (c && ITEMS[c] && S.inv[c] > 0) return c; return L.find(id => S.inv[id] > 0) || (c && ITEMS[c] ? c : L[L.length - 1]); }
const bestHp = () => potPick('hp');
const bestSp = () => potPick('sp');
function useHot(h){ if (h.k === 'skill') trySkill(h.id); else useItem(h.id); }
function renderHotbar(){
  if (typeof renderMoba === 'function') renderMoba();
  const hb = hotbarDef();
  $('#hotbar').innerHTML = hb.map((h, i) => {
    if (!h) return `<button class="hk empty" disabled aria-label="${L('ช่องว่าง', 'Empty slot')}"><kbd>${i + 1}</kbd></button>`;
    if (h.k === 'skill'){ const s = SKILLS[h.id]; return `<button class="hk ico sk-${s.elem || 'neutral'}" data-hot="${i}" title="${skName(s)}">${skillIcon(h.id)}<kbd>${i + 1}</kbd><b>${skShort(s)}</b><span class="lv">${skl(h.id)}</span><i class="cdv" data-cd="${h.id}"></i></button>`; }
    return `<button class="hk ico${i === 6 ? ' first-item' : ''}" data-hot="${i}" ${S.inv[h.id] ? '' : 'disabled'} title="${nm(ITEMS[h.id])}">${itemIcon(h.id)}<kbd>${i + 1}</kbd><b>${nm(ITEMS[h.id])}</b><span class="lv">${S.inv[h.id] || 0}</span></button>`;
  }).join('') + `<span class="hsep"></span>`
    + `<button class="hk${P.ride ? ' on' : ''}" data-move="ride" title="${L('ขี่สัตว์ขี่ เร็วขึ้น 30%', 'Ride your mount, 30% faster')}"><kbd>R</kbd><b>${P.ride ? L('ลง', 'Off') : L('ขี่', 'Ride')}</b></button>`
    + `<button class="hk" data-move="capture" title="${L('จับมอนที่ HP ไม่เกิน 30% มาเป็น Pet', 'Capture a monster at 30% HP or less as a pet')}"><kbd>T</kbd><b>${L('จับ', 'Catch')}</b></button>`
    + `<button class="hk${BOT.on ? ' on' : ''}" data-bot="1" title="${BOT.on ? L('ปิด Auto', 'Turn Auto off') : L('เปิด Auto', 'Turn Auto on')}"><kbd>B</kbd><b>Auto</b><span>${BOT.on ? L('เปิด', 'ON') : L('ปิด', 'OFF')}</span></button>`
    + `<button class="hk hkset" data-botset="1" title="${L('ตั้งค่า Auto (สกิล · ยา · นั่งพัก · บอส)', 'Auto settings (skills · potions · rest · bosses)')}"><kbd>⇧B</kbd><b>⚙</b><span>${L('ตั้งค่า', 'Setup')}</span></button>`
    + `<button class="hk${P.sit ? ' on' : ''}" data-sit="1" title="${L('นั่งพับเพียบ ฟื้นเร็ว x2', 'Sit, recover 2× faster')}"><kbd>X</kbd><b>${P.sit ? L('ลุก', 'Stand') : L('นั่ง', 'Sit')}</b></button>`;
}
function renderGoal(){
  const j = JOBS[S.job]; let g = '';
  if (S.statPts >= 2 && S.lvl <= 3) g = L(`<b>เริ่มต้น:</b> แจก Stat Point ในหน้าต่างสถานะ (A)`, `<b>Start:</b> spend Stat Points in Status (A)`);
  else if (S.skPts > 0 && ownedSkillIds().some(canRaise)) g = L(`<b>Skill Point:</b> มี ${S.skPts} แต้ม เปิดหน้าต่างสกิล (S)`, `<b>Skill Points:</b> ${S.skPts} to spend — open Skills (S)`);
  else if (j.next && !jobChangeBlock()) g = L(`<b>เปลี่ยน Job ได้แล้ว:</b> คุยกับครูวายราที่หมู่บ้าน`, `<b>Job change ready:</b> talk to Master Vayra in the village`);
  const qt = questTracker(), bs = boss && !boss.dead ? '' :(typeof bossClockText === 'function' && bossClockText() ? `<span class="qboss">${bossClockText()}</span>` : '');
  $('#goal').innerHTML = [g, qt, bs].filter(Boolean).join('<br>');
  el('dotQuest').hidden = !NPCS.some(n => npcMark(n));
}

/* can this character change job now? returns '' or the reason */
function jobChangeBlock(){
  const j = JOBS[S.job];
  if (!j.next) return L('ถึงขั้นสูงสุดแล้ว', 'Already at the highest tier');
  if (S.jlvl < j.jobMax) return L(`ต้องถึง Job Lv ${j.jobMax} (ตอนนี้ ${S.jlvl})`, `Reach Job Lv ${j.jobMax} (now ${S.jlvl})`);
  if (j.tier === 1 && !skl('ready')) return L(`ต้องเรียน ${skName(SKILLS.ready)}`, `Learn ${skName(SKILLS.ready)}`);
  if (j.tier === 2 && S.lvl < 40) return L(`ต้องถึง Base Lv 40 (ตอนนี้ ${S.lvl})`, `Reach Base Lv 40 (now ${S.lvl})`);
  // only points that can still go somewhere in this class block the change; points left over (e.g. refunded by a skill rework
  // after every skill is maxed) simply carry over to the next class
  if (S.skPts > 0 && ownedSkillIds().some(id => canRaise(id) && JOBS[S.job].skills.includes(id))) return L(`ใช้ Skill Point ให้หมดก่อน (เหลือ ${S.skPts})`, `Spend all Skill Points first (${S.skPts} left)`);
  return '';
}

document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || b.disabled) return;
  const ds = b.dataset;
  if (ds.win){ toggleWin(ds.win); return; }
  if (ds.winOpen){ if (b.closest && b.closest('#dialog')) closeDialog(); openWin(ds.winOpen); return; }   // a button in an NPC dialog that opens a window: the dialog steps aside
  if (ds.wclose){ closeWin(ds.wclose); return; }
  if (ds.min){ const w = winEl(ds.min); w.classList.toggle('min'); UIS.min[ds.min] = w.classList.contains('min') ? 1 : 0; saveUI(); return; }
  if (ds.fold){ const c = el(ds.fold); c.classList.toggle('folded'); UIS.fold[ds.fold] = c.classList.contains('folded') ? 1 : 0; saveUI(); return; }
  if (ds.hideui){ setHideUI(!UIS.hide); return; }
  if (b.id === 'resetUi'){ UIS = {open:{help:1}, min:{}, pos:{}, fold:{}, hide:false}; saveUI(); document.querySelectorAll('.win').forEach(w => { w.style.left = w.style.top = w.style.right = w.style.bottom = ''; w.classList.remove('min'); }); document.querySelectorAll('.folded').forEach(c => c.classList.remove('folded')); syncMenu(); return; }
  if (ds.stat){ const c = statCost(S.stats[ds.stat]); if (S.statPts >= c && S.stats[ds.stat] < STAT_CAP()){ S.statPts -= c; S.stats[ds.stat]++; derive(); dirty = true; } return; }
  if (ds.sktab){ skTab = ds.sktab; skAssign = null; renderSkills(); return; }
  if (ds.skill){ SKSEL = ds.skill; if (canRaise(ds.skill)){ SKP[ds.skill] = (SKP[ds.skill] || 0) + 1; renderSkills(); } return; }
  if (ds.skminus){ const id = ds.skminus; SKSEL = id; if (SKP[id] > 0){ if (--SKP[id] <= 0) delete SKP[id];
      // a skill that needed this one may no longer be allowed: take its pending points back too
      for (let again = true; again;){ again = false; for (const k in SKP) if (!reqMet(k)){ delete SKP[k]; again = true; } }
      renderSkills(); } return; }
  if (ds.skok){ confirmSkills(); return; }
  if (ds.skcancel){ for (const k in SKP) delete SKP[k]; renderSkills(); return; }
  if (ds.assign){ skAssign = skAssign === ds.assign ? null : ds.assign; renderSkills(); return; }
  if (ds.slot != null && ds.sid){ const i = +ds.slot, id = ds.sid, was = S.hot.indexOf(id);
    if (S.hot[i] === id) S.hot[i] = null; else { if (was >= 0) S.hot[was] = S.hot[i]; S.hot[i] = id; }
    skAssign = null; renderSkills(); renderHotbar(); save(); return; }
  if (ds.use){ useItem(ds.use); return; }
  if (ds.sit){ if (!P.dead && !P.cast){ P.sit = !P.sit; P.ride = false; P.tx = null; P.target = null; renderHotbar(); } return; }
  if (ds.bot){ botButton(); return; }
  if (ds.botset){ botSettings(); return; }
  if (ds.move){ ({roll:doRoll, ride:toggleRide, capture:tryCapture})[ds.move](); return; }
  if (ds.release){ releasePet(); return; }
  if (ds.hot){ const h = hotbarDef()[+ds.hot]; if (h) useHot(h); return; }
  if (ds.card){ const cd = CARDS[ds.card]; if (S.cards[ds.card] > 0){ const old = S.slots[cd.slot]; if (old) S.cards[old] = (S.cards[old] || 0) + 1; S.slots[cd.slot] = ds.card; S.cards[ds.card]--; if (!S.cards[ds.card]) delete S.cards[ds.card]; derive(); log(L(`ใส่ ${nm(cd)} ในช่อง${SLOT_TH[cd.slot]}`, `Equipped ${nm(cd)} (${SLOT_EN[cd.slot]})`), 'c'); toast(L(`ใส่ ${nm(cd)} ในช่อง Card ของ${SLOT_TH[cd.slot]}แล้ว`, `${nm(cd)} slotted (${SLOT_EN[cd.slot]})`)); SFX.play('equip'); dirty = true; save(); renderPanel(); if (typeof renderEquip === 'function' && winOpen('equip')) renderEquip(); } return; }
  if (ds.job){
    if (jobChangeBlock() || !(JOBS[S.job].next || []).includes(ds.job)) return;
    S.job = ds.job; S.jlvl = 1; S.jexp = 0; if (S.gear && S.gear.weapon && !canWield(ITEMS[S.gear.weapon])){ addItem(S.gear.weapon, 1); S.gear.weapon = null; } if (usesArrows() && !arrowCount()){ const a0 = ammoStarter(); addItem(a0, 1000); S.gear.ammo = a0; log(a0 === 's_iron' ? L('ได้รับดาวกระจายเหล็ก 1,000 ดวง', 'Received 1,000 iron stars') : L('ได้รับลูกธนูไม้ไผ่ 1,000 ดอก', 'Received 1,000 bamboo arrows'), 'g'); } derive(); S.hp = DER.maxhp; S.sp = DER.maxsp; skTab = S.job; closeDialog();
    banner(L(`ยินดีด้วย! คุณเป็น${nm(JOBS[S.job])}แล้ว`, `Congratulations! You are now a ${nm(JOBS[S.job])}`)); log(L(`เปลี่ยน Job เป็น${nm(JOBS[S.job])}`, `Job changed to ${nm(JOBS[S.job])}`), 'g');
    { const AC = {auraGold:['rgba(255,190,70,1)', 'rgba(255,240,180,1)'], auraGreen:['rgba(80,230,150,1)', 'rgba(210,255,230,1)'], auraViolet:['rgba(170,110,255,1)', 'rgba(235,215,255,1)'], auraWhite:['rgba(150,210,255,1)', 'rgba(240,250,255,1)']}[SPR.CHARS[S.job].aura] || [];
      VFX.play('jobChange', {x:P.x, y:P.y}); VFX.play('classAura', {col:AC[0], colL:AC[1]}); SFX.play('jobUp'); setTimeout(() => SFX.play('boom'), 900); }
    fx.push({k:'lvl', x:P.x, y:P.y, t:0, life:1.2}); dirty = true; if (typeof EV !== 'undefined') EV.emit('job', S.job); save(); return;
  }
  if (ds.buy){ const n = +ds.n, cost = ITEMS[ds.buy].buy * n; if (S.bia >= cost){ S.bia -= cost; addItem(ds.buy, n); log(L(`ซื้อ ${nm(ITEMS[ds.buy])} ×${n}`, `Bought ${nm(ITEMS[ds.buy])} ×${n}`)); } else toast(L('Bia ไม่พอ', 'Not enough Bia')); dirty = true; return; }
  if (ds.sell){ let sum = 0; for (const k of Object.keys(S.inv)) if (ITEMS[k].kind === 'etc'){ sum += ITEMS[k].sell * S.inv[k]; delete S.inv[k]; } sum = Math.round(sum * (1 + (DER.pas.biaPct || 0))); S.bia += sum; log(L(`ขายของได้ ${sum.toLocaleString()} เบี้ย`, `Sold loot for ${sum.toLocaleString()} Bia`), 'g'); dirty = true; return; }
  if (ds.refine){
    const nx = S.refine + 1, cost = 200 * nx;
    if ((S.inv.ore || 0) < 1 || S.bia < cost) return;
    S.inv.ore--; if (!S.inv.ore) delete S.inv.ore; S.bia -= cost;
    if (Math.random() * 100 < REFINE_RATE(nx)){ S.refine = nx; if (typeof EV !== 'undefined') EV.emit('refine', nx); log(L(`ตีบวกสำเร็จ! +${nx}`, `Refine success! +${nx}`), 'g'); banner(L(`ตีบวกสำเร็จ +${nx}`, `Refine success +${nx}`)); VFX.play('refine', {x:P.x, y:P.y, ok:true}); }
    else { if (nx >= 5) S.refine = Math.max(0, S.refine - 1); log(L(`ตีบวกล้มเหลว อาวุธเหลือ +${S.refine}`, `Refine failed, weapon is now +${S.refine}`), 'r'); banner(L(`ตีบวกล้มเหลว (+${S.refine})`, `Refine failed (+${S.refine})`)); VFX.play('refine', {x:P.x, y:P.y, ok:false}); }
    derive(); dirty = true; save(); return;
  }
  // (v184) only what is really in the bag can be sold: a ×1 on a row already sold used to take 1 from nothing (the count became NaN)
  if (ds.sellid){ const k = ds.sellid, have = S.inv[k] > 0 ? S.inv[k] : 0, n = ds.n === 'all' ? have : Math.min(1, have); if (!n || !ITEMS[k] || ITEMS[k].forgeOnly){ traderRefresh(); return; } const each = Math.round(ITEMS[k].sell * marketRate(k) * (1 + (DER.pas.biaPct || 0)));
    S.inv[k] -= n; if (S.inv[k] <= 0) delete S.inv[k]; S.bia += each * n; log(L(`ขาย ${nm(ITEMS[k])} ×${n} ได้ ${(each * n).toLocaleString()} เบี้ย`, `Sold ${nm(ITEMS[k])} ×${n} for ${(each * n).toLocaleString()} Bia`), 'g'); VFX.play('coins', {x:P.x, y:P.y - 30}); dirty = true; traderRefresh(); return; }
  if (ds.sellall){ let sum = 0; for (const k of Object.keys(S.inv)) if (ITEMS[k] && ITEMS[k].kind === 'etc'){ sum += Math.round(ITEMS[k].sell * marketRate(k) * (1 + (DER.pas.biaPct || 0))) * S.inv[k]; delete S.inv[k]; }
    S.bia += sum; log(L(`ขายของทั้งหมดได้ ${sum.toLocaleString()} เบี้ย`, `Sold all loot for ${sum.toLocaleString()} Bia`), 'g'); VFX.play('coins', {x:P.x, y:P.y - 30}); dirty = true; traderRefresh(); return; }
  if (ds.buygear){ const gr = GEAR[ds.buygear]; if (!gr || S.bia < gr.buy || S.lvl < gr.lv) return; S.bia -= gr.buy; addItem(gr.id, gr.pack || 1);
    if (gr.slot === 'ammo' && ammoFits(gr.id) && (!S.gear.ammo || !S.inv[S.gear.ammo] || !ammoFits(S.gear.ammo) || S.gear.ammo === gr.id)){ S.gear.ammo = gr.id; derive(); }
    log(L(`ซื้อ ${nm(gr)} · กด Q เพื่อสวมใส่`, `Bought ${nm(gr)} · press Q to wear it`), 'g'); toast(L('ซื้อแล้ว · สวมใส่ในหน้าต่างอุปกรณ์ (Q)', 'Bought · wear it in the Equipment window (Q)')); dirty = true; return; }
  if (ds.wear && ITEMS[ds.wear] && ITEMS[ds.wear].kind === 'ammo'){ if (S.lvl < ITEMS[ds.wear].lv || !ammoFits(ds.wear)) return; S.gear.ammo = ds.wear; derive(); dirty = true; save(); return; }
  if (ds.wear){ const it = ITEMS[ds.wear]; if (!it || !S.inv[ds.wear] || S.lvl < it.lv) return;
    if (!canWield(it) && it.st && it.wtype === JOBS[S.job].weapon.type && (it.st.axe || (typeof NL_LINE_OF !== 'undefined' && NL_LINE_OF[S.job] === 'merchant'))){ toast(it.st.axe ? L('ขวานใช้ได้เฉพาะสายพ่อค้า (พ่อค้า · วาณิช · มหาเศรษฐี)', 'Axes are for the merchant line only') : L('สายพ่อค้าใช้ได้เฉพาะขวาน', 'The merchant line wields axes only')); return; }   // (v187) say why, instead of "cannot use a sword"
    if (!canWield(it)){ toast(!lineOk(it.st) || !WTYPE[it.wtype] ? L(`${nm(JOBS[S.job])} ใช้ชิ้นนี้ไม่ได้ (ของเฉพาะสาย)`, `${nm(JOBS[S.job])} cannot use this (class gear)`) : L(`${nm(JOBS[S.job])} ใช้${L(...WTYPE[it.wtype])}ไม่ได้`, `${nm(JOBS[S.job])} cannot use a ${WTYPE[it.wtype][1]}`)); return; } S.gear = S.gear || {}; const wsl = typeof wearSlot === 'function' ? wearSlot(it) : it.slot; if (!wsl) return; const old = S.gear[wsl]; if (old) addItem(old, 1);
    S.inv[ds.wear]--; if (!S.inv[ds.wear]) delete S.inv[ds.wear]; S.gear[wsl] = ds.wear; derive(); log(L(`สวม ${nm(it)}`, `Wearing ${nm(it)}`)); dirty = true; save(); return; }
  if (ds.unwear){ const sl = ds.unwear, id = S.gear && S.gear[sl]; if (!id) return; S.gear[sl] = null; if (sl !== 'ammo') addItem(id, 1); derive(); dirty = true; save(); return; }
  if (ds.warp != null){ const id = +ds.warp, fee = warpFee(id); if (!S.visited[id] || S.bia < fee || id === MAP_ID) return; S.bia -= fee; closeDialog(); closeWin('world'); warpTo(id); return; }
  if (ds.qaccept){ questAccept(ds.qaccept); return; }
  if (ds.qturnin){ questTurnIn(); return; }
  if (ds.btake){ bountyTake(+ds.btake); return; }
  if (ds.bclaim){ bountyClaim(+ds.bclaim); return; }
  if (ds.close){ closeDialog(); return; }
});
