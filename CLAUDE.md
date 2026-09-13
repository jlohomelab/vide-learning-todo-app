# Vide Learning — Project Overview

## Purpose

A learning project for exploring web development fundamentals and Claude Code workflows. A simple todo list app with a Node.js backend that persists tasks to a CSV file.

## Project Structure

```
vide-learning/
├── CLAUDE.md       # This file
├── index.html      # Todo list UI (served by the backend)
├── server.js       # Node.js HTTP server
└── tasks.csv       # Persistent task storage (auto-created on first run)
```

## Starting the Server

```bash
node server.js
```

Then open **http://localhost:3000** in a browser.

- Port: **3000** (hardcoded in `server.js` line 4: `const PORT = 3000;`)
- No `npm install` needed — uses Node.js built-in modules only (`http`, `fs`, `path`)
- The server must be running for the app to load or save tasks; opening `index.html` directly will not work

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serves `index.html` |
| `GET` | `/api/tasks` | Returns all tasks as a JSON array |
| `POST` | `/api/tasks` | Receives a JSON array and overwrites `tasks.csv` |

## tasks.csv Structure

The file is created automatically in the project root on the first task save.

```
id,text,done
1726123456789,"Buy groceries",false
1726123456000,"Call dentist",true
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | integer | Unix timestamp in milliseconds (used as unique ID) |
| `text` | string | Task text, always double-quoted; inner `"` are escaped as `""` |
| `done` | boolean | `true` if completed, `false` if active |

- First row is always the header `id,text,done`
- Rows are ordered newest-first (most recently added at the top)
- Editing the file manually works — restart is not required, changes are read on the next page load

## Tech Stack

- Vanilla HTML, CSS, JavaScript — no frameworks or build tools
- Node.js built-in modules only — no external dependencies
- Palo Alto Networks corporate color palette (`#003087` blue, `#FA582D` orange)
