# Historial compartido y PDF directo

## Activación

Se utiliza la misma base Upstash Redis conectada a Vercel para los consecutivos. No se copian credenciales al navegador.

El historial tiene acceso directo sin contraseña por solicitud del usuario. Cualquier persona con acceso al enlace puede consultar los documentos. La variable anterior `HISTORY_ACCESS_PASSWORD` ya no se utiliza. Las variables de Redis existentes `KV_REST_API_URL` y `KV_REST_API_TOKEN` siguen siendo necesarias y permanecen exclusivamente en el servidor.

## Uso

- **Guardar borrador** conserva el trabajo solo en el navegador.
- **Guardar en historial**, **Imprimir** y **Descargar PDF** validan, reservan el consecutivo central y guardan una copia completa en la base. No requieren iniciar sesión.
- **Historial** permite buscar por nombre, documento, consecutivo o fecha (AAAA-MM-DD o DD/MM/AAAA), filtrar por módulo, y cargar más resultados.
- **Abrir documento** recupera los datos y su reserva original: reimprimir o descargar no consume un número nuevo. Antes de sustituir un borrador con nombre de paciente se pide confirmación.
- Los documentos archivados son inmutables: intentar guardar datos diferentes con el mismo consecutivo devuelve un aviso. Use **Limpiar** para iniciar un documento nuevo. No hay eliminación del historial en esta versión.
- Los registros guardados únicamente en versiones anteriores dentro de un navegador no se trasladan automáticamente al historial central. La sección antigua de FOMAG se conserva identificada como local.

La descarga PDF ocurre en el navegador y produce texto seleccionable. Accidentes usa A4 y FOMAG tamaño carta. Relatos extensos continúan en páginas adicionales; no se recorta contenido para forzarlo a una sola hoja. El archivo incluye consecutivo y nombre de paciente en su nombre.

## Comprobación

`node --test tests/history.test.mjs` comprueba acceso sin clave, validación de origen, normalización, búsqueda, recuperación y protección de documentos ya archivados, usando almacenamiento simulado. `pnpm build` verifica y compila el cliente.

La verificación visual utiliza pacientes ficticios. No use la base de producción para pruebas de carga, ni conecte previews a la misma base si van a escribir registros de prueba. El historial contiene datos personales: mantenga las copias de seguridad y la retención que requiera el hospital.
