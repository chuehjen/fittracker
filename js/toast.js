// ===== Undo Toast =====
// Shows a toast notification with undo action, used for deletions

let currentToast = null;

export function showUndoToast(message, onUndo, opts = {}) {
  // Dismiss existing toast
  dismissToast();

  const timeout = opts.timeout || 3000;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.id = 'undoToast';
  toast.innerHTML = `
    <span class="toast-text">${message}</span>
    <button class="toast-action" id="toastUndo">撤销</button>
  `;
  document.body.appendChild(toast);

  let dismissed = false;

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    const el = document.getElementById('undoToast');
    if (el) el.remove();
    currentToast = null;
  }

  const timer = setTimeout(() => {
    if (!dismissed) dismiss();
  }, timeout);

  document.getElementById('toastUndo').addEventListener('click', () => {
    clearTimeout(timer);
    onUndo();
    dismiss();
  });

  currentToast = { timer, dismiss };
}

export function dismissToast() {
  if (currentToast) {
    clearTimeout(currentToast.timer);
    currentToast.dismiss();
    currentToast = null;
  }
}

// ===== Custom Confirm Modal =====
// Promise-based replacement for native confirm() dialogs

export function showConfirm(message, opts = {}) {
  const confirmLabel = opts.confirm || '确定';
  const cancelLabel = opts.cancel || '取消';
  const danger = opts.danger || false;

  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `<div class="modal" style="text-align:center;padding:24px 20px">
      <p style="font-size:15px;line-height:1.5;margin:0 0 20px;color:var(--t1)">${message}</p>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost" style="flex:1" id="confirmCancel">${cancelLabel}</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" style="flex:1" id="confirmOk">${confirmLabel}</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);

    function close(result) {
      overlay.remove();
      resolve(result);
    }

    overlay.querySelector('#confirmOk').addEventListener('click', () => close(true));
    overlay.querySelector('#confirmCancel').addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
  });
}
