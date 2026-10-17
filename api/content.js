import { sql } from './_lib.js';
export default async function(req,res){
  const t = await sql`select k,v from site_text`;
  const i = await sql`select k, extract(epoch from updated_at)::bigint as v from site_image`;
  res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=60');
  res.json({ t:Object.fromEntries(t.map(r=>[r.k,r.v])), img:Object.fromEntries(i.map(r=>[r.k,String(r.v)])) });
}
