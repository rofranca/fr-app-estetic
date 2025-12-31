# Configurando o Supabase

Siga estes passos para criar seu banco de dados na nuvem gratuitamente:

1.  Acesse [database.new](https://database.new) (Redireciona para o Supabase).
2.  Faça login com seu GitHub.
3.  Crie um novo projeto:
    *   **Name**: `fr-app-estetic`
    *   **Password**: Gere uma senha forte e **SALVE-A**.
    *   **Region**: Escolha *Sao Paulo* (South America).
4.  Aguarde alguns minutos até o projeto ser criado (Setting up project...).
5.  Vá em **Project Settings** (ícone de engrenagem) -> **Database**.
6.  Em **Connection string** (role a página), selecione a aba **URI**.
7.  Copie a string que aparece. Ela se parece com:
    `postgresql://postgres.user:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`

## Atualizando seu projeto

1.  Volte aqui no terminal/código.
2.  Abra o arquivo `.env`.
3.  Cole a URL que você copiou na variável `DATABASE_URL`.
    *   **Importante**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 3.
    *   Se a URL tiver `?pgbouncer=true` no final, mantenha. Se não tiver, adicione `?sslmode=require`.

Exemplo final no `.env`:
```env
DATABASE_URL="postgresql://postgres.rodrigo:senha123@aws-0-sa-east-1.../postgres?sslmode=require"
```

## Finalizando

Após salvar o `.env` com a nova URL, me avise para eu rodar o comando que cria as tabelas no novo banco!
