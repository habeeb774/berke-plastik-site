import { sql, IMG_KEYS , safe} from './_lib.js';
export default safe(async function(req,res){
  const k=String(req.query.k||''); if(!IMG_KEYS.includes(k)) return res.status(404).end();
  const r = await sql`select mime,data from site_image where k=${k}`; if(!r.length) return res.status(404).end();
  res.setHeader('Content-Type', r[0].mime); res.setHeader('Cache-Control','public, max-age=31536000, immutable');
  res.send(Buffer.from(r[0].data));
});
