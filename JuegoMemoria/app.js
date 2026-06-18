// ============================================================
// app.js — Juego de Memoria
// ============================================================

const TODOS_LOS_EMOJIS = [
  '🍎', '🚀', '🐱', '🌵', '🎲', '🎧', '⚽', '🍕',
  '🦋', '🌈', '🐢', '🍦'
];

let cartas = [];
let volteadas = [];
let movimientos = 0;
let nombre = '';
//variable de bloqueo
let bloqueado = false;

const tablero    = document.getElementById('tablero');
const btnIniciar = document.getElementById('btnIniciar');
const inputNombre = document.getElementById('inputNombre');
const selectDificultad = document.getElementById('selectDificultad');
const parrafoMovimientos = document.getElementById('movimientos');
const parrafoMensaje = document.getElementById('mensaje');

function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function iniciarJuego() {
  const dificultad = selectDificultad.value;
  let cantidadPares;
  if (dificultad === 'facil')   cantidadPares = 4;
  if (dificultad === 'normal')  cantidadPares = 8;
  if (dificultad === 'dificil') cantidadPares = 12;

  const emojisUsados = TODOS_LOS_EMOJIS.slice(0, cantidadPares);

  // Creamos dos cartas por cada emoji (los pares)
  const mazo = [];
  emojisUsados.forEach(function(emoji) {
    mazo.push({ emoji: emoji, encontrada: false, volteada: false });
    mazo.push({ emoji: emoji, encontrada: false, volteada: false });
  });

  // Actualizamos el estado
  state.nombre      = inputNombre.value.trim(); // .trim() elimina espacios al inicio/fin
  state.cartas      = barajar(mazo);
  state.seleccionadas = [];
  state.movimientos = 0;
  state.bloqueado   = false;
  state.iniciado    = true;

  parrafoMensaje.textContent = '';
  render();
}

function render() {
  // Limpiamos el tablero antes de redibujar
  tablero.innerHTML = '';

  // Por cada carta en el estado, creamos un elemento div
  state.cartas.forEach(function(carta, indice) {
    const div = document.createElement('div');
    div.classList.add('carta');

    // Guardamos el índice como dato del elemento (lo usamos en el click)
    div.dataset.indice = indice;

    // Decidimos qué mostrar según el estado de la carta
    if (carta.encontrada) {
      // Par encontrado: mostramos emoji con fondo verde
      div.classList.add('encontrada');
      div.textContent = carta.emoji;

    } else if (carta.volteada) {
      // Volteada en este turno: mostramos emoji con fondo claro
      div.classList.add('volteada');
      div.textContent = carta.emoji;

    } else {
      // Boca abajo: mostramos símbolo de pregunta
      div.textContent = '?';
    }

    tablero.appendChild(div);
  });

  // Actualizamos el contador de movimientos
  parrafoMovimientos.textContent = 'Movimientos: ' + state.movimientos;
}

// FUNCIÓN: clickCarta
// Se ejecuta cuando el jugador hace click en una carta.
// Recibe el índice de la carta clickeada.
// ============================================================
function manejarClickCarta(indice) {
  // --- Guardas: situaciones en que ignoramos el click ---

  // 1. El juego no ha iniciado todavía
  if (!state.iniciado) return;

  // 2. El tablero está bloqueado (resolviendo un par)
  if (state.bloqueado) return;

  // 3. La carta ya fue encontrada
  if (state.cartas[indice].encontrada) return;

  // 4. La carta ya está volteada en este turno (evita doble click)
  if (state.cartas[indice].volteada) return;

  // 5. Ya hay dos cartas seleccionadas (no debería pasar por el bloqueo, pero por seguridad)
  if (state.seleccionadas.length >= 2) return;

  // --- Voltear la carta en el estado ---
  state.cartas[indice].volteada = true;
  state.seleccionadas.push(indice);

  // --- Si ya hay dos cartas seleccionadas, comparamos ---
  if (state.seleccionadas.length === 2) {
    // Contamos este intento como un movimiento
    state.movimientos++;

    const indiceA = state.seleccionadas[0];
    const indiceB = state.seleccionadas[1];

    // Comparamos usando el ESTADO, no el DOM
    if (state.cartas[indiceA].emoji === state.cartas[indiceB].emoji) {
      // ¡Par encontrado!
      state.cartas[indiceA].encontrada = true;
      state.cartas[indiceB].encontrada = true;
      state.cartas[indiceA].volteada   = false; // ya no necesitamos esta bandera
      state.cartas[indiceB].volteada   = false;
      state.seleccionadas = [];
      // No bloqueamos: el jugador puede seguir jugando de inmediato

      render();
      revisarVictoria();

    } else {
      // No coinciden: bloqueamos mientras se muestran y luego ocultamos
      state.bloqueado = true;
      render(); // mostramos las dos cartas volteadas

      setTimeout(function() {
        // Ocultamos las dos cartas en el estado
        state.cartas[indiceA].volteada = false;
        state.cartas[indiceB].volteada = false;
        state.seleccionadas = [];
        state.bloqueado = false; // desbloqueamos el tablero
        render(); // redibujamos
      }, 900);
    }
  } else {
    // Solo hay una carta volteada, redibujamos para mostrarla
    render();
  }
}


// ============================================================
// FUNCIÓN: revisarVictoria
// Revisa si todas las cartas fueron encontradas.
// ============================================================
function revisarVictoria() {
  const todasEncontradas = state.cartas.every(function(carta) {
    return carta.encontrada;
  });

  if (todasEncontradas) {
    // Usamos textContent (NUNCA innerHTML con datos del usuario → XSS)
    const nombreMostrar = state.nombre !== '' ? state.nombre : 'Jugador';
    parrafoMensaje.textContent = '¡Ganaste, ' + nombreMostrar + '! 🎉 — ' + state.movimientos + ' movimientos';
  }
}


// --- Evento 1: click en botón iniciar ---
btnIniciar.addEventListener('click', iniciarJuego);


// --- Evento 2: delegación de eventos en el tablero ---
// UN SOLO listener en el contenedor (#tablero), no uno por carta.
// Cuando hacen click en cualquier parte del tablero, verificamos
// si el click fue en una carta y obtenemos su índice.
tablero.addEventListener('click', function(evento) {
  // evento.target es el elemento exacto donde hicieron click
  const elementoClickeado = evento.target;

  // Verificamos que sea una carta (tiene clase "carta")
  if (!elementoClickeado.classList.contains('carta')) return;

  // Obtenemos el índice desde el atributo data-indice
  const indice = Number(elementoClickeado.dataset.indice);

  // Llamamos a la función que maneja la lógica
  manejarClickCarta(indice);
});


// --- Evento 3: keydown — presionar R reinicia el juego ---
// Este es uno de los "dos tipos de evento además de click" que pide el proyecto
document.addEventListener('keydown', function(evento) {
  // evento.key nos dice qué tecla se presionó
  if (evento.key === 'r' || evento.key === 'R') {
    iniciarJuego();
  }
});


// --- Evento 4: change en el select de dificultad ---
// Al cambiar la dificultad, si el juego ya inició, reiniciamos
selectDificultad.addEventListener('change', function() {
  if (state.iniciado) {
    iniciarJuego();
  }
});
