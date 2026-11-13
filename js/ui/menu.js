/* VAYRATHEN — js/ui/menu.js
   Title screen (continue / new game / settings), settings window, exit to title, and a confirm dialog.
   The world keeps rendering behind the title but nothing updates while it is open. */
'use strict';

const SETKEY = 'vayrathen-settings-v1';
const SETTINGS = {turn:false, lang:'th', gfx:'auto', showFps:false, control:'auto', dmgNumbers:true, shake:true, nightFx:true, nameTags:true, oName:true, oTitle:true, oGuild:true, oDmg:true, oPet:true, oSum:true, oFx:true, uiScale:1, botHp:45, autoSave:true, autoLoot:false, sfx:true, musicVol:35, sfxVol:60, kite:true, bgRun:true, keepAwake:true, restMin:5, sharp:2, classFx:true, heartbeat:true};
try { Object.assign(SETTINGS, JSON.parse(localStorage.getItem(SETKEY) || '{}')); } catch (e) {}
if (SETTINGS.rotV !== 2){ SETTINGS.rotV = 2; SETTINGS.turn = false; delete SETTINGS.autoRot; }   // start upright: no leftover turning from earlier versions
const saveSettings = () => { try { localStorage.setItem(SETKEY, JSON.stringify(SETTINGS)); } catch (e) {} };
let PAUSED = true;                      // the game starts on the title screen

function hasSave(){ try { for (let i = 0; i < SLOTS; i++) if (localStorage.getItem(slotKey(i))) return true; } catch (e) {} return false; }
function applySettings(){
  BOT_CFG.hpPot = SETTINGS.botHp / 100;
  el('ui').style.setProperty('--ui-scale', SETTINGS.uiScale);
  el('ui').classList.toggle('ui-small', false); if (typeof resize === 'function' && typeof SW !== 'undefined' && SW) resize();   // the size setting feeds the global UI scale
}

/* ---------- hero name (shown to other players online) ---------- */
function askName(then){
  const d = el('confirm');
  d.innerHTML = `<h3>${L('ตั้งชื่อตัวละคร', 'Name your hero')}</h3><p>${L('ชื่อนี้ผู้เล่นคนอื่นจะเห็นเมื่อเล่นออนไลน์', 'Other players see this name online')}</p>
    <input class="nmin" id="nameIn" maxlength="16" autocomplete="off" placeholder="${L('เช่น ขุนแผน', 'e.g. Khun Phaen')}"><div class="row"><button class="btn gold" data-cf="ok">${L('เริ่มเดินทาง', 'Begin')}</button></div>`;
  d.hidden = false; const inp = el('nameIn'); inp.value = (typeof NET !== 'undefined' && NET.me && NET.me.name || '').slice(0, 16); setTimeout(() => inp.focus(), 50);
  const done = () => { S.name = clean(inp.value, 16).trim() || L('นักผจญภัย', 'Adventurer'); d.hidden = true; save(); then && then(); };
  d.onclick = e => { if (e.target.closest('[data-cf]')) done(); };
  inp.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') done(); };
}
/* ---------- confirm ---------- */
function askConfirm(title, text, okLabel, onOk){
  const d = el('confirm');
  d.innerHTML = `<h3>${title}</h3><p>${text}</p><div class="row"><button class="btn" data-cf="no">${L('ยกเลิก', 'Cancel')}</button><button class="btn gold" data-cf="ok">${okLabel}</button></div>`;
  d.hidden = false; d.onclick = e => { const b = e.target.closest('[data-cf]'); if (!b) return; d.hidden = true; if (b.dataset.cf === 'ok') onOk(); };
  d.querySelector('[data-cf="no"]').focus();
}

/* ---------- title: choose one of 3 characters, or make a new one ---------- */
const TITLE = {mode:'slots', make:null, dir:0, raf:0};
const escH = t => String(t || '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const HAIR_NAMES = {m:[['ผมตั้งตามคลาส', 'Class spikes'], ['ผมสั้นนุ่ม', 'Short & soft'], ['ผมมัดหาง', 'Tied back'], ['ผมยาวแผงคอ', 'Long mane'], ['มวยจุก', 'Topknot'], ['ผมตั้งชี้', 'Wild spikes'], ['ผมปัดข้าง', 'Side-swept'], ['ผมสั้นเกรียน', 'Short crop'], ['ผมยาวปอยข้าง', 'Side locks']],
  f:[['ผมยาวสยาย', 'Long & loose'], ['ผมแกละสองข้าง', 'Twin tails'], ['หางม้าสูง', 'High ponytail'], ['ผมมวย', 'Bun'], ['ผมบ็อบสั้น', 'Short bob'], ['ผมยาวพิเศษ', 'Extra long'], ['ผมยาวปัดข้าง', 'Side-swept long'], ['หางม้าปอยยาว', 'Ponytail & locks'], ['แกละผมยาว', 'Long twin tails']]};
