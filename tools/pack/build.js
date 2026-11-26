/* VAYRATHEN — tools/pack/build.js — (v347) the upload pack, quicker to load
   (v348) MINI=1 also shortens names inside functions (esbuild never renames a script's top-level names): measured only
   4% smaller, so it is off by default.
   The game is ~460 script files and ~22 style sheets. A phone on 3G spent most of its wait (tools/load-time.js) asking for
   them one by one. The pack joins them into a few files and drops the comments and spaces (the code itself is not
   renamed or changed), so the browser fetches ~20 files instead of ~500. The source stays as it is: this only builds
   the zip.
   Joining script files is safe only when it changes nothing about how they run. Separate <script> files share the page's
   globals, but inside ONE file every top-level function is hoisted and every const/let/class exists (uninitialised) from
   the start. So a bundle is cut before a file whenever:
   · the file declares at top level a name (function, const, let, class) that an earlier file of the same bundle mentions
     anywhere — that earlier code might ask `typeof name` or call it at load time, and would now see something else;
   · the file's strict mode differs from the bundle's ('use strict' at the start of a bundle covers all of it);
   · an inline <script> sits between them (it stays where it is, between the bundles).
   Styles are joined in their page order (they live in css/, so their relative url()s still point to the same files).
   Every bundle is checked by parsing it again; the pack then is index.html (pointing at the bundles) + _headers + assets
   audio css js, with the bundles in js/pk/ and css/pk/ (the original files stay in the pack too).
   Usage:  npm run pack   (= cd tools/pack && npm install && node build.js)   → updates/VAYRATHEN-vNNN-full.zip
           OUT_DIR=dir    also leaves the unpacked site there (the tests run against it: VAY_ROOT=dir npm run test:fast) */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execSync } = require('child_process');
const acorn = require('acorn'), walk = require('acorn-walk'), esbuild = require('esbuild');
const ROOT = path.resolve(__dirname, '..', '..');
const html0 = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const ver = (fs.readFileSync(path.join(ROOT, 'js/sys/changelog272.js'), 'utf8').match(/WN\.ver = 'v(\d+)'/) || [])[1];
if (!ver) throw new Error('no version (WN.ver) in js/sys/changelog272.js');
/* the game reads its own version as the highest ?v= among its scripts (js/sys/newver.js: saves, «new version» notices,
   old-version ghosts) — every bundle carries that same number */
const GAMEV = Math.max(...[...html0.matchAll(/<script src="js\/[^"?]+\?v=(\d+)"/g)].map(m => +m[1]));
const STAGE = process.env.OUT_DIR ? path.resolve(process.env.OUT_DIR) : fs.mkdtempSync(path.join(require('os').tmpdir(), 'vaypack-'));

/* ---------- what each script declares and mentions ---------- */
function info(src, file){
  const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true });
  const strict = ast.body.length && ast.body[0].type === 'ExpressionStatement' && ast.body[0].directive === 'use strict';
  const decl = new Set(), uses = new Set();
  for (const n of ast.body){
    if (n.type === 'FunctionDeclaration' && n.id) decl.add(n.id.name);
    else if (n.type === 'ClassDeclaration' && n.id) decl.add(n.id.name);
    else if (n.type === 'VariableDeclaration' && n.kind !== 'var') for (const d of n.declarations) walk.simple(d.id, { Identifier: i => decl.add(i.name) }, { ...walk.base, Pattern: walk.base.Pattern });
  }
  walk.full(ast, (node, st, type) => { if (type === 'Identifier' || node.type === 'Identifier') uses.add(node.name); });
  return { strict, decl, uses };
}

