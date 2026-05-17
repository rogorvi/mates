// storage.js — capa fina sobre localStorage
// Estructura:
//   mates:profiles      → array de { id, name, color, emoji, level, createdAt }
//   mates:active        → id del perfil activo
//   mates:p:<id>:state  → estado por perfil (cards, stats, history)

const Store = (() => {
  const KEY_PROFILES = 'mates:profiles';
  const KEY_ACTIVE = 'mates:active';
  const stateKey = (id) => `mates:p:${id}:state`;

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function listProfiles() {
    return readJSON(KEY_PROFILES, []);
  }
  function saveProfiles(arr) { writeJSON(KEY_PROFILES, arr); }

  function getActiveId() { return localStorage.getItem(KEY_ACTIVE); }
  function setActiveId(id) {
    if (id) localStorage.setItem(KEY_ACTIVE, id);
    else localStorage.removeItem(KEY_ACTIVE);
  }

  function createProfile({ name, color, emoji }) {
    const profile = {
      id: uid(),
      name: name.trim() || 'Niño/a',
      color: color || '#4f7cff',
      emoji: emoji || '🦊',
      level: 1,
      // Modo de escritura: 'mixed' alterna teclado y dibujar a mano,
      // 'handwriting' siempre a mano, 'keypad' siempre teclado.
      writingMode: 'mixed',
      createdAt: Date.now(),
    };
    const arr = listProfiles();
    arr.push(profile);
    saveProfiles(arr);
    writeJSON(stateKey(profile.id), defaultState());
    return profile;
  }

  function updateProfile(id, patch) {
    const arr = listProfiles();
    const idx = arr.findIndex(p => p.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...patch };
    saveProfiles(arr);
    return arr[idx];
  }

  function deleteProfile(id) {
    saveProfiles(listProfiles().filter(p => p.id !== id));
    localStorage.removeItem(stateKey(id));
    if (getActiveId() === id) setActiveId(null);
  }

  function getProfile(id) {
    return listProfiles().find(p => p.id === id) || null;
  }

  function defaultState() {
    return {
      cards: {},        // skillId → { box, dueAt, correct, wrong, lastSeen }
      stats: {
        totalSessions: 0,
        totalCorrect: 0,
        totalWrong: 0,
        streakDays: 0,
        lastSessionDate: null,
      },
      history: [],      // [{ date, correct, wrong, durationSec, level }]
    };
  }

  function getState(id) {
    let s = readJSON(stateKey(id), null);
    if (!s) { s = defaultState(); writeJSON(stateKey(id), s); }
    // Migración defensiva
    if (!s.cards) s.cards = {};
    if (!s.stats) s.stats = defaultState().stats;
    if (!s.history) s.history = [];
    return s;
  }

  function saveState(id, s) { writeJSON(stateKey(id), s); }

  function resetState(id) { writeJSON(stateKey(id), defaultState()); }

  function exportProfile(id) {
    const profile = getProfile(id);
    const state = getState(id);
    return JSON.stringify({ profile, state, exportedAt: Date.now(), version: 1 }, null, 2);
  }

  function importProfile(jsonText) {
    const data = JSON.parse(jsonText);
    if (!data.profile || !data.state) throw new Error('Archivo no válido');
    const arr = listProfiles();
    // Renombrar si ya existe ID
    let p = data.profile;
    if (arr.some(x => x.id === p.id)) p = { ...p, id: uid() };
    arr.push(p);
    saveProfiles(arr);
    writeJSON(stateKey(p.id), data.state);
    return p;
  }

  return {
    listProfiles, getActiveId, setActiveId,
    createProfile, updateProfile, deleteProfile, getProfile,
    getState, saveState, resetState,
    exportProfile, importProfile,
  };
})();
