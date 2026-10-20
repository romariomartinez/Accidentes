# Dictado del relato

En Accidentes, abra **Relato de los hechos** y pulse **Dictar relato**. Permita el micrófono en el navegador, dicte en español y pulse **Detener dictado** antes de revisar, guardar o imprimir.

El dictado agrega las frases confirmadas al final del texto existente. Las palabras provisionales aparecen separadas en **Reconociendo** hasta que el servicio las confirme. Puede seguir editando el relato manualmente. No se transforma el contenido ni se generan hechos automáticamente.

El micrófono no se enciende al cargar la página. Se apaga al cerrar la sección, cambiar de módulo, ocultar la pestaña, abandonar la página o imprimir desde el navegador. No se reinicia por sí solo. Mientras está activo, las acciones de guardar, imprimir, descargar y regenerar el relato se deshabilitan; el botón **Detener dictado** permanece disponible.

Utiliza la Web Speech API (`SpeechRecognition` o `webkitSpeechRecognition`) con idioma `es-CO`; requiere un navegador compatible y un contexto seguro, como el sitio HTTPS en Vercel. La disponibilidad del constructor no garantiza que su servicio de voz esté habilitado. Si no está disponible, el formulario conserva la escritura manual.

Algunos navegadores envían el audio a su servicio de reconocimiento y necesitan internet. La aplicación no recibe ni almacena archivos de audio; únicamente guarda el texto confirmado. La interfaz informa de este procesamiento antes de iniciar. No requiere claves de un proveedor ni cambios en Redis.

Las pruebas `node --test tests/dictation.test.mjs` (Node 22.18 o posterior) simulan resultados finales y provisionales, permisos denegados, errores de red, sesiones repetidas y cancelaciones. No capturan audio del usuario. La disponibilidad real del micrófono, los permisos y la precisión del reconocimiento se comprueban en el equipo donde se va a utilizar.

Referencia: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
