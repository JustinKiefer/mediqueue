# MediQueue — Micro-Clinic Patient Queue Viewer

A simple, static, full front-end information system for a small clinic's
patient queue. Built for **IPT102 — Final Group Project (Track B: Static
Tool Deployment)**.

## Live Demo
*(Replace with your deployed GitHub Pages URL after Step 3 below)*

```
https://<your-github-username>.github.io/<your-repo-name>/
```

## Project Structure

```
mediqueue/
├── index.html          Main HTML shell — links CSS/JS, contains all 3 views
├── css/
│   └── style.css        All styles, theme variables, responsive rules
├── js/
│   ├── storage.js        Data layer — localStorage get/set, JSON serialization, history archive
│   ├── api.js            Simulated async "API" — network delay wrapper, fetchQueueData()
│   ├── ui.js              Shared UI — toasts, error banner, custom confirm modal, audit panel
│   ├── public.js          Public "Queue Display" tab — render + 10s auto-refresh
│   ├── admin.js           Admin dashboard — login, Call Next, add/remove patient, End Day/Archive
│   ├── history.js         "History" tab — archived sessions, expand/collapse, clear history
│   └── main.js            Entry point — tab switching + app bootstrap
└── README.md
```

## Features

- **Queue Display (public)** — live "Now Serving" number, stats (waiting,
  served, priority, total), and a full queue table that auto-refreshes
  every 10 seconds.
- **Admin Dashboard (secure)** — login-gated (demo credentials:
  `admin` / `clinic2026`), with:
  - "Call Next Patient" — marks the current patient done and promotes the
    next waiting patient (priority patients first)
  - Register new patient form (HTML5 Constraint Validation API)
  - Remove a waiting patient
  - "End Day & Archive" — archives today's full patient list to History,
    then clears the queue for a fresh day
- **History** — browse archived sessions by date, expand each to see every
  patient's record (name, service, status, time), and clear history if
  needed.
- **Data persistence** — entirely via the browser's `localStorage`
  (`JSON.stringify` / `JSON.parse`), no backend or database required.
- **Async simulation** — all "API calls" go through `simulateNetworkDelay()`
  and `async/await`, with loading spinners and disabled buttons during
  in-flight operations.
- **Error handling** — a graceful fallback banner appears if queue data
  can't be loaded/parsed.
- **Responsive** — Bootstrap 5 mobile-first grid; the queue table collapses
  into stacked cards on phones.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript (ES6+, `async`/`await`)
- [Bootstrap 5.3.3](https://getbootstrap.com/) (via CDN)
- [Tabler Icons](https://tabler.io/icons) (via CDN)
- Browser `localStorage` (Web Storage API) for all data persistence

## Local Testing

Because the app uses `fetch`-style modules loaded via `<script src="...">`
and relative paths, open it through a local server (not `file://`) to avoid
CORS/path issues:

```bash
# Option 1: Python
python3 -m http.server 8000

# Option 2: Node (npx)
npx serve .
```

Then visit `http://localhost:8000`.

## Deployment — GitHub Pages

1. **Create a public repository** on GitHub (e.g. `mediqueue`).
2. **Push this project** to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MediQueue Track B static deployment"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - Go to your repository → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to `Deploy from a branch`
   - Set **Branch** to `main` and folder to `/ (root)`
   - Click **Save**
4. Wait 1–2 minutes, then refresh the Pages settings — a green banner will
   show your live URL:
   ```
   https://<your-username>.github.io/<your-repo>/
   ```
5. Visit the URL to confirm the app loads, the queue auto-refreshes, and
   the Admin tab login works (`admin` / `clinic2026`).

## AI Utilization Statement

*(Fill this in for your final documentation per Section VI.3 of the
project guidelines — list which AI tools were used, what for, and include
the signed verification/ownership statement.)*

## License

Created for academic purposes — Ilocos Sur Community College, IT Program,
IPT102 Final Group Project.
