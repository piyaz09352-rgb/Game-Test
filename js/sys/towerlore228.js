/* VAYRATHEN — js/sys/towerlore228.js — (v228) the tower's story: «ตำนานแห่งเทพผู้ถูกผนึก»
   The title screen calls the game the Legend of the Sealed God; the tower now tells it. Chandra, the spirit who keeps
   the tower, speaks once every 10 floors (the first time you clear floor 10, 20 … 100): who built the tower and why,
   the war on its stairs, and at last who the sealed god is. Floor 100 has its own guardian, the Shadow of Vaira,
   climbing to reach the god's heart; beating it the first time tells the last chapter and pays 30 tower tokens.
   Every chapter you have heard can be read again in the tower window («ตำนานหอคอย»).
   Saved per character: S.tower.lore = {1:1, 2:1, …}. */
'use strict';
const TL_LORE = [
  ['หอที่สร้างจากศิลาผนึก', 'A Tower of Seal Stone',
    'ข้าคือจันทรา ผู้เฝ้าหอแห่งนี้ — หอคอยวายราไม่ได้สร้างด้วยมือมนุษย์ — เมื่อราชาอสูรไวราลุกขึ้นจากใต้เขาพระสุเมรุ พระวายราเทพแห่งแสงอรุณทรงยกศิลาจากรากเขาขึ้นมาวางทีละขั้น — เป็นบันไดที่ทอดขึ้นสู่สวรรค์ เพื่อให้ทัพเทวดาลงมาช่วยโลกมนุษย์ได้ทัน',
    "I am Chandra, keeper of this tower. — The Vayra Tower was not built by human hands. — When Vaira the Asura King rose from beneath Mount Meru, Vayra, god of the dawn, lifted stone from the roots of the mountain and laid it step by step — a stair up to heaven, so the hosts of the devas could come down in time to save the human world."],
  ['หยกแห่งน้ำตาเทพ', 'Jade of the Gods’ Tears',
    'ห้องโถงสีหยกนี้ปูด้วยน้ำตาของเทวดาที่ล้มลงในสงครามครั้งแรก — น้ำตาที่ตกถึงบันไดแข็งเป็นหยก จึงเย็นเสมอแม้ไฟจะลุกอยู่รอบด้าน — ถ้าเจ้าเงียบพอ จะยังได้ยินเสียงร้องไห้ของพวกเขาอยู่ในหิน',
    'These jade halls are paved with the tears of the devas who fell in the first war. — Where their tears struck the stair they hardened into jade, which is why the stone stays cool with fire all around. — Be quiet enough and you can still hear them weeping in the stone.'],
  ['คืนที่ดาวดับ', 'The Night the Stars Went Out',
    'มีคืนหนึ่งไวรากลืนดวงจันทร์ ดาวทั้งฟ้าดับลง — มนุษย์มองไม่เห็นทางกลับบ้าน — พระวายราจึงจุดกระถางไฟทุกชั้นของหอ ไฟที่เจ้าเห็นรอบลานนี้ไม่เคยดับมาตั้งแต่คืนนั้น',
    'One night Vaira swallowed the moon and every star went dark. — People could not see their way home. — So Vayra lit a brazier on every floor of the tower. The fires you see round this hall have not gone out since that night.'],
  ['หิมะและคำสัญญา', 'Snow and a Promise',
    'ในห้องโถงหิมะนี้ พระวายราตรัสสัญญากับโลกมนุษย์ — «ถ้าผนึกไวราด้วยหินไม่ได้ ข้าจะผนึกมันด้วยตัวข้าเอง» — เหล่าเทวดาร่ำไห้ห้าม แต่พระองค์ไม่เคยกลับคำ',
    'In these halls of snow Vayra made a promise to the human world: — «If stone cannot bind Vaira, I will bind him with myself.» — The devas wept and begged him not to, but he never took back his word.'],
  ['เพลิงนิลเจ็ดวัน', 'Seven Days of Obsidian Fire',
    'พื้นนิลดำนี้ไหม้เกรียมจากการต่อสู้เจ็ดวันเจ็ดคืนระหว่างพระวายรากับไวรา — ทุกครั้งที่ไวราจะหลุดลงไปข้างล่าง พระวายราจะดึงมันกลับขึ้นมาอีกหนึ่งชั้น — หอนี้จึงสูงไม่มีที่สิ้นสุด เพราะการต่อสู้ยังไม่จบ',
    'This black obsidian was scorched by the seven-day battle between Vayra and Vaira. — Every time Vaira tried to break loose downward, Vayra dragged him back up another floor. — That is why the tower has no top: the fight never ended.'],
  ['บัลลังก์ทองที่ว่างเปล่า', 'The Empty Golden Throne',
    'ห้องโถงสวรรค์ทองมีบัลลังก์ของพระวายราตั้งอยู่ — มันว่างมานับพันปี — เทวดาที่เฝ้าบัลลังก์บอกว่าพระองค์จะกลับมาเมื่อมีมนุษย์ปีนขึ้นมาถึงด้วยตัวเอง',
    'In the golden halls stands the throne of Vayra. — It has been empty for a thousand years. — The devas who guard it say he will return when a human climbs up to it on their own feet.'],
  ['ผนึกที่มีชีวิต', 'A Living Seal',
    'เจ้าเคยเก็บศิลาผนึกจากแคว้นต่าง ๆ ใช่ไหม — มันไม่ใช่หินธรรมดา มันคือเกราะของพระวายราที่แตกกระจายไปทั่วโลกตอนผนึกไวรา — ทุกชิ้นที่เจ้านำกลับมา คือการต่อลมหายใจให้พระองค์',
    'You have gathered the seal shards from the regions, have you not? — They are no ordinary stones: they are pieces of Vayra’s armour, scattered across the world when he sealed Vaira. — Every shard you bring home gives him another breath.'],
  ['เสียงกระซิบบนบันได', 'Whispers on the Stair',
    'ระวังตัวให้ดี — เสียงกระซิบของไวราไม่ได้อยู่แค่ใต้เขาพระสุเมรุ มันไต่บันไดขึ้นมาด้วย — มีเงาหนึ่งปีนนำหน้าเจ้าอยู่หลายชั้น และมันไม่เคยหยุดพัก',
    'Be careful. — Vaira’s whisper is not only beneath Mount Meru; it climbs the stair too. — A shadow is climbing floors ahead of you, and it never rests.'],
  ['หัวใจที่หลับใหล', 'The Sleeping Heart',
    'เหนือขึ้นไปอีกสิบชั้น หัวใจของพระวายรากำลังหลับอยู่ — มันคือสิ่งที่ยึดผนึกไว้ทั้งหมด — ถ้าเงานั้นไปถึงก่อนเจ้า… ผนึกวายราจะแตก ขอร้องล่ะ ปีนให้ทัน',
    'Ten floors above, the heart of Vayra lies sleeping. — It is what holds the whole seal together. — If that shadow reaches it before you do… the Seal of Vayra will break. Please, climb faster.'],
  ['เทพผู้ถูกผนึก', 'The Sealed God',
    'เจ้าชนะเงาของไวราแล้ว — ตอนนี้เจ้ารู้แล้วใช่ไหม เทพผู้ถูกผนึกในตำนานไม่ใช่ไวรา — คือพระวายราเอง ผู้ยอมผนึกตัวเองไว้กับอสูรเพื่อให้โลกนี้อยู่ได้ — หอคอยไม่มีชั้นบนสุด เพราะทุกก้าวที่มนุษย์ปีนขึ้นมา คือแรงที่ต่อผนึกให้แน่นขึ้น — ปีนต่อไปเถิด ผู้ผนึกแห่งวายรา พระองค์ได้ยินเสียงฝีเท้าของเจ้า',
    'You have beaten the Shadow of Vaira. — Now you know, do you not? The sealed god of the legend is not Vaira. — It is Vayra himself, who sealed himself together with the Asura so that this world could live. — The tower has no top because every step a human climbs is strength that binds the seal tighter. — Keep climbing, Sealbearer of Vayra. He hears your footsteps.']
];
const TL_CHANDRA = {id:'tl_chandra', name:'จันทรา ผู้เฝ้าหอ', en:'Chandra, Keeper of the Tower', role:'วิญญาณผู้เฝ้าหอคอยวายรา', roleEn:'Spirit keeper of the Vayra Tower',
  tw:{job:'ms_npc', look:{sex:'f', hair:22, color:'hairSilver'}, gear:{armor:'s_aurora', head:'h_halo'}}};
