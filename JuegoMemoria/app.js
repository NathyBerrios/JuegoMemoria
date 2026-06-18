// ============================================================
// app.js — Juego de Memoria
// ============================================================

const TODOS_LOS_EMOJIS = [
  '🍎', '🚀', '🐱', '🌵', '🎲', '🎧', '⚽', '🍕',
  '🦋', '🌈', '🐢', '🍦'
];
//Estado
const state = {
  nombre: '',           // nombre del jugador
  cartas: [],           // arreglo de objetos { emoji, encontrada, volteada }
  seleccionadas: [],    // índices de las cartas seleccionadas en el turno actual (máx 2)
  movimientos: 0,       // contador de pares intentados
  bloqueado: false,     // TRUE mientras se resuelve un par → bloquea nuevos clicks
  iniciado: false       // FALSE antes de que el jugador haga clic en Iniciar
};

// Referencias al DOM
const tablero    = document.getElementById('tablero');
const btnIniciar = document.getElementById('btnIniciar');
const inputNombre = document.getElementById('inputNombre');
const selectDificultad = document.getElementById('selectDificultad');
const parrafoMovimientos = document.getElementById('movimientos');
const parrafoMensaje = document.getElementById('mensaje');

// Mezcla el arreglo con Fisher-Yates. Devuelve una copia nueva.
function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Prepara el estado y llama a construirTablero() una sola vez.
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
  construirTablero();
}

// Crea los elementos div de cada carta UNA SOLA VEZ al iniciar.
function construirTablero() {
  // Limpiamos el tablero solo aquí, al inicio de cada partida
  tablero.innerHTML = '';

  state.cartas.forEach(function(carta, indice) {
    const div = document.createElement('div');
    div.classList.add('carta');
    div.dataset.indice = indice;
    div.textContent = '?';  // todas boca abajo al empezar
    tablero.appendChild(div);
  });

  // Actualizamos contador
  parrafoMovimientos.textContent = 'Movimientos: ' + state.movimientos;
}

// Recorre los divs existentes y actualiza solo clases y texto
function actualizarVistas() {
  // tablero.children son los divs que ya existen en el DOM
  const divs = tablero.children;

  state.cartas.forEach(function(carta, indice) {
    const div = divs[indice];

    // Limpiamos las clases variables (dejamos solo 'carta')
    div.classList.remove('volteada', 'encontrada');

    if (carta.encontrada) {
      div.classList.add('encontrada');
      div.textContent = carta.emoji;

    } else if (carta.volteada) {
      div.classList.add('volteada');
      div.textContent = carta.emoji;

    } else {
      div.textContent = '?';
    }
  });

  // Actualizamos el contador de movimientos
  parrafoMovimientos.textContent = 'Movimientos: ' + state.movimientos;
}

// Lógica del juego cuando se hace click en una carta.
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

      actualizarVistas();
      revisarVictoria();

    } else {
      // No coinciden: bloqueamos mientras se muestran y luego ocultamos
      state.bloqueado = true;
      actualizarVistas();

      setTimeout(function() {
        // Ocultamos las dos cartas en el estado
        state.cartas[indiceA].volteada = false;
        state.cartas[indiceB].volteada = false;
        state.seleccionadas = [];
        state.bloqueado = false; // desbloqueamos el tablero
        actualizarVistas();
      }, 900);
    }
  } else {
    // Solo hay una carta volteada, actualizamos la vista
    actualizarVistas();
  }
}

// Revisa si todas las cartas fueron encontradas.
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
