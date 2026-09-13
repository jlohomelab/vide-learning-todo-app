# Vide Learning — Project Overview

## Purpose

A learning project for exploring web development fundamentals and Claude Code workflows. A todo list app with a Node.js backend and persistent CSV storage.

## Project Structure

```
vide-learning/
├── CLAUDE.md           # This file
├── index.html          # Todo list UI (served by the backend)
├── server.js           # Node.js HTTP server
├── tasks.json          # Persistent task storage (auto-created on first run, git-ignored)
└── categories.json     # Persistent category list (auto-created on first run)
```

## Starting the Server

```bash
node server.js
```

Then open **http://localhost:3000** in a browser.

- Port: **3000** (hardcoded in `server.js`)
- No `npm install` needed — uses Node.js built-in modules only (`http`, `fs`, `path`)
- The server must be running for the app to load or save tasks; opening `index.html` directly will not work

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Serves `index.html` |
| `GET` | `/api/tasks` | Returns all tasks as a JSON array |
| `POST` | `/api/tasks` | Receives a JSON array and overwrites `tasks.csv` |
| `GET` | `/api/categories` | Returns all category names as a JSON array |
| `POST` | `/api/categories` | Receives `{ name: String }`, appends if new, returns updated array |

## tasks.json Structure

The file is created automatically in the project root on the first task save.

```json
[
  { "id": 1726123456789, "text": "Buy groceries", "done": false, "priority": "high", "category": "Work" },
  { "id": 1726123456000, "text": "Call dentist",  "done": true,  "priority": "",     "category": "" }
]
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unix timestamp in milliseconds (used as unique ID) |
| `text` | string | Task text |
| `done` | boolean | `true` if completed, `false` if active |
| `priority` | string | `"high"`, `"medium"`, `"low"`, or `""` |
| `category` | string | Any text label, or `""` if unset |

- Array order reflects the user-defined sequence (drag-and-drop reorderable)
- Editing the file manually works — restart is not required, changes are read on the next page load
- **Migration**: if a legacy `tasks.csv` exists and `tasks.json` does not, the server automatically migrates the data on first start

## categories.json Structure

A flat JSON array of category name strings, stored server-side so all browsers and computers see the same list.

```json
["Work", "Personal", "Shopping", "Finance"]
```

- Created automatically with `["Work", "Personal", "Shopping"]` defaults on first run
- New categories are appended when a user types one in the UI; they persist permanently on the server

## Features

- **Add / complete / delete tasks** — changes save to `tasks.csv` immediately
- **Priority badges** — assign High / Medium / Low at creation or click the badge on any task to cycle through priorities; color-coded (red / amber / green)
- **Category tags** — assign a category at creation or click a tag on any task to edit inline; custom categories saved server-side and shared across all browsers
- **Drag-and-drop reordering** — hover a task to reveal the `⠿` grip handle, then drag to any position
- **Filter tabs** — All / Active / Done (status); All Priorities / High / Medium / Low (priority); per-category chips rendered dynamically
- **Clear completed** — removes all done tasks in one click
- **Dark / light mode** — toggle in the top-right of the nav bar; preference saved to `localStorage`
- **Language switching** — EN / 中文 toggle; supports English and Traditional Chinese; preference saved to `localStorage`

## Tech Stack

- Vanilla HTML, CSS, JavaScript — no frameworks or build tools
- Node.js built-in modules only — no external dependencies
- Navy (`#003087`) and orange (`#FA582D`) color palette with CSS custom properties for theming

## Git Branches

| Branch | Description |
|--------|-------------|
| `master` | Main branch — stable, all features merged |
| `feature/sequence` | Task reordering feature (merged into master) |
