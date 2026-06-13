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

  document.getElementById('config-modal').classList.add('active');
}

function closeConfig() {
  document.getElementById('config-modal').classList.remove('active');
  // Re-apply stored rounding in case they cancelled
  applyBarRounding(getStoredBarRounding());
}

function saveConfig() {
  const u = document.getElementById('config-username').value.trim();
  const e = document.getElementById('search-engine').value;
  const f = document.getElementById('config-font-family').value.trim();
  const l = document.getElementById('config-font-url').value.trim();
  const kc = document.getElementById('config-key-close').value.trim().toLowerCase();
  const kn = document.getElementById('config-key-new').value.trim().toLowerCase();
  const r = document.getElementById('config-bar-rounding').value;
  
  if (u) saveUsername(u);
  saveSearchEngine(e);
  saveFontFamily(f);
  saveFontUrl(l);
  if (kc) saveKeyCloseTab(kc);
  if (kn) saveKeyNewTab(kn);
  saveBarRounding(r);
  
  applyUserFont(f, l);
  applyBarRounding(r);
  
  closeConfig();
  showToast('Settings Saved', 'success');
}

function _applyLiveRounding(val) {
  document.documentElement.style.setProperty('--bar-rounding', `${val}px`);
}

// Wire up buttons
document.getElementById('btn-save-config').addEventListener('click', saveConfig);
document.getElementById('btn-cancel-config').addEventListener('click', closeConfig);
