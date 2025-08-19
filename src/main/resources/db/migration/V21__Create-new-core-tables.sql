-- V21: Cria as tabelas de Contratos e Serviços para o fluxo de produtividade.

-- Passo 1: Criar a tabela de Contratos.
CREATE TABLE contratos (
                           id SERIAL PRIMARY KEY,
                           numero_contrato VARCHAR(100) NOT NULL UNIQUE,
                           descricao TEXT,
                           data_inicio DATE,
                           data_fim DATE,
                           ativo BOOLEAN NOT NULL DEFAULT TRUE,
                           data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Passo 2: Criar a tabela de Serviços, com todas as colunas solicitadas.
CREATE TABLE servicos (
                          id SERIAL PRIMARY KEY,
                          codigo_servico VARCHAR(50) NOT NULL UNIQUE,
                          descricao VARCHAR(255) NOT NULL,
                          um VARCHAR(20) NOT NULL,
                          grupo_mercadoria VARCHAR(100),
                          processo_id INT NOT NULL,
                          contrato_id INT NOT NULL,
                          valor_referencia DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                          texto_longo TEXT,
                          ativo BOOLEAN NOT NULL DEFAULT TRUE,
                          data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Chaves Estrangeiras para garantir a integridade dos dados
                          CONSTRAINT fk_servico_processo FOREIGN KEY(processo_id) REFERENCES processos(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_servico_contrato FOREIGN KEY(contrato_id) REFERENCES contratos(id) ON DELETE RESTRICT
);
