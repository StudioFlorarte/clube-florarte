const CHECKOUT_URL = document.body.dataset.checkoutUrl;
document.querySelectorAll('.checkout').forEach(link => { link.href = CHECKOUT_URL; });
const drops = ['elegant', 'vintage', 'y2k', 'rose'];
const labels = {elegant:'Elegant',vintage:'Vintage',y2k:'Y2K',rose:'Rose'};
const imagePath = (drop, index) => `/landingpage-assets/assets/${drop}-${index}.${drop === 'rose' && index === 4 ? 'png' : 'webp'}`;
function templateImage(drop, index, decorative = false) {
  const img = document.createElement('img');
  img.src = imagePath(drop, index);
  img.alt = decorative ? '' : `Template do Drop ${labels[drop]}`;
  img.loading = 'lazy';
  if (decorative) img.setAttribute('aria-hidden', 'true');
  return img;
}
let currentDrop = 0;
function showDrop(index) {
  currentDrop = index;
  const drop = drops[index];
  document.querySelector('#drop-name').textContent = `Drop ${labels[drop]}`;
  document.querySelector('#feed').replaceChildren(...Array.from({length:9},(_,i)=>templateImage(drop,i+1)));
  const rows = [0,1].map(row=>{const track=document.createElement('div');track.className='backdrop-row';for(let repeat=0;repeat<2;repeat++)for(let i=1;i<=5;i++)track.append(templateImage(drop,i+row*5,true));return track;});
  document.querySelector('.backdrop').replaceChildren(...rows);
  document.querySelectorAll('[data-drop]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.drop===drop)));
}
if (document.querySelector('.showcase')) showDrop(0);
let timer;
function startRotation(){clearInterval(timer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)timer=setInterval(()=>showDrop((currentDrop+1)%4),5500);}
document.querySelectorAll('[data-drop]').forEach((button,index)=>button.addEventListener('click',()=>{showDrop(index);clearInterval(timer);}));
const showcase = document.querySelector('.showcase');
showcase?.addEventListener('mouseenter',()=>clearInterval(timer));
showcase?.addEventListener('mouseleave',startRotation);
showcase?.addEventListener('focusin',()=>clearInterval(timer));
document.addEventListener('visibilitychange',()=>document.hidden?clearInterval(timer):startRotation());
if (showcase) startRotation();
['gallery-one','gallery-two'].forEach((id,row)=>{
  const images=[];
  const mixed=Array.from({length:20},(_,i)=>({drop:drops[(i*3+row)%4],index:1+((Math.floor(i/4)+row*5)%10)}));
  for(let repeat=0;repeat<2;repeat++)for(const item of mixed)images.push(templateImage(item.drop,item.index,repeat===1));
  document.getElementById(id).replaceChildren(...images);
});
document.querySelector('.gallery-window').addEventListener('pointerdown',event=>{if(event.pointerType==='touch')event.currentTarget.classList.toggle('paused');});

// Uma visita por sessão de 30 minutos, sem armazenar IP ou dados pessoais.
(async()=>{try{const key='florarte-landing-visit';let visit;try{visit=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}if(!visit||Date.now()-visit.started>1800000){visit={id:crypto.randomUUID(),started:Date.now()};sessionStorage.setItem(key,JSON.stringify(visit));}const token=document.querySelector('meta[name="visit-token"]')?.content;if(!token)return;await fetch('/api/landingpage/visit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitId:visit.id,token}),keepalive:true});}catch{}})();

