/* VAYRATHEN — js/sys/bgm.js — recorded songs as background music for chosen scenes
   BGM_TRACKS maps a music mood to an audio file. Right now: the player's own song "เส้นทางผู้กล้า" plays only while
   you are inside Aren, the first town (mood 'village'). Everywhere else the synthesised Thai ensemble plays as before.
   The song loops, fades in and out over a second, follows Settings → Music volume, and waits for the first tap or
   key press if the browser blocks autoplay. */
'use strict';

const BGM_TRACKS = {village:{src:'audio/aren_hero.mp3', th:'เส้นทางผู้กล้า', en:'Path of the Brave'},
  aren_out:{src:'audio/aren_field.mp3', th:'Whimsical Village Loop นอกเมือง', en:'Whimsical Village Loop (outside town)'},   // the Aren map outside the town walls
  map_bamboo:{src:'audio/map_bamboo.mp3', th:'Whimsical Village Loop map 2', en:'Whimsical Village Loop map 2'},   // ป่าไผ่กระซิบ
  map_lotus:{src:'audio/map_lotus.mp3', th:'Whispers of the Ancient Grove', en:'Whispers of the Ancient Grove'},   // หนองบัวแดง
  map_kula:{src:'audio/map_kula.mp3', th:'Whispers of the Ancient Grove · ทุ่งกุลา', en:'Whispers of the Ancient Grove · Kula'},   // ทุ่งกุลาร้องไห้
  map_khmer:{src:'audio/map_khmer.mp3', th:'Whispers of the Enchanted', en:'Whispers of the Enchanted'},   // ปราสาทหินขอมโบราณ
  map_chaophraya:{src:'audio/map_chaophraya.mp3', th:'เพลงริมน้ำเจ้าพระยา (map4)', en:'Chao Phraya Riverside (map4)'},   // ริมน้ำเจ้าพระยา
  map_floatmarket:{src:'audio/map_floatmarket.mp3', th:'เพลงตลาดน้ำร้าง (map5)', en:'Abandoned Floating Market (map5)'},   // ตลาดน้ำร้าง
  camp:{src:'audio/camp.mp3', th:'เพลงแคมป์', en:'Camp theme'},
  // (v27) the boss phase: any boss fighting you (region bosses, dungeon guardians, the world boss) — a boss with its own theme keeps it
  battle:{src:'audio/boss_phase.mp3', th:'เฟสบอส', en:'Boss phase'},
  worldboss:{src:'audio/boss_phase.mp3', th:'เฟสบอส', en:'Boss phase'}};   // (v27) every campfire camp on the field maps (not Aren)   // ปราสาทหินขอมโบราณ
/* a map's own song replaces its everyday music (field / forest / night / water …); fights, bosses and the town keep theirs */
const MAP_BGM = {0:'aren_out', 1:'map_bamboo', 2:'map_lotus', 3:'map_chaophraya', 4:'map_floatmarket', 9:'map_kula', 10:'map_khmer'};
/* (v142) the player's 12 songs spread over the 54 maps that had none, one song per kind of land (a map keeps its song,
   whatever the hour or weather); all brought to the same loudness as the other songs (−14 LUFS) and 128 kbps */
