# Clube Florarte

Área de membros em Next.js 14, Supabase e Netlify.

- Drops com capas enviadas pela administração e comentários de membros.
- Administração de paletas, combinações de fontes e coleções de ícones no Canva.
- Perfil com foto, nome, e-mail, telefone, Instagram, troca de senha e validade do plano.
- Interface em português, inglês, francês e espanhol; conteúdo editorial com traduções próprias.
- Acesso por convite e compra anual confirmada na Eduzz, protegido também por RLS.
- Feedback encaminhado pelo servidor para `hello@studioflorarte.com`, usando SMTP Hostinger.

## Configuração

Leia [SETUP.md](SETUP.md) para as configurações da Netlify, SMTP, convites do Supabase e webhooks Eduzz. Copie `.env.example` para `.env.local` somente no ambiente local e preencha os valores sem versionar segredos.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm test
pnpm typecheck
pnpm build
```

## Banco de dados

No projeto existente, a migração registrada já foi aplicada. Não execute novamente `supabase-schema.sql` em produção: ele representa a versão inicial, anterior ao controle de assinaturas.

Para um projeto novo, aplique o schema inicial, depois `schema-upgrade.sql` e `seed-library.sql`. O teste `tests/access.sql` verifica as permissões dentro de uma transação com rollback, sem envio de e-mails.

As fontes licenciadas Amoresa e Operetta ainda não foram fornecidas. A identidade visual usa Playfair Display, Alex Brush e Work Sans. As capas são escolhidas pela administração no envio de cada drop.