const tlLore = () => { const s = twSt(); s.lore = s.lore && typeof s.lore === 'object' ? s.lore : {}; return s.lore; };
const TLR = {pending:0, showing:0};
function tlrShow(n){
  const C = TL_LORE[n - 1]; if (!C) return;
  const html = `<p class="say"><span class="sayt"></span></p><div class="tlrbody">${L(C[2], C[3]).split(/\s*—\s*/).map(p => `<p>${p}</p>`).join('')}</div><p class="hint">${L(`ตำนานหอคอย บทที่ ${n}/10 · อ่านซ้ำได้ในหน้าต่างหอคอย`, `Tower legend, chapter ${n}/10 · read it again in the tower window`)}</p>`;
  npcFrame(TL_CHANDRA, L(`«${C[0]}»`, `«${C[1]}»`), html.replace('<p class="say"><span class="sayt"></span></p>', ''));
  if (typeof twPortrait === 'function') twPortrait(TL_CHANDRA); SFX.play('quest'); TLR.showing = n;
}
// a chapter unlocks when floor 10·n is cleared for the first time (chapter 10: when the Shadow of Vaira falls)
{ const _tc = twClear; twClear = function(){ const f = TW.f; const r = _tc.apply(this, arguments);
    if (TW.f === f + 1 && f % 10 === 0 && f <= 100){ const n = f / 10, lore = tlLore(); if (!lore[n]){ lore[n] = 1; TLR.pending = n; dirty = true;
      log(L(`ตำนานหอคอยบทที่ ${n} «${TL_LORE[n - 1][0]}» · อ่านซ้ำได้ในหน้าต่างหอคอย`, `Tower legend chapter ${n} «${TL_LORE[n - 1][1]}» · read it again in the tower window`), 'g');
      if (n === 10 && typeof twsGive === 'function') twsGive(30, L('เงาไวราพ่ายแพ้', 'the Shadow falls')); } }
    return r; }; }
