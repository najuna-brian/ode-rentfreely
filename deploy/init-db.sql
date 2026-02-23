-- init-db.sql
-- Runs automatically on first Postgres start (empty data directory).
-- Creates the Synkronus application user and database.
--
-- The passwords here MUST match DB_USER / DB_PASSWORD in your .env file.
-- These are overridden at runtime by the setup script.

-- Create the application user (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'synkronus_user') THEN
    CREATE ROLE synkronus_user WITH LOGIN PASSWORD 'CHANGE_ME_APP_DB_PASSWORD';
  END IF;
END
$$;

-- Create the application database (idempotent)
SELECT 'CREATE DATABASE synkronus OWNER synkronus_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'synkronus')
\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE synkronus TO synkronus_user;
