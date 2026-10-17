import { sql, guard, TEXT_KEY , safe, audit} from './_lib.js';
const LISTS=['products','metrics','ticks','badges','catalogs'];
export default safe(async function(req,res){
  if(!(await guard(req,res))) return;
  const t=(req.body||{}).t||{}, lists=(req.body||{}).lists||{};
  const keys=Object.keys(t);if(keys.length>300) return res.status(400).json({error:'too many'});
  for(const k of keys){const v=String(t[k]);if(!TEXT_KEY.test(k)||v.length>3000) return res.status(400).json({error:'invalid '+k});
    if(k==='contact'&&v&&!/^(https:\/\/|mailto:|tel:)/i.test(v)) return res.status(400).json({error:'رابط التواصل غير صالح'});}
  for(const [k,v] of Object.entries(lists)){if(!LISTS.includes(k)||!Array.isArray(v)||v.length>60||JSON.stringify(v).length>60000)return res.status(400).json({error:'invalid list '+k});}
  for(const k of keys) await sql`insert into site_text(k,v) values(${k},${String(t[k])}) on conflict(k) do update set v=excluded.v, updated_at=now()`;
  for(const [k,v] of Object.entries(lists)) await sql`insert into site_list(k,v) values(${k},${JSON.stringify(v)}::jsonb) on conflict(k) do update set v=excluded.v, updated_at=now()`;
  await audit(req,'save',Object.keys(t).length+' texts, lists: '+Object.keys(lists).join(','));res.json({ok:true});
});
