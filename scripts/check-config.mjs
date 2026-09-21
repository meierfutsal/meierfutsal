import { readFileSync } from 'node:fs';
// Keep wrangler.jsonc as strict JSON for this check.
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const id = config.d1_databases?.find(item => item.binding === 'DB')?.database_id;
const errors = [];
if (!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id || '') || id === '00000000-0000-4000-8000-000000000000')
  errors.push('Cole o database_id real do D1 em wrangler.jsonc.');
if (!config.r2_buckets?.find(item => item.binding === 'BUCKET')?.bucket_name)
  errors.push('Configure o bucket de imagens em wrangler.jsonc.');
const team = config.vars?.CF_ACCESS_TEAM_DOMAIN || '';
const aud = config.vars?.CF_ACCESS_AUD || '';
if (team && !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.cloudflareaccess\.com$/.test(team))
  errors.push('Use o domínio da equipe Access sem https:// e sem barra final.');
if (aud && !/^[a-f0-9]{64}$/i.test(aud)) errors.push('Confira o Application Audience (AUD) do Access.');
if (errors.length) { console.error('Publicação interrompida:\n- ' + errors.join('\n- ')); process.exit(1); }
if (!team || !aud) console.warn('O site público pode ser publicado. O admin permanecerá bloqueado até configurar o Cloudflare Access.');
console.log('Configuração de publicação conferida.');
