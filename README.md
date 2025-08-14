<div align="center">
<!-- ><img src="https://placehold.co/200x200/111827/ffffff?text=CES" alt="CES Logo" width="200"/> -->
<h1>CES - Controle de Estoque SIPEL</h1>
<p>
<strong>Uma aplicação web full-stack para a gestão completa de materiais, obras, equipes e solicitações operacionais, construída com uma stack moderna e com foco na experiência do utilizador.</strong>
</p>
<p>
<img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow" alt="Status do Projeto: Em Desenvolvimento">
<img src="https://img.shields.io/badge/Java-17%2B-blue?logo=openjdk&logoColor=white" alt="Java 17+">
<img src="https://img.shields.io/badge/Spring%20Boot-3.x-green?logo=spring-boot" alt="Spring Boot 3.x">
<img src="https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql" alt="PostgreSQL">
<img src="https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript" alt="JavaScript ES6+">
</p>
</div>

📋 Índice
1. Sobre o Projeto

2. Funcionalidades Principais

3. Layout da Aplicação

4. Tecnologias Utilizadas

5. Como Executar o Projeto

6. Contribuições

7. Contato

📚 Sobre o Projeto
O CES (Controle de Estoque SIPEL) foi desenvolvido para centralizar e otimizar a gestão de recursos operacionais. A plataforma permite o controle detalhado de materiais, o acompanhamento de obras, a gestão de equipes e o processamento de solicitações comerciais, substituindo processos manuais por um fluxo de trabalho digital, rápido e seguro.

✨ Funcionalidades Principais
✅ Autenticação Segura: Sistema de login baseado em tokens JWT com controlo de acesso por roles.
✅ Dashboard Intuitivo: Tela inicial com KPIs para uma visão geral rápida das operações. (Ainda ficticios)
✅ Gestão de Cadastros: Módulos completos para Materiais, Obras, Equipes e Usuários.
✅ Paginação e Filtros: Interface com paginação, filtros avançados e busca em tempo real em todas as tabelas.
✅ Fluxo de Solicitações: Sistema de criação e acompanhamento de solicitações comerciais, com gestão de itens e status.
✅ Importação de Dados: Funcionalidade para importar dados em massa a partir do Excel.
✅ Notificações Automáticas: Envio de e-mails assíncronos para notificar os responsáveis sobre novas solicitações.

🖥️ Layout da Aplicação
A aplicação possui um layout moderno e responsivo, com uma barra lateral de navegação principal, um submenu contextual e uma área de conteúdo dinâmica, garantindo uma experiência de utilizador consistente e intuitiva em todas as telas.

(Aqui você pode adicionar screenshots da sua aplicação)

🛠️ Tecnologias Utilizadas
O projeto é dividido em duas partes principais:

Backend
Linguagem: Java 17+

Framework: Spring Boot 3

Segurança: Spring Security com autenticação JWT.

Banco de Dados: PostgreSQL

Persistência: Spring Data JPA / Hibernate

Migrações: Flyway

Build Tool: Maven

Frontend
Linguagens: HTML5, CSS3, JavaScript

Arquitetura: SPA (Single-Page Application) construída com Vanilla JS, sem frameworks, para máximo controlo e performance.

🚀 Como Executar o Projeto
Para executar o projeto localmente, o backend do Spring Boot servirá os ficheiros estáticos do frontend.

Pré-requisitos
Java JDK 17 ou superior

Maven 3.x

PostgreSQL (localmente)

Backend e Frontend
Clone o repositório:

git clone https://github.com/Thalisson-DEV/CES

Navegue até à pasta do projeto:

cd CES

Configure as suas credenciais do PostgreSQL e do serviço de e-mail no application.properties.

Certifique-se de que os seus ficheiros de frontend (index.html, style.css, etc.) estão na pasta src/main/resources/static.

Instale as dependências e execute a aplicação:

mvn spring-boot:run

O servidor rodará em http://localhost:8080.

🤝 Contribuições
Este projeto está em desenvolvimento. Contribuições, sugestões e feedbacks são muito bem-vindos! Sinta-se à vontade para abrir uma issue ou um pull request.

👤 Contato
Thalisson Damião

LinkedIn: https://www.linkedin.com/in/seu-perfil

Email: thalissondamiao1@gmail.com
