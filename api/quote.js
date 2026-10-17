import { sql, ip, isAuthed, sameOrigin, audit, safe } from './_lib.js';
const S=(v,n)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
export default safe(async function(req,res){
  res.setHeader('Cache-Control','no-store');
  const admin=req.headers['x-admin']==='1';
  if(req.method==='GET'){
    if(!admin||!(await isAuthed(req))) return res.status(401).json({error:'auth'});
    const r=await sql`select id,at,name,phone,city,ptype,details,status from quote_req order by id desc limit 300`; return res.json(r);
  }
  if(req.method!=='POST') return res.status(405).end();
  const o=req.headers.origin; if(!o||o!=='https://'+req.headers.host) return res.status(403).json({error:'origin'});
  const b=req.body||{};
  if(admin){
    if(!sameOrigin(req)||!(await isAuthed(req))) return res.status(401).json({error:'auth'});
    if(b.action==='status'&&['new','contacted','closed'].includes(b.status)){await sql`update quote_req set status=${b.status} where id=${Number(b.id)}`;return res.json({ok:true})}
    if(b.action==='delete'){await sql`delete from quote_req where id=${Number(b.id)}`;await audit(req,'quote_delete',String(b.id));return res.json({ok:true})}
    return res.status(400).json({error:'invalid'});
  }
  if(b.website) return res.json({ok:true}); // honeypot
  const name=S(b.name,80), phone=S(b.phone,20).replace(/[^\d+]/g,''), city=S(b.city,60), ptype=S(b.ptype,60), details=S(b.details,1500);
  if(name.length<2) return res.status(400).json({error:'اكتب الاسم'});
  if(!/^\+?\d{9,15}$/.test(phone)) return res.status(400).json({error:'رقم الجوال غير صحيح'});
  const who=ip(req);
  const c=await sql`select count(*)::int n from quote_req where ip=${who} and at>now()-interval '1 hour'`;
  if(c[0].n>=5) return res.status(429).json({error:'أرسلت طلبات كثيرة، حاول لاحقاً'});
  await sql`insert into quote_req(ip,name,phone,city,ptype,details) values(${who},${name},${phone},${city},${ptype},${details})`;
  res.json({ok:true});
});
