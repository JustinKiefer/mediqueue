/* ════════════════════════════════════════════════════════
   ui.js
   Shared UI utilities: toast notifications, error banners,
   the custom confirm modal (replaces native confirm()), and
   the localStorage audit panel.
   ════════════════════════════════════════════════════════ */

/* ── TOAST NOTIFICATIONS ─────────────────── */

/**
 * Show a temporary toast notification in the top corner.
 * type: 'success' | 'info' | 'warning' | 'error'
 */
function showToast(type, title, message) {
  const icons  = { success: 'ti-circle-check', info: 'ti-info-circle', warning: 'ti-alert-triangle', error: 'ti-x-circle' };
  const colors = { success: 'var(--clinic-teal)', info: '#185FA5', warning: 'var(--clinic-amber)', error: 'var(--clinic-red)' };

  const el = document.createElement('div');
  el.className = 'toast-custom';
  el.innerHTML = `
    <i class="ti ${icons[type] || 'ti-info-circle'} toast-icon" style="color:${colors[type] || '#333'}"></i>
    <div>
      <div style="font-weight:600;font-size:.88rem">${title}</div>
      <div style="font-size:.8rem;color:var(--clinic-gray)">${message}</div>
    </div>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

/* ── ERROR BANNER ─────────────────────────── */

function showError(msg) {
  const msgEl = document.getElementById('errorMsg');
  const banner = document.getElementById('errorBanner');
  if (msgEl)  msgEl.textContent = msg;
  if (banner) banner.style.display = 'flex';
}

function hideError() {
  const banner = document.getElementById('errorBanner');
  if (banner) banner.style.display = 'none';
}

/* ── CUSTOM CONFIRM MODAL ─────────────────── */
/* Replaces the native window.confirm() with a styled,
   on-brand modal. Returns a Promise<boolean> so call sites
   can `await` the user's decision. */

let _confirmResolve = null;

function showConfirm({ type, icon, title, message, confirmLabel }) {
  return new Promise(resolve => {
    _confirmResolve = resolve;
    document.getElementById('confirmIcon').className   = `confirm-icon ${type}`;
    document.getElementById('confirmIconI').className  = `ti ${icon}`;
    document.getElementById('confirmTitle').textContent   = title;
    document.getElementById('confirmMessage').textContent = message;

    const okBtn = document.getElementById('confirmOkBtn');
    okBtn.textContent = confirmLabel;
    okBtn.className   = `confirm-btn-confirm-${type}`;

    document.getElementById('confirmOverlay').classList.add('open');
  });
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
}

function resolveConfirm(value) {
  document.getElementById('confirmOverlay').classList.remove('open');
  if (_confirmResolve) { _confirmResolve(value); _confirmResolve = null; }
}

/* ── LOCALSTORAGE AUDIT PANEL ─────────────── */

/**
 * Render the raw JSON currently stored under STORE_KEY into
 * the admin dashboard's audit panel. Useful for demonstrating
 * that data is genuinely persisted via localStorage.
 */
function updateLocalStorageAudit() {
  const raw = localStorage.getItem(STORE_KEY);
  const pre = document.getElementById('localStorageAudit');
  if (!pre) return;
  if (!raw) { pre.textContent = '(empty)'; return; }
  try {
    pre.textContent = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    pre.textContent = raw;
  }
}
