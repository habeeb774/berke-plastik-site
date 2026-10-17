(()=>{const n=document.querySelector('.nav'),b=document.querySelector('.hamb');if(n&&b){
b.addEventListener('click',()=>{const o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
n.addEventListener('click',e=>{if(e.target.closest('.links a')){n.classList.remove('open');b.setAttribute('aria-expanded','false')}});}
const setText=(el,v)=>{el.textContent='';v.split('\n').forEach((l,i)=>{if(i)el.appendChild(document.createElement('br'));el.appendChild(document.createTextNode(l))})};

const safeHref=h=>{h=String(h||'').trim();return /^(#[\w-]*|https:\/\/|mailto:|tel:|\/)/i.test(h)?h:'#'};
const E=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const R={
 products:(box,L)=>L.forEach(p=>{const a=E('article','pcard'),im=E('div','pimg'+(p.media?'':' ppr'));if(p.media)im.style.backgroundImage=`url("/api/media?id=${p.media}")`;
  const b=E('div','pbody');b.append(E('h3',null,p.title||''),E('p',null,p.desc||''));const ul=E('ul','chips');String(p.chips||'').split(',').map(x=>x.trim()).filter(Boolean).forEach(c=>ul.appendChild(E('li',null,c)));b.appendChild(ul);a.append(im,b);box.appendChild(a)}),
 metrics:(box,L)=>L.forEach(m=>{const d=E('div','metric');d.append(E('b',null,m.value||''),E('small',null,m.label||''));box.appendChild(d)}),
 ticks:(box,L)=>L.forEach(t=>{const d=E('div');d.append(E('b',null,'✓'),document.createTextNode(' '+(t.text||'')));box.appendChild(d)}),
 badges:(box,L)=>L.forEach(t=>box.appendChild(E('span',null,t.text||''))),
 nav:(box,L)=>L.forEach(x=>{if(!x.label)return;const a=E('a',null,x.label);a.href=safeHref(x.href);if(/^https?:/.test(a.getAttribute('href'))){a.target='_blank';a.rel='noopener noreferrer'}box.appendChild(a)}),
 footcols:(box,L)=>L.forEach(c=>{const d=E('div');if(c.title)d.appendChild(E('h4',null,c.title));const p=E('p');String(c.lines||'').split('\n').map(x=>x.trim()).filter(Boolean).forEach((ln,i)=>{if(i)p.appendChild(E('br'));const[t,h]=ln.split('|').map(x=>x.trim());if(h){const a=E('a',null,t);a.href=safeHref(h);a.style.display='inline';if(/^https?:/.test(a.getAttribute('href'))){a.target='_blank';a.rel='noopener noreferrer'}p.appendChild(a)}else p.appendChild(document.createTextNode(t))});d.appendChild(p);box.appendChild(d)}),
 advantages:(box,L)=>L.forEach((x,i)=>{const d=E('div','acard');d.append(E('i',null,String(i+1).padStart(2,'0')),E('b',null,x.title||''),E('p',null,x.desc||''));box.appendChild(d)}),
 timeline:(box,L)=>L.forEach(x=>{const d=E('div','tstep');d.append(E('b',null,x.year||''),E('h3',null,x.title||''),E('p',null,x.desc||''));box.appendChild(d)}),
 projects:(box,L)=>L.forEach(x=>{const a=E('article','pr'),im=E('div','pi');if(x.media)im.style.backgroundImage=`url("/api/media?id=${x.media}")`;const b=E('div','pb');b.append(E('small',null,x.city||''),E('h3',null,x.title||''),E('p',null,x.desc||''));a.append(im,b);box.appendChild(a)}),
 catalogs:(box,L)=>L.forEach(c=>{const a=E('a','ccard');a.href=c.media?`/api/media?id=${c.media}&dl=1`:(c.url||'#');if(!c.media&&/^https?:/.test(c.url||'')){a.target='_blank';a.rel='noopener noreferrer'}
  a.append(E('b',null,c.title||''),E('small',null,c.note||''),E('span',null,'تحميل ↓'));box.appendChild(a)})};
const okUrl=v=>/^(https:\/\/|mailto:|tel:)/i.test(v);
fetch('/api/content').then(r=>r.ok?r.json():null).then(d=>{if(!d)return;const t=d.t||{};
 document.querySelectorAll('[data-hide-empty]').forEach(s=>{const L=(d.lists||{})[s.dataset.hideEmpty];s.classList.toggle('hide',!(Array.isArray(L)&&L.length))});
 for(const[k,L]of Object.entries(d.lists||{})){const box=document.querySelector(`[data-list="${k}"]`);if(box&&R[k]&&Array.isArray(L)){box.textContent='';R[k](box,L)}}
 for(const[k,v]of Object.entries(t))if(k.startsWith('color_')&&/^#[0-9a-fA-F]{6}$/.test(v))document.documentElement.style.setProperty('--'+k.slice(6),v);
 for(const[k,v]of Object.entries(t)){if(k==='title'){document.title=v;continue}if(k==='contact'||k==='wa'||k.startsWith('color_'))continue;document.querySelectorAll(`[data-k="${k}"]`).forEach(el=>setText(el,v))}
 if(t.contact&&okUrl(t.contact))document.querySelectorAll('[data-contact]').forEach(a=>{a.href=t.contact});
 window.__wa=t.wa;if(t.wa){const num=t.wa.replace(/\D/g,'');if(num.length>=9)document.querySelectorAll('[data-wa]').forEach(a=>{a.href='https://wa.me/'+num;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('hide')})}
 for(const[k,ver]of Object.entries(d.img||{}))document.querySelectorAll(`[data-img="${k}"]`).forEach(el=>{const u=`url("/api/image?k=${k}&v=${ver}")`;
  el.style.backgroundImage=k==='logo'?u:`linear-gradient(#071b3a33,#071b3a66),${u}`});
}).catch(()=>{});
fetch('/api/certs').then(r=>r.ok?r.json():null).then(list=>{const box=document.querySelector('.stds');if(!box||!Array.isArray(list)||!list.length)return;box.textContent='';
 list.forEach(c=>{const i=document.createElement('img');i.src=`/api/certs?id=${c.id}&v=${c.v}`;i.alt=c.name||'شهادة';if(c.name)i.title=c.name;i.loading='lazy';i.width=120;i.height=70;box.appendChild(i)})}).catch(()=>{});})();

(()=>{const f=document.getElementById('qform');if(!f)return;const msg=document.getElementById('qmsg');
f.addEventListener('submit',async e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));msg.className='qmsg full';msg.textContent='';
 if(!d.name||d.name.trim().length<2){msg.textContent='اكتب الاسم';msg.classList.add('err');return}
 const ph=String(d.phone||'').replace(/[^\d+]/g,'');if(!/^\+?\d{9,15}$/.test(ph)){msg.textContent='رقم الجوال غير صحيح';msg.classList.add('err');return}
 const btn=f.querySelector('button');btn.disabled=true;
 try{const r=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(j.error||'تعذر الإرسال');f.reset();msg.textContent='تم استلام طلبك، سنتواصل معك قريباً.';msg.classList.add('ok');
  const wa=String(window.__wa||'').replace(/\D/g,'');if(wa.length>=9){const a=document.createElement('a');a.href='https://wa.me/'+wa+'?text='+encodeURIComponent(`طلب عرض سعر\nالاسم: ${d.name}\nالجوال: ${ph}\nالمدينة: ${d.city||''}\nالنوع: ${d.ptype||''}\n${d.details||''}`);a.target='_blank';a.rel='noopener noreferrer';a.textContent=' — أرسله أيضاً على واتساب';msg.appendChild(a)}}
 catch(err){msg.textContent=err.message;msg.classList.add('err')}finally{btn.disabled=false}})})();
