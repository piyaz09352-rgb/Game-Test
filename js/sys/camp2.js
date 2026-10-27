/* VAYRATHEN — js/sys/camp2.js — life at the camps
   · QUARTERMASTER (พ่อค้าเสบียง) at every camp: potions, green potions, return talismans and arrows without
     going back to town; cooks your catch over the campfire (fish → food buffs, sys/fishing.js).
   · CAMP JOBS (งานประจำแคมป์): two hunts per map per day (Thai day), set from that map's own monsters.
     Rewards: Bia, Vayra ore and a Vayra Coin. They reset at 00:00 Thai time.
   · ZONE TITLES: walking into Aren or a camp shows the place's name in the middle of the screen. */
'use strict';

/* ---------- the quartermaster ---------- */
NPC_LOOKS.quarter = {job:'novice', look:{sex:'m', hair:1, color:'hairBrown'}, gear:{armor:'c_daily', head:'hc_leaf'}};
{
  const _s = setupNpcs;
  setupNpcs = function(id){ _s(id); if (id !== 0 && CAMP) NPCS.push({id:'quarter', name:'ลุงเสบียง', en:'Uncle Sabiang', role:'เสบียง · งานแคมป์ · ทำอาหาร', roleEn:'Supplies · Camp jobs · Cooking', x:CAMP.x - 54, y:CAMP.y + 42}); };
}
/* camp jobs: deterministic per map and day, so everyone in the camp gets the same board */
function campJobs(){
  const day = dayKey(); S.camp = S.camp && S.camp.day === day ? S.camp : {day, m:{}};
  if (!S.camp.m[MAP_ID]){
    const pool = (MAPS[MAP_ID].mobs || []).filter(t => MOB[t] && !MOB[t].boss); if (!pool.length) return [];
    const h = hashS(`${day}:${MAP_ID}`), a = pool[h % pool.length], b = pool[(h >> 7) % pool.length] === a ? pool[(h % pool.length + 1) % pool.length] : pool[(h >> 7) % pool.length];
    S.camp.m[MAP_ID] = [{t:a, need:25, n:0, ok:0}, {t:b, need:15, n:0, ok:0}];
  }
  return S.camp.m[MAP_ID];
}
const campPay = () => { const lv = (MAPS[MAP_ID].lv || [1])[0] || 1; return {z:400 + lv * 45, ore:2, c:1}; };
EV.on('kill', m => {
  if (!m || MAP_ID === 0 || !S.camp || S.camp.day !== dayKey() || !S.camp.m[MAP_ID]) return;
  for (const j of S.camp.m[MAP_ID]) if (!j.ok && j.t === m.type && j.n < j.need){ j.n++; if (j.n === j.need){ toast(L(`งานแคมป์เสร็จ: ${nm(MOB[j.t])} ${j.need} ตัว · กลับไปรับรางวัลที่แม่ครัวสายใจ`, `Camp job done: ${MOB[j.t].en} ×${j.need} · collect from Cook Saijai`)); SFX.play('quest'); } }
});
const COOK = [['fish_tilapia', 2, 'f_grill'], ['fish_catfish', 2, 'f_larb'], ['fish_snakehead', 2, 'f_tomyum'], ['fish_giantcat', 1, 'f_feast']];
NPC_OPEN.quarter = n => {
  const jobs = campJobs(), pay = campPay();
  const sup = ['redpot', 'orangepot', 'bluepot', 'greenpot', 'talisman'].filter(id => ITEMS[id] && ITEMS[id].buy);
  const row = id => { const it = ITEMS[id]; return `<div class="srow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(it)}</b><small>${itemDesc(id)} · ${L('มี', 'have')} ${S.inv[id] || 0}</small></div>
    <span class="pr">${it.buy.toLocaleString()}</span><button class="btn sm" data-buy="${id}" data-n="1" ${S.bia >= it.buy ? '' : 'disabled'}>×1</button><button class="btn sm" data-buy="${id}" data-n="10" ${S.bia >= it.buy * 10 ? '' : 'disabled'}>×10</button></div>`; };
  const arrows = typeof GEAR_LIST !== 'undefined' && (JOBS[S.job].weapon.type === 'bow' || S.job === 'novice') ? GEAR_LIST.filter(g2 => g2[1] === 'ammo').slice(0, 3).map(([id]) => { const gr = GEAR[id], ok = S.lvl >= gr.lv;
    return `<div class="srow${ok ? '' : ' locked'}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(gr)}</b><small>Lv ${gr.lv}${gr.pack > 1 ? ` · ×${gr.pack}` : ''}</small></div><span class="pr">${gr.buy.toLocaleString()}</span><button class="btn sm" data-buygear="${id}" ${S.bia >= gr.buy && ok ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button></div>`; }).join('') : '';
  const jobRow = (j, i) => `<div class="srow${j.ok ? ' owned' : ''}"><span class="ic">⚔</span><div class="nm"><b>${L('ล่า', 'Hunt')} ${nm(MOB[j.t])} ${j.n}/${j.need}</b><div class="pbar"><i style="width:${Math.round(j.n / j.need * 100)}%"></i></div></div>
    ${j.ok ? '<span class="pr">✓</span>' : `<button class="btn sm${j.n >= j.need ? ' gold' : ''}" data-cjob="${i}" ${j.n >= j.need ? '' : 'disabled'}>${L('รับรางวัล', 'Claim')}</button>`}</div>`;
  const cook = COOK.map(([f, k, d]) => { const it = ITEMS[d], have = S.inv[f] || 0; return `<div class="srow"><span class="ic">${itemIcon(d)}</span><div class="nm"><b>${nm(it)}</b><small>${itemDesc(d)} · ${nm(ITEMS[f])} ${have}/${k}</small></div><button class="btn sm" data-cook="${d}" ${have >= k ? '' : 'disabled'}>${L('ทำ', 'Cook')}</button></div>`; }).join('');
  npcFrame(n, L('มานั่งพักข้างกองไฟก่อนสิพ่อหนุ่มแม่หนุ่ม มีงานให้ทำ มีปลามาลุงย่างให้ด้วย', 'Sit by the fire a while. I have work for you, and if you bring fish, I will cook it for you.'),
    `<div class="sec">${L('งานประจำแคมป์วันนี้', "Today's camp jobs")} <span class="ct">${fmtN(pay.z)} ${CUR()} · ${L('แร่', 'ore')} ×${pay.ore} · ${L('เหรียญ', 'coin')} ×${pay.c} ${L('ต่องาน', 'each')}</span></div><div class="shop">${jobs.map(jobRow).join('')}</div>
     <div class="sec">${L('ทำอาหารข้างกองไฟ', 'Campfire cooking')}</div><div class="shop">${cook}</div>
     <p class="hint">${L('ยา ยันต์ และลูกธนู ซื้อได้ที่ร้านป้าบัวคำในนครอาเรน', 'Potions, talismans and arrows: Auntie Buakham\'s store in Aren')}</p>
     <p class="hint">${L('ตกปลาได้ริมน้ำทุกแห่ง: เดินไปใกล้น้ำแล้วกดปุ่ม 🎣 · อาหารให้บัฟ 3 นาที (กินได้ทีละอย่าง)', 'Fish at any water: walk to the shore and press 🎣 · food gives a 3-minute buff (one dish at a time)')}</p>`);
};
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-cjob],[data-cook]'); if (!b || b.disabled) return; const n = NPCS.find(x => x.id === 'quarter' || x.id === 'campcook');
  if (b.dataset.cjob != null){ const j = campJobs()[+b.dataset.cjob]; if (!j || j.ok || j.n < j.need) return; j.ok = 1; const p = campPay(); S.bia += p.z; addItem('ore', p.ore); if (typeof coinAdd === 'function') coinAdd(p.c, L('งานแคมป์', 'Camp job'));
    log(L(`งานแคมป์: +${fmtN(p.z)} เบี้ย แร่ ×${p.ore}`, `Camp job: +${fmtN(p.z)} Bia, ore ×${p.ore}`), 'g'); SFX.play('coin'); bump('campjobs'); save(); }
  else { const d = b.dataset.cook, r = COOK.find(c => c[2] === d); if (!r || (S.inv[r[0]] || 0) < r[1]) return; S.inv[r[0]] -= r[1]; if (!S.inv[r[0]]) delete S.inv[r[0]]; addItem(d, 1); SFX.play('craft'); toast(L(`ทำ${ITEMS[d].name}แล้ว`, `Cooked ${ITEMS[d].en}`)); save(); }
  if (n) NPC_OPEN.quarter(n);
});

