-- Tabela de configurações do site
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir configuração de manutenção
INSERT INTO site_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "We are under maintenance. We will be back soon!"}')
ON CONFLICT (key) DO NOTHING;

-- Índice para busca por chave
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- RLS: apenas admins podem modificar
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Política: qualquer um pode ler
CREATE POLICY "Anyone can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

-- Política: apenas admins podem modificar
CREATE POLICY "Only admins can update site_settings"
  ON site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = 1
    )
  );

CREATE POLICY "Only admins can insert site_settings"
  ON site_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = 1
    )
  );
