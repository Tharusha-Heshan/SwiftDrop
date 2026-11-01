-- =============================================================================
-- SwiftDrop Courier Module - Deterministic Development Seed Data (V2)
-- Seeds fictional couriers and sample delivery records for development/testing.
-- =============================================================================

-- Fictional Couriers
INSERT INTO courier_dev_couriers (id, full_name, email, phone_number, vehicle_type, assigned_zone, is_active)
VALUES
('11111111-1111-1111-1111-111111111111', 'Sachin Maleesha', 'sachin.courier@swiftdrop.lk', '+94 77 123 4567', 'Motorcycle', 'Kurunegala North', TRUE),
('22222222-2222-2222-2222-222222222222', 'Kamal Perera', 'kamal.courier@swiftdrop.lk', '+94 71 987 6543', 'Van', 'Colombo Central', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Courier 1 (Sachin) - 12 Parcels Assigned Today
-- Breakdown: 6 Delivered, 5 In Progress (2 PICKED_UP, 2 IN_TRANSIT, 1 OUT_FOR_DELIVERY), 1 Failed
-- Completion = 6 / 12 (50%)
-- =============================================================================

-- 1. In Progress Parcels
INSERT INTO courier_dev_parcels (id, tracking_number, assigned_courier_id, recipient_name, recipient_phone, delivery_address, city, postal_code, status, special_instructions)
VALUES
('a1000000-0000-0000-0000-000000000001', 'SD-1048-7291', '11111111-1111-1111-1111-111111111111', 'Nuwan Silva', '+94 77 234 5678', 'No. 42, Kandy Road, North Junction', 'Kurunegala', '60000', 'PICKED_UP', 'Call before arrival'),
('a1000000-0000-0000-0000-000000000002', 'SD-1048-7292', '11111111-1111-1111-1111-111111111111', 'Dilini Perera', '+94 71 345 6789', '18B, Circular Road, Lake Round', 'Kurunegala', '60000', 'IN_TRANSIT', 'Leave package with security if unavailable'),
('a1000000-0000-0000-0000-000000000003', 'SD-1048-7293', '11111111-1111-1111-1111-111111111111', 'Chaminda Bandara', '+94 76 456 7890', 'No. 7, Temple Road, Mallawapitiya', 'Kurunegala', '60000', 'OUT_FOR_DELIVERY', 'Fragile electronic item'),
('a1000000-0000-0000-0000-000000000004', 'SD-1048-7294', '11111111-1111-1111-1111-111111111111', 'Anusha Fernando', '+94 70 567 8901', 'No. 112, Negombo Road, Malkaduwawa', 'Kurunegala', '60000', 'PICKED_UP', 'Deliver during office hours (9 AM - 5 PM)'),
('a1000000-0000-0000-0000-000000000005', 'SD-1048-7296', '11111111-1111-1111-1111-111111111111', 'Rohan Wickramasinghe', '+94 72 678 9012', 'No. 88, Dambulla Road, Ibbagamuwa', 'Kurunegala', '60500', 'IN_TRANSIT', 'Gate code is 4921')
ON CONFLICT (id) DO NOTHING;

-- 2. Delivered Parcels (6)
INSERT INTO courier_dev_parcels (id, tracking_number, assigned_courier_id, recipient_name, recipient_phone, delivery_address, city, postal_code, status, special_instructions)
VALUES
('b1000000-0000-0000-0000-000000000001', 'SD-1048-7295', '11111111-1111-1111-1111-111111111111', 'Kasun Jayasinghe', '+94 75 789 0123', 'No. 15, Hospital Road', 'Wariyapola', '60400', 'DELIVERED', 'Deliver to front desk'),
('b1000000-0000-0000-0000-000000000002', 'SD-1048-7288', '11111111-1111-1111-1111-111111111111', 'Priyani Alwis', '+94 78 890 1234', 'No. 3, Station View Lane', 'Kurunegala', '60000', 'DELIVERED', 'Verify identity before handover'),
('b1000000-0000-0000-0000-000000000003', 'SD-1048-7287', '11111111-1111-1111-1111-111111111111', 'Nalaka Gunasekara', '+94 71 901 2345', 'No. 64, Puttalam Road', 'Kurunegala', '60000', 'DELIVERED', 'Signature required'),
('b1000000-0000-0000-0000-000000000004', 'SD-1048-7285', '11111111-1111-1111-1111-111111111111', 'Tharindu Madushanka', '+94 77 012 3456', 'No. 29, Colombo Road, Wehara', 'Kurunegala', '60000', 'DELIVERED', 'Hand over directly to recipient'),
('b1000000-0000-0000-0000-000000000005', 'SD-1048-7284', '11111111-1111-1111-1111-111111111111', 'Sithara Senanayake', '+94 76 123 4567', 'No. 5, Wilgoda Circular Road', 'Kurunegala', '60000', 'DELIVERED', 'Package contains books'),
('b1000000-0000-0000-0000-000000000006', 'SD-1048-7282', '11111111-1111-1111-1111-111111111111', 'Dinesh Kumara', '+94 70 234 5678', 'No. 19, Yaggapitiya Industrial Zone', 'Kurunegala', '60000', 'DELIVERED', 'Company warehouse drop-off')
ON CONFLICT (id) DO NOTHING;

-- 3. Failed Parcel (1)
INSERT INTO courier_dev_parcels (id, tracking_number, assigned_courier_id, recipient_name, recipient_phone, delivery_address, city, postal_code, status, special_instructions)
VALUES
('c1000000-0000-0000-0000-000000000001', 'SD-1048-7290', '11111111-1111-1111-1111-111111111111', 'Sunil Rathnayake', '+94 74 345 6789', 'No. 102, Giriulla Road, Alawwa', 'Alawwa', '68020', 'FAILED', 'Contact customer before noon')
ON CONFLICT (id) DO NOTHING;

-- Evidence for Delivered Parcels
INSERT INTO courier_dev_delivery_proofs (id, parcel_id, proof_type, recipient_sign_name, delivery_notes, proof_media_url)
VALUES
('e1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'RECIPIENT_CONFIRMATION', 'Kasun Jayasinghe', 'Received at front entrance in good condition', 'https://storage.swiftdrop.lk/proofs/SD-1048-7295-sign.png'),
('e1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'RECIPIENT_CONFIRMATION', 'Priyani Alwis', 'Handed over directly to recipient', NULL)
ON CONFLICT (id) DO NOTHING;

-- Record for Failed Parcel
INSERT INTO courier_dev_delivery_failures (id, parcel_id, failure_reason, failure_remarks, reported_by_courier_id)
VALUES
('f1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'RECIPIENT_UNAVAILABLE', 'Attempted delivery twice. Customer phone unreachable and premise locked.', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Sample Status History entries for SD-1048-7291 (Active delivery)
INSERT INTO courier_dev_parcel_status_history (id, parcel_id, from_status, to_status, changed_by_courier_id, notes)
VALUES
('h1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'CREATED', 'PICKED_UP', '11111111-1111-1111-1111-111111111111', 'Parcel picked up from regional hub')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Courier 2 (Kamal Perera) - Isolated Parcels for Cross-Courier Testing
-- These parcels must be INACCESSIBLE to Courier 1
-- =============================================================================
INSERT INTO courier_dev_parcels (id, tracking_number, assigned_courier_id, recipient_name, recipient_phone, delivery_address, city, postal_code, status, special_instructions)
VALUES
('d2000000-0000-0000-0000-000000000001', 'SD-2099-0001', '22222222-2222-2222-2222-222222222222', 'Kavinda Dias', '+94 77 999 1111', 'No. 50, Galle Road, Bambalapitiya', 'Colombo', '00400', 'IN_TRANSIT', 'Courier 2 parcel - strict security test target'),
('d2000000-0000-0000-0000-000000000002', 'SD-2099-0002', '22222222-2222-2222-2222-222222222222', 'Ruvini Samarasinghe', '+94 71 888 2222', 'No. 12, Duplication Road, Kollupitiya', 'Colombo', '00300', 'OUT_FOR_DELIVERY', 'Courier 2 parcel - strict security test target')
ON CONFLICT (id) DO NOTHING;
