# Passo Final: Deploy na Vercel 🚀

Seu código está no GitHub e seu banco no Supabase. Agora vamos colocar no ar!

1.  Acesse **[vercel.com/new](https://vercel.com/new)**.
2.  Em **Import Git Repository**, procure por `fr-app-estetic` e clique em **Import**.
3.  Na tela de configuração (**Configure Project**):
    *   **Framework Preset**: Next.js (já deve estar selecionado).
    *   **Root Directory**: Deixe como está (`./`).
4.  Abra a seção **Environment Variables** e adicione as variáveis (copie do seu arquivo `.env` local):
    *   `DATABASE_URL` (A do Supabase)
    *   `DIRECT_URL` (A do Supabase, porta 5432)
    *   `ASAAS_API_URL`
    *   `ASAAS_API_KEY`
    *   `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (Opcional, mas bom ter).
5.  Clique em **Deploy**.

## Parabéns! 🎉
Em cerca de 2 minutos, a Vercel vai te dar um link (ex: `fr-app-estetic.vercel.app`).
Esse é o link que a Sara Estética vai usar para acessar o sistema!
