const IM=[["logo","الشعار","أعلى وأسفل الموقع","berke-logo-horizontal.png"],["hero","صورة الواجهة","الصورة الكبيرة أعلى الصفحة",""],["ppr","منتج PP-R","قسم المنتجات",""],["rad","منتج المشعات","قسم المنتجات",""],["pex","منتج PE-X","قسم المنتجات",""],["brass","منتج الوصلات النحاسية","قسم المنتجات",""],["proof","صورة «لماذا بيركة»","بجانب قائمة المميزات",""]];
const SECTIONS=[["header","القائمة العلوية","روابط القائمة واسم الوكيل"],["home","الواجهة الرئيسية","العنوان الكبير والأزرار"],["bar","شريط الوكيل","الشريط الأزرق أسفل الواجهة"],["products","المنتجات","بطاقات المنتجات والمقاسات"],["about","عن بيركة","التعريف بالشركة والأرقام"],["why","لماذا بيركة","المميزات والشهادات"],["contact","تواصل معنا","بيانات الوكيل"],["catalogues","الكتالوجات","قسم تحميل الكتالوجات"],["footer","أسفل الموقع","بيانات الشركة والروابط"]];
const $=s=>document.querySelector(s),mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
let changed={},orig={};
const msg=t=>{const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(m.t);m.t=setTimeout(()=>m.style.display='none',3500)};
const post=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),credentials:'same-origin'});
window.addEventListener('beforeunload',e=>{if(Object.keys(changed).length){e.preventDefault();e.returnValue=''}});
$('#login').addEventListener('submit',async e=>{e.preventDefault();$('#err').textContent='';const r=await post('/api/login',{password:$('#pw').value});
 if(r.ok)start();else $('#err').textContent=(await r.json().catch(()=>({}))).error||'خطأ'});
$('#out').addEventListener('click',async()=>{await fetch('/api/login',{method:'DELETE'});location.reload()});
fetch('/api/login').then(r=>r.json()).then(d=>{if(d.ok)start()});
function labelFor(el){const p=el.parentElement,c=p.closest('.metric,.ticks>div,.badge,.quote,.agent,.btn,.tag,.eyebrow,nav,h1,h2,h3,h4,.bar>div,.dl a,p,span.agent');
 if(!c)return'نص';if(c.matches('.btn,.dl a'))return'زر';if(c.matches('nav'))return'رابط في القائمة';if(c.matches('h1'))return'العنوان الرئيسي';if(c.matches('h2'))return'عنوان القسم';if(c.matches('h3'))return'عنوان البطاقة';if(c.matches('h4'))return'عنوان عمود';
 if(c.matches('.tag,.eyebrow'))return'عنوان صغير';if(c.matches('.metric'))return p.tagName==='B'?'رقم':'وصف الرقم';if(c.matches('.ticks>div'))return'ميزة';if(c.matches('.badge'))return'الشارة على الصورة';if(c.matches('.quote'))return'اقتباس';if(c.matches('.agent'))return'اسم الوكيل';if(c.matches('.chips li'))return'مواصفة';if(c.matches('.certs span'))return'شهادة';if(c.matches('.ccard'))return'بطاقة كتالوج';if(c.matches('.agent-strip strong,.agent-strip span'))return'نص الشريط';if(c.matches('p'))return'فقرة';return'نص'}
function updateUI(){const n=Object.keys(changed).length;$('#save').disabled=!n;$('#count').textContent=n?`${n} تعديل غير محفوظ`:'';
 document.querySelectorAll('.side button[data-p]').forEach(b=>b.querySelector('.dot').classList.toggle('show',!!document.querySelector(`#p-${b.dataset.p} .field.changed`)))}
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
 const [html,data]=await Promise.all([fetch('/index.html',{cache:'no-store'}).then(r=>r.text()),fetch('/api/content',{cache:'no-store'}).then(r=>r.json())]);
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
 // general
 const pg=panel('general','⚙️ إعدادات عامة','عنوان الصفحة ورابط التواصل.');
 const ot=doc.title,oc=doc.querySelector('[data-contact]')?.getAttribute('href')||'';
 pg.appendChild(field('title','عنوان الصفحة (يظهر في تبويب المتصفح)',data.t.title??ot,ot,{multi:false}));
 const cf=field('contact','رابط زر «تواصل معنا»',data.t.contact??oc,oc,{multi:false,ltr:true});cf.appendChild(mk('div','orig','أمثلة: https://wa.me/9665XXXXXXXX  —  mailto:info@example.com  —  tel:+9665XXXXXXXX'));pg.appendChild(cf);const wf=field('wa','رقم واتساب (يظهر زر واتساب في الموقع عند تعبئته)',data.t.wa??'','',{multi:false,ltr:true});wf.appendChild(mk('div','orig','مثال: 9665XXXXXXXX — بدون + أو أصفار في البداية'));pg.appendChild(wf);
 $('#side').appendChild(mk('hr'));
 // texts by section
 const all=[...doc.querySelectorAll('[data-k]')];
 for(const[id,title,sub]of SECTIONS){const els=all.filter(el=>{const s=el.closest('header,footer,.agent-strip,section[id],main[id]');if(!s)return false;
   if(id==='header')return s.tagName==='HEADER';if(id==='footer')return s.tagName==='FOOTER';if(id==='bar')return s.classList.contains('agent-strip');return s.id===id&&!s.classList.contains('agent-strip')});
  if(!els.length)continue;const p=panel(id,title,sub);
  els.forEach(el=>{const k=el.dataset.k,o=el.textContent.trim();p.appendChild(field(k,labelFor(el),data.t[k]??o,o))})}
 let t='images';try{t=localStorage.getItem('tab')||t}catch{}show(document.getElementById('p-'+t)?t:'images');updateUI();
}
$('#save').addEventListener('click',async()=>{const b=$('#save');b.disabled=true;b.textContent='⏳ جارٍ الحفظ…';const r=await post('/api/save',{t:changed});b.textContent='💾 حفظ';
 if(r.ok){changed={};document.querySelectorAll('.field.changed').forEach(e=>e.classList.remove('changed'));updateUI();msg('تم الحفظ ✓ يظهر في الموقع خلال ثوانٍ')}
 else if(r.status===401){alert('انتهت الجلسة، سجّل الدخول مجدداً (لن تضيع تعديلاتك إن لم تغلق الصفحة)');b.disabled=false}
 else{b.disabled=false;alert('تعذر الحفظ: '+((await r.json().catch(()=>({}))).error||r.status))}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();if(!$('#save').disabled)$('#save').click()}});
function shrink(file,png){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,(png?800:1800)/i.width),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);
 c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL(png?'image/png':'image/jpeg',.85).split(',')[1])};i.onerror=()=>no(new Error('الصيغة غير مدعومة — استخدم JPG أو PNG أو WebP'));const fr=new FileReader();fr.onload=()=>{i.src=fr.result};fr.onerror=()=>no(new Error('تعذر قراءة الملف'));fr.readAsDataURL(file)})}