// shown during the rest after the floor (the stairs wait while you read)
EV.on('tick', () => {
  if (typeof TW === 'undefined' || !TW.active) { TLR.pending = 0; return; }
  if (TLR.pending && TW.phase === 'rest' && !(typeof DG3 !== 'undefined' && DG3.boonOpen)){ const n = TLR.pending; TLR.pending = 0; tlrShow(n); }
  if (TLR.showing){ const d = el('dialog'); if (d && !d.hidden && d.dataset.npc === 'tl_chandra' && TW.phase === 'rest') TW.restT = Math.max(TW.restT, 3); else TLR.showing = 0; }
});
// the Shadow of Vaira: floor 100's own guardian
{ const _sp = twSpawn; twSpawn = function(){ const r = _sp.apply(this, arguments);
    if (TW.f === 100 && MOB.asuraking){ const g = mobs.find(m => m.tw === 100 && !m.dead && m.def.boss); const x = g ? g.x : P.x, y = g ? g.y - 40 : P.y - 200; if (g){ g.dead = true; g.vanish = true; }
      const s = twMob('asuraking', x, y, 100); s.def = {...s.def, hp:Math.round(s.def.hp * 1.6), name:'เงาแห่งไวรา', en:'Shadow of Vaira'}; s.maxhp = s.hp = s.def.hp; s.twShadow = true; s.bcd = 3; s.roamT = 99;
      banner(L('ชั้น 100 · ♛ เงาแห่งไวรา ไต่ขึ้นมาถึงหัวใจของพระวายราแล้ว!', 'Floor 100 · ♛ The Shadow of Vaira has climbed to the heart of Vayra!')); if (VFX.shake) VFX.shake(8); }
    return r; }; }
// the legend in the tower window
{ const _r = WIN_RENDER.tower; WIN_RENDER.tower = function(){ const r = _r.apply(this, arguments); const pane = el('pane-tower'); if (!pane || pane.querySelector('.tlrlist')) return r;
    const lore = tlLore(), got = TL_LORE.map((C, i) => lore[i + 1] ? `<button class="btn sm" data-tlr="${i + 1}">${i + 1}. ${L(C[0], C[1])}</button>` : `<button class="btn sm" disabled>${i + 1}. ${L(`ชั้น ${(i + 1) * 10}`, `Floor ${(i + 1) * 10}`)} 🔒</button>`).join('');
    const box = document.createElement('details'); box.className = 'twrules tlrlist'; box.innerHTML = `<summary>📜 ${L('ตำนานหอคอย', 'Tower legend')} (${Object.keys(lore).length}/10)</summary><div class="tlrgrid">${got}</div>`;
    const det = pane.querySelector('.twrules'); if (det) det.before(box); else pane.appendChild(box); return r; }; }
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-tlr]'); if (!b) return; if (typeof closeWin === 'function') closeWin('tower'); tlrShow(+b.dataset.tlr); });
{ const st = document.createElement('style'); st.textContent = `.tlrgrid{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:6px}.tlrgrid .btn{justify-content:flex-start;text-align:left;white-space:normal;line-height:1.25}
  #dialog .tlrbody p{margin:0 0 7px;line-height:1.55;font-size:14px;color:#3a2a4a}#dialog .tlrbody{max-height:46vh;overflow-y:auto;padding:2px 2px 4px}`; document.head.appendChild(st); }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'towerlore', t:['ตำนานหอคอย', 'Tower legend'], b:() => `<p>${L('จันทรา ผู้เฝ้าหอ เล่าตำนานแห่งเทพผู้ถูกผนึกทีละบท ทุกครั้งที่ผ่านชั้น 10, 20 … 100 เป็นครั้งแรก ชั้น 100 มีผู้พิทักษ์พิเศษ «เงาแห่งไวรา» ชนะครั้งแรกได้บทสุดท้ายและเหรียญหอคอย 30 อ่านบทที่ได้แล้วซ้ำได้ในหน้าต่างหอคอย', 'Chandra, keeper of the tower, tells the Legend of the Sealed God a chapter at a time, each the first time you clear floor 10, 20 … 100. Floor 100 has its own guardian, the Shadow of Vaira: beat it for the last chapter and 30 tower tokens. Read the chapters again in the tower window.')}</p>`});
