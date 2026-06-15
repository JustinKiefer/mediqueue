/* ════════════════════════════════════════════════════════
   admin.js
   Secure admin dashboard logic.
   Handles login (HTML5 Constraint Validation API), the
   "Call Next Patient" queue control, patient registration
   (FormData-style capture via e.preventDefault()), patient
   removal, and the End Day / Archive flow.
   ════════════════════════════════════════════════════════ */

const ADMIN_CREDENTIALS = { username: 'admin', password: 'clinic2026' };

/* ── LOGIN ─────────────────────────────────── */

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return; // HTML5 Constraint Validation API

  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const btn  = document.getElementById('loginBtn');

  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span>Verifying…';

  await simulateNetworkDelay(800);

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    const data = loadData();
    data.adminLoggedIn = true;
    saveData(data);

    document.getElementById('loginOverlay').style.display = 'none';
    renderAdminView();
    showToast('success', 'Signed in successfully', 'Welcome, Admin');
  } else {
    document.getElementById('loginError').style.display = 'flex';
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-arrow-right me-1"></i>Sign in';
    document.getElementById('loginPass').value = '';
  }
});

function adminLogout() {
  const data = loadData();
  data.adminLoggedIn = false;
  saveData(data);

  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  document.getElementById('loginForm').classList.remove('was-validated');
  showToast('info', 'Logged out', 'Session ended');
}

/* ── DASHBOARD RENDER ──────────────────────── */

/**
 * Re-render the admin dashboard: current-serving display,
 * the "Call Next" button state, the patient list, and the
 * localStorage audit panel.
 */
function renderAdminView() {
  const data = loadData();
  const serving = data.patients.find(p => p.status === 'serving');
  const nextWaiting = data.patients
    .filter(p => p.status === 'waiting')
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.id - b.id;
    })[0];

  document.getElementById('adminCurrentNum').textContent  = serving ? String(serving.id).padStart(3, '0') : '—';
  document.getElementById('adminCurrentName').textContent = serving ? serving.name : '';

  const hasNext = !!nextWaiting;
  document.getElementById('btnNextPatient').disabled = !hasNext;
  document.getElementById('noMorePatients').style.display = hasNext ? 'none' : 'block';

  const list = document.getElementById('adminQueueList');
  if (data.patients.length === 0) {
    list.innerHTML = '<p style="color:var(--clinic-gray);font-size:.9rem;text-align:center;padding:1rem 0">No patients registered yet. Add one above.</p>';
  } else {
    list.innerHTML = data.patients.map(p => {
      const statusBadge = p.status === 'serving' ? '<span class="badge-serving">Serving</span>'
                        : p.status === 'done'    ? '<span class="badge-done">Done</span>'
                                                 : '<span class="badge-waiting">Waiting</span>';
      const priorityTag = p.priority ? '<span class="badge-priority ms-1">Priority</span>' : '';
      const actionBtn   = p.status === 'waiting'
        ? `<button class="btn btn-sm btn-outline-danger" onclick="removePatient(${p.id})" style="font-size:.75rem;padding:2px 8px" aria-label="Remove patient">
             <i class="ti ti-trash"></i>
           </button>` : '';
      return `<div class="admin-table-row">
        <div class="patient-num">${String(p.id).padStart(3, '0')}</div>
        <div class="patient-info">
          <div class="patient-name">${p.name}${priorityTag}</div>
          <div class="patient-meta">${p.service} &middot; ${p.timeIn}</div>
        </div>
        <div>${statusBadge}</div>
        <div>${actionBtn}</div>
      </div>`;
    }).join('');
  }

  updateLocalStorageAudit();
}

/* ── QUEUE CONTROL ─────────────────────────── */

/**
 * Mark the currently-serving patient as done and promote the
 * next waiting patient (priority patients are called first).
 * Disables the button and shows a spinner while "processing"
 * to prevent double-submission.
 */
async function callNextPatient() {
  const btn = document.getElementById('btnNextPatient');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading-spinner"></span>Processing…';

  await simulateNetworkDelay(600);

  const data = loadData();
  const currentServing = data.patients.find(p => p.status === 'serving');
  if (currentServing) currentServing.status = 'done';

  const nextPatient = data.patients
    .filter(p => p.status === 'waiting')
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return a.id - b.id;
    })[0];

  if (nextPatient) {
    nextPatient.status = 'serving';
    data.currentServing = nextPatient.id;
    saveData(data);
    showToast('success', `Now serving No. ${String(nextPatient.id).padStart(3, '0')}`, nextPatient.name);
  } else {
    saveData(data);
    showToast('info', 'Queue complete', 'All patients have been served');
  }

  btn.innerHTML = '<i class="ti ti-arrow-right me-1"></i>Call Next Patient';
  renderAdminView();
  await refreshPublicView();
}

/**
 * Remove a single waiting patient from today's queue,
 * after confirming via the custom modal.
 */
async function removePatient(id) {
  const ok = await showConfirm({
    type: 'danger', icon: 'ti-trash',
    title: 'Remove patient?',
    message: 'This patient will be removed from today\'s queue. This action cannot be undone.',
    confirmLabel: 'Remove'
  });
  if (!ok) return;

  const data = loadData();
  data.patients = data.patients.filter(p => p.id !== id);
  saveData(data);

  showToast('info', 'Patient removed', 'Queue updated');
  renderAdminView();
  await refreshPublicView();
}

/* ── END DAY / ARCHIVE ─────────────────────── */

/**
 * Archive today's full patient list into history, then
 * reset the active queue to an empty state for a new day.
 * Requires confirmation via the custom modal.
 */
async function confirmReset() {
  const data = loadData();
  const hasPatients = data.patients && data.patients.length > 0;

  const ok = await showConfirm({
    type: 'warning', icon: 'ti-archive',
    title: 'End day and archive?',
    message: hasPatients
      ? `${data.patients.length} patient record${data.patients.length !== 1 ? 's' : ''} will be saved to History, then the queue will be cleared for a fresh day.`
      : 'The queue is already empty. A new session will start.',
    confirmLabel: 'Archive & Reset'
  });
  if (!ok) return;

  archiveCurrentSession();

  localStorage.removeItem(STORE_KEY);
  const fresh = getDefaultData();
  fresh.patients = [];
  fresh.nextId = 1;
  fresh.adminLoggedIn = true;
  saveData(fresh);

  showToast('success', 'Day archived', 'Patient records saved to History');
  renderAdminView();
  refreshPublicView();
}

/* ── ADD PATIENT FORM ──────────────────────── */

document.getElementById('addPatientForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // intercept default form submission
  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return; // HTML5 Constraint Validation API

  // Gather inputs via the native HTML5 FormData API
  const formData = new FormData(form);
  const name     = formData.get('patientName').trim();
  const service  = formData.get('patientService');
  const priority = formData.get('patientPriority') === 'on'; // checkbox checked => 'on'

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="loading-spinner" style="border-color:rgba(0,0,0,.2);border-top-color:#fff"></span>';

  await simulateNetworkDelay(500);

  const data   = loadData();
  const timeIn = new Date().toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });

  const newPatient = { id: data.nextId++, name, service, priority, status: 'waiting', timeIn };
  data.patients.push(newPatient);
  saveData(data);

  showToast('success', `Patient #${String(newPatient.id).padStart(3, '0')} registered`, name);
  form.reset();
  form.classList.remove('was-validated');
  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="ti ti-plus"></i>';

  renderAdminView();
  await refreshPublicView();
});