Object.assign(BGM_TRACKS, {
  bgm_adventure:{src:'audio/bgm_adventure.mp3', th:'ผจญภัย · สวรรค์ ภูเขาศักดิ์สิทธิ์', en:'Adventure · heavens, holy mountains'},
  bgm_battle1:{src:'audio/bgm_battle1.mp3', th:'ต่อสู้ 1 · โบราณสถาน', en:'Battle 1 · ruins'},
  bgm_battle2:{src:'audio/bgm_battle2.mp3', th:'ต่อสู้ 2 · ผี ป่าช้า', en:'Battle 2 · ghosts, graveyards'},
  bgm_battle3:{src:'audio/bgm_battle3.mp3', th:'ต่อสู้ 3 · ภูเขาไฟ ลาวา', en:'Battle 3 · volcanoes, lava'},
  bgm_nature1:{src:'audio/bgm_nature1.mp3', th:'ธรรมชาติ 1 · ป่าหิมพานต์', en:'Nature 1 · Himmapan forest'},
  bgm_nature2:{src:'audio/bgm_nature2.mp3', th:'ธรรมชาติ 2 · ภูเขาเขียว ทุ่งดอกไม้', en:'Nature 2 · green hills, flower fields'},
  bgm_nature3:{src:'audio/bgm_nature3.mp3', th:'ธรรมชาติ 3 · ทะเล ชายฝั่ง', en:'Nature 3 · sea and shore'},
  bgm_nature4:{src:'audio/bgm_nature4.mp3', th:'ธรรมชาติ 4 · น้ำตก ป่าชายน้ำ', en:'Nature 4 · waterfalls, riverside woods'},
  bgm_nature5:{src:'audio/bgm_nature5.mp3', th:'ธรรมชาติ 5 · ทะเลทราย หุบผา', en:'Nature 5 · desert and canyons'},
  bgm_scifi1:{src:'audio/bgm_scifi1.mp3', th:'สำรวจ 1 · ถ้ำ ใต้ดิน', en:'Exploration 1 · caves, the underworld'},
  bgm_scifi2:{src:'audio/bgm_scifi2.mp3', th:'สำรวจ 2 · น้ำแข็ง หิมะ', en:'Exploration 2 · ice and snow'},
  bgm_tavern:{src:'audio/bgm_tavern.mp3', th:'เข้าเมือง · เมือง โอเอซิส', en:'Into town · cities, the oasis'},
});
Object.assign(MAP_BGM, {5:'bgm_battle1', 6:'bgm_scifi1', 7:'bgm_nature2', 8:'bgm_battle2', 11:'bgm_nature3', 12:'bgm_nature3', 13:'bgm_tavern', 14:'bgm_nature1', 15:'bgm_nature1', 16:'bgm_tavern', 17:'bgm_scifi1', 18:'bgm_nature1', 19:'bgm_adventure', 20:'bgm_adventure', 21:'bgm_nature5', 22:'bgm_nature5', 23:'bgm_battle3', 24:'bgm_battle3', 25:'bgm_battle3', 26:'bgm_scifi2', 27:'bgm_scifi2', 28:'bgm_scifi2', 29:'bgm_scifi2', 30:'bgm_adventure', 31:'bgm_nature2', 32:'bgm_nature4', 33:'bgm_nature4', 34:'bgm_nature4', 35:'bgm_nature2', 36:'bgm_nature3', 37:'bgm_tavern', 38:'bgm_nature5', 39:'bgm_nature5', 40:'bgm_nature5', 41:'bgm_scifi1', 42:'bgm_battle3', 43:'bgm_battle3', 44:'bgm_battle3', 45:'bgm_scifi2', 46:'bgm_scifi2', 47:'bgm_scifi2', 48:'bgm_scifi2', 49:'bgm_scifi2', 50:'bgm_scifi2', 51:'bgm_battle2', 52:'bgm_nature1', 53:'bgm_battle1', 54:'bgm_scifi1', 55:'bgm_battle2', 56:'bgm_scifi1', 57:'bgm_nature1', 58:'bgm_adventure', 59:'bgm_adventure', 60:'bgm_adventure'});
MAPS.forEach(m => { if (m.bgm && !MAP_BGM[m.id]) MAP_BGM[m.id] = m.bgm; });   // regions that bring their own song (data/world4.js)
/* (v170) ten more of the player's songs (−14 LUFS, 128 kbps) take maps from the songs that were shared the most: the ice
   lands, the heavens, the Himmapan forest and the caves now have two or three songs between them instead of one */
