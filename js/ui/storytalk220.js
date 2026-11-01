/* VAYRATHEN — js/ui/storytalk220.js — (v220) map-story talk, line by line
   A story NPC's lines used to arrive as one block of text. Now they play out in beats: the NPC's sentences one after
   another, and whenever the road's companion cuts in («…» after a dash: «— «That's Grandpa!» cries Khao Hom») the
   portrait turns to her and her name tops the bubble, with the stage direction in small italics below. A «ต่อ ▸»
   button (or a tap on the bubble) moves on; «ข้าม» shows the whole page at once. The task box appears after the last
   beat. Lines are typed out as before. */
'use strict';

// every companion has her figure ready, so her portrait can be drawn on any map
for (const arc of MS_ARCS) for (const d of [arc.comp, arc.extra].filter(Boolean)) if (!NPC_LOOKS[d.id]) NPC_LOOKS[d.id] = msLookOf(d);

/* split a page into beats: [{who:'npc'|'comp', text, note}] */
function stBeats(text){
  const out = []; if (!text) return out;
  const parts = String(text).split(/\s*—\s*/);
  parts.forEach((seg, i) => { seg = seg.trim(); if (!seg) return;
    const q = i > 0 && /^«([^»]+)»\s*(.*)$/s.exec(seg);
    if (q){ out.push({who:'comp', text:q[1].trim(), note:q[2].trim()}); return; }
    // the NPC's own words: sentence by sentence, grouped so no beat is too short or too long
    const sents = seg.match(/[^!?…\.]+(?:[!?…\.]+|$)/g) || [seg]; let cur = '';
    for (const s0 of sents){ const s = s0.trim(); if (!s) continue; if (cur && (cur + ' ' + s).length > 92){ out.push({who:'npc', text:cur}); cur = s; } else cur = cur ? cur + ' ' + s : s; }
    if (cur) out.push({who:'npc', text:cur}); });
  return out;
}
const ST = {beats:[], i:0, npc:null, comp:null, timer:0};
function stPortrait(d){ const cv = document.querySelector('#dialog .dp'); if (!cv || !d) return; const sh = typeof npcSheet === 'function' ? npcSheet(d.id) : null; if (!sh) return;
  const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height); g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, cv.width, cv.height); }
function stShow(){
  const d = el('dialog'), b = ST.beats[ST.i], sp = d && d.querySelector('.sayt'); if (!b || !sp) return;
  const who = b.who === 'comp' && ST.comp ? ST.comp : ST.npc, last = ST.i >= ST.beats.length - 1;
  stPortrait(who);
  const h = d.querySelector('.dn h3'), sm = d.querySelector('.dn small'); if (h) h.textContent = nm(who); if (sm) sm.textContent = Array.isArray(who.role) ? L(who.role[0], who.role[1]) : L(who.role || '', who.roleEn || who.role || '');
  d.querySelector('.say').classList.toggle('stcomp', b.who === 'comp');
  clearInterval(d._type); clearInterval(ST.timer); let i = 0; const plain = b.text; sp.textContent = ''; sp.classList.add('typing');
  const done = () => { clearInterval(ST.timer); sp.textContent = plain; sp.classList.remove('typing'); };
  ST.timer = setInterval(() => { i += 2; if (i >= plain.length) done(); else sp.textContent = plain.slice(0, i); }, 26);
  let note = d.querySelector('.stnote'); if (!note){ note = document.createElement('small'); note.className = 'stnote'; d.querySelector('.say').appendChild(note); } note.textContent = b.note || ''; note.hidden = !b.note;
  const nav = d.querySelector('.stnav'); if (nav) nav.querySelector('.stct').textContent = `${ST.i + 1}/${ST.beats.length}`;
  for (const x of d.querySelectorAll('.db > :not(.say):not(.stnav)')) x.hidden = !last;
  if (nav){ nav.querySelector('[data-stnext]').hidden = last; nav.querySelector('[data-stskip]').hidden = last; }
  d.querySelector('.say').onclick = () => { if (sp.classList.contains('typing')) done(); else if (!last){ ST.i++; stShow(); } };
}
{ const _o = msOpenNpc;
  msOpenNpc = function(n){ const r = _o.apply(this, arguments); const d = el('dialog'); if (!d || d.hidden) return r;
    const text = d.dataset.say || '', beats = stBeats(text.replace(/<[^>]+>/g, '')); if (beats.length < 2) return r;
    const arc = msArcOf(MAP_ID) || MS_ARCS[0];
    ST.beats = beats; ST.i = 0; ST.npc = n.ms ? ([...MS_ARCS.flatMap(a => [a.comp, a.extra].filter(Boolean)), ...Object.values(MS_CH).map(c => c.npc)].find(x => x.id === n.id) || n) : n; ST.comp = arc.comp;
    const db = d.querySelector('.db'); if (!db) return r; let nav = db.querySelector('.stnav');
    if (!nav){ nav = document.createElement('div'); nav.className = 'stnav'; nav.innerHTML = `<span class="stct"></span><button class="btn sm" data-stskip="1">${L('ข้าม', 'Skip')}</button><button class="btn sm gold" data-stnext="1">${L('ต่อ ▸', 'Next ▸')}</button>`; db.querySelector('.say').after(nav); }
    stShow(); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-stnext],[data-stskip]'); if (!b) return;
  if (b.dataset.stskip) ST.i = ST.beats.length - 1; else ST.i = Math.min(ST.beats.length - 1, ST.i + 1); stShow(); });
{ const st = document.createElement('style'); st.textContent = `
  #dialog .stnav{display:flex;align-items:center;justify-content:flex-end;gap:6px;margin:4px 0 6px}
  #dialog .stnav .stct{margin-right:auto;font-size:11px;color:#9a7a4a}
  #dialog .say.stcomp{background:linear-gradient(#fff6fa,#ffe8f2)!important;border-color:#f0b0c8!important}
  #dialog .say .stnote{display:block;margin-top:4px;font-style:italic;font-size:11.5px;color:#9a6a7a}`; document.head.appendChild(st); }
