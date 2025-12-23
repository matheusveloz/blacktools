-- Rate limits table para tracking de requisições
-- Usado para rate limiting sem dependência externa (Upstash)

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'generation', 'status', 'payment', etc
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para queries rápidas
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_type_created 
ON public.rate_limits(user_id, type, created_at DESC);

-- Índice para cleanup de entradas antigas
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at 
ON public.rate_limits(created_at);

-- Política RLS: usuários não podem ler/escrever (apenas admin/service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Nenhuma política pública - apenas service role pode acessar
-- (aplicação usa createAdminClient que bypassa RLS)

-- Função para cleanup automático (opcional - rodar via cron)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  -- Deletar entradas com mais de 2 minutos
  DELETE FROM public.rate_limits
  WHERE created_at < NOW() - INTERVAL '2 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