// (v194) fifteen more of each (gfx/sprites.js HAIR_M / HAIR_F 9–23)
HAIR_NAMES.m.push(['แอฟโฟร', 'Afro'], ['ม็อฮอว์ก', 'Mohawk'], ['ปอมปาดัวร์', 'Pompadour'], ['ปัดปิดตา', 'Swoop'], ['ลอนสั้น', 'Short curls'], ['หางต่ำ แสกกลาง', 'Low tail, curtain'],
  ['เปียยาว', 'Long braid'], ['พุ่งตั้ง', 'Tall spikes'], ['แสกกลาง', 'Curtain fringe'], ['หางข้าง', 'Side tail'], ['วูล์ฟคัต', 'Wolf cut'], ['เดรดล็อก', 'Dreadlocks'],
  ['ทรงกะลา', 'Bowl cut'], ['คลื่นประบ่า', 'Wavy, shoulder'], ['เปียคู่', 'Twin braids']);
HAIR_NAMES.f.push(['ฮิเมะคัต', 'Hime cut'], ['ซาลาเปาคู่', 'Double buns'], ['ลอนสว่าน', 'Drill curls'], ['หางม้าข้าง', 'Side ponytail'], ['เปียยาว', 'Long braid'], ['เปียคู่', 'Twin braids'],
  ['ลอนคลื่นยาว', 'Long waves'], ['บ๊อบลอน', 'Curly bob'], ['หางม้าต่ำ', 'Low ponytail'], ['ครึ่งหัว', 'Half-up'], ['แอฟโฟรพัฟ', 'Afro puff'], ['พิกซี่', 'Pixie cut'],
  ['แสกกลางยาว', 'Curtain, long'], ['ซาลาเปา+ทวินเทล', 'Buns + tails'], ['ร็อกกาบิลลี่', 'Rockabilly']);
const HAIR_COL_NAMES = {'':['ตามอาชีพ', 'By class'], hairBlack:['ดำ', 'Black'], hairBrown:['น้ำตาล', 'Brown'], hairBlonde:['บลอนด์', 'Blonde'], hairAuburn:['น้ำตาลแดง', 'Auburn'], hairSilver:['เงิน', 'Silver'], hairNavy:['น้ำเงิน', 'Navy'], maroon:['แดงเลือดหมู', 'Maroon'], hairPink:['ชมพู', 'Pink'], hairTeal:['เขียวน้ำทะเล', 'Teal'],
  hairWhite:['ขาว', 'White'], hairViolet:['ม่วง', 'Violet'], hairGreen:['เขียว', 'Green'], hairCrimson:['แดงสด', 'Crimson'], hairAsh:['เทาหม่น', 'Ash'], hairGold:['ทอง', 'Gold'], hairChestnut:['เกาลัด', 'Chestnut'], hairOrange:['ส้ม', 'Orange'], hairRose:['ชมพูกุหลาบ', 'Rose'], hairLilac:['ม่วงอ่อน', 'Lilac'], hairSky:['ฟ้า', 'Sky blue'], hairMint:['มิ้นต์', 'Mint']};
