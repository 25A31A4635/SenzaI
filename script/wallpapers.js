/**
 * SenzaI - Wallpaper Logic
 *
 * Handles user-provided wallpapers and scheduled cycling.
 */

const WALLPAPER_SCHEDULES = new Set(['off', 'newtab', 'hour', 'day']);

function normalizeWallpaperSchedule(schedule) {
  return WALLPAPER_SCHEDULES.has(schedule) ? schedule : 'off';
}

function getWallpaperCycleBucket(schedule, now = new Date()) {
  if (schedule === 'hour') {
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
  }
  if (schedule === 'day') {
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  }
  return '';
}

function getCurrentWallpaper() {
  const wallpapers = getStoredWallpapers();
  if (wallpapers.length === 0) return null;

  const storedIndex = getStoredWallpaperIndex();
  const index = storedIndex >= 0 && storedIndex < wallpapers.length ? storedIndex : 0;
  if (index !== storedIndex) saveWallpaperIndex(index);

  return wallpapers[index];
}

function setWallpaperByIndex(index) {
  const wallpapers = getStoredWallpapers();
  if (wallpapers.length === 0) {
    clearAppliedWallpaper();
    return null;
  }

  const nextIndex = ((index % wallpapers.length) + wallpapers.length) % wallpapers.length;
  saveWallpaperIndex(nextIndex);
  applyWallpaper(wallpapers[nextIndex]);
  return wallpapers[nextIndex];
}

function setWallpaperById(id) {
  const wallpapers = getStoredWallpapers();
  const index = wallpapers.findIndex((wallpaper) => wallpaper.id === id);
  if (index === -1) return null;

  return setWallpaperByIndex(index);
}

function advanceWallpaper() {
  const wallpapers = getStoredWallpapers();
  if (wallpapers.length === 0) {
    clearAppliedWallpaper();
    return null;
  }

  return setWallpaperByIndex(getStoredWallpaperIndex() + 1);
}

function applyWallpaper(wallpaper) {
  if (!wallpaper || !wallpaper.src) {
    clearAppliedWallpaper();
    return;
  }

  document.documentElement.style.setProperty('--wallpaper-image', `url("${wallpaper.src}")`);
  document.body.classList.add('has-wallpaper');
}

function clearAppliedWallpaper() {
  document.documentElement.style.removeProperty('--wallpaper-image');
  document.body.classList.remove('has-wallpaper');
}

function applyScheduledWallpaper() {
  const wallpapers = getStoredWallpapers();
  if (wallpapers.length === 0) {
    clearAppliedWallpaper();
    return;
  }

  const schedule = normalizeWallpaperSchedule(getStoredWallpaperSchedule());
  if (schedule === 'newtab') {
    advanceWallpaper();
    return;
  }

  if (schedule === 'hour' || schedule === 'day') {
    const bucket = getWallpaperCycleBucket(schedule);
    if (bucket !== getStoredWallpaperCycleBucket()) {
      advanceWallpaper();
      saveWallpaperCycleBucket(bucket);
      return;
    }
  }

  applyWallpaper(getCurrentWallpaper());
}

function readWallpaperFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Unsupported file type'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      src: reader.result,
      addedAt: new Date().toISOString()
    });
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

async function addWallpaperFiles(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) return 0;

  const nextWallpapers = [];
  for (const file of files) {
    nextWallpapers.push(await readWallpaperFile(file));
  }

  const existing = getStoredWallpapers();
  saveWallpapers([...existing, ...nextWallpapers]);

  if (existing.length === 0) {
    setWallpaperByIndex(0);
  } else {
    applyWallpaper(getCurrentWallpaper());
  }

  return nextWallpapers.length;
}

function clearWallpapers() {
  saveWallpapers([]);
  saveWallpaperIndex(-1);
  saveWallpaperCycleBucket('');
  clearAppliedWallpaper();
}

function removeWallpaperById(id) {
  const wallpapers = getStoredWallpapers();
  const removeIndex = wallpapers.findIndex((wallpaper) => wallpaper.id === id);
  if (removeIndex === -1) return false;

  const currentIndex = getStoredWallpaperIndex();
  const nextWallpapers = wallpapers.filter((wallpaper) => wallpaper.id !== id);
  saveWallpapers(nextWallpapers);

  if (nextWallpapers.length === 0) {
    saveWallpaperIndex(-1);
    clearAppliedWallpaper();
    return true;
  }

  let nextIndex = currentIndex;
  if (removeIndex < currentIndex) nextIndex = currentIndex - 1;
  if (removeIndex === currentIndex) nextIndex = Math.min(removeIndex, nextWallpapers.length - 1);
  setWallpaperByIndex(nextIndex);
  return true;
}

function getWallpaperSummary() {
  const wallpapers = getStoredWallpapers();
  const current = getCurrentWallpaper();
  return {
    count: wallpapers.length,
    currentIndex: getStoredWallpaperIndex(),
    currentName: current ? current.name : ''
  };
}
