/* VAYRATHEN — tools/first-play.js — (v346) a brand-new player's first ten minutes, on a phone held sideways
   A bot that only touches the screen the way a person would (taps, the joystick, the buttons the tutorial lights up)
   goes from the title through sign-up, making a hero, every tutorial step, the first quest, and a few minutes of play.
   At every step it takes a picture and notes how long the step took and anything that went wrong (a step that does not
   finish in 60 s, a window that does not open, an error). Writes a contact sheet of the pictures and docs/FIRSTPLAY.md.
   Usage: node tools/first-play.js          SIZE=1366x768 for a laptop · OUT=dir for the pictures (default docs/firstplay)
   Local only: offline, a test account in this browser (nothing online). */
'use strict';
const path = require('path'), fs = require('fs');
const { openGame, TEST_PASS } = require('../tests/browser');
const ROOT = path.join(__dirname, '..'), OUT = process.env.OUT || path.join(ROOT, 'docs', 'firstplay');
const [VW0, VH0] = (process.env.SIZE || '844x390').split('x').map(Number), touch = VW0 < 1100;
fs.mkdirSync(OUT, { recursive: true }); for (const f of fs.readdirSync(OUT)) if (/\.(png|jpg)$/.test(f)) fs.unlinkSync(path.join(OUT, f));

