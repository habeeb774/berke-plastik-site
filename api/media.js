import { sql, guard } from './_lib.js';
const OK=['image/jpeg','image/png','image/webp','application/pdf'];
const MAX=25e6;
export default async function(req,res){
  if(req.method==='GET'){
    const id=Number(req.query.id);if(!id)return res.status(404).end();
    const r=await sql`select name,mime,data from site_media where id=${id}`;if(!r.length)return res.status(404).end();
    res.setHeader('Content-Type',r[0].mime);res.setHeader('Cache-Control','public, max-age=31536000, immutable');
    if(req.query.dl){const n=(r[0].name||'file').replace(/[^\w.\- ]+/g,'_');res.setHeader('Content-Disposition',`attachment; filename="${n}"; filename*=UTF-8''${encodeURIComponent(r[0].name||'file')}`)}
    return res.send(Buffer.from(r[0].data));
  }
  if(!guard(req,res))return;
  const b=req.body||{};const buf=Buffer.from(String(b.data||''),'base64');
  if(b.action==='new'){
    if(!OK.includes(b.mime))return res.status(400).json({error:'نوع الملف غير مسموح'});
    const sig=buf.subarray(0,4).toString('hex');
    if(!/^(ffd8ff|89504e47|52494646|25504446)/.test(sig))return res.status(400).json({error:'ملف غير صالح'});
    const r=await sql`insert into site_media(name,mime,data) values(${String(b.name||'').slice(0,150)},${b.mime},${buf}) returning id`;
    return res.json({ok:true,id:r[0].id});
  }
  if(b.action==='append'){
    const id=Number(b.id);const s=await sql`select length(data)::int n from site_media where id=${id}`;
    if(!s.length)return res.status(404).json({error:'غير موجود'});if(s[0].n+buf.length>MAX)return res.status(413).json({error:'الملف أكبر من 25MB'});
    await sql`update site_media set data=data||${buf} where id=${id}`;return res.json({ok:true});
  }
  res.status(400).json({error:'invalid'});
}
