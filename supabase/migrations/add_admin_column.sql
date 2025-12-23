-- Adiciona coluna admin na tabela profiles
-- 0 = não é admin, 1 = é admin
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin INTEGER DEFAULT 0;

-- Criar índice para buscas rápidas de admins
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Comentário na coluna
COMMENT ON COLUMN profiles.is_admin IS 'Flag de administrador: 0 = não, 1 = sim';
