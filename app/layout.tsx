import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Méier Futsal | Pequenos craques. Grandes histórias.',description:'Conheça o Méier Futsal, nossos professores e a alegria de aprender em equipe. Agende uma visita e venha fazer parte do nosso time.',icons:{icon:'/images/logo.jpeg',shortcut:'/images/logo.jpeg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
