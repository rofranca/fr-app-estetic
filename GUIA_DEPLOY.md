# Guia de Publicação (Deploy) - FR APP ESTETIC

Atualmente, seu aplicativo roda localmente com **SQLite** (um arquivo de banco de dados). Para publicar na internet para que a "Sara Estética" possa acessar de qualquer lugar, precisamos de uma infraestrutura em nuvem.

O modelo recomendado para **Next.js** é:
- **Frontend/Backend**: Vercel (onde o site fica hospedado).
- **Banco de Dados**: PostgreSQL (banco de dados robusto na nuvem).

## Passo 1: Preparar o Banco de Dados (PostgreSQL)

Como o SQLite não funciona bem em ambientes "serverless" como a Vercel (pois o arquivo seria apagado a cada reinicialização), precisamos mudar para PostgreSQL.

1.  Crie uma conta no **Neon.tech** ou **Supabase** (ambos tem planos gratuitos excelentes).
2.  Crie um novo projeto e copie a `DATABASE_URL` (começa com `postgres://...`).
3.  No seu arquivo `.env`, substitua:
    ```env
    # Antigo (SQLite)
    # DATABASE_URL="file:./dev.db"
    
    # Novo (PostgreSQL)
    DATABASE_URL="postgres://usuario:senha@host/banco?sslmode=require"
    ```
4.  No arquivo `prisma/schema.prisma`, mude o provider:
    ```prisma
    datasource db {
      provider = "postgresql" // Mude de sqlite para postgresql
      url      = env("DATABASE_URL")
    }
    ```
5.  Gere as migrações:
    ```bash
    npx prisma migrate dev --name init
    ```

## Passo 2: Publicar no GitHub

Para usar a Vercel, seu código precisa estar no GitHub.

1.  Crie um repositório no GitHub.
2.  Suba seu código:
    ```bash
    git init
    git add .
    git commit -m "Primeira versão FR App"
    git branch -M main
    git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
    git push -u origin main
    ```

## Passo 3: Conectar na Vercel

1.  Acesse [vercel.com](https://vercel.com) e faça login com GitHub.
2.  Clique em **"Add New..."** -> **"Project"**.
3.  Importe o repositório que você acabou de criar.
4.  Nas configurações de **Environment Variables**, adicione as mesmas variáveis do seu `.env` local:
    - `DATABASE_URL` (A do PostgreSQL)
    - `ASAAS_API_KEY` (A de Produção)
    - `ASAAS_API_URL` (https://api.asaas.com/v3)
    - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (para o seed, se for rodar)
5.  Clique em **Deploy**.

## Google AI Studio vs. Desenvolvimento Atual

Você perguntou sobre o **Google AI Studio**.
- **Google AI Studio** é uma ferramenta para você **criar e testar prompts** para a inteligência artificial (o Gemini). Ele não hospeda sites nem "cria telas" visuais exportáveis diretamente para um app pronto hospedado.
- **Nosso Fluxo Atual**: Eu (a IA Antigravity) atuo como seu desenvolvedor. Você pede as telas, eu escrevo o código (React/Tailwind), e você vê o resultado imediatamente. **Este é o caminho mais rápido**.

Para adicionar novas telas no futuro:
1.  Volte aqui e me peça: "Crie uma tela de Relatórios".
2.  Eu gero o código.
3.  Você dá `git push`.
4.  A Vercel atualiza o site automaticamente em segundos.
