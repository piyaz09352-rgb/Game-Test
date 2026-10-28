/* VAYRATHEN — js/ui/npc.js */
'use strict';

/* ---------- NPC dialogs ---------- */
const NPC_SPR = {job:'sage', shop:'aunt', trader:'trader', armorer:'armorer', boatman:'boatman', warp:'keeper'};
const IC = {
  pot:c => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" style="color:${c}"><path d="M9.5 3h5M10 3v4.5L6.2 13a6 6 0 1011.6 0L14 7.5V3"/><path d="M7 14.5h10a5.5 5.5 0 01-10 0z" fill="currentColor" opacity=".55"/></svg>`,
  bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8 7V5.5a4 4 0 018 0V7"/><path d="M4.5 7h15l-1.2 13H5.7z"/><path d="M9.5 12h5"/></svg>',
  ore:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l7 5-2.5 10h-9L5 8z"/><path d="M12 3v15M5 8l7 3 7-3"/></svg>',
  x:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>'
};
function npcPortrait(n){
  const cv = $('#dialog .dp'); if (!cv || !SHEETS) return;
  const sh = SHEETS[NPC_SPR[n.id]], K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d');
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, cv.width, cv.height);
  g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, cv.width, cv.height);
}
const npcRole = n => L(n.role, n.roleEn);
/* (v184) the market's list is drawn again after every sale, keeping the scroll: sold rows go, counts and prices update */
function traderRefresh(){ const d = $('#dialog'), n = typeof NPCS !== 'undefined' && NPCS.find(x => x.id === 'trader'); if (!d || d.hidden || !n || !d.querySelector('[data-sellall],[data-sellid]')) return;
  const scr = () => [...d.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 4 && /auto|scroll/.test(getComputedStyle(e).overflowY));
  const tops = scr().map(e => e.scrollTop); openNpc(n); scr().forEach((e, i) => { if (tops[i]) e.scrollTop = tops[i]; }); }
