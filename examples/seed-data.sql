-- Sample seed data for testing
-- Run this after the schema is created

-- Insert sample meter current status
INSERT INTO meter_current_status (meter_id, kwh_consumed_ac, voltage, last_timestamp)
VALUES 
    ('METER-001', 150.5, 240.0, NOW()),
    ('METER-002', 200.3, 240.0, NOW()),
    ('METER-003', 175.8, 240.0, NOW())
ON CONFLICT (meter_id) DO UPDATE SET
    kwh_consumed_ac = EXCLUDED.kwh_consumed_ac,
    voltage = EXCLUDED.voltage,
    last_timestamp = EXCLUDED.last_timestamp,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample vehicle current status
INSERT INTO vehicle_current_status (vehicle_id, soc, kwh_delivered_dc, battery_temp, last_timestamp)
VALUES 
    ('EV-001', 85.5, 128.2, 25.5, NOW()),
    ('EV-002', 90.0, 170.5, 26.0, NOW()),
    ('EV-003', 75.3, 142.8, 24.8, NOW())
ON CONFLICT (vehicle_id) DO UPDATE SET
    soc = EXCLUDED.soc,
    kwh_delivered_dc = EXCLUDED.kwh_delivered_dc,
    battery_temp = EXCLUDED.battery_temp,
    last_timestamp = EXCLUDED.last_timestamp,
    updated_at = CURRENT_TIMESTAMP;

-- Insert sample historical meter telemetry (last 24 hours)
INSERT INTO meter_telemetry_history (meter_id, kwh_consumed_ac, voltage, timestamp)
SELECT 
    'METER-001',
    15.5 + (random() * 5),
    240.0 + (random() * 2 - 1),
    NOW() - (interval '1 minute' * generate_series)
FROM generate_series(0, 1439); -- 1440 records = 24 hours

-- Insert sample historical vehicle telemetry (last 24 hours)
INSERT INTO vehicle_telemetry_history (vehicle_id, soc, kwh_delivered_dc, battery_temp, timestamp)
SELECT 
    'EV-001',
    80.0 + (random() * 20),
    12.3 + (random() * 3),
    24.0 + (random() * 4),
    NOW() - (interval '1 minute' * generate_series)
FROM generate_series(0, 1439); -- 1440 records = 24 hours

-- Insert vehicle-meter mapping
INSERT INTO vehicle_meter_mapping (vehicle_id, meter_id, is_active)
VALUES 
    ('EV-001', 'METER-001', TRUE),
    ('EV-002', 'METER-002', TRUE),
    ('EV-003', 'METER-003', TRUE)
ON CONFLICT DO NOTHING;
