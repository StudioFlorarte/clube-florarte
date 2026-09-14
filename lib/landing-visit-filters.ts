export const visitPeriods={'24h':'Últimas 24h',yesterday:'Ontem','7d':'Últimos 7 dias','30d':'Últimos 30 dias',all:'Total'} as const;
export type VisitPeriod=keyof typeof visitPeriods;
export function visitRange(period:VisitPeriod,now=new Date()){
 const until=now.toISOString();if(period==='all')return {since:null,until};
 if(period==='yesterday'){const local=new Date(now.getTime()-10800000);const today=Date.UTC(local.getUTCFullYear(),local.getUTCMonth(),local.getUTCDate(),3);return {since:new Date(today-86400000).toISOString(),until:new Date(today).toISOString()}}
 return {since:new Date(now.getTime()-(period==='24h'?1:period==='7d'?7:30)*86400000).toISOString(),until};
}
export function countryLabel(code:string|null){
 if(!code||!/^[A-Z]{2}$/.test(code))return {name:'País não identificado',flag:'🌐'};
 const name=new Intl.DisplayNames(['pt-BR'],{type:'region'}).of(code);
 if(!name||name===code)return {name:'País não identificado',flag:'🌐'};
 return {name,flag:String.fromCodePoint(...[...code].map(c=>127397+c.charCodeAt(0)))};
}

