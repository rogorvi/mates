// exercises.js — Catálogo de skills y generadores. Curriculum completo desde
// "contar 1-5" hasta "ecuaciones diferenciales sencillas".

const Exercises = (() => {

  // ─── helpers ───
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
  const lcm = (a, b) => Math.abs(a*b) / gcd(a, b);
  // Unicode superíndices
  const sup = (n) => {
    const map = {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
    return String(n).split('').map(c => map[c] || c).join('');
  };
  const NUM_WORDS_ES = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez',
    'once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte'];

  // ─── niveles ───
  const LEVELS = [
    // CONTAR
    { id: 1,  name: 'Contar hasta 5',          skills: ['count-dots-5','recognize-1to5','sequence-1to5'] },
    { id: 2,  name: 'Contar hasta 10',         skills: ['count-dots-10','recognize-1to10','sequence-1to10','before-after-10'] },
    { id: 3,  name: 'De 11 a 20',              skills: ['recognize-11to20','sequence-11to20','before-after-20'] },
    { id: 4,  name: 'Hasta 100',               skills: ['decenas-100','sequence-by-10','sequence-by-2','sequence-by-5'] },
    { id: 5,  name: 'Escribir números',        skills: ['write-1to20','write-20to50'] },

    // CUATRO OPERACIONES
    { id: 6,  name: 'Sumar +1, +2',            skills: ['add-plus1','add-plus2'] },
    { id: 7,  name: 'Sumas hasta 10',          skills: ['add-plus3','add-plus4','add-plus5','add-to-10','add-missing-10','word-add-10'] },
    { id: 8,  name: 'Restas hasta 10',         skills: ['sub-minus1','sub-minus2','sub-to-10','sub-missing-10','word-sub-10'] },
    { id: 9,  name: 'Sumas hasta 20',          skills: ['add-to-20'] },
    { id: 10, name: 'Restas hasta 20',         skills: ['sub-to-20'] },
    { id: 11, name: 'Multiplicar fácil',       skills: ['mul-x1','mul-x2','mul-x5','mul-x10'] },
    { id: 12, name: 'Tablas de multiplicar',   skills: ['mul-x3','mul-x4','mul-table','mul-missing'] },
    { id: 13, name: 'Dividir exacto',          skills: ['div-easy','div-by-table'] },
    { id: 14, name: 'Sumas verticales',        skills: ['vert-add-2d'] },
    { id: 15, name: 'Restas verticales',       skills: ['vert-sub-2d'] },
    { id: 16, name: 'Mul/Div con 2 cifras',    skills: ['mul-2d-1d','div-2d-1d'] },

    // FRACCIONES
    { id: 17, name: 'Reconocer fracciones',    skills: ['frac-recognize'] },
    { id: 18, name: 'Fracciones equivalentes', skills: ['frac-equivalent','frac-simplify'] },
    { id: 19, name: 'm.c.m. y m.c.d.',         skills: ['mcd','mcm'] },
    { id: 20, name: 'Sumar fracciones (=)',    skills: ['frac-add-same','frac-sub-same'] },
    { id: 21, name: 'Sumar fracciones (≠)',    skills: ['frac-add-diff','frac-sub-diff'] },
    { id: 22, name: 'Multiplicar fracciones',  skills: ['frac-mul','frac-div'] },
    { id: 23, name: 'Decimales',               skills: ['decimal-add','decimal-mul'] },

    // ÁLGEBRA BÁSICA
    { id: 24, name: 'Números negativos',       skills: ['signed-add','signed-sub'] },
    { id: 25, name: 'Operar con negativos',    skills: ['signed-mul','signed-div'] },
    { id: 26, name: 'Sustituir variable',      skills: ['eval-expr'] },
    { id: 27, name: 'Ecuaciones lineales',     skills: ['solve-linear-1','solve-linear-2'] },
    { id: 28, name: 'Monomios',                skills: ['monomial-add','monomial-mul'] },
    { id: 29, name: 'Polinomios',              skills: ['polynomial-add'] },
    { id: 30, name: 'Factor común',            skills: ['factor-common'] },
    { id: 31, name: 'Raíces cuadradas',        skills: ['sqrt-perfect'] },
    { id: 32, name: 'Ecuaciones cuadráticas', skills: ['quadratic-factor'] },
    { id: 33, name: 'Teorema de Pitágoras',    skills: ['pythagoras'] },

    // FUNCIONES
    { id: 34, name: 'Evaluar funciones',       skills: ['eval-func'] },
    { id: 35, name: 'Logaritmos',              skills: ['log-basic'] },
    { id: 36, name: 'Límites',                 skills: ['limit-poly'] },
    { id: 37, name: 'Derivadas',               skills: ['derivative-poly'] },
    { id: 38, name: 'Integrales',              skills: ['integral-poly'] },
    { id: 39, name: 'Trigonometría',           skills: ['trig-values'] },

    // CÁLCULO
    { id: 40, name: 'Derivadas (cadena)',      skills: ['derivative-chain'] },
    { id: 41, name: 'Integrales (sustitución)',skills: ['integral-sub'] },
    { id: 42, name: 'Ec. diferenciales',       skills: ['diff-eq'] },
  ];

  // ─── distractores ───
  function numDistractors(correct, min, max, n) {
    const set = new Set();
    let s = 40;
    while (set.size < n && s-- > 0) {
      const c = rand(Math.max(min, correct-3), Math.min(max, correct+3));
      if (c !== correct) set.add(c);
    }
    s = 40;
    while (set.size < n && s-- > 0) {
      const c = rand(min, max);
      if (c !== correct) set.add(c);
    }
    return [...set];
  }
  function wordDistractors(correct, min, max, n) {
    return numDistractors(correct, min, max, n).map(v => NUM_WORDS_ES[v] || String(v));
  }
  // Distractores que mantienen el "paso" del ejercicio: para una secuencia
  // de 10 en 10 (ej. respuesta 40), las opciones son 20, 30, 50…
  function numDistractorsStep(correct, step, n, min = 0, max = Infinity) {
    const offsets = shuffle([-4,-3,-2,-1,1,2,3,4]);
    const out = new Set();
    for (const off of offsets) {
      const v = correct + off * step;
      if (v >= min && v <= max && v !== correct) out.add(v);
      if (out.size >= n) break;
    }
    return [...out];
  }
  function choicesAround(correct, min, max, total) {
    const set = new Set([correct]);
    let s = 40;
    while (set.size < total && s-- > 0) {
      const c = rand(min, max);
      if (c !== correct) set.add(c);
    }
    return shuffle([...set]);
  }

  // ─── helpers comunes ───
  function seqGen(min, max, len) {
    const start = rand(min, max - len + 1);
    const hidden = rand(0, len - 1);
    const seq = Array.from({length: len}, (_,i) => start + i);
    const ans = seq[hidden];
    return {
      type: 'sequence',
      prompt: '¿Qué número falta?',
      payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
      answer: ans,
      options: shuffle([ans, ...numDistractors(ans, min, max, 3)]),
      inputKind: 'choice',
    };
  }
  function beforeAfterGen(min, max) {
    const which = pick(['before','after']);
    const n = which === 'before' ? rand(min+1, max) : rand(min, max-1);
    const ans = which === 'before' ? n - 1 : n + 1;
    return {
      type: 'before-after',
      prompt: which === 'before' ? `¿Qué número va antes del ${n}?` : `¿Qué número va después del ${n}?`,
      payload: { big: String(n) },
      answer: ans,
      options: shuffle([ans, ...numDistractors(ans, min, max, 3)]),
      inputKind: 'choice',
    };
  }
  function numberToWords(n) {
    if (n <= 20) return NUM_WORDS_ES[n];
    const tens = ['','','veinte','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
    const t = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return tens[t];
    if (t === 2) {
      const sp = ['veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
      return sp[u-1];
    }
    return `${tens[t]} y ${NUM_WORDS_ES[u]}`;
  }
  // Generadores aritméticos comunes
  function addGen(aMin, aMax, bMin, bMax) {
    const a = rand(aMin, aMax), b = rand(bMin, bMax);
    const ans = a + b;
    return {
      type: 'add', prompt: 'Suma:',
      payload: { a, b, op: '+' },
      answer: ans,
      options: shuffle([ans, ...numDistractors(ans, 0, ans+5, 3)]),
      inputKind: 'choice',
    };
  }
  function addToTarget(target) {
    const a = rand(1, target - 1), b = rand(1, target - a);
    const ans = a + b;
    return {
      type: 'add', prompt: 'Suma:',
      payload: { a, b, op: '+' },
      answer: ans,
      options: shuffle([ans, ...numDistractors(ans, 1, target, 3)]),
      inputKind: 'choice',
    };
  }
  function subGen(aMin, aMax, bMin, bMax) {
    let a = rand(aMin, aMax), b = rand(bMin, bMax);
    if (b > a) [a, b] = [b, a];
    const ans = a - b;
    return {
      type: 'sub', prompt: 'Resta:',
      payload: { a, b, op: '−' },
      answer: ans,
      options: shuffle([ans, ...numDistractors(ans, 0, a, 3)]),
      inputKind: 'choice',
    };
  }
  function subToTarget(target) {
    const a = rand(2, target), b = rand(1, a);
    return {
      type: 'sub', prompt: 'Resta:',
      payload: { a, b, op: '−' },
      answer: a - b,
      options: shuffle([a-b, ...numDistractors(a-b, 0, target, 3)]),
      inputKind: 'choice',
    };
  }
  function mulGen(aMin, aMax, bMin, bMax) {
    const a = rand(aMin, aMax), b = rand(bMin, bMax);
    return {
      type: 'mul', prompt: 'Multiplica:',
      payload: { a, b, op: '×' },
      answer: a * b,
      inputKind: 'keypad',
    };
  }
  function divGen(maxResult, maxDivisor) {
    const b = rand(2, maxDivisor);
    const result = rand(1, maxResult);
    const a = b * result;
    return {
      type: 'div', prompt: 'Divide:',
      payload: { a, b, op: '÷' },
      answer: result,
      inputKind: 'keypad',
    };
  }
  function vertAddGen() {
    let a = rand(11, 89), b = rand(11, 89);
    return {
      type: 'vert', prompt: 'Suma en vertical:',
      payload: { a, b, op: '+' },
      answer: a + b,
      inputKind: 'keypad',
    };
  }
  function vertSubGen() {
    let a = rand(20, 99), b = rand(10, a-1);
    return {
      type: 'vert', prompt: 'Resta en vertical:',
      payload: { a, b, op: '−' },
      answer: a - b,
      inputKind: 'keypad',
    };
  }

  // ─── catálogo de SKILLS ───
  const SKILLS = {

    // ── 1: contar 1-5
    'count-dots-5': {
      label: 'Contar puntos hasta 5', level: 1,
      gen() {
        const n = rand(1, 5);
        return { type: 'count-dots', prompt: '¿Cuántos puntos hay?',
          payload: { dots: n }, answer: n,
          options: choicesAround(n, 1, 6, 4), inputKind: 'choice' };
      },
    },
    'recognize-1to5': {
      label: 'Reconocer cifras 1–5', level: 1,
      gen() {
        const n = rand(1, 5);
        if (Math.random() < 0.5) {
          return { type: 'recognize-num', prompt: '¿Cómo se llama este número?',
            payload: { big: String(n) }, answer: NUM_WORDS_ES[n],
            options: shuffle([NUM_WORDS_ES[n], ...wordDistractors(n, 1, 5, 3)]), inputKind: 'choice' };
        }
        return { type: 'recognize-word', prompt: 'Toca el número:',
          payload: { big: NUM_WORDS_ES[n] }, answer: n,
          options: shuffle([n, ...numDistractors(n, 1, 5, 3)]), inputKind: 'choice' };
      },
    },
    'sequence-1to5': {
      label: 'Secuencia 1 al 5', level: 1,
      gen() {
        const start = rand(1, 3);
        const hidden = rand(0, 2);
        const seq = [start, start+1, start+2];
        const ans = seq[hidden];
        return { type: 'sequence', prompt: '¿Qué número falta?',
          payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
          answer: ans, options: shuffle([ans, ...numDistractors(ans, 1, 5, 3)]),
          inputKind: 'choice' };
      },
    },

    // ── 2: contar 1-10
    'count-dots-10': { label: 'Contar puntos hasta 10', level: 2,
      gen() {
        const n = rand(1, 10);
        return { type: 'count-dots', prompt: '¿Cuántos puntos hay?',
          payload: { dots: n }, answer: n,
          options: choicesAround(n, 1, 10, 4), inputKind: 'choice' };
      } },
    'recognize-1to10': { label: 'Reconocer cifras 1–10', level: 2,
      gen() {
        const n = rand(1, 10);
        if (Math.random() < 0.5) return { type: 'recognize-num', prompt: '¿Cómo se llama este número?',
          payload: { big: String(n) }, answer: NUM_WORDS_ES[n],
          options: shuffle([NUM_WORDS_ES[n], ...wordDistractors(n, 1, 10, 3)]), inputKind: 'choice' };
        return { type: 'recognize-word', prompt: 'Toca el número:',
          payload: { big: NUM_WORDS_ES[n] }, answer: n,
          options: shuffle([n, ...numDistractors(n, 1, 10, 3)]), inputKind: 'choice' };
      } },
    'sequence-1to10': { label: 'Secuencia 1 al 10', level: 2,
      gen() {
        // mezcla ascendente/descendente y a veces se "salta" 1 (paso 2)
        const r = Math.random();
        if (r < 0.25) {
          // descendente
          const start = rand(4, 10);
          const hidden = rand(0, 2);
          const seq = [start, start-1, start-2];
          const ans = seq[hidden];
          return { type: 'sequence', prompt: '¿Qué número falta? (hacia atrás)',
            payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
            answer: ans, options: shuffle([ans, ...numDistractorsStep(ans, 1, 3, 0, 10)]),
            inputKind: 'choice' };
        }
        return seqGen(1, 10, 3);
      } },
    'before-after-10': { label: 'Antes y después (hasta 10)', level: 2, gen() { return beforeAfterGen(1, 10); } },

    // ── 3: 11-20
    'recognize-11to20': { label: 'Reconocer cifras 11–20', level: 3,
      gen() {
        const n = rand(11, 20);
        if (Math.random() < 0.5) return { type: 'recognize-num', prompt: '¿Cómo se llama este número?',
          payload: { big: String(n) }, answer: NUM_WORDS_ES[n],
          options: shuffle([NUM_WORDS_ES[n], ...wordDistractors(n, 11, 20, 3)]), inputKind: 'choice' };
        return { type: 'recognize-word', prompt: 'Toca el número:',
          payload: { big: NUM_WORDS_ES[n] }, answer: n,
          options: shuffle([n, ...numDistractors(n, 11, 20, 3)]), inputKind: 'choice' };
      } },
    'sequence-11to20': { label: 'Secuencia 11 al 20', level: 3, gen() { return seqGen(11, 20, 3); } },
    'before-after-20': { label: 'Antes y después (hasta 20)', level: 3, gen() { return beforeAfterGen(1, 20); } },

    // ── 4: hasta 100
    'decenas-100': { label: 'Decenas hasta 100', level: 4,
      gen() {
        const dec = rand(1, 10) * 10;
        // Distractores múltiplos de 10 — coherentes con la pregunta
        return { type: 'recognize-num', prompt: 'Lee el número:',
          payload: { big: String(dec) }, answer: dec,
          options: shuffle([dec, ...numDistractorsStep(dec, 10, 3, 10, 100)]),
          inputKind: 'choice' };
      } },
    'sequence-by-10': { label: 'Contar de 10 en 10', level: 4,
      gen() {
        // A veces hacia adelante, a veces hacia atrás
        const back = Math.random() < 0.35;
        const start = back ? rand(4, 10) * 10 : rand(1, 7) * 10;
        const step = back ? -10 : 10;
        const hidden = rand(0, 2);
        const seq = [start, start+step, start+2*step];
        const ans = seq[hidden];
        return { type: 'sequence',
          prompt: back ? '¿Qué número falta? (de 10 en 10 hacia atrás)' : '¿Qué número falta? (de 10 en 10)',
          payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
          answer: ans,
          // Distractores múltiplos de 10 cercanos a la respuesta
          options: shuffle([ans, ...numDistractorsStep(ans, 10, 3, 0, 100)]),
          inputKind: 'choice' };
      } },
    'sequence-by-2': { label: 'Contar de 2 en 2', level: 4,
      gen() {
        const start = rand(2, 14) * 2;
        const hidden = rand(0, 2);
        const seq = [start, start+2, start+4];
        const ans = seq[hidden];
        return { type: 'sequence', prompt: '¿Qué número falta? (de 2 en 2)',
          payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
          answer: ans,
          options: shuffle([ans, ...numDistractorsStep(ans, 2, 3, 0, 40)]),
          inputKind: 'choice' };
      } },
    'sequence-by-5': { label: 'Contar de 5 en 5', level: 4,
      gen() {
        const start = rand(1, 10) * 5;
        const hidden = rand(0, 2);
        const seq = [start, start+5, start+10];
        const ans = seq[hidden];
        return { type: 'sequence', prompt: '¿Qué número falta? (de 5 en 5)',
          payload: { seq: seq.map((v,i) => i === hidden ? '?' : v) },
          answer: ans,
          options: shuffle([ans, ...numDistractorsStep(ans, 5, 3, 0, 100)]),
          inputKind: 'choice' };
      } },

    // ── 5: escribir
    'write-1to20': { label: 'Escribir números hasta 20', level: 5,
      gen() {
        const n = rand(1, 20);
        return { type: 'write-number', prompt: 'Escribe el número:',
          payload: { big: NUM_WORDS_ES[n] }, answer: n, inputKind: 'keypad' };
      } },
    'write-20to50': { label: 'Escribir números hasta 50', level: 5,
      gen() {
        const n = rand(20, 50);
        return { type: 'write-number', prompt: 'Escribe el número en cifras:',
          payload: { big: numberToWords(n) }, answer: n, inputKind: 'keypad' };
      } },

    // ── 6-10: sumas y restas básicas
    'add-plus1': { label: 'Sumar +1', level: 6, gen() { return addGen(1, 9, 1, 1); } },
    'add-plus2': { label: 'Sumar +2', level: 6, gen() { return addGen(1, 8, 2, 2); } },
    'add-plus3': { label: 'Sumar +3', level: 7, gen() { return addGen(1, 7, 3, 3); } },
    'add-plus4': { label: 'Sumar +4', level: 7, gen() { return addGen(1, 6, 4, 4); } },
    'add-plus5': { label: 'Sumar +5', level: 7, gen() { return addGen(1, 5, 5, 5); } },
    'add-to-10': { label: 'Sumas hasta 10', level: 7, gen() { return addToTarget(10); } },
    'add-to-20': { label: 'Sumas hasta 20', level: 9, gen() { return addToTarget(20); } },
    'sub-minus1': { label: 'Restar −1', level: 8, gen() { return subGen(2, 10, 1, 1); } },
    'sub-minus2': { label: 'Restar −2', level: 8, gen() { return subGen(3, 10, 2, 2); } },
    'sub-to-10': { label: 'Restas hasta 10', level: 8, gen() { return subToTarget(10); } },
    'sub-to-20': { label: 'Restas hasta 20', level: 10, gen() { return subToTarget(20); } },

    // ── 11: multiplicar fácil
    'mul-x1':  { label: 'Multiplicar ×1', level: 11, gen() { return mulGen(1, 10, 1, 1); } },
    'mul-x2':  { label: 'Multiplicar ×2', level: 11, gen() { return mulGen(1, 10, 2, 2); } },
    'mul-x5':  { label: 'Multiplicar ×5', level: 11, gen() { return mulGen(1, 10, 5, 5); } },
    'mul-x10': { label: 'Multiplicar ×10', level: 11, gen() { return mulGen(1, 10, 10, 10); } },

    // ── 12: tablas completas
    'mul-x3': { label: 'Multiplicar ×3', level: 12, gen() { return mulGen(1, 10, 3, 3); } },
    'mul-x4': { label: 'Multiplicar ×4', level: 12, gen() { return mulGen(1, 10, 4, 4); } },
    'mul-table': { label: 'Tablas (×2 a ×10)', level: 12, gen() { return mulGen(2, 10, 2, 10); } },

    // ── 13: dividir
    'div-easy': { label: 'Divisiones por 2, 5, 10', level: 13,
      gen() {
        const b = pick([2,5,10]);
        const result = rand(1, 10);
        const a = b * result;
        return { type: 'div', prompt: 'Divide:', payload: { a, b, op: '÷' }, answer: result, inputKind: 'keypad' };
      } },
    'div-by-table': { label: 'Divisiones hasta 100', level: 13, gen() { return divGen(10, 10); } },

    // ── 14-15: vertical
    'vert-add-2d': { label: 'Sumas verticales (2 cifras)', level: 14, gen() { return vertAddGen(); } },
    'vert-sub-2d': { label: 'Restas verticales (2 cifras)', level: 15, gen() { return vertSubGen(); } },

    // ── 16: mul/div con 2 cifras
    'mul-2d-1d': { label: 'Multiplicar 2 cifras × 1 cifra', level: 16,
      gen() {
        const a = rand(11, 99), b = rand(2, 9);
        return { type: 'mul', prompt: 'Multiplica:', payload: { a, b, op: '×' }, answer: a*b, inputKind: 'keypad' };
      } },
    'div-2d-1d': { label: 'Dividir 2 cifras ÷ 1 cifra', level: 16,
      gen() {
        const b = rand(2, 9);
        const result = rand(10, 30);
        return { type: 'div', prompt: 'Divide:', payload: { a: b*result, b, op: '÷' }, answer: result, inputKind: 'keypad' };
      } },

    // ── 17: reconocer fracciones (visual)
    'frac-recognize': { label: 'Reconocer fracciones', level: 17,
      gen() {
        const den = pick([2,3,4,5,6,8]);
        const num = rand(1, den - 1);
        const ans = `${num}/${den}`;
        const distractors = new Set();
        while (distractors.size < 3) {
          const d2 = pick([2,3,4,5,6,8]);
          const n2 = rand(1, d2 - 1);
          const s = `${n2}/${d2}`;
          if (s !== ans) distractors.add(s);
        }
        return { type: 'frac-visual', prompt: '¿Qué fracción está pintada?',
          payload: { num, den }, answer: ans,
          options: shuffle([ans, ...distractors]), inputKind: 'choice' };
      } },

    // ── 18: equivalentes y simplificar
    'frac-equivalent': { label: 'Fracciones equivalentes', level: 18,
      gen() {
        const num = rand(1, 4), den = rand(num+1, 8);
        const k = rand(2, 4);
        return { type: 'expr', prompt: 'Completa la fracción equivalente:',
          payload: { html: `<span class="frac"><i>${num}</i><i>${den}</i></span> = <span class="frac"><i>?</i><i>${den*k}</i></span>` },
          answer: num*k, options: shuffle([num*k, ...numDistractors(num*k, 1, num*k+5, 3)]),
          inputKind: 'choice' };
      } },
    'frac-simplify': { label: 'Simplificar fracciones', level: 18,
      gen() {
        const num0 = rand(1, 5), den0 = rand(num0+1, 7), k = rand(2, 4);
        const num = num0*k, den = den0*k;
        const ans = `${num0}/${den0}`;
        const wrong = new Set();
        while (wrong.size < 3) {
          const a = rand(1, num0+2), b = rand(a+1, den0+3);
          const s = `${a}/${b}`;
          if (s !== ans) wrong.add(s);
        }
        return { type: 'expr', prompt: 'Simplifica la fracción:',
          payload: { html: `<span class="frac"><i>${num}</i><i>${den}</i></span>` },
          answer: ans, options: shuffle([ans, ...wrong]), inputKind: 'choice' };
      } },

    // ── 19: mcd y mcm
    'mcd': { label: 'Máximo común divisor', level: 19,
      gen() {
        const a = rand(4, 24), b = rand(4, 24);
        const ans = gcd(a, b);
        return { type: 'expr', prompt: 'Calcula el m.c.d.:',
          payload: { html: `m.c.d.(${a}, ${b})` }, answer: ans,
          options: shuffle([ans, ...numDistractors(ans, 1, Math.max(a,b), 3)]),
          inputKind: 'choice' };
      } },
    'mcm': { label: 'Mínimo común múltiplo', level: 19,
      gen() {
        const a = rand(2, 9), b = rand(2, 9);
        const ans = lcm(a, b);
        return { type: 'expr', prompt: 'Calcula el m.c.m.:',
          payload: { html: `m.c.m.(${a}, ${b})` }, answer: ans,
          options: shuffle([ans, ...numDistractors(ans, 1, ans+10, 3)]),
          inputKind: 'choice' };
      } },

    // ── 20: sumar fracciones (mismo denom.)
    'frac-add-same': { label: 'Sumar fracciones (=)', level: 20,
      gen() {
        const den = rand(3, 9);
        const a = rand(1, den-2), b = rand(1, den-a-1);
        const sumN = a + b;
        const g = gcd(sumN, den);
        const ans = `${sumN/g}/${den/g}`;
        const wrong = new Set();
        wrong.add(`${a+b}/${2*den}`); wrong.add(`${a*b}/${den}`); wrong.add(`${a+b+1}/${den}`);
        return { type: 'expr', prompt: 'Suma:',
          payload: { html: `<span class="frac"><i>${a}</i><i>${den}</i></span> + <span class="frac"><i>${b}</i><i>${den}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },
    'frac-sub-same': { label: 'Restar fracciones (=)', level: 20,
      gen() {
        const den = rand(3, 9);
        let a = rand(2, den-1), b = rand(1, a-1);
        const diffN = a - b;
        const g = gcd(diffN, den);
        const ans = `${diffN/g}/${den/g}`;
        const wrong = new Set();
        wrong.add(`${a-b}/${2*den}`); wrong.add(`${a+b}/${den}`); wrong.add(`${diffN+1}/${den}`);
        return { type: 'expr', prompt: 'Resta:',
          payload: { html: `<span class="frac"><i>${a}</i><i>${den}</i></span> − <span class="frac"><i>${b}</i><i>${den}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },

    // ── 21: fracciones distinto denom.
    'frac-add-diff': { label: 'Sumar fracciones (≠)', level: 21,
      gen() {
        const d1 = rand(2, 6), d2 = rand(2, 6);
        const n1 = rand(1, d1-1), n2 = rand(1, d2-1);
        const L = lcm(d1, d2);
        const sumN = n1*(L/d1) + n2*(L/d2);
        const g = gcd(sumN, L);
        const ans = `${sumN/g}/${L/g}`;
        const wrong = new Set([`${n1+n2}/${d1+d2}`, `${n1*d2+n2*d1}/${d1*d2}`, `${n1+n2}/${L}`]);
        wrong.delete(ans);
        return { type: 'expr', prompt: 'Suma:',
          payload: { html: `<span class="frac"><i>${n1}</i><i>${d1}</i></span> + <span class="frac"><i>${n2}</i><i>${d2}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },
    'frac-sub-diff': { label: 'Restar fracciones (≠)', level: 21,
      gen() {
        const d1 = rand(2, 6), d2 = rand(2, 6);
        const n1 = rand(1, d1-1), n2 = rand(1, d2-1);
        const L = lcm(d1, d2);
        let diff = n1*(L/d1) - n2*(L/d2);
        if (diff <= 0) diff = Math.abs(diff) + 1;
        const g = gcd(diff, L);
        const ans = `${diff/g}/${L/g}`;
        const wrong = new Set([`${Math.abs(n1-n2)}/${d1+d2}`, `${diff+1}/${L}`, `${diff}/${d1*d2}`]);
        wrong.delete(ans);
        return { type: 'expr', prompt: 'Resta:',
          payload: { html: `<span class="frac"><i>${n1}</i><i>${d1}</i></span> − <span class="frac"><i>${n2}</i><i>${d2}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },

    // ── 22: mul/div fracciones
    'frac-mul': { label: 'Multiplicar fracciones', level: 22,
      gen() {
        const d1 = rand(2, 6), d2 = rand(2, 6);
        const n1 = rand(1, d1-1), n2 = rand(1, d2-1);
        const num = n1*n2, den = d1*d2;
        const g = gcd(num, den);
        const ans = `${num/g}/${den/g}`;
        const wrong = new Set([`${n1+n2}/${d1+d2}`, `${num}/${d1+d2}`, `${n1*n2+1}/${den}`]);
        wrong.delete(ans);
        return { type: 'expr', prompt: 'Multiplica:',
          payload: { html: `<span class="frac"><i>${n1}</i><i>${d1}</i></span> × <span class="frac"><i>${n2}</i><i>${d2}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },
    'frac-div': { label: 'Dividir fracciones', level: 22,
      gen() {
        const d1 = rand(2, 6), d2 = rand(2, 6);
        const n1 = rand(1, d1-1), n2 = rand(1, d2-1);
        const num = n1*d2, den = d1*n2;
        const g = gcd(num, den);
        const ans = `${num/g}/${den/g}`;
        const wrong = new Set([`${n1*n2}/${d1*d2}`, `${num+1}/${den}`, `${n1+n2}/${d1+d2}`]);
        wrong.delete(ans);
        return { type: 'expr', prompt: 'Divide:',
          payload: { html: `<span class="frac"><i>${n1}</i><i>${d1}</i></span> ÷ <span class="frac"><i>${n2}</i><i>${d2}</i></span>` },
          answer: ans, options: shuffle([ans, ...[...wrong].slice(0,3)]), inputKind: 'choice' };
      } },

    // ── 23: decimales
    'decimal-add': { label: 'Sumar decimales', level: 23,
      gen() {
        const a = rand(1, 99) / 10, b = rand(1, 99) / 10;
        const ans = Math.round((a + b) * 10) / 10;
        const wrong = new Set([Math.round((a+b)*10)/10 + 0.1, Math.round((a+b)*10)/10 - 0.1, Math.round((a*10+b)*10)/100]);
        wrong.delete(ans);
        return { type: 'expr', prompt: 'Suma:',
          payload: { html: `${a.toFixed(1)} + ${b.toFixed(1)}` },
          answer: String(ans),
          options: shuffle([String(ans), ...[...wrong].slice(0,3).map(v => v.toFixed(1))]),
          inputKind: 'choice' };
      } },
    'decimal-mul': { label: 'Multiplicar decimales (×10)', level: 23,
      gen() {
        const a = rand(11, 99) / 10;
        const ans = a * 10;
        return { type: 'expr', prompt: 'Multiplica por 10:',
          payload: { html: `${a.toFixed(1)} × 10` },
          answer: String(ans),
          options: shuffle([String(ans), String(a), String(a*100), String(Math.round(a*10)/10)]),
          inputKind: 'choice' };
      } },

    // ── 24: negativos suma/resta
    'signed-add': { label: 'Sumar con negativos', level: 24,
      gen() {
        const a = rand(-9, 9), b = rand(-9, 9);
        const ans = a + b;
        const aStr = a < 0 ? `(${a})` : `${a}`;
        const bStr = b < 0 ? `(${b})` : `${b}`;
        return { type: 'expr', prompt: 'Suma:',
          payload: { html: `${aStr} + ${bStr}` }, answer: ans,
          options: shuffle([ans, ...numDistractors(ans, ans-5, ans+5, 3)]),
          inputKind: 'choice' };
      } },
    'signed-sub': { label: 'Restar con negativos', level: 24,
      gen() {
        const a = rand(-9, 9), b = rand(-9, 9);
        const ans = a - b;
        const aStr = a < 0 ? `(${a})` : `${a}`;
        const bStr = b < 0 ? `(${b})` : `${b}`;
        return { type: 'expr', prompt: 'Resta:',
          payload: { html: `${aStr} − ${bStr}` }, answer: ans,
          options: shuffle([ans, ...numDistractors(ans, ans-5, ans+5, 3)]),
          inputKind: 'choice' };
      } },

    // ── 25: mul/div con negativos
    'signed-mul': { label: 'Multiplicar con negativos', level: 25,
      gen() {
        const a = rand(-9, 9), b = rand(-9, 9);
        const ans = a * b;
        const aStr = a < 0 ? `(${a})` : `${a}`;
        const bStr = b < 0 ? `(${b})` : `${b}`;
        return { type: 'expr', prompt: 'Multiplica:',
          payload: { html: `${aStr} × ${bStr}` }, answer: ans,
          options: shuffle([ans, -ans, ans+1, ans-1]),
          inputKind: 'choice' };
      } },
    'signed-div': { label: 'Dividir con negativos', level: 25,
      gen() {
        const result = rand(-6, 6);
        const b = pick([-3,-2,2,3,4,5]);
        const a = result * b;
        const ans = result;
        const aStr = a < 0 ? `(${a})` : `${a}`;
        const bStr = b < 0 ? `(${b})` : `${b}`;
        return { type: 'expr', prompt: 'Divide:',
          payload: { html: `${aStr} ÷ ${bStr}` }, answer: ans,
          options: shuffle([ans, -ans, ans+1, ans-1]),
          inputKind: 'choice' };
      } },

    // ── 26: sustituir variable
    'eval-expr': { label: 'Sustituir variable', level: 26,
      gen() {
        const a = rand(2, 6), b = rand(1, 9), x = rand(1, 6);
        const ans = a * x + b;
        return { type: 'expr', prompt: `Si x = ${x}, calcula:`,
          payload: { html: `${a}x + ${b}` }, answer: ans,
          options: shuffle([ans, ans+a, ans-b, a*x*b]),
          inputKind: 'choice' };
      } },

    // ── 27: ecuaciones lineales
    'solve-linear-1': { label: 'Resolver x + a = b', level: 27,
      gen() {
        const x = rand(1, 10), a = rand(1, 9), b = x + a;
        return { type: 'expr', prompt: 'Resuelve para x:',
          payload: { html: `x + ${a} = ${b}` }, answer: x,
          inputKind: 'keypad' };
      } },
    'solve-linear-2': { label: 'Resolver ax + b = c', level: 27,
      gen() {
        const a = rand(2, 5), x = rand(1, 8), b = rand(1, 9);
        const c = a*x + b;
        return { type: 'expr', prompt: 'Resuelve para x:',
          payload: { html: `${a}x + ${b} = ${c}` }, answer: x,
          inputKind: 'keypad' };
      } },

    // ── 28: monomios
    'monomial-add': { label: 'Sumar monomios', level: 28,
      gen() {
        const a = rand(2, 8), b = rand(2, 8);
        const ans = `${a+b}x`;
        return { type: 'expr', prompt: 'Suma los monomios:',
          payload: { html: `${a}x + ${b}x` }, answer: ans,
          options: shuffle([ans, `${a+b}x²`, `${a*b}x`, `${a-b}x`]),
          inputKind: 'choice' };
      } },
    'monomial-mul': { label: 'Multiplicar monomios', level: 28,
      gen() {
        const a = rand(2, 6), b = rand(2, 6);
        const ans = `${a*b}x²`;
        return { type: 'expr', prompt: 'Multiplica los monomios:',
          payload: { html: `${a}x · ${b}x` }, answer: ans,
          options: shuffle([ans, `${a*b}x`, `${a+b}x²`, `${a+b}x`]),
          inputKind: 'choice' };
      } },

    // ── 29: polinomios
    'polynomial-add': { label: 'Sumar polinomios', level: 29,
      gen() {
        const a1 = rand(2, 5), b1 = rand(1, 7);
        const a2 = rand(2, 5), b2 = rand(1, 7);
        const ans = `${a1+a2}x+${b1+b2}`;
        return { type: 'expr', prompt: 'Suma los polinomios:',
          payload: { html: `(${a1}x + ${b1}) + (${a2}x + ${b2})` },
          answer: ans,
          options: shuffle([ans, `${a1+a2}x²+${b1+b2}`, `${a1*a2}x+${b1*b2}`, `${a1+a2+b1+b2}x`]),
          inputKind: 'choice' };
      } },

    // ── 30: factor común
    'factor-common': { label: 'Sacar factor común', level: 30,
      gen() {
        const k = rand(2, 5), a = rand(2, 4), b = rand(1, 9);
        const ans = `${k}(${a}x+${b})`;
        return { type: 'expr', prompt: 'Saca factor común:',
          payload: { html: `${k*a}x + ${k*b}` }, answer: ans,
          options: shuffle([ans, `${k}(${a*k}x+${b})`, `${a}(${k}x+${b})`, `${k*a}(x+${b})`]),
          inputKind: 'choice' };
      } },

    // ── 31: raíces cuadradas
    'sqrt-perfect': { label: 'Raíces cuadradas exactas', level: 31,
      gen() {
        const r = rand(2, 12);
        return { type: 'expr', prompt: 'Calcula la raíz cuadrada:',
          payload: { html: `√${r*r}` }, answer: r, inputKind: 'keypad' };
      } },

    // ── 32: cuadráticas factorizables
    'quadratic-factor': { label: 'Factorizar x²+bx+c', level: 32,
      gen() {
        const p = rand(1, 6), q = rand(1, 6);
        const b = p + q, c = p * q;
        const ans = `(x+${p})(x+${q})`;
        return { type: 'expr', prompt: 'Factoriza:',
          payload: { html: `x² + ${b}x + ${c}` }, answer: ans,
          options: shuffle([ans, `(x+${p+1})(x+${q})`, `(x-${p})(x-${q})`, `(x+${b})(x+${c})`]),
          inputKind: 'choice' };
      } },

    // ── 33: Pitágoras
    'pythagoras': { label: 'Teorema de Pitágoras', level: 33,
      gen() {
        const ternas = [[3,4,5],[5,12,13],[6,8,10],[8,15,17],[9,12,15],[7,24,25]];
        const [a,b,c] = pick(ternas);
        return { type: 'expr', prompt: 'Calcula la hipotenusa:',
          payload: { html: `cateto = ${a}, cateto = ${b} → hipotenusa = ?` },
          answer: c, inputKind: 'keypad' };
      } },

    // ── 34: evaluar funciones
    'eval-func': { label: 'Evaluar funciones', level: 34,
      gen() {
        const a = rand(2, 5), b = rand(1, 9), x = rand(1, 6);
        const ans = a*x*x + b;
        return { type: 'expr', prompt: `Calcula f(${x}):`,
          payload: { html: `f(x) = ${a}x² + ${b}` }, answer: ans,
          options: shuffle([ans, a*x+b, ans+a, ans-1]),
          inputKind: 'choice' };
      } },

    // ── 35: logaritmos
    'log-basic': { label: 'Logaritmos básicos', level: 35,
      gen() {
        const base = pick([2, 3, 5, 10]);
        const e = rand(1, 4);
        const ans = e;
        return { type: 'expr', prompt: 'Calcula el logaritmo:',
          payload: { html: `log<sub>${base}</sub>(${Math.pow(base, e)})` },
          answer: ans, options: shuffle([ans, ans+1, ans-1, Math.pow(base, e)]),
          inputKind: 'choice' };
      } },

    // ── 36: límites polinómicos
    'limit-poly': { label: 'Límites de polinomios', level: 36,
      gen() {
        const a = rand(1, 5), b = rand(1, 5), x0 = rand(1, 4);
        const ans = x0*x0 + b*x0 + a;
        return { type: 'expr', prompt: 'Calcula el límite:',
          payload: { html: `lim<sub>x→${x0}</sub> (x² + ${b}x + ${a})` },
          answer: ans, inputKind: 'keypad' };
      } },

    // ── 37: derivadas de polinomios
    'derivative-poly': { label: 'Derivar polinomios', level: 37,
      gen() {
        const a = rand(2, 6), n = rand(2, 4);
        const ansCoef = a * n, ansExp = n - 1;
        const ansStr = ansExp === 1 ? `${ansCoef}x` : `${ansCoef}x${sup(ansExp)}`;
        const w1 = `${a}x${sup(ansExp)}`;
        const w2 = `${ansCoef}x${sup(n)}`;
        const w3 = `${a*n+1}x${sup(ansExp)}`;
        return { type: 'expr', prompt: 'Deriva f(x):',
          payload: { html: `f(x) = ${a}x${sup(n)}` }, answer: ansStr,
          options: shuffle([ansStr, w1, w2, w3]), inputKind: 'choice' };
      } },

    // ── 38: integrales de polinomios
    'integral-poly': { label: 'Integrar polinomios', level: 38,
      gen() {
        // ∫ a·x^n dx = a/(n+1) x^(n+1)
        const n = rand(1, 4);
        const coefOut = rand(1, 5);
        const a = coefOut * (n+1);
        const ansStr = `${coefOut}x${sup(n+1)}+C`;
        const w1 = `${a}x${sup(n+1)}+C`;
        const w2 = `${a/(n)}x${sup(n)}+C`;
        const w3 = `${coefOut}x${sup(n)}+C`;
        return { type: 'expr', prompt: 'Calcula la integral:',
          payload: { html: `∫ ${a}x${sup(n)} dx` }, answer: ansStr,
          options: shuffle([ansStr, w1, w2, w3]), inputKind: 'choice' };
      } },

    // ── 39: trigonometría
    'trig-values': { label: 'Valores de seno y coseno', level: 39,
      gen() {
        const data = [
          { q: 'sin(0)',     a: '0' },
          { q: 'sin(π/2)',   a: '1' },
          { q: 'sin(π)',     a: '0' },
          { q: 'cos(0)',     a: '1' },
          { q: 'cos(π/2)',   a: '0' },
          { q: 'cos(π)',     a: '-1' },
          { q: 'sin(π/6)',   a: '1/2' },
          { q: 'cos(π/3)',   a: '1/2' },
          { q: 'tan(0)',     a: '0' },
        ];
        const p = pick(data);
        const pool = ['0','1','-1','1/2','√2/2','√3/2'].filter(v => v !== p.a);
        const opts = shuffle(pool).slice(0, 3);
        return { type: 'expr', prompt: 'Calcula el valor:',
          payload: { html: p.q }, answer: p.a,
          options: shuffle([p.a, ...opts]),
          inputKind: 'choice', forceChoice: true };
      } },

    // ── 40: derivadas con regla de la cadena
    'derivative-chain': { label: 'Derivar (regla de la cadena)', level: 40,
      gen() {
        const a = rand(2, 4), b = rand(1, 5), n = rand(2, 3);
        const coef = n * a;
        const ansStr = `${coef}(${a}x+${b})${sup(n-1)}`;
        const w1 = `${n}(${a}x+${b})${sup(n-1)}`;
        const w2 = `${coef}(${a}x+${b})${sup(n)}`;
        const w3 = `${a}(${a}x+${b})${sup(n-1)}`;
        return { type: 'expr', prompt: 'Deriva:',
          payload: { html: `f(x) = (${a}x + ${b})${sup(n)}` }, answer: ansStr,
          options: shuffle([ansStr, w1, w2, w3]), inputKind: 'choice', forceChoice: true };
      } },

    // ── 41: integrales por sustitución
    'integral-sub': { label: 'Integrar por sustitución', level: 41,
      gen() {
        const a = rand(2, 4), b = rand(1, 5), n = rand(1, 3);
        const denom = (n+1);
        const ansStr = `(${a}x+${b})${sup(n+1)}/${denom}+C`;
        const w1 = `${a}(${a}x+${b})${sup(n+1)}+C`;
        const w2 = `(${a}x+${b})${sup(n)}/${denom}+C`;
        const w3 = `(${a}x+${b})${sup(n+1)}+C`;
        return { type: 'expr', prompt: 'Calcula la integral:',
          payload: { html: `∫ ${a}(${a}x+${b})${sup(n)} dx` }, answer: ansStr,
          options: shuffle([ansStr, w1, w2, w3]), inputKind: 'choice', forceChoice: true };
      } },

    // ─── VARIEDAD: factor faltante y problemas verbales ───
    'add-missing-10': { label: 'Factor faltante en sumas (≤10)', level: 7,
      gen() {
        const ans = rand(1, 9), a = rand(1, 10 - ans);
        const c = a + ans;
        return { type: 'expr', prompt: 'Encuentra el número que falta:',
          payload: { html: `${a} + ? = ${c}` }, answer: ans,
          options: shuffle([ans, ...numDistractorsStep(ans, 1, 3, 1, 10)]),
          inputKind: 'choice' };
      } },
    'sub-missing-10': { label: 'Factor faltante en restas (≤10)', level: 8,
      gen() {
        const a = rand(3, 10), ans = rand(1, a-1);
        const c = a - ans;
        return { type: 'expr', prompt: 'Encuentra el número que falta:',
          payload: { html: `${a} − ? = ${c}` }, answer: ans,
          options: shuffle([ans, ...numDistractorsStep(ans, 1, 3, 0, 10)]),
          inputKind: 'choice' };
      } },
    'mul-missing': { label: 'Factor faltante en multiplicaciones', level: 12,
      gen() {
        const ans = rand(2, 9), a = rand(2, 9);
        const c = a * ans;
        return { type: 'expr', prompt: 'Encuentra el número que falta:',
          payload: { html: `${a} × ? = ${c}` }, answer: ans,
          options: shuffle([ans, ...numDistractorsStep(ans, 1, 3, 1, 12)]),
          inputKind: 'choice' };
      } },
    'word-add-10': { label: 'Problemas de sumar (≤10)', level: 7,
      gen() {
        const personas = ['Lucía','Mateo','Sara','Pablo','Ana','Hugo','Inés'];
        const cosas = ['caramelos','cromos','canicas','pegatinas','manzanas','globos','lápices'];
        const nombre = pick(personas), cosa = pick(cosas);
        const a = rand(1, 6), b = rand(1, 10 - a);
        return { type: 'word', prompt: 'Problema:',
          payload: { text: `${nombre} tiene ${a} ${cosa} y le dan ${b} más. ¿Cuántos ${cosa} tiene ahora?` },
          answer: a + b,
          options: shuffle([a+b, ...numDistractorsStep(a+b, 1, 3, 0, 12)]),
          inputKind: 'choice' };
      } },
    'word-sub-10': { label: 'Problemas de restar (≤10)', level: 8,
      gen() {
        const personas = ['Lucía','Mateo','Sara','Pablo','Ana','Hugo','Inés'];
        const cosas = ['caramelos','cromos','canicas','pegatinas','manzanas','globos','lápices'];
        const nombre = pick(personas), cosa = pick(cosas);
        const a = rand(4, 10), b = rand(1, a-1);
        return { type: 'word', prompt: 'Problema:',
          payload: { text: `${nombre} tiene ${a} ${cosa} y regala ${b}. ¿Cuántos ${cosa} le quedan?` },
          answer: a - b,
          options: shuffle([a-b, ...numDistractorsStep(a-b, 1, 3, 0, 10)]),
          inputKind: 'choice' };
      } },

    // ── 42: ecuaciones diferenciales sencillas
    'diff-eq': { label: 'Ecuaciones diferenciales', level: 42,
      gen() {
        const a = pick([2, 4, 6, 8]);
        const ansStr = `${a/2}x²+C`;
        const w1 = `${a}x²+C`;
        const w2 = `${a/2}x+C`;
        const w3 = `${a}x+C`;
        return { type: 'expr', prompt: 'Resuelve la ecuación diferencial:',
          payload: { html: `y' = ${a}x` }, answer: ansStr,
          options: shuffle([ansStr, w1, w2, w3]), inputKind: 'choice', forceChoice: true };
      } },
  };

  return { LEVELS, SKILLS, helpers: { rand, pick, shuffle, gcd, lcm, sup, numDistractorsStep } };
})();
