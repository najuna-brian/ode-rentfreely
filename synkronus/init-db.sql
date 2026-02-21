-- init-db.sql
-- Runs automatically on first Postgres start to create the Synkronus
-- application user and database.

-- Create the application user (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'synkronus_user') THEN
    CREATE ROLE synkronus_user WITH LOGIN PASSWORD 'Password';
  END IF;
END
$$;

-- Create the application database (idempotent via template check)
SELECT 'CREATE DATABASE synkronus OWNER synkronus_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'synkronus')
\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE synkronus TO synkronus_user;
