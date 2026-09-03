# Ativação do Clube Florarte

## Situação desta atualização

O banco `xzckzlqvpytmjgecjovu` recebeu a migração `club_membership_libraries_profile_and_private_media`. A conta administradora existente foi preservada. As quatro paletas e três combinações de fontes originais foram preservadas no banco com traduções. Não execute novamente o schema inicial em produção: ele contém as permissões antigas.

O código precisa ser publicado na hospedagem do site. Os envios reais dependem das configurações abaixo. Nenhum convite ou feedback de teste foi enviado a pessoas reais.

## 1. Configurar a hospedagem

O site atual usa **Netlify**, no projeto `sensational-biscochitos-5c177c`. O arquivo `netlify.toml` define o build Next.js e a pasta `.next`; a Netlify detecta o framework e prepara as funções do servidor. Uma exportação estática não executa esses endpoints.

Vincule o repositório `StudioFlorarte/clube-florarte` ao projeto existente, usando a branch aprovada para publicação. No painel **Project configuration → Environment variables**, configure as variáveis para **Builds e Functions**; as variáveis declaradas apenas em `netlify.toml` não são repassadas às funções. Depois de alterar variáveis, faça um novo deploy. Evite uploads manuais somente dos arquivos estáticos.

Use `https://sensational-biscochitos-5c177c.netlify.app` como `APP_URL` e Site URL do Supabase, salvo se houver um domínio personalizado principal. O link com prefixo `6a989fd963186600087c919d--` aponta para uma versão específica e não deve ser usado nos convites.

A produção foi tornada pública com autorização da proprietária; os previews permanecem privados. O aplicativo mantém autenticação e bloqueio por assinatura.

Defina as variáveis de `.env.example` no painel de variáveis de ambiente da hospedagem:

- `NEXT_PUBLIC_SUPABASE_URL`: URL do projeto Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: chave publicável do projeto.
- `SUPABASE_SERVICE_ROLE_KEY`: segredo de servidor do Supabase. Nunca usar prefixo `NEXT_PUBLIC_`.
- `APP_URL`: endereço HTTPS final do clube, sem caminho adicional.
- `SMTP_HOST`: `smtp.hostinger.com` para Hostinger Email; confirme em hPanel → E-mails → Gerenciar → Conectar aplicativos/dispositivos. Contas Titan podem ter dados diferentes.
- `SMTP_USER`: conta completa de envio, por exemplo `hello@studioflorarte.com`.
- `SMTP_PASSWORD`: senha dessa caixa postal, configurada diretamente no painel de hospedagem.
- `EDUZZ_WEBHOOK_SECRET`: chave de verificação escolhida para o webhook no DevHub Eduzz.

O destinatário dos feedbacks é fixo no servidor: `hello@studioflorarte.com`. O remetente é a conta SMTP e o campo Responder para contém o e-mail da pessoa logada. A interface só confirma o envio quando o servidor SMTP aceita a mensagem. Verifique a caixa de entrada/spam para confirmar a entrega final.

Instalação e validação: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck`, `pnpm build`. Iniciar: `pnpm start`.

## 2. Convites e recuperação de senha no Supabase

Em Authentication → URL Configuration, configure a Site URL com o endereço final e autorize `/set-password` nas URLs de redirecionamento.

Em Authentication → Email/SMTP, ative SMTP próprio com os dados da Hostinger, TLS na porta 465. Defina remetente e nome do Clube Florarte. Esse SMTP é separado das variáveis da hospedagem: o Supabase envia redefinições de senha; o site envia feedbacks. Os convites de compra agora são gerados com generateLink, sem envio pelo Supabase, e entregues pelo ActiveCampaign.

Nos modelos de convite e de recuperação, use links de confirmação por `TokenHash`:

Convite:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Definir minha senha</a>
```

Recuperação:
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Redefinir minha senha</a>
```

Esses modelos são necessários ao fluxo com sessão em cookies. Não substitua pelo link direto `/set-password`: a confirmação precisa criar a sessão primeiro. Os textos dos modelos podem ser adaptados ao idioma da cliente; os modelos de e-mail do Supabase não são traduzidos automaticamente pelo seletor do site.

Desative novos cadastros públicos em Authentication → Sign In / Providers → Allow new users to sign up. A migração já bloqueia a criação de usuários sem convite, inclusive via API. Só a criação de uma conta não libera conteúdo: é necessário haver uma compra válida ou permissão de administradora.

Opcionalmente ative a proteção de senhas vazadas, apontada pelo verificador do Supabase. A troca de senha tem mínimo de 12 caracteres na interface; alinhe também esse mínimo nas configurações de Auth.

## 3. Eduzz: dois produtos anuais

Produtos anuais autorizados: **3095513 = português**, **3098697 = inglês**.

No DevHub Eduzz → Webhook, crie uma configuração apontando para:

`https://SEU-DOMINIO/api/webhooks/eduzz`

Selecione os eventos:

- `myeduzz.invoice_paid`
- `myeduzz.invoice_refunded`
- `myeduzz.invoice_chargeback`

Configure a chave de assinatura correspondente a `EDUZZ_WEBHOOK_SECRET`. O servidor valida HMAC SHA-256 no cabeçalho `x-signature`, usando o corpo original da requisição. Filtrar pelos dois produtos na Eduzz é útil, mas o servidor também valida os IDs.

Pagamento confirmado: registra um direito de acesso por fatura, com validade de um ano-calendário a partir de `paidAt`; envia o convite à nova cliente. Quando houver destinatária/aluna na compra, usa esse e-mail; caso contrário, o da compradora. Uma cliente que já entrou anteriormente mantém a mesma conta. Novas compras renovam o período; a página do perfil mostra a maior validade entre compras ainda válidas.

