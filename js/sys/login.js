/* VAYRATHEN — js/sys/login.js — (v89) daily login rewards (รางวัลเข้าเกมรายวัน)
   A 28-day card for the account. Each day you play, tap "รับ" for the next box (missing a day never resets it,
   the card just waits). Days 7 · 14 · 21: a gear chest (Rare or better, for your level) and Vayra Coins;
   day 28: the Golden Vayra costume set (top + crown), only from here. Then a new card starts.
   The card opens by itself the first time you enter the world each day while a box is waiting (from Lv 5, after the tutorial).
   Thailand time (the same day as the daily tasks); runs once a second at most, only to check the day. */
'use strict';

COSTUME.c_login_gold = {slot:'top', src:'login', th:'ชุดทองวายรา', en:'Golden Vayra Raiment', look:{top:'goldLight', sleeve:'pearl', forearm:'goldLight', armband:'goldLight', pants:'midnight', bootCuff:'goldLight', belt:'goldLight', skirtM:'goldLight', skirtT:'pearl', necklace:true, pendant:'gem', neckMat:'goldLight', topTex:tx.combo(tx.sash(CM.gold), tx.dots(CM.gold))}};
COSTUME.hc_login_gold = {slot:'head', src:'login', th:'มงกุฎทองวายรา', en:'Golden Vayra Crown', look:{hat:'crest', bandMat:'goldLight', crestMat:'goldLight', crestN:7, crestGem:true}};
for (const id of ['c_login_gold', 'hc_login_gold']){ const c = COSTUME[id]; SPR.GEAR_LOOK[id] = c.slot === 'top' ? {...TOP0, ...c.look} : {...c.look}; }
COS_SRC.login = ['รางวัลเข้าเกมวันที่ 28', 'Day 28 login reward'];

