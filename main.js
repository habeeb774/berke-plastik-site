(()=>{const n=document.querySelector('.nav'),b=document.querySelector('.hamb');if(n&&b){
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));}
const setText=(el,v)=>{el.textContent='';v.split('\n').forEach((l,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(l))})};
const okUrl=v=>/^(https:\/\/|mailto:|tel:)/i.test(v);
fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(!d)return;const t=d.t||{};
 for(const[k,v]of Object.entries(t)){if(k==='title'){document.title=v;continue}if(k==='contact'||k==='wa')continue;document.querySelectorAll(`[data-k="${k}"]`).forEach(el=>setText(el,v))}
 if(t.contact&&okUrl(t.contact))document.querySelectorAll('[data-contact]').forEach(a=>{a.href=t.contact});
 if(t.wa){const num=t.wa.replace(/\D/g,'');if(num.length>=9)document.querySelectorAll('[data-wa]').forEach(a=>{a.href='https://wa.me/'+num;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('hide')})}
 for(const[k,ver]of Object.entries(d.img||{}))document.querySelectorAll(`[data-img="${k}"]`).forEach(el=>{const u=`url("/api/image?k=${k}&v=${ver}")`;
  const plain=k==='logo'||k.startsWith('std');el.style.backgroundImage=plain?u:`linear-gradient(#071b3a33,#071b3a66),${u}`;if(k.startsWith('std'))el.classList.add('has-img')});
}).catch(()=>{});})();
