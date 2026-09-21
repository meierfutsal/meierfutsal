import {adminAccountEmail,authenticate,changePassword,createAdminAccount,destroySession,getAdminIdentity,hasAdminAccount} from '@/lib/auth';
import {fail,problem,reply,sameOrigin} from '@/lib/server';

export async function GET(){try{const configured=await hasAdminAccount(),user=await getAdminIdentity();return reply({configured,user,email:configured?await adminAccountEmail():''});}catch(e){return fail(e);}}
export async function POST(req:Request){try{sameOrigin(req);const body:any=await req.json();const action=String(body.action||'');
 if(action==='setup'){if(await hasAdminAccount())problem('O administrador inicial já foi configurado.',409);const user=await createAdminAccount(String(body.email||''),String(body.name||''),String(body.password||''));return reply({ok:true,user});}
 if(action==='login'){const user=await authenticate(String(body.email||''),String(body.password||''));if(!user)problem('E-mail ou senha incorretos.',401);return reply({ok:true,user});}
 if(action==='logout'){await destroySession();return reply({ok:true});}
 if(action==='change-password'){if(!await getAdminIdentity())problem('Entre no painel para continuar.',401);await changePassword(String(body.current||''),String(body.next||''));return reply({ok:true});}
 problem('Ação inválida.');}catch(e){return fail(e);}}
