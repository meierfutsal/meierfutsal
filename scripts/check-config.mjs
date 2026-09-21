import { readFileSync } from 'node:fs';
const config=JSON.parse(readFileSync(new URL('../wrangler.jsonc',import.meta.url),'utf8'));
const id=config.d1_databases?.find(item=>item.binding==='DB')?.database_id;
const errors=[];
if(!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id||'')||id==='00000000-0000-4000-8000-000000000000')errors.push('Configure o database_id real do D1 em wrangler.jsonc.');
if(!config.r2_buckets?.find(item=>item.binding==='BUCKET')?.bucket_name)errors.push('Configure o bucket de imagens em wrangler.jsonc.');
if(errors.length){console.error('Publicação interrompida:\n- '+errors.join('\n- '));process.exit(1);}
console.log('Configuração de publicação conferida. Admin usa login próprio com D1.');
