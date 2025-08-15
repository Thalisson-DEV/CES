-- V20: Cria a estrutura de mestre-detalhe para o fluxo de Aplicações de Campo.

-- Remove as tabelas antigas se existirem, para garantir uma migração limpa.
DROP TABLE IF EXISTS aplicacoes_campo_itens CASCADE;
DROP TABLE IF EXISTS notas CASCADE;
DROP TABLE IF EXISTS notas_aplicacao CASCADE;
DROP TABLE IF EXISTS tipos_aplicacao CASCADE;
DROP TABLE IF EXISTS tipos_nota CASCADE;

-- Passo 1: Criar as tabelas de suporte para os tipos.
CREATE TABLE tipos_aplicacao (
                                 id SERIAL PRIMARY KEY,
                                 nome_tipo VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipos_nota (
                            id SERIAL PRIMARY KEY,
                            nome_tipo VARCHAR(250) NOT NULL UNIQUE,
                            grupo_tipo VARCHAR(250) NOT NULL
);

-- Popula as tabelas de tipos com os valores iniciais.
INSERT INTO tipos_aplicacao (nome_tipo) VALUES ('Aplicado'), ('Retirado');

INSERT INTO tipos_nota (nome_tipo, grupo_tipo) VALUES
                                                   ('Acompanhamento', 'CA'),
                                                   ('Verificação', 'CV'),
                                                   ('Modificação', 'CM'),
                                                   ('Alteração', 'CM'),
                                                   ('Inspeção', 'CI'),
                                                   ('Religação', 'CR'),
                                                   ('Ligação nova', 'CL'),
                                                   ('Baixa a pedido', 'CB'),
                                                   ('Baixa adm', 'CB'),
                                                   ('Varredura', 'CL'),
                                                   ('Microgeração', 'CV'),
                                                   ('Reativação', 'CL'),
                                                   ('Enlace', 'CM'),
                                                   ('Corte', 'CS');


-- Passo 2: Criar a tabela "mestre" para o cabeçalho da nota.
CREATE TABLE notas (
                       id SERIAL PRIMARY KEY,
                       numero_nota VARCHAR(50) NOT NULL,
                       tipo_nota_id INT NOT NULL,
                       equipe_id INT NOT NULL,
                       usuario_id INT NOT NULL,
                       base_operacional_id INT NOT NULL,
                       data_nota TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                       observacoes TEXT,
                       data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                       CONSTRAINT fk_nota_tipo FOREIGN KEY(tipo_nota_id) REFERENCES tipos_nota(id) ON DELETE RESTRICT,
                       CONSTRAINT fk_nota_equipe FOREIGN KEY(equipe_id) REFERENCES equipes(id) ON DELETE RESTRICT,
                       CONSTRAINT fk_nota_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
                       CONSTRAINT fk_nota_base_operacional FOREIGN KEY(base_operacional_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT
);

-- Passo 3: Criar a tabela "detalhe" para os itens da aplicação, ligados à nota.
CREATE TABLE aplicacoes_campo_itens (
                                        id SERIAL PRIMARY KEY,
                                        nota_id INT NOT NULL,
                                        material_id INT NOT NULL,
                                        tipo_aplicacao_id INT NOT NULL,
                                        quantidade_aplicada DECIMAL(10, 2) NOT NULL CHECK (quantidade_aplicada > 0),

                                        CONSTRAINT fk_item_nota FOREIGN KEY(nota_id) REFERENCES notas(id) ON DELETE CASCADE,
                                        CONSTRAINT fk_item_material FOREIGN KEY(material_id) REFERENCES materiais(id) ON DELETE RESTRICT,
                                        CONSTRAINT fk_item_tipo_aplicacao FOREIGN KEY(tipo_aplicacao_id) REFERENCES tipos_aplicacao(id) ON DELETE RESTRICT
);
