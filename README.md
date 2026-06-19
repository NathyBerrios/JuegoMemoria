Proyecto Juego de memoria (https://nathyberrios.github.io/JuegoMemoria/JuegoMemoria/)

Mini-app interactiva con DOM y eventos desarrollado con JavaScript, HTML y CSS para Programación Front End.
Para ejecutar el proyecto puedes ingresar al link, clonar o descargar el repositorio. 
Escribir un nombre, escoger la dificultad y presionar Iniciar Juego. Al presionar R reinicias el juego.

¿Dónde te ayudó la IA y dónde te dio código incorrecto o de mala calidad que tuviste que corregir?
Usé IA para construir la estructura inicial del juego, para entender el codigo y recordar sintaxis. 
El codigo que me entrego tenia los mismo errores que el codigo que se debía auditar:
-No tenia variables de bloqueo permitiendo hacer clic rápido en tres cartas seguidas.
-Permitia hacerdoble clic en la misma carta y el juego se rompía, ya que la carta se comparaba consigo misma y quedaba marcada como par encontrado sin serlo.
-Usaba innerHTML para mostrar el nombre del jugador en el mensaje de victoria, lo cual es una vulnerabilidad de seguridad real.
-Creaba un addEventListener por cada carta dentro de render(), lo que genera listeners innecesarios cada vez que se redibuja el tablero.
El HTML entregado no tenia estructura semantica, todo estaba dentro del body por lo que se agrego "<header>, <main> y <footer>" para corregir estructura.
El CSS tenía todos sus valores en px, esto bloquea la accesibilidad para cambiar el tamaño de la letra, rompe la elasticidad del diseño y dificulta el mantenimiento de la página.


Justifica dos decisiones de diseño de tu app.
-Delegación de eventos: en lugar de añadir un addEventListener('click', ...) a cada carta dentro de render(), puse un único listener en el contenedor #tablero.
Es mejor porque al llamar a render() en el código original se creaban 16 listeners nuevos. Con delegación solo hay uno sin importar cuántas cartas haya ni cuántas veces se redibuje el tablero.

-textContent en vez de innerHTML para datos del usuario: innerHTML interpreta lo que le pasas como código HTML y ese código se ejecutaría en el navegador.
Esto es una vulnerabilidad de seguridad real porque permite inyectar código malicioso. En cambio textContent trata todo como texto plano, es la forma segura de mostrar cualquier dato que venga del usuario.

Una cosa que mejorarías con más tiempo.
-Agregaría un cronómetro que mide los segundos de cada partida y guardaría el mejor tiempo usando localStorage, para que el récord persista aunque se cierre el navegador.
También adaptaría el tablero para que sea responsivo en pantallas de celular, cambiando la grilla de 4 columnas fijas a una que se ajuste según el ancho disponible.
