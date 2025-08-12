-- V15: Adiciona uma coluna de status a cada item da solicitação comercial.

ALTER TABLE solicitacao_comercial_itens
    ADD COLUMN status_id INT;

-- Passo 2: Definir um valor padrão para a nova coluna em todas as linhas existentes.
UPDATE solicitacao_comercial_itens SET status_id = 1 WHERE status_id IS NULL;

-- Passo 3: Agora que todas as linhas têm um valor, podemos alterar a coluna para ser NOT NULL.
ALTER TABLE solicitacao_comercial_itens
    ALTER COLUMN status_id SET NOT NULL;

-- Passo 4: Finalmente, adicionar a restrição de chave estrangeira para garantir a integridade dos dados.
ALTER TABLE solicitacao_comercial_itens
    ADD CONSTRAINT fk_com_item_status FOREIGN KEY(status_id) REFERENCES status_solicitacao(id) ON DELETE RESTRICT;
