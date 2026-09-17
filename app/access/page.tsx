import type {Metadata} from 'next';
import AccessForm from './access-form';

export const metadata:Metadata={title:'Clube Florarte · Acesso',robots:{index:false,follow:false}};
export default function AccessPage({searchParams}:{searchParams:{lang?:string}}){
  return <AccessForm initialLocale={searchParams.lang==='en'?'en':'pt'}/>;
}

