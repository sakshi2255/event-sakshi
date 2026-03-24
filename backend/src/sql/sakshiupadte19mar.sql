-- backend/src/sql/004_save_events_system.sql
CREATE TABLE public.saved_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES public.events(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, event_id)
);

ALTER TABLE events 
ADD COLUMN end_date DATETIME,
ADD COLUMN poster_url VARCHAR(255),
ADD COLUMN summary_text TEXT;

-- 1. Add attendance tracking and a unique token for the QR
ALTER TABLE registrations 
ADD COLUMN attendance_status VARCHAR(20) DEFAULT 'registered',
ADD COLUMN attended_at TIMESTAMP DEFAULT NULL,
ADD COLUMN ticket_token UUID DEFAULT gen_random_uuid();

-- 2. Add an index to ticket_token for fast scanning lookups
CREATE UNIQUE INDEX idx_ticket_token ON registrations(ticket_token);