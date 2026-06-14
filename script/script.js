/**
 * SenzaI - Main Entry Point
 * Author: Abhidatta Benda
 * 
 * This file handles the initial loading, theme management, 
 * activation lock (Space/Enter to wake), and global keyboard shortcuts.
 */

/* --- Theme Management --- */

/**
 * Loads the user's preferred theme from storage and applies it to the document.
 */
function loadTheme() {
  const theme = getStoredTheme();
  THEMES.forEach(t => {
    document.body.classList.remove(`${t}-mode`);
    document.documentElement.classList.remove(`${t}-mode`);
  });
  if (theme) {
    document.body.classList.add(`${theme}-mode`);
    document.documentElement.classList.add(`${theme}-mode`);
  }
}

/**
 * Injects custom user fonts via an @import rule if configured.
 */
function applyUserFont(family, url) {
  const styleEl = document.getElementById('user-font-style');
  if (!styleEl) return;

  if (!family && !url) {
    styleEl.innerHTML = '';
    return;
  }

  let css = '';
  if (url) css += `@import url('${url}');\n`;
  if (family) {
    css += `:root { 
      --font-family: '${family}', sans-serif !important; 
      --monospace-font-family: '${family}', monospace !important; 
    }`;
  }
  styleEl.innerHTML = css;
}

/**
 * Updates the CSS variable for search bar corner rounding.
 */
function applyBarRounding(val) {
  document.documentElement.style.setProperty('--bar-rounding', `${val}px`);
}

function applyWallpaperBrightness(val) {
  const opacity = (100 - Number(val)) / 100;
  document.documentElement.style.setProperty('--wallpaper-overlay-opacity', opacity);
}

/* --- Global Activation & Key Handling --- */

/**
 * isActivated tracks whether the search bar is focused and listening.
 * In the dormant state (false), single-key shortcuts like 't' and 'x' are active.
 */
