const IM=[["logo","الشعار","berke-logo-horizontal.png"],["hero","صورة الواجهة","ppr-page-2.jpg"],["ppr","بطاقة PP-R","ppr-page-46.jpg"],["rad","بطاقة المشعات","radiator-page-6.jpg"],["pex","بطاقة PE-X والنحاسيات","ppr-page-45.jpg"],["proof","صورة «لماذا بيركة»","ppr-page-2.jpg"]];
const SEC={home:"الواجهة",about:"عن بيركة",solutions:"الحلول",applications:"لماذا بيركة",contact:"تواصل معنا",catalogues:"الكتالوجات"};
const $=s=>document.querySelector(s);let changed={};
const msg=t=>{const m=$('#msg');m.textContent=t;m.style.display='block';clearTimeout(m.t);m.t=setTimeout(()=>m.style.display='none',3500)};
const post=(u,b)=>fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),credentials:'same-origin'});
const onEdit=el=>{el.addEventListener('input',()=>{el.classList.add('changed');changed[el.dataset.key]=el.value;$('#save').disabled=false})};
window.addEventListener('beforeunload',e=>{if(Object.keys(changed).length){e.preventDefault();e.returnValue=''}});
$('#login').addEventListener('submit',async e=>{e.preventDefault();$('#err').textContent='';const r=await post('/api/login',{password:$('#pw').value});
 if(r.ok)start();else $('#err').textContent=(await r.json().catch(()=>({}))).error||'خطأ'});
$('#out').addEventListener('click',async()=>{await fetch('/api/login',{method:'DELETE'});location.reload()});
fetch('/api/login').then(r=>r.json()).then(d=>{if(d.ok)start()});
async function start(){
 $('#login').classList.add('hide');$('#ui').classList.remove('hide');$('#bar').classList.remove('hide');
 const [html,data]=await Promise.all([fetch('/index.html').then(r=>r.text()),fetch('/api/content',{cache:'no-store'}).then(r=>r.json())]);
 const doc=new DOMParser().parseFromString(html,'text/html');
 document.querySelectorAll('[data-key]').forEach(el=>{const k=el.dataset.key;el.value=data.t[k]??(k==='title'?doc.title:(doc.querySelector('[data-contact]')?.getAttribute('href')||''));onEdit(el)});
 const box=$('#imgs');box.textContent='';
 for(const[k,label,def]of IM){const l=document.createElement('label');l.className='img'+(k==='logo'?' logo':'');
  const img=document.createElement('img');img.src=data.img[k]?`/api/image?k=${k}&v=${data.img[k]}`:'/'+def;img.alt=label;
  const d=document.createElement('div');d.innerHTML='<b></b><br><span>تغيير الصورة</span>';d.querySelector('b').textContent=label;
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';
  inp.addEventListener('change',async()=>{const f=inp.files[0];if(!f)return;d.querySelector('span').textContent='جارٍ الرفع…';
   try{const png=k==='logo';const b64=await shrink(f,png);const r=await post('/api/upload',{k,mime:png?'image/png':'image/jpeg',data:b64});
    if(!r.ok)throw new Error((await r.json().catch(()=>({}))).error||r.status);img.src='data:image/'+(png?'png':'jpeg')+';base64,'+b64;d.querySelector('span').textContent='✓ تم الرفع';msg('تم تحديث الصورة في الموقع ✓')}
   catch(e){d.querySelector('span').textContent='تغيير الصورة';alert('تعذر الرفع: '+e.message)}});
  l.append(img,d,inp);box.appendChild(l)}
 const groups={};doc.querySelectorAll('[data-k]').forEach(el=>{const s=el.closest('section[id],main[id],footer,header,.bar');
  const g=!s?'أخرى':s.tagName==='FOOTER'?'أسفل الموقع':s.tagName==='HEADER'?'القائمة العلوية':s.classList.contains('bar')?'الشريط الأزرق':SEC[s.id]||s.id;(groups[g]=groups[g]||[]).push(el)});
 const T=$('#texts');T.textContent='';
 for(const g in groups){const c=document.createElement('div');c.className='card';const h=document.createElement('h2');h.textContent=g;c.appendChild(h);
  groups[g].forEach(el=>{const k=el.dataset.k,ta=document.createElement('textarea');ta.dataset.key=k;ta.value=data.t[k]??el.textContent.trim();ta.rows=ta.value.length>90?3:1;onEdit(ta);c.appendChild(ta)});T.appendChild(c)}
}
$('#save').addEventListener('click',async()=>{const r=await post('/api/save',{t:changed});
 if(r.ok){changed={};$('#save').disabled=true;document.querySelectorAll('.changed').forEach(e=>e.classList.remove('changed'));msg('تم الحفظ ✓ يظهر في الموقع خلال ثوانٍ')}
 else if(r.status===401){alert('انتهت الجلسة، سجّل الدخول مجدداً');location.reload()}else alert('تعذر الحفظ: '+((await r.json().catch(()=>({}))).error||r.status))});
function shrink(file,png){return new Promise((ok,no)=>{const i=new Image();i.onload=()=>{const k=Math.min(1,(png?800:1800)/i.width),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);
 c.getContext('2d').drawImage(i,0,0,c.width,c.height);ok(c.toDataURL(png?'image/png':'image/jpeg',.85).split(',')[1])};i.onerror=()=>no(new Error('ملف غير صالح'));i.src=URL.createObjectURL(file)})}
