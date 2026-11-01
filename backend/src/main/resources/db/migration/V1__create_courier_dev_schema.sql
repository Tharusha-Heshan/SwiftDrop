-- =============================================================================
-- SwiftDrop Courier Module - Isolated Development Schema (V1)
-- Namespaced prototype tables for standalone Courier Module execution.
-- These tables preserve compatibility without altering shared future schemas.
-- =============================================================================

CREATE TABLE IF NOT EXISTS courier_dev_couriers (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    assigned_zone VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_dev_parcels (
    id UUID PRIMARY KEY,
    tracking_number VARCHAR(50) NOT NULL UNIQUE,
    assigned_courier_id UUID NOT NULL REFERENCES courier_dev_couriers(id),
    recipient_name VARCHAR(100) NOT NULL,
    recipient_phone VARCHAR(30) NOT NULL,
    delivery_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED')),
    special_instructions TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_dev_parcel_status_history (
    id UUID PRIMARY KEY,
    parcel_id UUID NOT NULL REFERENCES courier_dev_parcels(id) ON DELETE CASCADE,
    from_status VARCHAR(30),
    to_status VARCHAR(30) NOT NULL CHECK (to_status IN ('CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED')),
    changed_by_courier_id UUID NOT NULL REFERENCES courier_dev_couriers(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_dev_delivery_proofs (
    id UUID PRIMARY KEY,
    parcel_id UUID NOT NULL UNIQUE REFERENCES courier_dev_parcels(id) ON DELETE CASCADE,
    proof_type VARCHAR(50) NOT NULL,
    recipient_sign_name VARCHAR(100) NOT NULL,
    delivery_notes TEXT,
    proof_media_url TEXT,
    captured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courier_dev_delivery_failures (
    id UUID PRIMARY KEY,
    parcel_id UUID NOT NULL REFERENCES courier_dev_parcels(id) ON DELETE CASCADE,
    failure_reason VARCHAR(50) NOT NULL CHECK (failure_reason IN ('RECIPIENT_UNAVAILABLE', 'INCORRECT_ADDRESS', 'CUSTOMER_REJECTED', 'DAMAGED_PARCEL', 'ACCESS_RESTRICTED', 'WEATHER_DELAY', 'OTHER')),
    failure_remarks TEXT NOT NULL,
    reported_by_courier_id UUID NOT NULL REFERENCES courier_dev_couriers(id),
    reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance and rapid courier lookups
CREATE INDEX IF NOT EXISTS idx_courier_dev_parcels_courier ON courier_dev_parcels(assigned_courier_id);
CREATE INDEX IF NOT EXISTS idx_courier_dev_parcels_status ON courier_dev_parcels(status);
CREATE INDEX IF NOT EXISTS idx_courier_dev_parcels_tracking ON courier_dev_parcels(tracking_number);
CREATE INDEX IF NOT EXISTS idx_courier_dev_history_parcel ON courier_dev_parcel_status_history(parcel_id);
