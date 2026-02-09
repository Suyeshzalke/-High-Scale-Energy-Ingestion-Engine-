-- High-Scale Energy Ingestion Engine Database Schema
-- PostgreSQL 15+

-- Historical Tables (Cold Store - Append Only)

CREATE TABLE IF NOT EXISTS meter_telemetry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id VARCHAR(100) NOT NULL,
    kwh_consumed_ac DECIMAL(10, 3) NOT NULL,
    voltage DECIMAL(10, 2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meter_telemetry_meter_timestamp ON meter_telemetry_history(meter_id, timestamp);
CREATE INDEX idx_meter_telemetry_timestamp ON meter_telemetry_history(timestamp);

CREATE TABLE IF NOT EXISTS vehicle_telemetry_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id VARCHAR(100) NOT NULL,
    soc DECIMAL(5, 2) NOT NULL,
    kwh_delivered_dc DECIMAL(10, 3) NOT NULL,
    battery_temp DECIMAL(5, 2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_telemetry_vehicle_timestamp ON vehicle_telemetry_history(vehicle_id, timestamp);
CREATE INDEX idx_vehicle_telemetry_timestamp ON vehicle_telemetry_history(timestamp);

-- Current Status Tables (Hot Store - UPSERT)

CREATE TABLE IF NOT EXISTS meter_current_status (
    meter_id VARCHAR(100) PRIMARY KEY,
    kwh_consumed_ac DECIMAL(10, 3) NOT NULL,
    voltage DECIMAL(10, 2) NOT NULL,
    last_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicle_current_status (
    vehicle_id VARCHAR(100) PRIMARY KEY,
    soc DECIMAL(5, 2) NOT NULL,
    kwh_delivered_dc DECIMAL(10, 3) NOT NULL,
    battery_temp DECIMAL(5, 2) NOT NULL,
    last_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Vehicle-Meter Mapping Table (for accurate correlation)
CREATE TABLE IF NOT EXISTS vehicle_meter_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id VARCHAR(100) NOT NULL,
    meter_id VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_meter_mapping_vehicle ON vehicle_meter_mapping(vehicle_id);
CREATE INDEX idx_vehicle_meter_mapping_meter ON vehicle_meter_mapping(meter_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_meter_current_status_updated_at BEFORE UPDATE ON meter_current_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_current_status_updated_at BEFORE UPDATE ON vehicle_current_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_meter_mapping_updated_at BEFORE UPDATE ON vehicle_meter_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
