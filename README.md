# Méier Futsal

Site institucional e sistema de gestão da escolinha, com identidade amarela e preta.

**Para publicar, siga [GUIA_GITHUB_CLOUDFLARE.md](GUIA_GITHUB_CLOUDFLARE.md).**

Inclui página responsiva, apresentação da escola, professores, galeria com slides,
formulários de visita e inscrição, avaliações com foto e moderação.
O painel reúne alunos, turmas, presença, mensalidades, recebimentos parciais,
despesas, exportações, conteúdo editável, upload de imagens e autorização de gestores.

O backend usa Cloudflare Workers, D1 e R2. React e Vinext renderizam as páginas.
A edição exportada verifica os tokens do Cloudflare Access para o admin;
não depende do login ou da hospedagem do ChatGPT.

| Arquivo ou pasta | Uso |
| --- | --- |
| `app/` | Páginas, painel e rotas da API |
| `lib/` | Regras, conteúdo inicial, validação e autenticação |
| `public/images/` | Logo e fotos fornecidas |
| `drizzle/` | Migração SQL inicial do banco |
| `wrangler.jsonc` | Configuração da sua conta Cloudflare |
| `tests/` | Testes de verificação do login |
| `scripts/check-config.mjs` | Verifica a configuração antes de publicar |

## Desenvolvimento

Use Node 22.13 ou superior e pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm db:local
pnpm dev
```

A URL local aparece no terminal. O desenvolvimento local usa banco e imagens
locais. Não existe senha de demonstração: o painel exige autenticação real do
Access. Para validar a parte administrativa pelo navegador, publique e configure
o Access conforme o guia.

```sh
pnpm typecheck
pnpm test
pnpm build
```

O build gera `dist/client` e `dist/server`. Essas pastas são geradas na publicação
e não precisam ir para o GitHub.

## Dados e funcionamento

A instalação começa sem cadastros financeiros ou de alunos. O conteúdo inicial
é o de `lib/content.ts`. As alterações feitas no painel ficam no D1; novas fotos
ficam no R2. O repositório não contém um backup de alterações feitas no site online.
Uma migração de dados de outra hospedagem exige exportar o banco e copiar as mídias
separadamente, preservando os identificadores.

A ficha pública recebe solicitações de inscrição; a equipe conclui o cadastro no
painel. As visitas são solicitações que a equipe confirma. As avaliações aparecem
após aprovação. Os pagamentos são registrados manualmente; não há cobrança bancária,
envio automático de mensagens ou emissão fiscal integrada.

Informações institucionais ainda não fornecidas, como ano de fundação, biografias,
contato e horários, devem ser preenchidas pela escola no editor do painel.
