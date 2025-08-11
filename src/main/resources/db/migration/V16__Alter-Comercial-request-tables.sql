-- V16: Altera o chore da tabela de solicitações, adicionando e removendo colunas.

ALTER TABLE solicitacoes_comerciais
    DROP COLUMN numero_solicitacao,
    DROP COLUMN ativo;

ALTER TABLE solicitacao_comercial_itens
    ADD COLUMN data_modificacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();