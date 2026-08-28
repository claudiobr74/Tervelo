#!/usr/bin/env bash
# Gera um par RSA PKCS#8 (RS256) e grava em .secrets.
# O Auth do Nhost sai com exit 1 se NHOST_JWT_PRIVATE_KEY não for uma chave
# privada PKCS#8 completa (BEGIN/END + quebras de linha reais).
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

if ! command -v openssl >/dev/null; then
  echo "openssl é necessário." >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$tmp/jwt_private.pem" >/dev/null 2>&1
openssl rsa -pubout -in "$tmp/jwt_private.pem" -out "$tmp/jwt_public.pem" >/dev/null 2>&1

# PKCS#8 de verdade (BEGIN PRIVATE KEY, não BEGIN RSA PRIVATE KEY).
if ! grep -q "BEGIN PRIVATE KEY" "$tmp/jwt_private.pem"; then
  echo "A chave privada não saiu em PKCS#8." >&2
  exit 1
fi

kid="tervelo-rs256-1"
pub="$(cat "$tmp/jwt_public.pem")"
priv="$(cat "$tmp/jwt_private.pem")"

quote() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' <<<"$1"
}

secrets="$root/.secrets"
if [[ ! -f "$secrets" ]]; then
  cp "$root/.secrets.example" "$secrets"
fi

python3 - "$secrets" "$kid" "$pub" "$priv" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
kid, pub, priv = sys.argv[2], sys.argv[3], sys.argv[4]
text = path.read_text() if path.exists() else ""
keys = {
    "NHOST_JWT_KID": kid,
    "NHOST_JWT_PUBLIC_KEY": pub,
    "NHOST_JWT_PRIVATE_KEY": priv,
}

def dump(value: str) -> str:
    # TOML-like quoted string with real newlines escaped for the dotenv parser.
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return '"' + escaped.replace("\n", "\\n") + '"'

lines = text.splitlines()
seen = set()
out = []
for line in lines:
    name = line.split("=", 1)[0].strip() if "=" in line and not line.lstrip().startswith("#") else ""
    if name in keys:
        out.append(f"{name}={dump(keys[name])}")
        seen.add(name)
    else:
        out.append(line)
for name, value in keys.items():
    if name not in seen:
        out.append(f"{name}={dump(value)}")
path.write_text("\n".join(out).rstrip() + "\n")
PY

echo "Par RS256 gravado em .secrets (gitignored)."
echo
echo "No dashboard Nhost → Settings → Secrets, crie/atualize estes três nomes."
echo "Cole o PEM inteiro, com as linhas BEGIN/END e quebras de linha."
echo "Não use o placeholder do .secrets.example — o Auth cai com exit 1."
echo
echo "----- NHOST_JWT_KID -----"
echo "$kid"
echo
echo "----- NHOST_JWT_PUBLIC_KEY -----"
cat "$tmp/jwt_public.pem"
echo "----- NHOST_JWT_PRIVATE_KEY -----"
cat "$tmp/jwt_private.pem"
