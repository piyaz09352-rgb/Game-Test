/* VAYRATHEN — tests/mail.test.js — (v103) mail between two players, and the weekly tower prize arriving by mail */
'use strict';
const test = require('node:test'), assert = require('node:assert');
const { chromium, enterWorld, signIn, openPlayers } = require('./browser');
/* with the shared database a hero may already wait in the slot: play it, or make one */
async function enter(pg, name, acc){
  await signIn(pg, acc); await pg.waitForSelector('[data-make], [data-play]', { timeout: 30000, polling: 250 });
  if (await pg.$('[data-play]')) await pg.click('[data-play]');
  else { await pg.click('[data-make]'); await pg.waitForSelector('[data-mkgo]'); await pg.fill('#mkName', name); await pg.click('[data-mkgo]'); }
  await pg.waitForFunction(() => !PAUSED && document.getElementById('title').hidden, null, { timeout: 30000, polling: 250 });
  await pg.evaluate(n => { S.name = n; }, name);
}
const skip = !chromium && 'playwright not installed (run npm install)';

test('mail: Bia and an item reach an offline-style inbox, taken once; weekly tower prize comes by mail', { skip, timeout: 240000 }, async () => {
  const { players, close } = await openPlayers(2, { db: true });
  try {
    const [a, b] = players.map(p => p.page);
    for (const [i, pg] of [a, b].entries()){
      await enter(pg, 'Mailer' + i, 'mailacc' + i);
      await pg.evaluate(() => { S.bia = 50000; S.inv.redpot = 20; derive(); });
      await pg.waitForFunction(() => mlOk(), null, { timeout: 30000, polling: 250 });
    }
    const ub = await b.evaluate(() => NET.uid);

    // a writes to b through the window: pick b, subject, 10,000 Bia and 5 potions
    await a.evaluate(u => { const c = el('confirm'); if (c) c.hidden = true; mlCompose(u, 'Mailer1'); }, ub);
    await a.fill('#pane-mail [data-mlf="s"]', 'Hello');
    await a.fill('#pane-mail [data-mlf="m"]', 'For you <b>!</b>');
    await a.fill('#pane-mail [data-mlf="z"]', '10000');
    await a.selectOption('#pane-mail [data-mlf="item"]', 'redpot');
    await a.fill('#pane-mail [data-mlf="n"]', '5');
    await a.click('#pane-mail [data-mlsend]');
    await a.waitForFunction(() => !ML.busy && S.inv.redpot === 15, null, { timeout: 15000, polling: 250 });
    const fee = 100 + 200 + 100;
    assert.strictEqual(await a.evaluate(() => S.bia), 50000 - 10000 - fee, 'Bia and postage are paid');

    // b's box hears it, the menu shows the unread dot, the message is text (not markup)
    await b.waitForFunction(() => ML.rows.length === 1, null, { timeout: 15000, polling: 250 });
    assert.strictEqual(await b.evaluate(() => mlUnread()), 1);
    await b.evaluate(() => { const c = el('confirm'); if (c) c.hidden = true; openWin('mail'); });   // any first-visit prompt out of the way
    const id = await b.evaluate(() => ML.rows[0].id);
    await b.click(`#pane-mail [data-mlopen="${id}"]`);
    assert.ok(await b.evaluate(() => /For you <b>!<\/b>/.test(el('pane-mail').querySelector('.mlm').textContent)), 'the message shows as plain text');
    await b.click(`#pane-mail [data-mltake="${id}"]`);
    await b.waitForFunction(() => S.inv.redpot === 25 && S.bia === 60000, null, { timeout: 15000, polling: 250 });
    // taking twice gives nothing more
    assert.strictEqual(await b.evaluate(i => mlTake(i, true), id), false, 'an attachment is taken once');
    assert.strictEqual(await b.evaluate(() => S.bia), 60000);
    assert.strictEqual(await b.evaluate(() => mlUnread()), 0, 'reading clears the dot');

    // coins in a letter from someone else are ignored
    const c0 = await b.evaluate(() => ACC.coins || 0);
    await a.evaluate(async u => { await NET.db.doc('mail/fake1').set({to:u, tn:'x', from:NET.uid, fn:'ระบบวายรา', s:'free coins', m:'', z:0, i:null, n:0, x:null, c:500, at:Date.now(), sys:1, rd:0, taken:false}); }, ub);
    await b.waitForFunction(() => ML.rows.some(r => r.id === 'fake1'), null, { timeout: 15000, polling: 250 });
    await b.evaluate(() => mlTake('fake1', true));
    assert.strictEqual(await b.evaluate(() => ACC.coins || 0), c0, 'nobody can mail coins');

    // weekly tower: last week's board has a at floor 30 and b at floor 12 → a ranks 1st and gets the prize by mail
    const ua = await a.evaluate(() => NET.uid);
    await a.evaluate(async ([ua, ub]) => { const pw = twkWeek() - 1;
      await NET.db.doc(`towerwk/${pw}_${ua}`).set({w:pw, uid:ua, f:30, name:'Mailer0', job:S.job, lvl:S.lvl, at:1});
      await NET.db.doc(`towerwk/${pw}_${ub}`).set({w:pw, uid:ub, f:12, name:'Mailer1', job:S.job, lvl:S.lvl, at:2});
      S.twkPaid = 0; }, [ua, ub]);
    await a.evaluate(() => twkPay());
    await a.waitForFunction(() => ML.rows.some(r => r.sys && r.c === 30), null, { timeout: 15000, polling: 250 });
    const ca = await a.evaluate(() => ACC.coins || 0), za = await a.evaluate(() => S.bia);   // (the titles' own coins came with the pay-out)
    const pid = await a.evaluate(() => ML.rows.find(r => r.sys).id);
    await a.evaluate(i => mlTake(i, true), pid);
    assert.strictEqual(await a.evaluate(() => ACC.coins || 0), ca + 30, 'rank 1: ◈30');
    assert.strictEqual(await a.evaluate(() => S.bia), za + 30 * 1500 * 3, 'rank 1: floor × 4,500 Bia');
    assert.ok(await a.evaluate(() => !!(S.ach && S.ach.twtop1 && S.ach.twtop10)), 'rank 1 unlocks both titles');
    // paid once
    await a.evaluate(() => twkPay()); await a.waitForTimeout(800);
    assert.strictEqual(await a.evaluate(() => ML.rows.filter(r => r.sys).length), 1, 'the prize is mailed once');

    // this week: a run that clears floors publishes the weekly row and the window shows it
    await a.evaluate(async () => { const k = twkMine(); k.f = 7; k.pub = 0; await twkPublish(); TWK.view = 'week'; openWin('tower'); await twkLoad(true); });
    await a.waitForFunction(() => /Mailer0/.test(el('pane-tower').textContent) && /7/.test(el('pane-tower').querySelector('.twrank').textContent), null, { timeout: 15000, polling: 250 });
    await a.click('#pane-tower [data-twkv="all"]');
    assert.ok(await a.evaluate(() => !el('pane-tower').querySelector('.twkme')), 'the all-time board has no weekly line');
  } finally { await close(); }
  const errs = players.flatMap(p => p.errors);
  assert.deepStrictEqual(errs, [], 'no runtime errors');
});
