-- V4: Cria tabelas de Obras e Materiais.
CREATE TABLE status_obras (
                              id SERIAL PRIMARY KEY,
                              nome_status VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO status_obras (nome_status) VALUES ('Planejamento'), ('Em Andamento'), ('Pausada'), ('Concluída'), ('Cancelada');

CREATE TABLE obras (
                       id SERIAL PRIMARY KEY,
                       numero_obra VARCHAR(50) NOT NULL UNIQUE,
                       titulo VARCHAR(255) NOT NULL,
                       localizacao_endereco TEXT,
                       latitude DECIMAL(9, 6),
                       longitude DECIMAL(9, 6),
                       data_inicio DATE,
                       data_fim DATE,
                       status_id INT NOT NULL,
                       ativo BOOLEAN NOT NULL DEFAULT TRUE,
                       data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                       CONSTRAINT fk_obra_status FOREIGN KEY(status_id) REFERENCES status_obras(id) ON DELETE RESTRICT
);

CREATE TABLE materiais (
                           id SERIAL PRIMARY KEY,
                           codigo_material VARCHAR(50) NOT NULL UNIQUE,
                           nome_material VARCHAR(255) NOT NULL,
                           descricao TEXT,
                           unidade_medida VARCHAR(20) NOT NULL,
                           quantidade_estoque DECIMAL(10, 2) NOT NULL DEFAULT 0.00 CHECK (quantidade_estoque >= 0),
                           ponto_ressuprimento DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);