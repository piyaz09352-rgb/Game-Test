/* VAYRATHEN — js/sys/bossfx302.js — (v302) a boss's skills look like the land it rules
   The heroes' skills got a signature for each class line (classfx301.js); the bosses still used one set of effects
   everywhere. Each boss skill now adds a layer in the look of its land, built from the same pieces:
     the Sunken Palace = bubbles and deep blue · Naraka = flames · Heaven = stars of light · the Forbidden Valley =
     feathers and red dust · Desolation = pale wisps · Drought = sand-coloured stones · Civilization = gold kanok ·
     Plenty = green leaves · anywhere else = the boss's own element (fire, ice shards, lightning, rock, light, shadow).
   · slam / quake : the land's seal opens under the boss while the warning ring fills, then tokens fan out, crescents
     sweep round and (quake) light spears stand along the edge
   · charge / wave: an escort of tokens down the path, a crescent and a burst where it ends
   · meteor       : a seal over the whole target area and tokens raining in
   · field        : a seal that stays under the pool, tokens rising from it
   · summon, heal, roar, vanish, barrage, enraged: tokens gather / rise / ring out / mark the place
   The red warning shapes stay as clear as before (the seal is drawn fainter and under them); damage and timing are
   unchanged; Settings ▸ «class skill effects» turns this layer off too. */
