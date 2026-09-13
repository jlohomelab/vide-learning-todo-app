const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT            = 3000;
const JSON_PATH       = path.join(__dirname, 'tasks.json');
const CSV_PATH        = path.join(__dirname, 'tasks.csv');  // legacy, migration only
const CATEGORIES_PATH = path.join(__dirname, 'categories.json');
const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Shopping'];

// ── One-time CSV → JSON migration ────────────────────────────────────────────
function migrateCsvIfNeeded() {
  if (fs.existsSync(JSON_PATH) || !fs.existsSync(CSV_PATH)) return;
  console.log('Migrating tasks.csv → tasks.json…');
  const tasks = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  fs.writeFileSync(JSON_PATH, JSON.stringify(tasks, null, 2), 'utf8');
  console.log(`Migrated ${tasks.length} task(s).`);
}

// ── Legacy CSV parser (migration only) ───────────────────────────────────────
function parseCsv(text) {
  const out   = [];
  const lines = text.trim().split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const m5 = line.match(/^(\d+),"((?:[^"]|"")*)",(true|false),"([^"]*)","([^"]*)"/);
    if (m5) {
      out.push({ id: parseInt(m5[1]), text: m5[2].replace(/""/g, '"'), done: m5[3] === 'true', priority: m5[4] || '', category: m5[5] || '' });
      continue;
    }
    const m3 = line.match(/^(\d+),"((?:[^"]|"")*)",(true|false)$/);
    if (m3) {
      out.push({ id: parseInt(m3[1]), text: m3[2].replace(/""/g, '"'), done: m3[3] === 'true', priority: '', category: '' });
    }
  }
  return out;
}

// ── Task helpers ─────────────────────────────────────────────────────────────
function readTasks() {
  if (!fs.existsSync(JSON_PATH)) return [];
  try {
    const content = fs.readFileSync(JSON_PATH, 'utf8').trim();
    if (!content) return [];
    return JSON.parse(content);
  } catch {
    console.warn('tasks.json is corrupt or empty — resetting to []');
    fs.writeFileSync(JSON_PATH, '[]', 'utf8');
    return [];
  }
}

function writeTasks(tasks) {
  fs.writeFileSync(JSON_PATH, JSON.stringify(tasks, null, 2), 'utf8');
}

// ── Category helpers ─────────────────────────────────────────────────────────
function readCategories() {
  if (!fs.existsSync(CATEGORIES_PATH))
    fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(DEFAULT_CATEGORIES), 'utf8');
  return JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
}

function writeCategories(cats) {
  fs.writeFileSync(CATEGORIES_PATH, JSON.stringify(cats), 'utf8');
}

// ── Startup ───────────────────────────────────────────────────────────────────
migrateCsvIfNeeded();

// ── HTTP server ──────────────────────────────────────────────────────────────
http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    return;
  }

  if (req.method === 'GET' && url === '/api/tasks') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readTasks()));
    return;
  }

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

  if (req.method === 'GET' && url === '/api/categories') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(readCategories()));
    return;
  }

  if (req.method === 'POST' && url === '/api/categories') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { name } = JSON.parse(body);
        const trimmed = String(name || '').trim();
        if (!trimmed) { res.writeHead(400); res.end('Bad request'); return; }
        const cats = readCategories();
        if (!cats.includes(trimmed)) {
          cats.push(trimmed);
          writeCategories(cats);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(cats));
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
  console.log(`Tasks stored in:      ${JSON_PATH}`);
  console.log(`Categories stored in: ${CATEGORIES_PATH}`);
});