const EYE_NAMES = {'':['ตามอาชีพ', 'By class'], irisBr:['น้ำตาล', 'Brown'], irisBl:['ฟ้า', 'Blue'], irisGr:['เขียว', 'Green'], irisVi:['ม่วง', 'Violet'], irisRd:['แดง', 'Red'], irisGd:['ทอง', 'Gold'], irisPk:['ชมพู', 'Pink'], irisSv:['เงิน', 'Silver'], irisTl:['เขียวน้ำทะเล', 'Teal']};
function showTitle(){
  if (!PAUSED) save();
  PAUSED = true; BOT.on = false; renderBotChip(); if (typeof BOSSMEM !== 'undefined') for (const k in BOSSMEM) delete BOSSMEM[k];
  TITLE.mode = 'slots'; renderTitleBody(); if (typeof SFX !== 'undefined') SFX.music('title');
  const t = el('title'); t.hidden = false; t.classList.remove('out'); el('ui').classList.add('on-title');
}
function renderTitleBody(){
  const box = el('titleBody'); if (!box) return;
  cancelAnimationFrame(TITLE.raf);
  box.closest('.title-card').classList.toggle('making', TITLE.mode === 'make');
  if (TITLE.mode === 'make'){ renderMaker(); return; }
  const sl = allSlots(), n = sl.filter(Boolean).length;
  box.innerHTML = `<div class="t-slots-h"><b>${L('เลือกตัวละคร', 'Choose your character')}</b><small>${n}/${SLOTS} ${L('ตัว', 'used')}</small></div>
    <div class="slots">${sl.map((s, i) => s ? `<div class="slot${i === SLOT ? ' last' : ''}" data-play="${i}" role="button" tabindex="0">
        <canvas class="slotpic" width="64" height="76" data-slotpic="${i}"></canvas>
        <span class="slotinfo"><b>${escH(s.name || nm(JOBS[s.job]))}</b><small>${nm(JOBS[s.job])} · Base Lv ${s.lvl} · Job Lv ${s.jlvl}</small><small>${MAPS[s.map] ? nm(MAPS[s.map]) : ''} · ${s.look && s.look.sex === 'f' ? L('หญิง', 'Female') : L('ชาย', 'Male')}</small></span>
        <span class="slotbtns"><span class="tbtn gold sm">${L('เล่น', 'Play')}</span><button class="tbtn sm del" data-delslot="${i}" aria-label="${L('ลบตัวละคร', 'Delete character')}" title="${L('ลบตัวละคร', 'Delete character')}">✕</button></span></div>`
      : `<button class="slot empty" data-make="${i}"><span class="plus">+</span><span class="slotinfo"><b>${L('สร้างตัวละครใหม่', 'Create a character')}</b><small>${L(`ช่องที่ ${i + 1} ว่าง`, `Slot ${i + 1} is free`)}</small></span></button>`).join('')}</div>`;
  el('saveInfo').textContent = L('บัญชีละ 3 ตัวละคร · ช่วงทดสอบยังไม่ต้องสมัครไอดี เซฟอยู่ในเครื่องนี้และบัญชี claude.ai', '3 characters per account · no sign-up during the test; saves stay on this device and your claude.ai account');
  for (const cv of box.querySelectorAll('[data-slotpic]')){ const s = sl[+cv.dataset.slotpic]; if (s) drawHeroPic(cv, s.job, s.gear, s.look, 0, 0); }
}
/* a full-body picture of a hero (title slots, character maker) */
function drawHeroPic(cv, job, gear, look, dir, t){
  const sh = heroSheet(job, gear || {}, look); if (!sh) return;
  const K = sh.K, fs = sh.fs, c = SPR.ensure(sh, 'idle', dir), f = t ? SPR.frameAt(sh, 'idle', t) : 0, g = cv.getContext('2d');
  const w = 44 * K, h = 52 * K; g.clearRect(0, 0, cv.width, cv.height); g.imageSmoothingEnabled = false;
  g.drawImage(c, f * fs + fs / 2 - w / 2, sh.anchor[1] - 49 * K, w, h, 0, 0, cv.width, cv.width * h / w);
}
function renderMaker(){
  const m = TITLE.make, lk = m.look, box = el('titleBody');
  const sw = c => { const mt = c ? SPR.MATS[SPR.M[c]] : null; return mt ? mt.hex[1] : 'conic-gradient(#40271b 0 25%,#f2c879 0 50%,#4a5aa8 0 75%,#e6def5 0)'; };
  box.innerHTML = `<div class="t-slots-h"><b>${L(`สร้างตัวละคร · ช่องที่ ${m.slot + 1}`, `New character · slot ${m.slot + 1}`)}</b></div>
    <div class="maker">
      <div class="mk-prev"><canvas id="mkPrev" width="132" height="156"></canvas>
        <div class="mk-rot"><button class="ibtn" data-mkrot="1" aria-label="${L('หมุนซ้าย', 'Turn left')}">⟲</button><button class="ibtn" data-mkrot="-1" aria-label="${L('หมุนขวา', 'Turn right')}">⟳</button></div></div>
      <div class="mk-form">
        <label class="mk-row"><span>${L('ชื่อ', 'Name')}</span><input class="nmin" id="mkName" maxlength="16" autocomplete="off" value="${escH(m.name)}" placeholder="${L('เช่น ขุนแผน', 'e.g. Khun Phaen')}"></label>
        <div class="mk-row"><span>${L('เพศ', 'Sex')}</span><div class="seg">${[['m', 'ชาย', 'Male'], ['f', 'หญิง', 'Female']].map(([k, th, en]) => `<button class="${lk.sex === k ? 'on' : ''}" data-mksex="${k}">${L(th, en)}</button>`).join('')}</div></div>
        <div class="mk-row"><span>${L('ทรงผม', 'Hair')}</span><div class="seg" id="mkHair"></div></div>
        <div class="mk-row"><span>${L('สีผม', 'Colour')}</span><div class="swatches">${SPR.HAIR_COLORS.map(c => `<button class="sw${(lk.color || '') === c ? ' on' : ''}" data-mkcol="${c}" style="background:${sw(c)}" title="${L(...(HAIR_COL_NAMES[c] || [c, c]))}" aria-label="${L(...(HAIR_COL_NAMES[c] || [c, c]))}"></button>`).join('')}</div></div>
        <div class="mk-row"><span>${L('สีตา', 'Eyes')}</span><div class="swatches eyes">${SPR.IRIS_COLORS.map(c => `<button class="sw${(lk.eye || '') === c ? ' on' : ''}" data-mkeye="${c}" style="background:${sw(c)}" title="${L(...(EYE_NAMES[c] || [c, c]))}" aria-label="${L(...(EYE_NAMES[c] || [c, c]))}"></button>`).join('')}</div></div>
        <p class="mk-note">${L('เริ่มเป็นชาวบ้านอายุ 15 ปี แล้วเลือกอาชีพกับครูวายรา · เพศมีผลแค่รูปลักษณ์ ค่าสถานะเท่ากัน', 'You start as a 15-year-old villager and pick a class from Master Vayra · sex changes looks only, stats are the same')}</p>
        <div class="mk-btns"><button class="tbtn sm" data-mkback="1">${L('ย้อนกลับ', 'Back')}</button><button class="tbtn gold sm" data-mkgo="1">${L('สร้างและเริ่มเล่น', 'Create & play')}</button></div>
      </div></div>`;
  el('saveInfo').textContent = '';
  makerSync();
  const inp = el('mkName'); inp.addEventListener('input', () => { m.name = inp.value; }); inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') makerGo(); });
  cancelAnimationFrame(TITLE.raf);
  const t0 = performance.now(), loop = now => { const cv = el('mkPrev'); if (!cv || TITLE.mode !== 'make') return; drawHeroPic(cv, 'novice', {}, lk, TITLE.dir, (now - t0) / 1000); TITLE.raf = requestAnimationFrame(loop); };
  TITLE.raf = requestAnimationFrame(loop);
}
/* option clicks only restyle the buttons (the name box is never rebuilt, so typing is never lost) */
function makerSync(){
  const lk = TITLE.make.look, hb = el('mkHair'); if (!hb) return;
  hb.innerHTML = HAIR_NAMES[lk.sex].map((n, i) => `<button class="${lk.hair === i ? 'on' : ''}" data-mkhair="${i}">${L(...n)}</button>`).join('');
  document.querySelectorAll('[data-mksex]').forEach(b => b.classList.toggle('on', b.dataset.mksex === lk.sex));
  document.querySelectorAll('[data-mkcol]').forEach(b => b.classList.toggle('on', b.dataset.mkcol === (lk.color || '')));
  document.querySelectorAll('[data-mkeye]').forEach(b => b.classList.toggle('on', b.dataset.mkeye === (lk.eye || '')));
}
function makerGo(){
  const m = TITLE.make, name = clean(m.name, 16).trim();
  if (!name){ toast(L('ตั้งชื่อตัวละครก่อน', 'Give your hero a name first')); el('mkName') && el('mkName').focus(); return; }
  TITLE.mode = 'slots'; cancelAnimationFrame(TITLE.raf); newGame(m.slot, name, {...m.look});
}
function hideTitle(){
  const t = el('title'); t.classList.add('out'); el('ui').classList.remove('on-title'); cancelAnimationFrame(TITLE.raf);
  setTimeout(() => { t.hidden = true; }, 350);
  PAUSED = false; last = performance.now();
}
function continueGame(slot = SLOT){
  setSlot(slot); const s = load(slot);
  if (s){ S = s; } else return;
  LOG.length = 0; resetRuntime(); loadMap(S.map || 0); P.x = S.x || VSPAWN.x; P.y = S.y || VSPAWN.y; villageFix(); derive(); dirty = true; renderHotbar(); if (typeof renderMoba === 'function') renderMoba();
  hideTitle(); banner(L(`ยินดีต้อนรับกลับ ${S.name || nm(JOBS[S.job])} Lv.${S.lvl}`, `Welcome back, ${S.name || nm(JOBS[S.job])} Lv.${S.lvl}`));
  if (typeof NET !== 'undefined' && NET.cloudNote){ toast(NET.cloudNote); NET.cloudNote = null; }
  if (typeof NET !== 'undefined' && NET.lobbyT != null){ NET.lobbyT = 0; NET.presT = 0; }
  if (!S.name) setTimeout(() => askName(), 600);
}
function newGame(slot = SLOT, name = '', look = null){
  setSlot(slot); S = newS(); if (look) S.look = look; P.x = VSPAWN.x; P.y = VSPAWN.y; S.vxv = 1; LOG.length = 0;
  resetRuntime(); loadMap(0); derive(); S.hp = DER.maxhp; S.sp = DER.maxsp;
  log(L('เริ่มการเดินทางใหม่ในฐานะชาวบ้านแห่งอาเรน', 'A new journey begins as a villager of Aren'), 'g'); dirty = true; renderHotbar(); if (typeof renderMoba === 'function') renderMoba();
  hideTitle();
  if (name){ S.name = name; save(); banner(L(`ยินดีต้อนรับ ${S.name} สู่ทุ่งสุวรรณิน`, `Welcome to the Suwannin Fields, ${S.name}`)); }
  else { save(); askName(() => banner(L(`ยินดีต้อนรับ ${S.name} สู่ทุ่งสุวรรณิน`, `Welcome to the Suwannin Fields, ${S.name}`))); }
}
function resetRuntime(){
  LOOT.length = 0;
  Object.assign(P, {tx:null, ty:null, loot:null, target:null, npc:null, cast:null, pending:null, dead:false, roll:null, ride:false, sit:false, capT:0, cds:{}, act:null, animT:0});
  BOT.on = false; P.sit = false;
  if (boss){ boss.dead = true; boss = null; } bossTimer = bossFirst();
  for (const m of mobs) m.aggro = false;
  closeDialog(); renderHotbar();
}
function exitToTitle(){ askConfirm(L('ออกจากเกม', 'Exit game'), L('บันทึกความคืบหน้าแล้วกลับไปหน้าเริ่มเกม', 'Save your progress and return to the title screen'), L('บันทึกและออก', 'Save & exit'), () => { save(); for (const id of WIN_IDS) closeWin(id); showTitle(); }); }

