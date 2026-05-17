# Mates · El Método

App web para practicar matemáticas con **repaso espaciado (SRS)** estilo Leitner,
pensada para niños de cualquier edad. Inspirada en métodos progresivos: 
pasos pequeños, ánimo positivo, sin comparar entre niños, y
sin volver a pedirle a un niño que reconozca el número 5 cuando ya está
resolviendo ecuaciones.

## Cómo abrirla

### Local (un solo dispositivo)
Doble clic en `index.html`. El progreso se guarda en `localStorage`.

### Acceso desde móvil/tablet y ordenador
Sube la carpeta a cualquier hosting estático gratis (GitHub Pages,
Netlify Drop, Cloudflare Pages, Vercel). Una vez en una URL pública, los
niños pueden "Añadir a pantalla de inicio" desde el navegador y se
comporta como una app (PWA, funciona offline). Con `localStorage` el
progreso es por dispositivo; usa **Exportar/Importar JSON** desde el
panel del orientador para moverlo entre aparatos.

## Currículo (42 niveles)

**Contar (1–4)** – contar puntos hasta 5/10, reconocer cifras 1–20,
secuencias, antes/después, decenas hasta 100, de 10 en 10.

**Escribir números (5)** – de palabra a cifra hasta 50.

**Cuatro operaciones (6–16)** – sumas +1..+5, hasta 10, hasta 20; restas
equivalentes; multiplicar ×1/×2/×5/×10, tablas hasta ×10; divisiones
exactas y hasta 100; sumas y restas verticales de 2 cifras;
multiplicación/división de 2 cifras × 1 cifra.

**Fracciones (17–23)** – reconocer fracciones (visual con tarta),
fracciones equivalentes, simplificar, m.c.d., m.c.m., sumar/restar con
mismo y distinto denominador, multiplicar y dividir; decimales.

**Álgebra básica (24–33)** – números negativos (suma, resta,
multiplicación, división), sustituir variables, ecuaciones lineales,
monomios, polinomios, factor común, raíces cuadradas exactas, factorizar
ecuaciones cuadráticas, teorema de Pitágoras.

**Funciones (34–39)** – evaluar f(x), logaritmos básicos, límites de
polinomios, derivadas e integrales de polinomios, valores
trigonométricos notables.

**Cálculo (40–42)** – derivadas con regla de la cadena, integrales por
sustitución, ecuaciones diferenciales sencillas.

## Mecánicas clave

**Prueba de nivel** – Al crear el perfil se hacen ~25 preguntas tipo
"acierta o paramos" que colocan al niño en el nivel adecuado sin
importar la edad.

**SRS (Leitner)** – 6 cajas con intervalos crecientes (mismo día → 10 min
→ 1 día → 3 → 7 → 14). Acierto sube de caja, fallo vuelve a 1.

**Graduación de habilidades** – Una habilidad muy básica deja de
aparecer cuando el niño ya está suficientemente avanzado. Reglas
concretas:

- Caja 6: graduada siempre.
- Caja 5 y `nivel_actual − nivel_skill ≥ 2`: graduada.
- Caja 4 y gap ≥ 4: graduada.
- Caja 3 y gap ≥ 8: graduada.

Esto evita que un niño que ya está sumando hasta 20 vea otra vez
"toca el número 5".

**Sesiones de ~10 ejercicios** – mezcla vencidas (no graduadas) con
nuevas del nivel actual (máx. 4 nuevas por sesión).

**Escritura a mano** – En los ejercicios con respuesta numérica el niño
puede dibujar la cifra con el dedo o el ratón en lugar de pulsar un
teclado. Reconocimiento en navegador con TensorFlow.js + un modelo
MNIST pre-entrenado (~98.5% de precisión). El modelo se descarga la
primera vez (~13 MB) y queda cacheado offline; nada se envía a
ningún servidor. Configurable desde el panel del orientador en tres
modos: "mixto" (alterna), "siempre a mano" o "siempre teclado".
Si el reconocedor falla por cualquier motivo, la app cae al teclado
sin contar el ejercicio como fallo.

**Promoción de nivel** – Cuando todas las habilidades del nivel actual
están en caja ≥ 3 con al menos 3 aciertos, el perfil sube de nivel.

## Estructura del proyecto

```
index.html       UI (templates de pantallas)
styles.css       estilos responsive mobile-first
storage.js       capa fina sobre localStorage (perfiles, estado, export/import)
exercises.js     catálogo de skills y generadores
srs.js           motor Leitner + planificador + graduación
handwrite.js     reconocimiento de dígitos a mano (TF.js + MNIST)
app.js           enrutador y vistas
manifest.json    PWA
sw.js            service worker (offline + caché del modelo MNIST)
icon.svg         icono
```

## Cómo añadir más

**Una nueva habilidad** – Crea un `skillId` en `exercises.js` dentro de
`SKILLS` con `label`, `level` y `gen()` que devuelva un ejercicio.
Añade el id al array `skills` del nivel correspondiente en `LEVELS`.

**Un nuevo nivel** – Añade una entrada en `LEVELS` con un `id` único
(consecutivo es lo más sencillo), un `name` y la lista de `skills`.
Si el niño se promociona allí, ya empieza a recibir esos ejercicios.

**Un nuevo tipo visual** – Añade el `case` en `renderExercise` de
`app.js`. Los tipos de serie son: `count-dots`, `recognize-num`,
`recognize-word`, `before-after`, `write-number`, `sequence`, `add`,
`sub`, `mul`, `div`, `vert`, `frac-visual`, `expr` (HTML libre).

Los ejercicios con `inputKind: 'choice'` usan botones de opción; los de
`inputKind: 'keypad'` usan teclado numérico.

## Posibles mejoras

- Audio (Web Speech API) para que los más pequeños oigan los números.
- Backend opcional (Firebase, Supabase) para sincronía real entre
  dispositivos en vez del export/import manual.
- Más tipos visuales: barras de fracciones, recta numérica para
  negativos, plano cartesiano para funciones.
- Modo "examen" sin pistas para evaluaciones periódicas.
- Estadísticas por bloque temático en el panel del orientador.
