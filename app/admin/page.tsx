import { getAdminIdentity, isAdminAccessConfigured } from '@/lib/auth';
import Admin from './panel';
import { GET } from '@/app/api/admin/route';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const user = await getAdminIdentity();
  if (!user) return <div className="admin-gate">
    <img src="/images/logo.jpeg" alt="Méier Futsal" />
    <h1>Acesso restrito à equipe</h1>
    <p>{isAdminAccessConfigured() ? 'Entre com o e-mail autorizado pelo administrador da escolinha.' : 'O acesso da equipe ainda não foi configurado. Consulte o responsável pela publicação do site.'}</p>
    {isAdminAccessConfigured() && <a className="btn btn-yellow" href="/admin">Tentar novamente</a>}
    <a href="/">Voltar ao site</a>
  </div>;
  const response = await GET();
  const data = response.ok ? await response.json() : null;
  return <Admin initialData={data} />;
}
