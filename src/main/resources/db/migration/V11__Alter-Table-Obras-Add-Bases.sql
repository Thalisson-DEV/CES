-- V11: Altera a tabela 'obras' para remover o endereço de texto livre
-- e adicionar referências diretas às bases operacionais para a obra e para o saque.

ALTER TABLE obras

    DROP COLUMN localizacao_endereco,

    ADD COLUMN base_obra_id INT NOT NULL,

    ADD COLUMN base_saque_id INT NOT NULL,

    ADD COLUMN solicitado BOOLEAN NOT NULL DEFAULT FALSE,

    ADD CONSTRAINT fk_obras_base_obra
        FOREIGN KEY (base_obra_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT,

    ADD CONSTRAINT fk_obras_base_saque
        FOREIGN KEY (base_saque_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT;