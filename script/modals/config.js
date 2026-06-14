/*
  Config Modal Logic - Abhidatta Benda Edition
*/

function openConfig() {
  document.getElementById('config-username').value = getStoredUsername();
  document.getElementById('search-engine').value = getStoredSearchEngine();
  document.getElementById('config-font-family').value = getStoredFontFamily();
  document.getElementById('config-font-url').value = getStoredFontUrl();
  document.getElementById('config-key-close').value = getStoredKeyCloseTab();
  document.getElementById('config-key-new').value = getStoredKeyNewTab();
  
  document.getElementById('config-enable-hint').checked = getStoredEnableAutocompleteHint();
  document.getElementById('config-enable-dropdown').checked = getStoredEnableSuggestionDropdown();
  document.getElementById('config-enable-dropdown-nav').checked = getStoredEnableDropdownNavigation();
  document.getElementById('config-enable-status-line').checked = getStoredEnableStatusLine();
  document.getElementById('config-enable-calculator').checked = getStoredEnableInlineCalculator();
  document.getElementById('config-enable-autofocus').checked = getStoredEnableAutofocus();
  
  const rounding = getStoredBarRounding();
  const roundingInput = document.getElementById('config-bar-rounding');
  const roundingDisplay = document.getElementById('rounding-value-display');
  if (roundingInput && roundingDisplay) {
    roundingInput.value = rounding;
    roundingDisplay.textContent = `${rounding}px`;
    
    // Live preview
    roundingInput.oninput = () => {
      roundingDisplay.textContent = `${roundingInput.value}px`;
      _applyLiveRounding(roundingInput.value);
    };
  }

  if (typeof syncCustomDropdowns === 'function') {
    syncCustomDropdowns();
  }

  document.getElementById('config-modal').classList.add('active');
}

function closeConfig() {
  document.getElementById('config-modal').classList.remove('active');
  // Re-apply stored settings in case they cancelled
  applyBarRounding(getStoredBarRounding());
  if (typeof window.setTerminalDormant === 'function') window.setTerminalDormant();
}

function saveConfig() {
  const u = document.getElementById('config-username').value.trim();
  const e = document.getElementById('search-engine').value;
  const f = document.getElementById('config-font-family').value.trim();
  const l = document.getElementById('config-font-url').value.trim();
  const kc = document.getElementById('config-key-close').value.trim().toLowerCase();
  const kn = document.getElementById('config-key-new').value.trim().toLowerCase();
  const r = document.getElementById('config-bar-rounding').value;
  
  const eh = document.getElementById('config-enable-hint').checked;
  const ed = document.getElementById('config-enable-dropdown').checked;
  const edn = document.getElementById('config-enable-dropdown-nav').checked;
  const esl = document.getElementById('config-enable-status-line').checked;
  const ec = document.getElementById('config-enable-calculator').checked;
  const eaf = document.getElementById('config-enable-autofocus').checked;
  
  if (u) saveUsername(u);
  saveSearchEngine(e);
  saveFontFamily(f);
  saveFontUrl(l);
  if (kc) saveKeyCloseTab(kc);
  if (kn) saveKeyNewTab(kn);
  saveBarRounding(r);
  saveEnableAutocompleteHint(eh);
  saveEnableSuggestionDropdown(ed);
  saveEnableDropdownNavigation(edn);
  saveEnableStatusLine(esl);
  saveEnableInlineCalculator(ec);
  saveEnableAutofocus(eaf);

  // Trigger immediate visibility update for the clock greeting line
  if (typeof updateStatusLineVisibility === 'function') {
    updateStatusLineVisibility();
  }
  
  applyUserFont(f, l);
  applyBarRounding(r);
  
  // Re-run updates immediately
  const inputEl = document.getElementById('terminal-input');
  if (inputEl) {
    updateSyntaxHighlight(inputEl.value);
  }
  
  closeConfig();
  showToast('Settings Saved', 'success');
}

function _applyLiveRounding(val) {
  document.documentElement.style.setProperty('--bar-rounding', `${val}px`);
}
