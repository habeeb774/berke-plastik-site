const SCH_G={};let IMGV={};
const IM=[["logo","الشعار","أعلى وأسفل الموقع","berke-logo-horizontal.png"],["hero","صورة الواجهة","الصورة الكبيرة أعلى الصفحة",""],["proof","صورة «لماذا بيركة»","بجانب قائمة المميزات",""]];
const SECTIONS=[["header","القائمة العلوية","روابط القائمة واسم الوكيل"],["home","الواجهة الرئيسية","العنوان الكبير والأزرار"],["bar","شريط الوكيل","الشريط الأزرق أسفل الواجهة"],["products","المنتجات","بطاقات المنتجات والمقاسات"],["about","عن بيركة","التعريف بالشركة والأرقام"],["why","لماذا بيركة","المميزات والشهادات"],["advantages","مزايا للمشاريع","عنوان القسم"],["history","الخط الزمني","عنوان القسم"],["projects","المشاريع","عنوان القسم"],["quote","نموذج عرض السعر","نصوص النموذج"],["contact","تواصل معنا","بيانات الوكيل"],["catalogues","الكتالوجات","قسم تحميل الكتالوجات"],["footer","أسفل الموقع","بيانات الشركة والروابط"]];
const $=s=>document.querySelector(s),mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
let changed={},orig={},LISTS={},dirtyL=new Set();
const msg=t=>{const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(m.t);m.t=setTimeout(()=>m.style.display='none',3500)};
const post=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json','X-Admin':'1'},body:JSON.stringify(b),credentials:'same-origin'});
window.addEventListener('beforeunload',e=>{if(Object.keys(changed).length||dirtyL.size){e.preventDefault();e.returnValue=''}});
$('#login').addEventListener('submit',async e=>{e.preventDefault();$('#err').textContent='';const r=await post('/api/login',{password:$('#pw').value});
 if(r.ok)start();else $('#err').textContent=(await r.json().catch(()=>({}))).error||'خطأ'});
$('#pwbtn').addEventListener('click',()=>{show('general');const s=document.getElementById('pwsec');if(s){s.scrollIntoView({behavior:'smooth',block:'center'});s.classList.add('changed');setTimeout(()=>s.classList.remove('changed'),1500);s.querySelector('input')?.focus()}});
$('#out').addEventListener('click',async()=>{await fetch('/api/login',{method:'DELETE',headers:{'X-Admin':'1'}});location.reload()});
fetch('/api/login').then(r=>r.json()).then(d=>{if(d.ok)start()});
function labelFor(el){const p=el.parentElement;const R=[['.agent-strip strong,.agent-strip span','نص الشريط'],['.btn','زر'],['nav','رابط في القائمة'],['.agent','اسم الوكيل'],['h1','العنوان الرئيسي'],['h2','عنوان القسم'],['h3','عنوان'],['h4','عنوان عمود'],['.tag,.eyebrow','عنوان صغير'],['.quote','اقتباس'],['p','فقرة']];
 for(const[sel,l]of R)if(p.closest(sel))return l;return'نص'}
function updateUI(){const n=Object.keys(changed).length+dirtyL.size;$('#save').disabled=!n;$('#count').textContent=n?`${n} تعديل غير محفوظ`:'';
 document.querySelectorAll('.side button[data-p]').forEach(b=>b.querySelector('.dot').classList.toggle('show',!!document.querySelector(`#p-${b.dataset.p} .field.changed`)||dirtyL.has(b.dataset.p.replace(/^l-/,''))))}
function field(key,label,value,original,{multi=true,ltr=false}={}){orig[key]=original;const f=mk('div','field'),h=mk('div','fhead'),l=mk('label',null,label),rs=mk('button','reset','↺ الأصل');rs.type='button';rs.title='إرجاع النص الأصلي';
 const inp=multi?mk('textarea'):mk('input');if(!multi)inp.type='text';if(ltr)inp.dir='ltr';inp.value=value;if(multi)inp.rows=Math.min(5,Math.max(1,Math.ceil(value.length/80)+(value.split('\n').length-1)));
 const set=()=>{const v=inp.value;if(v!==(value)){changed[key]=v;f.classList.add('changed')}else{delete changed[key];f.classList.remove('changed')}updateUI()};
 inp.addEventListener('input',set);rs.addEventListener('click',()=>{inp.value=original;set()});h.append(l,rs);f.append(h,inp);
 if(value!==original){const o=mk('div','orig','الأصل: '+original.slice(0,120)+(original.length>120?'…':''));f.appendChild(o)}return f}
