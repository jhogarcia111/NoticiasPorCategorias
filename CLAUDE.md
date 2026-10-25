## Acciones pendientes del usuario

Mantén en la raíz del repo el archivo `ACCIONES_USUARIO.md`. Es la lista de todo lo que
depende del usuario y que Claude no puede hacer por él.

- Al iniciar la sesión, lee `ACCIONES_USUARIO.md` y muéstrame un resumen corto de lo que
  sigue pendiente, antes de empezar a trabajar.
- Cada vez que algo dependa de mí (API key, variable de entorno, configuración, decisión,
  credencial, acceso, aprobación, dato del cliente, pago, DNS, etc.), agrégalo al archivo
  en ese momento, no al final de la sesión.
- Cada ítem lleva: fecha, qué debo hacer, por qué es necesario, dónde se configura o a
  quién se lo pido, y qué queda bloqueado mientras tanto.
- Cuando yo confirme que algo quedó resuelto, muévelo a la sección "Hecho".
- Si trabajas algo que depende de un pendiente abierto, recuérdamelo antes de continuar.
- Al terminar la sesión, repite en tu último mensaje la lista de pendientes abiertos.
- Si el archivo no existe, créalo con la plantilla estándar.
- Nunca escribas valores de claves, tokens o contraseñas en el archivo: solo el nombre de
  la variable y dónde debe configurarse.
