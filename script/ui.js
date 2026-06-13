/**
 * SenzaI - Custom UI Components
 * Author: Abhidatta Benda
 * 
 * Replaces native alert() and confirm() with themed, non-blocking modals.
 */

/**
 * Shows a custom alert modal.
 */
function showAlert(message, options = {}) {
  const { title = 'Alert' } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'sp-overlay';
  overlay.id = 'sp-modal-overlay';
  
  overlay.innerHTML = `
    <div class="sp-modal">
      <h2 class="sp-modal-title">${escapeHTML(title)}</h2>
      <div class="sp-modal-body">${escapeHTML(message).replace(/\n/g, '<br>')}</div>
      <div class="sp-modal-buttons">
        <button class="btn-save" id="sp-alert-ok">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('sp-overlay-show'), 10);
  
  return new Promise((resolve) => {
    const close = () => {
      overlay.classList.remove('sp-overlay-show');
      setTimeout(() => { overlay.remove(); resolve(); }, 300);
    };
    document.getElementById('sp-alert-ok').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
  });
}

/**
 * Shows a custom confirmation modal.
 */
function showConfirm(message, options = {}) {
  const { title = 'Confirm', confirmLabel = 'Confirm', cancelLabel = 'Cancel' } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'sp-overlay';
  overlay.id = 'sp-modal-overlay';
  
  overlay.innerHTML = `
    <div class="sp-modal">
      <h2 class="sp-modal-title">${escapeHTML(title)}</h2>
      <div class="sp-modal-body">${escapeHTML(message).replace(/\n/g, '<br>')}</div>
      <div class="sp-modal-buttons">
        <button class="btn-cancel" id="sp-confirm-cancel">${escapeHTML(cancelLabel)}</button>
        <button class="btn-save" id="sp-confirm-ok">${escapeHTML(confirmLabel)}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('sp-overlay-show'), 10);
  
  return new Promise((resolve) => {
    const close = (result) => {
      overlay.classList.remove('sp-overlay-show');
      setTimeout(() => { overlay.remove(); resolve(result); }, 300);
    };
    document.getElementById('sp-confirm-ok').onclick = () => close(true);
    document.getElementById('sp-confirm-cancel').onclick = () => close(false);
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };
  });
}

/**
 * Shows a temporary toast notification at the bottom of the screen.
 */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.sp-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `sp-toast sp-toast-show`;
  toast.textContent = message;
  
  if (type === 'success') toast.style.borderColor = 'var(--color-success)';
  if (type === 'error') toast.style.borderColor = 'var(--color-error)';
  
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('sp-toast-show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function _removeSpModal() {
  const el = document.getElementById('sp-modal-overlay');
  if (el) el.remove();
}
