import { cookies } from 'next/headers';
import { env } from 'cloudflare:workers';

const COOKIE='mf_admin_session';
const AUTH_ID='admin_auth';
const SESSION_PREFIX='admin_session:';
const SESSION_DAYS=14;

type Identity={email:string;displayName:string;owner:boolean};
type AuthConfig={email:string;name:string;salt:string;hash:string;iterations:number};

function bindings(){return env as unknown as {DB:D1Database};}
function db(){const d=bindings().DB;if(!d)throw new Error('Banco de dados indisponível.');return d;}
function hex(bytes:ArrayBuffer|Uint8Array){return Array.from(bytes instanceof Uint8Array?bytes:new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');}
function randomHex(bytes=24){const b=new Uint8Array(bytes);crypto.getRandomValues(b);return hex(b);}
async function sha256(value:string){return hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));}
async function derive(password:string,salt:string,iterations=100000){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(salt),iterations},key,256));
}
async function getRecord(id:string){const row:any=await db().prepare('SELECT data FROM records WHERE id=?').bind(id).first();if(!row)return null;try{return JSON.parse(row.data);}catch{return null;}}
async function putRecord(id:string,kind:string,data:unknown){const now=new Date().toISOString();await db().prepare(`INSERT INTO records (id,kind,data,revision,created_at,updated_at) VALUES (?,?,?,1,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,revision=records.revision+1,updated_at=excluded.updated_at`).bind(id,kind,JSON.stringify(data),now,now).run();}

export async function hasAdminAccount(){return !!await getRecord(AUTH_ID);}
export async function createAdminAccount(email:string,name:string,password:string){
 if(await hasAdminAccount())throw Object.assign(new Error('O administrador inicial já foi configurado.'),{status:409});
 const cleanEmail=email.trim().toLowerCase();const cleanName=name.trim()||'Administrador';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail))throw Object.assign(new Error('Informe um e-mail válido.'),{status:400});
 if(password.length<8)throw Object.assign(new Error('A senha precisa ter pelo menos 8 caracteres.'),{status:400});
 const salt=randomHex(18),iterations=100000,hash=await derive(password,salt,iterations);
 await putRecord(AUTH_ID,'admin_auth',{email:cleanEmail,name:cleanName,salt,hash,iterations} satisfies AuthConfig);
 return createSession(cleanEmail,cleanName);
}
export async function authenticate(email:string,password:string){
 const cfg=await getRecord(AUTH_ID) as AuthConfig|null;if(!cfg)return null;
 const clean=email.trim().toLowerCase();if(clean!==cfg.email)return null;
 const hash=await derive(password,cfg.salt,cfg.iterations||100000);if(hash!==cfg.hash)return null;
 return createSession(cfg.email,cfg.name||'Administrador');
}
export async function changePassword(current:string,next:string){
 const cfg=await getRecord(AUTH_ID) as AuthConfig|null;if(!cfg)throw Object.assign(new Error('Administrador não configurado.'),{status:404});
 const currentHash=await derive(current,cfg.salt,cfg.iterations||100000);if(currentHash!==cfg.hash)throw Object.assign(new Error('Senha atual incorreta.'),{status:401});
 if(next.length<8)throw Object.assign(new Error('A nova senha precisa ter pelo menos 8 caracteres.'),{status:400});
 const salt=randomHex(18),iterations=100000,hash=await derive(next,salt,iterations);await putRecord(AUTH_ID,'admin_auth',{...cfg,salt,hash,iterations});
 await db().prepare("DELETE FROM records WHERE kind='admin_session'").run();
}
async function createSession(email:string,name:string){
 const token=randomHex(32),tokenHash=await sha256(token),expiresAt=new Date(Date.now()+SESSION_DAYS*86400000).toISOString();
 await putRecord(SESSION_PREFIX+tokenHash,'admin_session',{email,name,expiresAt});
 const jar=await cookies();jar.set(COOKIE,token,{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:SESSION_DAYS*86400});
 return {email,displayName:name,owner:true} satisfies Identity;
}
export async function destroySession(){
 const jar=await cookies();const token=jar.get(COOKIE)?.value;if(token){const h=await sha256(token);await db().prepare('DELETE FROM records WHERE id=?').bind(SESSION_PREFIX+h).run();}jar.set(COOKIE,'',{httpOnly:true,secure:true,sameSite:'lax',path:'/',maxAge:0});
}
export async function getAdminIdentity():Promise<Identity|null>{
 const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;
 const h=await sha256(token),session=await getRecord(SESSION_PREFIX+h);if(!session)return null;
 if(!session.expiresAt||session.expiresAt<new Date().toISOString()){await db().prepare('DELETE FROM records WHERE id=?').bind(SESSION_PREFIX+h).run();return null;}
 return {email:String(session.email||''),displayName:String(session.name||'Administrador'),owner:true};
}
export async function adminAccountEmail(){const cfg=await getRecord(AUTH_ID) as AuthConfig|null;return cfg?.email||'';}
