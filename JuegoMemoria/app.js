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

  const mazo = [];
  emojisUsados.forEach(function(emoji) {
    mazo.push({ emoji: emoji, encontrada: false });
    mazo.push({ emoji: emoji, encontrada: false });
  });

  nombre    = inputNombre.value;
  cartas    = barajar(mazo);
  volteadas = [];
  movimientos = 0;

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

function voltearCarta(div) {
  const i = Number(div.dataset.indice);

  // No hay bloqueo ni chequeo de carta ya volteada

  div.textContent = cartas[i].emoji;
  div.classList.add('volteada');
  volteadas.push(i);

  if (volteadas.length === 2) {
    movimientos++;
    parrafoMovimientos.textContent = 'Movimientos: ' + movimientos;

    const a = volteadas[0];
    const b = volteadas[1];
    const divs = tablero.children;

    // Comparación usando el DOM en vez del estado
    if (divs[a].textContent === divs[b].textContent) {
      cartas[a].encontrada = true;
      cartas[b].encontrada = true;
      divs[a].classList.remove('volteada');
      divs[b].classList.remove('volteada');
      divs[a].classList.add('encontrada');
      divs[b].classList.add('encontrada');
      volteadas = [];
      revisarVictoria();
    } else {
      setTimeout(function() {
        divs[a].textContent = '?';
        divs[b].textContent = '?';
        divs[a].classList.remove('volteada');
        divs[b].classList.remove('volteada');
        volteadas = [];
      }, 900);
    }
  }
}

function revisarVictoria() {
  const todasEncontradas = cartas.every(function(carta) {
    return carta.encontrada;
  });
  if (todasEncontradas) {
    // innerHTML con dato del usuario
    parrafoMensaje.innerHTML = '¡Ganaste, ' + nombre + '! 🎉';
  }
}

btnIniciar.addEventListener('click', iniciarJuego);

document.addEventListener('keydown', function(evento) {
  if (evento.key === 'r' || evento.key === 'R') {
    iniciarJuego();
  }
});

selectDificultad.addEventListener('change', function() {
  if (cartas.length > 0) {
    iniciarJuego();
  }
});
