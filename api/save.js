import { sql, guard, TEXT_KEY } from './_lib.js';
export default async function(req,res){
  if(!guard(req,res)) return;
  const t=(req.body||{}).t||{}; const keys=Object.keys(t);
  if(keys.length>300) return res.status(400).json({error:'too many'});
  for(const k of keys){
    const v=String(t[k]); if(!TEXT_KEY.test(k)||v.length>3000) return res.status(400).json({error:'invalid '+k});
    if(k==='contact' && !/^(https:\/\/|mailto:|tel:)/i.test(v)) return res.status(400).json({error:'رابط التواصل غير صالح'});
  }
  for(const k of keys) await sql`insert into site_text(k,v) values(${k},${String(t[k])}) on conflict(k) do update set v=excluded.v, updated_at=now()`;
  res.json({ok:true,saved:keys.length});
}
