/* VAYRATHEN — tools/npc-occlusion.js — (v222) is any NPC hidden behind a prop?
   Loads every map, and for each NPC measures how much of its body (24×46 world units above its feet) is covered by
   the opaque pixels of props drawn in front of it (a prop whose foot line is lower on screen than the NPC's).
   Usage: CHROMIUM_PATH=/opt/pw-browsers/chromium node tools/npc-occlusion.js [maxPct=15]  (ALL=1: props behind the NPC count too) */
'use strict';
const { openGame, enterWorld } = require('../tests/browser');
(async () => { const max = +(process.argv[2] || 15); const { page, errors, close } = await openGame(); await enterWorld(page);
  const out = await page.evaluate(([max, all]) => { window.OCC_ALL = all;
    window.npcCover = n => { const bx0 = n.x - 12, bx1 = n.x + 12, by0 = n.y - 46, by1 = n.y; const cells = 24 * 46 / 4; let hit = 0; const by = {};
      const near = PROPS.filter(p => (window.OCC_ALL || p.y > n.y + 1) && Math.abs(p.x - n.x) < 260 && Math.abs(p.y - n.y) < 400);
      for (let yy = by0; yy < by1; yy += 2) for (let xx = bx0; xx < bx1; xx += 2){ let cov = null;
        for (const p of near){ const im = propImg(p.type, p.variant); if (!im || !im.img) continue; const lx = xx - (p.x - im.ax), ly = yy - (p.y - im.ay); if (lx < 0 || ly < 0 || lx >= im.w || ly >= im.h) continue;
          const k = im.img.width / im.w; if (!im._a){ try { im._a = im.img.getContext('2d').getImageData(0, 0, im.img.width, im.img.height); } catch (e) { continue; } }
          const a = im._a.data[((Math.floor(ly * k) * im._a.width) + Math.floor(lx * k)) * 4 + 3]; if (a > 140){ cov = p.type; break; } }
        if (cov){ hit++; by[cov] = (by[cov] || 0) + 1; } }
      return {pct:Math.round(hit / cells * 100), by}; };
    const res = [];
    for (const mp of MAPS){ try { loadMap(mp.id); } catch (e) { res.push(`${mp.id} load error ${e.message}`); continue; }
      for (let i = 0; i < 3; i++) advance(.05, false);
      for (const n of NPCS){ const c = npcCover(n); if (c.pct > max) res.push(`map ${mp.id} ${mp.name} · ${n.id} ${n.name || ''} @${Math.round(n.x)},${Math.round(n.y)} covered ${c.pct}% by ${Object.keys(c.by).join('/')}`); } }
    return res; }, [max, !!process.env.ALL]);
  console.log(out.length ? out.join('\n') : 'no NPC hidden'); console.log(`${out.length} hidden`, errors.length ? errors : ''); await close(); })();
