/* ════════════════════════════════════════════════════════
   history.js
   "History" tab — browsing archived sessions created by the
   admin's End Day / Archive action.
   ════════════════════════════════════════════════════════ */

/**
 * Render the list of archived sessions as collapsible cards,
 * newest first.
 */
function renderHistoryView() {
  const history = loadHistory();
  const container = document.getElementById('historyList');

  if (history.length === 0) {
    container.innerHTML = `<div class="history-empty">
      <i class="ti ti-clock-off"></i>
      <div style="font-weight:600;margin-bottom:.4rem">No history yet</div>
      <div style="font-size:.85rem">Past sessions will appear here after you use <strong>End Day &amp; Archive</strong>.</div>
    </div>`;
    return;
  }

  container.innerHTML = history.map((session, idx) => {
    const servedPct = session.totalPatients > 0
      ? Math.round((session.servedCount / session.totalPatients) * 100) : 0;

    const rows = session.patients.map(p => {
      const statusBadge = (p.status === 'serving' || p.status === 'done')
        ? '<span class="badge-done" style="font-size:.68rem">Served</span>'
        : '<span class="badge-waiting" style="font-size:.68rem">Pending</span>';
      const priorityTag = p.priority ? ' <span class="badge-priority" style="font-size:.68rem">Priority</span>' : '';
      return `<div class="history-record-row">
        <div class="history-num">${String(p.id).padStart(3, '0')}</div>
        <div class="history-info">
          <div class="history-name">${p.name}${priorityTag}</div>
          <div class="history-svc">${p.service}</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          ${statusBadge}
          <span class="history-time">${p.timeIn}</span>
        </div>
      </div>`;
    }).join('');

    return `<div class="history-day">
      <div class="history-day-header" onclick="toggleHistoryDay(${idx})">
        <div>
          <div class="history-day-title">
            <i class="ti ti-calendar me-1" style="font-size:.9rem"></i>${session.date}
          </div>
          <div class="history-day-meta">
            Archived at ${session.archivedAt} &nbsp;·&nbsp;
            ${session.totalPatients} patient${session.totalPatients !== 1 ? 's' : ''}
            &nbsp;·&nbsp; ${session.servedCount} served (${servedPct}%)
          </div>
        </div>
        <i class="ti ti-chevron-down history-chevron" id="chevron-${idx}"></i>
      </div>
      <div class="history-day-body" id="history-body-${idx}">
        ${rows}
      </div>
    </div>`;
  }).join('');
}

/**
 * Expand/collapse a single archived session's patient list.
 */
function toggleHistoryDay(idx) {
  const body    = document.getElementById(`history-body-${idx}`);
  const chevron = document.getElementById(`chevron-${idx}`);
  const isOpen  = body.classList.toggle('open');
  chevron.classList.toggle('open', isOpen);
}

/**
 * Permanently delete all archived sessions, after
 * confirmation via the custom modal.
 */
async function confirmClearHistory() {
  const history = loadHistory();
  if (history.length === 0) {
    showToast('info', 'Nothing to clear', 'History is already empty');
    return;
  }

  const ok = await showConfirm({
    type: 'danger', icon: 'ti-trash',
    title: 'Clear all history?',
    message: `This will permanently delete ${history.length} archived session${history.length !== 1 ? 's' : ''}. This cannot be undone.`,
    confirmLabel: 'Clear All'
  });
  if (!ok) return;

  localStorage.removeItem(HISTORY_KEY);
  renderHistoryView();
  showToast('warning', 'History cleared', 'All archived sessions deleted');
}
