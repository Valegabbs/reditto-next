-- Migração para adicionar histórico de redações

-- Verificar se a tabela essays já existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'essays') THEN
    -- 1. Criar tabela de redações
    CREATE TABLE IF NOT EXISTS essays (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      topic TEXT,
      essay_text TEXT NOT NULL,
      final_score INTEGER NOT NULL CHECK (final_score >= 0 AND final_score <= 1000),
      competencies JSONB NOT NULL,
      feedback JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 2. Criar tabela de pontuações para gráficos
    CREATE TABLE IF NOT EXISTS essay_scores (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      essay_id UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- 3. Criar índices para performance
    CREATE INDEX IF NOT EXISTS idx_essays_user_id ON essays(user_id);
    CREATE INDEX IF NOT EXISTS idx_essays_created_at ON essays(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_essay_scores_user_id ON essay_scores(user_id);
    CREATE INDEX IF NOT EXISTS idx_essay_scores_created_at ON essay_scores(created_at ASC);

    -- 4. Habilitar Row Level Security (RLS)
    ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
    ALTER TABLE essay_scores ENABLE ROW LEVEL SECURITY;

    -- 5. Criar políticas RLS para essays
    CREATE POLICY "Users can view their own essays" ON essays
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own essays" ON essays
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own essays" ON essays
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own essays" ON essays
      FOR DELETE USING (auth.uid() = user_id);

    -- 6. Criar políticas RLS para essay_scores
    CREATE POLICY "Users can view their own essay scores" ON essay_scores
      FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own essay scores" ON essay_scores
      FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own essay scores" ON essay_scores
      FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own essay scores" ON essay_scores
      FOR DELETE USING (auth.uid() = user_id);

    -- 7. Criar função para inserir pontuação automaticamente
    CREATE OR REPLACE FUNCTION insert_essay_score()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO essay_scores (essay_id, user_id, score)
      VALUES (NEW.id, NEW.user_id, NEW.final_score);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 8. Criar trigger para inserir pontuação automaticamente
    DROP TRIGGER IF EXISTS trigger_insert_essay_score ON essays;
    CREATE TRIGGER trigger_insert_essay_score
      AFTER INSERT ON essays
      FOR EACH ROW
      EXECUTE FUNCTION insert_essay_score();
  END IF;
END
$$;

-- 9. Criar função para obter histórico de redações do usuário
CREATE OR REPLACE FUNCTION get_user_essay_history(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  topic TEXT,
  essay_text TEXT,
  final_score INTEGER,
  competencies JSONB,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.topic,
    e.essay_text,
    e.final_score,
    e.competencies,
    e.feedback,
    e.created_at
  FROM essays e
  WHERE e.user_id = user_uuid
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Comentários para documentação
COMMENT ON FUNCTION get_user_essay_history IS 'Função para obter o histórico de redações do usuário';
