# Costa Rápida
Juego de coches pseudo-3D en JavaScript puro (ES modules), sin build ni dependencias.

## Probar en local
Los módulos ES no cargan con file://, usa un servidor:
    python3 -m http.server 8080   # http://localhost:8080

## Estructura
    index.html          entrada
    css/style.css       estilos y menú
    js/config.js        constantes y ajuste de dificultad
    js/road.js          curvas y proyección de la carretera
    js/input.js         teclado y táctil
    js/audio.js         sonido con WebAudio (motor, choque, roce)
    js/traffic.js       generación del tráfico
    js/game.js          reglas y estado
    js/render.js        dibujo en canvas
    js/storage.js       récord en localStorage
    js/main.js          arranque y bucle

## Desplegar en S3
    ./deploy.sh mi-bucket [id-cloudfront]
