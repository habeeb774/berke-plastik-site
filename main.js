(()=>{const n=document.querySelector('.nav'),b=document.querySelector('.hamb');if(n&&b){
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));}
const setText=(el,v)=>{el.textContent='';v.split('\n').forEach((l,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(l))})};

const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const R={
 products:(box,L)=>L.forEach(p=>{const a=E('article','pcard'),im=E('div','pimg'+(p.media?'':' ppr'));if(p.media)im.style.backgroundImage=`url("/api/media?id=${p.media}")`;
  const b=E('div','pbody');b.append(E('h3',null,p.title||''),E('p',null,p.desc||''));const ul=E('ul','chips');String(p.chips||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(c=>ul.appendChild(E('li',null,c)));b.appendChild(ul);a.append(im,b);box.appendChild(a)}),
 metrics:(box,L)=>L.forEach(m=>{const d=E('div','metric');d.append(E('b',null,m.value||''),E('small',null,m.label||''));box.appendChild(d)}),
 ticks:(box,L)=>L.forEach(t=>{const d=E('div');d.append(E('b',null,'✓'),document.createTextNode(' '+(t.text||'')));box.appendChild(d)}),
 badges:(box,L)=>L.forEach(t=>box.appendChild(E('span',null,t.text||''))),
 catalogs:(box,L)=>L.forEach(c=>{const a=E('a','ccard');a.href=c.media?`/api/media?id=${c.media}&dl=1`:(c.url||'#');if(!c.media&&/^https?:/.test(c.url||'')){a.target='_blank';a.rel='noopener noreferrer'}
  a.append(E('b',null,c.title||''),E('small',null,c.note||''),E('span',null,'تحميل ↓'));box.appendChild(a)})};
const okUrl=v=>/^(https:\/\/|mailto:|tel:)/i.test(v);
fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(!d)return;const t=d.t||{};
 for(const[k,L]of Object.entries(d.lists||{})){const box=document.querySelector(`[data-list="${k}"]`);if(box&&R[k]&&Array.isArray(L)){box.textContent='';R[k](box,L)}}
 for(const[k,v]of Object.entries(t))if(k.startsWith('color_')&&/^#[0-9a-fA-F]{6}$/.test(v))document.documentElement.style.setProperty('--'+k.slice(6),v);
 for(const[k,v]of Object.entries(t)){if(k==='title'){document.title=v;continue}if(k==='contact'||k==='wa'||k.startsWith('color_'))continue;document.querySelectorAll(`[data-k="${k}"]`).forEach(el=>setText(el,v))}
 if(t.contact&&okUrl(t.contact))document.querySelectorAll('[data-contact]').forEach(a=>{a.href=t.contact});
 if(t.wa){const num=t.wa.replace(/\D/g,'');if(num.length>=9)document.querySelectorAll('[data-wa]').forEach(a=>{a.href='https://wa.me/'+num;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('hide')})}
 for(const[k,ver]of Object.entries(d.img||{}))document.querySelectorAll(`[data-img="${k}"]`).forEach(el=>{const u=`url("/api/image?k=${k}&v=${ver}")`;
  el.style.backgroundImage=k==='logo'?u:`linear-gradient(#071b3a33,#071b3a66),${u}`});
}).catch(()=>{});
fetch('/api/certs').then(r=>r.ok?r.json():null).then(list=>{const box=document.querySelector('.stds');if(!box||!Array.isArray(list)||!list.length)return;box.textContent='';
 list.forEach(c=>{const i=document.createElement('img');i.src=`/api/certs?id=${c.id}&v=${c.v}`;i.alt=c.name||'شهادة';if(c.name)i.title=c.name;i.loading='lazy';i.width=120;i.height=70;box.appendChild(i)})}).catch(()=>{});})();
