// srs.js — Motor de repaso espaciado (Leitner) y planificación de sesión.

const BOX_INTERVALS_MIN = [0, 0, 10, 60*24, 3*60*24, 7*60*24, 14*60*24];
// caja 1 → repaso casi inmediato (misma sesión)
// caja 2 → 10 min
// caja 3 → 1 día
// caja 4 → 3 días
// caja 5 → 7 días
// caja 6 → 14 días

const SRS = (() => {
  const MIN = 60 * 1000;
  const TARGET_PER_SESSION = 10;
  const MAX_NEW_PER_SESSION = 4;

  function nowMs() { return Date.now(); }

  function makeCard() {
    return { box: 1, dueAt: 0, correct: 0, wrong: 0, lastSeen: 0 };
  }

  function availableSkills(profileLevel) {
    const skills = [];
    for (const lvl of Exercises.LEVELS) {
      if (lvl.id <= profileLevel) skills.push(...lvl.skills);
    }
    return skills;
  }

  // Una habilidad se considera "graduada" cuando el niño la domina y ya
  // ha avanzado lo suficiente en el currículo como para que sea aburrido
  // o trivial seguir repasándola (p. ej. "contar puntos hasta 5" cuando
  // ya está resolviendo ecuaciones).
  function isGraduated(card, skillLevel, currentLevel) {
    if (!card) return false;
    const gap = currentLevel - skillLevel;
    if (card.box >= 6) return true;                       // siempre graduada en caja máxima
    if (card.box >= 5 && gap >= 2) return true;
    if (card.box >= 4 && gap >= 4) return true;
    if (card.box >= 3 && gap >= 8) return true;           // niños muy avanzados
    return false;
  }

  function skillLevelOf(id) {
    const sk = Exercises.SKILLS[id];
    return (sk && sk.level) || 1;
  }

  // Devuelve los skillIds que toca trabajar hoy.
  // 1) cards vencidas no graduadas, 2) skills nuevos del nivel actual,
  // 3) si sobra hueco, próximas a vencer.
  function planSession(profileLevel, cards, limit = TARGET_PER_SESSION) {
    const now = nowMs();
    const allSkills = availableSkills(profileLevel);
    const seenSet = new Set(Object.keys(cards));

    const due = [];
    const future = [];
    for (const id of allSkills) {
      const c = cards[id];
      if (!c) continue;
      const lvl = skillLevelOf(id);
      if (isGraduated(c, lvl, profileLevel)) continue;     // ← clave
      if (c.dueAt <= now) due.push({ id, card: c });
      else future.push({ id, card: c });
    }
    due.sort((a,b) => a.card.box - b.card.box || a.card.dueAt - b.card.dueAt);
    future.sort((a,b) => a.card.dueAt - b.card.dueAt);

    // Skills nuevos: priorizamos los del nivel actual y los del nivel inmediatamente
    // anterior (refuerzo). Evitamos introducir cosas muy básicas cuando el niño
    // ya va lejos.
    const newSkills = allSkills.filter(id => !seenSet.has(id))
      .sort((a, b) => skillLevelOf(b) - skillLevelOf(a));  // nivel alto primero

    const plan = [];
    for (const x of due) { if (plan.length >= limit) break; plan.push(x.id); }

    let added = 0;
    for (const id of newSkills) {
      if (plan.length >= limit) break;
      if (added >= MAX_NEW_PER_SESSION) break;
      plan.push(id);
      added++;
    }

    for (const x of future) { if (plan.length >= limit) break; plan.push(x.id); }

    // Si está casi vacío (perfil con todo graduado), rellena con skills del nivel actual
    if (plan.length === 0) {
      const currentLevelSkills = (Exercises.LEVELS.find(l => l.id === profileLevel) || {}).skills || [];
      plan.push(...currentLevelSkills.slice(0, limit));
    }
    return plan;
  }

  function rateCard(card, correct) {
    if (!card) card = makeCard();
    card.lastSeen = nowMs();
    if (correct) {
      card.correct++;
      card.box = Math.min(card.box + 1, 6);
    } else {
      card.wrong++;
      card.box = 1;
    }
    const interval = BOX_INTERVALS_MIN[card.box] * MIN;
    card.dueAt = nowMs() + interval;
    return card;
  }

  // Sube de nivel si todas las skills del nivel actual están en caja >= 3
  // y tienen al menos 3 aciertos.
  function maybePromote(profileLevel, cards) {
    const level = Exercises.LEVELS.find(l => l.id === profileLevel);
    if (!level) return profileLevel;
    const nextExists = Exercises.LEVELS.some(l => l.id === profileLevel + 1);
    if (!nextExists) return profileLevel;
    const ok = level.skills.every(id => {
      const c = cards[id];
      return c && c.box >= 3 && c.correct >= 3;
    });
    return ok ? profileLevel + 1 : profileLevel;
  }

  function levelMeta(levelId) {
    return Exercises.LEVELS.find(l => l.id === levelId);
  }

  return {
    BOX_INTERVALS_MIN, TARGET_PER_SESSION,
    makeCard, availableSkills, planSession, rateCard, maybePromote,
    levelMeta, isGraduated, skillLevelOf,
  };
})();
