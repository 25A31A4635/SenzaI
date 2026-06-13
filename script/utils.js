/**
 * SenzaI - Shared Utilities
 * Author: Abhidatta Benda
 * 
 * Contains global constants and utility functions used across the app.
 */

const HANDLED_INTERNALLY = Symbol('handled');

/**
 * The official list of supported themes.
 * These correspond to class names like 'dark-mode', 'dracula-mode', etc.
 */
const THEMES = [
    'light', 'dark', 'black', 'nord', 'gruvbox', 'tokyo-night', 'dracula', 'kanagawa',
    'catppuccin-frappe', 'catppuccin-macchiato', 'catppuccin-mocha'
];

/**
 * Resets search-related styles on an array of elements.
 */
function resetStyles(elements) {
    elements.forEach(el => {
        el.classList.remove("bookmark-match", "bookmark-nomatch", "primary-match");
        el.style.mixBlendMode = "";
    });
}

/**
 * Returns a function that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