function panel(id,title,sub){const p=mk('section','panel');p.id='p-'+id;p.append(mk('h2',null,title),mk('p','sub',sub));$('#panels').appendChild(p);
 const b=mk('button');b.dataset.p=id;b.append(mk('span',null,title),mk('i','dot'));b.addEventListener('click',()=>show(id));$('#side').appendChild(b);return p}
function show(id){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('on',p.id==='p-'+id));document.querySelectorAll('.side button').forEach(b=>b.classList.toggle('on',b.dataset.p===id));window.scrollTo(0,0);try{localStorage.setItem('tab',id)}catch{}}
async function start(){
 $('#login').classList.add('hide');$('#ui').classList.remove('hide');$('#bar').classList.remove('hide');
 const [html,data]=await Promise.all([fetch('/template.html',{cache:'no-store'}).then(r=>r.text()),fetch('/api/content',{cache:'no-store'}).then(r=>r.json())]);
 const doc=new DOMParser().parseFromString(html,'text/html');$('#side').textContent='';$('#panels').textContent='';changed={};
 // images
 const pi=panel('images','🖼️ الصور','اضغط على أي صورة لاختيار صورة جديدة — تُرفع وتظهر في الموقع فوراً.');const box=mk('div','imgs');pi.appendChild(box);
 for(const[k,label,where,def]of IM){const l=mk('label','img'+(k==='logo'?' logo':''));const img=mk('img');if(data.img[k])img.src=`/api/image?k=${k}&v=${data.img[k]}`;else if(def)img.src='/'+def;else img.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="140"><rect width="100%" height="100%" fill="#e8eef5"/><text x="50%" y="55%" text-anchor="middle" font-family="Tahoma" font-size="15" fill="#75849a">لا توجد صورة بعد</text></svg>');img.alt=label;
  const d=mk('div');d.append(mk('b',null,label),mk('small',null,where));const st=mk('span',null,'📤 تغيير الصورة');d.appendChild(st);const inp=mk('input');inp.type='file';inp.accept='image/*';
  inp.addEventListener('change',async()=>{const f=inp.files[0];if(!f)return;st.textContent='⏳ جارٍ الرفع…';
   try{const png=k==='logo';const b64=await shrink(f,png);const r=await post('/api/upload',{k,mime:png?'image/png':'image/jpeg',data:b64});
    if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||r.status);img.src='data:image/'+(png?'png':'jpeg')+';base64,'+b64;st.textContent='✓ تم الرفع';msg('تم تحديث الصورة ✓')}
   catch(e){st.textContent='📤 تغيير الصورة';if(String(e.message)==='401'){alert('انتهت الجلسة');location.reload()}else alert('تعذر الرفع: '+e.message)}inp.value=''});
  l.append(img,d,inp);box.appendChild(l)}

 // certificates
 const pc=panel('certs','🏅 الشهادات','شعارات الشهادات في قسم «عن بيركة» — أضف، احذف، رتّب.');
 const cbar=mk('div');const addL=mk('label','pri addbtn','➕ إضافة شعار');const addI=mk('input');addI.type='file';addI.accept='image/*';addI.multiple=true;addI.className='hide';addL.appendChild(addI);cbar.appendChild(addL);pc.appendChild(cbar);
 const cgrid=mk('div','certgrid');pc.appendChild(cgrid);
 const DEF=[["saso","SASO — علامة الجودة السعودية"],["tse","TSE — معهد المعايير التركي"],["tse-iso-9000","TSE ISO-EN 9000"],["dvgw","DVGW — ألمانيا"],["skz","SKZ — ألمانيا"],["wras","WRAS — المملكة المتحدة"],["tzw","TZW — ألمانيا"],["gost-r","GOST-R — روسيا"],["ukraine","شهادة أوكرانيا"],["romania","شهادة رومانيا"]];
 async function loadCerts(){let list=await fetch('/api/certs',{cache:'no-store'}).then(r=>r.json());
  if(!list.length&&!loadCerts.seeded){loadCerts.seeded=1;msg('جارٍ استيراد الشعارات الحالية…');for(const[f,n]of DEF){try{const b=await fetch('/cert-'+f+'.png').then(r=>r.blob());const d=await new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result.split(',')[1]);fr.readAsDataURL(b)});await post('/api/certs',{action:'add',name:n,mime:'image/png',data:d})}catch{}}list=await fetch('/api/certs',{cache:'no-store'}).then(r=>r.json())}
  cgrid.textContent='';list.forEach((c,idx)=>{const card=mk('div','cert');const im=mk('img');im.src=`/api/certs?id=${c.id}&v=${c.v}`;im.alt=c.name;
   const nm=mk('input');nm.type='text';nm.value=c.name;nm.placeholder='اسم الشهادة';nm.addEventListener('change',async()=>{await post('/api/certs',{action:'rename',id:c.id,name:nm.value});msg('تم حفظ الاسم ✓')});
   const tools=mk('div','ctools');const up=mk('button',null,'▲');up.title='تقديم';const dn=mk('button',null,'▼');dn.title='تأخير';const del=mk('button','del','🗑 حذف');[up,dn,del].forEach(b=>b.type='button');
   up.disabled=idx===0;dn.disabled=idx===list.length-1;
   const move=async d=>{const ids=list.map(x=>x.id);const j=idx+d;[ids[idx],ids[j]]=[ids[j],ids[idx]];await post('/api/certs',{action:'order',ids});loadCerts()};
   up.addEventListener('click',()=>move(-1));dn.addEventListener('click',()=>move(1));
   del.addEventListener('click',async()=>{if(!confirm('حذف شعار «'+(c.name||'بدون اسم')+'»؟'))return;await post('/api/certs',{action:'delete',id:c.id});msg('تم الحذف');loadCerts()});
   tools.append(up,dn,del);card.append(im,nm,tools);cgrid.appendChild(card)});
  if(!list.length)cgrid.appendChild(mk('p','hint','لا توجد شعارات — أضف من الزر أعلاه.'))}
 addI.addEventListener('change',async()=>{for(const f of addI.files){try{const d=await shrink(f,true);const r=await post('/api/certs',{action:'add',name:f.name.replace(/\.[^.]+$/,''),mime:'image/png',data:d});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||r.status)}catch(e){alert('تعذر رفع '+f.name+': '+e.message)}}addI.value='';msg('تمت الإضافة ✓');loadCerts()});
 loadCerts();

 // lists
 const SCH=SCH_G;Object.assign(SCH,{
  nav:{title:'🔝 الشريط العلوي',sub:'روابط القائمة العلوية — أضف/احذف/رتّب. الرابط: #products أو #about أو #why أو #catalogues أو #contact، أو رابط https:// خارجي.',item:'رابط',fields:[['label','النص'],['href','الرابط']],
   seed:d=>[...d.querySelectorAll('[data-list=nav] a')].map(a=>({label:a.textContent.trim(),href:a.getAttribute('href')||'#'}))},
  footcols:{title:'🔚 الشريط السفلي',sub:'أعمدة أسفل الموقع. كل سطر في الأسطر يظهر سطراً؛ لجعله رابطاً اكتب: النص | الرابط',item:'عمود',fields:[['title','عنوان العمود'],['lines','الأسطر','area']],
   seed:d=>[...d.querySelectorAll('[data-list=footcols]>div')].map(c=>({title:c.querySelector('h4')?.textContent.trim()||'',lines:[...c.querySelectorAll('p span')].map(x=>x.textContent.trim()).join('\n')}))},
  advantages:{title:'⭐ مزايا للمشاريع',sub:'بطاقات المزايا للمقاولين.',item:'ميزة',fields:[['title','العنوان'],['desc','الوصف','area']],
   seed:d=>[...d.querySelectorAll('[data-list=advantages] .acard')].map(c=>({title:c.querySelector('b')?.textContent.trim()||'',desc:c.querySelector('p')?.textContent.trim()||''}))},
  timeline:{title:'🕰️ الخط الزمني',sub:'محطات تاريخ بيركة — القسم يظهر في الموقع عند إضافة أول محطة.',item:'محطة',fields:[['year','السنة'],['title','العنوان'],['desc','الوصف','area']],seed:()=>[]},
  projects:{title:'🏢 المشاريع',sub:'مشاريع نُفّذت بمنتجات بيركة — القسم يظهر عند إضافة أول مشروع.',item:'مشروع',fields:[['media','صورة المشروع','image'],['title','اسم المشروع'],['city','المدينة'],['desc','وصف قصير','area']],seed:()=>[]},
  products:{title:'📦 المنتجات',sub:'بطاقات المنتجات — أضف/احذف/رتّب، ولكل منتج صورته.',item:'منتج',fields:[['media','صورة المنتج','image'],['title','الاسم'],['desc','الوصف','area'],['chips','المواصفات (افصل بفاصلة ,)']],
   seed:d=>[...d.querySelectorAll('[data-list=products] .pcard')].map(c=>({media:null,title:c.querySelector('h3')?.textContent.trim()||'',desc:c.querySelector('p')?.textContent.trim()||'',chips:[...c.querySelectorAll('.chips li')].map(x=>x.textContent.trim()).join(', ')}))},
  metrics:{title:'🔢 الأرقام',sub:'المربعات في قسم «عن بيركة».',item:'رقم',fields:[['value','الرقم'],['label','الوصف']],
   seed:d=>[...d.querySelectorAll('[data-list=metrics] .metric')].map(m=>({value:m.querySelector('b')?.textContent.trim()||'',label:m.querySelector('small')?.textContent.trim()||''}))},
  ticks:{title:'✓ المميزات',sub:'قائمة المميزات في «لماذا بيركة».',item:'ميزة',fields:[['text','النص']],
   seed:d=>[...d.querySelectorAll('[data-list=ticks]>div')].map(t=>({text:t.textContent.replace('✓','').trim()}))},
  badges:{title:'🏷️ شارات المعايير',sub:'الشارات النصية في «لماذا بيركة».',item:'شارة',fields:[['text','النص']],
   seed:d=>[...d.querySelectorAll('[data-list=badges] span')].map(t=>({text:t.textContent.trim()}))},
  catalogs:{title:'📄 الكتالوجات',sub:'ارفع ملف PDF لكل كتالوج (حتى 25MB) أو ضع رابطاً.',item:'كتالوج',fields:[['title','العنوان'],['note','وصف قصير (مثل: PDF · 4 MB)'],['media','ملف PDF','file'],['url','أو رابط خارجي']],
   seed:d=>[...d.querySelectorAll('[data-list=catalogs] .ccard')].map(c=>({title:c.querySelector('b')?.textContent.trim()||'',note:c.querySelector('small')?.textContent.trim()||'',media:null,url:'/'+(c.getAttribute('href')||'')}))}});
 IMGV=data.img||{};
 for(const[k,S]of Object.entries(SCH)){LISTS[k]=Array.isArray(data.lists?.[k])?data.lists[k]:S.seed(doc);const p=panel('l-'+k,S.title,S.sub);drawList(k,p)}
 // quotes inbox
 const pq=panel('quotes','📥 طلبات عروض الأسعار','الطلبات المرسلة من نموذج الموقع.');const qbox=mk('div');pq.appendChild(qbox);
 const ST={new:'جديد',contacted:'تم التواصل',closed:'مغلق'};
 async function loadQ(){const r=await fetch('/api/quote',{headers:{'X-Admin':'1'},cache:'no-store'});if(!r.ok){qbox.textContent='تعذر التحميل';return}const L=await r.json();qbox.textContent='';
  const nb=L.filter(x=>x.status==='new').length;const sb=document.querySelector('.side button[data-p="quotes"] span');if(sb)sb.textContent='📥 طلبات العروض'+(nb?` (${nb})`:'');
  if(!L.length){qbox.appendChild(mk('p','hint','لا توجد طلبات بعد.'));return}
  L.forEach(x=>{const c=mk('div','field');const h=mk('div','fhead');h.appendChild(mk('label',null,`${x.name} — ${new Date(x.at).toLocaleString('ar-SA')}`));
   const sel=mk('select');Object.entries(ST).forEach(([k,v])=>{const o=mk('option',null,v);o.value=k;if(x.status===k)o.selected=true;sel.appendChild(o)});sel.onchange=async()=>{await post('/api/quote',{action:'status',id:x.id,status:sel.value});loadQ()};
   const del=mk('button','reset','🗑 حذف');del.type='button';del.onclick=async()=>{if(confirm('حذف الطلب؟')){await post('/api/quote',{action:'delete',id:x.id});loadQ()}};
   const tl=mk('div','ctools');tl.append(sel,del);h.appendChild(tl);c.appendChild(h);
   const ph=String(x.phone||'');const lk=mk('div','mrow');const t=mk('a',null,'📞 '+ph);t.href='tel:'+ph;const w=mk('a',null,'واتساب');let n=ph.replace(/\D/g,'');if(n.startsWith('05'))n='966'+n.slice(1);w.href='https://wa.me/'+n;w.target='_blank';w.rel='noopener';lk.append(t,w);c.appendChild(lk);
   c.appendChild(mk('div','orig',`المدينة: ${x.city||'—'} · النوع: ${x.ptype||'—'}`));if(x.details)c.appendChild(mk('p',null,x.details));if(x.status==='new')c.classList.add('changed');qbox.appendChild(c)})}
 loadQ();
 // general
 const pg=panel('general','⚙️ إعدادات عامة','عنوان الصفحة ورابط التواصل.');
 const ot=doc.title,oc=doc.querySelector('[data-contact]')?.getAttribute('href')||'';
 pg.appendChild(field('title','عنوان الصفحة (يظهر في تبويب المتصفح)',data.t.title??ot,ot,{multi:false}));
 const cf=field('contact','رابط زر «تواصل معنا»',data.t.contact??oc,oc,{multi:false,ltr:true});cf.appendChild(mk('div','orig','أمثلة: https://wa.me/9665XXXXXXXX  —  mailto:info@example.com  —  tel:+9665XXXXXXXX'));pg.appendChild(cf);const wf=field('wa','رقم واتساب (يظهر زر واتساب في الموقع عند تعبئته)',data.t.wa??'','',{multi:false,ltr:true});wf.appendChild(mk('div','orig','مثال: 9665XXXXXXXX — بدون + أو أصفار في البداية'));pg.appendChild(wf);
 const COLS=[['n','اللون الأساسي الداكن (الواجهة والتواصل)','#071b3a'],['b','اللون الأزرق (العناوين والأزرار)','#0b4386'],['c','لون التمييز (الأزرار والعلامات)','#35b8df'],['p','لون خلفية الصفحة','#f4f7fb'],['f','لون أسفل الموقع','#06152e'],['wa','لون زر واتساب','#1fa855']];
 const cf2=mk('div','field');cf2.appendChild(mk('label',null,'🎨 ألوان الموقع'));const cg=mk('div','colors');
 COLS.forEach(([k,lab,def])=>{const key='color_'+k,row=mk('div','crow'),inp=mk('input');inp.type='color';inp.value=data.t[key]||def;const tx=mk('span',null,lab);const rs=mk('button','reset','↺');rs.type='button';rs.title='اللون الأصلي';
  const set=()=>{changed[key]=inp.value;cf2.classList.add('changed');document.documentElement.style.setProperty('--prev-'+k,inp.value);updateUI()};inp.oninput=set;rs.onclick=()=>{inp.value=def;set()};row.append(inp,tx,rs);cg.appendChild(row)});
 cf2.append(cg,mk('div','orig','اختر اللون ثم اضغط «حفظ» — يظهر في الموقع خلال ثوانٍ.'));pg.appendChild(cf2);
 const FONTS=['IBM Plex Sans Arabic','Cairo','Tajawal','Almarai','Alexandria','Noto Kufi Arabic','Readex Pro','Changa','El Messiri','Rubik','Noto Sans Arabic','Baloo Bhaijaan 2'];const ff=mk('div','field');ff.appendChild(mk('label',null,'🔤 خط الموقع'));const fs=mk('select');FONTS.forEach(f=>{const op=mk('option',null,f);op.value=f;fs.appendChild(op)});fs.value=data.t.font||'IBM Plex Sans Arabic';
 const fp=mk('p','fprev','أنابيب ووصلات PP-R — الوكيل الحصري: السويد للسباكة 0123456789');const loadF=f=>{if(!document.querySelector(`link[data-f="${f}"]`)){const l=mk('link');l.rel='stylesheet';l.dataset.f=f;l.href='https://fonts.googleapis.com/css2?family='+f.replace(/ /g,'+')+':wght@400;700&display=swap';document.head.appendChild(l)}fp.style.fontFamily=`'${f}'`};loadF(fs.value);
 fs.onchange=()=>{loadF(fs.value);changed.font=fs.value;ff.classList.add('changed');updateUI()};ff.append(fs,fp,mk('div','orig','اختر الخط وشاهد المعاينة، ثم اضغط «حفظ».'));pg.appendChild(ff);
 const sec=mk('div','field');sec.id='pwsec';sec.appendChild(mk('label',null,'🔒 تغيير كلمة مرور الإدارة'));const p1=mk('input');p1.type='password';p1.placeholder='كلمة المرور الحالية';p1.autocomplete='current-password';const p2=mk('input');p2.type='password';p2.placeholder='الجديدة (10 أحرف+، حروف وأرقام)';p2.autocomplete='new-password';const p3=mk('input');p3.type='password';p3.placeholder='تأكيد الجديدة';p3.autocomplete='new-password';const pb=mk('button','pri','تغيير كلمة المرور');pb.type='button';
 pb.onclick=async()=>{if(p2.value!==p3.value)return alert('التأكيد غير مطابق');const r=await post('/api/login',{action:'change',current:p1.value,next:p2.value});const j=await r.json().catch(()=>({}));if(r.ok){p1.value=p2.value=p3.value='';msg('تم تغيير كلمة المرور ✓ وتم تسجيل خروج الأجهزة الأخرى')}else alert(j.error||'تعذر التغيير')};
 [p1,p2,p3].forEach(i=>{i.style.marginBottom='6px'});sec.append(p1,p2,p3,pb);pg.appendChild(sec);
 
 // texts by section
 const all=[...doc.querySelectorAll('[data-k]')].filter(el=>!el.closest('[data-list]'));
 for(const[id,title,sub]of SECTIONS){const els=all.filter(el=>{const s=el.closest('header,footer,.agent-strip,section[id],main[id]');if(!s)return false;
   if(id==='header')return s.tagName==='HEADER';if(id==='footer')return s.tagName==='FOOTER';if(id==='bar')return s.classList.contains('agent-strip');return s.id===id&&!s.classList.contains('agent-strip')});
  if(!els.length)continue;const host={header:'p-l-nav',footer:'p-l-footcols',products:'p-l-products',about:'p-l-metrics',why:'p-l-ticks',catalogues:'p-l-catalogs',advantages:'p-l-advantages',history:'p-l-timeline',projects:'p-l-projects'}[id];let p=host&&document.getElementById(host);if(p){p.insertBefore(mk('h3','subh','العناوين والنصوص'),p.querySelector('.litem,.addrow'))}else p=panel(id,title,sub);const anchor=host?p.querySelector('.litem,.addrow'):null;
  els.forEach(el=>{const k=el.dataset.k,o=el.textContent.trim();const fe=field(k,labelFor(el),data.t[k]??o,o);anchor?p.insertBefore(fe,anchor):p.appendChild(fe)});if(anchor)p.insertBefore(mk('h3','subh','الروابط / الأعمدة'),anchor)}
 organizeSide();let t='quotes';try{t=localStorage.getItem('tab')||t}catch{}show(document.getElementById('p-'+t)?t:'quotes');updateUI();
}
$('#save').addEventListener('click',async()=>{const b=$('#save');b.disabled=true;b.textContent='⏳ جارٍ الحفظ…';const lists={};dirtyL.forEach(k=>lists[k]=LISTS[k]);const r=await post('/api/save',{t:changed,lists});b.textContent='💾 حفظ';
 if(r.ok){changed={};dirtyL.clear();document.querySelectorAll('.field.changed').forEach(e=>e.classList.remove('changed'));updateUI();msg('تم الحفظ ✓ يظهر في الموقع خلال ثوانٍ')}
 else if(r.status===401){alert('انتهت الجلسة، سجّل الدخول مجدداً (لن تضيع تعديلاتك إن لم تغلق الصفحة)');b.disabled=false}
 else{b.disabled=false;alert('تعذر الحفظ: '+((await r.json().catch(()=>({}))).error||r.status))}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(!$('#save').disabled)$('#save').click()}});

