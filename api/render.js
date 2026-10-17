import fs from 'node:fs'; import path from 'node:path';
import { sql, safe } from './_lib.js';
const TPL=fs.readFileSync(path.join(process.cwd(),'template.html'),'utf8');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=s=>esc(s).replace(/\n/g,'<br>');
const href=h=>{h=String(h||'').trim();return /^(#[\w-]*|https:\/\/|mailto:|tel:|\/)/i.test(h)?h:'#'};
const ext=h=>/^https?:/.test(h)?' target="_blank" rel="noopener noreferrer"':'';
const R={
 products:L=>L.map(p=>`<article class="pcard"><div class="pimg ppr"></div><div class="pbody"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p><ul class="chips">${String(p.chips||'').split(',').map(x=>x.trim()).filter(Boolean).map(c=>`<li>${esc(c)}</li>`).join('')}</ul></div></article>`).join(''),
 metrics:L=>L.map(m=>`<div class="metric"><b>${esc(m.value)}</b><small>${esc(m.label)}</small></div>`).join(''),
 ticks:L=>L.map(t=>`<div><b>✓</b> ${esc(t.text)}</div>`).join(''),
 badges:L=>L.map(t=>`<span>${esc(t.text)}</span>`).join(''),
 catalogs:L=>L.map(c=>{const h=c.media?`/api/media?id=${Number(c.media)}&dl=1`:href(c.url);return `<a class="ccard" href="${esc(h)}"${c.media?'':ext(h)}><b>${esc(c.title)}</b><small>${esc(c.note)}</small><span>تحميل ↓</span></a>`}).join(''),
 nav:L=>L.filter(x=>x.label).map(x=>{const h=href(x.href);return `<a href="${esc(h)}"${ext(h)}>${esc(x.label)}</a>`}).join(''),
 footcols:L=>L.map(c=>`<div>${c.title?`<h4>${esc(c.title)}</h4>`:''}<p>${String(c.lines||'').split('\n').map(x=>x.trim()).filter(Boolean).map(ln=>{const[t,h]=ln.split('|').map(x=>x.trim());return h?`<a href="${esc(href(h))}" class="inl"${ext(href(h))}>${esc(t)}</a>`:esc(t)}).join('<br>')}</p></div>`).join(''),
 advantages:L=>L.map((x,i)=>`<div class="acard"><i>${String(i+1).padStart(2,'0')}</i><b>${esc(x.title)}</b><p>${esc(x.desc)}</p></div>`).join(''),
 timeline:L=>L.map(x=>`<div class="tstep"><b>${esc(x.year)}</b><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div>`).join(''),
 projects:L=>L.map(x=>`<article class="pr"><div class="pi"></div><div class="pb"><small>${esc(x.city)}</small><h3>${esc(x.title)}</h3><p>${esc(x.desc)}</p></div></article>`).join('')};
export default safe(async function(req,res){
  let html=TPL;
  try{
    const [t,l]=await Promise.all([sql`select k,v from site_text`,sql`select k,v from site_list`]);
    const T=Object.fromEntries(t.map(r=>[r.k,r.v])), Ls=Object.fromEntries(l.map(r=>[r.k,r.v]));
    html=html.replace(/<span data-k="([\w]+)">([\s\S]*?)<\/span>/g,(m,k,inner)=>T[k]!=null?`<span data-k="${k}">${txt(T[k])}</span>`:m);
    {const FONTS=['Cairo','Tajawal','Almarai','Alexandria','Noto Kufi Arabic','Readex Pro','Changa','El Messiri','Rubik','Noto Sans Arabic','Baloo Bhaijaan 2'];if(T.font&&FONTS.includes(T.font)){const fam=T.font.replace(/ /g,'+');html=html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2\?family=IBM[^"]*">/,`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${fam}:wght@400;500;600;700&display=swap">`);}}
    if(T.title) html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${esc(T.title)}</title>`);
    if(T.contact&&/^(https:\/\/|mailto:|tel:)/i.test(T.contact)) html=html.replace(/(<a data-contact[^>]*?href=")[^"]*/,`$1${esc(T.contact)}`);
    for(const[k,f]of Object.entries(R)){const L=Ls[k];if(!Array.isArray(L))continue;
      html=html.replace(new RegExp(`<!--L:${k}-->[\\s\\S]*?<!--/L:${k}-->`),`<!--L:${k}-->${f(L)}<!--/L:${k}-->`);
      if(L.length) html=html.replace(new RegExp(`(<section class="[^"]*?) hide("[^>]*data-hide-empty="${k}")`),'$1$2');}
  }catch(e){console.error(e)}
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=15, stale-while-revalidate=120');
  res.send(html);
});
