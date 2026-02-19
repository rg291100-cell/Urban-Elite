-- ─────────────────────────────────────────────────────────────────────────────
-- Notifications system
-- ─────────────────────────────────────────────────────────────────────────────

-- Global notifications (one row per event — not duplicated per user)
CREATE TABLE IF NOT EXISTS notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type        TEXT NOT NULL CHECK (type IN ('OFFER', 'JOB', 'BOOKING', 'SYSTEM')),
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    icon        TEXT DEFAULT '🔔',            -- emoji icon
    offer_id    UUID REFERENCES offers(id) ON DELETE CASCADE,
    vendor_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    action_label TEXT,                        -- e.g. "CLAIM NOW →"
    action_data  JSONB,                       -- e.g. {"screen": "Offers", "offerId": "..."}
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Per-user read tracking (only stores rows for notifications that HAVE been read)
CREATE TABLE IF NOT EXISTS notification_reads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    read_at         TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, notification_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads(user_id);

-- RLS: All authenticated users can read notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (true);

-- RLS: Only the user can insert/update their own read records
ALTER TABLE notification_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notification_reads_all" ON notification_reads FOR ALL USING (auth.uid() = user_id);
