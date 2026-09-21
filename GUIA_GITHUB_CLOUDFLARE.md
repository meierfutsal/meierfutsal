# Publicar o Méier Futsal no GitHub e na Cloudflare

Este pacote contém o código completo e as cinco imagens fornecidas para o site.
O GitHub recebe o código; a Cloudflare executa o site, o painel, os formulários,
o banco e os uploads. A publicação é feita em **Cloudflare Workers**.

Você precisa de uma conta GitHub, uma conta Cloudflare com Workers, D1 e R2
habilitados e Node 22.13 ou superior no computador. Para o site público com
admin protegido, este guia usa um domínio próprio ativo na Cloudflare.

## 1. Preparar a pasta

Extraia o ZIP e abra o terminal dentro da pasta que contém `package.json`.
Instale as dependências:

```sh
npm install -g pnpm@11.19.0
pnpm install --frozen-lockfile
```

Mantenha `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `wrangler.jsonc`
e as pastas `app`, `lib`, `drizzle` e `public` no mesmo nível.

## 2. Criar o banco e o armazenamento

Entre na sua conta Cloudflare e crie os recursos:

```sh
pnpm exec wrangler login
pnpm exec wrangler d1 create meier-futsal-db
pnpm exec wrangler r2 bucket create meier-futsal-imagens
```

Se um recurso com esse nome já existir na sua conta, use o identificador dele;
não é necessário recriá-lo. Ative o serviço R2 no painel Cloudflare se solicitado.

Abra `wrangler.jsonc` e substitua o `database_id` de exemplo pelo UUID que o
comando D1 retornar. Confira também `database_name` e `bucket_name`.
Mantenha os nomes dos bindings exatamente como **DB** e **BUCKET**.
O bucket não precisa ter acesso público: o site entrega as imagens pela rota `/media`.

O arquivo fornecido é JSON válido, mesmo tendo extensão `.jsonc`.
Mantenha esse formato, sem comentários, para o verificador de publicação funcionar.

## 3. Publicar a primeira versão

Execute:

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm db:remote
pnpm deploy
```

`db:remote` cria as tabelas na sua conta. Confirme a execução da migração quando
solicitado. O comando `deploy` informa o endereço inicial em `workers.dev`.
Nesse momento o site público funciona, mas o painel fica bloqueado até a etapa 4.

O build precisa ser executado novamente sempre que você editar código ou
`wrangler.jsonc`, antes de rodar `pnpm deploy`.

## 4. Configurar o domínio e o login do admin

