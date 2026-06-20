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
  on('btn-add-bookmark',       () => {
    const grid = document.getElementById('bookmarks-grid-editor');
    if (grid) {
      _addBookmarkRow({ title: '', href: '' }, grid, grid.children.length);
    }
  });

  // --- Search Engines Modal ---
  on('btn-edit-searchengines',   () => { closeConfig(); openSearchEnginesModal(); });
  on('btn-cancel-searchengines', () => closeSearchEnginesModal());
  on('btn-save-searchengines',   () => saveSearchEnginesFromModal());
  on('btn-back-searchengines',   () => closeSearchEnginesModal());
  on('btn-add-searchengine',     () => {
    const grid = document.getElementById('searchengines-grid-editor');
    if (grid) {
      _addSearchEngineRow({ prefix: '', url: '' }, grid, grid.children.length);
    }
  });

  // --- Customize Modal ---
  on('btn-cancel-customize',   () => closeCustomizeModal());
  on('btn-save-customize',     () => saveCustomize());

  // --- History Modal ---
  on('btn-clear-history',      () => clearHistory());
  on('btn-close-history',      () => closeHistoryModal());



});
