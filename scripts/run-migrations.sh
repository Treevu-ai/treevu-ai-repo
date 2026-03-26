#!/bin/bash

# This script runs Supabase SQL migrations
# It uses the Supabase REST API to execute SQL queries

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}"
SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "Error: Missing Supabase environment variables"
  exit 1
fi

echo "Running database migrations..."

# Read and execute SQL file
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d @scripts/001_create_schema.sql

echo "Migrations completed!"
