import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 5174;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

async function listModels() {
  const dir = path.join(root, 'models');
  const names = await fs.readdir(dir);
  const out = [];
  for (const file of names) {
    if (!file.endsWith('.js') || file.startsWith('_')) continue;
    const st = await fs.stat(path.join(dir, file));
    out.push({ file, id: file.slice(0, -3), mtime: Math.round(st.mtimeMs) });
  }
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/models') {
      res.writeHead(200, { 'Content-Type': types['.json'], 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(await listModels()));
      return;
    }
    let rel = decodeURIComponent(url.pathname);
    if (rel === '/') rel = '/index.html';
    const file = path.normalize(path.join(root, rel));
    if (!file.startsWith(root + path.sep) && file !== root) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    const data = await fs.readFile(file);
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    res.end(data);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500).end(e.code === 'ENOENT' ? 'Not found' : String(e));
  }
});

server.listen(port, () => console.log(`Modeler running at http://localhost:${port}`));
