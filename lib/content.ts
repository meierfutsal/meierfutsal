export const defaultContent = {
  name: 'Méier Futsal', tagline: 'ESCOLA DE FUTSAL • RIO DE JANEIRO',
  heroTitle: 'Pequenos craques.\nGrandes histórias.',
  heroText: 'O primeiro drible, uma nova amizade, a alegria de fazer parte de um time. Tudo começa aqui.',
  heroCta: 'Agendar uma visita',
  logo: '/images/logo.jpeg',
  slides: [
    {src:'/images/em-quadra.jpeg',alt:'Aluno do Méier Futsal conduzindo a bola em quadra',label:'PAIXÃO QUE ENTRA EM QUADRA',position:'center'},
    {src:'/images/primeiros-toques.jpeg',alt:'Crianças do Méier Futsal aprendendo com a bola',label:'CADA CONQUISTA IMPORTA',position:'center'},
    {src:'/images/time.jpeg',alt:'Alunos e professores do Méier Futsal reunidos',label:'JUNTOS, SOMOS MAIS TIME',position:'center'}
  ],
  aboutEyebrow:'MUITO ALÉM DA BOLA',aboutTitle:'Aqui, a gente cresce\nem equipe.',
  aboutText:'O Méier Futsal é um lugar para descobrir o esporte, compartilhar experiências e viver a alegria de estar em quadra. Entre passes, dribles e novas amizades, cada treino é uma oportunidade de aprender.',
  history:'Nossa história é feita por quem veste essa camisa. Pelos professores que acompanham cada passo, pelas famílias que torcem de perto e pelos alunos que fazem a quadra ganhar vida.',
  founded:'',aboutImage:'/images/time.jpeg',
  values:[{title:'Aprender jogando',text:'O contato com a bola abre espaço para novas descobertas e para o desenvolvimento dentro de quadra.'},{title:'Respeito e parceria',text:'Ouvir, dividir e cooperar. Valores que acompanham o aluno muito além do treino.'},{title:'Alegria em cada treino',text:'Porque a vontade de voltar para a quadra começa com uma boa experiência.'}],
  teamTitle:'Quem ensina também\njoga junto.',teamText:'Conheça os professores que fazem parte do Méier Futsal.',
  coaches:[
    {id:'raphael',name:'Raphael Rosa',role:'Professor',bio:'Integrante da equipe de professores do Méier Futsal.',qualifications:'',since:'',image:'/images/professores.jpeg',crop:'raphael'},
    {id:'lucas',name:'Lucas Moraes',role:'Professor',bio:'Integrante da equipe de professores do Méier Futsal.',qualifications:'',since:'',image:'/images/professores.jpeg',crop:'lucas'},
    {id:'marcos',name:'Marcos Vinícius',role:'Professor',bio:'Integrante da equipe de professores do Méier Futsal.',qualifications:'',since:'',image:'/images/professores.jpeg',crop:'marcos'},
    {id:'daniel',name:'Daniel Pimentel',role:'Professor',bio:'Integrante da equipe de professores do Méier Futsal.',qualifications:'',since:'',image:'/images/professores.jpeg',crop:'daniel'},
    {id:'joao',name:'João Marcos',role:'Professor',bio:'Integrante da equipe de professores do Méier Futsal.',qualifications:'',since:'',image:'/images/professores.jpeg',crop:'joao'}
  ],
  galleryTitle:'A nossa melhor\nversão é em quadra.',
  gallery:[{src:'/images/primeiros-toques.jpeg',alt:'Os primeiros toques na bola',label:'APRENDIZADO'},{src:'/images/em-quadra.jpeg',alt:'A emoção de cada jogada',label:'EVOLUÇÃO'},{src:'/images/time.jpeg',alt:'Um time dentro e fora de quadra',label:'NOSSO TIME'}],
  visitTitle:'O próximo capítulo\npode ser do seu filho.',visitText:'Venha conhecer a quadra, conversar com a equipe e descobrir o Méier Futsal de perto.',
  location:'Caeté Tênis Clube',address:'Rua Doutor Ferrari, 321',city:'Todos os Santos • Rio de Janeiro, RJ',
  whatsapp:'',email:'',instagram:'https://www.instagram.com/meierfutsal/',
  reviewsTitle:'Histórias de quem\nfaz parte.',
  faq:[{q:'Como faço para conhecer a escolinha?',a:'Preencha o pedido de visita. A equipe entrará em contato para combinar o melhor dia e horário.'},{q:'Como funciona a inscrição?',a:'Envie a ficha de interesse com os dados do responsável e do aluno. A equipe confirma a disponibilidade, a turma e os próximos passos.'},{q:'Quais são os horários e valores?',a:'Os horários e valores são informados pela equipe conforme a turma e a disponibilidade. Você pode consultar durante o agendamento da visita.'}]
};
export type SiteContent=typeof defaultContent;
export type Item={id:string;kind:string;data:Record<string,any>;revision:number;created_at:string;updated_at:string};
export const money=(cents:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(cents/100);
export function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());}
export function paymentStatus(p:Record<string,any>){if(p.status==='cancelled')return 'Cancelada';if((p.paidCents||0)>=p.amountCents)return 'Em dia';return p.dueDate<today()?'Em atraso':'A vencer';}
export function remaining(p:Record<string,any>){return p.status==='cancelled'?0:Math.max(0,p.amountCents-(p.paidCents||0));}
