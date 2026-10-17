import crypto from 'node:crypto';
import { makeToken, isAuthed } from './_lib.js';
export default async function(req,res){
  if(req.method==='GET') return res.json({ok:isAuthed(req)});
  if(req.method==='DELETE'){res.setHeader('Set-Cookie','s=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0');return res.json({ok:true})}
  if(req.method!=='POST') return res.status(405).end();
  const p = String((req.body||{}).password||'');
  const a = crypto.createHash('sha256').update(p).digest(), b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD||crypto.randomUUID()).digest();
  if(!crypto.timingSafeEqual(a,b)){ await new Promise(r=>setTimeout(r,1500)); return res.status(401).json({error:'كلمة المرور غير صحيحة'}); }
  res.setHeader('Set-Cookie',`s=${makeToken()}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  res.json({ok:true});
}
