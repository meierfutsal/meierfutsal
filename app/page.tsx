import Home from './home';
import {content,all} from '@/lib/server';
import {defaultContent} from '@/lib/content';
export const dynamic='force-dynamic';
export default async function Page(){let site=defaultContent,classes:any[]=[],reviews:any[]=[];try{site=await content() as typeof defaultContent;classes=(await all('class')).filter(x=>x.data.published);reviews=(await all('review')).filter(x=>x.data.status==='Aprovada').map(x=>({id:x.id,...x.data}));}catch(e){console.error('Public content unavailable',e);}return <Home initialSite={site} initialClasses={classes} initialReviews={reviews}/>;}