Esta exportação usa Cloudflare Access para o login. O servidor verifica a
assinatura, a validade e a aplicação do token recebido; um cabeçalho de e-mail
isolado não concede acesso. O formato segue a [validação oficial do Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

### Domínio

Escolha um domínio ou subdomínio da sua conta para o site. Adicione ao objeto
principal de `wrangler.jsonc` estas propriedades, trocando o exemplo pelo seu
endereço real:

```json
"routes": [{ "pattern": "www.seudominio.com.br", "custom_domain": true }],
"workers_dev": false,
"preview_urls": false
```

Atenção às vírgulas entre propriedades JSON. Mantenha todos os campos que já
existem no arquivo. Na próxima publicação, a rota do domínio será configurada.

O endereço `workers.dev` serve para conferir a primeira publicação. O guia usa
um domínio próprio para aplicar o login apenas ao painel e às APIs administrativas.
A proteção geral de um Worker em `workers.dev` pode exigir login de todos os
visitantes; veja a [documentação de workers.dev](https://developers.cloudflare.com/workers/configuration/routing/workers-dev/).

### Aplicação Access

No painel Cloudflare, abra **Zero Trust → Access controls → Applications** e
crie uma aplicação **Self-hosted** chamada `Méier Futsal — Administração`.
Adicione estes três caminhos do seu domínio **na mesma aplicação**:

| Domínio | Campo Path |
| --- | --- |
| `www.seudominio.com.br` | `admin` |
| `www.seudominio.com.br` | `api/admin` |
| `www.seudominio.com.br` | `api/uploads` |

Use esses caminhos sem deixar o campo Path vazio, para a página pública continuar
aberta. Não crie três aplicações com AUDs diferentes. As subrotas herdam a proteção
do caminho configurado. Consulte [aplicações públicas do Access](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/)
e [regras de caminhos](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/).

Adicione uma política **Allow** com o seletor **Emails** e informe o e-mail do
titular. Habilite **One-time PIN** como método de login para entrar com o código
recebido por e-mail. Ao adicionar gestores, inclua também os e-mails deles na política.

Copie o domínio da equipe e o **Application Audience (AUD)**. Preencha em
`wrangler.jsonc`:

```json
"vars": {
  "CF_ACCESS_TEAM_DOMAIN": "sua-equipe.cloudflareaccess.com",
  "CF_ACCESS_AUD": "COLE_AQUI_O_AUD_DE_64_CARACTERES"
}
```

O domínio da equipe não é o domínio do site: termina em `cloudflareaccess.com`.
Use-o sem `https://` e sem barra final. Esses dois campos são identificadores,
não senhas, e podem ficar no arquivo de configuração.

### E-mail do titular

Execute o comando abaixo e, quando solicitado, digite o mesmo e-mail autorizado
na política Access:

```sh
pnpm exec wrangler secret put ADMIN_OWNER_EMAIL --config wrangler.jsonc
pnpm build
pnpm deploy
```

Esse e-mail fica nos secrets do Worker, fora do repositório. Não existe senha
padrão. Abra `https://www.seudominio.com.br/admin`, entre pelo Access e preencha
os dados da escola no painel. Para autorizar outro gestor, adicione seu e-mail
em **Configurações → Acesso dos gestores** e na política Allow do Access.

## 5. Enviar o código ao GitHub

Crie um repositório vazio, por exemplo `meier-futsal`. Você pode mantê-lo privado.
No terminal da pasta do projeto, rode os comandos abaixo substituindo `SEU_USUARIO`:

```sh
git init
git add .
git commit -m "Site Meier Futsal"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/meier-futsal.git
git push -u origin main
```

O `package.json` deve aparecer na raiz do repositório, e não dentro de uma pasta
extra. O `.gitignore` já exclui dependências, arquivos de ambiente, banco local
e arquivos gerados. Não envie o ZIP como único arquivo do repositório: extraia
o conteúdo primeiro. Não coloque tokens ou senhas nos arquivos de código.

## 6. Conectar as atualizações automáticas

No Worker `meier-futsal`, abra as configurações de **Builds**, conecte o repositório
GitHub e use:

| Configuração | Valor |
| --- | --- |
| Projeto | Worker existente `meier-futsal` |
| Branch de produção | `main` |
| Diretório raiz | `/` |
| Instalação, se houver esse campo | `pnpm install --frozen-lockfile` |
| Comando de build | `pnpm build` |
| Comando de deploy | `pnpm deploy` |
| Versão do Node | 22, no mínimo 22.13 |

O arquivo `.node-version` indica a versão principal do Node. O `packageManager`
do `package.json` fixa o pnpm. Os pushes em `main` poderão publicar novas versões
pelo Workers Builds. Secrets usados pelo site pertencem às configurações de
runtime do Worker, não às variáveis do build. [Configuração oficial do Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

A migração inicial do banco já foi aplicada na etapa 3. Se no futuro um desenvolvedor
adicionar novas migrações SQL, deverá aplicar `pnpm db:remote` antes de publicar
a versão que depende delas. Edições de conteúdo pelo painel não exigem push.

## 7. Conferir a instalação

Abra a página inicial em uma janela anônima: ela deve abrir sem login. O endereço
`/admin` deve pedir autenticação. Entre com o titular, crie uma turma e um aluno
de teste, registre uma mensalidade e confira o recebimento. Exclua os testes
pelos controles disponíveis antes de iniciar o uso real.

Teste também uma solicitação de visita e uma avaliação com foto. A avaliação
só deve aparecer no site após aprovação da equipe. Troque uma imagem pelo painel
e confira a mudança em uma nova janela.

## Solução de problemas

| Situação | O que conferir |
| --- | --- |
| Publicação pede `database_id` | Substitua o UUID de exemplo pelo ID real do D1. |
| Banco informa `no such table` | Aplique `pnpm db:remote` no banco configurado. |
| Upload de imagens falha | Confira o bucket R2 e o binding `BUCKET`. |
| Painel informa acesso não configurado | Preencha os dois campos Access, gere novo build e publique. |
| Login funciona, mas o painel recusa a conta | Compare o e-mail autenticado com `ADMIN_OWNER_EMAIL` ou com os gestores cadastrados. |
| A página pública pede login | Confira se a aplicação Access protege só os três caminhos indicados. |
| Gestor não recebe acesso | Autorize o e-mail tanto no painel da escola quanto na política Access. |
| Sessão expirou durante uma edição | Abra `/admin` novamente, autentique e repita a edição. |
| Mudança no código não aparece | Confira a branch, o resultado do build e o deploy no Worker correto. |

## Sobre os dados

O pacote inclui o conteúdo inicial e as fotos fornecidas. Ele não inclui um
backup do D1 ou do R2 de outra hospedagem. Se você já cadastrou alunos, recebeu
inscrições ou alterou o conteúdo na versão online anterior, esses dados exigem
uma migração separada; publicar este código não os copia automaticamente.

As exportações JSON/CSV do painel ajudam a guardar os registros. O JSON do painel
contém endereços de imagens, não os arquivos delas. Para uma cópia completa,
faça backup também do banco D1 e do bucket R2 da sua conta.
