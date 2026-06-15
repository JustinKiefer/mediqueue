/* ════════════════════════════════════════════════════════
   storage.js
   Data persistence layer using the browser's Web Storage API
   (localStorage). Handles JSON serialization/deserialization
   for both the active queue and the archived history.
   ════════════════════════════════════════════════════════ */

const STORE_KEY   = 'mediqueue_data';
const HISTORY_KEY = 'mediqueue_history';

/**
 * Load the active queue/session data from localStorage.
 * Falls back to a default seeded dataset if nothing is stored
 * or if the stored JSON is corrupted.
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw);
  } catch (e) {
    showError('Data parse error: falling back to defaults. (' + e.message + ')');
    return getDefaultData();
  }
}

/**
 * Persist the active queue/session data to localStorage.
 */
function saveData(data) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    showError('Failed to save: ' + e.message);
    return false;
  }
}

/**
 * Load the archived session history (array, newest first).
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Persist the archived session history array.
 */
function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    showError('Failed to save history: ' + e.message);
    return false;
  }
}

/**
 * Default seeded dataset, used on first run.
 */
function getDefaultData() {
  const today = new Date().toLocaleDateString('en-PH');
  return {
    date: today,
    currentServing: 1,
    adminLoggedIn: false,
    nextId: 6,
    patients: [
      { id: 1, name: 'Maria Santos',   service: 'General Consultation', priority: false, status: 'serving', timeIn: '8:02 AM' },
      { id: 2, name: 'Jose Reyes',     service: 'Blood Pressure Check', priority: true,  status: 'waiting', timeIn: '8:10 AM' },
      { id: 3, name: 'Lourdes Cruz',   service: 'Laboratory',           priority: false, status: 'waiting', timeIn: '8:15 AM' },
      { id: 4, name: 'Roberto Flores', service: 'Vaccination',          priority: false, status: 'waiting', timeIn: '8:22 AM' },
      { id: 5, name: 'Ana Garcia',     service: 'Prenatal Check-up',    priority: true,  status: 'waiting', timeIn: '8:30 AM' },
    ]
  };
}

/**
 * Move the current session's patient list into the history
 * log before the queue is cleared. No-op if there are no
 * patients to archive.
 */
function archiveCurrentSession() {
  const data = loadData();
  if (!data.patients || data.patients.length === 0) return;

  const history = loadHistory();
  const archivedAt = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });

  const session = {
    sessionId: Date.now(),
    date: data.date,
    archivedAt,
    totalPatients: data.patients.length,
    servedCount: data.patients.filter(p => p.status === 'done').length,
    patients: data.patients.map(p => ({
      id:       p.id,
      name:     p.name,
      service:  p.service,
      priority: p.priority,
      status:   p.status,
      timeIn:   p.timeIn
    }))
  };

  history.unshift(session); // newest first
  saveHistory(history);
}
