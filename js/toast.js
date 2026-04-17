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