'use strict';
CFX_TOK.bubble = function(g, s, c){ g.fillStyle = 'rgba(190,235,255,.28)'; g.strokeStyle = c[0]; g.lineWidth = Math.max(.6, s * .12); g.beginPath(); g.arc(0, 0, s * .85, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = Math.max(.6, s * .14); g.beginPath(); g.arc(0, 0, s * .55, Math.PI * 1.05, Math.PI * 1.5); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(s * .3, s * .32, s * .1, 0, 7); g.fill(); };
const BFX_LAND = {
  sea:{col:['#e6fbff', '#3fb8f0', '#123a8a'], tok:'bubble', emb:[8, 3]}, lava:{col:['#fff4c2', '#ff7a1f', '#a81a10'], tok:'flame', emb:[6, 2]}, sky:{col:['#fffff0', '#ffe07a', '#d89a2a'], tok:'cross', emb:[12, 5]},
  wild:{col:['#ffe6cc', '#e0703a', '#6a2a14'], tok:'feather', emb:[9, 3]}, ruin:{col:['#eef0f2', '#9aa6b4', '#3a4250'], tok:'wisp', emb:[7, 3]}, arid:{col:['#fff0c8', '#e0b060', '#7a5220'], tok:'rock', emb:[5, 2]},
  civil:{col:['#fff8dc', '#ffcf4a', '#9a6a10'], tok:'kanok', emb:[12, 5]}, fertile:{col:['#efffe0', '#6fd25a', '#2a6b22'], tok:'leaf', emb:[8, 0]}};
function bfxLook(m){ const k = typeof abyssHere === 'function' && abyssHere() ? 'sea' : typeof cavernHere === 'function' && cavernHere() ? 'lava' : typeof heavenHere === 'function' && heavenHere() ? 'sky' : typeof land8Here === 'function' ? land8Here() : null;
  if (k && BFX_LAND[k]) return {line:'boss', land:k, ...BFX_LAND[k]};
  const e = m && m.def && m.def.elem; return {line:'boss', land:null, col:SKFX_EL[e] || SKFX_EL.shadow, tok:CFX_ELTOK[e] || 'wisp', emb:[7, 3]}; }
function bfxCast(m, id){
  if (typeof SETTINGS !== 'undefined' && SETTINGS.classFx === false) return;
  const L = bfxLook(m), c = L.col, x = m.x, y = m.y, tx = P.x, ty = P.y, h = (typeof MOB_H !== 'undefined' && MOB_H[m.type]) || 60, alive = f => () => { if (!m.dead) try { f(); } catch (e) {} };
  switch (id){
    case 'slam': case 'quake': { const r = id === 'quake' ? 170 : 105, wait = id === 'quake' ? 1.3 : .9; cfxEmblem(x, y, r * .96, L, wait + .9, {a:.55});
      later(wait, alive(() => { cfxFan(m.x, m.y, r, L, 1.25, id === 'quake' ? 14 : 9); for (let i = 0; i < 3; i++) cfxCrescent(m.x, m.y, 16, i * 2.1, r * .7, c, .5, 3.4, .22, i * .06); if (id === 'quake'){ cfxSpears(m.x, m.y, r, c, 14, 1.2, 120); cfxRain(m.x, m.y, r, L, 1.2, 8, {over:.4}); } })); break; }
    case 'charge': case 'wave': { const d = Math.hypot(tx - x, ty - y) || 1, ux = (tx - x) / d, uy = (ty - y) / d, len = id === 'wave' ? 340 : 260, wait = id === 'wave' ? .8 : .75; cfxEmblem(x, y, 46, L, wait + .4, {a:.55, center:false});
      later(wait, alive(() => { const ex = x + ux * len, ey = y + uy * len; cfxEscort(x, y, ex, ey, L, 1.3, id === 'wave' ? 10 : 6); later(.3, () => { cfxCrescent(ex, ey, 18, Math.atan2(uy, ux), 40, c); cfxBurst(ex, ey, 16, L, 7, 1.2); }); })); break; }
    case 'barrage': cfxEmblem(x, y, 22, L, 1, {up:true, z:h * .55, a:.8}); cfxConverge(x, y, h * .55, L, 1.1, 7, {r:40, dur:.4}); break;
    case 'meteor': cfxEmblem(tx, ty, 118, L, 2.3, {a:.5}); later(.75, alive(() => cfxRain(tx, ty, 100, L, 1.3, 14, {over:.9}))); later(1.9, alive(() => cfxSpears(tx, ty, 100, c, 10, 1, 100))); break;
    case 'summon': cfxEmblem(x, y, 92, L, 1.5, {a:.6}); cfxConverge(x, y, 8, L, 1.2, 10, {r:96, dur:.7, lift:12}); break;
    case 'heal': if (m.hp < m.maxhp){ cfxEmblem(x, y, 50, L, 1.3, {a:.6}); cfxRise(x, y, {...L, col:SKFX_EL.heal}, 1.2, 10, {w:50, h:h + 20}); } break;
    case 'roar': cfxEmblem(x, y, 140, L, 1.5, {a:.5}); later(.7, alive(() => { for (let i = 0; i < 6; i++) cfxSound(m.x, m.y, h * .6, i / 6 * Math.PI * 2, c, 3, .9, 120); cfxFan(m.x, m.y, 150, L, 1.2, 12); })); break;
    case 'field': later(.6, alive(() => { cfxEmblem(tx, ty, 72, L, 5, {a:.5, spin:.3}); for (let k = 0; k < 4; k++) later(k * 1.2, () => cfxRise(tx, ty, L, 1, 6, {w:110, h:46, spread:.8})); })); break;
    case 'teleport': cfxConverge(x, y, h * .4, L, 1.1, 8, {r:44, dur:.35, twist:2.4}); later(.05, alive(() => { cfxEmblem(m.x, m.y, 44, L, .9, {a:.6, center:false}); cfxBurst(m.x, m.y, h * .4, L, 9, 1.2, {up:.8}); })); break;
  }
}
if (typeof bossCast === 'function'){ const _bc = bossCast; bossCast = function(m, id){ const x0 = m.x, y0 = m.y, r = _bc.apply(this, arguments);
  if (r) try { if (id === 'teleport'){ const nx = m.x, ny = m.y; m.x = x0; m.y = y0; try { bfxCast(m, id); } finally { m.x = nx; m.y = ny; } } else bfxCast(m, id); } catch (e) { console.warn('bossfx', e); } return r; }; }
/* enraged: the land's seal blazes under the boss, light spears stand round it, tokens pour up */
if (typeof VFX !== 'undefined' && VFX.play){ const _vp = VFX.play; VFX.play = function(name, o){ if (name === 'enrage' && o && o.m && o.m.enraged && !(typeof SETTINGS !== 'undefined' && SETTINGS.classFx === false)) try { const m = o.m, L = bfxLook(m), h = (typeof MOB_H !== 'undefined' && MOB_H[m.type]) || 60;
      cfxEmblem(m.x, m.y, 80, L, 2.2, {a:.75}); cfxSpears(m.x, m.y, 74, L.col, 12, 1.6, 130); cfxRise(m.x, m.y, L, 1.4, 16, {w:90, h:h + 50, spread:.9}); cfxFan(m.x, m.y, 110, L, 1.3, 12); } catch (e) {} return _vp.apply(this, arguments); }; }
