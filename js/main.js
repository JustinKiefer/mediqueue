/* ════════════════════════════════════════════════════════
   main.js
   App entry point: tab navigation and initial bootstrap.
   Loaded last, after all other modules are available.
   ════════════════════════════════════════════════════════ */

/**
 * Switch between the Queue Display, Admin Dashboard, and
 * History tabs. Starts/stops the public auto-refresh cycle
 * and re-renders the destination tab.
 */
function switchTab(tab) {
  ['public', 'admin', 'history'].forEach(t => {
    const el = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.style.display = (t === tab) ? '' : 'none';
  });

  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  if (tab === 'admin') {
    stopAutoRefresh();
    const data = loadData();
    if (data.adminLoggedIn) {
      document.getElementById('loginOverlay').style.display = 'none';
      renderAdminView();
    }
  } else if (tab === 'history') {
    stopAutoRefresh();
    renderHistoryView();
  } else {
    refreshPublicView();
    startAutoRefresh();
  }
}

/**
 * App bootstrap.
 * - Seeds default data on first run.
 * - If the stored date differs from today, archives
 *   yesterday's session automatically and starts a
 *   fresh, empty queue for the new day.
 * - Kicks off the public view and its auto-refresh cycle.
 */
(function init() {
  const stored = localStorage.getItem(STORE_KEY);
  const today  = new Date().toLocaleDateString('en-PH');
  let data;

  if (!stored) {
    data = getDefaultData();
    saveData(data);
  } else {
    try {
      data = JSON.parse(stored);
      if (data.date !== today) {
        archiveCurrentSession();
        data = getDefaultData();
        data.date = today;
        data.patients = [];
        data.nextId   = 1;
        saveData(data);
      }
    } catch {
      data = getDefaultData();
      saveData(data);
    }
  }

  refreshPublicView();
  startAutoRefresh();
})();
