// js/ui/notify.js — toast notification helper

const Notify = (() => {
  let _timer = null;

  /**
   * Show a toast notification.
   * @param {string} msg
   * @param {'success'|'error'|''} type
   * @param {number} duration  — ms to display (default 2600)
   */
  function show(msg, type = '', duration = 2600) {
    const el = document.getElementById('notif');
    if (!el) return;

    el.textContent = msg;
    el.className   = 'notification show ' + type;

    clearTimeout(_timer);
    _timer = setTimeout(() => el.classList.remove('show'), duration);
  }

  return { show };
})();