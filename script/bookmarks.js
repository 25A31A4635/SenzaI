// ========================================
// Bookmarks Helper - SenzaI Edition
// ========================================

/**
 * Returns filtered bookmarks matching the raw query value.
 * Used for autocompletion hints and exact keyword routing.
 */
function getFilteredBookmarks(rawValue) {
  const value = (rawValue || '').trim().toLowerCase();
  if (!value) return [];
  
  const upfront = getStoredBookmarks();
  const shelf = getStoredShelfBookmarks();
  const all = [
    ...upfront.map(bm => ({ ...bm, type: 'link' })),
    ...shelf.map(bm => ({ ...bm, type: 'shelf' }))
  ];

  // Prioritize startsWith, then includes
  const startsWith = all.filter(bm => bm.title.toLowerCase().startsWith(value));
  const includes = all.filter(bm => !bm.title.toLowerCase().startsWith(value) && bm.title.toLowerCase().includes(value));
  
  return [...startsWith, ...includes];
}