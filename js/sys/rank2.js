/* VAYRATHEN — js/sys/rank2.js — the ranking board grows tabs
   Social window (N) → อันดับ: Level · Achievements · PvP (Elo) · Story shards, top 50 each, and a class-line filter
   (all, warrior, mage, muay, hunter, healer, thief, summoner). Your own row is highlighted. Reads players/<id>. */
'use strict';

const RK = {tab:'lvl', line:'all', rows:{}, sub:null, subTab:null};
const RK_TABS = [['lvl', 'เลเวล', 'Level'], ['ach', 'ความสำเร็จ', 'Achievements'], ['pvp', 'PvP', 'PvP'], ['shards', 'ศิลาเรื่องเล่า', 'Story shards']];
const RK_LINES = [['all', 'ทุกสาย', 'All'], ['blade', 'นักรบ', 'Warrior'], ['rune', 'เวท', 'Mage'], ['muay', 'มวย', 'Muay'], ['ranger', 'พราน', 'Hunter'], ['healer', 'หมอ', 'Healer'], ['rogue', 'โจร', 'Thief'], ['summoner', 'อัญเชิญ', 'Summoner']];
const rkLine = j => { try { const c = jobChain(j); return c[1] || c[0] || ''; } catch (e) { return ''; } };
function rkLoad(){
  if (typeof NET === 'undefined' || !NET.db || RK.subTab === RK.tab) return;
  try { if (typeof RK.sub === 'function') RK.sub(); } catch (e) {}
  RK.subTab = RK.tab; const tab = RK.tab;
  try { RK.sub = NET.db.collection('players').orderBy(tab, 'desc').limit(60).onSnapshot(s => { RK.rows[tab] = s.docs.map(d => d.data()); if (typeof renderSocial === 'function') renderSocial(); }, () => {}); } catch (e) {}
}
const rkVal = r => (RK.tab === 'lvl' ? `Lv ${clamp(r.lvl | 0, 1, 999)}` : RK.tab === 'ach' ? `${clamp(r.ach | 0, 0, 999)} ${L('ความสำเร็จ', 'achievements')}` : RK.tab === 'pvp' ? `Elo ${clamp(r.pvp | 0, 0, 9999)}` : `${clamp(r.shards | 0, 0, QUESTS.length)}/${QUESTS.length} ${L('ศิลา', 'shards')}`);
{ const _rs = renderSocial;
  renderSocial = function(){ const r = _rs.apply(this, arguments); const pane = el('pane-social'), box = pane && pane.querySelector('#soRank'); if (!box) return r;
    rkLoad(); const src = RK.rows[RK.tab] || (RK.tab === 'lvl' && typeof rankRows !== 'undefined' ? rankRows : []);
    const rows = src.filter(x => RK.line === 'all' || rkLine(x.job) === RK.line).slice(0, 50), me = netName();
    const head = box.previousElementSibling; if (head && head.classList.contains('sec')) head.innerHTML = `${L('อันดับนักผจญภัย', 'Adventurer ranking')}
      <div class="rktabs">${RK_TABS.map(([k, th, en]) => `<button class="${RK.tab === k ? 'on' : ''}" data-rktab="${k}">${L(th, en)}</button>`).join('')}</div>
      <select class="rkline" data-rkline="1">${RK_LINES.map(([k, th, en]) => `<option value="${k}" ${RK.line === k ? 'selected' : ''}>${L(th, en)}</option>`).join('')}</select>`;
    box.innerHTML = rows.length ? rows.map((x, i) => `<div class="item${clean(x.name, 18) === me ? ' me' : ''}"><span class="rk${i < 3 ? ' top' + i : ''}">${i + 1}</span><div class="nm"><b class="pn"></b><small>${JOBS[x.job] ? nm(JOBS[x.job]) : '—'} · ${rkVal(x)}</small></div></div>`).join('')
      : `<p class="hint">${NET.db ? L('ยังไม่มีข้อมูล', 'No data yet') : L('ตารางอันดับใช้ได้เมื่อออนไลน์', 'The ranking works online')}</p>`;
    box.querySelectorAll('.pn').forEach((b, i) => { b.textContent = clean(rows[i] && rows[i].name, 18) || L('นักผจญภัย', 'Adventurer'); });
    return r; };
}
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-rktab]'); if (!b) return; RK.tab = b.dataset.rktab; renderSocial(); });
document.addEventListener('change', e => { if (!e.target.dataset || !e.target.dataset.rkline) return; RK.line = e.target.value; renderSocial(); });
{ const st = document.createElement('style');
  st.textContent = `.rktabs{display:flex;flex-wrap:wrap;gap:4px;margin:6px 0 4px}.rktabs button{font:600 12px var(--display,sans-serif);padding:3px 9px;border-radius:9px;border:1.5px solid rgba(255,255,255,.5);background:rgba(0,0,0,.2);color:inherit;cursor:pointer}
  .rktabs button.on{background:#ffd34a;color:#3a2400;border-color:#fff}.rkline{margin:2px 0 6px;font-size:12px;border-radius:8px;padding:2px 6px}
  #soRank .item.me{outline:2px solid #ffd34a;border-radius:8px}#soRank .rk.top0{background:#ffd34a;color:#3a2400}#soRank .rk.top1{background:#d8dde8;color:#2a2a3a}#soRank .rk.top2{background:#e0a070;color:#3a1a00}`;
  document.head.appendChild(st); }
