-- V3: Cria as tabelas para Equipes (Comercial) e Encarregados (Operacional).
CREATE TABLE equipes (
                         id SERIAL PRIMARY KEY,
                         nome_equipe VARCHAR(255) NOT NULL,
                         ativo BOOLEAN NOT NULL DEFAULT TRUE,
                         base_operacional_id INT NOT NULL,
                         data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                         CONSTRAINT fk_equipe_base FOREIGN KEY(base_operacional_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT
);

CREATE TABLE encarregados (
                              id SERIAL PRIMARY KEY,
                              nome_completo VARCHAR(255) NOT NULL,
                              vulgo VARCHAR(100),
                              ativo BOOLEAN NOT NULL DEFAULT TRUE,
                              base_operacional_id INT NOT NULL,
                              data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                              CONSTRAINT fk_encarregado_base FOREIGN KEY(base_operacional_id) REFERENCES bases_operacionais(id) ON DELETE RESTRICT
);