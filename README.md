# Méier Futsal

Site público + painel administrativo para gestão da escolinha, preparado para Cloudflare Workers, D1 e R2.

## Admin

O painel usa autenticação própria armazenada com segurança no D1. Não depende de Cloudflare Access.

No primeiro acesso a `/admin`, crie o administrador. Depois, use o mesmo endereço para entrar com e-mail e senha.

### Módulos

- Dashboard financeiro e operacional
- Alunos
- Turmas e presença
- Mensalidades, recebimentos parciais, despesas e recibos
- Visitas
- Inscrições
- Avaliações
- Editor de conteúdo e imagens
- Backup e exportações
- Segurança e alteração de senha

## Cloudflare

- Worker: `meierfutsal`
- D1 binding: `DB` → `meier-futsal-db`
- R2 binding: `BUCKET` → `meier-futsal-imagens`

O `wrangler.jsonc` já contém o Database ID atualmente usado pelo projeto.
