/* VAYRATHEN — js/sys/fixes229.js — (v229) three things left over
   1. LOGIN: the first frame drawn behind the login card painted every character for the first time (~300 ms on a slow
      machine) only to be blurred by the title. While the title is up, the backdrop is now the ground and the scenery
      only (ready-made pictures, cheap); characters are painted once you are in the game.
   2. TOWER LEGEND ON AUTO: Auto closed every dialog, so a chapter Chandra told vanished at once. Auto now leaves her
      open (the stairs wait while she speaks); if nobody reads for 45 s while Auto runs, it closes so the climb goes on.
   3. MINIMAP GATE LEVELS: in Aren the gates sit close together, so their level tags overlapped each other and your
      arrow. Each tag now takes the first free spot (beside the gate, then above / below or left / right of it). */
'use strict';

/* ---------- 1. the backdrop behind the title ---------- */
{ const _r = render; render = function(){
    const t = document.getElementById('title');
    if (!t || t.hidden || !PAUSED || typeof terr === 'undefined') return _r.apply(this, arguments);
    cam.x = clamp(P.x - VW / 2, 0, Math.max(0, W - VW)); cam.y = clamp(P.y - VH / 2, 0, Math.max(0, H - VH));
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(terr, cam.x * TS, cam.y * TS, VW * TS, VH * TS, 0, 0, VW * PX * DPR, VH * PX * DPR);
    const g = ctx; g.setTransform(PX * DPR, 0, 0, PX * DPR, 0, 0);
    const list = []; for (const p of PROPS){ const im = propImg(p.type, p.variant), x = p.x - cam.x, y = p.y - cam.y; if (x + im.w < 0 || x - im.w > VW || y - im.h > VH || y + 30 < 0) continue; list.push([p, im, x, y]); }
    list.sort((a, b) => a[0].y - b[0].y); for (const [p, im, x, y] of list) drawPropW(g, p, im, x, y);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); }; }

/* ---------- 2. Auto leaves Chandra's chapter open ---------- */
const FX229 = {inBot:false, loreT:0};
{ const _u = updBot; updBot = function(){ FX229.inBot = true; try { return _u.apply(this, arguments); } finally { FX229.inBot = false; } }; }
{ const _c = closeDialog; closeDialog = function(){ const d = el('dialog'); if (FX229.inBot && d && !d.hidden && d.dataset.npc === 'tl_chandra' && FX229.loreT < 45) return; return _c.apply(this, arguments); }; }
EV.on('tick', dt => { const d = el('dialog'); if (d && !d.hidden && d.dataset.npc === 'tl_chandra'){ FX229.loreT += dt; if (FX229.loreT >= 45 && typeof BOT !== 'undefined' && BOT.on) closeDialog(); } else FX229.loreT = 0; });

/* ---------- 3. minimap gate tags: placed in js/ui/hud.js drawMini (v229) ---------- */