const LGN = {auto:false, t:0};
const lgnHp = () => S.lvl >= 150 ? 'divinepot' : S.lvl >= 100 ? 'elixirpot' : S.lvl >= 50 ? 'whitepot' : S.lvl >= 15 ? 'orangepot' : 'redpot';
const lgnSp = () => S.lvl >= 150 ? 'skypot' : S.lvl >= 100 ? 'bigbluepot' : 'bluepot';
const lgnZ = () => 2000 + S.lvl * 300;
/* what day d (1-28) gives */
function lgnDay(d){
  if (d === 28) return {k:'cos', ic:'👑', s:L('ชุดทอง', 'Gold set'), t:L('ชุดทองวายรา + มงกุฎ · ◈ 30', 'Golden Vayra set · ◈ 30')};
  if (d % 7 === 0){ const c = d === 21 ? 20 : 15; return {k:'chest', ic:'🎁', s:`${L('หีบ', 'Chest')} +◈${c}`, t:L(`หีบอุปกรณ์หายาก · ◈ ${c}`, `Rare gear chest · ◈ ${c}`)}; }
  const z = lgnZ(), kz = n => (n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K' : fmtN(n));
  return [null, {k:'z', ic:'💰', s:kz(z), t:`${fmtN(z)} ${CUR()}`}, {k:'hp', ic:'❤', s:L('ยา HP ×10', 'HP ×10'), t:`${nm(ITEMS[lgnHp()])} ×10`}, {k:'coin', ic:'◈', s:'◈ 5', t:'◈ 5'},
    {k:'sp', ic:'💧', s:L('ยา SP ×10', 'SP ×10'), t:`${nm(ITEMS[lgnSp()])} ×10`}, {k:'z2', ic:'💰', s:kz(z * 2), t:`${fmtN(z * 2)} ${CUR()}`}, {k:'coin2', ic:'◈', s:'◈ 10', t:'◈ 10'}][d % 7];
}
function lgnState(){ const s = ACC.login || (ACC.login = {d:-1, n:0}); if (s.n >= 28 && s.d !== dayKey()) s.n = 0; return s; }
const lgnReady = () => !!(S && S.lvl && ACC && lgnState().d !== dayKey());
function lgnGear(){
  const Lv = S.lvl, pool = GEAR_LIST.filter(g => g[1] !== 'ammo' && g[4] <= Lv && g[4] >= Lv - 25 && lineOk(g[6]) && (g[1] !== 'weapon' || g[6].wtype === JOBS[S.job].weapon.type));
  if (!pool.length) return; const id = makeInst(pool[Math.floor(Math.random() * pool.length)][0], Math.max(1, rollRarity('boss'))); addItem(id, 1);
  log(L(`หีบรายวัน: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].th})`, `Login chest: ${nm(ITEMS[id])} (${RAR[ITEMS[id].rar].en})`), 'g');
}
function lgnClaim(){
  if (!lgnReady()) return; const s = lgnState(), d = s.n + 1, r = lgnDay(d);
  s.n = d; s.d = dayKey();
  if (r.k === 'z') S.bia += lgnZ(); else if (r.k === 'z2') S.bia += lgnZ() * 2;
  else if (r.k === 'hp') addItem(lgnHp(), 10); else if (r.k === 'sp') addItem(lgnSp(), 10);
  else if (r.k === 'coin') coinAdd(5, L('เข้าเกมรายวัน', 'daily login')); else if (r.k === 'coin2') coinAdd(10, L('เข้าเกมรายวัน', 'daily login'));
  else if (r.k === 'chest'){ lgnGear(); coinAdd(d === 21 ? 20 : 15, L('เข้าเกมรายวัน', 'daily login')); }
  else if (r.k === 'cos'){ const a = cosGrant('c_login_gold', true), b = cosGrant('hc_login_gold', true); coinAdd(a || b ? 30 : 60, L('เข้าเกมครบ 28 วัน', '28-day login'));
    banner(L('👑 เข้าเกมครบ 28 วัน! ได้ชุดทองวายรา', '👑 28 days! The Golden Vayra set is yours')); }
  if (r.k !== 'cos') banner(L(`🎁 รางวัลวันที่ ${d}: ${r.t}`, `🎁 Day ${d}: ${r.t}`));
  VFX.play('coins', {x:P.x, y:P.y - 30}); SFX.play('daily'); accSave(true); dirty = true; save(); reWin('login'); if (typeof renderGoal === 'function') renderGoal();
}
mkWin('login', 'รางวัลเข้าเกม', 'Login rewards', '', '<rect x="3" y="5" width="14" height="12" rx="2"/><path d="M3 9h14M7 3v4M13 3v4"/><path d="M8 13l1.5 1.5L12.5 11"/>');
WIN_RENDER.login = function(){
  const pane = el('pane-login'); if (!pane) return; const s = lgnState(), rdy = lgnReady();
  pane.innerHTML = `<div class="lgnhead"><b>${L(`เข้าเกมแล้ว ${s.n}/28 วัน`, `${s.n}/28 days`)}</b><small>${L('ขาดวันไหนไม่รีเซ็ต · ครบ 28 วันได้ชุดทองวายรา', 'Missed days never reset · day 28 brings the Golden Vayra set')}</small></div>
    <div class="lgngrid">${Array.from({length:28}, (_, i) => { const d = i + 1, r = lgnDay(d), got = d <= s.n, now = rdy && d === s.n + 1;
      return `<div title="${escH(r.t)}" class="lgnc${got ? ' got' : ''}${now ? ' now' : ''}${d % 7 === 0 ? ' big' : ''}"><small>${L('วัน', 'Day')} ${d}</small><i>${got ? '✓' : r.ic}</i><span>${r.s}</span></div>`; }).join('')}</div>
    <p class="lgnnext">${L('วันถัดไป', 'Next')}: <b>${escH(lgnDay(Math.min(28, s.n + (rdy ? 1 : s.n >= 28 ? -27 : 1))).t)}</b></p>
    <div class="lgnfoot">${rdy ? `<button class="btn gold" data-lgnclaim="1">${L(`รับรางวัลวันที่ ${s.n + 1}`, `Claim day ${s.n + 1}`)}</button>` : `<span class="lgndone">✓ ${L('รับของวันนี้แล้ว · พรุ่งนี้มาใหม่นะ', "Today's reward taken · see you tomorrow")}</span>`}</div>`;
};
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-lgnclaim]')) lgnClaim(); });
/* opens by itself once a day, a few seconds after you enter the world */
EV.on('tick', dt => { if (LGN.auto || (LGN.t += dt) < 3 || PAUSED || !S || !S.lvl || P.dead) return;
  if (S.lvl < 5 || (typeof TUT !== 'undefined' && TUT.on)) return;   // a brand-new hero sees the tutorial first; the quest card still points here
  LGN.auto = true; if (lgnReady()) openWin('login'); });
{ const _qt = questTracker; questTracker = function(){ let h = _qt(); try { if (lgnReady()) h += `${h ? '<br>' : ''}<span class="lgnq">📅 ${L('รับรางวัลเข้าเกมวันนี้ได้', "Today's login reward is waiting")}</span>`; } catch (e) {} return h; }; }
{ const st = document.createElement('style');
  st.textContent = `.lgnhead{display:flex;flex-direction:column;gap:2px;margin-bottom:8px;color:#1b1b1b}.lgnhead small{color:#444}
  #win-login{width:min(560px,94vw)}.lgnnext{margin:8px 0 0;color:#1b1b1b;text-align:center}
  .lgngrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}
  .lgnc{display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 3px;border-radius:9px;background:#fff;border:1.5px solid #d9cfb8;color:#1b1b1b;text-align:center;min-width:0}
  .lgnc small{font-size:10px;color:#555}.lgnc i{font-style:normal;font-size:18px;line-height:1.2}.lgnc span{font-size:11px;line-height:1.15;white-space:nowrap;font-weight:600}
  .lgnc.big{border-color:#d4a017;background:#fff8e1}.lgnc.got{background:#e8f5e9;border-color:#7cc58a}.lgnc.got i{color:#1f7a3a}
  .lgnc.now{border:2.5px solid #1f7a3a;box-shadow:0 0 0 2px rgba(31,122,58,.18)}
  .lgnfoot{display:flex;justify-content:center;margin-top:10px}.lgndone{color:#1f7a3a;font-weight:700}.lgnq{color:#1f7a3a;font-weight:600}`;
  document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'login', t:['รางวัลเข้าเกมรายวัน', 'Login rewards'], b:() => `<p>${L('เข้าเกมวันไหนรับของได้ 1 กล่อง (เวลาไทย) การ์ด 28 วัน ขาดวันไหนไม่รีเซ็ต · วันที่ 7/14/21 หีบอุปกรณ์หายาก + ◈ · วันที่ 28 ชุดทองวายรา (ชุด + มงกุฎ) ได้จากที่นี่ที่เดียว · ครบแล้วเริ่มการ์ดใหม่', 'One box for each day you play (Thailand time) on a 28-day card; a missed day never resets it · days 7/14/21: a Rare-or-better gear chest + ◈ · day 28: the Golden Vayra set (top + crown), only from here · then a new card starts')}</p>`});
