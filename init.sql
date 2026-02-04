-- init.sql -- SQL script to initialize the PostgreSQL database for logging middleware requests
-- Michael Martins - 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS request_logs (
    id SERIAL PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL, 
    endpoint VARCHAR(100) NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    request_payload JSONB, 
    response_body JSONB,
    ip_address VARCHAR(45),
    duration_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_logs_tenant ON request_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_status ON request_logs(status_code);