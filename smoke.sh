#!/usr/bin/env bash
# Simple smoke tests for EcoRide API
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
EMAIL="${SMOKE_EMAIL:-smoke+$RANDOM@local.test}"
PASS="${SMOKE_PASS:-Password123!}"
PSEUDO="${SMOKE_PSEUDO:-SmokeUser}"

echo "== EcoRide smoke tests =="
echo "BASE_URL=$BASE_URL"
echo "EMAIL=$EMAIL"

if ! command -v jq >/dev/null 2>&1; then
  echo "This script needs 'jq' (JSON parser). Install it and re-run."
  exit 1
fi

# 1) Healthcheck
echo "[1/6] GET /api/health"
curl -sSf "$BASE_URL/api/health" | jq .ok

# 2) Register (ok if 201 or already exists 409)
echo "[2/6] POST /api/auth/register"
code=$(curl -s -o /dev/null -w "%{http_code}" -H "Content-Type: application/json"   -d "{"pseudo":"$PSEUDO","email":"$EMAIL","password":"$PASS"}"   "$BASE_URL/api/auth/register" || true)
if [[ "$code" != "201" && "$code" != "409" ]]; then
  echo "Register failed with HTTP $code"
  exit 1
fi
echo "Register -> HTTP $code (OK if 201 or 409)"

# 3) Login and capture token
echo "[3/6] POST /api/auth/login"
login_json=$(curl -sSf -H "Content-Type: application/json"   -d "{"email":"$EMAIL","password":"$PASS"}"   "$BASE_URL/api/auth/login")
token=$(echo "$login_json" | jq -r '.data.token')
if [[ -z "$token" || "$token" == "null" ]]; then
  echo "Login failed: token not found"
  echo "$login_json"
  exit 1
fi
echo "Token acquired."

# 4) Vehicles: create
echo "[4/6] POST /api/vehicles"
veh_json=$(curl -sSf -H "Content-Type: application/json" -H "Authorization: Bearer $token"   -d '{"make":"Renault","model":"Zoé","color":"blanc","energy":"electric","seats":4}'   "$BASE_URL/api/vehicles")
veh_id=$(echo "$veh_json" | jq -r '.data.id')
echo "Vehicle created: $veh_id"

# 5) Vehicles: list
echo "[5/6] GET /api/vehicles"
curl -sSf -H "Authorization: Bearer $token" "$BASE_URL/api/vehicles" | jq '.[0]? // .data? // .' >/dev/null
echo "Vehicles listed."

# 6) Vehicles: delete
echo "[6/6] DELETE /api/vehicles/:id"
curl -sSf -X DELETE -H "Authorization: Bearer $token" "$BASE_URL/api/vehicles/$veh_id" | jq .data >/dev/null
echo "Vehicle deleted."

echo "== Smoke tests passed ✅ =="
