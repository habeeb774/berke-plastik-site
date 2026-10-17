import { sql, safe } from './_lib.js';
const FONTS=['IBM Plex Sans Arabic','Cairo','Tajawal','Almarai','Alexandria','Noto Kufi Arabic','Readex Pro','Changa','El Messiri','Rubik','Noto Sans Arabic','Baloo Bhaijaan 2'];
export default safe(async function(req,res){
  let css='';
  try{
    const [t,i]=await Promise.all([sql`select k,v from site_text where k like 'color_%' or k='font'`,sql`select k, extract(epoch from updated_at)::bigint as v from site_image`]);
    const T=Object.fromEntries(t.map(r=>[r.k,r.v]));
    if(T.font&&FONTS.includes(T.font)&&T.font!=='IBM Plex Sans Arabic') css+=`@import url('https://fonts.googleapis.com/css2?family=${T.font.replace(/ /g,'+')}:wght@400;500;600;700&display=swap');\n`;
    const vars=Object.entries(T).filter(([k,v])=>k.startsWith('color_')&&/^#[0-9a-fA-F]{6}$/.test(v)).map(([k,v])=>`--${k.slice(6)}:${v}`);
    if(T.font&&FONTS.includes(T.font)) vars.push(`--font:'${T.font}'`);
    if(vars.length) css+=`:root{${vars.join(';')}}\n`;
    for(const r of i){const k=r.k;if(!/^[a-z]+\d?$/.test(k))continue;const u=`url("/api/image?k=${k}&v=${r.v}")`;
      css+= k==='logo'?`[data-img="logo"]{background-image:${u}}\n`:`[data-img="${k}"]{background-image:linear-gradient(#071b3a33,#071b3a66),${u}}\n`;}
  }catch(e){console.error(e)}
  res.setHeader('Content-Type','text/css; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=15, stale-while-revalidate=120');
  res.send(css);
});
