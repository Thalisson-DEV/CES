-- V7: Cria as tabelas para o fluxo de Solicitações Operacionais.
CREATE TYPE supr_matr_enum AS ENUM ('SUPR', 'MATR');
CREATE TYPE tipo_movimentacao_enum AS ENUM ('221', '921');

CREATE TABLE solicitacoes_operacionais (
                                           id SERIAL PRIMARY KEY,
                                           numero_solicitacao VARCHAR(50) NOT NULL UNIQUE,
                                           solicitante_id INT NOT NULL,
                                           status_id INT NOT NULL,
                                           processo_id INT NOT NULL,
                                           obra_id INT,
                                           encarregado_id INT NOT NULL,
                                           supr_matr supr_matr_enum NOT NULL,
                                           centro_recebedor VARCHAR(50) NOT NULL,
                                           tipo_movimentacao tipo_movimentacao_enum NOT NULL,
                                           numero_reserva VARCHAR(50),
                                           localizacao_saque_id INT NOT NULL,
                                           observacoes TEXT,
                                           ativo BOOLEAN NOT NULL DEFAULT TRUE,
                                           data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                                           CONSTRAINT fk_op_solicitante FOREIGN KEY(solicitante_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
                                           CONSTRAINT fk_op_status FOREIGN KEY(status_id) REFERENCES status_solicitacao(id) ON DELETE RESTRICT,
                                           CONSTRAINT fk_op_processo FOREIGN KEY(processo_id) REFERENCES processos(id) ON DELETE RESTRICT,
                                           CONSTRAINT fk_op_obra FOREIGN KEY(obra_id) REFERENCES obras(id) ON DELETE RESTRICT,
                                           CONSTRAINT fk_op_encarregado FOREIGN KEY(encarregado_id) REFERENCES encarregados(id) ON DELETE RESTRICT,
                                           CONSTRAINT fk_op_loc_saque FOREIGN KEY(localizacao_saque_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT
);

CREATE TABLE solicitacao_operacional_itens (
                                               id SERIAL PRIMARY KEY,
                                               solicitacao_id INT NOT NULL,
                                               material_id INT NOT NULL,
                                               quantidade_solicitada DECIMAL(10, 2) NOT NULL,
                                               quantidade_atendida DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                                               ativo BOOLEAN NOT NULL DEFAULT TRUE,

                                               CONSTRAINT fk_op_item_sol FOREIGN KEY(solicitacao_id) REFERENCES solicitacoes_operacionais(id) ON DELETE CASCADE,
                                               CONSTRAINT fk_op_item_mat FOREIGN KEY(material_id) REFERENCES materiais(id) ON DELETE RESTRICT,
                                               UNIQUE (solicitacao_id, material_id)
);