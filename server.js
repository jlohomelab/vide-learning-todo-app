const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT     = 3000;
const CSV_PATH = path.join(__dirname, 'tasks.csv');

// ── CSV helpers ──────────────────────────────────────────────────────────────
function toCsv(tasks) {
  const lines = ['id,text,done'];
  for (const t of tasks) {
    lines.push(`${t.id},"${String(t.text).replace(/"/g, '""')}",${t.done}`);
  }
  return lines.join('\n');
}

function parseCsv(text) {
  const out = [];
  const lines = text.trim().split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].trim().match(/^(\d+),"((?:[^"]|"")*)",(true|false)$/);
    if (m) out.push({ id: parseInt(m[1]), text: m[2].replace(/""/g, '"'), done: m[3] === 'true' });
  }
  return out;
}

function readTasks() {
  if (!fs.existsSync(CSV_PATH)) return [];
  return parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
}

function writeTasks(tasks) {
  fs.writeFileSync(CSV_PATH, toCsv(tasks), 'utf8');
}

// ── HTTP server ──────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // Serve the app
  if (req.method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  // GET /api/tasks → return tasks as JSON
  if (req.method === 'GET' && url === '/api/tasks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readTasks()));
    return;
  }

  // POST /api/tasks → save tasks, respond { ok: true }
  if (req.method === 'POST' && url === '/api/tasks') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        writeTasks(JSON.parse(body));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400);
        res.end('Bad request');
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');

}).listen(PORT, () => {
  console.log(`Task server → http://localhost:${PORT}`);
  console.log(`Tasks stored in: ${CSV_PATH}`);
});
