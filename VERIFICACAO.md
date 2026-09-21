# Verificação da exportação

Validação local realizada em 21/09/2026:

- Verificação TypeScript concluída sem erros.
- Build de produção do Vinext para Cloudflare Workers concluído.
- Migração inicial aplicada em D1 local.
- 14 testes da validação de tokens Access aprovados.
- 40 verificações das regras da API aprovadas, com banco SQLite e armazenamento simulados.
- 9 verificações HTTP no Worker local aprovadas: página, imagem, API pública, bloqueio do admin e uploads, rejeição de cabeçalhos falsos, solicitação de visita e rejeição de origem cruzada.
- Verificador de publicação impediu o uso do database_id de exemplo.

A publicação e o login real na conta Cloudflare do destinatário dependem das
configurações descritas no guia e devem ser conferidos após o deploy.
Os bancos e registros usados nos testes não fazem parte do ZIP.
