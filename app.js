// app.js — Enrutador, vistas y lógica de UI.

const App = (() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const COLORS = ['#4f7cff','#ff6b6b','#ffd166','#2ecc71','#a78bfa','#ff9f43','#48c6ef','#ec407a'];
  const EMOJIS = ['🦊','🐼','🐯','🦄','🐧','🐸','🐙','🐝','🦁','🐰','🦋','🐳','🐢','🐶','🐱','🐵'];

  const ENCOURAGE_GOOD = ['¡Muy bien!','¡Genial!','¡Eres un crack!','¡Sigue así!','¡Bravo!'];
  const ENCOURAGE_TRY  = ['Casi, prueba otra vez','Estás cerca','Mira con calma'];

  // ─────── Estado de runtime ───────
  let activeProfile = null;
  let state = null;
  let route = 'profiles';
  let session = null;        // { plan, idx, correct, wrong, startedAt, currentEx }

  // ─────── Boot ───────
  function start() {
    const activeId = Store.getActiveId();
    if (activeId && Store.getProfile(activeId)) {
      activeProfile = Store.getProfile(activeId);
      state = Store.getState(activeProfile.id);
      go('home');
    } else {
      go('profiles');
    }
    $('#back-btn').addEventListener('click', onBack);
  }

  function go(name, opts={}) {
    route = name;
    const app = $('#app');
    app.innerHTML = '';
    document.getElementById('topbar').hidden = (name === 'profiles');
    if (name === 'home') document.getElementById('topbar').hidden = true;

    const tpl = document.getElementById('tpl-' + name);
    if (!tpl) return;
    const node = tpl.content.cloneNode(true);
    app.appendChild(node);

    if (name === 'profiles')        renderProfiles();
    if (name === 'create-profile')  renderCreateProfile();
    if (name === 'home')            renderHome();
    if (name === 'leveltest')       renderLevelTest();
    if (name === 'session')         renderSession();
    if (name === 'session-summary') renderSessionSummary(opts);
    if (name === 'progress')        renderProgress();
    if (name === 'orient')          renderOrient();

    setTopTitle(name);
  }

  function setTopTitle(name) {
    const t = $('#topbar-title');
    const map = {
      'create-profile': 'Nuevo perfil',
      'leveltest':      'Prueba de nivel',
      'session':        'Sesión',
      'session-summary':'Resumen',
      'progress':       'Mi progreso',
      'orient':         'Orientador',
    };
    t.textContent = map[name] || 'Mates';
  }

  function onBack() {
    if (route === 'session') {
      if (confirm('¿Salir de la sesión? Se perderá el progreso de esta sesión.')) {
        go('home');
      }
      return;
    }
    if (['progress','orient','session-summary'].includes(route)) return go('home');
    if (route === 'home') return go('profiles');
    if (route === 'create-profile') return go('profiles');
    if (route === 'leveltest') {
      if (confirm('¿Saltar la prueba de nivel? Empezarás en el nivel 1.')) {
        Store.updateProfile(activeProfile.id, { level: 1 });
        activeProfile.level = 1;
        go('home');
      }
      return;
    }
    go('profiles');
  }

  // ─────────────────────── PROFILES ───────────────────────
  function renderProfiles() {
    const grid = $('#profile-grid');
    const profiles = Store.listProfiles();
    grid.innerHTML = '';
    profiles.forEach(p => {
      const card = document.createElement('button');
      card.className = 'profile-card';
      card.innerHTML = `
        <div class="avatar" style="background:${p.color}33;color:${p.color}">${p.emoji}</div>
        <div class="pname">${escapeHtml(p.name)}</div>
        <div class="muted small">${SRS.levelMeta(p.level)?.name || 'Nivel 1'}</div>
      `;
      card.addEventListener('click', () => selectProfile(p.id));
      card.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (confirm(`¿Eliminar el perfil de ${p.name}? Esta acción no se puede deshacer.`)) {
          Store.deleteProfile(p.id);
          renderProfiles();
        }
      });
      grid.appendChild(card);
    });
    $('#add-profile-btn').onclick = () => go('create-profile');
  }

  function selectProfile(id) {
    activeProfile = Store.getProfile(id);
    state = Store.getState(id);
    Store.setActiveId(id);
    go('home');
  }

  // ─────────────────────── CREATE PROFILE ───────────────────────
  function renderCreateProfile() {
    const cRow = $('#color-row');
    const eRow = $('#emoji-row');
    let selColor = COLORS[0];
    let selEmoji = EMOJIS[0];

    COLORS.forEach(c => {
      const d = document.createElement('button');
      d.type = 'button';
      d.className = 'color-dot' + (c === selColor ? ' selected' : '');
      d.style.background = c;
      d.onclick = () => {
        selColor = c;
        $$('.color-dot', cRow).forEach(el => el.classList.remove('selected'));
        d.classList.add('selected');
      };
      cRow.appendChild(d);
    });
    EMOJIS.forEach(e => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emoji-pick' + (e === selEmoji ? ' selected' : '');
      b.textContent = e;
      b.onclick = () => {
        selEmoji = e;
        $$('.emoji-pick', eRow).forEach(el => el.classList.remove('selected'));
        b.classList.add('selected');
      };
      eRow.appendChild(b);
    });

    $('#cancel-create').onclick = () => go('profiles');
    $('#save-profile').onclick = () => {
      const name = $('#new-name').value.trim();
      if (!name) { $('#new-name').focus(); return; }
      const p = Store.createProfile({ name, color: selColor, emoji: selEmoji });
      Store.setActiveId(p.id);
      activeProfile = p;
      state = Store.getState(p.id);
      go('leveltest');
    };
  }

  // ─────────────────────── HOME ───────────────────────
  function renderHome() {
    document.getElementById('topbar').hidden = true;
    const big = $('#avatar-big');
    big.textContent = activeProfile.emoji;
    big.style.background = activeProfile.color + '33';
    big.style.color = activeProfile.color;

    $('#hello-name').textContent = activeProfile.name;
    const lvl = SRS.levelMeta(activeProfile.level);
    $('#level-label').textContent = lvl ? `Nivel ${lvl.id} · ${lvl.name}` : 'Nivel 1';

    const pending = countDue();
    $('#practice-sub').textContent = pending > 0
      ? `${pending} ${pending === 1 ? 'concepto' : 'conceptos'} para repasar`
      : 'Aprender algo nuevo';

    $('#practice-btn').onclick = startSession;
    $('#progress-btn').onclick = () => go('progress');
    $('#orient-btn').onclick   = () => go('orient');
    $('#switch-profile').onclick = () => { Store.setActiveId(null); go('profiles'); };

    // Pre-carga el modelo de reconocimiento en segundo plano para que la
    // primera sesión donde toque dibujar no tenga que esperar la descarga.
    const mode = activeProfile.writingMode || 'mixed';
    if (mode !== 'keypad' && typeof Handwrite !== 'undefined') {
      Handwrite.preload();
    }
  }

  function countDue() {
    const now = Date.now();
    return Object.values(state.cards).filter(c => c.dueAt <= now).length;
  }

  // ─────────────────────── LEVEL TEST ───────────────────────
  // Test corto: una pregunta por skill clave, sube de nivel mientras acierte.
  function renderLevelTest() {
    const stage = $('#lt-stage');
    const probes = [
      { lvl: 1,  skill: 'recognize-1to5'    },
      { lvl: 2,  skill: 'count-dots-10'     },
      { lvl: 3,  skill: 'recognize-11to20'  },
      { lvl: 4,  skill: 'sequence-by-10'    },
      { lvl: 6,  skill: 'add-plus2'         },
      { lvl: 7,  skill: 'add-to-10'         },
      { lvl: 9,  skill: 'add-to-20'         },
      { lvl: 10, skill: 'sub-to-20'         },
      { lvl: 12, skill: 'mul-table'         },
      { lvl: 13, skill: 'div-by-table'      },
      { lvl: 15, skill: 'vert-sub-2d'       },
      { lvl: 17, skill: 'frac-recognize'    },
      { lvl: 19, skill: 'mcd'               },
      { lvl: 21, skill: 'frac-add-diff'     },
      { lvl: 23, skill: 'decimal-add'       },
      { lvl: 24, skill: 'signed-add'        },
      { lvl: 26, skill: 'eval-expr'         },
      { lvl: 27, skill: 'solve-linear-2'    },
      { lvl: 29, skill: 'polynomial-add'    },
      { lvl: 31, skill: 'sqrt-perfect'      },
      { lvl: 33, skill: 'pythagoras'        },
      { lvl: 35, skill: 'log-basic'         },
      { lvl: 37, skill: 'derivative-poly'   },
      { lvl: 38, skill: 'integral-poly'     },
      { lvl: 39, skill: 'trig-values'       },
    ];

    let idx = 0;
    let lastOk = 0;

    function next() {
      $('#lt-progress > span').style.width = `${(idx/probes.length)*100}%`;
      if (idx >= probes.length) return finish();
      const probe = probes[idx];
      const ex = Exercises.SKILLS[probe.skill].gen();
      renderExercise(stage, ex, (ok) => {
        if (ok) {
          lastOk = probe.lvl;
          idx++;
          setTimeout(next, 700);
        } else {
          // primer fallo → terminamos
          setTimeout(finish, 900);
        }
      });
    }

    function finish() {
      const level = Math.max(1, lastOk);
      Store.updateProfile(activeProfile.id, { level });
      activeProfile.level = level;
      const meta = SRS.levelMeta(level);
      stage.innerHTML = `
        <div class="exercise-prompt">¡Listo!</div>
        <div class="exercise-big">${meta.id}</div>
        <p class="muted" style="text-align:center">Te empezamos en:<br><strong>${meta.name}</strong></p>
        <button class="primary" id="lt-go">Empezar</button>
      `;
      $('#lt-go').onclick = () => go('home');
    }

    next();
  }

  // ─────────────────────── SESIÓN ───────────────────────
  function startSession() {
    const plan = SRS.planSession(activeProfile.level, state.cards, SRS.TARGET_PER_SESSION);
    if (plan.length === 0) {
      alert('Aún no hay ejercicios disponibles. Avisa al adulto.');
      return;
    }
    session = {
      plan,
      idx: 0,
      correct: 0,
      wrong: 0,
      startedAt: Date.now(),
      currentEx: null,
      currentSkill: null,
    };
    go('session');
  }

  function renderSession() {
    if (!session) return go('home');
    advanceSession();
  }

  function advanceSession() {
    const stage = $('#sess-stage');
    const fb = $('#sess-feedback');
    fb.textContent = '';
    fb.className = 'feedback';
    const progressBar = $('#sess-progress');
    progressBar.style.width = `${(session.idx / session.plan.length) * 100}%`;

    if (session.idx >= session.plan.length) {
      return endSession();
    }

    const skillId = session.plan[session.idx];
    const skill = Exercises.SKILLS[skillId];
    if (!skill) { session.idx++; return advanceSession(); }
    const ex = skill.gen();
    // ─── Modo adaptativo ───
    // Cuando un niño ya domina una habilidad (box ≥ 3) y la respuesta es un
    // entero no negativo, dejamos de darle opciones: tiene que teclear el
    // número él. Aumenta el desafío y desarrolla la autonomía que pide "El Método".
    const card = state.cards[skillId];
    if (ex.inputKind === 'choice'
        && !ex.forceChoice
        && card && card.box >= 3
        && Number.isInteger(ex.answer) && ex.answer >= 0) {
      ex.inputKind = 'keypad';
      delete ex.options;
    }
    session.currentSkill = skillId;
    session.currentEx = ex;

    renderExercise(stage, ex, (ok) => {
      // actualizar card SRS
      const card = state.cards[skillId] || SRS.makeCard();
      state.cards[skillId] = SRS.rateCard(card, ok);
      // actualizar stats
      if (ok) { session.correct++; state.stats.totalCorrect++; }
      else    { session.wrong++;   state.stats.totalWrong++; }
      Store.saveState(activeProfile.id, state);

      fb.textContent = ok
        ? Exercises.helpers.pick(ENCOURAGE_GOOD)
        : `Era ${formatAnswer(ex)}`;
      fb.classList.add(ok ? 'good' : 'bad');

      setTimeout(() => {
        session.idx++;
        advanceSession();
      }, ok ? 700 : 1500);
    });
  }

  function endSession() {
    const durationSec = Math.round((Date.now() - session.startedAt) / 1000);
    state.stats.totalSessions++;
    // streak
    const today = new Date(); today.setHours(0,0,0,0);
    const last = state.stats.lastSessionDate ? new Date(state.stats.lastSessionDate) : null;
    if (last) {
      const diffDays = Math.round((today - new Date(last.getFullYear(), last.getMonth(), last.getDate())) / (24*60*60*1000));
      if (diffDays === 0)      { /* misma día, no cambia racha */ }
      else if (diffDays === 1) { state.stats.streakDays = (state.stats.streakDays || 0) + 1; }
      else                     { state.stats.streakDays = 1; }
    } else {
      state.stats.streakDays = 1;
    }
    state.stats.lastSessionDate = today.getTime();

    state.history.unshift({
      date: Date.now(),
      correct: session.correct,
      wrong: session.wrong,
      durationSec,
      level: activeProfile.level,
    });
    state.history = state.history.slice(0, 60);

    // promoción de nivel
    const newLevel = SRS.maybePromote(activeProfile.level, state.cards);
    let levelUp = false;
    if (newLevel > activeProfile.level) {
      activeProfile.level = newLevel;
      Store.updateProfile(activeProfile.id, { level: newLevel });
      levelUp = true;
    }

    Store.saveState(activeProfile.id, state);
    go('session-summary', { durationSec, levelUp });
  }

  function renderSessionSummary({ durationSec = 0, levelUp = false } = {}) {
    const total = (session?.correct || 0) + (session?.wrong || 0);
    const ratio = total ? (session.correct / total) : 0;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : 1;

    $('#stars-row').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    $('#s-correct').textContent = session?.correct ?? 0;
    $('#s-wrong').textContent   = session?.wrong ?? 0;
    $('#s-time').textContent    = durationSec;

    let msg = '';
    if (levelUp) msg = `¡Has subido al nivel ${activeProfile.level}: ${SRS.levelMeta(activeProfile.level).name}!`;
    else if (stars === 3) msg = '¡Tres estrellas! Trabajo increíble.';
    else if (stars === 2) msg = 'Muy bien. Cada día vas un poquito más lejos.';
    else msg = 'Lo importante es seguir practicando.';
    $('#s-encourage').textContent = msg;

    $('#s-home').onclick = () => go('home');
    $('#s-again').onclick = () => startSession();
  }

  // ─────────────────────── RENDER EJERCICIO ───────────────────────
  // Render genérico que vale para test de nivel y para sesión.
  // onAnswer(ok) se llama una vez por ejercicio.
  function renderExercise(stage, ex, onAnswer) {
    stage.innerHTML = '';
    renderExerciseQuestion(stage, ex);
    renderAnswerInput(stage, ex, onAnswer);
  }

  // Renderiza solo el enunciado (sin la zona de respuesta).
  // Se llama también cuando hay que cambiar de modo de respuesta sin
  // perder la pregunta (por ejemplo handwriting → teclado).
  function renderExerciseQuestion(stage, ex) {
    const prompt = document.createElement('div');
    prompt.className = 'exercise-prompt';
    prompt.textContent = ex.prompt;
    stage.appendChild(prompt);

    // contenido principal según tipo
    if (ex.type === 'count-dots') {
      const board = document.createElement('div');
      board.className = 'dots-board';
      for (let i = 0; i < ex.payload.dots; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        board.appendChild(d);
      }
      stage.appendChild(board);
    }
    else if (ex.type === 'recognize-num' || ex.type === 'recognize-word' || ex.type === 'before-after' || ex.type === 'write-number') {
      const big = document.createElement('div');
      big.className = 'exercise-big';
      big.textContent = ex.payload.big;
      stage.appendChild(big);
    }
    else if (ex.type === 'sequence') {
      const row = document.createElement('div');
      row.className = 'sequence-row';
      ex.payload.seq.forEach(v => {
        const span = document.createElement('span');
        if (v === '?') { span.className = 'blank'; span.textContent = '?'; }
        else span.textContent = v;
        row.appendChild(span);
      });
      stage.appendChild(row);
    }
    else if (ex.type === 'add' || ex.type === 'sub' || ex.type === 'mul' || ex.type === 'div') {
      const q = document.createElement('div');
      q.className = 'exercise-question';
      q.textContent = `${ex.payload.a} ${ex.payload.op} ${ex.payload.b} = ?`;
      stage.appendChild(q);
    }
    else if (ex.type === 'vert') {
      // Suma/resta en vertical (alineadas a la derecha)
      const wrap = document.createElement('div');
      wrap.className = 'vertical-op';
      const a = String(ex.payload.a), b = String(ex.payload.b);
      const w = Math.max(a.length, b.length);
      wrap.innerHTML = `
        <pre>${a.padStart(w+2,' ')}\n${ex.payload.op} ${b.padStart(w,' ')}\n${'─'.repeat(w+2)}</pre>`;
      stage.appendChild(wrap);
    }
    else if (ex.type === 'frac-visual') {
      // Tarta dividida en `den` porciones, con `num` pintadas
      const { num, den } = ex.payload;
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 120 120');
      svg.setAttribute('width', '180');
      svg.setAttribute('height', '180');
      const cx = 60, cy = 60, r = 50;
      for (let i = 0; i < den; i++) {
        const a0 = (i / den) * Math.PI * 2 - Math.PI/2;
        const a1 = ((i+1) / den) * Math.PI * 2 - Math.PI/2;
        const x0 = cx + r*Math.cos(a0), y0 = cy + r*Math.sin(a0);
        const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
        const large = (a1 - a0) > Math.PI ? 1 : 0;
        const path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`);
        path.setAttribute('fill', i < num ? 'var(--primary)' : 'var(--bg)');
        path.setAttribute('stroke', 'var(--ink)');
        path.setAttribute('stroke-width', '1.5');
        svg.appendChild(path);
      }
      stage.appendChild(svg);
    }
    else if (ex.type === 'expr') {
      // Expresión arbitraria (HTML controlado, generado por el código)
      const q = document.createElement('div');
      q.className = 'exercise-expr';
      q.innerHTML = ex.payload.html;
      stage.appendChild(q);
    }
    else if (ex.type === 'word') {
      // Problema verbal (texto con personajes y cosas)
      const q = document.createElement('div');
      q.className = 'exercise-word';
      q.textContent = ex.payload.text;
      stage.appendChild(q);
    }
  }

  // Decide entre opciones, teclado o escritura a mano según el ejercicio
  // y la preferencia del perfil.
  function renderAnswerInput(stage, ex, onAnswer) {
    if (ex.inputKind === 'choice') return renderChoices(stage, ex, onAnswer);

    // Para keypad/numérico, valoramos si el niño prefiere dibujar a mano.
    const mode = (activeProfile && activeProfile.writingMode) || 'mixed';
    const eligible = Number.isInteger(ex.answer) && ex.answer >= 0 && ex.answer <= 99;
    const handAvailable = (typeof Handwrite !== 'undefined') && Handwrite.isSupported();
    const useHand = handAvailable && eligible && (
      mode === 'handwriting' || (mode === 'mixed' && Math.random() < 0.5)
    );

    if (useHand) return renderHandwriting(stage, ex, onAnswer);
    return renderKeypad(stage, ex, onAnswer);
  }

  // ─── Render: dibujar la respuesta a mano ───
  function renderHandwriting(stage, ex, onAnswer) {
    const ansStr = String(ex.answer);
    const numDigits = ansStr.length;

    const wrap = document.createElement('div');
    wrap.className = 'handwrite-input';
    stage.appendChild(wrap);

    const padsRow = document.createElement('div');
    padsRow.className = 'hand-row';
    wrap.appendChild(padsRow);

    const pads = [];
    for (let i = 0; i < numDigits; i++) pads.push(Handwrite.createPad(padsRow));

    const peek = document.createElement('div');
    peek.className = 'hand-peek muted small';
    peek.textContent = numDigits === 1 ? 'Dibuja el número' : 'Dibuja cada cifra';
    wrap.appendChild(peek);

    const actions = document.createElement('div');
    actions.className = 'hand-actions row';
    wrap.appendChild(actions);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ghost'; clearBtn.textContent = 'Borrar';
    clearBtn.onclick = () => {
      pads.forEach(p => p.clear());
      peek.textContent = numDigits === 1 ? 'Dibuja el número' : 'Dibuja cada cifra';
      peek.className = 'hand-peek muted small';
    };

    const okBtn = document.createElement('button');
    okBtn.className = 'primary'; okBtn.textContent = 'Listo';
    let answered = false;
    okBtn.onclick = async () => {
      if (answered) return;
      if (pads.some(p => p.isEmpty())) {
        peek.textContent = numDigits === 1 ? 'Aún falta el número' : 'Dibuja todas las cifras';
        return;
      }
      answered = true;
      okBtn.disabled = true; clearBtn.disabled = true;
      peek.textContent = 'Leyendo…';
      try {
        // Aseguramos modelo cargado (se cachea tras la primera vez)
        await Handwrite.loadModel();
        let read = '';
        for (const p of pads) {
          const r = await Handwrite.recognize(p.canvas);
          read += r.digit;
        }
        const ok = parseInt(read, 10) === ex.answer;
        peek.textContent = `He leído: ${read}`;
        peek.className = 'hand-peek ' + (ok ? 'good' : 'bad');
        onAnswer(ok);
      } catch (err) {
        // Si falla la carga del modelo, caemos al teclado sin contar fallo
        console.warn('handwrite no disponible:', err && err.message);
        wrap.remove();
        renderKeypad(stage, ex, onAnswer);
      }
    };

    const switchBtn = document.createElement('button');
    switchBtn.className = 'link';
    switchBtn.textContent = 'Mejor escribir con teclado';
    switchBtn.onclick = () => { wrap.remove(); renderKeypad(stage, ex, onAnswer); };

    actions.appendChild(clearBtn);
    actions.appendChild(okBtn);
    wrap.appendChild(switchBtn);
  }

  function renderChoices(stage, ex, onAnswer) {
    const grid = document.createElement('div');
    grid.className = 'option-grid';
    let answered = false;

    ex.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.textContent = opt;
      b.onclick = () => {
        if (answered) return;
        answered = true;
        const ok = isEqual(opt, ex.answer);
        b.classList.add(ok ? 'correct' : 'wrong');
        if (!ok) {
          // marcar correcta
          $$('.opt', grid).forEach(btn => {
            if (isEqual(parseMaybeNum(btn.textContent), ex.answer)) btn.classList.add('correct');
          });
        }
        $$('.opt', grid).forEach(btn => btn.disabled = true);
        onAnswer(ok);
      };
      grid.appendChild(b);
    });
    stage.appendChild(grid);
  }

  function renderKeypad(stage, ex, onAnswer) {
    const display = document.createElement('div');
    display.className = 'answer-display';
    display.textContent = '';
    stage.appendChild(display);

    const keypad = document.createElement('div');
    keypad.className = 'keypad';
    let answered = false;
    let buf = '';

    function update() { display.textContent = buf || '—'; }
    update();

    const layout = ['1','2','3','4','5','6','7','8','9','C','0','OK'];
    layout.forEach(k => {
      const b = document.createElement('button');
      b.textContent = k;
      if (k === 'C') b.className = 'action';
      if (k === 'OK') b.className = 'action send';
      b.onclick = () => {
        if (answered) return;
        if (k === 'C') { buf = ''; update(); return; }
        if (k === 'OK') {
          if (!buf) return;
          answered = true;
          const ok = parseInt(buf, 10) === ex.answer;
          display.style.color = ok ? 'var(--good)' : 'var(--bad)';
          onAnswer(ok);
          return;
        }
        if (buf.length >= 3) return;
        buf += k;
        update();
      };
      keypad.appendChild(b);
    });
    stage.appendChild(keypad);
  }

  function isEqual(a, b) {
    if (typeof a === 'string' || typeof b === 'string') {
      return String(a).toLowerCase() === String(b).toLowerCase();
    }
    return a === b;
  }

  function parseMaybeNum(s) {
    const n = parseInt(s, 10);
    return Number.isFinite(n) && String(n) === s.trim() ? n : s;
  }

  function formatAnswer(ex) {
    return String(ex.answer);
  }

  // ─────────────────────── PROGRESO (vista del niño) ───────────────────────
  function renderProgress() {
    const stats = state.stats;
    $('#prog-stats').innerHTML = `
      ${stat(stats.totalSessions, 'sesiones')}
      ${stat(stats.totalCorrect, 'aciertos')}
      ${stat(stats.streakDays || 0, 'días seguidos')}
    `;

    const skills = SRS.availableSkills(activeProfile.level);
    const list = $('#prog-skills');
    list.innerHTML = '';
    skills.forEach(id => {
      const meta = Exercises.SKILLS[id];
      if (!meta) return;
      const card = state.cards[id];
      const box = card ? card.box : 0;
      const row = document.createElement('div');
      row.className = 'skill-row';
      row.innerHTML = `
        <span class="skill-name">${meta.label}</span>
        <span class="boxbadge b${box || 1}">${box ? 'Nivel '+box : 'Nuevo'}</span>
      `;
      list.appendChild(row);
    });
  }

  // ─────────────────────── ORIENTADOR ───────────────────────
  function renderOrient() {
    const now = Date.now();
    const skills = SRS.availableSkills(activeProfile.level);
    const cards = state.cards;
    const mastered = skills.filter(id => cards[id] && cards[id].box >= 4);
    const due      = skills.filter(id => cards[id] && cards[id].dueAt <= now).slice(0, 20);
    const stats = state.stats;
    const accuracy = stats.totalCorrect + stats.totalWrong > 0
      ? Math.round(100 * stats.totalCorrect / (stats.totalCorrect + stats.totalWrong))
      : 0;
    const minutes = state.history.reduce((s,h) => s + (h.durationSec||0), 0) / 60;

    $('#orient-stats').innerHTML = `
      ${stat(stats.totalSessions, 'sesiones')}
      ${stat(accuracy + '%', 'aciertos')}
      ${stat(mastered.length, 'dominados')}
      ${stat(Math.round(minutes), 'min totales')}
      ${stat('N' + activeProfile.level, 'nivel actual')}
      ${stat(stats.streakDays || 0, 'racha días')}
    `;

    $('#orient-mastered').innerHTML = mastered.length
      ? mastered.map(id => `<span class="tag good">${Exercises.SKILLS[id].label}</span>`).join('')
      : '<span class="muted small">Aún no hay conceptos dominados. Los marcaremos aquí cuando alcancen la caja 4 del repaso espaciado.</span>';

    $('#orient-due').innerHTML = due.length
      ? due.map(id => `<span class="tag due">${Exercises.SKILLS[id].label}</span>`).join('')
      : '<span class="muted small">Nada urgente para repasar ahora mismo.</span>';

    const hist = $('#orient-history');
    if (state.history.length === 0) {
      hist.innerHTML = '<p class="muted small">Aún no hay historial de sesiones.</p>';
    } else {
      hist.innerHTML = state.history.slice(0, 10).map(h => {
        const d = new Date(h.date);
        const fmt = `${d.toLocaleDateString('es-ES')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        const total = h.correct + h.wrong;
        const pct = total ? Math.round(100*h.correct/total) : 0;
        return `<div class="history-row"><span>${fmt}</span><span>${pct}%</span><span>${h.durationSec}s</span></div>`;
      }).join('');
    }

    // Selector de modo de escritura
    const wmWrap = document.createElement('div');
    wmWrap.className = 'field';
    wmWrap.innerHTML = `
      <label for="wm-select" style="font-weight:600;color:var(--ink-soft);font-size:14px">
        Cómo responde a las preguntas numéricas
      </label>
      <select id="wm-select" style="padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);font-size:16px;font-family:inherit;color:var(--ink)">
        <option value="mixed">Mixto: a veces teclado, a veces dibujar a mano</option>
        <option value="handwriting">Siempre dibujar el número a mano</option>
        <option value="keypad">Siempre con teclado numérico</option>
      </select>
    `;
    const histTitle = $('#orient-history').previousElementSibling;
    histTitle.parentNode.insertBefore(wmWrap, histTitle);
    const wmSelect = $('#wm-select');
    wmSelect.value = activeProfile.writingMode || 'mixed';
    wmSelect.onchange = () => {
      const v = wmSelect.value;
      Store.updateProfile(activeProfile.id, { writingMode: v });
      activeProfile.writingMode = v;
      if (v !== 'keypad' && typeof Handwrite !== 'undefined') Handwrite.preload();
    };

    $('#orient-export').onclick = () => {
      const txt = Store.exportProfile(activeProfile.id);
      const blob = new Blob([txt], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mates-${activeProfile.name}-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };
    $('#orient-import').onclick = () => $('#orient-import-file').click();
    $('#orient-import-file').onchange = (e) => {
      const f = e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => {
        try {
          const p = Store.importProfile(r.result);
          alert(`Importado: ${p.name}`);
          go('profiles');
        } catch (err) {
          alert('No se pudo importar: ' + err.message);        }
      };
      r.readAsText(f);
    };
    $('#orient-reset').onclick = () => {
      if (confirm(`¿Reiniciar TODO el progreso de ${activeProfile.name}? No se puede deshacer.`)) {
        Store.resetState(activeProfile.id);
        state = Store.getState(activeProfile.id);
        Store.updateProfile(activeProfile.id, { level: 1 });
        activeProfile.level = 1;
        go('home');
      }
    };
  }

  function stat(num, lbl) {
    return `<div class="stat"><div class="stat-num">${num}</div><div class="stat-lbl">${lbl}</div></div>`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  return { start };
})();

document.addEventListener('DOMContentLoaded', App.start);