/* ---------- settings window ---------- */
function gfxNote(){
  const d = {low:L('ลื่นสุด ภาพหยาบลง เหมาะเครื่องเก่า', 'Smoothest, rougher image, for older devices'), medium:L('สมดุลความลื่นกับความคม', 'Balanced smoothness and sharpness'),
    high:L('คมตามความละเอียดจอ', 'Sharp at your screen resolution'), ultra:L('คมสุด พื้นและฉากละเอียดสุด ใช้เครื่องแรง', 'Sharpest ground and scenery, for strong devices')};
  return GFX.mode === 'auto' ? L(`เลือกให้ตามเครื่อง ตอนนี้ใช้ "${GFX_TH[GFX.preset]}" · ลดเองถ้ากระตุก`, `Picked for this device, now "${GFX_TH[GFX.preset]}" · steps down if it stutters`) : d[GFX.mode];
}
function renderSettings(){
  const tg = (k, label, sub) => `<label class="set"><span><b>${label}</b><small>${sub}</small></span><input type="checkbox" id="set-${k}" data-set="${k}" ${SETTINGS[k] ? 'checked' : ''}><i class="sw"></i></label>`;
  const opt = (k, v, label) => `<option value="${v}" ${String(SETTINGS[k]) === String(v) ? 'selected' : ''}>${label}</option>`;
  el('pane-settings').innerHTML = `
    <div class="sec">${L('ภาษา', 'Language')}</div>
    <label class="set"><span><b>${L('ภาษา', 'Language')}</b><small>${L('ศัพท์เกมเป็นภาษาอังกฤษในโหมดไทย', 'Game terms stay in English in Thai mode')}</small></span>
      <select id="set-lang" data-set="lang">${opt('lang', 'th', 'ไทย')}${opt('lang', 'en', 'English')}</select></label>
    <div class="sec">${L('การควบคุม', 'Controls')}</div>
    <label class="set"><span><b>${L('รูปแบบการควบคุม', 'Control style')}</b><small>${L('จอยแบบ MOBA หรือคลิกเมาส์', 'MOBA joystick or mouse clicks')}</small></span>
      <select id="set-control" data-set="control">${opt('control', 'auto', L('อัตโนมัติ', 'Auto'))}${opt('control', 'joy', L('จอย (MOBA)', 'Joystick (MOBA)'))}${opt('control', 'mouse', L('เมาส์', 'Mouse'))}</select></label>
    ${tg('joyFloat', L('จอยลอยตามนิ้ว', 'Floating joystick'), L('ปิด (ค่าเริ่มต้น): จอยล็อกอยู่กับที่ แตะที่วงจอยแล้วดัน · เปิด: วงจอยย้ายไปตรงที่นิ้วแตะ', 'Off (default): the stick stays put, touch its ring and push · On: the ring jumps to where your thumb lands'))}
    <div class="sec">${L('การแสดงผล', 'Display')}</div>
    <label class="set"><span><b>${L('คุณภาพกราฟิก', 'Graphics quality')}</b><small id="gfxNote">${gfxNote()}</small></span>
      <select id="set-gfx" data-set="gfx">${['auto', ...GFX.ORDER].map(m => `<option value="${m}" ${GFX.mode === m ? 'selected' : ''}>${m === 'auto' ? `${GFX_TH.auto} (${GFX_TH[GFX.guess]})` : GFX_TH[m]}</option>`).join('')}</select></label>
    <label class="set"><span><b>${L('ความคมชัดตัวละครและมอน', 'Character sharpness')}</b><small>${L('สูงสุด: วาดตัวละคร มอน และ NPC ละเอียดเท่าจอและระยะซูม (กินเครื่องมากขึ้น) · ลดลงถ้าเครื่องกระตุก', 'Highest: heroes, monsters and NPCs drawn as finely as the screen and zoom allow (heavier) · lower it if the game stutters')}</small></span>
      <select id="set-sharp" data-set="sharp">${opt('sharp', 0, L('ปกติ', 'Normal'))}${opt('sharp', 1, L('สูง', 'High'))}${opt('sharp', 2, L('สูงสุด (แนะนำ)', 'Highest (recommended)'))}</select></label>
    ${tg('kite', L('รักษาระยะ (สายเวท/ธนู)', 'Keep distance (casters & archers)'), L('ถอยออกเมื่อมอนเข้าประชิด แล้วโจมตีต่อจากระยะไกล', 'Step back when a monster closes in, then keep attacking from range'))}
    ${tg('showFps', L('แสดง FPS', 'Show FPS'), L('ดูความลื่นของเกมที่มุมจอ', 'See how smooth the game runs'))}
    ${tg('dmgNumbers', L('ตัวเลขดาเมจ', 'Damage numbers'), L('แสดงดาเมจ หลบ และ EXP ลอยบนหัว', 'Floating damage, misses and EXP'))}
    ${tg('shake', L('จอสั่น', 'Screen shake'), L('สั่นจอตอนคริติคอล ระเบิด และบอสคำราม · ปิดถ้าเวียนหัว', 'Shakes on crits, blasts and boss roars · turn off if it makes you dizzy'))}
    ${tg('classFx', L('เอฟเฟกต์ประจำอาชีพ', 'Class skill effects'), L('ตราวงเวท สัญลักษณ์ประจำสาย และรอยโจมตีบนสกิล · ปิดถ้าอยากให้จอโล่งหรือเครื่องช้า', 'Class seals, tokens and hit marks on skills · turn off for a cleaner screen or a slow device'))}
    ${tg('heartbeat', L('เสียงหัวใจตอน HP ต่ำ', 'Heartbeat at low HP'), L('เสียงหัวใจเต้นเตือนเมื่อ HP ต่ำกว่า 25%', 'A heartbeat warns you when HP is under 25%'))}
    ${tg('nameTags', L('ป้ายชื่อ', 'Name tags'), L('ชื่อตัวละคร NPC และมอนสเตอร์', 'Character, NPC and monster names'))}
    <div class="sec">${L('ผู้เล่นคนอื่น', 'Other players')}</div>
    ${tg('oName', L('ชื่อตัวละคร', 'Character names'), L('ชื่อและหลอดเลือดของผู้เล่นคนอื่น', "Other players' names and bars"))}
    ${tg('oTitle', L('ฉายา', 'Titles'), L('ฉายาใต้ชื่อผู้เล่นคนอื่น', "Titles under other players' names"))}
    ${tg('oGuild', L('กิลด์', 'Guilds'), L('ชื่อกิลด์ของผู้เล่นคนอื่น', "Other players' guild names"))}
    ${tg('oDmg', L('ดาเมจของผู้เล่นคนอื่น', "Other players' damage"), L('ตัวเลขดาเมจที่คนอื่นตีมอน', 'Numbers from hits by other players'))}
    ${tg('oPet', L('สัตว์เลี้ยงของผู้เล่นคนอื่น', "Other players' pets"), L('ซ่อนสัตว์เลี้ยงที่เดินตามคนอื่น', 'Hide pets following other players'))}
    ${tg('oSum', L('ซัมม่อนของผู้เล่นคนอื่น', "Other players' summons"), L('ซ่อนสัตว์อัญเชิญของคนอื่น', 'Hide beasts other players summon'))}
    ${tg('oFx', L('เอฟเฟกต์ของผู้เล่นคนอื่น', "Other players' effects"), L('ปิดเอฟเฟกต์สกิล ออร่า และแสงอาวุธของคนอื่น · ช่วยให้เครื่องลื่นขึ้น', 'Hide skill effects, auras and weapon glows of others · runs smoother'))}
    <label class="set"><span><b>${L('เพลงประกอบ', 'Music')}</b><small id="musV">${SETTINGS.musicVol}%</small></span><input type="range" id="set-musicVol" data-set="musicVol" min="0" max="100" step="5" value="${SETTINGS.musicVol}"></label>
    <label class="set"><span><b>${L('เสียงเอฟเฟกต์', 'Sound effects')}</b><small id="sfxV">${SETTINGS.sfxVol}%</small></span><input type="range" id="set-sfxVol" data-set="sfxVol" min="0" max="100" step="5" value="${SETTINGS.sfxVol}"></label>
    ${tg('turn', L('หมุนภาพเป็นแนวนอน', 'Turn picture to landscape'), L('ใช้เฉพาะเมื่อแอปไม่ยอมหมุนจอ · ปกติเกมจัดหน้าจอตามแนวที่ถืออยู่เอง', 'Only for apps that never rotate · normally the game fits whichever way you hold it'))}
    ${tg('nightFx', L('ความมืดตอนกลางคืน', 'Night darkness'), L('ปิดถ้าเครื่องช้าหรือมองไม่ชัด', 'Turn off if slow or hard to see'))}
    <label class="set"><span><b>${L('ขนาด UI', 'UI size')}</b><small>${L('ปรับขนาดการ์ดและแถบลัด', 'Size of cards and the hotbar')}</small></span>
      <select id="set-uiScale" data-set="uiScale">${opt('uiScale', 0.7, L('เล็กมาก', 'Very small'))}${opt('uiScale', 0.85, L('เล็ก', 'Small'))}${opt('uiScale', 1, L('อัตโนมัติ (แนะนำ)', 'Auto (recommended)'))}${opt('uiScale', 1.15, L('ใหญ่', 'Large'))}${opt('uiScale', 1.3, L('ใหญ่มาก', 'Very large'))}</select></label>
    <label class="set"><span><b>${L('ซูมกล้อง', 'Camera zoom')}</b><small>${L('ขยายตัวละครและมอนบนจอ · หมุนล้อเมาส์ / ถ่างนิ้ว / ปุ่ม + − ก็ได้', 'How big heroes and monsters look · also mouse wheel / pinch / + − keys')}</small></span>
      <select id="set-zoom">${ZSTEPS.map(z => `<option value="${z}" ${Math.abs(ZOOM.target - z) < .01 ? 'selected' : ''}>${Math.round(z * 100)}%${z === 1 ? L(' (ค่าเริ่มต้น)', ' (default)') : ''}</option>`).join('')}</select></label>
    <div class="sec">${L('ข้อมูลเกม', 'Save data')}</div>
    ${tg('autoSave', L('บันทึกอัตโนมัติ', 'Auto save'), L('ทุก 10 วินาที และตอนปิดหน้าเว็บ', 'Every 10 seconds and when the page closes'))}
    <div class="row"><button class="btn" id="setExport">${L('ส่งออกเซฟเป็นไฟล์', 'Export save file')}</button><button class="btn" id="setImport">${L('นำเข้าเซฟจากไฟล์', 'Import save file')}</button></div>
    <p class="empty">${typeof NET !== 'undefined' && NET.db && NET.uid ? L('เซฟสำรองบนคลาวด์ของบัญชี claude.ai ทุก 30 วินาที', 'Backed up to your claude.ai account every 30 seconds') : L('เปิดผ่านลิงก์ claude.ai เพื่อสำรองเซฟบนคลาวด์', 'Open from the claude.ai link for cloud backup')}</p>
    <div class="row"><button class="btn" id="setSave">${L('บันทึกตอนนี้', 'Save now')}</button><button class="btn" id="setResetUi">${L('จัด UI กลับค่าเริ่มต้น', 'Reset UI layout')}</button></div>
    <div class="row"><button class="btn" id="setTitle">${L('กลับหน้าเริ่มเกม', 'Back to title')}</button><button class="btn danger" id="setDelete">${L('ลบตัวละครและเริ่มใหม่', 'Delete character & restart')}</button></div>
    `;
}
document.addEventListener('change', e => {
  const lc = e.target.dataset && e.target.dataset.lootcat; if (lc){ SETTINGS.lootCats = SETTINGS.lootCats || {}; SETTINGS.lootCats[lc] = e.target.checked; saveSettings(); return; }
  const k = e.target.dataset && e.target.dataset.set; if (!k) return;
  SETTINGS[k] = e.target.type === 'checkbox' ? e.target.checked : (k === 'control' || k === 'gfx' || k === 'lang') ? e.target.value : Number(e.target.value);
  if (k === 'gfx'){ setGfxMode(SETTINGS.gfx); el('gfxNote').textContent = gfxNote(); toast(L(`กราฟิก: ${GFX_TH[GFX.preset]}`, `Graphics: ${GFX_TH[GFX.preset]}`)); }
  if (k === 'lang'){ saveSettings(); setLang(SETTINGS.lang); renderHotbar(); renderBotChip(); if (!el('title').hidden) renderTitleBody(); return; }
  saveSettings(); applySettings(); SFX.setVolume(); if (k === 'control') applyControlMode(); if (k === 'turn') rotApply();

});
document.addEventListener('input', e => { if (e.target.id === 'set-botHp') el('botHpV').textContent = e.target.value + '%';
  if (e.target.id === 'set-musicVol' || e.target.id === 'set-sfxVol'){ SETTINGS[e.target.dataset.set] = +e.target.value; el(e.target.id === 'set-musicVol' ? 'musV' : 'sfxV').textContent = e.target.value + '%'; SFX.setVolume(); } });
