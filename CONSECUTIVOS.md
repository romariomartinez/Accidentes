# Activar consecutivos centrales en Vercel

1. En el proyecto de Vercel, abra Storage / Marketplace y conecte una base Upstash Redis.
2. Configure en Production las variables UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN de esa base. Nunca use el prefijo VITE_ para estas credenciales.
3. Configure ACCIDENT_SEQUENCE_START y FOMAG_SEQUENCE_START con el ultimo numero utilizado de cada modulo (solo la parte numerica final). Use el mayor utilizado entre todos los navegadores. Si no hay registros anteriores, use 0.
4. Publique estos cambios y haga Redeploy despues de configurar las variables.
5. Pruebe documentos nuevos desde dos navegadores: al imprimir deben recibir numeros distintos. Reimprimir el mismo borrador debe conservar el numero.

El numero que muestra un borrador nuevo es provisional. Se reserva el definitivo al imprimir o guardar un registro FOMAG. La fecha del identificador utiliza Colombia; el contador no depende de la fecha. Cada modulo tiene su contador. Se requiere conexion para reservar numeros; ante un error se bloquea la impresion para evitar duplicados.

La reserva es atomica e idempotente mediante Lua en Redis. Los contadores y reservas no deben borrarse ni tener caducidad. Los documentos antiguos ya impresos no se renumeran por esta actualizacion. Los borradores anteriores reciben un numero central al volver a imprimir. Abrir copias independientes de un borrador en navegadores distintos las considera documentos nuevos. No se sincronizan los datos de pacientes ni el historial entre navegadores, solo los consecutivos. Los saltos son posibles si se reserva un numero y luego se cancela la impresion.

No conecte despliegues de prueba a la misma base de produccion. La aplicacion actual no tiene autenticacion: cualquier visitante con acceso puede solicitar numeros. Restrinja el acceso del despliegue si es de uso interno.
