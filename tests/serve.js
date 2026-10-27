/* VAYRATHEN — tests/serve.js — a tiny static file server for the browser tests (no dependencies) */
'use strict';
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg' };

function serve(port = 0){
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)){ res.writeHead(403); return res.end(); }
    fs.readFile(f, (err, buf) => {
      if (err){ res.writeHead(404); return res.end('not found'); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      // the live site is on season 2 (login rebuilt); the suite's baseline is season 1 so gm.test.js can raise it to 2 itself
      if (f.endsWith(path.join('js', 'net', 'firebase-config.js'))) buf = Buffer.from(String(buf).replace('RESET_SEASON = 2;', 'RESET_SEASON = 1;'));
      res.end(buf);
    });
  });
  return new Promise(ok => srv.listen(port, '127.0.0.1', () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}/` })));
}
module.exports = { serve, ROOT };
if (require.main === module) serve(+process.argv[2] || 8080).then(({ url }) => console.log('VAYRATHEN at', url));