(function setupGlobalKeyHandlers() {
  let isActivated = false;
  const input = () => document.getElementById('terminal-input');
  
  const activate = () => {
    if (isActivated) return;
    isActivated = true;
    document.body.classList.add('is-active');
    const el = input();
    if (el) el.focus({ preventScroll: true });
    updateStatusLineVisibility();
  };

  const deactivate = () => {
    isActivated = false;
    document.body.classList.remove('is-active');
    const el = input();
    if (el) {
      el.value = '';
      if (typeof updateSyntaxHighlight === 'function') updateSyntaxHighlight('');
      el.blur();
    }
    updateStatusLineVisibility();
  };

  function updateStatusLineVisibility() {
    const statusEl = document.getElementById('status-line');
    if (!statusEl) return;
    
    const enabled = (typeof getStoredEnableStatusLine === 'function') ? getStoredEnableStatusLine() : true;
    
    if (enabled && !isActivated) {
      statusEl.classList.add('visible');
      updateStatusText();
    } else {
      statusEl.classList.remove('visible');
    }
  }

  function updateStatusText() {
    const statusEl = document.getElementById('status-line');
    if (!statusEl) return;
    
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const timeStr = `${hours}:${minutes} ${ampm}`;
    
    const currentHour = now.getHours();
    let greeting = 'Hello';
    if (currentHour >= 5 && currentHour < 12) {
      greeting = 'Good morning';
    } else if (currentHour >= 12 && currentHour < 17) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    const username = (typeof getStoredUsername === 'function') ? getStoredUsername() : 'Abhidatta Benda';
    statusEl.textContent = `${greeting}, ${username}. It's ${timeStr}.`;
  }

  window.setTerminalDormant = deactivate;
  window.updateStatusLineVisibility = updateStatusLineVisibility;
  window.updateStatusText = updateStatusText;

  // Main global keyboard listener
  window.addEventListener('keydown', (e) => {
    const activeModal = document.querySelector('.config-modal.active, .sp-overlay');
    
    // 1. Handle Escape key for Modals and Deactivation
    if (e.key === 'Escape') {
      if (activeModal) {
        if (typeof closeConfig === 'function') closeConfig();
        if (typeof closeHelp === 'function') closeHelp();
        if (typeof closeBookmarksModal === 'function') closeBookmarksModal();
        if (typeof closeSearchEnginesModal === 'function') closeSearchEnginesModal();
        if (typeof closeCustomizeModal === 'function') closeCustomizeModal();
        if (typeof closeHistoryModal === 'function') closeHistoryModal();
        if (typeof _removeSpModal === 'function') _removeSpModal();
        e.preventDefault();
      } else if (isActivated) {
        deactivate();
        e.preventDefault();
      }
      return;
    }

    // 2. Ignore all other keys if a modal is open
    if (activeModal) return;

    // 3. Dormant State Logic (Keybinds)
    if (!isActivated) {
      // Activation keys
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        activate();
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate();
        if (typeof window.navigateHistoryExternal === 'function') {
          window.navigateHistoryExternal(e.key);
        }
        return;
      }

      // Tab management shortcuts
      const keyNew = (typeof getStoredKeyNewTab === 'function') ? getStoredKeyNewTab() : 't';
      const keyClose = (typeof getStoredKeyCloseTab === 'function') ? getStoredKeyCloseTab() : 'x';

      if (e.key.toLowerCase() === keyNew) {
        e.preventDefault();
        const nt = (typeof chrome !== 'undefined' && chrome.runtime) 
          ? chrome.runtime.getURL('index.html') 
          : 'index.html';
        window.open(nt, '_blank');
        return;
      }

      if (e.key.toLowerCase() === keyClose) {
        e.preventDefault();
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
          chrome.tabs.getCurrent((tab) => {
            if (tab && tab.id !== undefined) {
              chrome.tabs.remove(tab.id);
            } else {
              window.close();
            }
          });
        } else {
          window.close();
        }
        return;
      }

      return; 
    }

    // 4. Activated State Logic
    if (isActivated) {
      // Automatic focus recovery if user clicks away then starts typing
      const el = input();
      if (el && document.activeElement !== el) {
        if (e.key.length === 1 || e.key === 'Backspace') {
          el.focus({ preventScroll: true });
        }
      }
    }
  }, { capture: false });

  // Activation by click on background
  document.addEventListener('mousedown', (e) => {
    if (!document.querySelector('.config-modal.active, .sp-overlay')) {
      if (e.target.closest('.content') || e.target === document.body) {
        activate();
      }
    }
  });
})();

/* --- Initialization --- */

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for async storage shim if present
  if (window.extStorageReady) await window.extStorageReady;
  
  // Load wallpapers from local extension storage cache
  if (typeof loadWallpapersCache === 'function') {
    await loadWallpapersCache();
  }
  
  // Load user settings
  applyUserFont(getStoredFontFamily(), getStoredFontUrl());
  applyBarRounding(getStoredBarRounding());
  applyWallpaperBrightness(getStoredWallpaperBrightness());
  loadTheme();
  applySyntaxColors(getStoredSyntaxColors());
  applyScheduledWallpaper();
  
  // Start the terminal logic
  initializeTerminal();

  // Initialize custom themed dropdown selectors
  if (typeof initializeCustomDropdowns === 'function') {
    initializeCustomDropdowns();
  }

  // Start status clock loop
  if (typeof updateStatusText === 'function') updateStatusText();
  if (typeof updateStatusLineVisibility === 'function') updateStatusLineVisibility();
  setInterval(() => {
    if (typeof updateStatusText === 'function') updateStatusText();
  }, 15000);

  // Redundant click-outside handlers for modals
  [
    ['config-modal', typeof closeConfig === 'function' ? closeConfig : null],
    ['help-modal', typeof closeHelp === 'function' ? closeHelp : null],
    ['bookmarks-modal', typeof closeBookmarksModal === 'function' ? closeBookmarksModal : null],
    ['searchengines-modal', typeof closeSearchEnginesModal === 'function' ? closeSearchEnginesModal : null],
    ['customize-modal', typeof closeCustomizeModal === 'function' ? closeCustomizeModal : null],
    ['history-modal', typeof closeHistoryModal === 'function' ? closeHistoryModal : null],
  ].forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el && fn) el.addEventListener('click', (e) => { if (e.target === el) fn(); });
  });
});
