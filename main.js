(()=>{const n=document.querySelector('.nav'),b=document.querySelector('.hamb');if(n&&b){
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));}
const setText=(el,v)=>{el.textContent='';v.split('\n').forEach((l,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(l))})};
fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(!d)return;
 for(const[k,v]of Object.entries(d.t||{})){if(k==='title'){document.title=v;continue}
  if(k==='contact'){const a=document.querySelector('[data-contact]');if(a&&/^(https:\/\/|mailto:|tel:)/i.test(v)){a.href=v;if(v.startsWith('http')){a.target='_blank';a.rel='noopener noreferrer'}}continue}
  document.querySelectorAll(`[data-k="${k}"]`).forEach(el=>setText(el,v))}
 for(const[k,ver]of Object.entries(d.img||{}))document.querySelectorAll(`[data-img="${k}"]`).forEach(el=>{
  const u=`url("/api/image?k=${k}&v=${ver}")`,cur=getComputedStyle(el).backgroundImage;
  el.style.backgroundImage=/url\(/.test(cur)?cur.replace(/url\([^)]*\)/,u):u});
}).catch(()=>{});})();
