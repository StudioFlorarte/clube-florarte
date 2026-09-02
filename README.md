# Clube Florarte — área de membros

## O que já está pronto
- Login de membros (e-mail + senha) usando Supabase Auth
- Dashboard com grade de drops, cada um levando ao Canva
- Comentários em cada drop
- Painel admin: publicar novo drop + ver total de membros
- Página de feedback geral
- Stubs (páginas em branco prontas pra preencher) para Ícones, Paletas & Fontes e Estratégia de Conteúdo
- Botão flutuante de WhatsApp
- Cores e tipografia baseadas na identidade da Florarte (troque as fontes de verdade — veja abaixo)

## 1. Rodar o banco de dados
No painel do Supabase, vá em **SQL Editor > New query**, cole o conteúdo de `supabase-schema.sql` e clique em **Run**.
Isso cria as tabelas de perfis, drops, comentários e feedback, com as regras de segurança já configuradas.

## 2. Criar sua conta de admin
1. No painel do Supabase, vá em **Authentication > Users > Add user** e crie sua própria conta (e-mail + senha).
2. Volte no SQL Editor e rode (trocando o e-mail):
   ```sql
   update profiles set is_admin = true where id = (select id from auth.users where email = 'seu-email@exemplo.com');
   ```
3. Use esse e-mail e senha pra entrar na plataforma — você verá o "★ Painel admin" no menu.

## 3. Convidar membros
Por enquanto, criar cada membro é manual: **Authentication > Users > Add user**, com e-mail e uma senha temporária. Depois é só avisar a pessoa por WhatsApp/e-mail.

## 4. Rodar localmente (opcional, pra você ver antes de publicar)
```bash
npm install
npm run dev
```
Abra http://localhost:3000

## 5. Publicar o site (deploy)
1. Crie uma conta gratuita em vercel.com (dá pra entrar com GitHub)
2. Suba esta pasta pra um repositório no GitHub (ou arraste a pasta direto no site da Vercel)
3. Na Vercel, importe o projeto e cole as duas variáveis do `.env.local` nas configurações de Environment Variables
4. Deploy — a Vercel te dá um link tipo `clube-florarte.vercel.app`, e depois dá pra ligar seu domínio próprio

## Pendências de identidade visual
- As fontes reais (Amoresa e Operetta) precisam dos arquivos de fonte licenciados — por enquanto o código usa Playfair Display e Alex Brush como substitutas visuais parecidas, em `app/globals.css`.
- Troque `SEUNUMEROAQUI` no link do WhatsApp (`app/(app)/layout.tsx`) pelo seu número.
- Troque o link do Notion em `app/(app)/estrategia/page.tsx` pelo link público do seu board.
