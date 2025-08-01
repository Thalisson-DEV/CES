-- V5: Cria e popula a tabela de status para as solicitações.
CREATE TABLE status_solicitacao (
                                    id SERIAL PRIMARY KEY,
                                    nome_status VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO status_solicitacao (nome_status) VALUES ('Pendente'), ('Aprovada'), ('Recusada'), ('Atendida Parcialmente'), ('Atendida Totalmente'), ('Cancelada');