function openNpc(n){
  if (typeof NPC_OPEN !== 'undefined' && NPC_OPEN[n.id]){ NPC_OPEN[n.id](n); return; }
  const d = $('#dialog'); let say = '', body = '';
  const wallet = `<span class="wallet">${S.bia.toLocaleString()} <small>${CUR()}</small></span>`;
  if (n.id === 'job'){
    const j = JOBS[S.job], block = jobChangeBlock();
    if (j.next && !block){
      say = j.tier === 1 ? L('เสียงของวายราเลือกเจ้าแล้ว ผู้ตื่น จงเลือกเส้นทางของเจ้า', 'Vayra has chosen you, awakened one. Choose your path.')
                         : L(`${nm(j)}ผู้กล้า ถึงเวลาก้าวขึ้นเป็นผู้นำแห่งสายของเจ้า`, `Brave ${nm(j)}, it is time to rise to the peak of your path.`);
      const blurb = {summoner:L('เรียกสัตว์หิมพานต์ช่วยสู้', 'Calls Himmapan beasts to fight'), sovereign:L('ครุฑ ช้างเอราวัณ กองทัพหิมพานต์', 'Garuda, Erawan, a Himmapan legion'), blade:L('แนวหน้า HP สูง ดึงมอน', 'Front line, high HP, taunts'), rune:L('เวท ดิน น้ำ ลม ไฟ', 'Earth, water, wind, fire spells'), ranger:L('ยิงไกล มี Pet', 'Long range, pets'),
        warlord:L('แทงค์ ดึงมอน โล่ทองให้เพื่อน', 'Tank, taunts, shields allies'), astro:L('เวทวงกว้าง 4 ธาตุ', 'Wide spells of four elements'), warden:L('ยิงทะลวง เสือวิญญาณ Pet แรง', 'Piercing shots, spirit tiger, strong pet'),
        muay:L('คอมโบ ยิ่งต่อยิ่งแรง', 'Combos that grow stronger'), healer:L('ฟื้น HP บัพเพื่อน น้ำมนต์', 'Heals, ally buffs, holy water'), rogue:L('มีดคู่ ล้วงของ หายตัว', 'Twin daggers, stealing, stealth'),
        grandmaster:L('แม่ไม้มวยไทย คอมโบยาว', 'Muay Thai master moves, long combos'), physician:L('ฟื้นแรง เกราะ บัพทั้งทีม', 'Strong heals, wards, team buffs'), tigershade:L('ตีปกติแรงมาก คริติคอลรุนแรง เงาฟันซ้ำ', 'Huge normal attacks, brutal crits, a shadow that strikes again'), bulwark:L('โล่มนุษย์ รับดาเมจแทนทีม', 'A living wall that shields the team'), archsage:L('เวทใหญ่ 4 ธาตุ ทำลายล้างวงกว้าง', 'Grand spells of the four elements'), ringlord:L('คอมโบยาว ปิดฉากแรงมหาศาล', 'Long combos, a crushing finisher'), sylvan:L('ศรพายุ สัตว์เลี้ยงแรงมาก', 'Storm arrows, a mighty pet'), divinehealer:L('ฟื้นทั้งทีม พรเทวดา', 'Team heals, divine blessings'), himmaemperor:L('ทัพสัตว์หิมพานต์ บัญชาบุก', 'Himmapan host, royal charge'), bandit:L('ลอบสังหาร Crit สูง', 'Assassination, high Crit')};
      body = `<div class="jobs${j.next.length === 1 ? ' one' : ''}">${j.next.map(id => `<button class="choice" data-job="${id}"><canvas class="jp" data-jp="${id}" width="48" height="48"></canvas><span><b>${nm(JOBS[id])}</b><small>${blurb[id]}</small><em>${JOBS[id].stat}</em></span></button>`).join('')}</div>
        <p class="hint">${L('สกิลของ Job เดิมติดตัวไปทั้งหมด', 'You keep every skill from your earlier Jobs')}</p>`;
    } else if (j.next){
      say = j.tier === 1 ? L('ผนึกใต้ทุ่งสุวรรณินเริ่มร้าวแล้ว ฝึกฝนให้พร้อมแล้วกลับมาหาข้า', 'The seal beneath the Suwannin fields is cracking. Train, then return to me.')
                         : L('พลังของเจ้ายังไม่ถึงขั้น ฝึกต่อไปเถิด', 'Your power is not yet enough. Keep training.');
      const pj = Math.min(100, S.jlvl / j.jobMax * 100);
      body = `<div class="prog"><span>Job Lv ${S.jlvl} / ${j.jobMax}</span><div class="pbar"><i style="width:${pj}%"></i></div></div>
        ${j.tier === 2 || j.tier === 3 ? (need => `<div class="prog"><span>Base Lv ${S.lvl} / ${need}</span><div class="pbar"><i style="width:${Math.min(100, S.lvl / need * 100)}%"></i></div></div>`)(j.tier === 2 ? 40 : 150) : ''}
        <p class="hint">${block}</p>`;
    } else {
      say = L(`${nm(j)}ผู้ยิ่งใหญ่ เจ้าถึงขั้นสูงสุดแล้ว จงปกป้องอาณาจักรวายรา`, `Great ${nm(j)}, you have reached the summit. Protect the realm of Vayra.`);
    }
  } else if (n.id === 'trader'){
    // ตลาดกลาง buyer: every loot family has its own price today
    const etc = Object.keys(S.inv).filter(k => ITEMS[k] && ITEMS[k].kind === 'etc');
    const zb = 1 + (DER.pas.biaPct || 0), total = etc.reduce((s2, k) => s2 + Math.round(ITEMS[k].sell * marketRate(k) * zb) * S.inv[k], 0);
    say = L('ของจากทุกแคว้นเอามาได้หมด ราคาวันนี้ขึ้นลงตามตลาดนะ ดูให้ดีก่อนขาย', 'I buy loot from every region. Prices move with the market each day, so check before you sell.');
    // (v184) "sell everything" sits at the top, above the list, like the other shops (it used to be at the very bottom)
    body = `<div class="sec">${L('ราคารับซื้อวันนี้', "Today's prices")}</div>${etc.length ? `<div class="srow total sellalltop"><span class="ic">${IC.bag}</span><div class="nm"><b>${L('ขายทั้งหมด', 'Sell everything')}</b><small>${L(`ของสะสม ${etc.length} ชนิด`, `${etc.length} kinds of loot`)}</small></div><span class="pr plus">+${total.toLocaleString()}</span><button class="btn gold sm" data-sellall="1">${L('ขายทั้งหมด', 'Sell all')}</button></div>` : ''}<div class="shop">${etc.length ? etc.map(k => { const r = marketRate(k), pr = Math.round(ITEMS[k].sell * r * zb);
        return `<div class="srow"><span class="ic">${itemIcon(k)}</span><div class="nm"><b>${nm(ITEMS[k])} <span class="ct">×${S.inv[k]}</span></b><small class="${r >= 1.1 ? 'up' : r <= .9 ? 'down' : ''}">${r >= 1 ? '▲' : '▼'} ${Math.round(r * 100)}% · ${L('ชิ้นละ', 'each')} ${pr.toLocaleString()} ${CUR()}</small></div>
        <button class="btn sm" data-sellid="${k}" data-n="1">×1</button><button class="btn sm" data-sellid="${k}" data-n="all">${L('ทั้งหมด', 'All')}</button></div>`; }).join('')
      : `<p class="hint">${L('ยังไม่มีของสะสมจะขาย', 'No loot to sell yet')}</p>`}</div>
      <div class="sec">${L('ของใช้เดินทาง', 'Travel supplies')}</div><div class="shop"><div class="srow"><span class="ic">${itemIcon('talisman')}</span><div class="nm"><b>${nm(ITEMS.talisman)}</b><small>${itemDesc('talisman')} · ${L('มี', 'have')} ${(S.inv.talisman || 0).toLocaleString()}</small></div><span class="pr">${ITEMS.talisman.buy.toLocaleString()}</span>${qtyBox('talisman', 'item')}</div></div>
`;
  } else if (n.id === 'armorer'){
    say = L('เกราะ หมวก กางเกง รองเท้า โล่ ต่างหู แว่น หน้ากาก ลูกธนู ของดีทั้งนั้น ใส่แล้วกด Q ดูในหน้าต่างอุปกรณ์ได้เลย', 'Armour, helmets, arrows, all good work. Wear them from the Equipment window (Q).');
    const sec = (slot, title) => `<div class="sec">${title}</div><div class="shop">${GEAR_LIST.filter(g2 => g2[1] === slot).map(([id]) => { const gr = GEAR[id], own = (S.inv[id] || 0) + (S.gear && S.gear[slot] === id ? 1 : 0), lvOk = S.lvl >= gr.lv;
      return `<div class="srow${lvOk ? '' : ' locked'}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(gr)}</b><small>${gearStatText(gr.st)} · <span class="${lvOk ? '' : 'bad'}">Lv ${gr.lv}</span>${own ? (gr.pack > 1 ? ` · ${L('มี', 'have')} ${S.inv[id] || 0}` : ` · ${L('มีแล้ว', 'owned')}`) : ''}</small></div>
        <span class="pr">${gr.buy.toLocaleString()}${gr.pack > 1 ? `<small> /${gr.pack}</small>` : ''}</span><button class="btn sm" data-buygear="${id}" ${S.bia >= gr.buy && lvOk ? '' : 'disabled'}>${L('ซื้อ', 'Buy')}</button></div>`; }).join('')}</div>`;
    const sec2 = (slot, title) => sec(slot, title).replace(/<div class="srow[^"]*"><span class="ic">.*?<\/button><\/div>/gs, m => { const id = (/data-buygear="([^"]+)"/.exec(m) || [])[1]; return id && GEAR[id] && GEAR[id].lv > 100 ? '' : m; });   // the market keeps the everyday tiers (Lv ≤ 100); the smith has them all
    body = sec('armor', L('เกราะ', 'Armour')) + sec('head', L('หมวก', 'Headgear')) + sec2('shoes', L('รองเท้า', 'Feet')) + (JOBS[S.job].weapon.type === 'bow' || S.job === 'novice' ? sec('ammo', L('ลูกธนู (กำหนดธาตุของการยิง)', 'Arrows (set the element of your shots)')) : `<p class="hint">${L('ลูกธนูมีขายสำหรับสายพรานเท่านั้น', 'Arrows are only sold to hunters')}</p>`);
  } else if (n.id === 'boatman' || n.id === 'warp'){
    say = n.id === 'boatman' ? L('จะไปไหนล่ะหลาน ตาพายไปส่งได้ทุกที่ที่เคยไปมาแล้ว', 'Where to, child? I can row you anywhere you have been before.')
                             : L('ศาลนี้เชื่อมทุกแคว้นที่เจ้าเคยเหยียบ จะกลับบ้านหรือไปที่ใด', 'This shrine links every region you have set foot in. Home, or elsewhere?');
    body = `<div class="shop warps">${MAPS.map(mp => { const seen = S.visited && S.visited[mp.id], here = mp.id === MAP_ID, fee = warpFee(mp.id);
      return `<div class="srow${seen ? '' : ' locked'}"><span class="ic wm">${mp.id}</span><div class="nm"><b>${nm(mp)}${here ? ` <span class="ct">· ${L('อยู่ที่นี่', 'you are here')}</span>` : ''}</b><small>Lv ${mp.lv[0]}–${mp.lv[1]} · ♛ ${nm(MOB[mp.boss])}</small></div>
        <span class="pr">${fee ? fee.toLocaleString() : L('ฟรี', 'Free')}</span><button class="btn sm" data-warp="${mp.id}" ${seen && !here && S.bia >= fee ? '' : 'disabled'}>${seen ? L('ไป', 'Go') : L('ยังไม่เคยไป', 'Not visited')}</button></div>`; }).join('')}</div>
      <button class="btn wide" data-win-open="world">${L('เปิดแผนที่โลก', 'Open world map')} <kbd>M</kbd></button>`;
  } else {
    const etc = Object.keys(S.inv).filter(k => ITEMS[k].kind === 'etc');
    const etcN = etc.reduce((s, k) => s + S.inv[k], 0), etcVal = etc.reduce((s, k) => s + ITEMS[k].sell * S.inv[k], 0);
    const row = (id, color) => { const it = ITEMS[id];
      return `<div class="srow"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(it)}</b><small>${itemDesc(id)} · ${L('มี', 'have')} ${(S.inv[id] || 0).toLocaleString()}</small></div>
        <span class="pr">${it.buy.toLocaleString()}</span>${qtyBox(id, 'item')}</div>`; };
    // arrows are sold here and only here (price per pack)
    const arrow = ([id]) => { const gr = GEAR[id], lvOk = S.lvl >= gr.lv;
      return `<div class="srow${lvOk ? '' : ' locked'}"><span class="ic">${itemIcon(id)}</span><div class="nm"><b>${nm(gr)}</b><small>${gearStatText(gr.st)} · <span class="${lvOk ? '' : 'bad'}">Lv ${gr.lv}</span> · ${L(`ห่อละ ${gr.pack || 1} ดอก`, `${gr.pack || 1} per pack`)} · ${L('มี', 'have')} ${(S.inv[id] || 0).toLocaleString()}</small></div>
        <span class="pr">${gr.buy.toLocaleString()}<small> /${L('ห่อ', 'pack')}</small></span>${qtyBox(id, 'pack')}</div>`; };
    say = L('มาแล้วเหรอหลาน ยาหม้อใหม่เพิ่งต้มเสร็จ ร้านป้าขายแต่ยากับโพชั่นนะ จะเอากี่ขวดก็บอกมา', 'Back again, dear? A fresh pot of medicine just finished brewing. I sell only medicine and potions: tell me how many bottles you need.');
    body = `<div class="sec">${L('ซื้อ', 'Buy')}</div><div class="shop">${row('redpot', '#ff7b6b')}${row('orangepot', '#ffa04a')}${row('whitepot', '#f0f0f0')}${row('elixirpot', '#ffd36a')}${row('divinepot', '#ff9ad8')}${row('bluepot', '#7fb4ff')}${row('bigbluepot', '#4a7aff')}${row('skypot', '#5aa8ff')}${ITEMS.greenpot ? row('greenpot', '#7fe08a') : ''}</div>
      <p class="hint">${L('ร้านยาขายแต่ยาและโพชั่น · ยันต์กลับบ้านอยู่ที่เถ้าแก่ฮง ตลาดกลาง · ลูกธนูและอุปกรณ์อยู่ที่ช่างตีเหล็กเพชร', 'Potions only · the Return Talisman is at Thaokae Hong\'s market · arrows and gear at Blacksmith Phet')}</p></div>`;
  }
  // quests: Master Vayra gives chapter 0, every shrine keeper gives its map's chapter and bounty
  if (n.id === 'job' || n.id === 'warp'){ const qd = questDialog(n); if (n.id === 'warp'){ body = qd.h + body; if (qd.say) say = qd.say; } else { body += qd.h; if (qd.say && (jobChangeBlock() || !JOBS[S.job].next)) say = qd.say; } }
  d.innerHTML = `<header class="dh"><div class="dpw"><canvas class="dp" width="64" height="64"></canvas></div>
      <div class="dn"><h3>${nm(n)}</h3><small>${npcRole(n)}</small></div>${n.id !== 'job' ? wallet : ''}
      <button class="ibtn dx" data-close="1" aria-label="${L('ปิด', 'Close')}">${IC.x}</button></header>
    <div class="db"><p class="say"><span class="sayt"></span></p>${body}</div>`;
  // the NPC speaks: text types out the first time this line is shown, instantly on refreshes
  const sp = d.querySelector('.sayt'), again = d.dataset.say === say && !d.hidden;
  d.hidden = false; d.dataset.npc = n.id; d.dataset.say = say; npcPortrait(n);
  clearInterval(d._type);
  if (again || !say) sp.innerHTML = say;
  else { const plain = say.replace(/<[^>]+>/g, ''); let i = 0; sp.textContent = ''; sp.classList.add('typing');
    d._type = setInterval(() => { i += 2; if (i >= plain.length){ clearInterval(d._type); sp.innerHTML = say; sp.classList.remove('typing'); } else sp.textContent = plain.slice(0, i); }, 28);
    d.querySelector('.say').onclick = () => { clearInterval(d._type); sp.innerHTML = say; sp.classList.remove('typing'); }; }
  // little job portraits on the choices
  for (const cv of d.querySelectorAll('canvas.jp')){ const sh = heroSheet(cv.dataset.jp, {}, S.look); if (!sh) continue; const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle'), g = cv.getContext('2d');
    g.imageSmoothingEnabled = false; g.drawImage(c, fs / 2 - 16 * K, sh.anchor[1] - 46 * K, 32 * K, 32 * K, 0, 0, 48, 48); }
}
function closeDialog(){ const d = $('#dialog'); clearInterval(d._type); if (!d.hidden) d.hidden = true; if (d.dataset.say) d.dataset.say = ''; }   // (v91) Auto calls this every step: no write when already closed
