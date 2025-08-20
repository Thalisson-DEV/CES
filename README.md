<div align="center">
  <!-- <img src="https://placehold.co/200x200/111827/ffffff?text=CES" alt="CES Logo" width="200"/> -->
  <h1>📦 CES - Controle de Estoque SIPEL</h1>
  <p>
    <strong>Aplicação web full-stack para gestão completa de materiais, obras, equipes e solicitações operacionais, desenvolvida com uma stack moderna e foco total na experiência do usuário.</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow" alt="Status do Projeto: Em Desenvolvimento">
    <img src="https://img.shields.io/badge/Java-17%2B-blue?logo=openjdk&logoColor=white" alt="Java 17+">
    <img src="https://img.shields.io/badge/Spring%20Boot-3.x-green?logo=spring-boot" alt="Spring Boot 3.x">
    <img src="https://img.shields.io/badge/PostgreSQL-blue?logo=postgresql" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/JavaScript-ES6%2B-yellow?logo=javascript" alt="JavaScript ES6+">
  </p>
</div>

---

## 📋 Índice
1. [Sobre o Projeto](#-sobre-o-projeto)  
2. [Funcionalidades Principais](#-funcionalidades-principais)  
3. [Layout da Aplicação](#️-layout-da-aplicação)  
4. [Tecnologias Utilizadas](#-tecnologias-utilizadas)  
5. [Como Executar o Projeto](#-como-executar-o-projeto)  
6. [Contribuições](#-contribuições)  
7. [Contato](#-contato)  

---

## 📚 Sobre o Projeto
O **CES (Controle de Estoque SIPEL)** foi desenvolvido para **centralizar e otimizar a gestão de recursos operacionais**.  
Com ele, é possível controlar de forma detalhada os materiais, acompanhar obras em andamento, gerenciar equipes e processar solicitações comerciais.  

👉 O sistema substitui processos manuais por fluxos digitais, garantindo **mais agilidade, segurança e confiabilidade** no dia a dia.

---

## ✨ Funcionalidades Principais
- 🔐 **Autenticação Segura:** Login com JWT e controle de acesso baseado em roles.  
- 📊 **Dashboard Intuitivo:** KPIs para visão geral rápida das operações (em desenvolvimento).  
- 📁 **Gestão de Cadastros:** Materiais, Obras, Equipes e Usuários com CRUD completo.  
- 🔎 **Paginação e Filtros:** Busca em tempo real e filtros avançados em todas as tabelas.  
- 📝 **Fluxo de Solicitações:** Criação, acompanhamento e gestão de itens e status.  
- 📥 **Importação de Dados:** Importação em massa de arquivos Excel.  
- 📧 **Notificações Automáticas:** Envio de e-mails assíncronos para responsáveis.  

---

## 🖥️ Layout da Aplicação
A aplicação conta com um design **moderno, responsivo e intuitivo**, incluindo:  
- Barra lateral de navegação principal.  
- Submenus contextuais.  
- Área de conteúdo dinâmica.  

---

## 🛠️ Tecnologias Utilizadas
O projeto é estruturado em duas camadas principais:

### 🔹 Backend
- **Linguagem:** Java 17+  
- **Framework:** Spring Boot 3  
- **Segurança:** Spring Security + JWT  
- **Banco de Dados:** PostgreSQL  
- **ORM:** Spring Data JPA / Hibernate  
- **Migrações:** Flyway  
- **Build Tool:** Maven  

### 🔹 Frontend
- **Linguagens:** HTML5, CSS3, JavaScript (ES6+)  
- **Arquitetura:** SPA (*Single-Page Application*) com **Vanilla JS**  
- **Diferencial:** Construído sem frameworks, priorizando **performance e controle total**.  

---

## 🚀 Como Executar o Projeto
O **backend Spring Boot** serve os arquivos estáticos do **frontend**.  

### 🔧 Pré-requisitos
- Java JDK 17 ou superior  
- Maven 3.x  
- PostgreSQL instalado localmente  

### ▶️ Passo a passo
```bash
# Clone o repositório
git clone https://github.com/Thalisson-DEV/CES

# Acesse a pasta do projeto
cd CES

# Configure suas credenciais no arquivo application.properties
# (Banco PostgreSQL e serviço de e-mail)

# Certifique-se de que os arquivos do frontend (index.html, style.css, etc.)
# estão em src/main/resources/static

# Execute a aplicação
mvn spring-boot:run
➡ O servidor estará disponível em: http://localhost:8080

```

🤝 Contribuições
O projeto está em constante evolução 🚧.
Contribuições, sugestões e feedbacks são muito bem-vindos!

Abra uma issue para reportar problemas ou sugerir melhorias.

Crie um pull request para colaborar diretamente.

👤 Contato
Thalisson Damião - 74988550297

💼 LinkedIn: https://www.linkedin.com/in/thalisson-dami%C3%A3o-108a1732b/

📧 E-mail: thalissondamiao1@gmail.com

---
