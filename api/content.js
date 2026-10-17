import { sql , safe} from './_lib.js';
export default safe(async function(req,res){
  const [t,i,l]=await Promise.all([sql`select k,v from site_text`,sql`select k, extract(epoch from updated_at)::bigint as v from site_image`,sql`select k,v from site_list`]);
  res.setHeader('Cache-Control','public, s-maxage=10, stale-while-revalidate=60');
  res.json({t:Object.fromEntries(t.map(r=>[r.k,r.v])),img:Object.fromEntries(i.map(r=>[r.k,String(r.v)])),lists:Object.fromEntries(l.map(r=>[r.k,r.v]))});
});
