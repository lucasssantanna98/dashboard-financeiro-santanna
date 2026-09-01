# 💳 Dashboard Financeiro SaaS

Plataforma de gestão financeira moderna, projetada no modelo **SaaS (Software as a Service) Multi-Tenant**. 
A aplicação permite que múltiplos usuários gerenciem suas finanças (Entradas e Saídas) de forma isolada, flexível e totalmente parametrizável. 

## 🚀 Novidades da Última Versão
- **Migração para PostgreSQL Nativo:** Remoção da dependência do Supabase. O banco de dados agora roda diretamente no servidor via Docker.
- **Arquitetura Multi-Tenant:** Um mesmo painel serve para múltiplos usuários (cada um com seu próprio dashboard e banco de dados isolado).
- **Totalmente Customizável:** Nomes das pessoas do casal e Fontes de Renda agora são configurados de forma dinâmica pelo próprio usuário no "Painel de Configurações" (SettingsModal).
- **Deploy via Docker na AWS EC2:** A aplicação inteira (Frontend + Banco de Dados PostgreSQL) agora roda de forma encapsulada em contêineres Docker.

## 🛠️ Tecnologias
- **Next.js 14+** (App Router & Server Actions)
- **React 18** & **TypeScript**
- **TailwindCSS** (Estilização UI/UX Moderna)
- **PostgreSQL** (`pg` / `node-postgres`) - Banco de Dados Relacional
- **Docker & Docker Compose** - Orquestração e Deploy
- **Nginx & Certbot** - Proxy Reverso e SSL
- **AWS EC2** - Hospedagem Nuvem

## 📦 Como Rodar Localmente (Desenvolvimento)

1. **Clone o repositório e instale as dependências:**
   ```bash
   npm install
   ```

2. **Suba o Banco de Dados com Docker:**
   Caso tenha o Docker instalado na sua máquina, você pode subir apenas o banco local usando o comando:
   ```bash
   docker-compose up -d db
   ```
   *(Caso não queira usar docker localmente, basta ter um PostgreSQL rodando e criar as tabelas)*

3. **Crie e popule o Banco de Dados:**
   Conecte-se ao seu PostgreSQL local e execute os scripts contidos em `auth-schema.sql` para criar a base de dados e o usuário `admin` padrão.

4. **Configuração de Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto contendo a conexão com o banco de dados e as chaves de sessão:
   ```env
   DATABASE_URL=postgresql://seu_user:sua_senha@localhost:5432/financeiro_db
   SESSION_SECRET=uma-chave-secreta-muito-segura-e-longa
   ```

5. **Inicie a Aplicação:**
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000`
   
   **Login Padrão de Admin:**
   - **Usuário:** admin
   - **Senha:** S34vic3s@123

## ☁️ Como Rodar em Produção (Deploy na EC2)

A estrutura de infraestrutura como código está pronta na raiz do projeto.

1. Acesse o seu servidor EC2 via SSH.
2. Clone ou atualize (git pull) o repositório na máquina.
3. Se for a **primeira vez**, crie o arquivo `.env` dentro do repositório no servidor com os dados de produção (senha do banco).
4. Rode os comandos do Docker Compose:
   ```bash
   sudo docker compose down
   sudo docker compose build --no-cache
   sudo docker compose up -d
   ```
5. O aplicativo estará rodando na porta 3000 e o Nginx fará o proxy reverso para exibir em seu domínio (ex: `financeiro.santannalabs.com`).

---
Desenvolvido por **Sant'Anna Labs**.