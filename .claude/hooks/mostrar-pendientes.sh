#!/usr/bin/env bash
# Hook SessionStart: imprime los pendientes abiertos del usuario al iniciar la sesión.
# Todo lo que imprime este script llega al contexto de Claude en SessionStart.

ARCHIVO="${CLAUDE_PROJECT_DIR:-$PWD}/ACCIONES_USUARIO.md"

if [ ! -f "$ARCHIVO" ]; then
  echo "No existe ACCIONES_USUARIO.md en este proyecto. Créalo con la plantilla estándar y avísale al usuario."
  exit 0
fi

PENDIENTE=$(awk '/^## Pendiente/{f=1;next} /^## /{f=0} f' "$ARCHIVO")
ABIERTOS=$(printf '%s\n' "$PENDIENTE" | grep -c '^- \[ \]' || true)

echo "=== ACCIONES PENDIENTES DEL USUARIO ($ABIERTOS abiertas) ==="
echo "Muéstrale al usuario este resumen antes de empezar a trabajar."
echo
printf '%s\n' "$PENDIENTE" | grep -v '^<!--\|^-->\|^Formato'
