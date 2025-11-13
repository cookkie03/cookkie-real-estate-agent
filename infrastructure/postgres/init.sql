-- PostgreSQL initialization script for CRM Immobiliare
-- This script runs on first container startup

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'Europe/Rome';

-- Create database user (if not exists via env)
-- Note: User is created via POSTGRES_USER env var

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE crm_immobiliare TO crm_user;

-- Create schema
CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO crm_user;

-- Full-text search configuration for Italian
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS italian_unaccent ( COPY = italian );

COMMENT ON DATABASE crm_immobiliare IS 'CRM Immobiliare - Real Estate Management System';
