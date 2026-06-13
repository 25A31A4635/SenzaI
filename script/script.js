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
  if (theme && theme !== 'light') {
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

/* --- Global Activation & Key Handling --- */

/**
 * isActivated tracks whether the search bar is focused and listening.
 * In the dormant state (false), single-key shortcuts like 't' and 'x' are active.
 */
let isActivated = false;

(function setupGlobalKeyHandlers() {
  const input = () => document.getElementById('terminal-input');
  
  const activate = () => {
    if (isActivated) return;
    isActivated = true;
    document.body.classList.add('is-active');
    const el = input();
    if (el) el.focus({ preventScroll: true });
  };

  const deactivate = () => {
    isActivated = false;
    document.body.classList.remove('is-active');
    const el = input();
    if (el) el.blur();
  };

  // Main global keyboard listener
  window.addEventListener('keydown', (e) => {
    const activeModal = document.querySelector('.config-modal.active, .sp-overlay');
    
    // 1. Handle Escape key for Modals and Deactivation
    if (e.key === 'Escape') {
      if (activeModal) {
        if (typeof closeConfig === 'function') closeConfig();
        if (typeof closeHelp === 'function') closeHelp();
        if (typeof closeBookmarksModal === 'function') closeBookmarksModal();
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
        window.close();
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
  
  // Load user settings
  applyUserFont(getStoredFontFamily(), getStoredFontUrl());
  applyBarRounding(getStoredBarRounding());
  loadTheme();
  applySyntaxColors(getStoredSyntaxColors());
  
  // Start the terminal logic
  initializeTerminal();

  // Redundant click-outside handlers for modals
  [
    ['config-modal', typeof closeConfig === 'function' ? closeConfig : null],
    ['help-modal', typeof closeHelp === 'function' ? closeHelp : null],
    ['bookmarks-modal', typeof closeBookmarksModal === 'function' ? closeBookmarksModal : null],
    ['customize-modal', typeof closeCustomizeModal === 'function' ? closeCustomizeModal : null],
    ['history-modal', typeof closeHistoryModal === 'function' ? closeHistoryModal : null],
  ].forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el && fn) el.addEventListener('click', (e) => { if (e.target === el) fn(); });
  });
});