/* ---------- the scripts and styles in page order ---------- */
const parts = [];   // {kind:'js'|'inline'|'css'|'html', ...}
const re = /<script src="(js\/[^"?]+)(?:\?v=\d+)?"><\/script>|<script>[\s\S]*?<\/script>|<link rel="stylesheet" href="(css\/[^"?]+)(?:\?v=\d+)?">/g;
let last = 0, m;
while ((m = re.exec(html0))){
  if (m.index > last) parts.push({ kind: 'html', text: html0.slice(last, m.index) });
  if (m[1]) parts.push({ kind: 'js', file: m[1] }); else if (m[2]) parts.push({ kind: 'css', file: m[2] }); else parts.push({ kind: 'inline', text: m[0] });
  last = re.lastIndex;
}
parts.push({ kind: 'html', text: html0.slice(last) });

/* ---------- bundles ---------- */
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const jsGroups = [];   // [{files:[], strict, uses:Set, at:index in parts}]
let cur = null, why = {};
const cut = r => { cur = null; why[r] = (why[r] || 0) + 1; };
for (let i = 0; i < parts.length; i++){ const p = parts[i];
  if (p.kind === 'inline'){ cut('inline'); continue; }
  if (p.kind === 'html' && p.text.trim()){ cut('html between'); continue; }
  if (p.kind !== 'js') continue;
  const src = fs.readFileSync(path.join(ROOT, p.file), 'utf8'), inf = info(src, p.file);
  if (cur && cur.strict !== inf.strict) cut('strict mode');
  if (cur && [...inf.decl].some(n => cur.uses.has(n))) cut('name mentioned earlier');
  if (!cur){ cur = { files: [], strict: inf.strict, uses: new Set(), decl: new Set(), at: i }; jsGroups.push(cur); }
  cur.files.push({ file: p.file, src }); for (const u of inf.uses) cur.uses.add(u); for (const d of inf.decl) cur.decl.add(d); p.group = cur;
}
const cssGroups = []; { let g = null;
  for (const p of parts){ if (p.kind === 'css'){ if (!g){ g = { files: [] }; cssGroups.push(g); } g.files.push(p.file); p.cgroup = g; }
    else if (p.kind !== 'html' || p.text.trim()) g = null; } }

(async () => {
  // copy the site
  fs.rmSync(STAGE, { recursive: true, force: true }); fs.mkdirSync(STAGE, { recursive: true });
  for (const d of ['_headers', 'assets', 'audio', 'css', 'js']) fs.cpSync(path.join(ROOT, d), path.join(STAGE, d), { recursive: true });
  fs.mkdirSync(path.join(STAGE, 'js/pk'), { recursive: true }); fs.mkdirSync(path.join(STAGE, 'css/pk'), { recursive: true });
  let bytes0 = 0, bytes1 = 0;
  for (const g of jsGroups){
    const outs = [];
    for (const f of g.files){ bytes0 += Buffer.byteLength(f.src);
      const r = await esbuild.transform(f.src, { loader: 'js', minifyWhitespace: true, minifySyntax: process.env.MINI === '1', minifyIdentifiers: process.env.MINI === '1', legalComments: 'none', charset: 'utf8', target: 'esnext', sourcefile: f.file });   // (v348) MINI=1 also shortens names inside functions: only 4% smaller, so off by default
      let code = r.code.trim();
      // the bundle's own directive covers it; a strict file's directive inside a bundle would be a plain string
      if (g.strict) code = code.replace(/^(["'])use strict\1;?/, '');
      outs.push(`/* ${f.file} */\n${code}`); }
    let text = (g.strict ? '"use strict";\n' : '') + outs.join('\n;\n') + '\n';
    try { acorn.parse(text, { ecmaVersion: 'latest', sourceType: 'script' }); } catch (e) { throw new Error(`bundle of ${g.files[0].file}… does not parse: ${e.message}`); }
    const again = info(text); if (again.strict !== g.strict) throw new Error('strict mode changed in the bundle of ' + g.files[0].file);
    g.name = `js/pk/b${String(jsGroups.indexOf(g)).padStart(2, '0')}-${hash(text)}.js`; fs.writeFileSync(path.join(STAGE, g.name), text); bytes1 += Buffer.byteLength(text);
  }
  for (const g of cssGroups){ let text = '';
    for (const f of g.files){ const src = fs.readFileSync(path.join(ROOT, f), 'utf8'); bytes0 += Buffer.byteLength(src);
      const r = await esbuild.transform(src, { loader: 'css', minifyWhitespace: true, legalComments: 'none', charset: 'utf8', sourcefile: f });
      // css/pk/ is one folder deeper: url(...) relative to css/ move up one more
      text += `/* ${f} */\n` + r.code.replace(/url\((['"]?)(?!data:|https?:|\/)([^'")]+)\1\)/g, (s, q, u) => `url(${q}../${u}${q})`) + '\n'; }
    g.name = `css/pk/s${String(cssGroups.indexOf(g)).padStart(2, '0')}-${hash(text)}.css`; fs.writeFileSync(path.join(STAGE, g.name), text); bytes1 += Buffer.byteLength(text); }
  // the page
  let html = ''; const done = new Set();
  for (const p of parts){
    if (p.kind === 'html' || p.kind === 'inline') html += p.text;
    else if (p.kind === 'js'){ if (!done.has(p.group)){ done.add(p.group); html += `<script src="${p.group.name}?v=${GAMEV}"></script>`; } }
    else if (p.kind === 'css'){ if (!done.has(p.cgroup)){ done.add(p.cgroup); html += `<link rel="stylesheet" href="${p.cgroup.name}?v=${GAMEV}">`; } } }
  html = html.replace(/\n{2,}/g, '\n');
  fs.writeFileSync(path.join(STAGE, 'index.html'), html);
  const nJs = parts.filter(p => p.kind === 'js').length, nCss = parts.filter(p => p.kind === 'css').length;
  console.log(`v${ver} (GAMEV ${GAMEV}): ${nJs} scripts → ${jsGroups.length} bundles · ${nCss} styles → ${cssGroups.length} · code ${(bytes0 / 1e6).toFixed(2)} MB → ${(bytes1 / 1e6).toFixed(2)} MB · cuts: ${JSON.stringify(why)}`);
  // the zip
  const zip = path.join(ROOT, 'updates', `VAYRATHEN-v${ver}-full.zip`); fs.mkdirSync(path.dirname(zip), { recursive: true }); fs.rmSync(zip, { force: true });
  if (process.env.NO_ZIP !== '1'){ execSync(`zip -qr "${zip}" index.html _headers assets audio css js`, { cwd: STAGE }); console.log('pack:', zip, (fs.statSync(zip).size / 1e6).toFixed(1) + ' MB'); }
  console.log('site:', STAGE);
})().catch(e => { console.error(e.message); process.exit(1); });
