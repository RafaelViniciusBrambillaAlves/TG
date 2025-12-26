# 🚨 Sistema de Coordenação de Voluntários e Recursos em Situações de Emergência
### 📌 Visão Geral

Este projeto tem como objetivo centralizar e otimizar a coordenação de voluntários e recursos durante situações de emergência, como desastres naturais, crises humanitárias ou eventos de grande impacto social.

A aplicação permite o cadastro de voluntários, o gerenciamento de recursos disponíveis (alimentos, medicamentos, abrigos, equipes médicas) e a visualização das ocorrências de forma organizada, garantindo resposta rápida, eficiente e segura.

***
### 🎯 Objetivos do Sistema

Facilitar a gestão de voluntários em situações críticas

Centralizar informações sobre recursos disponíveis

Controlar permissões de acesso por perfil

Disponibilizar uma API REST escalável e segura

Oferecer um aplicativo móvel multiplataforma para uso em campo

***
### 🛠️ Tecnologias Utilizadas
#### 🔹 Back-end

Node.js

NestJS (arquitetura modular)

TypeScript

API REST

JWT (autenticação)

Bcrypt (hash de senhas)

#### 🔹 Banco de Dados

PostgreSQL

ORM: TypeORM

#### 🔹 Front-end

Angular

Ionic Framework

TypeScript

HTML / SCSS

#### 🔹 Infraestrutura

Docker

Docker Compose

Git & GitHub

***

### ⚙️ Funcionalidades
##### 👤 Gestão de Usuários

Cadastro e autenticação de usuários

Perfis de acesso (Administrador / Voluntário)

Controle de permissões via Guards

#### 🧍 Voluntários

Cadastro de voluntários

Associação por localização

Status de disponibilidade

##### 📦 Recursos

Cadastro de recursos (alimentos, medicamentos, abrigos, etc.)

Controle de quantidade

Associação com ocorrências

##### 📍 Ocorrências

Registro de situações de emergência

Vinculação de voluntários e recursos

#### 🧱 Arquitetura

Arquitetura em camadas

Separação clara entre Controllers, Services e Repositories

Uso de DTOs para validação e padronização de dados

Princípios REST

Clean Code

#### 🔐 Segurança

Autenticação via JWT

Hash de senha com Bcrypt

Validações de entrada de dados

Proteção de rotas por perfil de usuário
****

### 🚀 Como Executar o Projeto
Pré-requisitos

Docker

Docker Compose

Passos

Clone o repositório

Configure as variáveis de ambiente

Execute o comando:

docker-compose up -d

Acesse:

API: http://localhost:3000

App Mobile via Ionic

***

### 📈 Possíveis Melhorias Futuras

Integração com serviços de mapas (Google Maps / OpenStreetMap)

Notificações em tempo real (WebSocket)

Dashboard administrativo

Relatórios de ocorrências

Integração com serviços públicos

***
### 👨‍💻 Autor

#### Leonardo Vinicius Brambilla Alves 
Estudante de Análise e Desenvolvimento de Sistemas

Desenvolvimento Back-end

Linkedin: https://www.linkedin.com/in/leonardo-brambilla-80554a22b/

#### Rafael Vinicius Brambilla Alves 
Estudante de Análise e Desenvolvimento de Sistemas

Foco em Engenharia de Dados e Desenvolvimento Back-end

Linkedin: https://www.linkedin.com/in/rafaelviniciusbrambillaalves/
