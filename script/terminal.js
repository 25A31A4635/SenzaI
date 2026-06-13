/**
 * SenzaI - Terminal Logic
 * Author: Abhidatta Benda
 * 
 * This file handles input processing, syntax highlighting, 
 * ghost-text hints, and keyboard events for the search bar.
 */

/**
 * Initializes listeners for the terminal input field.
 */
function initializeTerminal() {
  const input = document.getElementById("terminal-input");
  if (!input) return;

  if (!input._listenersAttached) {
    handleInput(input);
    handleKeyboardEvents(input);
    input._listenersAttached = true;
  }
}

/**
 * Sets up the input event listener for live syntax highlighting and hints.
 */
function handleInput(input) {
  input.addEventListener("input", () => {
    // Only process if no modal is obstructing the view
    if (document.querySelector('.config-modal.active, #sp-modal-overlay')) return;
    updateSyntaxHighlight(input.value);
  });
}

/**
 * Updates the ghost-text hint behind the input based on current typing.
 * Prioritizes bookmarks first, then system commands.
 */
function updateSyntaxHighlight(rawValue) {
  const value = rawValue.toLowerCase();
  const hintEl = document.getElementById('command-hint');
  const input = document.getElementById('terminal-input');

  if (!value) {
    hintEl.textContent = '';
    input.removeAttribute('data-suggestion');
    return;
  }

  // 1. Search for best matching bookmark
  let suggestion = null;
  if (typeof getFilteredBookmarks === 'function') {
    const matches = getFilteredBookmarks(rawValue);
    // Only suggest if the match starts with what the user is typing
    if (matches.length > 0 && matches[0].title.toLowerCase().startsWith(value)) {
      suggestion = matches[0].title;
    }
  }

  // 2. Search for matching system command if no bookmark found
  if (!suggestion) {
    const sysCommands = {
      ':c': ':config',
      ':cu': ':customize',
      ':bm': ':bookmarks',
      ':hi': ':history',
      ':ve': ':version',
      ':he': ':help'
    };
    for (const [prefix, full] of Object.entries(sysCommands)) {
      if (full.startsWith(value)) {
        suggestion = full;
        break;
      }
    }
  }

  // 3. Render the ghost text hint
  if (suggestion && suggestion.toLowerCase().startsWith(value)) {
    input.setAttribute('data-suggestion', suggestion);
    const remaining = suggestion.substring(rawValue.length);
    // The spacer ensures the ghost text aligns perfectly with the current text
    hintEl.innerHTML = `<span class="spacer">${escapeHTML(rawValue)}</span><span class="suggestion">${escapeHTML(remaining)}</span>`;
  } else {
    hintEl.textContent = '';
    input.removeAttribute('data-suggestion');
  }
}

/**
 * Handles Tab, Arrow, and Enter keys for completion and navigation.
 */
function handleKeyboardEvents(input) {
  let history = loadHistory().reverse();
  let hIdx = -1;

  input.addEventListener("keydown", (e) => {
    // Ignore input events if a modal is open
    const anyModal = document.querySelector('.config-modal.active, #sp-modal-overlay');
    if (anyModal) return;

    // --- Autocomplete Completion (Tab or Right Arrow) ---
    if ((e.key === "Tab" || e.key === "ArrowRight") && input.hasAttribute('data-suggestion')) {
      e.preventDefault();
      input.value = input.getAttribute('data-suggestion');
      updateSyntaxHighlight(input.value);
      return;
    }

    // --- Command History (Up or Down Arrow) ---
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (hIdx < history.length - 1) {
        hIdx++;
        input.value = history[hIdx];
        updateSyntaxHighlight(input.value);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx > 0) {
        hIdx--;
        input.value = history[hIdx];
        updateSyntaxHighlight(input.value);
      } else {
        hIdx = -1;
        input.value = "";
        updateSyntaxHighlight("");
      }
    }

    // --- Execution (Enter) ---
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      
      // Auto-complete to suggestion if visible
      const suggestion = input.getAttribute('data-suggestion');
      const finalVal = (suggestion && suggestion.toLowerCase().startsWith(val.toLowerCase())) ? suggestion : val;
      
      pushHistory(finalVal);
      handleSpecialCommands(finalVal);
    }
  });
}

/**
 * Escapes HTML characters to prevent XSS.
 */
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* --- History Persistence --- */

const HISTORY_KEY = 'terminal-history-v1';
function loadHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } }
function saveHistory(h) { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); }

/**
 * Adds an entry to the command history, maintaining a max of 50 unique items.
 */
function pushHistory(entry) {
  if (!entry) return;
  const h = loadHistory().filter(e => e !== entry);
  h.push(entry);
  if (h.length > 50) h.shift();
  saveHistory(h);
}