/* ---------- zone titles ---------- */
const ZT = {inside:null, t:0, txt:'', sub:''};
EV.on('tick', dt => {
  if (PAUSED || !S || !S.job) return; ZT.t = Math.max(0, ZT.t - dt);
  const now = inVillage(P) ? (MAP_ID === 0 ? 'town' : 'camp') : null;
  if (now !== ZT.inside){ const prev = ZT.inside; ZT.inside = now;
    if (now && prev !== undefined){ ZT.t = 3.2; ZT.txt = now === 'town' ? L('นครอาเรน', 'Aren') : L('แคมป์พักแรม', "Travellers' Camp"); ZT.sub = now === 'town' ? L('เมืองหลวงแห่งวายรา · เขตปลอดภัย', 'Capital of Vayra · safe zone') : `${nm(MAPS[MAP_ID])} · ${L('เขตปลอดภัย พักฟื้นเร็ว ×2', 'safe zone · rest ×2')}`; SFX.play('quest'); } }
});
EV.on('map', () => { ZT.inside = undefined; setTimeout(() => { if (ZT.inside === undefined) ZT.inside = null; }, 0); });
EV.on('draw', () => {
  if (ZT.t <= 0) return; const k = ZT.t, a = Math.min(1, (3.2 - k) * 3, k * 1.5), y = SH * .3, z = Math.min(1.6, Math.max(.8, SH / 600));
  ctx.save(); ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = 230 * z, gr = ctx.createLinearGradient(SW / 2 - w, 0, SW / 2 + w, 0); gr.addColorStop(0, 'rgba(20,10,4,0)'); gr.addColorStop(.5, 'rgba(20,10,4,.6)'); gr.addColorStop(1, 'rgba(20,10,4,0)'); ctx.fillStyle = gr; ctx.fillRect(SW / 2 - w, y - 30 * z, w * 2, 64 * z);
  ctx.strokeStyle = 'rgba(255,214,120,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(SW / 2 - w * .7, y - 26 * z); ctx.lineTo(SW / 2 + w * .7, y - 26 * z); ctx.moveTo(SW / 2 - w * .7, y + 30 * z); ctx.lineTo(SW / 2 + w * .7, y + 30 * z); ctx.stroke();
  ctx.font = `700 ${Math.round(30 * z)}px Mali, sans-serif`; ctx.fillStyle = '#ffe8a8'; ctx.shadowColor = 'rgba(255,190,80,.8)'; ctx.shadowBlur = 12; ctx.fillText(ZT.txt, SW / 2, y - 4 * z);
  ctx.shadowBlur = 0; ctx.font = `500 ${Math.round(13 * z)}px Mali, sans-serif`; ctx.fillStyle = '#f0e0c0'; ctx.fillText(ZT.sub, SW / 2, y + 19 * z);
  ctx.restore();
});
