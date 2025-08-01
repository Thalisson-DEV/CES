-- V2: Cria a tabela de Usuários do sistema.
CREATE TABLE usuarios (
                          id SERIAL PRIMARY KEY,
                          username VARCHAR(50) NOT NULL UNIQUE,
                          cpf VARCHAR(11) NOT NULL UNIQUE,
                          nome_completo VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL UNIQUE,
                          senha_hash VARCHAR(255) NOT NULL,
                          ativo BOOLEAN NOT NULL DEFAULT TRUE,
                          perfil_id INT NOT NULL,
                          base_operacional_id INT,
                          data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                          data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

                          CONSTRAINT fk_usuarios_perfis FOREIGN KEY(perfil_id) REFERENCES perfis(id) ON DELETE RESTRICT,
                          CONSTRAINT fk_usuarios_bases FOREIGN KEY(base_operacional_id) REFERENCES bases_operacionais(id) ON DELETE SET NULL
);