function markL(k){dirtyL.add(k);updateUI();const b=document.querySelector(`.side button[data-p="l-${k}"] .dot`);if(b)b.classList.add('show')}
function drawList(k,p){const S=SCH_G[k];p.querySelectorAll('.litem,.addrow').forEach(e=>e.remove());const L=LISTS[k];
 L.forEach((it,i)=>{const box=mk('div','field litem');const h=mk('div','fhead');h.appendChild(mk('label',null,`${S.item} ${i+1}`));
  const tl=mk('div','ctools');const up=mk('button',null,'▲'),dn=mk('button',null,'▼'),del=mk('button','del','🗑 حذف');[up,dn,del].forEach(b=>b.type='button');up.disabled=!i;dn.disabled=i===L.length-1;
  up.onclick=()=>{[L[i-1],L[i]]=[L[i],L[i-1]];markL(k);drawList(k,p)};dn.onclick=()=>{[L[i+1],L[i]]=[L[i],L[i+1]];markL(k);drawList(k,p)};
  del.onclick=()=>{if(confirm(`حذف ${S.item} ${i+1}؟`)){L.splice(i,1);markL(k);drawList(k,p)}};tl.append(up,dn,del);h.appendChild(tl);box.appendChild(h);
  S.fields.forEach(([f,lab,type])=>{box.appendChild(mk('div','orig',lab));
   if(type==='image'||type==='file'){const row=mk('div','mrow');let pv;if(type==='image'){pv=mk('img','mprev');const fk=k==='products'?['ppr','pex','rad','brass'][i]:null;if(it[f])pv.src=`/api/media?id=${it[f]}`;else if(fk&&IMGV[fk])pv.src=`/api/image?k=${fk}&v=${IMGV[fk]}`;row.appendChild(pv)}else{row.appendChild(mk('span','hint',it[f]?'✓ ملف مرفوع':'لا يوجد ملف'))}
    const lb=mk('label','pri addbtn',type==='image'?'📤 صورة':'📤 ملف PDF');const inp=mk('input');inp.type='file';inp.accept=type==='image'?'image/*':'application/pdf';inp.className='hide';lb.appendChild(inp);
    inp.onchange=async()=>{const fl=inp.files[0];if(!fl)return;lb.firstChild.textContent='⏳ جارٍ الرفع…';try{it[f]=await upMedia(fl,type==='image');markL(k);msg('تم الرفع — اضغط حفظ');drawList(k,p)}catch(e){alert('تعذر الرفع: '+e.message);lb.firstChild.textContent='📤 إعادة المحاولة'}};
    row.appendChild(lb);if(it[f]){const rm=mk('button','reset','إزالة');rm.type='button';rm.onclick=()=>{it[f]=null;markL(k);drawList(k,p)};row.appendChild(rm)}box.appendChild(row)}
   else{const inp=type==='area'?mk('textarea'):mk('input');if(type!=='area')inp.type='text';inp.value=it[f]||'';if(type==='area')inp.rows=f==='lines'?5:2;inp.oninput=()=>{it[f]=inp.value;box.classList.add('changed');markL(k)};box.appendChild(inp)}});
  p.appendChild(box)});
 const add=mk('button','pri addrow','➕ إضافة '+S.item);add.type='button';add.onclick=()=>{const o={};S.fields.forEach(([f])=>o[f]=null);L.push(o);markL(k);drawList(k,p)};p.appendChild(add)}
