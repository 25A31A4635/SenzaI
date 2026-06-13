// ========================================
// Customize Modal — Theme Switcher
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

// ---- Open / Close ----
function openCustomizeModal() {
  _renderCustomizeModal();
  document.getElementById('customize-modal').classList.add('active');
}

function closeCustomizeModal() {
  document.getElementById('customize-modal').classList.remove('active');
}

// ---- Render ----
function _renderCustomizeModal() {
  const currentTheme = getStoredTheme();
  const themeGrid = document.getElementById('customize-theme-grid');
  themeGrid.innerHTML = '';

  THEME_DEFS.forEach(({ value, label }) => {
    const btn = document.createElement('button');
    btn.className = 'customize-theme-btn' + (value === currentTheme ? ' active-theme' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      _applyTheme(value);
      themeGrid.querySelectorAll('.customize-theme-btn').forEach(b => b.classList.remove('active-theme'));
      btn.classList.add('active-theme');
    });
    themeGrid.appendChild(btn);
  });
}

function _applyTheme(theme) {
  THEMES.forEach(t => {
    document.body.classList.remove(`${t}-mode`);
    document.documentElement.classList.remove(`${t}-mode`);
  });
  if (theme !== 'light') {
    document.documentElement.classList.add(`${theme}-mode`);
  }
  saveTheme(theme);
}

// ---- Save ----
function saveCustomize() {
  closeCustomizeModal();
  showToast('Theme updated', 'success');
}
