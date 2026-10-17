import { sql, guard , safe, audit} from './_lib.js';
const OK=['image/jpeg','image/png','image/webp'];
export default safe(async function(req,res){
  if(req.method==='GET'){
    const id=Number(req.query.id);
    if(id){const r=await sql`select mime,data from site_cert where id=${id}`;if(!r.length)return res.status(404).end();
      res.setHeader('Content-Type',r[0].mime);res.setHeader('Cache-Control','public, max-age=31536000, immutable');return res.send(Buffer.from(r[0].data));}
    const r=await sql`select id,name,extract(epoch from updated_at)::bigint as v from site_cert order by sort,id`;
    res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=60');return res.json(r.map(x=>({id:x.id,name:x.name,v:String(x.v)})));
  }
  if(!(await guard(req,res))) return;
  const b=req.body||{};
  if(b.action==='add'){
    const name=String(b.name||'').slice(0,120);
    if(!OK.includes(b.mime)||typeof b.data!=='string')return res.status(400).json({error:'invalid'});
    const buf=Buffer.from(b.data,'base64');if(buf.length>1.5e6)return res.status(413).json({error:'الصورة كبيرة'});
    if(!/^(ffd8ff|89504e47|52494646)/.test(buf.subarray(0,4).toString('hex')))return res.status(400).json({error:'ليست صورة'});
    const c=await sql`select count(*)::int n, coalesce(max(sort),0)::int m from site_cert`;if(c[0].n>=40)return res.status(400).json({error:'الحد الأقصى 40 شعاراً'});
    const r=await sql`insert into site_cert(name,mime,data,sort) values(${name},${b.mime},${buf},${c[0].m+1}) returning id`;return res.json({ok:true,id:r[0].id});
  }
  if(b.action)await audit(req,'cert_'+b.action,String(b.id||b.name||''));
  if(b.action==='delete'){await sql`delete from site_cert where id=${Number(b.id)}`;return res.json({ok:true});}
  if(b.action==='rename'){await sql`update site_cert set name=${String(b.name||'').slice(0,120)} where id=${Number(b.id)}`;return res.json({ok:true});}
  if(b.action==='order'&&Array.isArray(b.ids)){let i=1;for(const id of b.ids.slice(0,40))await sql`update site_cert set sort=${i++} where id=${Number(id)}`;return res.json({ok:true});}
  res.status(400).json({error:'invalid action'});
});
