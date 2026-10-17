import crypto from 'node:crypto';
import { makeToken, isAuthed } from './_lib.js';
export default async function(req,res){
  if(req.method==='GET') return res.json({ok:isAuthed(req)});
  if(req.method==='DELETE'){res.setHeader('Set-Cookie','s=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return res.json({ok:true})}
  if(req.method!=='POST') return res.status(405).end();
  const clean=s=>String(s||'').replace(/[\s\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g,'');
  const p = clean((req.body||{}).password);
  const a = crypto.createHash('sha256').update(p).digest(), b = crypto.createHash('sha256').update(clean(process.env.ADMIN_PASSWORD)||crypto.randomUUID()).digest();
  if(!crypto.timingSafeEqual(a,b)){ await new Promise(r=>setTimeout(r,1500)); return res.status(401).json({error:'كلمة المرور غير صحيحة'}); }
  res.setHeader('Set-Cookie',`s=${makeToken()}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  res.json({ok:true});
}
