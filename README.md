# SenzaI

The ultimate minimalist quicklink launcher. High-performance, keyboard-driven, and meticulously designed for clarity.

Developed by **Abhidatta Benda**.

## ✨ Key Features

- **Extreme Minimalism:** No grid, no clutter. A single floating search bar that activates only when you're ready.
- **Fish-Shell Style Auto-fill:** Instant ghost-text hints as you type, prioritizing your own bookmarks.
- **Keyboard Native Workflow:**
  - `Tab` or `→`: Accept and complete the ghost-text hint.
  - `↑` / `↓`: Navigate through your command and search history.
  - `Space` / `Enter`: Activate the dormant bar.
  - `Escape`: Deactivate and lock the bar.
- **Built-in Tab Management:**
  - `t` (Dormant State): Open a new SenzaI tab instantly.
  - `x` (Dormant State): Close the current tab.
- **Premium Themes:** Professionally curated palettes including **Dracula**, **Kanagawa**, and the full **Catppuccin** series (Frappé, Macchiato, Mocha).
- **Custom Typography:** Support for any Google Font or local font family (defaulting to **JetBrains Mono**).
- **Geometric Customization:** Adjustable bar rounding (from sharp corners to full pill shape).
- **Sync & Backup:** Full JSON export/import support for seamless setup migration across browsers.

## 🛠 Usage & Commands

1. **Activate:** Press `Space` or `Enter` to wake the search bar.
2. **Navigate:** Type your bookmark title and press `Enter`.
3. **Search:** Use prefixes like `yt:` (YouTube), `gh:` (GitHub), `r:` (Reddit), or `ddg:` (DuckDuckGo).
4. **Configure:** Type `:config` to manage settings, keybinds, and backups.
5. **Customize:** Type `:customize` to switch themes.
6. **Bookmarks:** Type `:bookmarks` (or `:bm`) to manage your quicklinks in a unified editor.

## 📦 Installation (Developer Mode)

1. Clone or download this repository.
2. Open your browser and navigate to the Extensions page (`chrome://extensions` for Chrome, `about:debugging` for Firefox).
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the root folder of this project.

## 📝 For Developers / Forkers

SenzaI is built with pure, modern Vanilla JavaScript and CSS. 
- `script/script.js`: Main entry point and global state.
- `script/terminal.js`: Logic for input, hints, and completion.
- `script/storage.js`: Persistence layer for user settings.
- `script/commands.js`: The central router for all terminal submissions.

---

Created with ❤️ by **Abhidatta Benda**.
