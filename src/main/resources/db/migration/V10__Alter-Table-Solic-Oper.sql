-- V10: Refatora a tabela 'solicitacoes_operacionais' para remover campos redundantes.
-- A informação 'supr_matr' é uma característica do material e deve ser obtida
-- através do relacionamento com a tabela 'materiais', e não armazenada na transação.

ALTER TABLE solicitacoes_operacionais
    DROP COLUMN supr_matr;
