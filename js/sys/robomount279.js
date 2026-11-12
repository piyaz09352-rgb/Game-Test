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
/* (v282) the coin shop / wardrobe: the preview stage and the picture cards show the hero riding the robot (the robot is
   part of the hero's sprite, so the old "mount under, hero on top" drawing showed the hero alone) */
if (typeof drawEquipPrev === 'function'){ const _dp = drawEquipPrev;
  drawEquipPrev = function(){ const id = typeof EQ !== 'undefined' && EQ.tab === 'cos' && EQ.try; const M = id && XMOUNT[id] && XMOUNT[id].robot ? XMOUNT[id] : null; if (!M) return _dp.apply(this, arguments);
    const cv = document.getElementById('eqPrev'), sh = heroSheet(S.job, {...S.gear}, {...(S.look || {}), mnt:M.sprite}); if (!cv || !sh) return;
    const K = sh.K, w = 92, h = 100, fx = w / 2, fy = h - 8; if (cv.width !== w * K || cv.height !== h * K){ cv.width = w * K; cv.height = h * K; }
    const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.setTransform(K * .82, 0, 0, K * .82, fx * K * .18, fy * K * .18);
    const lift = M.fly ? 8 + Math.sin(T * 3) * 2 : 0;
    if (M.fly){ g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(fx, fy, 16, 4.5, 0, 0, 7); g.fill(); }
    SPR.draw(g, sh, 'rideIdle', EQ.dir, T, fx, fy - lift); }; }
if (typeof cthRender === 'function'){ const _cr = cthRender;
  cthRender = function(id){ const M = XMOUNT[id] && XMOUNT[id].robot ? XMOUNT[id] : null; if (!M) return _cr.apply(this, arguments);
    const c = document.createElement('canvas'); c.width = CTH_W; c.height = CTH_H; const g = c.getContext('2d');
    const bg = g.createRadialGradient(CTH_W / 2, CTH_H * .55, 4, CTH_W / 2, CTH_H * .55, CTH_W * .75); bg.addColorStop(0, 'rgba(255,214,120,.42)'); bg.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = bg; g.fillRect(0, 0, CTH_W, CTH_H);
    try { const key = SPR.heroKey(S.job, {weapon:null}, {...(S.look || {}), mnt:M.sprite}), K = 2, img = SPR.renderFrame('char', key, 'rideIdle', 2, 0, K), fs = img.width;   // side on: the whole robot shows
      const f = document.createElement('canvas'); f.width = img.width; f.height = img.height; f.getContext('2d').putImageData(img, 0, 0);
      const s = Math.min(CTH_W / (fs / K) * 1.15, 2.1), by = CTH_H - 10 - (M.fly ? 10 : 0);
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(CTH_W / 2, CTH_H - 10, 26, 7, 0, 0, 7); g.fill();
      g.imageSmoothingEnabled = false; g.setTransform(s, 0, 0, s, CTH_W / 2, by); g.drawImage(f, -fs / 2 / K, -SPR.ANCHOR_Y, fs / K, fs / K); } catch (e) { return null; }
    return c.toDataURL('image/png'); }; }
