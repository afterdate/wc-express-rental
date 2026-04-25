-- WC-Express Vermietungssoftware Datenbank-Schema

-- Anhänger-Tabelle
CREATE TABLE IF NOT EXISTS trailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    price_per_day DECIMAL(10, 2) NOT NULL,
    capacity INTEGER,
    images TEXT[],
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'reserved')),
    features TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buchungen-Tabelle
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trailer_id UUID REFERENCES trailers(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verfügbarkeits-Blockierungen
CREATE TABLE IF NOT EXISTS availability_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trailer_id UUID REFERENCES trailers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS-Policies für Sicherheit
ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_blocks ENABLE ROW LEVEL SECURITY;

-- Jeder kann Trailer sehen
CREATE POLICY "Allow public read access to trailers" ON trailers
    FOR SELECT USING (true);

-- Nur Admins können Trailer ändern
CREATE POLICY "Allow admin write access to trailers" ON trailers
    FOR ALL USING (auth.role() = 'authenticated');

-- Jeder kann Buchungen erstellen
CREATE POLICY "Allow public insert to bookings" ON bookings
    FOR INSERT WITH CHECK (true);

-- Öffentlicher Lesezugriff auf Buchungen (für Verfügbarkeitsprüfung)
CREATE POLICY "Allow public read confirmed bookings" ON bookings
    FOR SELECT USING (status IN ('confirmed', 'pending'));

-- Nur Admins können alle Buchungen sehen/ändern
CREATE POLICY "Allow admin full access to bookings" ON bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- Verfügbarkeits-Blocks
CREATE POLICY "Allow public read availability blocks" ON availability_blocks
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write availability blocks" ON availability_blocks
    FOR ALL USING (auth.role() = 'authenticated');

-- Indizes für Performance
CREATE INDEX idx_bookings_trailer_id ON bookings(trailer_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_trailer_id ON availability_blocks(trailer_id);
CREATE INDEX idx_availability_dates ON availability_blocks(start_date, end_date);

-- Funktion zur Verfügbarkeitsprüfung
CREATE OR REPLACE FUNCTION check_trailer_availability(
    p_trailer_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
    booking_count INTEGER;
    block_count INTEGER;
BEGIN
    -- Prüfe auf überlappende Buchungen
    SELECT COUNT(*) INTO booking_count
    FROM bookings
    WHERE trailer_id = p_trailer_id
        AND status IN ('confirmed', 'pending')
        AND start_date <= p_end_date
        AND end_date >= p_start_date;
    
    -- Prüfe auf Verfügbarkeits-Blocks
    SELECT COUNT(*) INTO block_count
    FROM availability_blocks
    WHERE trailer_id = p_trailer_id
        AND start_date <= p_end_date
        AND end_date >= p_start_date;
    
    RETURN booking_count = 0 AND block_count = 0;
END;
$$ LANGUAGE plpgsql;

-- Beispiel-Daten
INSERT INTO trailers (name, type, description, price_per_day, capacity, images, features) VALUES
('Premium WC-Anhänger', 'toilet', 'Hochwertiger Toilettenwagen mit 2 Kabinen, Beleuchtung und Waschbecken', 85.00, 2, ARRAY['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'], ARRAY['2 Kabinen', 'Beleuchtung', 'Waschbecken', 'Spiegel', 'Seifenspender']),
('Event-Duschanhänger', 'shower', 'Mobiler Duschanhänger mit 4 separaten Kabinen, Warmwasserbereitung', 120.00, 4, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], ARRAY['4 Duschkabinen', 'Warmwasser', 'Umkleidebereich', 'Beleuchtung']),
('Gastro-Küchenanhänger', 'kitchen', 'Vollausgestattete mobile Küche mit Herd, Backofen, Kühlschrank und Spüle', 150.00, 6, ARRAY['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'], ARRAY['Herd', 'Backofen', 'Kühlschrank', 'Spüle', 'Arbeitsflächen']),
('VIP-Toilettenwagen', 'toilet', 'Luxuriöser Toilettenwagen für besondere Events', 150.00, 2, ARRAY['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800'], ARRAY['Premium Ausstattung', 'Klimaanlage', 'Musik', 'Deko']),
('Mobile Umkleidekabinen', 'changing', 'Umkleidekabinen für Events und Sportveranstaltungen', 95.00, 4, ARRAY['https://images.unsplash.com/photo-1560472354-b33ff0c60a44?w=800'], ARRAY['4 Kabinen', 'Sitzbänke', 'Garderoben', 'Spiegel'])
ON CONFLICT DO NOTHING;
