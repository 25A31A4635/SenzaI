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

let activeResultIdx = -1;
let originalTypedValue = "";
let terminalHistory = [];
let terminalHistoryIdx = -1;

/**
 * Sets up the input event listener for live syntax highlighting and hints.
 */
function handleInput(input) {
  input.addEventListener("input", () => {
    // Only process if no modal is obstructing the view
    if (document.querySelector('.config-modal.active, #sp-modal-overlay')) return;
    activeResultIdx = -1;
    originalTypedValue = input.value;
    updateSyntaxHighlight(input.value);
  });
}

function updateSyntaxHighlight(rawValue) {
  const value = rawValue.toLowerCase();
  const hintEl = document.getElementById('command-hint');
  const input = document.getElementById('terminal-input');

  if (typeof renderLiveResults === 'function') {
    renderLiveResults(rawValue);
  }

  if (!value) {
    hintEl.textContent = '';
    input.removeAttribute('data-suggestion');
    return;
  }

  let suggestion = null;

  // 0. Search for math evaluation if calculator is enabled
  const enableCalc = (typeof getStoredEnableInlineCalculator === 'function') ? getStoredEnableInlineCalculator() : true;
  if (enableCalc) {
    const isMath = /^[0-9+\-*/().\s%]+$/.test(rawValue) && /[0-9]/.test(rawValue) && /[\+\-\*\/%]/.test(rawValue);
    if (isMath) {
      try {
        const ans = safeEval(rawValue);
        if (ans !== null && !isNaN(ans)) {
          suggestion = rawValue + " = " + ans;
        }
      } catch (e) {}
    }
  }

  // 1. Search for best matching bookmark if not already resolved by math
  if (!suggestion && (typeof getStoredEnableAutocompleteHint !== 'function' || getStoredEnableAutocompleteHint())) {
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
  terminalHistory = loadHistory().reverse();
  terminalHistoryIdx = -1;

  input.addEventListener("keydown", (e) => {
    // Ignore input events if a modal is open
    const anyModal = document.querySelector('.config-modal.active, #sp-modal-overlay');
    if (anyModal) return;

    const enableNav = (typeof getStoredEnableDropdownNavigation === 'function') ? getStoredEnableDropdownNavigation() : true;
    const resultsContainer = document.getElementById('live-results');
    const items = resultsContainer ? resultsContainer.querySelectorAll('.live-result-item') : [];
    const hasResults = resultsContainer && resultsContainer.style.display !== 'none' && items.length > 0;

    // --- Autocomplete Completion (Tab or Right Arrow) ---
    if ((e.key === "Tab" || e.key === "ArrowRight") && input.hasAttribute('data-suggestion')) {
      e.preventDefault();
      input.value = input.getAttribute('data-suggestion');
      updateSyntaxHighlight(input.value);
      return;
    }

    // --- Arrow Keys: Dropdown Navigation vs. History Navigation ---
    if (e.key === "ArrowDown") {
      if (hasResults && enableNav) {
        e.preventDefault();
        
        // Remove highlight from previous item
        if (activeResultIdx >= 0 && activeResultIdx < items.length) {
          items[activeResultIdx].classList.remove('selected');
        }
        
        // Move selection index forward (downwards)
        activeResultIdx++;
        if (activeResultIdx >= items.length) {
          activeResultIdx = -1;
          input.value = originalTypedValue;
          updateSyntaxHighlight(originalTypedValue);
        } else {
          items[activeResultIdx].classList.add('selected');
          items[activeResultIdx].scrollIntoView({ block: 'nearest' });
          
          // Clear ghost hint
          const hintEl = document.getElementById('command-hint');
          if (hintEl) hintEl.textContent = '';
        }
      } else {
        // Navigate history forward (towards newer items / clear)
        e.preventDefault();
        if (terminalHistoryIdx > 0) {
          terminalHistoryIdx--;
          input.value = terminalHistory[terminalHistoryIdx];
          updateSyntaxHighlight(input.value);
        } else if (terminalHistoryIdx === 0) {
          terminalHistoryIdx = -1;
          input.value = originalTypedValue || "";
          updateSyntaxHighlight(input.value);
        }
      }
      return;
    }

    if (e.key === "ArrowUp") {
      if (hasResults && enableNav) {
        e.preventDefault();
        
        // Remove highlight from previous item
        if (activeResultIdx >= 0 && activeResultIdx < items.length) {
          items[activeResultIdx].classList.remove('selected');
        }
        
        // Move selection index backward (upwards)
        activeResultIdx--;
        if (activeResultIdx < -1) {
          activeResultIdx = items.length - 1;
        }
        
        if (activeResultIdx === -1) {
          input.value = originalTypedValue;
          updateSyntaxHighlight(originalTypedValue);
        } else {
          items[activeResultIdx].classList.add('selected');
          items[activeResultIdx].scrollIntoView({ block: 'nearest' });
          
          // Clear ghost hint
          const hintEl = document.getElementById('command-hint');
          if (hintEl) hintEl.textContent = '';
        }
      } else {
        // Navigate history backward (towards older items)
        e.preventDefault();
        if (terminalHistoryIdx < terminalHistory.length - 1) {
          terminalHistoryIdx++;
          input.value = terminalHistory[terminalHistoryIdx];
          updateSyntaxHighlight(input.value);
        }
      }
      return;
    }

    // --- Execution (Enter) ---
    if (e.key === "Enter") {
      e.preventDefault();
      
      // If we have a highlighted dropdown suggestion, navigate to it directly
      if (hasResults && enableNav && activeResultIdx >= 0 && activeResultIdx < items.length) {
        const targetHref = items[activeResultIdx].getAttribute('href');
        pushHistory(originalTypedValue);
        if (typeof navigate === 'function') {
          navigate(targetHref);
        } else {
          window.location.href = targetHref;
        }
        return;
      }

      const val = input.value.trim();
      if (!val) return;

      const enableCalc = (typeof getStoredEnableInlineCalculator === 'function') ? getStoredEnableInlineCalculator() : true;
      if (enableCalc) {
        const isMath = /^[0-9+\-*/().\s%]+$/.test(val) && /[0-9]/.test(val) && /[\+\-\*\/%]/.test(val);
        if (isMath) {
          try {
            const ans = safeEval(val);
            if (ans !== null && !isNaN(ans)) {
              pushHistory(val);
              terminalHistory = loadHistory().reverse();
              terminalHistoryIdx = -1;
              input.value = String(ans);
              updateSyntaxHighlight(String(ans));
              return;
            }
          } catch (e) {}
        }
      }
      
      // Auto-complete to suggestion if visible
      const suggestion = input.getAttribute('data-suggestion');
      const finalVal = (suggestion && suggestion.toLowerCase().startsWith(val.toLowerCase())) ? suggestion : val;
      
      pushHistory(finalVal);
      terminalHistory = loadHistory().reverse();
      terminalHistoryIdx = -1;
      handleSpecialCommands(finalVal);
    }
  });
}

/**
 * Traverses history externally (e.g. from dormant mode).
 */
function navigateHistoryExternal(key) {
  const input = document.getElementById("terminal-input");
  if (!input) return;

  if (terminalHistory.length === 0) {
    terminalHistory = loadHistory().reverse();
  }

  if (key === "ArrowUp") {
    if (terminalHistoryIdx < terminalHistory.length - 1) {
      terminalHistoryIdx++;
      input.value = terminalHistory[terminalHistoryIdx];
      updateSyntaxHighlight(input.value);
    }
  } else if (key === "ArrowDown") {
    if (terminalHistoryIdx > 0) {
      terminalHistoryIdx--;
      input.value = terminalHistory[terminalHistoryIdx];
      updateSyntaxHighlight(input.value);
    } else {
      terminalHistoryIdx = -1;
      input.value = "";
      updateSyntaxHighlight("");
    }
  }
}
window.navigateHistoryExternal = navigateHistoryExternal;

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

function openHistory() {
  renderHistoryList();
  document.getElementById('history-modal').classList.add('active');
}

function closeHistoryModal() {
  document.getElementById('history-modal').classList.remove('active');
}

function clearHistory() {
  saveHistory([]);
  renderHistoryList();
  showToast('History cleared', 'success');
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  if (!list) return;

  const history = loadHistory().slice().reverse();
  if (history.length === 0) {
    list.innerHTML = '<p class="history-empty">No commands yet</p>';
    return;
  }

  list.innerHTML = '';
  history.forEach((entry) => {
    const button = document.createElement('button');
    button.className = 'history-item';
    button.type = 'button';
    button.textContent = entry;
    button.addEventListener('click', () => {
      const input = document.getElementById('terminal-input');
      if (input) {
        input.value = entry;
        updateSyntaxHighlight(entry);
      }
      closeHistoryModal();
    });
    list.appendChild(button);
  });
}
