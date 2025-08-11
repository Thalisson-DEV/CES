-- V15: Adiciona as colunas de supervisor e coordenador à tabela de obras
-- para permitir a atribuição de responsabilidades diretas por projeto.
ALTER TABLE obras
    ADD COLUMN supervisor_id INT;

-- Adiciona a coluna para o coordenador, também permitindo que seja nula.
ALTER TABLE obras
    ADD COLUMN coordenador_id INT;

-- Adiciona a chave estrangeira para conectar a obra ao seu supervisor.
-- o campo na tabela de obras ficará nulo, em vez de impedir a exclusão.
ALTER TABLE obras
    ADD CONSTRAINT fk_obra_supervisor FOREIGN KEY(supervisor_id) REFERENCES supervisores(id);

-- Adiciona a chave estrangeira para conectar a obra ao seu coordenador.
ALTER TABLE obras
    ADD CONSTRAINT fk_obra_coordenador FOREIGN KEY(coordenador_id) REFERENCES coordenadores(id);