Object.assign(BGM_TRACKS, {
  bgm_dungeon:{src:'audio/bgm_dungeon.mp3', th:'ทางเข้าดันเจี้ยนลึกลับ · หอคอยคำสาป เขาวงกต', en:'Mysterious dungeon approach · cursed tower, maze'},
  bgm_thai1:{src:'audio/bgm_thai1.mp3', th:'ผจญภัยแดนไทย 1 · เมืองโบราณ', en:'Thai adventure 1 · old cities'},
  bgm_thai2:{src:'audio/bgm_thai2.mp3', th:'ผจญภัยแดนไทย 2 · หิมพานต์ชั้นนอก สระอโนดาต', en:'Thai adventure 2 · outer Himmapan, Anodat'},
  bgm_thai3:{src:'audio/bgm_thai3.mp3', th:'ผจญภัยแดนไทย 3 · ไกรลาส สุเมรุ ดาวดึงส์', en:'Thai adventure 3 · Kailash, Meru, Tavatimsa'},
  bgm_thai4:{src:'audio/bgm_thai4.mp3', th:'ผจญภัยแดนไทย 4 · วัดร้าง ป่าช้าวัด', en:'Thai adventure 4 · ruined temples'},
  bgm_nature6:{src:'audio/bgm_nature6.mp3', th:'ธรรมชาติ 6 · ป่าดึกดำบรรพ์ ป่าโกงกาง', en:'Nature 6 · primeval woods, mangroves'},
  bgm_fastnature1:{src:'audio/bgm_fastnature1.mp3', th:'ผจญภัยในธรรมชาติ 1 · ทุ่งดอกไม้', en:'Nature run 1 · flower fields'},
  bgm_fastnature2:{src:'audio/bgm_fastnature2.mp3', th:'ผจญภัยในธรรมชาติ 2 · ป่าเห็ด สวนผลไม้', en:'Nature run 2 · mushroom wood, orchard'},
  bgm_advmap2:{src:'audio/bgm_advmap2.mp3', th:'แผนที่ผจญภัย 2 · ป่าสน ฟยอร์ด แสงเหนือ', en:'Adventure map 2 · snow pines, fjord, aurora'},
  bgm_advmap3:{src:'audio/bgm_advmap3.mp3', th:'แผนที่ผจญภัย 3 · ถ้ำผลึก ซากเรือ ยอดเขาหิมะ', en:'Adventure map 3 · crystal cave, ice wreck, storm peak'}});
Object.assign(MAP_BGM, {54:'bgm_dungeon', 56:'bgm_dungeon', 13:'bgm_thai1', 16:'bgm_thai1', 14:'bgm_thai2', 15:'bgm_thai2', 19:'bgm_thai3', 20:'bgm_thai3', 30:'bgm_thai3',
  5:'bgm_thai4', 8:'bgm_thai4', 61:'bgm_nature6', 62:'bgm_nature6', 34:'bgm_nature6', 31:'bgm_fastnature1', 36:'bgm_fastnature1', 52:'bgm_fastnature2', 32:'bgm_fastnature2',
  45:'bgm_advmap2', 46:'bgm_advmap2', 47:'bgm_advmap2', 48:'bgm_advmap3', 49:'bgm_advmap3', 50:'bgm_advmap3'});
const MAP_BGM_SKIP = ['village', 'battle', 'worldboss', 'title', 'camp'];
/* a boss's own theme: starts when that boss is fighting you (or you attack it) and plays until it dies.
   Drop the song in audio/ under the name below; a boss without a file (or with a file that fails to load) keeps the normal battle music.
   To give another boss a theme: add one line here (key = monster id in data/world.js). */
const BOSS_THEMES = {khankhak:{src:'audio/boss_khankhak.mp3', th:'เพลงประจำตัวพญาคันคาก', en:'Phaya Khankhak theme'}};
for (const k in BOSS_THEMES) BGM_TRACKS['boss_' + k] = BOSS_THEMES[k];
const BOSSBGM = {on:null};
/* which boss theme (mood name) should play right now, or null. Latches: once the fight starts it stays until the boss is gone. */
function bossTheme(){
  if (!boss || boss.dead || !BOSS_THEMES[boss.type]){ BOSSBGM.on = null; return null; }
  const tr = BGM_TRACKS['boss_' + boss.type]; if (!tr || tr.bad){ BOSSBGM.on = null; return null; }
  if (BOSSBGM.on !== boss && ((boss.aggro && dist(boss, P) < 500) || P.target === boss || (boss.myHitT && T - boss.myHitT < 8))) BOSSBGM.on = boss;
  return BOSSBGM.on === boss ? 'boss_' + boss.type : null;
}
const BGM = {el:null, key:null, want:0, cur:0, raf:0, blocked:false};
const bgmVol = () => (typeof SETTINGS === 'undefined' ? .35 : (SETTINGS.musicVol ?? 35) / 100) * bgmMul(BGM.key);
function bgmFade(){
  BGM.raf = 0; const a = BGM.el; if (!a) return;
  const target = BGM.want * bgmVol(), stepK = BGM.want === 0 && BGM.fast ? .09 : .025; BGM.cur += Math.sign(target - BGM.cur) * Math.min(Math.abs(target - BGM.cur), stepK);   // (v27) a boss song stops quickly when its boss dies
  a.volume = clamp(BGM.cur, 0, 1);
  if (BGM.cur <= .001 && BGM.want === 0){ a.pause(); return; }
  if (Math.abs(BGM.cur - target) > .001) BGM.raf = requestAnimationFrame(bgmFade);
}
function bgmPlay(key){
  const tr = BGM_TRACKS[key];
  if (!tr){ BGM.want = 0; if (!BGM.raf) BGM.raf = requestAnimationFrame(bgmFade); return false; }
  if (!BGM.el || BGM.key !== key){ if (BGM.el) BGM.el.pause(); BGM.el = new Audio(tr.src); BGM.el.loop = true; BGM.el.addEventListener('error', () => { tr.bad = true; BGM.want = 0; BGM.key = null; BGM.el = null; try { musicMood(); } catch (e) {} }); BGM.el.preload = 'auto'; BGM.el.volume = 0; BGM.cur = 0; BGM.key = key; }
  BGM.want = 1; const p = BGM.el.play(); if (p && p.catch) p.catch(() => { BGM.blocked = true; });
  if (!BGM.raf) BGM.raf = requestAnimationFrame(bgmFade); return true;
}
{
  const _m = SFX.music;
  SFX.music = function(name){ const orig = name; if (typeof MAP_ID !== 'undefined' && MAP_BGM[MAP_ID] && name && !MAP_BGM_SKIP.includes(name) && !/^boss_/.test(name) && !(typeof DG !== 'undefined' && DG.active)) name = MAP_BGM[MAP_ID];   // Aren, out past the town: its own song (fights and bosses keep their music)
    const own = !!BGM_TRACKS[name] && !BGM_TRACKS[name].bad; if (SFX.muteMusic) SFX.muteMusic(own); bgmPlay(own ? name : null); return _m.call(SFX, orig); };
  const _v = SFX.setVolume; SFX.setVolume = function(...a){ const r = _v.apply(SFX, a); if (BGM.el && BGM.want){ BGM.cur = bgmVol(); BGM.el.volume = clamp(BGM.cur, 0, 1); } return r; };
}
/* nature sounds run on the synth's audio context: wake it up with the first touch even when a recorded song is playing */
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { try { const r = SFX.raw && SFX.raw(); if (r && r.ac && r.ac.state === 'suspended') r.ac.resume(); } catch (e) {} }, {capture:true}));
['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (BGM.blocked && BGM.el && BGM.want){ BGM.blocked = false; BGM.el.play().catch(() => { BGM.blocked = true; }); } }, {capture:true}));
document.addEventListener('visibilitychange', () => { if (!BGM.el || !BGM.want) return; if (document.hidden) BGM.el.pause(); else BGM.el.play().catch(() => { BGM.blocked = true; }); });

/* ---------- the camp song (v27) ----------
   Walk into the campfire camp of any field map and its song plays; walk out and the map's music comes back.
   Aren (map 0) keeps its own town song. A little hysteresis so the edge of the camp does not flip the music. */
const CAMPBGM = {in:false};
function campBgmIn(){
  if (typeof CAMP === 'undefined' || !CAMP || MAP_ID === 0 || (typeof DG !== 'undefined' && DG.active)) return (CAMPBGM.in = false);
  const d = Math.hypot(P.x - CAMP.x, (P.y - CAMP.y) * 1.2);
  return (CAMPBGM.in = CAMPBGM.in ? d < 240 : d < 175);
}
{ const _mm = musicMood;
  musicMood = function(){
    if (typeof SFX === 'undefined' || PAUSED) return;
    const busy = (typeof WB !== 'undefined' && WB.m && !WB.m.dead) || (typeof bossTheme === 'function' && bossTheme()) || (boss && !boss.dead && boss.aggro && dist(boss, P) < 500);
    if (campBgmIn() && !busy && !(BGM_TRACKS.camp && BGM_TRACKS.camp.bad)) return SFX.music('camp');
    const g = bgmGuardian(); if (g && !busy) return SFX.music('battle');   // a dungeon guardian is a boss fight too
    return _mm.apply(this, arguments);
  };
}
EV.on('map', () => { CAMPBGM.in = false; });

/* ---------- (v27) own volume for the boss and camp songs, and a faster boss song when the boss is desperate ---------- */
function bgmMul(k){
  if (typeof SETTINGS === 'undefined' || !k) return 1;
  const g = k === 'camp' ? SETTINGS.bgmCamp : (k === 'battle' || k === 'worldboss' || /^boss_/.test(k)) ? SETTINGS.bgmBoss : null;
  return g == null ? 1 : clamp(+g, 0, 100) / 100;
}
EV.on('tick', dt => {
  const a = BGM.el; if (!a || !BGM.want) return;
  // (v90) a boss's last phase no longer speeds the music up: every song plays at its own pace
  const want = 1; try { if ('preservesPitch' in a) a.preservesPitch = true; } catch (e) {}
  if (Math.abs(a.playbackRate - want) > .005) a.playbackRate += Math.sign(want - a.playbackRate) * Math.min(Math.abs(want - a.playbackRate), dt * .15);
});
{ const _rs = renderSettings;
  renderSettings = function(){ _rs.apply(this, arguments); const pane = el('pane-settings'); if (!pane || pane.querySelector('#set-bgmBoss')) return;
    const mv = pane.querySelector('#set-musicVol'), row = mv && mv.closest('label'); if (!row) return;
    const sel = (k, th, en, sub) => { const v = SETTINGS[k] ?? 100; return `<label class="set"><span><b>${L(th, en)}</b><small>${sub}</small></span><select id="set-${k}" data-set="${k}">${[0, 25, 50, 75, 100].map(n => `<option value="${n}" ${+v === n ? 'selected' : ''}>${n}%</option>`).join('')}</select></label>`; };
    row.insertAdjacentHTML('afterend', sel('bgmBoss', 'เพลงบอส', 'Boss music', L('เทียบกับเพลงประกอบ · บอสใกล้ตายเพลงเร็วขึ้น', 'relative to Music · speeds up when the boss is desperate')) + sel('bgmCamp', 'เพลงแคมป์', 'Camp music', L('เทียบกับเพลงประกอบ', 'relative to Music'))); };
}

/* (v27) the boss is dead: the boss song ends right away (no waiting for the next music check) */
function bgmBossOver(){ if (!BGM.el || !/^(battle|worldboss|boss_)/.test(BGM.key || '')) return; BGM.fast = true; BGM.want = 0; BGM.el.playbackRate = 1; if (!BGM.raf) BGM.raf = requestAnimationFrame(bgmFade);
  setTimeout(() => { BGM.fast = false; try { musicMood(); } catch (e) {} }, 700); }
EV.on('kill', m => { if (m && m.def && m.def.boss && !m.minion) bgmBossOver(); });
if (typeof onMk === 'function'){ const _mk = onMk; onMk = function(msg){ const d = msg && msg.data || {}, m = typeof NM !== 'undefined' && NM.byId.get(d.id), was = m && !m.dead && m.def && m.def.boss; const r = _mk.apply(this, arguments); if (was) bgmBossOver(); return r; }; }

/* the guardian of the dungeon you are in, once it is fighting you */
function bgmGuardian(){ if (typeof DG === 'undefined' || !DG.active) return null;
  return mobs.find(m => m.dg && !m.dead && m.def && m.def.boss && (m.aggro || (m.myHitT && T - m.myHitT < 8)) && dist(m, P) < 700) || null; }
