/* ════════════════════════════════════════════════════════
   public.js
   Public-facing "Queue Display" tab.
   Renders the live "Now Serving" hero, summary stats, and
   the full queue table. Auto-refreshes every 10 seconds
   using async/await against the simulated API layer.
   ════════════════════════════════════════════════════════ */

let countdownTimer = 10;
let refreshInterval, countdownInterval;

/**
 * Fetch the latest queue data (simulated async) and re-render
 * the public view. Shows the error banner on failure.
 */
async function refreshPublicView() {
  hideError();
  try {
    const data = await fetchQueueData();
    renderPublicView(data);
    document.getElementById('lastUpdated').textContent =
      new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  } catch (e) {
    showError('Could not refresh queue data. (' + e.message + ')');
  }
}

/**
 * Paint the "Now Serving" hero, stat cards, and queue table
 * based on the given data snapshot.
 */
function renderPublicView(data) {
  const serving  = data.patients.find(p => p.status === 'serving');
  const waiting  = data.patients.filter(p => p.status === 'waiting');
  const done     = data.patients.filter(p => p.status === 'done');
  const priority = waiting.filter(p => p.priority);

  document.getElementById('displayNowServing').textContent  = serving ? String(serving.id).padStart(3, '0') : '—';
  document.getElementById('displayPatientName').textContent = serving ? serving.name : 'No active patient';
  document.getElementById('displayService').textContent     = serving ? serving.service : '';

  document.getElementById('statWaiting').textContent  = waiting.length;
  document.getElementById('statServed').textContent   = done.length;
  document.getElementById('statPriority').textContent = priority.length;
  document.getElementById('statTotal').textContent    = data.patients.length;

  const tbody = document.getElementById('queueTableBody');
  if (data.patients.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4" style="color:var(--clinic-gray)">No patients registered today.</td></tr>';
    return;
  }

  tbody.innerHTML = data.patients.map(p => {
    const rowClass    = p.status === 'serving' ? 'class="serving"' : '';
    const statusBadge = p.status === 'serving' ? '<span class="badge-serving">Serving</span>'
                      : p.status === 'done'    ? '<span class="badge-done">Done</span>'
                                               : '<span class="badge-waiting">Waiting</span>';
    const priorityTag = p.priority ? ' <span class="badge-priority">Priority</span>' : '';
    return `<tr ${rowClass}>
      <td class="fw-bold" style="color:var(--clinic-teal-dark)">${String(p.id).padStart(3, '0')}</td>
      <td>${p.name}${priorityTag}</td>
      <td style="font-size:.83rem;color:var(--clinic-gray)">${p.service}</td>
      <td>${statusBadge}</td>
      <td style="font-size:.82rem;color:var(--clinic-gray)">${p.timeIn}</td>
    </tr>`;
  }).join('');
}

/**
 * Start the 10-second auto-refresh cycle and the visible
 * countdown indicator.
 */
function startAutoRefresh() {
  countdownTimer = 10;
  document.getElementById('countdown').textContent = countdownTimer;

  refreshInterval = setInterval(async () => {
    await refreshPublicView();
    countdownTimer = 10;
  }, 10000);

  countdownInterval = setInterval(() => {
    countdownTimer = Math.max(0, countdownTimer - 1);
    document.getElementById('countdown').textContent = countdownTimer;
  }, 1000);
}

/**
 * Stop the auto-refresh cycle (called when leaving the
 * public tab, to avoid unnecessary background work).
 */
function stopAutoRefresh() {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
}
