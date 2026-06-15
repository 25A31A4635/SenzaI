/*
  Event Wiring - Abhidatta Benda Edition
*/

document.addEventListener('DOMContentLoaded', () => {

  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  // --- Modal Openers ---
  on('btn-edit-bookmarks',     () => openBookmarksModal());
  on('btn-customize-from-config', () => { closeConfig(); openCustomizeModal(); });
  on('btn-import-backup',      () => importBackup());
  on('btn-export-backup',      () => exportBackup());
  on('btn-reset-defaults',     () => resetToDefaults());

  // --- Config Modal ---
  on('btn-cancel-config',      () => closeConfig());
  on('btn-save-config',        () => saveConfig());

  // --- Help Modal ---
  on('btn-close-help',         () => closeHelp());

  // --- Bookmarks Modal ---
  on('toggle-editor-btn',      () => toggleEditorMode());
  on('btn-cancel-bookmarks',   () => closeBookmarksModal());
  on('btn-save-bookmarks',     () => saveBookmarksFromModal());
  on('btn-back-bookmarks',     () => closeBookmarksModal());

  // --- Search Engines Modal ---
  on('btn-edit-searchengines',   () => { closeConfig(); openSearchEnginesModal(); });
  on('btn-cancel-searchengines', () => closeSearchEnginesModal());
  on('btn-save-searchengines',   () => saveSearchEnginesFromModal());
  on('btn-back-searchengines',   () => closeSearchEnginesModal());

  // --- Customize Modal ---
  on('btn-cancel-customize',   () => closeCustomizeModal());
  on('btn-save-customize',     () => saveCustomize());

  // --- History Modal ---
  on('btn-clear-history',      () => clearHistory());
  on('btn-close-history',      () => closeHistoryModal());

  // --- Live Results Click Interception ---
  const liveResults = document.getElementById('live-results');
  if (liveResults) {
    liveResults.addEventListener('click', (e) => {
      const item = e.target.closest('.live-result-item');
      if (item) {
        e.preventDefault();
        const href = item.getAttribute('href');
        if (typeof navigate === 'function') {
          navigate(href);
        } else {
          window.location.href = href;
        }
      }
    });
  }

});
