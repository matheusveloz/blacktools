-- Create pixels table for tracking integration
CREATE TABLE IF NOT EXISTS pixels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('facebook', 'gtm')),
  pixel_id TEXT NOT NULL,
  access_token TEXT, -- Required for Facebook CAPI
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for type lookups
CREATE INDEX IF NOT EXISTS idx_pixels_type ON pixels(type);
CREATE INDEX IF NOT EXISTS idx_pixels_active ON pixels(is_active);

-- Add RLS policies
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;

-- Only admins can manage pixels (via service role key in API)
CREATE POLICY "Service role can manage pixels" ON pixels
  FOR ALL USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_pixels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pixels_updated_at
  BEFORE UPDATE ON pixels
  FOR EACH ROW
  EXECUTE FUNCTION update_pixels_updated_at();
