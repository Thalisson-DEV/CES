-- V8: Remodela a gestão de equipes, unificando Encarregados e Equipes,
-- e ajusta as tabelas dependentes como Solicitacoes Operacionais.

-- Passo 1: Remover as tabelas antigas para evitar conflitos.
-- ATENÇÃO: Este passo apagará os dados existentes nas tabelas 'encarregados' e 'equipes'.
DROP TABLE IF EXISTS encarregados CASCADE;
DROP TABLE IF EXISTS equipes CASCADE;

-- Passo 2: Criar as novas tabelas de suporte para os papéis de liderança.
-- Assumindo que já existe uma tabela 'usuarios' com 'id' e 'nome'.
CREATE TABLE supervisores (
                              id SERIAL PRIMARY KEY,
                              usuario_id INT NOT NULL UNIQUE,
                              ativo BOOLEAN NOT NULL DEFAULT TRUE,
                              data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                              CONSTRAINT fk_supervisor_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE coordenadores (
                               id SERIAL PRIMARY KEY,
                               usuario_id INT NOT NULL UNIQUE,
                               ativo BOOLEAN NOT NULL DEFAULT TRUE,
                               data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                               CONSTRAINT fk_coordenador_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- Passo 3: Criar a nova tabela 'equipes' unificada.
-- Esta tabela agora representa a equipe operacional, contendo informações que antes estavam separadas.
CREATE TABLE equipes (
                         id SERIAL PRIMARY KEY,
                         nome_equipe VARCHAR(255) NOT NULL,
                         vulgo VARCHAR(100), -- Campo migrado da antiga tabela 'encarregados'
                         ativo BOOLEAN NOT NULL DEFAULT TRUE,
                         base_operacional_id INT NOT NULL,
                         processo_id INT NOT NULL, -- Novo campo para associar a equipe a um processo
                         supervisor_id INT,       -- Novo campo para o supervisor da equipe
                         coordenador_id INT,      -- Novo campo para o coordenador da equipe
                         email_coordenacao VARCHAR(255), -- Novo campo de e-mail
                         email_almoxarifado VARCHAR(255),  -- Novo campo de e-mail
                         data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                         CONSTRAINT fk_equipe_base FOREIGN KEY(base_operacional_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_equipe_processo FOREIGN KEY(processo_id) REFERENCES processos(id) ON DELETE RESTRICT,
                         CONSTRAINT fk_equipe_supervisor FOREIGN KEY(supervisor_id) REFERENCES supervisores(id) ON DELETE SET NULL,
                         CONSTRAINT fk_equipe_coordenador FOREIGN KEY(coordenador_id) REFERENCES coordenadores(id) ON DELETE SET NULL
);

-- Passo 4: Remodelar a tabela 'solicitacoes_operacionais' para usar a nova tabela 'equipes'.
-- A coluna 'encarregado_id' será removida e substituída por 'equipe_id'.

-- Primeiro, removemos a constraint antiga que dependia da tabela 'encarregados'.
ALTER TABLE solicitacoes_operacionais DROP CONSTRAINT IF EXISTS fk_op_encarregado;

-- Em seguida, removemos a coluna antiga.
ALTER TABLE solicitacoes_operacionais DROP COLUMN IF EXISTS encarregado_id;

-- Agora, adicionamos a nova coluna que fará referência à tabela 'equipes'.
-- Adicionamos com um valor padrão temporário (ex: 1) se houver dados existentes e a coluna for NOT NULL.
-- Se a tabela estiver vazia, pode ser apenas 'ADD COLUMN equipe_id INT NOT NULL'.
ALTER TABLE solicitacoes_operacionais ADD COLUMN equipe_id INT;

-- Atualiza a coluna para NOT NULL após (potencialmente) preencher dados.
-- Para uma migração limpa, é mais seguro adicionar como NULL, preencher, e depois setar para NOT NULL.
-- Como estamos em desenvolvimento, vamos adicionar diretamente como NOT NULL, assumindo que a tabela será populada depois.
ALTER TABLE solicitacoes_operacionais ALTER COLUMN equipe_id SET NOT NULL;


-- Finalmente, criamos a nova constraint de chave estrangeira.
ALTER TABLE solicitacoes_operacionais ADD CONSTRAINT fk_op_equipe FOREIGN KEY(equipe_id) REFERENCES equipes(id) ON DELETE RESTRICT;

-- A tabela 'solicitacao_operacional_itens' não precisa de alterações, pois sua relação é com 'solicitacoes_operacionais'.