/* title: slot cards and the character maker */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-play],[data-delslot],[data-make],[data-mksex],[data-mkhair],[data-mkcol],[data-mkeye],[data-mkrot],[data-mkback],[data-mkgo]'); if (!b || el('title').hidden) return;
  const d = b.dataset;
  if (d.delslot != null){ e.stopPropagation(); const i = +d.delslot, s = load(i); if (!s) return;
    askConfirm(L('ลบตัวละคร', 'Delete character'), L(`ลบ ${escH(s.name || nm(JOBS[s.job]))} (${nm(JOBS[s.job])} Lv ${s.lvl}) ลบแล้วกู้คืนไม่ได้`, `Delete ${escH(s.name || nm(JOBS[s.job]))} (${nm(JOBS[s.job])} Lv ${s.lvl})? This cannot be undone.`), L('ลบ', 'Delete'), () => { deleteSlot(i); renderTitleBody(); }); return; }
  if (d.play != null){ tryLandscape(); continueGame(+d.play); return; }
  if (d.make != null){ TITLE.mode = 'make'; TITLE.dir = 0; TITLE.make = {slot:+d.make, name:(typeof NET !== 'undefined' && NET.me && NET.me.name || '').slice(0, 16), look:{sex:'m', hair:0, color:'', eye:''}}; renderTitleBody(); return; }
  const m = TITLE.make; if (!m) return;
  if (d.mksex){ if (m.look.sex !== d.mksex){ m.look.sex = d.mksex; m.look.hair = 0; } makerSync(); }
  else if (d.mkhair != null){ m.look.hair = +d.mkhair; makerSync(); }
  else if (d.mkcol != null){ m.look.color = d.mkcol; makerSync(); }
  else if (d.mkeye != null){ m.look.eye = d.mkeye; makerSync(); }
  else if (d.mkrot){ TITLE.dir = (TITLE.dir + (+d.mkrot) + 8) % 8; }
  else if (d.mkback){ TITLE.mode = 'slots'; renderTitleBody(); }
  else if (d.mkgo){ tryLandscape(); makerGo(); }
});
document.addEventListener('keydown', e => { const s = e.target.closest && e.target.closest('.slot[data-play]'); if (s && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); s.click(); } });
document.addEventListener('click', e => {
  const id = e.target.closest('button')?.id; if (!id) return;
  else if (id === 'btnTitleSettings'){ hideTitle(); openWin('settings'); }
  else if (id === 'setSave'){ save(); toast(L('บันทึกแล้ว', 'Saved')); }
  else if (id === 'setResetUi'){ $('#resetUi').click(); toast(L('จัด UI กลับค่าเริ่มต้นแล้ว', 'UI layout reset')); }
  else if (id === 'setTitle' || id === 'btnExit') exitToTitle();
  else if (id === 'setDelete') askConfirm(L('ลบตัวละคร', 'Delete character'), L(`ลบ ${escH(S.name || nm(JOBS[S.job]))} (${nm(JOBS[S.job])} Lv ${S.lvl}) ลบแล้วกู้คืนไม่ได้`, `Delete ${escH(S.name || nm(JOBS[S.job]))} (${nm(JOBS[S.job])} Lv ${S.lvl})? This cannot be undone.`), L('ลบตัวละคร', 'Delete'), () => { for (const w of WIN_IDS) closeWin(w); deleteSlot(SLOT); PAUSED = true; showTitle(); });
});
