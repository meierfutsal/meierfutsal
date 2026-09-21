import {getAdminIdentity,hasAdminAccount} from '@/lib/auth';
import Admin from './panel';
import AdminLogin from './login';
import {GET} from '@/app/api/admin/route';
export const dynamic='force-dynamic';
export default async function Page(){const user=await getAdminIdentity();if(!user)return <AdminLogin configured={await hasAdminAccount()}/>;const response=await GET();const data=response.ok?await response.json():null;return <Admin initialData={data}/>;}
