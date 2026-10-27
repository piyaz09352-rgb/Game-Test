/* VAYRATHEN — tests/authsec.test.js — account security (js/sys/authsec.js)
   Recent log-ins are recorded; the security panel changes the password (old one stops working), makes a recovery
   code that resets a forgotten password, and logs out other devices; a browser opened by another claude.ai account
   drops the first account's local copy and never syncs it. */
const test = require('node:test'), assert = require('node:assert');
const { chromium, openGame, enterWorld } = require('./browser');
const skip = !chromium && 'playwright not installed';

const errText = p => p.$eval('#secErr', e => e.textContent);
/* click and wait for the panel's answer (hashing takes a moment) */
async function tap(p, sel){ await p.evaluate(() => { const e = el('secErr'); if (e) e.textContent = ''; }); await p.click(sel); await p.waitForFunction(() => !el('secErr') || !!el('secErr').textContent || !el('confirm').classList.contains('secbox'), null, { timeout: 30000 }); }
test('security panel: history, change password, recovery code, log out others', { skip, timeout: 300000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Guard', 'sec_user');
    await page.evaluate(() => showTitle()); await page.waitForSelector('[data-secopen]');
    assert.ok(await page.evaluate(() => Array.isArray(ACC.lh) && ACC.lh.length >= 1 && !!ACC.lh[0].d), 'the log-in was recorded with its device');
    await page.click('[data-secopen]'); await page.waitForSelector('#confirm.secbox .secp');
    assert.ok(await page.$('.seclog li em'), 'this device is marked');
    // wrong current password
    await page.fill('#secCur', 'nope-123'); await page.fill('#secNew', 'better99x'); await page.fill('#secNew2', 'better99x');
    await tap(page, '[data-sec="pw"]'); assert.match(await errText(page), /ไม่ถูกต้อง|Wrong/);
    // weak new password
    await page.fill('#secCur', 'test-pass-1'); await page.fill('#secNew', 'abc12'); await page.fill('#secNew2', 'abc12');
    await tap(page, '[data-sec="pw"]'); assert.match(await errText(page), /อย่างน้อย 6|at least 6/);
    // change it
    const before = await page.evaluate(() => authTok());
    await page.fill('#secCur', 'test-pass-1'); await page.fill('#secNew', 'better99x'); await page.fill('#secNew2', 'better99x');
    await page.click('[data-sec="pw"]'); await page.waitForFunction(() => /เปลี่ยนรหัสผ่านแล้ว|Password changed/.test(el('secErr').textContent));
    assert.notStrictEqual(await page.evaluate(() => authTok()), before, 'old log-ins end'); assert.ok(await page.evaluate(() => authed()), 'this device stays logged in');
    // recovery code
    await page.fill('#secCur', 'better99x'); await page.click('[data-sec="rc"]'); await page.waitForSelector('.seccode b');
    const code = await page.$eval('.seccode b', e => e.textContent); assert.match(code, /^[A-Z0-9]{4}(-[A-Z0-9]{4}){3}$/);
    assert.ok(!(await page.evaluate(() => localStorage.getItem(ACCKEY))).includes(code.replace(/-/g, '')), 'the code is stored only as a hash');
    // log out other devices
    const sv = await page.evaluate(() => ACC.sv || 0);
    await page.fill('#secCur', 'better99x'); await page.click('[data-sec="out"]'); await page.waitForFunction(n => (ACC.sv || 0) === n + 1, sv);
    assert.ok(await page.evaluate(() => authed()), 'still logged in here');
    await page.click('[data-sec="close"]');
    // forgot password → recovery code
    await page.evaluate(() => authLogout()); await page.waitForSelector('#auBox');
    await page.click('#auBox [data-auforgot]'); await page.waitForSelector('#recCode');
    await page.fill('#recId', 'sec_user'); await page.fill('#recCode', 'AAAA-BBBB-CCCC-DDDD'); await page.fill('#recPw', 'newpass77'); await page.fill('#recPw2', 'newpass77');
    await tap(page, '[data-rec="go"]'); assert.match(await errText(page), /รหัสกู้คืนไม่ถูกต้อง|recovery code/);
    await page.fill('#recCode', code.toLowerCase()); await page.click('[data-rec="go"]');
    await page.waitForSelector('[data-make], [data-play], .accbar', { timeout: 30000 });
    assert.deepStrictEqual(await page.evaluate(() => ({ n: ACC.name, a: authed(), rc: !!ACC.rc })), { n: 'sec_user', a: true, rc: false }, 'reset with the code, logged in, code used up');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

test('another claude.ai account on the same browser never gets the first account\'s copy', { skip, timeout: 120000 }, async () => {
  const { page, errors, close } = await openGame();
  try {
    await enterWorld(page, 'Owner', 'own_acc');
    const r = await page.evaluate(() => {
      localStorage.setItem(AUTH.owner, 'someone-else'); SEC.uid = ''; SEC.fresh = false;
      const real = NET.uid; NET.uid = 'intruder'; secOwner(); const out = { name: ACC.name, authed: authed(), slot: !!localStorage.getItem(slotKey(0)), owner: localStorage.getItem(AUTH.owner), ok: secCloudOk() };
      NET.uid = real; return out; });
    assert.deepStrictEqual(r, { name: '', authed: false, slot: false, owner: 'intruder', ok: true }, 'local copy cleared, owner changed');
    const blocked = await page.evaluate(() => { SEC.uid = 'a'; const real = NET.uid; NET.uid = 'b'; const ok = secCloudOk(); NET.uid = real; return ok; });
    assert.strictEqual(blocked, false, 'no cloud writes until the owner check has run');
  } finally { await close(); }
  assert.deepStrictEqual(errors, [], 'no runtime errors');
});

/* forgot password online (the Claude sign-in proves it) moved to tests/recover.test.js with the v93 in-panel reset */