(async () => {
  const { page, errors, close } = await openGame({ width: VW0, height: VH0, ctx: touch ? { hasTouch: true, isMobile: true, deviceScaleFactor: 2 } : {} });
  const cdp = await page.context().newCDPSession(page);
  const steps = [], t0 = Date.now(); let n = 0;
  const shot = async (title, note = '') => { n++; const f = `${String(n).padStart(2, '0')}.jpg`; await page.screenshot({ path: path.join(OUT, f), type: 'jpeg', quality: 70 });
    steps.push({ n, f, title, note, sec: Math.round((Date.now() - t0) / 1000) }); console.log(n, title, note); };
  const tap = async (x, y) => { if (touch) await page.touchscreen.tap(x, y); else await page.mouse.click(x, y); await page.waitForTimeout(250); };
  const tapSel = async sel => { const b = await page.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => e.offsetWidth); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!b) return false; await tap(b[0], b[1]); return true; };
  const tapWorld = async (wx, wy) => { const p = await page.evaluate(([x, y]) => { const r = cv.getBoundingClientRect(); return [r.left + (x - cam.x) / VW * r.width, r.top + (y - cam.y) / VH * r.height]; }, [wx, wy]); await tap(p[0], p[1]); };
  const tutI = () => page.evaluate(() => (S && S.tut && !S.tut.done ? S.tut.i : -1));
  const waitStep = async (i, sec) => { for (let k = 0; k < sec * 4; k++){ if ((await tutI()) !== i) return true; await page.waitForTimeout(250); } return false; };
  const drag = async (x, y, dx, dy, ms) => { const pt = (a, b) => [{ x: a, y: b, id: 1 }];
    if (!touch){ await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y + dy, { steps: 10 }); await page.waitForTimeout(ms); await page.mouse.up(); return; }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x, y) });
    for (let k = 1; k <= 8; k++){ await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x + dx * k / 8, y + dy * k / 8) }); await page.waitForTimeout(30); }
    await page.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  try {
    await page.waitForTimeout(1500); await shot('หน้าแรก (เปิดเกม)');
    // sign up
    await page.waitForSelector('#auBox', { timeout: 30000 }); await tapSel('#auBox [data-autab="reg"][role="tab"]');
    await page.fill('#auId', 'firstplay_' + Date.now().toString(36)); await page.fill('#auPw', TEST_PASS); await page.fill('#auPw2', TEST_PASS); await shot('สมัครไอดี');
    await tapSel('#auBox [data-auth="go"]'); await page.waitForSelector('[data-make]', { timeout: 30000 }); await shot('ช่องตัวละครว่าง');
    await tapSel('[data-make]'); await page.waitForSelector('[data-mkgo]'); await page.fill('#mkName', 'มือใหม่'); await shot('สร้างตัวละคร');
    await tapSel('[data-mkgo]'); await page.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, { timeout: 60000 }); await page.waitForTimeout(2500);
    await shot('เข้าเกมครั้งแรก', await page.evaluate(() => (S.tut && !S.tut.done ? `บทสอนขั้น ${S.tut.i + 1}/${TUT.length}` : 'ไม่มีบทสอน!')));
    // every tutorial step, done by touch
    for (let guard = 0; guard < 20; guard++){
      const i = await tutI(); if (i < 0) break;
      const st = await page.evaluate(i => ({ t: TUT[i].t[0], ev: TUT[i].ev || '', next: !!TUT[i].next, go: TUT[i].go || '', hl: TUT[i].hl || '', arrow: TUT[i].arrow || '' }), i);
      const s0 = Date.now(); let how = '';
      if (st.next){ how = 'กดปุ่มถัดไป'; await tapSel('#tutBox [data-tutnext]'); }
      else if (i === 1){ how = 'ลากจอย'; const j = await page.evaluate(() => { const e = el('joy'); if (!e || !e.offsetWidth) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
        if (j) await drag(j[0], j[1], 60, -10, 1500); else { const p = await page.evaluate(() => [P.x + 200, P.y]); await tapWorld(p[0], p[1]); await page.waitForTimeout(2000); } }
      else if (st.ev === 'kill'){ how = 'แตะมอนที่ลูกศรชี้';
        for (let k = 0; k < 40 && (await tutI()) === i; k++){ const m = await page.evaluate(() => { const m = typeof tutMob === 'function' ? tutMob() : null; return m && [m.x, m.y - 10]; });   // the monster the gold arrow shows
          const on = m && await page.evaluate(([x, y]) => { const a = sx(x), b = sy(y); return a > 40 && a < SW - 40 && b > 60 && b < SH - 60; }, m);
          if (on && k % 3 === 0) await tapWorld(m[0], m[1]); else if (touch) await tapSel('#mobaAct .mo.atk, #mobaAct [data-mo="atk"]'); else await page.keyboard.press('a'); await page.waitForTimeout(700); } }
      else if (st.ev === 'pickup'){ how = 'แตะของที่ตก';
        for (let k = 0; k < 20 && (await tutI()) === i; k++){ const l = await page.evaluate(() => { const l = nearestLoot(600); return l && [l.x, l.y - 4]; }); if (l) await tapWorld(l[0], l[1]); await page.waitForTimeout(900); } }
      else if (st.ev === 'potion'){ how = 'แตะช่องยา'; await page.evaluate(() => { S.hp = Math.max(1, Math.floor(DER.maxhp * .5)); }); for (let k = 0; k < 3 && (await tutI()) === i; k++){ await tapSel('#mobaPot, .hot.pot, [data-hot="6"]'); await page.waitForTimeout(600); } }
      else if (/data-win="stat"/.test(st.hl)){ how = 'เปิดเมนู → สถานะ → กด +';
        if (touch && await page.evaluate(() => RAIL.fold)) await tapSel('[data-h6="menu"], #railTog'); await page.waitForTimeout(300);
        if (!(await tapSel('.mb[data-win="stat"]'))) await page.evaluate(() => openWin('stat')); await page.waitForTimeout(600);
        await shot(`บทสอน: ${st.t} — หน้าต่าง`);
        const plus = await page.evaluate(() => { const b = [...document.querySelectorAll('#pane-stat button')].find(b => b.textContent.trim() === '+' && b.offsetWidth && !b.disabled); if (!b) return null; const r = b.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
        if (plus) await tap(plus[0], plus[1]); await page.waitForTimeout(400); await shot(`บทสอน: ${st.t} — กด + แล้ว`); await tapSel('[data-stpok]'); await page.waitForTimeout(400);
        await tapSel('#win-stat .wt [aria-label="ปิด"], #win-stat .wt .ibtn.wout'); await page.evaluate(() => { if (UIS.open.stat) closeWin('stat'); }); }
      else if (st.go){ how = 'กด «พาไป» แล้วคุยกับ NPC'; await tapSel('#tutBox [data-tutgo]'); for (let k = 0; k < 60 && (await tutI()) === i; k++){ await page.waitForTimeout(500);
          if (await page.evaluate(() => el('dialog') && !el('dialog').hidden)){ await shot(`บทสอน: ${st.t} — คุยกับ NPC`); await tapSel('#dialog .btn.gold, #dialog [data-take], #dialog [data-accept], #dialog .btn'); await page.waitForTimeout(800); } } }
      else if (/data-win="(world|quest)"/.test(st.hl)){ const w = st.hl.match(/data-win="(\w+)"/)[1]; how = `เปิดเมนู → ${w}`;
        if (touch && await page.evaluate(() => RAIL.fold)) await tapSel('[data-h6="menu"], #railTog'); await page.waitForTimeout(300); if (!(await tapSel(`.mb[data-win="${w}"]`))) how += ' (หาปุ่มไม่เจอ)'; await page.waitForTimeout(800); await shot(`บทสอน: ${st.t} — หน้าต่าง`);
        await page.evaluate(w => closeWin(w), w); }
      else if (st.arrow === 'npc'){ how = 'เดินไปคุยกับ NPC (แตะที่ตัว)'; const nn = await page.evaluate(() => { const id = (TUT[S.tut.i].npc) || 'job'; const n = NPCS.find(x => x.id === id) || NPCS.find(x => x.id === 'job'); return n && [n.x, n.y - 22]; });
        if (nn) await tapWorld(nn[0], nn[1]); for (let k = 0; k < 60 && (await tutI()) === i; k++){ await page.waitForTimeout(500);
          if (await page.evaluate(() => el('dialog') && !el('dialog').hidden)){ await shot(`บทสอน: ${st.t} — คุยกับ NPC`); await tapSel('#dialog [data-qaccept], #dialog .btn.gold, #dialog .btn'); await page.waitForTimeout(800); }
          else if (k % 10 === 9 && nn) await tapWorld(nn[0], nn[1]); } }
      const ok = await waitStep(i, st.next ? 5 : 60);
      await shot(`บทสอน ${i + 1}: ${st.t}`, `${how} · ${ok ? Math.round((Date.now() - s0) / 1000) + ' วิ' : '⚠ ไม่ผ่านใน 60 วิ'}`);
      if (!ok){ steps[steps.length - 1].bad = true; await page.evaluate(() => tutGo(S.tut.i + 1)); }
    }
    // a few minutes of play: Auto on the first quest
    await page.waitForTimeout(800); await shot('จบบทสอน', await page.evaluate(() => `Lv ${S.lvl} · เงิน ${S.bia} · ${S.tut && S.tut.done ? 'บทสอนจบ' : 'บทสอนยังไม่จบ'}`));
    await tapSel('#botChip, [data-h6="bot"], .botchip'); await page.waitForTimeout(400);
    if (!(await page.evaluate(() => typeof BOT !== 'undefined' && BOT.on))) await page.evaluate(() => setBot(true));
    for (let m = 1; m <= 6; m++){ await page.waitForTimeout(60000); await shot(`เล่น Auto นาทีที่ ${m}`, await page.evaluate(() => `Lv ${S.lvl} · แผนที่ ${nm(MAPS[MAP_ID])} · ฆ่า ${(S.stat && S.stat.kills) || '?'} · ${qState().active ? 'มีเควสต์' : 'ไม่มีเควสต์'} · ตาย ${(S.stat && S.stat.deaths) || 0}`)); }
  } catch (e) { await shot('หยุดเพราะ error', String(e.message).slice(0, 160)); steps[steps.length - 1].bad = true; }
  finally {
    let md = `# VAYRATHEN — ผู้เล่นใหม่ 10 นาทีแรก (tools/first-play.js)\n\nจอ ${VW0}×${VH0}${touch ? ' จอสัมผัส' : ''} · ใช้เวลาจริง ${Math.round((Date.now() - t0) / 60000)} นาที · error ${errors.length}\n\n| # | ขั้น | วินาทีที่ | หมายเหตุ |\n|---|---|---|---|\n`;
    for (const s of steps) md += `| ${s.n} | ${s.bad ? '⚠ ' : ''}${s.title} | ${s.sec} | ${s.note} |\n`;
    if (errors.length) md += `\n## Error\n\n${errors.slice(0, 10).map(e => '- ' + e.slice(0, 300)).join('\n')}\n`;
    fs.writeFileSync(path.join(ROOT, 'docs', 'FIRSTPLAY.md'), md);
    // contact sheet: 3 pictures a row with captions
    const imgs = steps.map(s => ({ ...s, b64: fs.readFileSync(path.join(OUT, s.f)).toString('base64') }));
    const sheet = await page.evaluate(async ([imgs, w]) => { const cw = w, ch = Math.round(w * innerHeight / innerWidth), cols = 3, cap = 44, c = document.createElement('canvas');
      c.width = cols * (cw + 12) + 12; c.height = Math.ceil(imgs.length / cols) * (ch + cap + 12) + 12; const g = c.getContext('2d'); g.fillStyle = '#1d1830'; g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < imgs.length; i++){ const im = new Image(); im.src = 'data:image/jpeg;base64,' + imgs[i].b64; await im.decode(); const x = 12 + (i % cols) * (cw + 12), y = 12 + Math.floor(i / cols) * (ch + cap + 12);
        g.drawImage(im, x, y, cw, ch); g.fillStyle = imgs[i].bad ? '#ff8a7a' : '#fff'; g.font = '600 15px sans-serif'; g.fillText(`${imgs[i].n}. ${imgs[i].title}`.slice(0, 48), x, y + ch + 18);
        g.fillStyle = '#c8bfe8'; g.font = '13px sans-serif'; g.fillText(String(imgs[i].note).slice(0, 62), x, y + ch + 36); }
      return c.toDataURL('image/jpeg', .8); }, [imgs, 420]);
    fs.writeFileSync(path.join(OUT, 'sheet.jpg'), Buffer.from(sheet.split(',')[1], 'base64'));
    console.log(`DONE ${steps.length} steps · ${steps.filter(s => s.bad).length} problems · errors ${errors.length} · ${path.join(OUT, 'sheet.jpg')}`);
    await close(); }
})();
