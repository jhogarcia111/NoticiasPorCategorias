#!/usr/bin/env bash
# Hook SessionStart: imprime los pendientes abiertos (del usuario y de la IA) al iniciar la sesión.
# Todo lo que imprime este script llega al contexto de Claude en SessionStart.

ARCHIVO="${CLAUDE_PROJECT_DIR:-$PWD}/ACCIONES_USUARIO.md"

if [ ! -f "$ARCHIVO" ]; then
  echo "No existe ACCIONES_USUARIO.md en este proyecto. Créalo con la plantilla estándar y avísale al usuario."
  exit 0
fi

# Secciones: usuario = "## Pendiente" o "## Pendiente del usuario"; IA = "## Pendiente de la IA"
seccion() {
  tr -d '\r' < "$ARCHIVO" | awk -v modo="$1" '
    /^## /{
      f=0
      if (modo=="ia"      && $0 ~ /^## Pendiente de la IA/) f=1
      if (modo=="usuario" && $0 ~ /^## Pendiente/ && $0 !~ /^## Pendiente de la IA/) f=1
      next
    }
    f && $0 !~ /^[[:space:]]*$/'
}

USUARIO=$(seccion usuario)
IA=$(seccion ia)
N_USU=$(printf '%s\n' "$USUARIO" | grep -c '^- \[ \]' || true)
N_IA=$(printf '%s\n' "$IA" | grep -c '^- \[ \]' || true)

echo "=== PENDIENTES DEL PROYECTO: $N_USU del usuario, $N_IA de la IA ==="
echo "Muéstrale al usuario este resumen antes de empezar a trabajar y retoma los pendientes de la IA."
echo
echo "--- Pendiente del usuario ---"
printf '%s\n' "$USUARIO"
echo
echo "--- Pendiente de la IA ---"
printf '%s\n' "$IA"
