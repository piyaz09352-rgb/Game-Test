/* VAYRATHEN — js/sys/robomount279.js — (v279–v280) robot fashion mounts, sold for Vayra Coins
   The owner asked for real robots to ride. Four machines:
     ม้าเหล็กจักรกล  Mech Steed     steel legs at a trot, a visor head with antennae, a mane of light
     ยูนิคอร์นจักรกล  Mecha Unicorn  pearl armour with gold seams, a spiral golden horn, a mane and tail of coloured light
     มังกรจักรกลเพลิง Mecha Fire Drake  walks on four legs: red armour, gold plates, folded wings, a spiked tail, a glowing jaw
     มังกรเหล็ก      Iron Dragon    flies high on thrusters, plated wings beating, a segmented tail
     หงส์เพลิงจักรกล   Mecha Phoenix  flies: great red and gold wings, a crest and a tail of flame-coloured streamers
   (v280 also) the owner did not like the tiger and the two-legged walker: they became the unicorn and the fire drake.
   (v280) The first drawing was smooth vector art with the rider standing on top: not the game's pixel style and not
   how anyone rides. Now each robot is built inside the hero's own sprite (gfx/sprites.js drawRoboMount), exactly like
   the Golden Deer: pixel art with the same outline and shading, and the rider sits astride in the riding pose.
   They are wardrobe mounts like the others: bought in the Coin Shop (แฟชั่น → พาหนะ), account-wide, worn from the
   wardrobe, shown while riding (R). A worn fashion mount also counts as owning a mount (mount279.js).
   Loaded before coinshop274.js so the shop prices them with the rest. */
'use strict';

const ROBO_MOUNTS = [
  ['rb_m_steed', 'ม้าเหล็กจักรกล', 'Mech Steed', 'robosteed', ['#c9d3de', '#38e1ff'], 180],
  ['rb_m_unicorn', 'ยูนิคอร์นจักรกล', 'Mecha Unicorn', 'robounicorn', ['#f4f2ff', '#ff6ab0'], 200],
  ['rb_m_drake', 'มังกรจักรกลเพลิง', 'Mecha Fire Drake', 'robodrake', ['#e0322a', '#ffd23a'], 220],
  ['rb_m_dragon', 'มังกรเหล็ก', 'Iron Dragon', 'robodragon', ['#5a6a8a', '#ff5ad0'], 260, 16],
  ['rb_m_phoenix', 'หงส์เพลิงจักรกล', 'Mecha Phoenix', 'robophoenix', ['#f2c34c', '#e0322a'], 280, 18]];
/* kind 'beast' with no monster sheet: drawMountX draws nothing under the rider (the robot is in the hero's sprite) */
for (const [id, th, en, sprite, c, price, fly] of ROBO_MOUNTS){ const m = {slot:'mount', th, en, kind:'beast', lift:0, c, price:{c:price}, robot:1, sprite, ...(fly ? {fly} : {})}; XMOUNT[id] = m; XCOS[id] = m; }
/* (v280) the flyers ride high above the ground (cosx.js lifts the rider by .fly); their shadow stays on the ground, below */
{ const _dp = drawPlayerW; drawPlayerW = function(g){ const M = roboRide(); if (M && M.fly && !P.dead && typeof shadowW === 'function'){ const x = P.x - cam.x, y = P.y - cam.y, k = 1 - Math.sin(T * 3) * .06; g.save(); g.globalAlpha = .55; shadowW(g, x, y, 17 * k); g.restore(); } return _dp.apply(this, arguments); }; }
const roboRide = () => { const M = typeof mountSkin === 'function' ? mountSkin() : null; return M && M.robot ? M : null; };

/* the hero's sprite with the robot in it: a look flag the sprite key carries */
{ const _hk = SPR.heroKey;
  SPR.heroKey = function(job, gear, look){
    if (!look || !look.mnt) return _hk.apply(this, arguments);
    const {mnt, ...lk} = look, k0 = _hk.call(this, job, gear, lk), key = k0 + '~' + mnt;
    if (!SPR.CHARS[key] && SPR.CHARS[k0]){ SPR.CHARS[key] = {...SPR.CHARS[k0], mount:mnt}; SPR.CHAR_ACTIONS[key] = SPR.CHAR_ACTIONS[k0] || SPR.CHAR_ACTIONS[job]; }
    return SPR.CHARS[key] ? key : k0; }; }
{ const _hs = heroSheet;
  heroSheet = function(job = S.job, gear = S.gear, look = S.look){
    const M = job === S.job && gear === S.gear ? roboRide() : null;
    return M ? _hs.call(this, job, gear, {...(look || {}), mnt:M.sprite}) : _hs.apply(this, arguments); }; }
/* the riding pose (sitting astride), walking or standing still */
{ const _act = playerAct;
  playerAct = function(){ const M = roboRide(); if (M && !P.dead && !P.cast && !(P.atkAnim > 0) && !(P.skillAnim > 0)) return P.moving ? 'ride' : 'rideIdle'; return _act.apply(this, arguments); }; }
/* the wardrobe / shop preview shows the robot under the hero too */
if (typeof eqPreviewSheet === 'function'){ const _ep = eqPreviewSheet;
  eqPreviewSheet = function(){ const id = typeof EQ !== 'undefined' && EQ.tab === 'cos' && EQ.try; const M = id && XMOUNT[id] && XMOUNT[id].robot ? XMOUNT[id] : null;
    return M ? heroSheet(S.job, {...S.gear}, {...(S.look || {}), mnt:M.sprite}) : _ep.apply(this, arguments); }; }
