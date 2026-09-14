import { createClient } from '@/lib/supabase/server';
import styles from './landing-visits.module.css';
export default async function LandingVisits() {
  const client = createClient();
  const {data:{user}} = await client.auth.getUser();
  if (!user) return null;
  const {data:profile} = await client.from('profiles').select('is_admin').eq('id',user.id).single();
  if (!profile?.is_admin) return null;
  const day = new Date(); day.setUTCHours(0,0,0,0);
  const countSince = (since?: string, until?: string) => { let q = client.from('landing_page_visits').select('id',{count:'exact',head:true});if(since)q=q.gte('visited_at',since);if(until)q=q.lt('visited_at',until);return q; };
  const starts = Array.from({length:7},(_,i)=>new Date(day.getTime()-(6-i)*86400000));
  const [total, month, ...days] = await Promise.all([countSince(),countSince(new Date(day.getTime()-29*86400000).toISOString()),...starts.map(d=>countSince(d.toISOString(),new Date(d.getTime()+86400000).toISOString()))]);
  const error = [total,month,...days].some(result=>result.error);
  const week = days.reduce((sum,d)=>sum+(d.count??0),0);
  return <section className={styles.panel} aria-labelledby="landing-visits-title"><div className={styles.heading}><div><h2 id="landing-visits-title">Visitas da landing page</h2><p>Contagem de sessões em /landingpage</p></div><a href="/landingpage" target="_blank" rel="noreferrer" className="btn-primary">Abrir landing page ↗</a></div>{error?<p role="status">Não foi possível carregar as visitas. Atualize a página para tentar novamente.</p>:<><div className={styles.metrics}>{[['Hoje',days[6].count??0],['Últimos 7 dias',week],['Últimos 30 dias',month.count??0],['Total',total.count??0]].map(([label,value])=><div key={label}><span>{label}</span><strong>{Number(value).toLocaleString('pt-BR')}</strong></div>)}</div><table className={styles.table}><caption>Visitas por dia · últimos 7 dias</caption><thead><tr><th scope="col">Data</th><th scope="col">Visitas</th></tr></thead><tbody>{starts.map((date,index)=><tr key={date.toISOString()}><td>{date.toLocaleDateString('pt-BR',{timeZone:'UTC'})}</td><td>{days[index].count??0}</td></tr>)}</tbody></table></>}<p className={styles.note}>Uma sessão de até 30 minutos conta uma visita, mesmo com recarregamentos. Períodos em UTC. Contagem iniciada na publicação; atualize o painel para ver novas visitas.</p></section>;
}

