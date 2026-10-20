# Historial compartido y PDF directo

## Activación

Se utiliza la misma base Upstash Redis conectada a Vercel para los consecutivos. No se copian credenciales al navegador.

Antes de publicar, agregue en Vercel una variable **Secret** llamada `HISTORY_ACCESS_PASSWORD`, en **Production**, con una clave privada de al menos 12 caracteres (máximo 256 para el formulario). Defina la clave directamente en Vercel, nunca en Git. Luego publique el cambio o vuelva a desplegarlo. Las variables de Redis existentes `KV_REST_API_URL` y `KV_REST_API_TOKEN` ya son compatibles.

El acceso se concede mediante una cookie firmada, HttpOnly y SameSite=Strict por 8 horas; en producción se exige HTTPS. Diez intentos de inicio de sesión por dirección en 15 minutos es el límite. Cambiar la clave invalida las sesiones anteriores. Esta solución usa una clave compartida, sin cuentas personales ni auditoría por funcionario.

## Uso

- **Guardar borrador** conserva el trabajo solo en el navegador.
- **Guardar en historial**, **Imprimir** y **Descargar PDF** validan, reservan el consecutivo central y guardan una copia completa en la base. Requieren iniciar sesión en el historial.
- **Historial** permite buscar por nombre, documento, consecutivo o fecha (AAAA-MM-DD o DD/MM/AAAA), filtrar por módulo, y cargar más resultados.
- **Abrir documento** recupera los datos y su reserva original: reimprimir o descargar no consume un número nuevo. Antes de sustituir un borrador con nombre de paciente se pide confirmación.
- Los documentos archivados son inmutables: intentar guardar datos diferentes con el mismo consecutivo devuelve un aviso. Use **Limpiar** para iniciar un documento nuevo. No hay eliminación del historial en esta versión.
- Los registros guardados únicamente en versiones anteriores dentro de un navegador no se trasladan automáticamente al historial central. La sección antigua de FOMAG se conserva identificada como local.

La descarga PDF ocurre en el navegador y produce texto seleccionable. Accidentes usa A4 y FOMAG tamaño carta. Relatos extensos continúan en páginas adicionales; no se recorta contenido para forzarlo a una sola hoja. El archivo incluye consecutivo y nombre de paciente en su nombre.

## Comprobación

`node --test tests/history.test.mjs` comprueba acceso, cookies, normalización, búsqueda, recuperación y protección de documentos ya archivados, usando almacenamiento simulado. `pnpm build` verifica y compila el cliente.

La verificación visual utiliza pacientes ficticios. No use la base de producción para pruebas de carga, ni conecte previews a la misma base si van a escribir registros de prueba. El historial contiene datos personales: entregue la clave únicamente al personal autorizado y mantenga las copias de seguridad y la retención que requiera el hospital.