Cancelamento da renovação: mantém o período já pago. O bloqueio ocorre automaticamente na data de expiração, sem depender de uma rotina agendada. Reembolso e chargeback invalidam o acesso da fatura correspondente imediatamente. Uma outra compra válida da mesma cliente continua dando acesso. Um evento de pagamento antigo não restaura uma fatura reembolsada.

Eventos repetidos não criam novas assinaturas. O registro do evento e da compra ocorre na mesma transação. Se o convite falhar, o endpoint retorna erro para que a Eduzz tente novamente.

**Antes da ativação**, confirme que os produtos são pagamentos anuais completos, mesmo quando parcelados no cartão. Parcelamento sem limite (PSL) e boleto parcelado não são tratados como um ano integral: o endpoint retorna 422 para revisão. Nesses casos é necessário adaptar a cobertura ao contrato real e validar uma amostra da Eduzz. Não atribuir um ano de acesso a cada parcela.

Depois de configurar, use o teste de webhook da Eduzz e uma compra de teste autorizada. Verifique: e-mail de convite, definição de senha, biblioteca, data de validade, renovação, reembolso e registro de erros no histórico de entregas. Compras anteriores à integração precisam ser importadas de uma exportação verificada da Eduzz; cadastrar alguém manualmente sem a assinatura não libera acesso.

### Convites pelo ActiveCampaign

Configure `ACTIVECAMPAIGN_API_URL=https://studioflorarte95275.api-us1.com` e `ACTIVECAMPAIGN_API_KEY` como segredo de servidor na Netlify. A migração `private_activecampaign_invitation_delivery`, registrada em `activecampaign-schema.sql`, já foi aplicada. Os links ficam inacessíveis às funções de cliente; uma trava por email evita processamento simultâneo.

A automação `clube florarte-PT` (ID 1) usa somente a tag `florarte-acesso-pronto-pt` e o campo personalizado `%FLORARTEACCESSURL%`. A automação `clube florarte-EN` (ID 2) usa `florarte-acesso-pronto-en` e `%FLORARTEACCESSURLEN%`. Configure execução uma vez, envio imediato e rastreamento de links desabilitado. O gatilho antigo de inscrição na lista foi removido da automação PT. Ambas permanecem inativas durante a validação.

O servidor gera o link, atualiza o campo do contato e só então adiciona a tag de envio. A integração Eduzz existente continua responsável pela inscrição na lista do ActiveCampaign. Contatos sem inscrição ativa, inclusive destinatários de presentes que não estejam na lista, retornam falha para revisão; o servidor não reinscreve contatos cancelados. A aplicação da tag confirma o agendamento, não a entrega na caixa de entrada.

O botão abre `/activate`, que pede confirmação antes de consumir o token. Abrir o email ou inspecionar seu link não inicia a sessão. A pessoa define sua própria senha; nenhuma senha é enviada por email. O prazo do link depende da configuração OTP do Supabase. Links vencidos precisam de atendimento/novo convite; não há reenvio automático de convites já agendados. Recuperação de senha e feedback ainda dependem da configuração SMTP da Hostinger.

Antes da ativação final: validar PT e EN em endereços de teste autorizados, inscrição na lista, personalização do botão, definição de senha e acesso pago. Conferir duplicidade e reembolso. Só então ativar as duas automações, definir `ACTIVECAMPAIGN_INVITATIONS_ENABLED=true`, publicar novamente e ativar o webhook Eduzz. Com essa variável ausente ou falsa, eventos de pagamento retornam 503; reembolsos assinados continuam sendo processados. Não liberar o webhook antes desse conjunto estar pronto.

## 4. Administração e idiomas

O painel permite publicar drops, paletas, combinações de fontes e coleções de ícones com link Canva. Capas podem ser enviadas em JPG, PNG ou WebP, até 5 MB. Fotos do perfil usam os mesmos formatos e limite.

Preencha títulos, descrições e categorias nos quatro idiomas. O seletor visível traduz a interface e seleciona a tradução salva do conteúdo; não há serviço automático de tradução nem custo de tradução por acesso. Nomes próprios, códigos de cores, nomes de fontes, comentários escritos por membros e documentos externos do Canva mantêm seu conteúdo original.

Instagram é somente o @/link informado pela pessoa; não solicita autorização da Meta.

## Validação realizada

- Build de produção e verificação TypeScript.
- Onze testes de assinatura, produtos, idiomas, validade anual, eventos e agendamento no ActiveCampaign; sem envios reais.
- Testes transacionais no Supabase, sem persistir contas de teste: bloqueio de cadastro aberto, acesso sem pagamento, assinatura ativa/vencida/reembolsada, prevenção de autoatribuição de administração, gravação do perfil, autoria dos comentários, duplicidade e ordem de eventos.
- RLS nas tabelas e mídia privada. O aviso informativo de ausência de políticas em `eduzz_events` é intencional: essa tabela só é acessível pelo servidor.
- A entrega real de e-mails e os eventos reais da Eduzz dependem da configuração e do teste final acima.

Referências: [Hostinger SMTP](https://www.hostinger.com/br/support/1575756-como-encontrar-os-detalhes-de-configuracao-de-e-mail-no-hpanel-hostinger/), [assinatura Eduzz](https://developers.eduzz.com/docs/webhook/security), [fatura paga](https://developers.eduzz.com/reference/webhook/myeduzz-invoice-paid), [convites Supabase](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail), [proteção de senhas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

