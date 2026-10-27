/* VAYRATHEN — js/sys/dungeon2.js — mid-level party dungeons (Lv 60–120)
   Three new doors at Gatekeeper Saeng, made for parties of 3–5 (solo still works, just harder):
     สุสานผีปอบ (Old Cemetery, Lv 60+) · วังต้องสาปอโยธยา (Cursed Palace of Ayodhya, Lv 90+) · สระอโนดาตใต้น้ำ (Sunken Anodat, Lv 110+)
   · Waves 2 and 3 bring an ELITE (★ name, 4× HP, hits harder) that the team should focus down together.
   · In the Palace the guardian comes with two elite lieutenants.
   · Rewards grow with the party: +15% Bia per member, every member opens their own chest, and each clear gives a
     Socket Drill; from 3 members also a 30% chance at the guardian's card and 10% at a Diamond Drill. */
'use strict';

const DG_MID = [
  {id:'cemetery', base:8, min:60, mid:1, th:'สุสานผีปอบ', en:'Pop Cemetery', d:['ป่าช้าที่ผีปอบเฒ่ากับบริวารยึดไว้ · แนะนำปาร์ตี้ 3 คนขึ้นไป', 'A graveyard held by the Elder Pop and its brood · best with a party of 3+']},
  {id:'ayodhya', base:13, min:90, mid:1, lieut:1, th:'วังต้องสาปอโยธยา', en:'Cursed Palace of Ayodhya', d:['แม่ทัพผีกับรองแม่ทัพสองนาย · แนะนำปาร์ตี้ 4 คนขึ้นไป', 'The Phantom General and two lieutenants · best with a party of 4+']},
  {id:'anodat', base:15, min:110, mid:1, th:'สระอโนดาตใต้น้ำ', en:'Sunken Anodat', d:['วังใต้สระศักดิ์สิทธิ์ของราชาช้างวารี · แนะนำปาร์ตี้ 4 คนขึ้นไป', 'The sunken court of the Water Elephant King · best with a party of 4+']}];
{ const at = DUNGEONS.findIndex(d => d.id === 'meru'); DG_MID.forEach(d => { d.name = d.th; }); DUNGEONS.splice(at < 0 ? DUNGEONS.length : at, 0, ...DG_MID); }
const dgMid = () => { const D = dgInfo(); return D && D.mid ? D : null; };
/* make one monster an elite: the team should gang up on it */
function dgElite(m, tag){
  m.def = {...m.def, hp:Math.round(m.def.hp * 4), atk:[Math.round(m.def.atk[0] * 1.5), Math.round(m.def.atk[1] * 1.5)], def:Math.round(m.def.def * 1.4),
    name:`★ ${tag || ''}${m.def.name}`, en:`★ ${m.def.en}`, exp:m.def.exp * 4, jexp:m.def.jexp * 4};
  m.maxhp = m.hp = m.def.hp; m.eliteDg = true; m.enraged = false; VFX.play('enrage', {m});
}
{ const _sw = dgSpawnWave;
  dgSpawnWave = function(){ const before = new Set(mobs); const r = _sw.apply(this, arguments); const D = dgMid(); if (!D) return r;
    const fresh = mobs.filter(m => !before.has(m) && m.dg && !m.dead);
    if (DG.wave === 2 || DG.wave === 3){ const m = fresh.find(x => !x.def.boss); if (m){ dgElite(m, L('หัวหน้า', '')); banner(L(`★ หัวหน้าฝูง ${m.def.name.replace('★ หัวหน้า', '')} ปรากฏ! รุมพร้อมกัน`, `★ An elite ${m.def.en.replace('★ ', '')} appears! Gang up on it`)); } }
    if (DG.wave >= 4 && D.lieut){ const g = fresh.find(x => x.def.boss), kinds = MAPS[D.base].mobs.filter(t => !MOB[t].night);
      if (g) for (const sd of [-1, 1]){ const t = kinds[sd > 0 ? 0 : 1 % kinds.length], m = spawnMob(t, g.x + sd * 90, g.y + 30, {zone:MAPZ}); m.dgc = g.dgc; m.def = dgDef(t, g.dgc); m.dg = true; m.split = true; m.aggro = true; dgElite(m, L('รองแม่ทัพ', '')); } }
    return r; };
}
/* rewards that grow with the team */
{ const _r = dgReward;
  dgReward = function(){ const z0 = S.bia; const r = _r.apply(this, arguments); const D = dgMid(); if (!D) return r; const pc = DG.pc, lv = DG.lv;
    S.bia += Math.round((S.bia - z0) * .15 * (pc - 1));
    addItem('drill_i', 1); log(L('ได้สว่านเจาะรูจากหีบดันเจี้ยน', 'A Socket Drill from the dungeon chest'), 'g');
    if (pc >= 3){ const g = MOB[MAPS[D.base].boss], card = g && g.card;
      if (card && CARDS[card] && Math.random() < .3){ S.cards[card] = (S.cards[card] || 0) + 1; if (typeof cardPop === 'function') cardPop(card); log(L(`ได้ ${nm(CARDS[card])} (โบนัสทีม)`, `${nm(CARDS[card])} (team bonus)`), 'c'); }
      if (Math.random() < .1){ addItem('drill_d', 1); log(L('ได้สว่านเพชร (โบนัสทีม)!', 'A Diamond Drill (team bonus)!'), 'g'); } }
    if (pc > 1) toast(L(`โบนัสทีม ${pc} คน: เงิน +${15 * (pc - 1)}%${pc >= 3 ? ' · ลุ้นการ์ดผู้พิทักษ์และสว่านเพชร' : ''}`, `Team of ${pc}: Bia +${15 * (pc - 1)}%${pc >= 3 ? ' · a shot at the guardian card and a Diamond Drill' : ''}`));
    save(); return r; };
}
/* elites stand out: a gold ring under them */
if (typeof LIVE !== 'undefined'){ const _u = LIVE.drawUnder;
  LIVE.drawUnder = function(g, ...a){ const r = _u.call(this, g, ...a); if (!DG.active) return r;
    for (const m of mobs){ if (!m.eliteDg || m.dead) continue; const rr = (m.def.r || 14) * 1.6 + Math.sin(T * 5) * 2; g.save(); g.strokeStyle = 'rgba(255,210,80,.9)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(m.x - cam.x, m.y - cam.y, rr, rr * .5, 0, 0, 7); g.stroke(); g.restore(); }
    return r; }; }
if (typeof WIKI_SYS !== 'undefined') WIKI_SYS.push({id:'dungeonmid', t:['ดันเจี้ยนปาร์ตี้ระดับกลาง', 'Mid-level party dungeons'], b:() => `<p>${L('ผู้เฝ้าประตูแสงในอาเรน · ไปคนเดียวได้ แต่ออกแบบมาให้ไปเป็นทีม', 'Gatekeeper Saeng in Aren · solo works, but they are made for a team')}</p>
  <ul>${DG_MID.map(D => `<li><b>${nm(D)}</b> Lv ${D.min}+ · ${L(...D.d)}</li>`).join('')}</ul>
  <ul><li>${L('ด่าน 2 และ 3 มีหัวหน้าฝูง ★ (เลือด 4 เท่า ตีแรงขึ้น วงทองใต้ตัว)', 'Waves 2 and 3 bring a ★ elite (4× HP, harder hits, a gold ring under it)')}</li>
  <li>${L('รางวัล: เงิน +15% ต่อสมาชิกเพิ่ม · สว่านเจาะรูทุกครั้ง · ทีม 3 คนขึ้นไปลุ้นการ์ดผู้พิทักษ์ 30% และสว่านเพชร 10%', 'Rewards: +15% Bia per extra member · a Socket Drill every clear · teams of 3+ get a 30% shot at the guardian card and 10% at a Diamond Drill')}</li></ul>`});
