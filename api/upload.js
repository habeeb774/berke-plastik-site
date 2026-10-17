import { sql, guard, IMG_KEYS } from './_lib.js';
const OK=['image/jpeg','image/png','image/webp'];
export default async function(req,res){
  if(!guard(req,res)) return;
  const {k,mime,data}=req.body||{};
  if(!IMG_KEYS.includes(k)||!OK.includes(mime)||typeof data!=='string') return res.status(400).json({error:'invalid'});
  const buf=Buffer.from(data,'base64'); if(buf.length>3e6) return res.status(413).json({error:'الصورة كبيرة'});
  const sig=buf.subarray(0,4).toString('hex'); if(!/^(ffd8ff|89504e47|52494646)/.test(sig)) return res.status(400).json({error:'ليست صورة'});
  await sql`insert into site_image(k,mime,data) values(${k},${mime},${buf}) on conflict(k) do update set mime=excluded.mime,data=excluded.data,updated_at=now()`;
  res.json({ok:true});
}
