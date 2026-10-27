/* VAYRATHEN — js/gfx/art.js
   Hand-drawn character sheets that follow docs/CHARACTER_STANDARD.md.
   The manifest comes from assets/characters/<id>/<id>.manifest.js (generated from <id>.json by tools/build_manifest.py).
   Each action: rows = drawn directions, columns = frames, fixed cell, feet anchor.
   A direction that an action has no art for uses, in order: alias → mirror → the action's "fallback" action → SPR. */
'use strict';

const ART = (() => {
  const DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'];
  const MANIFEST = globalThis.ART_MANIFEST || {};
  const sets = {};

  function load(){
    const jobs = [];
    for (const id in MANIFEST){
      const m = MANIFEST[id], set = sets[id] = {meta: m, img: {}, ready: false};
      const files = [...new Set(Object.values(m.actions).map(a => a.file))];
      jobs.push(Promise.all(files.map(f => new Promise(res => {
        const im = new Image();
        im.onload = () => { set.img[f] = im; res(true); };
        im.onerror = () => res(false);
        im.src = m.base + f;
      }))).then(ok => { set.ready = ok.every(Boolean); }));
    }
    return Promise.all(jobs);
  }
  // → {a, row, flip} for the action (or its fallback chain) that has art for direction d; null when none
  function resolve(m, act, d, depth = 0){
    const a = m.actions[act]; if (!a || depth > 3) return null;
    const name = DIRS[d], rows = a.dirRows || m.dirRows, mirror = a.mirror || m.mirror || {}, alias = a.alias || {};
    if (rows.includes(name)) return {a, row: rows.indexOf(name), flip: false};
    if (alias[name] && rows.includes(alias[name])) return {a, row: rows.indexOf(alias[name]), flip: false};
    if (mirror[name] && rows.includes(mirror[name])) return {a, row: rows.indexOf(mirror[name]), flip: true};
    return a.fallback ? resolve(m, a.fallback, d, depth + 1) : null;
  }
  const has = (id, act, d = 0) => { const s = sets[id]; return !!(s && s.ready && resolve(s.meta, act, d)); };

  /* g in world units (1 unit = 1 sprite pixel of the procedural standard); x, y = feet position */
  function draw(g, id, act, dir, t, x, y){
    const s = sets[id], m = s.meta, {a, row, flip} = resolve(m, act, dir);
    const f = a.frameIndex ?? (a.loop ? Math.floor(t * a.fps) % a.frames : Math.min(a.frames - 1, Math.floor(t * a.fps)));
    const [cw, ch] = a.cell || m.cell, [ax, ay] = a.anchor || m.anchor, k = m.worldHeight / m.bodyHeight;
    g.save();
    g.translate(x, y); if (flip) g.scale(-1, 1);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(s.img[a.file], f * cw, row * ch, cw, ch, -ax * k, -ay * k, cw * k, ch * k);
    g.restore();
  }
  function portrait(g, id, size){
    const s = sets[id]; if (!s || !s.ready) return false;
    const m = s.meta, r = resolve(m, 'idle', 0); if (!r) return false;
    const a = r.a, [cw] = a.cell || m.cell, [, ay] = a.anchor || m.anchor, f = a.frameIndex || 0;
    const box = 112, top = ay - m.bodyHeight - 6;
    g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.clearRect(0, 0, size, size);
    g.drawImage(s.img[a.file], f * cw + (cw - box) / 2, r.row * (a.cell || m.cell)[1] + top, box, box, 0, 0, size, size);
    g.restore(); return true;
  }
  return {load, has, draw, portrait, DIRS};
})();
