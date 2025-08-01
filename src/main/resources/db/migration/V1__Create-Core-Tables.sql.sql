-- V1: Cria as tabelas de domínio essenciais: Bases Operacionais, Perfis e Processos.

CREATE TABLE bases_operacionais (
                                    id SERIAL PRIMARY KEY,
                                    nome_base VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO bases_operacionais (nome_base) VALUES ('Juazeiro'), ('Remanso'), ('Jacobina'), ('Bonfim');

CREATE TABLE perfis (
                        id SERIAL PRIMARY KEY,
                        nome_perfil VARCHAR(100) NOT NULL UNIQUE,
                        descricao TEXT
);
INSERT INTO perfis (nome_perfil) VALUES ('Administrador'), ('Coordenação'), ('Estoque'), ('Técnico'), ('Comercial');

CREATE TABLE processos (
                           id SERIAL PRIMARY KEY,
                           nome_processo VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO processos (nome_processo) VALUES ('Obras'), ('Manutenção'), ('Poda'), ('Linha Viva'), ('Comercial');