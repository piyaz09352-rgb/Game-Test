/* VAYRATHEN — tools/skill-fps.js — (v346) which skills make a phone stutter
   Plays every active skill of every class's top job on a phone-sized screen (844×390, ×3 pixels) with the CPU slowed
   to a mid-range phone (CDP CPU throttle ×4, CPU=… to change), into a pack of 10 monsters, and measures the real
   frame times for 2.5 s after the cast: the average FPS and the worst 5% of frames. Writes docs/SKILL_FPS.md — the
   slowest skills first, with the quiet baseline (the same scene, no skill) for comparison.
   Usage: node tools/skill-fps.js            LINES=rune,occult limits the classes · CPU=6 a slower phone
   Local only: a fresh offline hero (no account, nothing online). */
'use strict';
const path = require('path'), fs = require('fs');
const { openGame, enterWorld } = require('../tests/browser');
const ROOT = path.join(__dirname, '..'), CPU = +process.env.CPU || 4;

(async () => {
  const { page, errors, close } = await openGame({ width: 844, height: 390, ctx: { hasTouch: true, isMobile: true, deviceScaleFactor: 3 } });
  const cdp = await page.context().newCDPSession(page);
  try {
    await enterWorld(page, 'Fps', 'fps_tool_user');
    await page.evaluate(() => { S.tut = { done: true, i: 99 }; for (const x of WIN_IDS) if (UIS.open[x]) closeWin(x); });
    const lines = await page.evaluate(only => Object.keys(JOBS).filter(k => JOBS[k].parent === 'novice' && (!only || only.includes(k))), process.env.LINES ? process.env.LINES.split(',') : null);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const rows = [];
    for (const line of lines){
      const list = await page.evaluate(async line => {
        const kids = j => Object.keys(JOBS).filter(k => JOBS[k].parent === j); let job = line; for (let t = 1; t < 4; t++){ const k = kids(job)[0]; if (!k) break; job = k; }
        S.job = job; S.lvl = 150; S.jlvl = JOBS[job].jobMax || 50; S.stats = { str: 80, agi: 80, vit: 80, int: 80, dex: 80, luk: 40 };
        S.skills = {}; for (const j of jobChain()) for (const id of (JOBS[j].skills || [])) if (SKILLS[id]) S.skills[id] = SKILLS[id].max;
        const w = GEAR_LIST.filter(g => g[1] === 'weapon' && ITEMS[g[0]] && canWield(ITEMS[g[0]])).sort((a, b) => b[4] - a[4])[0]; if (w) S.gear.weapon = w[0];
        if (usesArrows()){ const a = GEAR_LIST.filter(g => g[1] === 'ammo' && ammoFits(g[0]))[0]; if (a){ S.inv[a[0]] = 99999; S.gear.ammo = a[0]; } }
        derive(); return {job, name:JOBS[job].name, skills:Object.keys(S.skills).filter(id => SKILLS[id].type !== 'passive')}; }, line);
      const measure = async id => page.evaluate(async id => {
        if (typeof MAP_ID === 'undefined' || MAP_ID !== 71) { loadMap(71); await new Promise(r => setTimeout(r, 1500)); }
        for (const m of mobs) if (!m.def.boss){ m.dead = true; m.deadT = 99; }
        await new Promise(r => setTimeout(r, 300));
        const type = MAPS[71].mobs[0]; for (let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2, m = spawnMob(type, P.x + 110 + Math.cos(a) * 70, P.y + Math.sin(a) * 50, {zone:MAPZ}); m.hp = m.maxhp = 1e9; }
        S.hp = DER.maxhp; S.sp = DER.maxsp; P.cds = {}; P.acd = 0; P.cast = null; P.target = null; P.dead = false;
        if (id) trySkill(id);
        const ts = []; let last = performance.now(); const t0 = last;
        await new Promise(res => { const f = now => { ts.push(now - last); last = now; if (now - t0 < 2500) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
        ts.shift(); ts.sort((a, b) => a - b); const avg = ts.reduce((s, x) => s + x, 0) / ts.length, p95 = ts[Math.floor(ts.length * .95)] || 0;
        return {fps:Math.round(1000 / avg), p95:Math.round(p95), max:Math.round(ts[ts.length - 1] || 0)}; }, id);
      const base = await measure(null);
      for (const id of list.skills){ const r = await measure(id); const nm = await page.evaluate(id => skName(SKILLS[id]), id);
        rows.push({line, job:list.name, id, nm, ...r, base:base.fps, bp95:base.p95, x:+(r.p95 / Math.max(1, base.p95)).toFixed(2)}); process.stdout.write(`${list.name} ${nm}: ${r.fps} fps, p95 ${r.p95} ms (base ${base.fps})\n`); }
    }
    rows.sort((a, b) => b.x - a.x || a.fps - b.fps);
    let md = `# VAYRATHEN — skill smoothness on a phone (tools/skill-fps.js)\n\n844×390 ×3 pixels, CPU ×${CPU} slower (a mid-range phone), 10 monsters, 2.5 s after each cast. ` +
      `**p95** = the slowest 5% of frames (ms; 33 ms = 30 FPS). **×ฉากเปล่า** = p95 against the same scene with no skill: the skill's own cost, whatever the machine. Over ×1.6 is **bold**. (A machine without a graphics card draws everything slowly: read the × column there.)\n\n| อาชีพ | สกิล | FPS | p95 ms | ช้าสุด ms | ×ฉากเปล่า | ฉากเปล่า FPS / p95 |\n|---|---|---|---|---|---|---|\n`;
    for (const r of rows) md += `| ${r.job} | ${r.x > 1.6 ? `**${r.nm}**` : r.nm} (${r.id}) | ${r.fps} | ${r.p95} | ${r.max} | ×${r.x} | ${r.base} / ${r.bp95} |\n`;
    fs.writeFileSync(process.env.OUT || path.join(ROOT, 'docs/SKILL_FPS.md'), md);
    console.log(`DONE ${rows.length} skills · errors ${errors.length}`); if (errors.length) console.log(errors.slice(0, 5).join('\n'));
  } finally { await close(); }
})();
