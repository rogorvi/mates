// handwrite.js — Reconocimiento de dígitos escritos a mano.
//
// Usa TensorFlow.js + un modelo MNIST CNN pre-entrenado público
// (bensonruan/Hand-Written-Digit-Recognition, ~98.5% precisión).
// Todo corre en el navegador: nada se sube a ningún servidor.
//
// La primera vez el navegador descarga el modelo (~13 MB) y lo cachea.
// Las siguientes sesiones cargan instantáneamente desde caché.

const Handwrite = (() => {
  const TFJS_URL  = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js';
  const MODEL_URL = 'https://cdn.jsdelivr.net/gh/bensonruan/Hand-Written-Digit-Recognition@master/models/model.json';
  const PIXEL_THRESHOLD = 30;     // intensidad mínima para considerar "hay tinta"

  let tfPromise = null;
  let modelPromise = null;

  function loadTf() {
    if (tfPromise) return tfPromise;
    if (window.tf) { tfPromise = Promise.resolve(window.tf); return tfPromise; }
    tfPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = TFJS_URL;
      s.onload  = () => resolve(window.tf);
      s.onerror = () => { tfPromise = null; reject(new Error('No se pudo cargar TensorFlow.js')); };
      document.head.appendChild(s);
    });
    return tfPromise;
  }

  function loadModel() {
    if (modelPromise) return modelPromise;
    modelPromise = (async () => {
      const tf = await loadTf();
      return tf.loadLayersModel(MODEL_URL);
    })().catch(err => { modelPromise = null; throw err; });
    return modelPromise;
  }

  // Llamar en cuanto se pueda para que el modelo esté listo cuando el niño lo necesite.
  function preload() { loadModel().catch(()=>{}); }

  // ─── Crea un canvas para dibujar un dígito ───
  // Devuelve { canvas, clear, isEmpty }
  function createPad(container, size = 200) {
    const wrap = document.createElement('div');
    wrap.className = 'handpad';
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    canvas.className = 'handpad-canvas';
    wrap.appendChild(canvas);
    container.appendChild(wrap);

    // Fondo negro y trazo blanco — formato que el modelo MNIST espera.
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let drawing = false;
    let last = null;

    function pos(e) {
      const r = canvas.getBoundingClientRect();
      const cx = e.clientX != null ? e.clientX : (e.touches && e.touches[0].clientX);
      const cy = e.clientY != null ? e.clientY : (e.touches && e.touches[0].clientY);
      return { x: (cx - r.left) * canvas.width / r.width,
               y: (cy - r.top)  * canvas.height / r.height };
    }
    function down(e) { e.preventDefault(); drawing = true; last = pos(e); dot(last); }
    function move(e) { if (!drawing) return; e.preventDefault();
      const p = pos(e);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(14, size / 14);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      last = p;
    }
    function up()   { drawing = false; }
    function dot(p) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(7, size / 28), 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    canvas.addEventListener('pointerleave', up);

    function clear() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function isEmpty() {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] > PIXEL_THRESHOLD) return false;
      }
      return true;
    }
    return { canvas, clear, isEmpty };
  }

  // ─── Reconoce un solo dígito de un canvas ───
  // Devuelve { digit: 0..9, confidence: 0..1 }
  async function recognize(canvas) {
    const tf = await loadTf();
    const model = await loadModel();
    return tf.tidy(() => {
      const t = tf.browser.fromPixels(canvas)
        .resizeNearestNeighbor([28, 28])
        .mean(2)
        .expandDims(2)
        .expandDims()
        .toFloat()
        .div(255.0);
      const pred = model.predict(t);
      const arr = pred.dataSync();
      let best = 0;
      for (let i = 1; i < arr.length; i++) if (arr[i] > arr[best]) best = i;
      return { digit: best, confidence: arr[best] };
    });
  }

  function isSupported() {
    // Necesitamos pointer events, canvas y un navegador moderno
    return typeof window.PointerEvent !== 'undefined'
      && typeof HTMLCanvasElement !== 'undefined';
  }

  return { preload, loadModel, recognize, createPad, isSupported };
})();
