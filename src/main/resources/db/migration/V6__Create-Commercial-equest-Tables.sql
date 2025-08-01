-- V6: Cria as tabelas para o fluxo de Solicitações Comerciais.
CREATE TABLE solicitacoes_comerciais (
                                         id SERIAL PRIMARY KEY,
                                         numero_solicitacao VARCHAR(50) NOT NULL UNIQUE,
                                         solicitante_id INT NOT NULL,
                                         status_id INT NOT NULL,
                                         processo_id INT NOT NULL,
                                         equipe_id INT NOT NULL,
                                         observacoes TEXT,
                                         ativo BOOLEAN NOT NULL DEFAULT TRUE,
                                         data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                                         CONSTRAINT fk_com_solicitante FOREIGN KEY(solicitante_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
                                         CONSTRAINT fk_com_status FOREIGN KEY(status_id) REFERENCES status_solicitacao(id) ON DELETE RESTRICT,
                                         CONSTRAINT fk_com_processo FOREIGN KEY(processo_id) REFERENCES processos(id) ON DELETE RESTRICT,
                                         CONSTRAINT fk_com_equipe FOREIGN KEY(equipe_id) REFERENCES equipes(id) ON DELETE RESTRICT
);

CREATE TABLE solicitacao_comercial_itens (
                                             id SERIAL PRIMARY KEY,
                                             solicitacao_id INT NOT NULL,
                                             material_id INT NOT NULL,
                                             quantidade_solicitada DECIMAL(10, 2) NOT NULL,
                                             quantidade_atendida DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
                                             ativo BOOLEAN NOT NULL DEFAULT TRUE,

                                             CONSTRAINT fk_com_item_sol FOREIGN KEY(solicitacao_id) REFERENCES solicitacoes_comerciais(id) ON DELETE CASCADE,
                                             CONSTRAINT fk_com_item_mat FOREIGN KEY(material_id) REFERENCES materiais(id) ON DELETE RESTRICT,
                                             UNIQUE (solicitacao_id, material_id)
);