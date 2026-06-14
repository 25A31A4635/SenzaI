// ========================================
// Customize Modal — Appearance & Wallpaper Customizer
// ========================================

const THEME_DEFS = [
  { value: 'light',                label: 'Light'       },
  { value: 'dark',                 label: 'Dark'        },
  { value: 'black',                label: 'Black'       },
  { value: 'nord',                 label: 'Nord'        },
  { value: 'gruvbox',              label: 'Gruvbox'     },
  { value: 'tokyo-night',          label: 'Tokyo Night' },
  { value: 'dracula',              label: 'Dracula'     },
  { value: 'kanagawa',             label: 'Kanagawa'    },
  { value: 'catppuccin-frappe',    label: 'CTP Frappe'  },
  { value: 'catppuccin-macchiato', label: 'CTP Macchiato'},
  { value: 'catppuccin-mocha',     label: 'CTP Mocha'   },
];

let _selectedTheme = null;
let _originalWallpaperIndex = -1;

// ---- Open / Close ----
function openCustomizeModal() {
  _selectedTheme = getStoredTheme();
  _originalWallpaperIndex = getStoredWallpaperIndex();
  
  _renderCustomizeModal();
  
  // Hydrate wallpaper schedule cycles dropdown
  document.getElementById('config-wallpaper-schedule').value = getStoredWallpaperSchedule();
  
  // Hydrate brightness range slider and live preview handlers
  const brightness = getStoredWallpaperBrightness();
  const brightnessInput = document.getElementById('config-wallpaper-brightness');
  const brightnessDisplay = document.getElementById('brightness-value-display');
  if (brightnessInput && brightnessDisplay) {
    brightnessInput.value = brightness;
    brightnessDisplay.textContent = `${brightness}%`;
    
    brightnessInput.oninput = () => {
      brightnessDisplay.textContent = `${brightnessInput.value}%`;
      _applyLiveBrightness(brightnessInput.value);
    };
  }
  
  updateWallpaperStatus();

  if (typeof syncCustomDropdowns === 'function') {
    syncCustomDropdowns();
  }

  document.getElementById('customize-modal').classList.add('active');
}

function closeCustomizeModal() {
  // Revert active settings in case they cancelled
  applyTheme(getStoredTheme());
  applyWallpaperBrightness(getStoredWallpaperBrightness());
  setWallpaperByIndex(_originalWallpaperIndex);
  
  document.getElementById('customize-modal').classList.remove('active');
}

// ---- Render Themes ----
function _renderCustomizeModal() {
  const themeGrid = document.getElementById('customize-theme-grid');
  themeGrid.innerHTML = '';

  THEME_DEFS.forEach(({ value, label }) => {
    const btn = document.createElement('button');
    btn.className = 'customize-theme-btn' + (value === _selectedTheme ? ' active-theme' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      _selectedTheme = value;
      applyTheme(value);
      themeGrid.querySelectorAll('.customize-theme-btn').forEach(b => b.classList.remove('active-theme'));
      btn.classList.add('active-theme');
    });
    themeGrid.appendChild(btn);
  });
}

// ---- Save Customizations ----
function saveCustomize() {
  if (_selectedTheme) {
    saveTheme(_selectedTheme);
    applyTheme(_selectedTheme);
  }
  
  const ws = document.getElementById('config-wallpaper-schedule').value;
  const wb = document.getElementById('config-wallpaper-brightness').value;
  
  saveWallpaperSchedule(ws);
  saveWallpaperBrightness(wb);
  applyWallpaperBrightness(wb);
  
  document.getElementById('customize-modal').classList.remove('active');
  showToast('Appearance updated', 'success');
}

// ---- Wallpaper Configuration Helpers ----

function _applyLiveBrightness(val) {
  const opacity = (100 - Number(val)) / 100;
  document.documentElement.style.setProperty('--wallpaper-overlay-opacity', opacity);
}

function updateWallpaperStatus() {
  const status = document.getElementById('wallpaper-status');
  if (!status || typeof getWallpaperSummary !== 'function') return;

  const summary = getWallpaperSummary();
  if (summary.count === 0) {
    status.textContent = 'No wallpapers added.';
    renderWallpaperGallery();
    return;
  }

  const label = summary.count === 1 ? 'wallpaper' : 'wallpapers';
  status.textContent = `${summary.count} ${label} added${summary.currentName ? ` - Current: ${summary.currentName}` : ''}.`;
  renderWallpaperGallery();
}

function renderWallpaperGallery() {
  const gallery = document.getElementById('wallpaper-gallery');
  if (!gallery) return;

  const wallpapers = getStoredWallpapers();
  const currentIndex = getStoredWallpaperIndex();
  gallery.innerHTML = '';

  if (wallpapers.length === 0) {
    gallery.classList.add('empty');
    return;
  }

  gallery.classList.remove('empty');
  wallpapers.forEach((wallpaper, index) => {
    const tile = document.createElement('div');
    tile.className = 'wallpaper-tile' + (index === currentIndex ? ' active' : '');

    const preview = document.createElement('button');
    preview.type = 'button';
    preview.className = 'wallpaper-preview';
    preview.title = wallpaper.name || 'Wallpaper';
    preview.addEventListener('click', () => {
      setWallpaperById(wallpaper.id);
      updateWallpaperStatus();
    });

    const img = document.createElement('img');
    img.src = wallpaper.src;
    img.alt = wallpaper.name || 'Wallpaper';

    const name = document.createElement('span');
    name.className = 'wallpaper-name';
    name.textContent = wallpaper.name || `Wallpaper ${index + 1}`;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'wallpaper-remove';
    remove.title = 'Remove wallpaper';
    remove.textContent = 'x';
    remove.addEventListener('click', () => {
      removeWallpaperById(wallpaper.id);
      updateWallpaperStatus();
    });

    preview.appendChild(img);
    preview.appendChild(name);
    tile.appendChild(preview);
    tile.appendChild(remove);
    gallery.appendChild(tile);
  });
}

async function handleWallpaperUpload(e) {
  try {
    const added = await addWallpaperFiles(e.target.files);
    if (added === 0) return;
    e.target.value = '';
    updateWallpaperStatus();
    showToast(`${added} wallpaper${added === 1 ? '' : 's'} added`, 'success');
  } catch {
    showAlert('Only image files can be used as wallpapers.', { title: 'Wallpaper Import Failed' });
  }
}

async function handleClearWallpapers() {
  const confirmed = await showConfirm('Remove all saved wallpapers?', {
    title: 'Clear Wallpapers',
    confirmLabel: 'Clear',
    cancelLabel: 'Cancel'
  });

  if (!confirmed) return;

  clearWallpapers();
  updateWallpaperStatus();
  showToast('Wallpapers cleared', 'success');
}

function handleNextWallpaper() {
  const summary = getWallpaperSummary();
  if (summary.count === 0) {
    showToast('Add wallpapers first', 'info');
    return;
  }

  advanceWallpaper();
  updateWallpaperStatus();
}
