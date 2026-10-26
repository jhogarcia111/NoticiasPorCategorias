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

### Pendientes de la IA (mismo archivo)

`ACCIONES_USUARIO.md` tiene tres secciones: `## Pendiente del usuario`,
`## Pendiente de la IA` y `## Hecho`. Un dashboard local las lee, así que respeta
esos títulos exactos.

- En `## Pendiente de la IA` anota lo que tú (Claude) dejaste sin hacer, a medias
  o esperando algo. Mismo formato de ítem: `- [ ] AAAA-MM-DD — **Qué falta.**
  Bloqueado por: … Siguiente paso: …`.
- Si un pendiente de la IA depende de algo del usuario, enlázalos: en el ítem de la
  IA escribe "Bloqueado por: <ítem del usuario>".
- Al terminar una tarea de la IA, muévela a `## Hecho` con la fecha.
- Cada vez que modifiques `ACCIONES_USUARIO.md`, haz commit de ese archivo junto con
  el resto del trabajo. El dashboard calcula los días desde el último cambio con el
  historial de git, y un cambio sin commit se ve desactualizado.
- No reescribas ni reordenes ítems antiguos sin motivo: conserva su fecha original,
  porque de ella sale la antigüedad del pendiente.
