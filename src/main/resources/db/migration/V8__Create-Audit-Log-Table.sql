-- V8: Criação da tabela de log geral para auditoria.
CREATE TABLE log_alteracoes (
                                id BIGSERIAL PRIMARY KEY,
                                tabela_afetada VARCHAR(100) NOT NULL,
                                registro_id BIGINT NOT NULL,
                                campo_alterado VARCHAR(100),
                                valor_antigo TEXT,
                                valor_novo TEXT,
                                tipo_acao VARCHAR(50) NOT NULL,
                                data_alteracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                                usuario_id INT,

                                CONSTRAINT fk_log_usuario FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);