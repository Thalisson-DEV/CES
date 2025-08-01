-- V9: Reestrutura a tabela 'materiais' para o novo modelo de negócio.

-- Garante que o tipo ENUM 'supr_matr_enum' exista antes de ser usado.
DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supr_matr_enum') THEN
            CREATE TYPE supr_matr_enum AS ENUM ('SUPR', 'MATR');
        END IF;
    END$$;


-- Altera a tabela de materiais
ALTER TABLE materiais
    -- Remove as colunas que não serão mais utilizadas
    DROP COLUMN ponto_ressuprimento,
    DROP COLUMN quantidade_estoque,
    ADD COLUMN supr_matr supr_matr_enum NOT NULL,
    ADD COLUMN avaliacao VARCHAR(50) NOT NULL,
    ADD COLUMN centro VARCHAR(100) NOT NULL;