async function upMedia(file,isImg){
 if(isImg){const d=await shrink(file,false);const r=await post('/api/media',{action:'new',name:file.name,mime:'image/jpeg',data:d});const j=await r.json();if(!r.ok)throw new Error(j.error||r.status);return j.id}
 if(file.type!=='application/pdf')throw new Error('يجب أن يكون PDF');if(file.size>25e6)throw new Error('أكبر من 25MB');
 const buf=new Uint8Array(await file.arrayBuffer()),CH=2*1024*1024;const b64=u=>{let s='';for(let i=0;i<u.length;i+=32768)s+=String.fromCharCode.apply(null,u.subarray(i,i+32768));return btoa(s)};
 let r=await post('/api/media',{action:'new',name:file.name,mime:'application/pdf',data:b64(buf.subarray(0,CH))});let j=await r.json();if(!r.ok)throw new Error(j.error||r.status);const id=j.id;
 for(let o=CH;o<buf.length;o+=CH){msg(`رفع ${Math.round(o/buf.length*100)}%`);r=await post('/api/media',{action:'append',id,data:b64(buf.subarray(o,o+CH))});if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||r.status)}
 return id}

function organizeSide(){const side=$('#side');const btn=id=>side.querySelector(`button[data-p="${id}"]`);
 const G=[['عام',[['quotes','📥 طلبات العروض'],['general','⚙️ الإعدادات والألوان']]],
  ['محتوى الصفحة',[['home','الواجهة'],['bar','شريط الوكيل'],['l-products','المنتجات'],['l-advantages','مزايا المشاريع'],['l-metrics','عن بيركة'],['l-timeline','الخط الزمني'],['l-ticks','لماذا بيركة'],['l-badges','شارات المعايير'],['l-projects','المشاريع'],['l-catalogs','الكتالوجات'],['quote','نموذج عرض السعر'],['contact','تواصل معنا']]],
  ['القوائم',[['l-nav','الشريط العلوي'],['l-footcols','الشريط السفلي']]],
  ['الصور والشعارات',[['images','الصور'],['certs','شعارات الشهادات']]]];
 const rest=[...side.querySelectorAll('button[data-p]')];side.textContent='';const used=new Set();
 G.forEach(([g,items])=>{const h=mk('div','sgroup',g);let any=false;items.forEach(([id,l])=>{const b=btn.call(null,id)||rest.find(x=>x.dataset.p===id);if(!b)return;if(!any){side.appendChild(h);any=true}b.querySelector('span').textContent=b.dataset.p==='quotes'?b.querySelector('span').textContent:l;side.appendChild(b);used.add(id)})});
 const left=rest.filter(b=>!used.has(b.dataset.p));if(left.length){side.appendChild(mk('div','sgroup','أخرى'));left.forEach(b=>side.appendChild(b))}
 document.querySelectorAll('.panel').forEach(p=>{const id=p.id.slice(2);const b=side.querySelector(`button[data-p="${id}"] span`);if(b&&id!=='quotes'){const h=p.querySelector('h2');if(h)h.textContent=b.textContent}})}
function shrink(file,png){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,(png?800:1800)/i.width),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);
 c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL(png?'image/png':'image/jpeg',.85).split(',')[1])};i.onerror=()=>no(new Error('الصيغة غير مدعومة — استخدم JPG أو PNG أو WebP'));const fr=new FileReader();fr.onload=()=>{i.src=fr.result};fr.onerror=()=>no(new Error('تعذر قراءة الملف'));fr.readAsDataURL(file)})}
